
'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { FullConfiguracionHabitacion } from "../data";
import { calcularCostosNivel, calcularTiempoConstruccion } from "../formulas/room-formulas";

export async function iniciarAmpliacion(propiedadId: string, habitacionId: string) {
    const user = await getSessionUser();
  
    if (!user) {
      return { error: 'Usuario no autenticado.' };
    }
    
    const propiedadActual = user.propiedades.find(p => p.id === propiedadId);
    if (!propiedadActual) {
        return { error: 'Propiedad no encontrada para este usuario.' };
    }

    const construccionesEnCola = propiedadActual.colaConstruccion;

    if (construccionesEnCola.length >= 5) {
        return { error: 'La cola de construcción está llena (máximo 5).' };
    }

    const habitacionUsuario = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === habitacionId);

    if (!habitacionUsuario) {
         return { error: 'Configuración de habitación de usuario no encontrada.' };
    }

    const config = habitacionUsuario.configuracion;
    if (!config) {
        return { error: 'Configuración de la habitación no encontrada.'}
    }
    
    const nivelBase = habitacionUsuario.nivel;
    const mejorasEnCola = construccionesEnCola.filter(c => c.habitacionId === habitacionId).length;
    const nivelSiguiente = nivelBase + mejorasEnCola + 1;

    const nivelOficinaJefe = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === 'oficina_del_jefe')?.nivel || 1;
  
    const costos = calcularCostosNivel(nivelSiguiente, config as FullConfiguracionHabitacion);
  
    if (
      propiedadActual.armas < costos.armas ||
      propiedadActual.municion < costos.municion ||
      propiedadActual.dolares < costos.dolares
    ) {
      return { error: 'No tienes suficientes recursos para esta ampliación.' };
    }

    const duracion = calcularTiempoConstruccion(nivelSiguiente, config, nivelOficinaJefe);
  
    try {
      await prisma.$transaction([
        prisma.propiedad.update({
          where: { id: propiedadId },
          data: {
            armas: { decrement: costos.armas },
            municion: { decrement: costos.municion },
            dolares: { decrement: costos.dolares },
          },
        }),
        prisma.colaConstruccion.create({
            data: {
                propiedadId: propiedadId,
                habitacionId: habitacionId,
                nivelDestino: nivelSiguiente,
                duracion: duracion,
                fechaInicio: null,
                fechaFinalizacion: null,
            }
        })
      ]);
  
      revalidatePath('/rooms');
      revalidatePath('/overview'); 
      revalidatePath('/(dashboard)/layout', 'layout');
  
      return { success: `¡${config.nombre} añadido a la cola de construcción!` };
    } catch (error) {
      console.error('Error durante la transacción de ampliación:', error);
      return { error: 'Ocurrió un error en el servidor al intentar ampliar.' };
    }
}
