import type { UserWithProgress } from "../data";

/**
 * Calcula los puntos totales que aportan las habitaciones de un usuario.
 */
export function calcularPuntosHabitaciones(user: UserWithProgress): number {
  if (!user.propiedades || user.propiedades.length === 0) return 0;

  return user.propiedades.reduce((totalPropiedades, propiedad) => {
    const puntosPropiedad = propiedad.habitaciones.reduce((totalHabitaciones, habitacion) => {
      // Puntos = (Puntos base de la habitación * nivel)
      const puntos = habitacion.configuracion.puntos * habitacion.nivel;
      return totalHabitaciones + puntos;
    }, 0);
    return totalPropiedades + puntosPropiedad;
  }, 0);
}

/**
 * Calcula los puntos totales que aportan las tropas de un usuario.
 */
export function calcularPuntosTropas(user: UserWithProgress): number {
  if (!user.tropas) return 0;
  
  return user.tropas.reduce((total, tropa) => {
    // Puntos = (Puntos base de la tropa * cantidad)
    const puntos = tropa.configuracion.puntos * tropa.cantidad;
    return total + puntos;
  }, 0);
}

/**
 * Calcula los puntos totales que aportan los entrenamientos de un usuario.
 */
export function calcularPuntosEntrenamientos(user: UserWithProgress): number {
  if (!user.entrenamientos) return 0;

  return user.entrenamientos.reduce((total, entrenamiento) => {
    // Puntos = (Puntos base del entrenamiento * nivel)
    const puntos = entrenamiento.configuracion.puntos * entrenamiento.nivel;
    return total + puntos;
  }, 0);
}
