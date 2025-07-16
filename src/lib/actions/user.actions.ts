
'use server';

import prisma from "../prisma/prisma";
import type { UserWithProgress } from "../data";
import { calcularProduccionTotalPorSegundo, calcularTiempoConstruccion } from "../formulas/room-formulas";
import { revalidatePath } from "next/cache";
import { calcularPuntosEntrenamientos, calcularPuntosHabitaciones, calcularPuntosTropas } from "../formulas/score-formulas";

export async function obtenerEstadoJuegoActualizado(user: UserWithProgress) {
  if (!user || !user.progreso) {
    throw new Error("Usuario no válido o sin progreso para actualizar.");
  }
  
  const ahora = new Date();
  const ultimaActualizacion = new Date(user.progreso.ultimaActualizacion);
  const segundosTranscurridos = Math.max(0, Math.floor((ahora.getTime() - ultimaActualizacion.getTime()) / 1000));

  if (segundosTranscurridos <= 0) {
    return user;
  }
  
  const produccionPorSegundo = calcularProduccionTotalPorSegundo(user);

  const armasGeneradas = produccionPorSegundo.armas * segundosTranscurridos;
  const municionGenerada = produccionPorSegundo.municion * segundosTranscurridos;
  const alcoholGenerado = produccionPorSegundo.alcohol * segundosTranscurridos;
  const dolaresGenerados = produccionPorSegundo.dolares * segundosTranscurridos;

  const nuevasArmas = (user.progreso.armas || 0) + armasGeneradas;
  const nuevaMunicion = (user.progreso.municion || 0) + municionGenerada;
  const nuevoAlcohol = (user.progreso.alcohol || 0) + alcoholGenerado;
  const nuevosDolares = (user.progreso.dolares || 0) + dolaresGenerados;
  
  try {
    const progresoActualizado = await prisma.progresoUsuario.update({
        where: { userId: user.id },
        data: {
            armas: nuevasArmas,
            municion: nuevaMunicion,
            alcohol: nuevoAlcohol,
            dolares: nuevosDolares,
            ultimaActualizacion: ahora,
        }
    });

    return {
        ...user,
        progreso: progresoActualizado,
    };
  } catch (error) {
    console.error("Error al actualizar el progreso del usuario:", error);
    return user;
  }
}

async function verificarYFinalizarConstruccionDePropiedad(user: UserWithProgress, propiedadId: string): Promise<UserWithProgress> {
  const propiedad = user.propiedades.find(p => p.id === propiedadId);
  if (!propiedad) return user;
  
  const cola = [...propiedad.colaConstruccion].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (cola.length === 0) return user;

  const construccionActiva = cola[0];
  let seHizoUnCambio = false;

  // Si la construcción activa ya ha terminado
  if (construccionActiva.fechaFinalizacion && new Date() >= new Date(construccionActiva.fechaFinalizacion)) {
    try {
        await prisma.$transaction(async (tx) => {
            // Actualizar nivel de la habitación
            await tx.habitacionUsuario.update({
                where: {
                    propiedadId_configuracionHabitacionId: {
                        propiedadId: propiedadId,
                        configuracionHabitacionId: construccionActiva.habitacionId,
                    },
                },
                data: {
                    nivel: construccionActiva.nivelDestino,
                },
            });
            // Eliminar de la cola
            await tx.colaConstruccion.delete({
                where: { id: construccionActiva.id },
            });
        });
        seHizoUnCambio = true;
    } catch (error) {
        console.error(`Error finalizando construcción ${construccionActiva.id}:`, error);
    }
  }

  // Si se finalizó una, o si la primera de la cola aún no ha comenzado, intentamos activar la siguiente.
  if (seHizoUnCambio || !construccionActiva.fechaFinalizacion) {
      // Re-fetch de la propiedad para obtener el estado de la cola actualizado
      const propiedadActualizada = await prisma.propiedad.findUnique({
          where: { id: propiedadId },
          include: { colaConstruccion: { orderBy: { createdAt: 'asc' } }, habitaciones: { include: { configuracion: true }} },
      });

      if (propiedadActualizada && propiedadActualizada.colaConstruccion.length > 0) {
          const proximaConstruccion = propiedadActualizada.colaConstruccion[0];
          // Si no tiene fecha de finalización, es la que hay que activar
          if (!proximaConstruccion.fechaFinalizacion) {
            const configHabitacion = propiedad.habitaciones.find(h => h.configuracionHabitacionId === proximaConstruccion.habitacionId)?.configuracion;
            if (configHabitacion) {
              const nivelOficinaJefe = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'oficina_del_jefe')?.nivel || 1;
              const tiempo = calcularTiempoConstruccion(proximaConstruccion.nivelDestino, configHabitacion, nivelOficinaJefe);
              const fechaInicio = new Date();
              const fechaFinalizacion = new Date(fechaInicio.getTime() + tiempo * 1000);
              
              await prisma.colaConstruccion.update({
                where: { id: proximaConstruccion.id },
                data: { fechaInicio, fechaFinalizacion },
              });
              seHizoUnCambio = true;
            }
          }
      }
  }

  if (seHizoUnCambio) {
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        progreso: true,
        propiedades: { include: { habitaciones: { include: { configuracion: { include: { escalado: true } } } }, colaConstruccion: { orderBy: { createdAt: 'asc' } }, colaReclutamiento: { include: { tropaConfig: true } } } },
        entrenamientos: { include: { configuracion: true } },
        tropas: { include: { configuracion: true } },
        puntuacion: true,
      }
    });
    return updatedUser as UserWithProgress;
  }

  return user;
}


