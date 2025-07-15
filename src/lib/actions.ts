
'use server';

import prisma from "./prisma/prisma";
import type { UserWithProgress } from "./data";
import { getRoomScalingRules } from "./data";

export async function obtenerEstadoJuegoActualizado(user: UserWithProgress) {
  if (!user || !user.progreso) {
    // This check is now more of a safeguard, as the layout should prevent this.
    throw new Error("Usuario no válido o sin progreso para actualizar.");
  }
  
  const ahora = new Date();
  const ultimaActualizacion = new Date(user.progreso.ultimaActualizacion);
  const segundosTranscurridos = Math.floor((ahora.getTime() - ultimaActualizacion.getTime()) / 1000);

  if (segundosTranscurridos <= 0) {
    return user;
  }
  
  // Calcular producción por segundo
  let produccionArmasPorSegundo = 0;
  let produccionMunicionPorSegundo = 0;
  let produccionAlcoholPorSegundo = 0;

  const scalingRules = await getRoomScalingRules();
  const nivelOficinaJefe = user.habitaciones.find(h => h.configuracionHabitacionId === 'oficina_del_jefe')?.nivel || 1;

  user.habitaciones.forEach(habitacion => {
    const config = habitacion.configuracion;
    const rules = scalingRules[config.id];
    
    if (!rules || !rules.produccion_recurso) return;

    let produccionBase = 0;
    try {
      // Usar eval de forma segura para calcular la producción basada en fórmulas
      const nivel = habitacion.nivel;
      produccionBase = eval(rules.formula_aumento_produccion.replace(/nivel/g, nivel.toString()).replace(/nivel_oficina_jefe/g, nivelOficinaJefe.toString()).replace('produccion_base', config.produccion.toString()));
    } catch (e) {
      console.error(`Error evaluando formula para ${config.id}: ${e}`);
      produccionBase = config.produccion * habitacion.nivel;
    }
    
    const produccionPorHora = produccionBase;
    const produccionPorSegundo = produccionPorHora / 3600;

    switch (rules.produccion_recurso) {
        case 'armas':
            produccionArmasPorSegundo += produccionPorSegundo;
            break;
        case 'municion':
            produccionMunicionPorSegundo += produccionPorSegundo;
            break;
        case 'alcohol':
            produccionAlcoholPorSegundo += produccionPorSegundo;
            break;
    }
  });

  const armasGeneradas = produccionArmasPorSegundo * segundosTranscurridos;
  const municionGenerada = produccionMunicionPorSegundo * segundosTranscurridos;
  const alcoholGenerado = produccionAlcoholPorSegundo * segundosTranscurridos;

  const nuevasArmas = user.progreso.armas + armasGeneradas;
  const nuevaMunicion = user.progreso.municion + municionGenerada;
  const nuevoAlcohol = user.progreso.alcohol + alcoholGenerado;
  
  const nuevosDolares = user.progreso.dolares;

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
