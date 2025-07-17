import type { ConfiguracionEntrenamiento } from '@prisma/client';

export function calcularCostosEntrenamiento(
  nivel: number,
  config: ConfiguracionEntrenamiento
): { armas: number; municion: number; dolares: number } {
  if (nivel <= 1) {
    return { armas: config.costoArmas, municion: config.costoMunicion, dolares: config.costoDolares };
  }

  const factor = nivel * nivel;

  const costoArmas = Math.floor(config.costoArmas * factor);
  const costoMunicion = Math.floor(config.costoMunicion * factor);
  const costoDolares = Math.floor(config.costoDolares * factor);

  return { armas: costoArmas, municion: costoMunicion, dolares: costoDolares };
}

export function calcularTiempoEntrenamiento(
  nivel: number,
  config: ConfiguracionEntrenamiento,
  nivelEscuela: number
): number {
  if (nivel <= 0) {
    return config.duracion;
  }
  
  // La fórmula es (nivel_objetivo * duracion_base) / nivel_escuela
  // Aseguramos que nivelEscuela sea al menos 1 para evitar división por cero.
  const divisorNivelEscuela = Math.max(1, nivelEscuela);

  const tiempoFinal = (nivel * config.duracion) / divisorNivelEscuela;
  
  return Math.max(5, Math.floor(tiempoFinal)); // Asegura un tiempo mínimo de 5 segundos.
}
