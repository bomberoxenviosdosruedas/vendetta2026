
'use server'

import type { ConfiguracionTropa } from "@prisma/client";

interface Coordenadas {
    ciudad: number;
    barrio: number;
    edificio: number;
}

/**
 * Calcula la distancia del juego entre dos puntos.
 * La distancia se basa en una jerarquía: ciudad > barrio > edificio.
 * @param origen Las coordenadas de origen.
 * @param destino Las coordenadas de destino.
 * @returns La distancia calculada como un valor numérico.
 */
export async function calcularDistancia(origen: Coordenadas, destino: Coordenadas): Promise<number> {
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
        const config = configs.get(tropa.id);
        if (config && config.velocidad < velocidadMasLenta) {
            velocidadMasLenta = config.velocidad;
        }
    }

    // Si por alguna razón no se encuentra ninguna tropa (no debería pasar),
    // devuelve una velocidad base para evitar división por cero.
    return velocidadMasLenta === Infinity ? 1000 : velocidadMasLenta;
}


/**
 * Calcula la duración del viaje en segundos.
 * @param distancia La distancia calculada con calcularDistancia.
 * @param velocidadFlota La velocidad de la tropa más lenta en la misión.
 * @returns La duración del viaje en segundos.
 */
export async function calcularDuracionViaje(distancia: number, velocidadFlota: number): Promise<number> {
    if (velocidadFlota <= 0) {
        // Prevenir división por cero. Devuelve un tiempo máximo o un error.
        return 86400 * 30; // 30 días
    }

    const duracion = Math.round(
        Math.pow((distancia * 3.3479) / velocidadFlota, 0.2) * 3600
    );

    return Math.max(10, duracion); // Asegura una duración mínima de 10 segundos.
}
