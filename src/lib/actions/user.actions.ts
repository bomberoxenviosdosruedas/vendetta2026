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
    await prisma.$transaction([
      prisma.habitacionUsuario.update({
        where: {
          userId_configuracionHabitacionId: {
            userId: user.id,
            configuracionHabitacionId: construccionActiva.habitacionId,
          },
        },
        data: {
          nivel: construccionActiva.nivelDestino,
        },
      }),
      prisma.colaConstruccion.delete({
        where: {
          userId: user.id,
        },
      }),
    ]);
    
    // Forzar revalidación de datos en las rutas afectadas
    revalidatePath('/rooms');
    revalidatePath('/overview');
    revalidatePath('/(dashboard)/layout', 'layout');

    // Volver a obtener el usuario con los datos actualizados
    const userActualizado = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        progreso: true,
        habitaciones: { include: { configuracion: { include: { escalado: true } } } },
        entrenamientos: { include: { configuracion: true } },
        tropas: true,
        colaConstruccion: true,
      }
    });

    return userActualizado as UserWithProgress;

  } catch (error) {
    console.error("Error finalizando la construcción:", error);
    // Si falla, simplemente devolvemos el usuario original
    return user;
  }
}