export async function verificarYFinalizarConstruccion(user: UserWithProgress): Promise<UserWithProgress> {
    let userActualizado = user;
    for (const propiedad of user.propiedades) {
        if (propiedad.colaConstruccion.length > 0) {
            userActualizado = await verificarYFinalizarConstruccionDePropiedad(userActualizado, propiedad.id);
        }
    }
    return userActualizado;
}

async function verificarYFinalizarReclutamientoDePropiedad(user: UserWithProgress, propiedadId: string): Promise<UserWithProgress> {
    const propiedad = user.propiedades.find(p => p.id === propiedadId);
    const reclutamientoActivo = propiedad?.colaReclutamiento;

    if (!reclutamientoActivo || new Date() < new Date(reclutamientoActivo.fechaFinalizacion)) {
        return user;
    }

    try {
        await prisma.$transaction(async (tx) => {
            const tropaExistente = await tx.tropaUsuario.findUnique({
                where: {
                    userId_configuracionTropaId: {
                        userId: user.id,
                        configuracionTropaId: reclutamientoActivo.tropaId,
                    }
                }
            });

            if (tropaExistente) {
                await tx.tropaUsuario.update({
                    where: {
                        userId_configuracionTropaId: {
                            userId: user.id,
                            configuracionTropaId: reclutamientoActivo.tropaId,
                        }
                    },
                    data: {
                        cantidad: { increment: reclutamientoActivo.cantidad }
                    }
                });
            } else {
                await tx.tropaUsuario.create({
                    data: {
                        userId: user.id,
                        configuracionTropaId: reclutamientoActivo.tropaId,
                        cantidad: reclutamientoActivo.cantidad,
                    }
                });
            }

            await tx.colaReclutamiento.delete({
                where: { id: reclutamientoActivo.id }
            });
        });
        
        const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                progreso: true,
                propiedades: { include: { habitaciones: { include: { configuracion: { include: { escalado: true } } } }, colaConstruccion: { orderBy: { createdAt: 'asc' } }, colaReclutamiento: { include: { tropaConfig: true } } } },
                entrenamientos: { include: { configuracion: true } },
                tropas: { include: { configuracion: true } },
                puntuacion: true,
            }
        });

        return updatedUser as UserWithProgress;

    } catch (error) {
        console.error(`Error finalizando el reclutamiento en la propiedad ${propiedadId}:`, error);
        return user;
    }
}

export async function verificarYFinalizarReclutamiento(user: UserWithProgress): Promise<UserWithProgress> {
    let userActualizado = user;
    for (const propiedad of user.propiedades) {
        if (propiedad.colaReclutamiento) {
            userActualizado = await verificarYFinalizarReclutamientoDePropiedad(userActualizado, propiedad.id);
        }
    }
    return userActualizado;
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
      },
      update: {
        puntosHabitaciones,
        puntosTropas,
        puntosEntrenamientos,
        puntosTotales,
      },
    });

    // We need to manually update the user object we pass around
    const updatedUser = { ...user, puntuacion: puntuacionActualizada };
    return updatedUser;
    
  } catch (error) {
    console.error("Error actualizando la puntuación del usuario:", error);
    return user;
  }
}
