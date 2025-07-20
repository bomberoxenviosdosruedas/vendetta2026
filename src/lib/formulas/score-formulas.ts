

import type { UserWithProgress } from "../data";
import prisma from "../prisma/prisma";

export function calcularPuntosHabitaciones(user: UserWithProgress): number {
  if (!user.propiedades || user.propiedades.length === 0) return 0;

  return user.propiedades.reduce((totalPropiedades, propiedad) => {
    const puntosPropiedad = propiedad.habitaciones.reduce((totalHabitaciones, habitacion) => {
      const puntos = habitacion.configuracion.puntos * habitacion.nivel;
      return totalHabitaciones + puntos;
    }, 0);
    return totalPropiedades + puntosPropiedad;
  }, 0);
}

export function calcularPuntosTropas(user: UserWithProgress): number {
  if (!user.propiedades) return 0;
  
  return user.propiedades.reduce((totalPropiedades, propiedad) => {
    if (!propiedad.TropaUsuario) return totalPropiedades;
    const puntosPropiedad = propiedad.TropaUsuario.reduce((totalTropas, tropa) => {
      const puntos = tropa.configuracion.puntos * tropa.cantidad;
      return totalTropas + puntos;
    }, 0);
    return totalPropiedades + puntosPropiedad;
  }, 0);
}

export function calcularPuntosEntrenamientos(user: UserWithProgress): number {
  if (!user.entrenamientos) return 0;

  return user.entrenamientos.reduce((total, entrenamiento) => {
    const puntos = entrenamiento.configuracion.puntos * entrenamiento.nivel;
    return total + puntos;
  }, 0);
}

export async function calcularPoderAtaque(totalEdificios: number, honor: number): Promise<number> {
    if (totalEdificios < 5) return 100;
    if (honor > 8) honor = 8;

    const poder = await prisma.poderAtaque.findUnique({
        where: { propiedades_honor: { propiedades: totalEdificios, honor: honor } }
    });

    if (poder) {
        return poder.modificador;
    }

    // Si no se encuentra un valor exacto (p.ej. para más de 100 propiedades), se interpola.
    if (totalEdificios > 100) {
        const poderBase = await prisma.poderAtaque.findUnique({
            where: { propiedades_honor: { propiedades: 100, honor: honor } }
        });
        if (poderBase) {
            return Math.round(100 * poderBase.modificador / totalEdificios);
        }
        return 29; // Fallback
    }

    const base = Math.floor(totalEdificios / 5) * 5;
    const next = base + 5;

    const [poderBase, poderNext] = await Promise.all([
        prisma.poderAtaque.findUnique({ where: { propiedades_honor: { propiedades: base, honor: honor } } }),
        prisma.poderAtaque.findUnique({ where: { propiedades_honor: { propiedades: next, honor: honor } } })
    ]);
    
    if (poderBase && poderNext) {
        const rango = (poderBase.modificador - poderNext.modificador) / 5;
        return Math.round(poderBase.modificador - (rango * (totalEdificios - base)));
    }

    return 100; // Fallback final
}
