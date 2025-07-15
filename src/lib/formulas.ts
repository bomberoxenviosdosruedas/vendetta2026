
'use server';

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

  // Los costos aumentan exponencialmente basados en el factor de costo por nivel.
  // Usamos nivel - 1 porque el costo base es para el nivel 1.
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
            // Reemplazo seguro de variables en la fórmula
            const formulaReemplazada = formula
                .replace(/nivel/g, String(nivel))
                .replace(/tiempo_base/g, String(tiempoBase))
                .replace(/nivel_oficina_jefe/g, String(nivelOficinaJefe));
            
            // Usamos un "eval" seguro a través del constructor de Function
            // Esto es más seguro que un eval directo porque no tiene acceso al scope local.
            const tiempoCalculado = new Function(`return ${formulaReemplazada}`)();
            return Math.floor(tiempoCalculado);
        } catch (error) {
            console.error(`Error al evaluar la fórmula de tiempo para ${config.id}:`, error);
            // Fallback a un cálculo simple si la fórmula falla
            return Math.floor(tiempoBase * Math.pow(1.5, nivel - 1) / nivelOficinaJefe);
        }
    }

    // Fallback si no hay fórmula definida
    return Math.floor(tiempoBase * Math.pow(1.5, nivel - 1));
}

/**
 * Calcula la producción de recursos por hora para una habitación en un nivel dado.
 * @param nivel - El nivel actual de la habitación.
 * @param config - La configuración completa de la habitación.
 * @returns La producción por hora del recurso principal de la habitación.
 */
export function calcularProduccion(
  nivel: number,
  config: FullConfiguracionHabitacion
): number {
  if (nivel <= 0 || !config.produccion || !config.escalado?.formulaAumentoProduccion) {
    return 0;
  }
  
  const produccionBase = config.produccion;
  const formula = config.escalado.formulaAumentoProduccion;

  try {
    const formulaReemplazada = formula
        .replace(/nivel/g, String(nivel))
        .replace(/produccion_base/g, String(produccionBase));

    const produccionCalculada = new Function(`return ${formulaReemplazada}`)();
    return produccionCalculada;
  } catch (error) {
    console.error(`Error al evaluar la fórmula de producción para ${config.id}:`, error);
    // Fallback a un cálculo simple si la fórmula falla
    return produccionBase * nivel;
  }
}
