import type { ConfiguracionEntrenamiento } from '@prisma/client';

export function calcularCostosEntrenamiento(
  nivel: number,
  config: ConfiguracionEntrenamiento
): { armas: number; municion: number; dolares: number } {
  if (nivel <= 1) {
    return { armas: config.costoArmas, municion: config.costoMunicion, dolares: config.costoDolares };
  }

  // Nueva fórmula: (nivel * nivel) * costo_base
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
  
  const tiempoBase = config.duracion * Math.pow(1.5, nivel - 1);
  const bonusReduccion = Math.min(nivelEscuela * 0.02, 0.5);
  const tiempoFinal = tiempoBase * (1 - bonusReduccion);
  
  return Math.max(5, Math.floor(tiempoFinal));
}
