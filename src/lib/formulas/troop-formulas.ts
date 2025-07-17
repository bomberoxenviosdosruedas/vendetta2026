import type { ConfiguracionTropa } from '@prisma/client';

/**
 * Calcula el tiempo total de reclutamiento para una cantidad de tropas.
 * La nueva fórmula es: (duracion / nivel_campo) * cantidad
 * @param config - La configuración de la tropa.
 * @param cantidad - El número de tropas a reclutar.
 * @param nivelCampoEntrenamiento - El nivel actual del Campo de Entrenamiento de la propiedad.
 * @returns El tiempo de reclutamiento total en segundos.
 */
export function calcularTiempoReclutamiento(
  config: ConfiguracionTropa,
  cantidad: number,
  nivelCampoEntrenamiento: number
): number {
  if (cantidad <= 0) {
    return 0;
  }

  // Aseguramos que el nivel del campo no sea menor que 1 para evitar división por cero.
  const divisorNivelCampo = Math.max(1, nivelCampoEntrenamiento);

  const tiempoPorUnidad = config.duracion / divisorNivelCampo;
  const tiempoTotal = tiempoPorUnidad * cantidad;

  return Math.max(1, Math.floor(tiempoTotal)); // Aseguramos un tiempo mínimo de reclutamiento.
}
