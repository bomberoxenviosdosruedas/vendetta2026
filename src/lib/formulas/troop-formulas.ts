import type { ConfiguracionEntrenamiento, ConfiguracionTropa } from '@prisma/client';
import type { UserWithProgress } from '../data';

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


export function calcularStatsTropaConBonus(
    tropaConfig: ConfiguracionTropa, 
    entrenamientos: UserWithProgress['entrenamientos']
  ): { ataqueActual: number, defensaActual: number } {
  
    const entrenamientosMap = new Map(entrenamientos.map(e => [e.configuracionEntrenamientoId, e.nivel]));
  
    let ataqueActual = tropaConfig.ataque;
    let defensaActual = tropaConfig.defensa;
  
    const bonusAtaqueIds = tropaConfig.bonusAtaque || [];
    const bonusDefensaIds = tropaConfig.bonusDefensa || [];
  
    let bonusAtaqueTotal = 0;
    for (const id of bonusAtaqueIds) {
      bonusAtaqueTotal += (entrenamientosMap.get(id) || 0);
    }
  
    let bonusDefensaTotal = 0;
    for (const id of bonusDefensaIds) {
      bonusDefensaTotal += (entrenamientosMap.get(id) || 0);
    }
  
    // Aplicar un 5% de bonus por cada nivel de entrenamiento relevante
    ataqueActual *= (1 + (bonusAtaqueTotal * 0.05));
    defensaActual *= (1 + (bonusDefensaTotal * 0.05));
  
    return {
      ataqueActual: Math.floor(ataqueActual),
      defensaActual: Math.floor(defensaActual),
    };
  }
  