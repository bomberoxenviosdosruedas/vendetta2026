/**
 * Resolución de imágenes de configuración (habitaciones, entrenamientos y tropas).
 *
 * Las imágenes del juego viven en /public/img/{hab,ent,tpr} como webp:
 *   - Entrenamientos:  /img/ent/F{n}K.webp   (F1K..F16K)
 *   - Habitaciones:    /img/hab/B{n}K.webp   (B1K..B15K)
 *   - Tropas ataque:   /img/tpr/U{n}K.webp   (U1K..U16K)
 *   - Tropas defensa:  /img/tpr/S{n}K.webp   (S1K..S5K)
 *
 * La base de datos (datosactuales/*.json) aún puede contener rutas legacy:
 *   - /img/entrenamientos/F{n}.png           -> /img/ent/F{n}K.webp
 *   - /img/habitaciones/B{n}K.png            -> /img/hab/B{n}K.webp
 *   - /img/U{n}K.gif                         -> /img/tpr/U{n}K.webp
 *   - /img/defensa/T{n}.gif                  -> /img/tpr/S{n}K.webp
 *
 * Función pura (sin Prisma, sin side-effects), idempotente: si la URL ya apunta
 * a un webp válido del juego se devuelve tal cual; cualquier otra URL (placeholders
 * remotos, etc.) también se devuelve intacta.
 */
export function resolveConfigImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Ya resuelta a las imágenes webp del juego.
  if (/\/img\/(hab|ent|tpr)\/[A-Za-z0-9_-]+\.webp/i.test(url)) return url;

  // Entrenamientos: /img/entrenamientos/F{n}.png -> /img/ent/F{n}K.webp
  const entrenamiento = url.match(/\/img\/entrenamientos\/F(\d+)\.png/i);
  if (entrenamiento) return `/img/ent/F${entrenamiento[1]}K.webp`;

  // Habitaciones: /img/habitaciones/B{n}K.png -> /img/hab/B{n}K.webp
  const habitacion = url.match(/\/img\/habitaciones\/(B\d+K)\.png/i);
  if (habitacion) return `/img/hab/${habitacion[1]}.webp`;

  // Tropas de ataque / transporte: /img/U{n}K.gif -> /img/tpr/U{n}K.webp
  const tropaAtaque = url.match(/\/img\/(U\d+K)\.gif/i);
  if (tropaAtaque) return `/img/tpr/${tropaAtaque[1]}.webp`;

  // Tropas de defensa: /img/defensa/T{n}.gif -> /img/tpr/S{n}K.webp
  const tropaDefensa = url.match(/\/img\/defensa\/T(\d)\.gif/i);
  if (tropaDefensa) return `/img/tpr/S${tropaDefensa[1]}K.webp`;

  // Cualquier otra URL se devuelve intacta.
  return url;
}