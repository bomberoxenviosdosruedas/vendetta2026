
import type { ConfiguracionHabitacion } from '@prisma/client';
import type { FullConfiguracionHabitacion } from './data';

/**
 * Calcula los costos de recursos para construir o mejorar una habitación a un nivel específico.
 */
export function calcularCostosNivel(
  nivel: number,
  config: FullConfiguracionHabitacion
): { armas: number; municion: number; dolares: number } {
  if (nivel <= 1) {
    return { armas: config.costoArmas, municion: config.costoMunicion, dolares: config.costoDolares };
  }

  // La fórmula de costo es exponencial, usando el nivel al cuadrado como factor.
  const factor = nivel * nivel;

  const costoArmas = Math.floor(config.costoArmas * factor);
  const costoMunicion = Math.floor(config.costoMunicion * factor);
  const costoDolares = Math.floor(config.costoDolares * factor);

  return { armas: costoArmas, municion: costoMunicion, dolares: costoDolares };
}

/**
 * Calcula el tiempo de construcción para una habitación a un nivel específico.
 * El tiempo se reduce por el nivel de la Oficina del Jefe.
 */
export function calcularTiempoConstruccion(
  nivel: number,
  config: ConfiguracionHabitacion,
  nivelOficinaJefe: number
): number {
  if (nivel <= 0) {
    return config.duracion;
  }

  // Caso especial para la Oficina del Jefe, su tiempo de mejora no se reduce a sí mismo.
  if (config.id === 'oficina_del_jefe') {
    if (nivel === 1) {
        return config.duracion;
    }
    // Fórmula de tiempo específica para la oficina
    const tiempoBase = config.duracion;
    return Math.floor(((nivel * nivel) * tiempoBase) / (nivel - 1));
  }

  // Para otras habitaciones, el nivel de la oficina reduce el tiempo.
  const divisorOficina = Math.max(1, nivelOficinaJefe);
  
  const tiempoFinal = ((nivel * nivel) / divisorOficina) * config.duracion;

  return Math.max(5, Math.floor(tiempoFinal)); // Mínimo de 5 segundos
}
