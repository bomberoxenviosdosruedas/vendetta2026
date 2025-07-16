'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getTrainingConfigurations } from "../data";
import { calcularCostosEntrenamiento } from "../formulas/training-formulas";

export async function iniciarEntrenamiento(trainingId: string) {
    const user = await getSessionUser();
  
    if (!user || !user.progreso) {
      return { error: 'Usuario no autenticado.' };
    }

    const allTrainingConfigs = await getTrainingConfigurations();
    const config = allTrainingConfigs.find(c => c.id === trainingId);
    
    if (!config) {
        return { error: 'Configuración de entrenamiento no encontrada.'}
    }

    const userTraining = user.entrenamientos.find(t => t.configuracionEntrenamientoId === trainingId);
    
    const nivelActual = userTraining ? userTraining.nivel : 0;
    const nivelSiguiente = nivelActual + 1;
  
    const costos = calcularCostosEntrenamiento(nivelSiguiente, config);
  
    if (
      user.progreso.armas < costos.armas ||
      user.progreso.municion < costos.municion ||
      user.progreso.dolares < costos.dolares
    ) {
      return { error: 'No tienes suficientes recursos para este entrenamiento.' };
    }
  
    try {
      await prisma.$transaction(async (tx) => {
        await tx.progresoUsuario.update({
          where: { userId: user.id },
          data: {
            armas: { decrement: costos.armas },
            municion: { decrement: costos.municion },
            dolares: { decrement: costos.dolares },
          },
        });

        if (userTraining) {
            await tx.entrenamientoUsuario.update({
                where: {
                    userId_configuracionEntrenamientoId: {
                        userId: user.id,
                        configuracionEntrenamientoId: trainingId,
                    }
                },
                data: {
                    nivel: { increment: 1 },
                }
            });
        } else {
             await tx.entrenamientoUsuario.create({
                data: {
                    userId: user.id,
                    configuracionEntrenamientoId: trainingId,
                    nivel: 1
                }
             })
        }
      });
  
      revalidatePath('/training');
      revalidatePath('/overview'); 
  
      return { success: `¡${config.nombre} mejorado a nivel ${nivelSiguiente}!` };
    } catch (error) {
      console.error('Error durante la transacción de entrenamiento:', error);
      return { error: 'Ocurrió un error en el servidor al intentar entrenar.' };
    }
  }