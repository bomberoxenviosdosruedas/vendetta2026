# Prompt — Ajustar todo el proyecto al nuevo DESIGN.md

> Generado el 2026-09-23. Copiar y pegar tal cual en un agente de código (Claude / OpenCode con tools de edición).
> Referencias: `DESIGN.md` (raíz), `docs/ejemplo.html`, código real en `globals.css` / `design-tokens.css` / `tailwind.config.ts` / `src/app/layout.tsx`.

---

## PROMPT

Actuás como **Arquitecto Frontend Senior especializado en sistemas de diseño retro de juegos RTS de navegador** (estética Vendetta / OGame de 2004). Trabajás en el repo Vendetta (Next.js 16 App Router, TypeScript estricto, Tailwind 4, Shadcn UI) y leés y respetás `AGENTS.md` en la raíz.

### Objetivo

Migrar el frontend completo del juego — `src/app/` y los componentes de `src/components/` — al sistema de diseño de `DESIGN.md` (raíz del repo), cuya fuente de verdad visual es `docs/ejemplo.html`. El resultado debe verse y sentirse como `docs/ejemplo.html`: una sala de operaciones retro nocturna, densa, con bordes duros de 1px, degradados granate y tipografía pequeña en mayúsculas. **Nunca** un dashboard SaaS moderno. Todo esto **sin romper la lógica del juego, las rutas, las Server Actions ni los datos**.

### Fuentes de verdad (en orden de prioridad)

1. **`docs/ejemplo.html`** — la implementación de referencia: clases CSS `crimson-th`, `cell-dark`, `cell-darker`, `btn-tactical`, `btn-crimson`, `retro-border`; fuentes Space Grotesk / Space Mono / Work Sans; iconos Material Symbols Outlined; paleta hex exacta.
2. **`DESIGN.md`** (raíz) — reglas canónicas: paleta §2, tipografía §3, componentes §4, layout §5, responsive §6, motion §7, anti-patterns §8, checklist §9.
3. **Código real actual** — `globals.css`, `src/styles/design-tokens.css`, `tailwind.config.ts` ya están **parcialmente alineados** (fondo `#111111`, primary `#6C0000`, border `#333333`, muted `#bfbfbf`, radios 8/6/4/12, sombras `base/tactical/tactical-elevated`, tokens `--resource-*`). Verificá el código antes de asumir.

En caso de conflicto entre fuentes, prioridad: **ejemplo.html > DESIGN.md > código actual**.

### Alcance

- `src/app/layout.tsx` (fuentes), `src/app/globals.css`, `src/styles/design-tokens.css`, `tailwind.config.ts`.
- `src/components/dashboard/**` — todas las vistas y status cards (overview-view, resource-bar, sidebar-nav, queue-status-card, construction-status, recruitment-status, training-status, mission-status, activity-history, city-news-ticker, map-view, rooms-view, recruitment-view, training-view, missions-view, security-view, resources-view, settings-view, simulator-view, rankings, family, property-selector, room-details-modal, troop-details-modal).
- `src/components/ui/**` — solo si una primitiva viola el sistema (no reescribir primitivas enteras sin necesidad).

### Lo que NO se toca (regla dura)

- Lógica de negocio, Server Actions (`src/lib/actions`), el Game Tick de `src/app/(dashboard)/layout.tsx`.
- Rutas, nombres de endpoints, `params`/`searchParams`, estructura de carpetas.
- Modelos Prisma, seeds, datasets, datos de juego.
- Fórmulas, tiempos, costos, comportamiento del juego.
- Eliminar dependencias sin antes `grep` de usos.

### Orden de ejecución (seguir en este orden)

**0. Prerequisito de iconos.** Instalá la fuente `Material Symbols Outlined` en `src/app/layout.tsx` (stylesheet en el `<head>` con `display=swap`, clase `material-symbols-outlined`). Creá un wrapper `src/components/ui/material-icon.tsx` (`<span className="material-symbols-outlined">` + props `name`, `size`, `className`).

**1. Tokens y utilidades retro.** Portá desde `docs/ejemplo.html` a `src/styles/design-tokens.css` las clases `crimson-th` (degradado `#7a0000 → #4f0000`, border `#8e1515`), `cell-dark` (bg `#111111`, borde 1px `#333333`), `cell-darker` (bg `#0d0d0d`), `btn-tactical` (`#262626 → #151515`, hover `#363636 → #202020`), `btn-crimson` (`#8a0c0c → #520000`, hover `#a61212 → #680000`), `retro-border`. Agregá los tokens de superficie/texto que falten: canvas `#080808`, nav `#0d0d0d`, resource bar `#0a0a0a`, texto `#dfdbc9`/`#ffdad4`/`#a0a0a0`/`#888888`/`#777777`, bordes `#282828`/`#222222`, acentos `#ff3f3f`/`#fff400`/`#fabd00`/`#00ff00`/`#ee7000`/`#93000a`, pills `#ff0000`/`#003800`. **No dupliques tokens existentes** que ya coinciden.

**2. Fuentes.** En `src/app/layout.tsx` reemplazá las fuentes de `next/font/google`: Roboto → **Work Sans** (body), Bebas Neue → **Space Grotesk** (display, pesos 500/700), Roboto Mono → **Space Mono** (mono). Mantené coherencia en `tailwind.config.ts`: `fontFamily.sans` = `['var(--font-work-sans)', 'Work Sans', 'Tahoma', …]`, `heading` = `['var(--font-space-grotesk)', …]`, `mono` = `['var(--font-space-mono)', …]`. Verificá que los usos existentes de `var(--font-bebas-neue)`/`var(--font-mono)` no queden rotos (actualizá los nombres de variable en `globals.css` y donde se consuman).

