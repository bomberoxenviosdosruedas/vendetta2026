

'use server';

import prisma from "../prisma/prisma";
import type { FullPropiedad, UserWithProgress } from "../data";
import { MessageCategory } from "@prisma/client";
import { calculateStorageCapacity, calcularProduccionTotalPorSegundo } from "../formulas/room-formulas";
import { revalidatePath } from "next/cache";
import { calcularPuntosEntrenamientos, calcularPuntosHabitaciones, calcularPuntosTropas } from "../formulas/score-formulas";
import { getSessionUser } from "../auth";

interface UserSettings {
    name?: string;
    title?: string;
    avatarUrl?: string;
}

export async function updateUserSettings(settings: UserSettings) {
    const user = await getSessionUser();

    if (!user) {
        return { error: "Usuario no autenticado." };
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: settings.name,
                title: settings.title,
                avatarUrl: settings.avatarUrl,
            },
        });

        revalidatePath('/settings');
        revalidatePath('/(dashboard)', 'layout');

        return { success: "¡Perfil actualizado correctamente!" };
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        return { error: "Ocurrió un error al actualizar el perfil." };
    }
}

async function updateUserLastSeen(userId: string): Promise<void> {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { lastSeen: new Date() },
        });
    } catch (error) {
        console.error(`Error updating lastSeen for user ${userId}:`, error);
    }
}


async function actualizarRecursosPropiedad(propiedad: FullPropiedad): Promise<FullPropiedad> {
    const ahora = new Date();
    const ultimaActualizacion = new Date(propiedad.ultimaActualizacion);
    const segundosTranscurridos = Math.max(0, Math.floor((ahora.getTime() - ultimaActualizacion.getTime()) / 1000));

    if (segundosTranscurridos <= 0) {
        return propiedad;
    }
    
    const capacidad = calculateStorageCapacity(propiedad);

    const produccionPorSegundo = calcularProduccionTotalPorSegundo(propiedad);

    const armasGeneradas = produccionPorSegundo.armas * segundosTranscurridos;
    const municionGenerada = produccionPorSegundo.municion * segundosTranscurridos;
    const alcoholGenerado = produccionPorSegundo.alcohol * segundosTranscurridos;
    const dolaresGenerados = produccionPorSegundo.dolares * segundosTranscurridos;

    const nuevasArmas = Math.min(capacidad.armas, propiedad.armas + armasGeneradas);
    const nuevaMunicion = Math.min(capacidad.municion, propiedad.municion + municionGenerada);
    const nuevoAlcohol = Math.min(capacidad.alcohol, propiedad.alcohol + alcoholGenerado);
    const nuevosDolares = Math.min(capacidad.dolares, propiedad.dolares + dolaresGenerados);

    try {
        const propiedadActualizada = await prisma.propiedad.update({
            where: { id: propiedad.id },
            data: {
                armas: nuevasArmas,
                municion: nuevaMunicion,
                alcohol: nuevoAlcohol,
                dolares: nuevosDolares,
                ultimaActualizacion: ahora,
            },
            include: { 
                habitaciones: { include: { configuracion: { include: { requirements: true } } } },
                colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
                colaReclutamiento: { include: { tropaConfig: true } },
                TropaUsuario: { include: { configuracion: true } }
            }
        });
        return propiedadActualizada as FullPropiedad;
    } catch (error) {
        console.error(`Error actualizando recursos para propiedad ${propiedad.id}:`, error);
        return propiedad;
    }
}


export async function obtenerEstadoJuegoActualizado(user: UserWithProgress): Promise<UserWithProgress> {
    await updateUserLastSeen(user.id);

    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(propiedad => actualizarRecursosPropiedad(propiedad))
    );

    return {
        ...user,
        propiedades: propiedadesActualizadas,
        lastSeen: new Date(), // also update in the object to avoid re-fetching
    };
}

