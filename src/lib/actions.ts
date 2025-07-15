
'use server';

import prisma from "./prisma/prisma";
import type { UserWithProgress, FullConfiguracionHabitacion } from "./data";
import { calcularProduccionTotalPorSegundo } from "./formulas-produccion";
import { getSessionUser } from "./auth";
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
    await prisma.$transaction([
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
