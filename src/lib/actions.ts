
'use server';

import prisma from "./prisma/prisma";
import type { UserWithProgress, FullConfiguracionHabitacion } from "./data";
import { calcularProduccionRecurso } from "./formulas-produccion";
import { getSessionUser, getUserWithProgressByUsername } from "./auth";
import { revalidatePath } from "next/cache";
import { calcularCostosNivel } from "./formulas";

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
  
  let produccionArmasPorSegundo = 0;
  let produccionMunicionPorSegundo = 0;
  let produccionAlcoholPorSegundo = 0;
  let produccionDolaresPorSegundo = 0;

  user.habitaciones.forEach(habitacion => {
    const config = habitacion.configuracion;
    if (!config.escalado?.produccionRecurso || habitacion.nivel === 0) return;

    const produccionPorHora = calcularProduccionRecurso(config.id, habitacion.nivel);
    const produccionPorSegundo = produccionPorHora / 3600;

    switch (config.escalado.produccionRecurso) {
        case 'armas':
            produccionArmasPorSegundo += produccionPorSegundo;
            break;
        case 'municion':
            produccionMunicionPorSegundo += produccionPorSegundo;
            break;
        case 'alcohol':
            produccionAlcoholPorSegundo += produccionPorSegundo;
            break;
        case 'dolares':
        case 'dolares_por_alcohol':
            produccionDolaresPorSegundo += produccionPorSegundo;
            break;
    }
  });

  const armasGeneradas = produccionArmasPorSegundo * segundosTranscurridos;
  const municionGenerada = produccionMunicionPorSegundo * segundosTranscurridos;
  const alcoholGenerado = produccionAlcoholPorSegundo * segundosTranscurridos;
  const dolaresGenerados = produccionDolaresPorSegundo * segundosTranscurridos;

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


export async function iniciarAmpliacion(habitacionId: string) {
  const user = await getSessionUser();

  if (!user || !user.progreso) {
    return { error: 'Usuario no autenticado.' };
  }

  const habitacionUsuario = user.habitaciones.find(h => h.configuracionHabitacionId === habitacionId);

  if (!habitacionUsuario) {
    return { error: 'Habitación no encontrada para este usuario.' };
  }

  const nivelActual = habitacionUsuario.nivel;
  const nivelSiguiente = nivelActual + 1;
  const config = habitacionUsuario.configuracion;

  const costos = calcularCostosNivel(nivelSiguiente, config as FullConfiguracionHabitacion);

  // Verificar si el usuario tiene suficientes recursos
  if (
    user.progreso.armas < costos.armas ||
    user.progreso.municion < costos.municion ||
    user.progreso.dolares < costos.dolares
  ) {
    return { error: 'No tienes suficientes recursos para esta ampliación.' };
  }

  // Lógica de la cola (placeholder por ahora, se hace la mejora instantánea)
  try {
    // Descontar recursos y aumentar el nivel de la habitación
    const [, updatedProgreso] = await prisma.$transaction([
      prisma.progresoUsuario.update({
        where: { userId: user.id },
        data: {
          armas: { decrement: costos.armas },
          municion: { decrement: costos.municion },
          dolares: { decrement: costos.dolares },
        },
      }),
      prisma.habitacionUsuario.update({
        where: {
          userId_configuracionHabitacionId: {
            userId: user.id,
            configuracionHabitacionId: habitacionId,
          },
        },
        data: {
          nivel: { increment: 1 },
        },
      }),
    ]);

    revalidatePath('/rooms');
    revalidatePath('/overview'); 

    return { success: `¡${config.nombre} ampliado a nivel ${nivelSiguiente}!` };
  } catch (error) {
    console.error('Error durante la transacción de ampliación:', error);
    return { error: 'Ocurrió un error en el servidor al intentar ampliar.' };
  }
}