async function verificarYFinalizarConstruccionDePropiedad(propiedad: FullPropiedad): Promise<FullPropiedad> {
  const cola = [...propiedad.colaConstruccion].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (cola.length === 0) return propiedad;

  let seHizoUnCambio = false;

  const construccionesTerminadas = cola.filter(c => c.fechaFinalizacion && new Date() >= new Date(c.fechaFinalizacion));
  
  if (construccionesTerminadas.length > 0) {
    try {
        await prisma.$transaction(async (tx) => {
            for (const terminada of construccionesTerminadas) {
                await tx.habitacionUsuario.update({
                    where: {
                        propiedadId_configuracionHabitacionId: {
                            propiedadId: terminada.propiedadId,
                            configuracionHabitacionId: terminada.habitacionId,
                        },
                    },
                    data: {
                        nivel: terminada.nivelDestino,
                    },
                });
                await tx.colaConstruccion.delete({
                    where: { id: terminada.id },
                });

                const habitacionNombre = propiedad.habitaciones?.find(h => h.configuracionHabitacionId === terminada.habitacionId)?.configuracion?.nombre || terminada.habitacionId.replace(/_/g, ' ');
                await tx.message.create({
                    data: {
                        recipientId: propiedad.userId,
                        subject: `Construcción completada: ${habitacionNombre}`,
                        content: `La ampliación de ${habitacionNombre} al Nivel ${terminada.nivelDestino} en "${propiedad.nombre}" [${propiedad.ciudad}:${propiedad.barrio}:${propiedad.edificio}] ha finalizado con éxito.`,
                        category: MessageCategory.CONSTRUCCION,
                    }
                });
            }
        });
        seHizoUnCambio = true;
    } catch (error) {
        console.error(`Error finalizando construcciones:`, error);
    }
  }

  const propiedadPostFinalizacion = seHizoUnCambio 
    ? await prisma.propiedad.findUnique({ where: { id: propiedad.id }, include: { colaConstruccion: { orderBy: { createdAt: 'asc' } } } })
    : { ...propiedad, colaConstruccion: cola };
  
  if (!propiedadPostFinalizacion) return propiedad;

  const colaActual = propiedadPostFinalizacion.colaConstruccion;
  const construccionActiva = colaActual.find(c => c.fechaFinalizacion);
  
  if (!construccionActiva && colaActual.length > 0) {
      const proximaEnCola = colaActual[0];
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(fechaInicio.getTime() + proximaEnCola.duracion * 1000);
      await prisma.colaConstruccion.update({
          where: { id: proximaEnCola.id },
          data: { fechaInicio, fechaFinalizacion },
      });
      seHizoUnCambio = true;
  }

  if (seHizoUnCambio) {
    const propiedadRefrescada = await prisma.propiedad.findUnique({
      where: { id: propiedad.id },
      include: { 
        habitaciones: { include: { configuracion: { include: { requirements: true } } } },
        colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
        colaReclutamiento: { include: { tropaConfig: true } },
        TropaUsuario: { include: { configuracion: true } }
      }
    });
    return propiedadRefrescada as FullPropiedad;
  }

  return propiedad;
}

/**
 * Serializes Date objects to ISO strings for safe client component consumption
 */
function serializeDates<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString() as any;
    if (Array.isArray(obj)) return obj.map(serializeDates) as any;
    if (typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = serializeDates(value);
        }
        return result;
    }
    return obj;
}


export async function verificarYFinalizarConstruccion(user: UserWithProgress): Promise<UserWithProgress> {
    console.log('[GameTick] verificarYFinalizarConstruccion - start');
    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(prop => verificarYFinalizarConstruccionDePropiedad(prop))
    );
    console.log('[GameTick] verificarYFinalizarConstruccion - done');
    return { ...user, propiedades: propiedadesActualizadas };
}


async function verificarYFinalizarReclutamientoDePropiedad(propiedad: FullPropiedad): Promise<FullPropiedad> {
    const reclutamientoActivo = propiedad.colaReclutamiento;

    if (!reclutamientoActivo || new Date() < new Date(reclutamientoActivo.fechaFinalizacion)) {
        return propiedad;
    }

    try {
        await prisma.$transaction(async (tx) => {
            const esTropaDeDefensa = reclutamientoActivo.tropaConfig.tipo === 'DEFENSA';
            
            if (esTropaDeDefensa) {
                const tropaSeguridadExistente = await tx.tropaSeguridadUsuario.findFirst({
                    where: {
                        propiedadId: propiedad.id,
                        configuracionTropaId: reclutamientoActivo.tropaId,
                    }
                });

                if (tropaSeguridadExistente) {
                    await tx.tropaSeguridadUsuario.update({
                        where: { id: tropaSeguridadExistente.id },
                        data: { cantidad: { increment: reclutamientoActivo.cantidad } }
                    });
                } else {
                    await tx.tropaSeguridadUsuario.create({
                        data: {
                            propiedadId: propiedad.id,
                            configuracionTropaId: reclutamientoActivo.tropaId,
                            cantidad: reclutamientoActivo.cantidad,
                        }
                    });
                }

            } else {
                const tropaExistente = await tx.tropaUsuario.findUnique({
                    where: {
                        propiedadId_configuracionTropaId: {
                            propiedadId: propiedad.id,
                            configuracionTropaId: reclutamientoActivo.tropaId,
                        }
                    }
                });

                if (tropaExistente) {
                    await tx.tropaUsuario.update({
                        where: {
                            propiedadId_configuracionTropaId: {
                                propiedadId: propiedad.id,
                                configuracionTropaId: reclutamientoActivo.tropaId,
                            }
                        },
                        data: { cantidad: { increment: reclutamientoActivo.cantidad } }
                    });
                } else {
                    await tx.tropaUsuario.create({
                        data: {
                            propiedadId: propiedad.id,
                            configuracionTropaId: reclutamientoActivo.tropaId,
                            cantidad: reclutamientoActivo.cantidad,
                        }
                    });
                }
            }

            await tx.colaReclutamiento.delete({ where: { id: reclutamientoActivo.id } });

            await tx.message.create({
                data: {
                    recipientId: propiedad.userId,
                    subject: `Reclutamiento completado: ${reclutamientoActivo.cantidad}x ${reclutamientoActivo.tropaConfig.nombre}`,
                    content: `Se ha completado el adiestramiento de ${reclutamientoActivo.cantidad} unidades de ${reclutamientoActivo.tropaConfig.nombre} en "${propiedad.nombre}". Las tropas se han incorporado al arsenal.`,
                    category: MessageCategory.SISTEMA,
                }
            });
        });
        
        const propiedadRefrescada = await prisma.propiedad.findUnique({
             where: { id: propiedad.id },
             include: { 
                habitaciones: { include: { configuracion: { include: { requirements: true } } } },
                colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
                colaReclutamiento: { include: { tropaConfig: true } },
                TropaUsuario: { include: { configuracion: true } }
              }
        });
        return propiedadRefrescada as FullPropiedad;

    } catch (error) {
        console.error(`Error finalizando el reclutamiento en la propiedad ${propiedad.id}:`, error);
        return propiedad;
    }
}


