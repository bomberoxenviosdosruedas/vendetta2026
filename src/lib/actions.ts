
'use server';

import prisma from "./prisma/prisma";
import type { UserWithProgress } from "./data";

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

  user.habitaciones.forEach(habitacion => {
    // Aquí asumimos que la producción en la configuración es por hora.
    // Lo convertimos a producción por segundo.
    const produccionPorHora = habitacion.configuracion.produccion;
    const produccionPorSegundo = produccionPorHora / 3600;

    switch (habitacion.configuracion.id) {
        case 'armeria':
            produccionArmasPorSegundo += produccionPorSegundo * habitacion.nivel;
            break;
        case 'almacen_de_municion':
            produccionMunicionPorSegundo += produccionPorSegundo * habitacion.nivel;
            break;
        case 'cerveceria':
            produccionAlcoholPorSegundo += produccionPorSegundo * habitacion.nivel;
            break;
        // Agrega más casos para otras habitaciones productivas si las hay
    }
  });

  const armasGeneradas = produccionArmasPorSegundo * segundosTranscurridos;
  const municionGenerada = produccionMunicionPorSegundo * segundosTranscurridos;
  const alcoholGenerado = produccionAlcoholPorSegundo * segundosTranscurridos;

  const nuevasArmas = user.progreso.armas + armasGeneradas;
  const nuevaMunicion = user.progreso.municion + municionGenerada;
  const nuevoAlcohol = user.progreso.alcohol + alcoholGenerado;
  
  // Por ahora, los dólares no se generan pasivamente de la misma manera
  const nuevosDolares = user.progreso.dolares;

  // Actualizar en una transacción
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

    // Devolver el estado del usuario actualizado
    return {
        ...user,
        progreso: progresoActualizado,
    };
  } catch (error) {
    console.error("Error al actualizar el progreso del usuario:", error);
    // Si falla la transacción, devolvemos el usuario sin actualizar para no romper la UI
    return user;
  }
}
