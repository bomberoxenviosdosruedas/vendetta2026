

'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getTroopConfigurations, getUserWithProgressByUsername } from "../data";
import { calcularTiempoReclutamiento } from "../formulas/troop-formulas";


export async function iniciarReclutamiento(tropaId: string, cantidad: number) {
    const user = await getSessionUser();
  
    if (!user || !user.progreso) {
      return { error: 'Usuario no autenticado.' };
    }

    if (cantidad <= 0) {
        return { error: 'La cantidad debe ser mayor que cero.' };
    }

    if (user.colaReclutamiento) {
        return { error: 'Ya hay un reclutamiento en progreso.' };
    }

    const troopConfigs = await getTroopConfigurations();
    const config = troopConfigs.find(t => t.id === tropaId);

    if (!config) {
         return { error: 'Configuración de tropa no encontrada.' };
    }

    const propiedadActual = user.propiedades[0];
    const nivelCampoEntrenamiento = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === 'campo_de_entrenamiento')?.nivel || 1;

    const costoArmasTotal = config.costoArmas * cantidad;
    const costoMunicionTotal = config.costoMunicion * cantidad;
    const costoDolaresTotal = config.costoDolares * cantidad;

    const tiempoTotal = calcularTiempoReclutamiento(config, cantidad, nivelCampoEntrenamiento);
  
    if (
      user.progreso.armas < costoArmasTotal ||
      user.progreso.municion < costoMunicionTotal ||
      user.progreso.dolares < costoDolaresTotal
    ) {
      return { error: 'No tienes suficientes recursos para este reclutamiento.' };
    }
  
    try {
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(fechaInicio.getTime() + tiempoTotal * 1000);

      await prisma.$transaction([
        prisma.progresoUsuario.update({
          where: { userId: user.id },
          data: {
            armas: { decrement: costoArmasTotal },
            municion: { decrement: costoMunicionTotal },
            dolares: { decrement: costoDolaresTotal },
          },
        }),
        prisma.colaReclutamiento.create({
            data: {
                userId: user.id,
                tropaId: tropaId,
                cantidad: cantidad,
                fechaInicio: fechaInicio,
                fechaFinalizacion: fechaFinalizacion
            }
        })
      ]);
  
      revalidatePath('/recruitment');
      revalidatePath('/overview'); 
      revalidatePath('/(dashboard)/layout', 'layout');
  
      return { success: `¡El reclutamiento de ${cantidad} x ${config.nombre} ha comenzado!` };
    } catch (error) {
      console.error('Error durante la transacción de reclutamiento:', error);
      return { error: 'Ocurrió un error en el servidor al intentar reclutar.' };
    }
}