export async function verificarYFinalizarReclutamiento(user: UserWithProgress): Promise<UserWithProgress> {
    console.log('[GameTick] verificarYFinalizarReclutamiento - start');
    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(prop => prop.colaReclutamiento ? verificarYFinalizarReclutamientoDePropiedad(prop) : prop)
    );
    console.log('[GameTick] verificarYFinalizarReclutamiento - done');
    return { ...user, propiedades: propiedadesActualizadas };
}

export async function verificarYFinalizarEntrenamientos(user: UserWithProgress): Promise<UserWithProgress> {
    console.log('[GameTick] verificarYFinalizarEntrenamientos - start');
    if (!user.colaEntrenamientos || user.colaEntrenamientos.length === 0) return user;

    const ahora = new Date();
    let seHizoUnCambio = false;

    const entrenamientosTerminados = user.colaEntrenamientos.filter(e => ahora >= new Date(e.fechaFinalizacion));

    if (entrenamientosTerminados.length > 0) {
        try {
            await prisma.$transaction(async (tx) => {
                for (const terminado of entrenamientosTerminados) {
                    await tx.entrenamientoUsuario.update({
                        where: {
                            userId_configuracionEntrenamientoId: {
                                userId: terminado.userId,
                                configuracionEntrenamientoId: terminado.entrenamientoId
                            }
                        },
                        data: {
                            nivel: terminado.nivelDestino,
                        },
                    });
                    await tx.colaEntrenamiento.delete({
                        where: { id: terminado.id }
                    });

                    const nombreEntrenamiento = terminado.entrenamiento?.nombre || terminado.entrenamientoId.replace(/_/g, ' ');
                    await tx.message.create({
                        data: {
                            recipientId: terminado.userId,
                            subject: `Entrenamiento completado: ${nombreEntrenamiento}`,
                            content: `La investigación de ${nombreEntrenamiento} al Nivel ${terminado.nivelDestino} ha concluido satisfactoriamente.`,
                            category: MessageCategory.SISTEMA,
                        }
                    });
                }
            });
            seHizoUnCambio = true;
        } catch (error) {
            console.error("Error al finalizar entrenamientos:", error);
        }
    }

    if (seHizoUnCambio) {
        const userRefrescado = await prisma.user.findUnique({ 
            where: { id: user.id }, 
            include: { 
                colaEntrenamientos: {
                    include: {
                        entrenamiento: true,
                        propiedad: {
                            select: { nombre: true }
                        }
                    }
                }
            } 
        });
        console.log('[GameTick] verificarYFinalizarEntrenamientos - done with changes');
        return { ...user, colaEntrenamientos: userRefrescado?.colaEntrenamientos || [] };
    }
    
    console.log('[GameTick] verificarYFinalizarEntrenamientos - done no changes');
    return user;
}


