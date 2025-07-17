

'use server';

import prisma from "../prisma/prisma";
import type { FullPropiedad, UserWithProgress } from "../data";
import { calcularProduccionTotalPorSegundo } from "../formulas/room-formulas";
import { revalidatePath } from "next/cache";
import { calcularPuntosEntrenamientos, calcularPuntosHabitaciones, calcularPuntosTropas } from "../formulas/score-formulas";

async function actualizarRecursosPropiedad(propiedad: FullPropiedad): Promise<FullPropiedad> {
    const ahora = new Date();
    const ultimaActualizacion = new Date(propiedad.ultimaActualizacion);
    const segundosTranscurridos = Math.max(0, Math.floor((ahora.getTime() - ultimaActualizacion.getTime()) / 1000));

    if (segundosTranscurridos <= 0) {
        return propiedad;
    }

    const produccionPorSegundo = calcularProduccionTotalPorSegundo(propiedad);

    const armasGeneradas = produccionPorSegundo.armas * segundosTranscurridos;
    const municionGenerada = produccionPorSegundo.municion * segundosTranscurridos;
    const alcoholGenerado = produccionPorSegundo.alcohol * segundosTranscurridos;
    const dolaresGenerados = produccionPorSegundo.dolares * segundosTranscurridos;

    try {
        const propiedadActualizada = await prisma.propiedad.update({
            where: { id: propiedad.id },
            data: {
                armas: { increment: armasGeneradas },
                municion: { increment: municionGenerada },
                alcohol: { increment: alcoholGenerado },
                dolares: { increment: dolaresGenerados },
                ultimaActualizacion: ahora,
            },
            include: { 
                habitaciones: { include: { configuracion: { include: { escalado: true } } } },
                colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
                colaReclutamiento: { include: { tropaConfig: true } },
                tropas: { include: { configuracion: true } }
            }
        });
        return propiedadActualizada as FullPropiedad;
    } catch (error) {
        console.error(`Error actualizando recursos para propiedad ${propiedad.id}:`, error);
        return propiedad;
    }
}


export async function obtenerEstadoJuegoActualizado(user: UserWithProgress): Promise<UserWithProgress> {
    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(propiedad => actualizarRecursosPropiedad(propiedad))
    );

    return {
        ...user,
        propiedades: propiedadesActualizadas,
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
        habitaciones: { include: { configuracion: { include: { escalado: true } } } },
        colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
        colaReclutamiento: { include: { tropaConfig: true } },
        tropas: { include: { configuracion: true } }
      }
    });
    return propiedadRefrescada as FullPropiedad;
  }

  return propiedad;
}

export async function verificarYFinalizarConstruccion(user: UserWithProgress): Promise<UserWithProgress> {
    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(prop => verificarYFinalizarConstruccionDePropiedad(prop))
    );
    return { ...user, propiedades: propiedadesActualizadas };
}


async function verificarYFinalizarReclutamientoDePropiedad(propiedad: FullPropiedad): Promise<FullPropiedad> {
    const reclutamientoActivo = propiedad.colaReclutamiento;

    if (!reclutamientoActivo || new Date() < new Date(reclutamientoActivo.fechaFinalizacion)) {
        return propiedad;
    }

    try {
        await prisma.$transaction(async (tx) => {
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

            await tx.colaReclutamiento.delete({ where: { id: reclutamientoActivo.id } });
        });
        
        const propiedadRefrescada = await prisma.propiedad.findUnique({
             where: { id: propiedad.id },
             include: { 
                habitaciones: { include: { configuracion: { include: { escalado: true } } } },
                colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
                colaReclutamiento: { include: { tropaConfig: true } },
                tropas: { include: { configuracion: true } }
              }
        });
        return propiedadRefrescada as FullPropiedad;

    } catch (error) {
        console.error(`Error finalizando el reclutamiento en la propiedad ${propiedad.id}:`, error);
        return propiedad;
    }
}


export async function verificarYFinalizarReclutamiento(user: UserWithProgress): Promise<UserWithProgress> {
    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(prop => prop.colaReclutamiento ? verificarYFinalizarReclutamientoDePropiedad(prop) : prop)
    );
    return { ...user, propiedades: propiedadesActualizadas };
}

export async function verificarYFinalizarMisiones(user: UserWithProgress): Promise<UserWithProgress> {
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
                        habitaciones: { include: { configuracion: { include: { escalado: true } } } },
                        colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
                        colaReclutamiento: { include: { tropaConfig: true } },
                        tropas: { include: { configuracion: true } }
                    }
                },
                entrenamientos: { include: { configuracion: true } },
                puntuacion: true,
                misiones: { orderBy: { fechaLlegada: 'asc' } }
            }
        });
        return userRefrescado as UserWithProgress;
    }

    return user;
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

    const updatedUser = { ...user, puntuacion: puntuacionActualizada };
    return updatedUser;
    
  } catch (error) {
    console.error("Error actualizando la puntuación del usuario:", error);
    return user;
  }
}
