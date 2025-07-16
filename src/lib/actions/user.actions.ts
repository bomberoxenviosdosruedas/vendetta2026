
'use server';

import prisma from "../prisma/prisma";
import type { UserWithProgress } from "../data";
import { calcularProduccionTotalPorSegundo } from "../formulas/room-formulas";
import { revalidatePath } from "next/cache";

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

export async function verificarYFinalizarConstruccion(user: UserWithProgress) {
  const construccionActiva = user.colaConstruccion;
  if (!construccionActiva || new Date() < new Date(construccionActiva.fechaFinalizacion)) {
    return user;
  }

  try {
    const userActualizado = await prisma.$transaction(async (tx) => {
        // Asumimos que la construcción se realiza en la primera propiedad.
        // Esto deberá cambiar cuando se implemente la selección de propiedades.
        const propiedadId = user.propiedades[0].id;

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
        await tx.colaConstruccion.delete({
          where: {
            userId: user.id,
          },
        });
  
        // Devolver el usuario actualizado dentro de la transacción
        return await tx.user.findUnique({
            where: { id: user.id },
            include: {
              progreso: true,
              propiedades: { include: { habitaciones: { include: { configuracion: { include: { escalado: true } } } } } },
              entrenamientos: { include: { configuracion: true } },
              tropas: true,
              colaConstruccion: true,
              colaReclutamiento: {
                include: {
                  tropaConfig: true
                }
              },
            }
        });
    });
    
    revalidatePath('/(dashboard)', 'layout');

    return userActualizado as UserWithProgress;

  } catch (error) {
    console.error("Error finalizando la construcción:", error);
    return user;
  }
}

export async function verificarYFinalizarReclutamiento(user: UserWithProgress): Promise<UserWithProgress> {
    const reclutamientoActivo = user.colaReclutamiento;
    if (!reclutamientoActivo || new Date() < new Date(reclutamientoActivo.fechaFinalizacion)) {
      return user;
    }
  
    try {
        const userActualizado = await prisma.$transaction(async (tx) => {
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
                where: { userId: user.id }
            });

            return await tx.user.findUnique({
                where: { id: user.id },
                include: {
                    progreso: true,
                    propiedades: { include: { habitaciones: { include: { configuracion: { include: { escalado: true } } } } } },
                    entrenamientos: { include: { configuracion: true } },
                    tropas: true,
                    colaConstruccion: true,
                    colaReclutamiento: {
                      include: {
                        tropaConfig: true
                      }
                    },
                }
            });
        });
      
        revalidatePath('/(dashboard)', 'layout');
  
      return userActualizado as UserWithProgress;
  
    } catch (error) {
      console.error("Error finalizando el reclutamiento:", error);
      return user;
    }
}