**3. Iconos.** Migrá con prioridad: `sidebar-nav.tsx`, `overview-view.tsx` (ActionIcons), `mission-status.tsx`. En las vistas grandes (map-view, rooms, recruitment, training) migrá solo los iconos de navegación/acciones de alto nivel, no rehagas todos los iconos inline en una pasada.

**4. Layout maestro.** En `dashboard-client-layout.tsx`: fondo de página `bg #080808`, columna de juego `max-w-[910px] mx-auto bg #111111 border-x #333333 min-h-[100dvh]`, nav de comando `w-[165px]` desde `sm` con `bg #0d0d0d border-r #333333` y en móvil (`<sm`) apilado a ancho completo. Los side rails decorativos de 53px (`hidden lg:block`) son opcionales: agregalos solo si es trivial sin romper el layout actual.

**5. Ajustes responsive de la critique (cada uno en su archivo):**

- `resource-bar.tsx`: el `<nav>` actual `flex flex-col sm:flex-row` desborda en móvil → `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full`.
- `overview-view.tsx`: header de comandos → `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- `map-view.tsx`: en `<640px` ofrecé una vista _lista_ de solares cercanos (rejilla de botones de coordenadas) y conservá el canvas en pantallas mayores.
- `queue-status-card.tsx`: en móvil las 4 secciones (Misiones/Construcción/Reclutamiento/Entrenamiento) colapsan en un **Accordion** con solo Misiones expandida por defecto; en desktop quedan todas expandidas.
- Dialogs (`room-details-modal`, `troop-details-modal`, rooms/recruitment/training views): grids internos tipo `md:grid-cols-12` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12`.
- Tipografía: texto crítico en `text-[10px]`/`text-[11px]`/`text-xs` → `text-xs sm:text-base` (mínimo 14px en móvil). Metadata mono (`9–13px`) permitida solo para etiquetas no críticas.
- Touch targets: botones de solo icono en `h-8`/`h-9` → mínimo `44×44px` (`min-h-[44px] min-w-[44px]` o `h-11 w-11`).
- Tablas: en `<768px` se presentan apiladas como cards verticales; datos numéricos en mono con `tabular-nums`.
- Imágenes: `w-full h-auto object-cover`, nunca `w-20 h-16` fijas; cards `min-h-[200px] sm:min-h-[250px]`.

**6. Estética retro en componentes.** Aplicá `cell-dark`/`crimson-th`/`btn-tactical`/`btn-crimson`/`retro-border` a: celdas del resource bar, stat cards del overview, queue status, activity-history, city-news-ticker, tablas (headers `crimson-th`, filas con `divide-[#222222]`, hover `#1f1f1f`) y rankings. Números SIEMPRE en Space Mono con `tabular-nums`; labels en mayúsculas con `tracking-wider`.

**7. Motion.** `animate-pulse` en puntos de estado vivo y barras llenas (`[LLENO]` con `#ff3f3f` y border `#93000a`); `transition-colors 0.15s` en hover de celdas; `btn-tactical-press` en botones; respetá `prefers-reduced-motion` (el guard existe en `globals.css` — verificá que cubra `animate-pulse` y `animate-shimmer`).

**8. Anti-patterns (barrido final).** Sin emojis; sin negro puro `#000000` en superficies de contenido; sin glows en botones (glow solo para rankings); sin `h-screen` (usar `min-h-[100dvh]`); sin spinners circulares (skeleton shimmer); sin colores fuera de la paleta de §2; sin modernizar (nada de glassmorphism ni radios excesivos).

### Ejemplos de transformación (referencia del estilo)

| ANTES (código actual)                                                                     | DESPUÉS (objetivo)                                                                             |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `<nav className="flex flex-col sm:flex-row items-center gap-2 w-full sm:flex-1 min-w-0">` | `<nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">`        |
| `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">` (overview header)               | `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">`                       |
| `<Button variant="outline" className="h-9 w-9">`                                          | `<Button variant="outline" className="h-11 w-11 min-h-[44px] min-w-[44px]">`                   |
| `<span className="text-xs text-muted-foreground">40:23:220</span>`                        | `<span className="text-[11px] font-mono tabular-nums text-[#fff400]">40:23:220</span>`         |
| `<th className="text-left">Habitación</th>`                                               | `<th className="crimson-th text-left text-[#ffdad4] uppercase tracking-wider">Habitación</th>` |

### Formato de entrega

Al terminar, reportá:

1. **Tabla de archivos modificados**: archivo → cambios aplicados → estado (`hecho` / `parcial` / `sin cambio` + por qué).
2. **Checklist §9 del DESIGN.md** con casillas actualizadas (los 9 puntos de la critique + migración de fuentes/iconos/clases).
3. **Verificaciones**: corré en orden `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`. Si una falla, corregila antes de dar por terminado. Si alguna no puede correr en tu entorno, indicá cuál y por qué.
4. **Prueba visual** (si tenés herramientas de navegador): abrí la vista principal (overview o rooms) en 375px, 390px, 768px, 1024px y 1440px y reportá overflow horizontal o errores de colapso. Si no tenés navegador, declaralo explícitamente.

### Reglas críticas (no negociables)

- **NUNCA** cambies lógica de negocio, rutas ni consultas Prisma.
- **NUNCA** inventes métricas ni datos de juego; todo lo numérico sigue viniendo de los datos reales.
- **NO** modernices el look: retro 2004 con bordes duros de 1px y degradados granate.
- Verificá el código real antes de reemplazar; `globals.css`/`tailwind.config.ts` ya tienen tokens — no los dupliques.
- Hacé cambios quirúrgicos: un archivo, un cambio claro, diff legible.
