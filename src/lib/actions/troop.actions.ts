
'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getTroopConfigurations } from "../data";
import { calcularTiempoReclutamiento } from "../formulas/troop-formulas";


export async function iniciarReclutamiento(propiedadId: string, tropaId: string, cantidad: number) {
    const user = await getSessionUser();
  
    if (!user) {
      return { error: 'Usuario no autenticado.' };
    }

    if (cantidad <= 0) {
        return { error: 'La cantidad debe ser mayor que cero.' };
    }
    
    const propiedadActual = user.propiedades.find(p => p.id === propiedadId);
    if (!propiedadActual) {
        return { error: 'Propiedad no encontrada para este usuario.' };
    }

    if (propiedadActual.colaReclutamiento) {
        return { error: 'Ya hay un reclutamiento en progreso en esta propiedad.' };
    }

    const troopConfigs = await getTroopConfigurations();
    const config = troopConfigs.find(t => t.id === tropaId);

    if (!config) {
         return { error: 'Configuración de tropa no encontrada.' };
    }

    if (config.tipo === 'DEFENSA') {
        return { error: 'Las unidades de defensa se entrenan en la sección de Seguridad.' };
    }

    const nivelCampoEntrenamiento = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === 'campo_de_entrenamiento')?.nivel || 1;

    const costoArmasTotal = config.costoArmas * cantidad;
    const costoMunicionTotal = config.costoMunicion * cantidad;
    const costoDolaresTotal = config.costoDolares * cantidad;

    const tiempoTotal = calcularTiempoReclutamiento(config, cantidad, nivelCampoEntrenamiento);
  
    if (
      propiedadActual.armas < costoArmasTotal ||
      propiedadActual.municion < costoMunicionTotal ||
      propiedadActual.dolares < costoDolaresTotal
    ) {
      return { error: 'No tienes suficientes recursos para este reclutamiento.' };
    }
  
    try {
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(fechaInicio.getTime() + tiempoTotal * 1000);

      await prisma.$transaction([
        prisma.propiedad.update({
          where: { id: propiedadId },
          data: {
            armas: { decrement: costoArmasTotal },
            municion: { decrement: costoMunicionTotal },
            dolares: { decrement: costoDolaresTotal },
          },
        }),
        prisma.colaReclutamiento.create({
            data: {
                propiedadId: propiedadId,
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


export async function iniciarEntrenamientoSeguridad(propiedadId: string, tropaId: string, cantidad: number) {
    const user = await getSessionUser();
  
    if (!user) {
      return { error: 'Usuario no autenticado.' };
    }

    if (cantidad <= 0) {
        return { error: 'La cantidad debe ser mayor que cero.' };
    }
    
    const propiedadActual = user.propiedades.find(p => p.id === propiedadId);
    if (!propiedadActual) {
        return { error: 'Propiedad no encontrada para este usuario.' };
    }

    if (propiedadActual.colaReclutamiento) {
        return { error: 'Ya hay un reclutamiento en progreso en esta propiedad.' };
    }

    const troopConfigs = await getTroopConfigurations();
    const config = troopConfigs.find(t => t.id === tropaId);

    if (!config) {
         return { error: 'Configuración de tropa no encontrada.' };
    }

    if (config.tipo !== 'DEFENSA') {
        return { error: 'Esta tropa no es una unidad de defensa.' };
    }

    const nivelSeguridad = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === 'seguridad')?.nivel || 1;

    const costoArmasTotal = config.costoArmas * cantidad;
    const costoMunicionTotal = config.costoMunicion * cantidad;
    const costoDolaresTotal = config.costoDolares * cantidad;

    // Usamos la misma fórmula de tiempo que las tropas normales, pero con el nivel de seguridad
    const tiempoTotal = calcularTiempoReclutamiento(config, cantidad, nivelSeguridad);
  
    if (
      propiedadActual.armas < costoArmasTotal ||
      propiedadActual.municion < costoMunicionTotal ||
      propiedadActual.dolares < costoDolaresTotal
    ) {
      return { error: 'No tienes suficientes recursos para este entrenamiento.' };
    }
  
    try {
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(fechaInicio.getTime() + tiempoTotal * 1000);

      await prisma.$transaction([
        prisma.propiedad.update({
          where: { id: propiedadId },
          data: {
            armas: { decrement: costoArmasTotal },
            municion: { decrement: costoMunicionTotal },
            dolares: { decrement: costoDolaresTotal },
          },
        }),
        prisma.colaReclutamiento.create({
            data: {
                propiedadId: propiedadId,
                tropaId: tropaId,
                cantidad: cantidad,
                fechaInicio: fechaInicio,
                fechaFinalizacion: fechaFinalizacion
            }
        })
      ]);
  
      revalidatePath('/security');
      revalidatePath('/overview'); 
      revalidatePath('/(dashboard)/layout', 'layout');
  
      return { success: `¡El entrenamiento de ${cantidad} x ${config.nombre} ha comenzado!` };
    } catch (error) {
      console.error('Error durante la transacción de entrenamiento de seguridad:', error);
      return { error: 'Ocurrió un error en el servidor al intentar entrenar la seguridad.' };
    }
}
