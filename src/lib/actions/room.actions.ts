'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { FullConfiguracionHabitacion } from "../data";
import { calcularCostosNivel } from "../formulas/room-formulas";


export async function iniciarAmpliacion(habitacionId: string) {
    const user = await getSessionUser();
  
    if (!user || !user.progreso) {
      return { error: 'Usuario no autenticado.' };
    }

    const habitacionUsuario = user.habitaciones.find(h => h.configuracionHabitacionId === habitacionId);

    if (!habitacionUsuario) {
         return { error: 'Configuración de habitación de usuario no encontrada.' };
    }

    const config = habitacionUsuario.configuracion;
    if (!config) {
        return { error: 'Configuración de la habitación no encontrada.'}
    }

    const nivelActual = habitacionUsuario.nivel;
    const nivelSiguiente = nivelActual + 1;
  
    const costos = calcularCostosNivel(nivelSiguiente, config as FullConfiguracionHabitacion);
  
    if (
      user.progreso.armas < costos.armas ||
      user.progreso.municion < costos.municion ||
      user.progreso.dolares < costos.dolares
    ) {
      return { error: 'No tienes suficientes recursos para esta ampliación.' };
    }
  
    try {
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
                }
            },
            data: {
                nivel: { increment: 1 },
            }
        })
      ]);
  
      revalidatePath('/rooms');
      revalidatePath('/overview'); 
  
      return { success: `¡${config.nombre} ampliado a nivel ${nivelSiguiente}!` };
    } catch (error) {
      console.error('Error durante la transacción de ampliación:', error);
      return { error: 'Ocurrió un error en el servidor al intentar ampliar.' };
    }
  }