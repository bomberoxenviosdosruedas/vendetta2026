
import type { ConfiguracionTropa } from '@prisma/client';
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
  
    let ataqueBase = tropaConfig.ataque;
    let defensaBase = tropaConfig.defensa;
  
    const bonusAtaqueIds = tropaConfig.bonusAtaque || [];
    const bonusDefensaIds = tropaConfig.bonusDefensa || [];
  
    // Sumar los niveles de todos los entrenamientos relevantes para el ataque
    const sumaNivelesAtaque = bonusAtaqueIds.reduce((sum, id) => {
        return sum + (entrenamientosMap.get(id) || 0);
    }, 0);

    // Sumar los niveles de todos los entrenamientos relevantes para la defensa
    const sumaNivelesDefensa = bonusDefensaIds.reduce((sum, id) => {
        return sum + (entrenamientosMap.get(id) || 0);
    }, 0);

    // Aplicar la fórmula: ENTERO(D25*RAIZ(INICIO!D66+...)/10+D25)
    // que es equivalente a: Math.floor(base * (1 + Math.sqrt(sum_levels)/10))
    const ataqueActual = Math.floor(ataqueBase * (1 + Math.sqrt(sumaNivelesAtaque) / 10));
    const defensaActual = Math.floor(defensaBase * (1 + Math.sqrt(sumaNivelesDefensa) / 10));
  
    return {
      ataqueActual,
      defensaActual,
    };
  }
  