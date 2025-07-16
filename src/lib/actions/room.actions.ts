'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { FullConfiguracionHabitacion } from "../data";
import { calcularCostosNivel, calcularTiempoConstruccion } from "../formulas/room-formulas";


export async function iniciarAmpliacion(habitacionId: string) {
    const user = await getSessionUser();
  
    if (!user || !user.progreso) {
      return { error: 'Usuario no autenticado.' };
    }

    if (user.colaConstruccion) {
        return { error: 'Ya hay una construcción en progreso.' };
    }
    
    // CORRECCIÓN: Acceder a las habitaciones a través de la primera propiedad del usuario.
    const propiedadActual = user.propiedades[0];
    if (!propiedadActual) {
        return { error: 'El usuario no tiene una propiedad asignada.' };
    }

    const habitacionUsuario = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === habitacionId);

    if (!habitacionUsuario) {
         return { error: 'Configuración de habitación de usuario no encontrada.' };
    }

    const config = habitacionUsuario.configuracion;
    if (!config) {
        return { error: 'Configuración de la habitación no encontrada.'}
    }

    const nivelActual = habitacionUsuario.nivel;
    const nivelSiguiente = nivelActual + 1;
    const nivelOficinaJefe = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === 'oficina_del_jefe')?.nivel || 1;
  
    const costos = calcularCostosNivel(nivelSiguiente, config as FullConfiguracionHabitacion);
    const tiempo = calcularTiempoConstruccion(nivelSiguiente, config as FullConfiguracionHabitacion, nivelOficinaJefe);
  
    if (
      user.progreso.armas < costos.armas ||
      user.progreso.municion < costos.municion ||
      user.progreso.dolares < costos.dolares
    ) {
      return { error: 'No tienes suficientes recursos para esta ampliación.' };
    }
  
    try {
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(fechaInicio.getTime() + tiempo * 1000);

      await prisma.$transaction([
        prisma.progresoUsuario.update({
          where: { userId: user.id },
          data: {
            armas: { decrement: costos.armas },
            municion: { decrement: costos.municion },
            dolares: { decrement: costos.dolares },
          },
        }),
        prisma.colaConstruccion.create({
            data: {
                userId: user.id,
                habitacionId: habitacionId,
                nivelDestino: nivelSiguiente,
                fechaInicio: fechaInicio,
                fechaFinalizacion: fechaFinalizacion
            }
        })
      ]);
  
      revalidatePath('/rooms');
      revalidatePath('/overview'); 
      revalidatePath('/(dashboard)/layout', 'layout');
  
      return { success: `¡La ampliación de ${config.nombre} a nivel ${nivelSiguiente} ha comenzado!` };
    } catch (error) {
      console.error('Error durante la transacción de ampliación:', error);
      return { error: 'Ocurrió un error en el servidor al intentar ampliar.' };
    }
  }
