import type { ConfiguracionEntrenamiento } from '@prisma/client';

export function calcularCostosEntrenamiento(
  nivel: number,
  config: ConfiguracionEntrenamiento
): { armas: number; municion: number; dolares: number } {
  if (nivel <= 0) {
    return { armas: config.costoArmas, municion: config.costoMunicion, dolares: config.costoDolares };
  }

  // Factor de costo fijo de 1.5 para todos los entrenamientos
  const factor = 1.5;

  const costoArmas = Math.floor(config.costoArmas * Math.pow(factor, nivel - 1));
  const costoMunicion = Math.floor(config.costoMunicion * Math.pow(factor, nivel - 1));
  const costoDolares = Math.floor(config.costoDolares * Math.pow(factor, nivel - 1));

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
