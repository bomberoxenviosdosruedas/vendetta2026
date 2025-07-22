
'use server';

import prisma from "./prisma/prisma";
import type { UserWithProgress } from "./data";
import { getRoomScalingRules } from "./data";
import { calcularProduccionTotalPorSegundo, calculateStorageCapacity } from "./formulas/room-formulas";

export async function obtenerEstadoJuegoActualizado(user: UserWithProgress) {
  if (!user) {
    throw new Error("Usuario no válido para actualizar.");
  }
  
  const ahora = new Date();

  const propiedadesActualizadas = await Promise.all(
    user.propiedades.map(async (propiedad) => {
      const ultimaActualizacion = new Date(propiedad.ultimaActualizacion);
      const segundosTranscurridos = Math.floor((ahora.getTime() - ultimaActualizacion.getTime()) / 1000);

      if (segundosTranscurridos <= 0) {
        return propiedad;
      }
      
      const capacidad = calculateStorageCapacity(propiedad);

      const produccionPorSegundo = calcularProduccionTotalPorSegundo(propiedad);

      const armasGeneradas = produccionPorSegundo.armas * segundosTranscurridos;
      const municionGenerada = produccionPorSegundo.municion * segundosTranscurridos;
      const alcoholGenerado = produccionPorSegundo.alcohol * segundosTranscurridos;
      const dolaresGenerados = produccionPorSegundo.dolares * segundosTranscurridos;

      const nuevasArmas = Math.min(capacidad.armas, propiedad.armas + armasGeneradas);
      const nuevaMunicion = Math.min(capacidad.municion, propiedad.municion + municionGenerada);
      const nuevoAlcohol = Math.min(capacidad.alcohol, propiedad.alcohol + alcoholGenerado);
      const nuevosDolares = Math.min(capacidad.dolares, propiedad.dolares + dolaresGenerados);

      try {
        const propiedadActualizada = await prisma.propiedad.update({
            where: { id: propiedad.id },
            data: {
                armas: nuevasArmas,
                municion: nuevaMunicion,
                alcohol: nuevoAlcohol,
                dolares: nuevosDolares,
                ultimaActualizacion: ahora,
            },
            include: {
              habitaciones: {
                include: {
                  configuracion: true,
                }
              }
            }
        });
        return propiedadActualizada;
      } catch (error) {
        console.error(`Error actualizando recursos para propiedad ${propiedad.id}:`, error);
        return propiedad; // Devuelve la propiedad original en caso de error
      }
    })
  );

  return {
    ...user,
    propiedades: propiedadesActualizadas,
  };
}
