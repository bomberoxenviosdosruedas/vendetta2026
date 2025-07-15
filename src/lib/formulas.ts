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
    const tiempoBase = config.duracion;
    if (nivel <= 1) {
        return tiempoBase;
    }

    const formula = config.escalado?.formulaTiempo;
    if (formula) {
        try {
            const formulaReemplazada = formula
                .replace(/nivel/g, String(nivel))
                .replace(/tiempo_base/g, String(tiempoBase))
                .replace(/nivel_oficina_jefe/g, String(Math.max(1, nivelOficinaJefe)));
            
            const tiempoCalculado = new Function(`return ${formulaReemplazada}`)();
            return Math.floor(tiempoCalculado);
        } catch (error) {
            console.error(`Error al evaluar la fórmula de tiempo para ${config.id}:`, error);
            return Math.floor(tiempoBase * Math.pow(1.5, nivel - 1) / Math.max(1, nivelOficinaJefe));
        }
    }

    return Math.floor(tiempoBase * Math.pow(1.5, nivel - 1));
}
