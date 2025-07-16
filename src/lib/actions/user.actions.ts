
'use server';

import prisma from "../prisma/prisma";
import type { UserWithProgress } from "../data";
import { calcularProduccionTotalPorSegundo } from "../formulas/room-formulas";
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

  let seHizoUnCambio = false;
  let ultimaFechaFinalizacion = new Date(); // Inicia con la hora actual por si no hay nada activo

  // Buscar la construcción activa (si la hay)
  const construccionActiva = cola.find(c => c.fechaFinalizacion && new Date() < new Date(c.fechaFinalizacion));
  if (construccionActiva) {
    ultimaFechaFinalizacion = new Date(construccionActiva.fechaFinalizacion);
  }

  // Procesar construcciones terminadas
  const construccionesTerminadas = cola.filter(c => c.fechaFinalizacion && new Date() >= new Date(c.fechaFinalizacion));
  
  if (construccionesTerminadas.length > 0) {
    try {
        await prisma.$transaction(async (tx) => {
            for (const terminada of construccionesTerminadas) {
                // Actualizar nivel de la habitación
                await tx.habitacionUsuario.update({
                    where: {
                        propiedadId_configuracionHabitacionId: {
                            propiedadId: propiedadId,
                            configuracionHabitacionId: terminada.habitacionId,
                        },
                    },
                    data: {
                        nivel: terminada.nivelDestino,
                    },
                });
                // Eliminar de la cola
                await tx.colaConstruccion.delete({
                    where: { id: terminada.id },
                });
            }
        });
        seHizoUnCambio = true;
    } catch (error) {
        console.error(`Error finalizando construcciones:`, error);
    }
  }

  // Activar la siguiente construcción en la cola si es necesario
  if (seHizoUnCambio || !construccionActiva) {
      const propiedadActualizada = await prisma.propiedad.findUnique({
          where: { id: propiedadId },
          include: { colaConstruccion: { orderBy: { createdAt: 'asc' } } },
      });

      if (propiedadActualizada && propiedadActualizada.colaConstruccion.length > 0) {
        let proximaFechaInicio = new Date();
        const ultimaConstruccionActiva = cola.find(c => c.fechaFinalizacion);
        if(ultimaConstruccionActiva && ultimaConstruccionActiva.fechaFinalizacion) {
          proximaFechaInicio = new Date(ultimaConstruccionActiva.fechaFinalizacion);
        }

        const colaParaActivar = propiedadActualizada.colaConstruccion.filter(c => !c.fechaFinalizacion);
        
        for (const construccion of colaParaActivar) {
            const fechaInicio = new Date(proximaFechaInicio);
            const fechaFinalizacion = new Date(fechaInicio.getTime() + construccion.duracion * 1000);

            await prisma.colaConstruccion.update({
                where: { id: construccion.id },
                data: { fechaInicio, fechaFinalizacion },
            });
            proximaFechaInicio = fechaFinalizacion; // La siguiente comienza cuando esta termina
            seHizoUnCambio = true;
        }
      }
  }

  if (seHizoUnCambio) {
    // Re-fetch para devolver el estado más actualizado
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
        userActualizado = await verificarYFinalizarConstruccionDePropiedad(userActualizado, propiedad.id);
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
