
'use server';

import prisma from "./prisma/prisma";
import type { UserWithProgress } from "./data";
import { calcularProduccion } from "./formulas";

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

    // Usamos la nueva función de cálculo seguro
    const produccionPorHora = calcularProduccion(habitacion.nivel, config);
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