export async function verificarYFinalizarMisiones(user: UserWithProgress): Promise<UserWithProgress> {
    console.log('[GameTick] verificarYFinalizarMisiones - start');
    if (!user.misiones || user.misiones.length === 0) return user;

    const ahora = new Date();
    let seHizoUnCambio = false;

    const misionesFinalizadas = user.misiones.filter(m => {
        const fechaFinal = m.fechaRegreso || m.fechaLlegada;
        return fechaFinal && ahora >= new Date(fechaFinal);
    });

    if (misionesFinalizadas.length > 0) {
        try {
            await prisma.$transaction(async (tx) => {
                for (const mision of misionesFinalizadas) {
                    if (mision.tipoMision !== 'OCUPAR' && mision.propiedadOrigenId) {
                        const tropas: { id: string; cantidad: number }[] = JSON.parse(mision.tropas);
                        
                        for (const tropa of tropas) {
                            if (tropa.cantidad > 0) {
                                await tx.tropaUsuario.update({
                                    where: { 
                                        propiedadId_configuracionTropaId: {
                                            propiedadId: mision.propiedadOrigenId,
                                            configuracionTropaId: tropa.id
                                        }
                                    },
                                    data: { cantidad: { increment: tropa.cantidad } }
                                });
                            }
                        }
                    }
                    await tx.colaMisiones.delete({ where: { id: mision.id } });

                    await tx.message.create({
                        data: {
                            recipientId: user.id,
                            subject: `Misión de ${mision.tipoMision} finalizada`,
                            content: `La misión militar de tipo ${mision.tipoMision} hacia [${mision.destinoCiudad}:${mision.destinoBarrio}:${mision.destinoEdificio}] ha concluido y las tropas han retornado a la base.`,
                            category: MessageCategory.BATALLA,
                        }
                    });
                }
            });
            seHizoUnCambio = true;
        } catch (error) {
            console.error("Error al finalizar misiones y devolver tropas:", error);
        }
    }

    if (seHizoUnCambio) {
        const userRefrescado = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                propiedades: {
                    include: { 
                        habitaciones: { include: { configuracion: { include: { requirements: true } } } },
                        colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
                        colaReclutamiento: { include: { tropaConfig: true } },
                        TropaUsuario: { include: { configuracion: true } }
                    }
                },
                entrenamientos: { include: { configuracion: true } },
                puntuacion: true,
                misiones: { orderBy: { fechaLlegada: 'asc' } }
            }
        });
        console.log('[GameTick] verificarYFinalizarMisiones - done with changes');
        return userRefrescado as UserWithProgress;
    }

    console.log('[GameTick] verificarYFinalizarMisiones - done no changes');
    return user;
}


/**
 * Unified game tick processor - runs all checks sequentially with proper data flow
 * This ensures each step sees the updates from previous steps
 */
export async function processGameTick(user: UserWithProgress): Promise<UserWithProgress> {
    console.log('[GameTick] processGameTick - START for user:', user.id);
    
    // Step 1: Construction queue
    let updatedUser = await verificarYFinalizarConstruccion(user);
    console.log('[GameTick] After construction:', updatedUser.propiedades?.length, 'props');
    
    // Step 2: Recruitment queue (sees updated properties from step 1)
    updatedUser = await verificarYFinalizarReclutamiento(updatedUser);
    console.log('[GameTick] After recruitment:', updatedUser.propiedades?.length, 'props');
    
    // Step 3: Missions (sees updated properties from step 2)
    updatedUser = await verificarYFinalizarMisiones(updatedUser);
    console.log('[GameTick] After missions:', updatedUser.misiones?.length, 'missions');
    
    // Step 4: Trainings (sees updated user from step 3)
    updatedUser = await verificarYFinalizarEntrenamientos(updatedUser);
    console.log('[GameTick] After trainings:', updatedUser.colaEntrenamientos?.length, 'trainings');
    
    // Step 5: Update resources based on time elapsed (sees all queue updates)
    updatedUser = await obtenerEstadoJuegoActualizado(updatedUser);
    console.log('[GameTick] After resource update');
    
    // Step 6: Recalculate score (sees everything)
    updatedUser = await actualizarPuntuacionUsuario(updatedUser);
    console.log('[GameTick] After score update');
    
    // Serialize dates for client components
    const serialized = serializeDates(updatedUser);
    console.log('[GameTick] processGameTick - COMPLETE');
    return serialized;
}


export async function actualizarPuntuacionUsuario(user: UserWithProgress): Promise<UserWithProgress> {
  const puntosHabitaciones = calcularPuntosHabitaciones(user);
  const puntosTropas = calcularPuntosTropas(user);
  const puntosEntrenamientos = calcularPuntosEntrenamientos(user);
  const puntosTotales = puntosHabitaciones + puntosTropas + puntosEntrenamientos;

  try {
    const puntuacionActualizada = await prisma.puntuacionUsuario.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        puntosHabitaciones,
        puntosTropas,
        puntosEntrenamientos,
        puntosTotales,
        updatedAt: new Date(),
      },
      update: {
        puntosHabitaciones,
        puntosTropas,
        puntosEntrenamientos,
        puntosTotales,
        updatedAt: new Date(),
      },
    });

    const updatedUser = { ...user, puntuacion: puntuacionActualizada };
    return updatedUser;
    
  } catch (error) {
    console.error("Error actualizando la puntuación del usuario:", error);
    return user;
  }
}
