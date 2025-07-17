import type { ConfiguracionTropa } from '@prisma/client';

/**
 * Calcula el tiempo total de reclutamiento para una cantidad de tropas.
 * @param config - La configuración de la tropa.
 * @param cantidad - El número de tropas a reclutar.
 * @param nivelCampoEntrenamiento - El nivel actual del Campo de Entrenamiento del usuario.
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

  const tiempoPorUnidad = config.duracion;
  const tiempoTotalSinBonus = tiempoPorUnidad * cantidad;

  // Cada nivel del Campo de Entrenamiento reduce el tiempo un 5%, con un máximo de 75% de reducción.
  const bonusReduccion = Math.min(nivelCampoEntrenamiento * 0.05, 0.75);
  const tiempoFinal = tiempoTotalSinBonus * (1 - bonusReduccion);

  return Math.max(1, Math.floor(tiempoFinal)); // Aseguramos un tiempo mínimo de reclutamiento.
}
