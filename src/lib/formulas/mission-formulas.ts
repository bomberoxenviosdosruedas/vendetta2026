
'use server'

import type { ConfiguracionTropa } from "@prisma/client";

interface Coordenadas {
    ciudad: number;
    barrio: number;
    edificio: number;
}

interface VirtualCoordinates {
    h: number; // altura
    w: number; // anchura
}

const LARGO_BARRIO = 15;
const ANCHO_BARRIO = 17;

/**
 * Convierte las coordenadas del juego a un sistema de coordenadas virtual (cartesiano).
 * @param coords - Las coordenadas de origen.
 * @returns Las coordenadas virtuales {h, w}.
 */
function getVirtualCoordinates(coords: Coordenadas): VirtualCoordinates {
    const { ciudad, barrio, edificio } = coords;

    const altura = (barrio - 1) * LARGO_BARRIO + Math.ceil(edificio / ANCHO_BARRIO);
    const anchura = (ciudad - 1) * ANCHO_BARRIO + (edificio - (Math.floor((edificio - 1) / ANCHO_BARRIO) * ANCHO_BARRIO));

    return { h: altura, w: anchura };
}

/**
 * Calcula la distancia euclidiana entre dos puntos usando coordenadas virtuales.
 * @param origen Las coordenadas de origen.
 * @param destino Las coordenadas de destino.
 * @returns La distancia calculada como un valor numérico flotante.
 */
export async function calcularDistancia(origen: Coordenadas, destino: Coordenadas): Promise<number> {
    const vOrigen = getVirtualCoordinates(origen);
    const vDestino = getVirtualCoordinates(destino);

    const deltaH = vOrigen.h - vDestino.h;
    const deltaW = vOrigen.w - vDestino.w;

    const distancia = Math.sqrt(Math.pow(deltaH, 2) + Math.pow(deltaW, 2));

    return distancia;
}

/**
 * Determina la velocidad de la flota encontrando la velocidad de la tropa más lenta.
 * @param tropasEnviadas Un array de las tropas en la misión.
 * @param configs Un mapa o array de todas las configuraciones de tropas.
 * @returns La velocidad de la tropa más lenta.
 */
export async function calcularVelocidadFlota(
    tropasEnviadas: { id: string; cantidad: number }[],
    configs: Map<string, ConfiguracionTropa>
): Promise<number> {
    let velocidadMasLenta = Infinity;
    
    for (const tropa of tropasEnviadas) {
        if (tropa.cantidad > 0) {
            const config = configs.get(tropa.id);
            if (config && config.velocidad < velocidadMasLenta) {
                velocidadMasLenta = config.velocidad;
            }
        }
    }
    return velocidadMasLenta === Infinity ? 1000 : velocidadMasLenta;
}


/**
 * Calcula la duración del viaje en segundos.
 * @param distancia La distancia calculada con calcularDistancia (valor no redondeado).
 * @param velocidadFlota La velocidad de la tropa más lenta en la misión.
 * @returns La duración del viaje en segundos.
 */
export async function calcularDuracionViaje(distancia: number, velocidadFlota: number): Promise<number> {
    if (velocidadFlota <= 0) {
        return 86400 * 30; // 30 días como fallback
    }
    
    // Formula: (0.21989 * velocidad^-0.2) * distancia^0.2
    // Esto es equivalente a (0.21989 * (distancia / velocidad)^0.2)
    const factorBase = 0.21989;
    const duracionEnHoras = factorBase * Math.pow(velocidadFlota, -0.2) * Math.pow(distancia, 0.2);

    const duracionEnSegundos = duracionEnHoras * 3600;

    return Math.max(10, Math.floor(duracionEnSegundos)); // Mínimo 10 segundos
}
