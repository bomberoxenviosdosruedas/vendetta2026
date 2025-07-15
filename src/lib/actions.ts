
'use server';

import prisma from "./prisma/prisma";
import type { UserWithProgress } from "./data";
import { getRoomScalingRules } from "./data";

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

  const scalingRules = await getRoomScalingRules();
  const nivelOficinaJefe = user.habitaciones.find(h => h.configuracionHabitacionId === 'oficina_del_jefe')?.nivel || 1;

  user.habitaciones.forEach(habitacion => {
    const config = habitacion.configuracion;
    const rules = scalingRules[config.id];
    
    if (!rules || !rules.produccion_recurso || habitacion.nivel === 0) return;

    let produccionBase = 0;
    try {
      const nivel = habitacion.nivel;
      // Reemplazamos eval con cálculos seguros
      switch (config.id) {
        case 'armeria':
          produccionBase = Math.trunc(Math.pow((nivel + 1) / 2, 2) * 10);
          break;
        case 'almacen_de_municion':
            produccionBase = Math.trunc(Math.pow((nivel + 1) / 2, 2) * 10 + 10);
          break;
        case 'cerveceria':
            produccionBase = Math.trunc(config.produccion * Math.pow(1.2, nivel - 1));
          break;
        case 'taberna':
            produccionBase = Math.trunc(Math.pow((nivel + 1) / 2, 2) * 2);
            break;
        case 'contrabando':
            produccionBase = Math.trunc(Math.pow((nivel + 1) / 2, 2) * 21);
          break;
        default:
          produccionBase = config.produccion * nivel;
      }
    } catch (e) {
      console.error(`Error calculando produccion para ${config.id}: ${e}`);
      produccionBase = config.produccion * habitacion.nivel; // Fallback
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

  const nuevasArmas = (user.progreso.armas || 0) + armasGeneradas;
  const nuevaMunicion = (user.progreso.municion || 0) + municionGenerada;
  const nuevoAlcohol = (user.progreso.alcohol || 0) + alcoholGenerado;
  
  const nuevosDolares = user.progreso.dolares || 0;

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
