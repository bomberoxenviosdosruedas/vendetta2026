
import type { ConfiguracionTropa } from "@prisma/client";

interface Coordenadas {
    ciudad: number;
    barrio: number;
    edificio: number;
}

/**
 * Convierte coordenadas del juego a un sistema de coordenadas virtual 2D.
 * @param coords Las coordenadas del juego (ciudad, barrio, edificio).
 * @returns Un objeto con las coordenadas virtuales de altura y anchura.
 */
function convertirACoordenadasVirtuales(coords: Coordenadas): { altura: number; anchura: number } {
    const altura = (coords.barrio - 1) * 15 + Math.ceil(coords.edificio / 17);
    const anchura = (coords.ciudad - 1) * 17 + (coords.edificio - (Math.floor((coords.edificio - 1) / 17) * 17));
    return { altura, anchura };
}

/**
 * Calcula la distancia euclidiana entre dos puntos en el mapa virtual.
 * @param origen Las coordenadas de origen del juego.
 * @param destino Las coordenadas de destino del juego.
 * @returns La distancia calculada como un valor numérico, sin redondear.
 */
export function calcularDistancia(origen: Coordenadas, destino: Coordenadas): number {
    const origenVirtual = convertirACoordenadasVirtuales(origen);
    const destinoVirtual = convertirACoordenadasVirtuales(destino);

    const diffAltura = origenVirtual.altura - destinoVirtual.altura;
    const diffAnchura = origenVirtual.anchura - destinoVirtual.anchura;

    const distancia = Math.sqrt(Math.pow(diffAltura, 2) + Math.pow(diffAnchura, 2));
    return distancia;
}

/**
 * Determina la velocidad de la flota encontrando la velocidad de la tropa más lenta.
 * @param tropasEnviadas Un array de las tropas en la misión.
 * @param configs Un mapa de todas las configuraciones de tropas para una búsqueda eficiente.
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
        return 86400 * 30; // 30 días como fallback.
    }
    
    const tiempoEnDias = (0.21989 * Math.pow(velocidadFlota, -0.2)) * Math.pow(distancia, 0.2);
    const duracionEnSegundos = Math.round(tiempoEnDias * 86400);

    return Math.max(10, duracionEnSegundos); // Mínimo de 10 segundos.
}
