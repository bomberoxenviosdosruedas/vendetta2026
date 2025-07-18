import type { FullConfiguracionHabitacion, FullPropiedad } from '../data';

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

  const factor = nivel * nivel;

  const costoArmas = Math.floor(config.costoArmas * factor);
  const costoMunicion = Math.floor(config.costoMunicion * factor);
  const costoDolares = Math.floor(config.costoDolares * factor);

  return { armas: costoArmas, municion: costoMunicion, dolares: costoDolares };
}

/**
 * Calcula el tiempo de construcción para una habitación a un nivel específico.
 */
export function calcularTiempoConstruccion(
  nivel: number,
  config: FullConfiguracionHabitacion,
  nivelOficinaJefe: number
): number {
  if (nivel <= 0) {
    return config.duracion;
  }

  if (config.id === 'oficina_del_jefe') {
    if (nivel === 1) {
        return config.duracion;
    }
    const tiempoBase = config.duracion;
    return Math.floor(((nivel * nivel) * tiempoBase) / (nivel - 1));
  }

  const divisorOficina = Math.max(1, nivelOficinaJefe);
  
  const tiempoFinal = ((nivel * nivel) / divisorOficina) * config.duracion;

  return Math.max(5, Math.floor(tiempoFinal));
}

function calcularProduccionArmeria(nivel: number): number {
  if (nivel <= 0) return 0;
  return Math.trunc(10 * Math.pow((nivel + 1) / 2, 2));
}

function calcularProduccionMunicion(nivel: number): number {
  if (nivel <= 0) return 0;
  return Math.trunc(10 * Math.pow((nivel + 1) / 2, 2) + 10);
}

function calcularProduccionCerveceria(nivel: number): number {
    if (nivel <= 0) return 0;
    const signo = Math.sign(nivel);
    const entero = Math.trunc(nivel / 2);
    const residuo = nivel % 2;
    const residuoMasUno = (nivel + 1) % 2;
  
    const calculoIntermedio = ((1 + entero) * entero + (entero + 1) * residuo) * 10 + (residuoMasUno * 2);
    return signo * calculoIntermedio * 5;
}

function calcularProduccionTaberna(nivel: number): number {
    if (nivel <= 0) return 0;
    return Math.trunc(2 * Math.pow((nivel + 1) / 2, 2));
}

function calcularProduccionContrabando(nivel: number): number {
    if (nivel <= 0) return 0;
    return Math.trunc(21 * Math.pow((nivel + 1) / 2, 2));
}

export function calcularProduccionRecurso(idHabitacion: string, nivel: number): number {
  switch (idHabitacion) {
    case 'armeria':
      return calcularProduccionArmeria(nivel);
    case 'almacen_de_municion':
      return calcularProduccionMunicion(nivel);
    case 'cerveceria':
      return calcularProduccionCerveceria(nivel);
    case 'taberna':
      return calcularProduccionTaberna(nivel);
    case 'contrabando':
      return calcularProduccionContrabando(nivel);
    default:
      return 0;
  }
}

/**
 * Calcula la producción total por segundo para todos los recursos de una propiedad.
 * @param propiedad - La propiedad para la cual calcular la producción.
 * @returns Un objeto con la producción por segundo de cada recurso.
 */
export function calcularProduccionTotalPorSegundo(propiedad: FullPropiedad): { armas: number, municion: number, alcohol: number, dolares: number } {
  let produccionArmasPorSegundo = 0;
  let produccionMunicionPorSegundo = 0;
  let produccionAlcoholPorSegundo = 0;
  let produccionDolaresPorSegundo = 0;

  propiedad.habitaciones.forEach(habitacion => {
      const config = habitacion.configuracion;
      if (!config.produccionRecurso || habitacion.nivel === 0) return;

      const produccionPorHora = calcularProduccionRecurso(config.id, habitacion.nivel);
      const produccionPorSegundo = produccionPorHora / 3600;

      switch (config.produccionRecurso) {
          case 'armas':
              produccionArmasPorSegundo += produccionPorSegundo;
              break;
          case 'municion':
              produccionMunicionPorSegundo += produccionPorSegundo;
              break;
          case 'alcohol':
              produccionAlcoholPorSegundo += produccionPorSegundo;
              break;
          case 'dolares':
          case 'dolares_por_alcohol':
              produccionDolaresPorSegundo += produccionPorSegundo;
              break;
      }
  });

  return {
    armas: produccionArmasPorSegundo,
    municion: produccionMunicionPorSegundo,
    alcohol: produccionAlcoholPorSegundo,
    dolares: produccionDolaresPorSegundo,
  };
}


/**
 * Calcula la capacidad de almacenamiento de recursos de una propiedad.
 * @param propiedad - La propiedad con sus habitaciones.
 * @returns Un objeto con la capacidad máxima de cada recurso.
 */
export function calculateStorageCapacity(propiedad: FullPropiedad): { armas: number, municion: number, alcohol: number, dolares: number } {
    const BASE_CAPACITY = 10000;
    const CAPACITY_PER_LEVEL = 150000;

    let capacidadArmas = BASE_CAPACITY;
    let capacidadMunicion = BASE_CAPACITY;
    let capacidadAlcohol = BASE_CAPACITY;
    let capacidadDolares = BASE_CAPACITY;

    const almacenArmas = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'almacen_de_armas');
    if (almacenArmas) {
        capacidadArmas += almacenArmas.nivel * CAPACITY_PER_LEVEL;
    }

    const depositoMunicion = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'deposito_de_municion');
    if (depositoMunicion) {
        capacidadMunicion += depositoMunicion.nivel * CAPACITY_PER_LEVEL;
    }

    const almacenAlcohol = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'almacen_de_alcohol');
    if (almacenAlcohol) {
        capacidadAlcohol += almacenAlcohol.nivel * CAPACITY_PER_LEVEL;
    }

    const cajaFuerte = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'caja_fuerte');
    if (cajaFuerte) {
        capacidadDolares += cajaFuerte.nivel * CAPACITY_PER_LEVEL;
    }

    return {
        armas: capacidadArmas,
        municion: capacidadMunicion,
        alcohol: capacidadAlcohol,
        dolares: capacidadDolares,
    };
}
