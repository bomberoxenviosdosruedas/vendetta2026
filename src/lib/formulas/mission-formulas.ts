
import type { ConfiguracionTropa } from "@prisma/client";

interface Coordenadas {
    ciudad: number;
    barrio: number;
    edificio: number;
}

/**
 * Calcula la distancia del juego entre dos puntos basado en una jerarquía.
 * @param origen Las coordenadas de origen.
 * @param destino Las coordenadas de destino.
 * @returns La distancia calculada como un valor numérico.
 */
export function calcularDistancia(origen: Coordenadas, destino: Coordenadas): number {
    if (origen.ciudad !== destino.ciudad) {
        return Math.abs(origen.ciudad - destino.ciudad) * 20000;
    }
    if (origen.barrio !== destino.barrio) {
        return Math.abs(origen.barrio - destino.barrio) * 5000;
    }
    if (origen.edificio !== destino.edificio) {
        return Math.abs(origen.edificio - destino.edificio) * 1000;
    }
    // Si las coordenadas son idénticas, la distancia es una base mínima.
    return 1000;
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
 * Calcula la duración del viaje en segundos usando la nueva fórmula.
 * @param distancia La distancia calculada con calcularDistancia.
 * @param velocidadFlota La velocidad de la tropa más lenta en la misión.
 * @returns La duración del viaje en segundos.
 */
export function calcularDuracionViaje(distancia: number, velocidadFlota: number): number {
    if (velocidadFlota <= 0) {
        return 86400 * 30; // 30 días como fallback para evitar división por cero.
    }
    
    // Duración en Segundos = redondear( ( (Distancia * 3.3479) / Velocidad de la Flota ) ^ 0.2 * 3600 )
    const baseCalculo = (distancia * 3.3479) / velocidadFlota;
    const duracionEnSegundos = Math.round(Math.pow(baseCalculo, 0.2) * 3600);

    return Math.max(10, duracionEnSegundos); // Mínimo de 10 segundos.
}
