import type { FullConfiguracionHabitacion } from './data';

/**
 * Calcula los costos de recursos para construir o mejorar una habitación a un nivel específico.
 * @param nivel - El nivel objetivo para el que se calculan los costos.
 * @param config - La configuración completa de la habitación, incluyendo las reglas de escalado.
 * @returns Un objeto con los costos de armas, munición y dólares.
 */
export function calcularCostosNivel(
  nivel: number,
  config: FullConfiguracionHabitacion
): { armas: number; municion: number; dolares: number } {
  if (nivel <= 0) {
    return { armas: config.costoArmas, municion: config.costoMunicion, dolares: config.costoDolares };
  }

  const factor = config.escalado?.factorCostoPorNivel ?? 1.0;

  const costoArmas = Math.floor(config.costoArmas * Math.pow(factor, nivel - 1));
  const costoMunicion = Math.floor(config.costoMunicion * Math.pow(factor, nivel - 1));
  const costoDolares = Math.floor(config.costoDolares * Math.pow(factor, nivel - 1));

  return { armas: costoArmas, municion: costoMunicion, dolares: costoDolares };
}

/**
 * Calcula el tiempo de construcción para una habitación a un nivel específico.
 * @param nivel - El nivel objetivo para el que se calcula el tiempo.
 * @param config - La configuración completa de la habitación.
 * @param nivelOficinaJefe - El nivel actual de la Oficina del Jefe del usuario.
 * @returns El tiempo de construcción en segundos.
 */
export function calcularTiempoConstruccion(
  nivel: number,
  config: FullConfiguracionHabitacion,
  nivelOficinaJefe: number
): number {
  if (nivel <= 0) {
    return config.duracion;
  }

  // La Oficina del Jefe tiene su propia fórmula de tiempo más simple.
  if (config.id === 'oficina_del_jefe') {
    // Tiempo aumenta un 15% por cada nivel.
    return Math.floor(config.duracion * Math.pow(1.5, nivel - 1));
  }

  // --- Lógica de cálculo para el resto de habitaciones ---

  // Paso 1: Calcular el Tiempo Base
  const tiempoBase = nivel * 60;

  // Paso 2: Determinar el Factor Multiplicador
  const factorMultiplicador = 1.2 + Math.floor((nivel - 1) / 10) * 0.1;

  // Paso 3: Calcular el Tiempo Final de Aumento (antes del bonus)
  const tiempoFinalAumento = tiempoBase * factorMultiplicador;

  // Paso 4: Aplicar el bonus de la Oficina del Jefe
  // Cada nivel de la oficina reduce el tiempo un 2%, con un máximo de 50% de reducción.
  const bonusReduccion = Math.min(nivelOficinaJefe * 0.02, 0.5); 
  const tiempoFinalConBonus = tiempoFinalAumento * (1 - bonusReduccion);

  return Math.max(5, Math.floor(tiempoFinalConBonus)); // Aseguramos un tiempo mínimo de construcción.
}
