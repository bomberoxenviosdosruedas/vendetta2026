

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
