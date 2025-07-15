
import type { UserWithProgress } from "./data";

/**
 * Producción de la Armería.
 * Equivalente a: =ENTERO(10*SUMA.CUADRADOS((nivel+1)/2))
 */
function calcularProduccionArmeria(nivel: number): number {
  if (nivel <= 0) return 0;
  return Math.trunc(10 * Math.pow((nivel + 1) / 2, 2));
}

/**
 * Producción del Almacén de munición.
 * Equivalente a: =ENTERO(10*SUMA.CUADRADOS((nivel+1)/2)+10)
 */
function calcularProduccionMunicion(nivel: number): number {
  if (nivel <= 0) return 0;
  return Math.trunc(10 * Math.pow((nivel + 1) / 2, 2) + 10);
}

/**
 * Producción de la Cervecería.
 * Equivalente a: =((SIGNO(nivel)*(((1+ENTERO(nivel/2))*ENTERO(nivel/2)+(ENTERO(nivel/2)+1)*RESIDUO(nivel;2))*10+(RESIDUO(nivel+1;2)*2))))*5
 */
function calcularProduccionCerveceria(nivel: number): number {
    if (nivel <= 0) return 0;
    const signo = Math.sign(nivel);
    const entero = Math.trunc(nivel / 2);
    const residuo = nivel % 2;
    const residuoMasUno = (nivel + 1) % 2;
  
    const calculoIntermedio = ((1 + entero) * entero + (entero + 1) * residuo) * 10 + (residuoMasUno * 2);
    return signo * calculoIntermedio * 5;
}

/**
 * Producción de la Taberna.
 * Equivalente a: =ENTERO(2*SUMA.CUADRADOS((nivel+1)/2))
 */
function calcularProduccionTaberna(nivel: number): number {
    if (nivel <= 0) return 0;
    return Math.trunc(2 * Math.pow((nivel + 1) / 2, 2));
}

/**
 * Producción de Contrabando.
 * Equivalente a: =ENTERO(21*SUMA.CUADRADOS((nivel+1)/2))
 */
function calcularProduccionContrabando(nivel: number): number {
    if (nivel <= 0) return 0;
    return Math.trunc(21 * Math.pow((nivel + 1) / 2, 2));
}


/**
 * Calcula la producción de un recurso para una habitación específica.
 * @param idHabitacion - El ID de la configuración de la habitación.
 * @param nivel - El nivel actual de la habitación.
 * @returns La producción por hora.
 */
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
      return 0; // O un valor base si otras habitaciones producen algo.
  }
}

/**
 * Calcula la producción total por segundo para todos los recursos del usuario.
 * @param user - El objeto de usuario con su progreso y habitaciones.
 * @returns Un objeto con la producción por segundo de cada recurso.
 */
export function calcularProduccionTotalPorSegundo(user: UserWithProgress): { armas: number, municion: number, alcohol: number, dolares: number } {
  let produccionArmasPorSegundo = 0;
  let produccionMunicionPorSegundo = 0;
  let produccionAlcoholPorSegundo = 0;
  let produccionDolaresPorSegundo = 0;

  user.habitaciones.forEach(habitacion => {
    const config = habitacion.configuracion;
    if (!config.escalado?.produccionRecurso || habitacion.nivel === 0) return;

    const produccionPorHora = calcularProduccionRecurso(config.id, habitacion.nivel);
    const produccionPorSegundo = produccionPorHora / 3600;

    switch (config.escalado.produccionRecurso) {
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
        case 'dolares_por_alcohol': // Ambos contribuyen a dólares
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
