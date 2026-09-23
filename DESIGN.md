# Design System: Vendetta — Retro Syndicate Ops (RTS Tactical Cockpit)

> Fuente de verdad visual: `docs/ejemplo.html` (vendetta 2X — Syndicate Wars retro 2004).
> Este documento reemplaza la versión anterior y **incorpora los ajustes de la design critique**:
> breakpoints móviles corregidos, tipografía mínima 14px, touch targets ≥44px, contraste verificado,
> radios/sombras unificados y reglas de colapso mobile-first.

---

## Configuration — Style Dials

| Dial | Level | Description |
|------|-------|-------------|
| **Creativity** | `7` | Retro fiel a 2004, sin modernizarlo a SaaS. Tipografía display fuerte, texturas borderline pixel-art, 1px borders duros |
| **Density** | `8–9` | Cockpit Dense — HUD táctico de operaciones: muchas lecturas por pantalla, mono labels diminutas, datos en tablas |
| **Variance** | `6–7` | Columna de juego centrada (máx. 910px) con side-rails texturizados; asimetría del layout de comando izquierdo (165px) |
| **Motion Intent** | `5–6` | Pulsos (`animate-pulse`) en estados vivos, `transition-colors 0.15s` en hovers, reloj 1s. Sin cinemática |

---

## 1. Visual Theme & Atmosphere

Operaciones nocturnas de un sindicato retro: pantalla de mando estilo *Vendetta / OGame* de 2004.
Canvas negro `#080808`, columna de juego `#111111` centrada de **910px máx.**, nav lateral izquierda
de 165px y side-rails de 53px (solo `lg`) con textura de fondo. Tipografía diminuta en mayúsculas,
labels mono `[40:23:220]`, timers `00:00:07`, bordes duros de 1px (`#333333`), cabeceras con degradado
granate `crimson-th`. La sensación: una sala de operaciones iluminada por terminales CRT, deliberadamente
retro y densa — **nunca** un dashboard SaaS moderno.

**Atmosphere Scores:** Density `8–9` (Cockpit Dense) · Variance `6–7` (Offset Asymmetric) · Motion `5–6` (Fluid CSS, micro-pulsos)

---

## 2. Color Palette & Roles

### Superficies (layout master frame)
| Rol | Hex | Uso |
|-----|-----|-----|
| **Canvas** | `#080808` | Fondo de página fuera de la columna de juego (`bg-[#080808]`) |
| **Main Column** | `#111111` | Columna de juego `max-w-[910px]`, `border-x #333333` |
| **Nav / Cell Panel** | `#0d0d0d` | `cell-darker`, nav de comando izquierda, paneles secundarios |
| **Resource Bar** | `#0a0a0a` | Franja sticky de recursos (4 celdas de estado) |
| **Side Rails** | `#000000` | Rails texturizados 53px (única excepción de negro puro: textura decorativa, solo `lg`) |

### Bordes estructurales
- `#333333` — bordes primarios (columna, celdas, header, inputs, tracks de progreso)
- `#282828` — bordes secundarios / hover subtil
- `#222222` — rails, dividers de tablas (`divide-[#222222]`)
- 1px duro siempre. Nunca bordes "suaves" con blur.

### Texto
| Rol | Hex | Uso |
|-----|-----|-----|
| **Primary** | `#dfdbc9` | Texto principal (off-white cálido, NO blanco puro) |
| **Hot / Highlight** | `#ffdad4` | Título cabecera, cantidades destacadas, hover texto |
| **Muted (uppercase meta)** | `#a0a0a0` | Velocidad, reloj label, captions |
| **Meta labels** | `#888888` | Labels mono de coordenadas, footnotes |
| **Footer** | `#777777` | Línea de pie |

### Acentos (semántica de juego)
| Rol | Hex | Uso |
|-----|-----|-----|
| **Burgundy (activo)** | `#6C0000` | Nav activo, hover de celdas, headers `crimson-th`, primary `--primary` |
| **Crimson (peligro/combate)** | `#ff3f3f` | ATAQUE, estados críticos, alcohol `[LLENO]`, cantidades en alerta |
| **Pink (texto caliente)** | `#ffdad4` | Título cabecera, números destacados sobre fondo oscuro |
| **Gold (jerarquía/live)** | `#fff400` | Reloj del servidor, coordenadas `40:23:220`, highlights de ranking |
| **Amber (secundario)** | `#fabd00` | Stats secundarias, badges, `[#42]` id capo, mail/descripciones |
| **Green (positivo/online)** | `#00ff00` | `+60.850/h`, velocidades, estado ONLINE/defensa, éxito |
| **Orange (armas/porcentaje)** | `#ee7000` | % de capacidad de ARMAS y MUNICIÓN, iconos de amunición |
| **Rojo alerta (full)** | `#93000a` | Border/estado de celda llena (alcohol `[LLENO]`) |
| **Badge count rojo** | `#ff0000` | Contadores de notificación (pill) |
| **Badge count verde** | `#003800` | Pills de estado positivo |

### Degradados obligatorios (brand gradients)
- **`crimson-th`** (sección header): `linear-gradient(180deg, #7a0000 0%, #4f0000 100%)`, border inferior `#8e1515`
- **`btn-crimson`**: `linear-gradient(180deg, #8a0c0c 0%, #520000 100%)` → hover `#a61212 → #680000`
- **`btn-tactical`**: `linear-gradient(180deg, #262626 0%, #151515 100%)` → hover `#363636 → #202020`
- **Barras de progreso**: track `#000000` con `border #333333`; fill por color de recurso.

### Contraste verificado (WCAG)
| Par | Ratio | Estado |
|-----|-------|--------|
| `#dfdbc9` sobre `#111111` | ≈ 12.4:1 | ✅ AAA — texto primario |
| `#a0a0a0` sobre `#111111` | ≈ 6.7:1 | ✅ AA — muted |
| `#888888` sobre `#0d0d0d` | ≈ 5.6:1 | ✅ AA — meta labels |
| `#ff3f3f` sobre `#111111` | ≈ 5.0:1 | ✅ AA — usar bold en tamaños <14px |
| `#ee7000` sobre `#111111` | ≈ 5.7:1 | ✅ AA — cantidades/porcentajes |

### Banned
- Negro puro `#000000` como superficie de texto/celda (solo rails decorativos).
- `Inter`, serif genéricas (`Times New Roman`, `Georgia`), gradientes "AI purple".
- Acentos saturados >80% fuera de la paleta; mezcla de grises cálidos/fríos.

---

## 3. Typography Rules

> Migración objetivo desde la implementación actual (Roboto/Bebas Neue/Roboto Mono + Tahoma) hacia
> el sistema auténtico de `ejemplo.html`. Ver §9 Implementation Sync.

| Rol | Fuente | Reglas |
|-----|--------|--------|
| **Display / Headers** | `Space Grotesk` (500/700) | Títulos de sección, nav groups, badges principales. `uppercase tracking-wider`. Ej.: título header `VENDETTA 2X` a `18px bold` |
| **Data / Timers / Coordenadas** | `Space Mono` | **TODOS** los números: `40:23:220`, `00:00:07`, `93.7%`, `+60.850/h`, reloj `31-08-2024 04:51:38`, cantidades de recursos. `tabular-nums` obligatorio |
| **Body / UI** | `Work Sans` (400–700), fallback `Tahoma` (ya en `--font-sans`) | Botones, tablas, descripciones, tooltips |
| **Iconos** | `Material Symbols Outlined` (fill vs outline para estados) | Tamaños 12–20px según jerarquía; iconos de acción 15px estándar |

### Escala tipográfica canónica
- **Base UI densa (desktop)**: `12px` (`text-[12px]` en `body`) — densidad retro intencional.
- **Body crítico (móvil)**: mínimo **14px** (`text-sm` → `sm:text-base` en texto crítico). Regla de la critique: no `text-[10px]`/`text-[11px]` para contenido esencial.
- **Mono metadata**: `9–13px` (`text-[9px]`..`text-[13px]`) — permitido solo para meta no crítica (coords, badges, labels).
- **Headings**: `18px` header principal / `text-[11px] bold uppercase` labels de celda de recurso.
- **Line height**: leading 1.6 body, 1.1 headers. Max line width 65ch.

### Reglas
- Mayúsculas + `tracking-wider` en todos los labels de sección y nav (`OPERACIONES`, `ARMAS`, `MUNICIÓN`).
- Números SIEMPRE mono con `tabular-nums` (Density ≥ 7).
- No `Inter`. No `Proportional digits` en datos de juego.

---

## 4. Component Stylings

### Paneles (`cell-dark` / `cell-darker`)
- Borde 1px `#333333`, fondo `#111111` (`cell-dark`) o `#0d0d0d` (`cell-darker`), padding `p-1.5`.
- Hover: `border-[#6C0000]` + `transition-colors`. Nunca glow.

### Section headers (`crimson-th`)
- `<th>` / headers de sección con degradado `#7a0000 → #4f0000`, border `#8e1515`, texto `#ffdad4`/blanco, mono small uppercase.

### Botones
- **`btn-tactical`**: degradado `#262626 → #151515`, hover `#363636 → #202020`. Botón neutro/estándar.
- **`btn-crimson`**: degradado `#8a0c0c → #520000`, hover `#a61212 → #680000`. Acción primaria/destructiva.
- **Táctil**: `:active` → `scale(0.98) translateY(1px)`, `filter: brightness(0.92)` (`btn-tactical-press`).
- **Touch targets: mínimo `44×44px`** (`min-h-[44px] min-w-[44px]`).
- Icon buttons: `w-5 h-5` internamente pero con área de tap ≥44px.

### Tablas
- Filas con `divide-[#222222]`, hover fila `bg-[#1f1f1f]`, headers `crimson-th`.
- Datos numéricos en `Space Mono`, animación `fade-in-up` por fila (stagger).

### Barras de progreso
- Track: `bg-[#000000] h-1.5 border border-[#333333] overflow-hidden`.
- Fill por recurso (armas rojo, munición ámbar, alcohol naranja→`#93000a` al lleno, dólares verde).
- Estado `[LLENO] 100%`: texto `#ff3f3f` + `animate-pulse` + border `#93000a`.

### Pills / Badges
- Contador de notificación: pill `#ff0000` (rojo puro) sobre icono; pill de estado positivo `#003800`.
- `rounded` mínimo, mono, `tracking-wider` (ej. badge `V2` `#fabd00` border `#ffc107/40`).

### Cards / Celdas de recursos
- Celdas `cell-dark` apiladas en grid; hover `border-[#6C0000]`.
- Radios **unificados** (ya en `globals.css`): `base=8px` (cards), `md=6px` (botones/inputs), `sm=4px` (badges), `xl=12px` (modals). Prohibido radio arbitrario.

### Sombras
- `--shadow-base`, `--shadow-tactical` (cards), `--shadow-tactical-elevated` (modals). `--shadow-glow-crimson/gold` SOLO para trofeos/highlights de ranking, nunca en botones.

### Loaders
- Skeleton shimmer (`animate-shimmer 1.5s`) con dimensiones exactas del layout. **Prohibido spinner circular.**

---

## 5. Layout Principles (Master Frame)

```
┌────────────────────────────────────────────────────────────┐
│ page #080808   [rail 53px]  [game column 910px #111111] [rail] │
│                              max-w-[910px] border-x #333333   │
│   ┌───────┐  ┌──────────────────────────────────────────┐    │
│   │ HEADER │  │ h-11 fixed — VENDETTA 2X • RELOJ • CAPO │    │
│   └───────┘  └──────────────────────────────────────────┘    │
│   ┌──────┐   ┌──────────────────────────────────────────┐    │
│   │RESOURCE│ │ bg #0a0a0a — ARMAS MUNICIÓN ALCOHOL DÓLARES│   │
│   └──────┘   └──────────────────────────────────────────┘    │
│   ┌─nav 165px─┐ ┌─────────── main panel ────────────────┐   │
│   │ bg #0d0d0d│ │ secciones apiladas (cell-dark)         │   │
│   │ border-r  │ │ grids 1→2→3 col responsive             │   │
└───────────┴──────────────────────────────────────────┘
```

- **Grid-first**: CSS Grid para todo layout estructural. Sin `calc(33% - …)`, sin flex-math.
- **Columna de juego**: `max-w-[910px]` centrada, `border-x #333333`, `bg #111111`, `min-h-[100dvh]`.
- **Side rails**: `w-[53px]` texturizados, `hidden lg:block` (decorativos, `pointer-events-none`).
- **Header táctico**: `h-11` fijo, marcas mono `VELOCIDAD: x2 TICK` (`#00ff00`), `RELOJ:` (`#fff400`), `CAPO: [id]`.
- **Nav de comando**: `w-[165px]` desde `sm`; en móvil (<sm) se apila a ancho completo — AJUSTE critique.
- **ResourceBar**: grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — **AJUSTE critique** (antes rompía en <640px).
- **Overview header**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — **AJUSTE critique**.
- **Contenedores**: `border-[#333333]` 1px, padding módulo `p-1.5`, gaps estándar `gap-1.5/3`.
- **Full-height**: `min-h-[100dvh]`, nunca `h-screen`.

---

## 6. Responsive Rules

**Responsive es requisito duro** — probar en: `375px` (SE), `390px` (iPhone 14), `768px` (iPad), `1024px`, `1440px`.

| Breakpoint | Comportamiento |
|------------|----------------|
| `<640px` (base) | 1 columna estricta. Nav 165px → apilada full-width. ResourceBar `grid-cols-1`. Header comandos se colapsa a bloques |
| `sm ≥640px` | ResourceBar 2 columnas; nav lateral visible (165px); tabs/accordion de sección |
| `md ≥768px` | ResourceBar 2→4; filas de 2 en grids; dialogs amplían a grid interno |
| `lg ≥1024px` | ResourceBar `grid-cols-4`; side rails 53px aparecen; layout maestro completo |
| `xl ≥1280px` | Sin cambios estructurales — sólo respiración |

### Ajustes obligatorios de la critique
1. **ResourceBar**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3` — nunca columna horizontal overflow.
2. **Overview header**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
3. **Tipografía móvil**: texto crítico en `text-xs` pasa a `text-xs sm:text-base` (`14px` min). No `text-[10px]` para contenido esencial.
4. **Mapa móvil**: vista *lista* de coordenadas cercanas `<640px` (grid de botones) en lugar del canvas de 900px+.
5. **QueueStatusCard**: en móvil las 4 secciones (Misiones/Construcción/Reclutamiento/Entrenamiento) colapsan en **Accordion**; solo Misiones expandida por defecto.
6. **Dialogs (rooms/recruitment/tech)**: grids internos `md:grid-cols-12` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12`.
7. **Touch targets**: todo elemento interactivo `≥44×44px`.
8. **Imágenes**: `w-full h-auto object-cover`, nunca `w-20 h-16` fijas. Cards `min-h-[200px] sm:min-h-[250px]`.
9. **Tablas móvil**: stack a cards verticales `<768px`; datos mono 14px mínimo.

---

## 7. Motion & Interaction

- **Pulso perpetuo**: `animate-pulse` (2s) en puntos de estado vivo y barras `[LLENO]`/alertas.
- **Hover de celda**: `transition-colors 0.15s` + `border-[#6C0000]`.
- **Presión táctil**: `scale(0.98) translateY(1px)` en `:active` (`btn-tactical-press`, transición 0.08s).
- **Reloj vivo**: tick 1s (`setInterval`) mostrando hora del servidor en `#fff400` mono.
- **Entrada de filas**: `fade-in-up` 0.3s con stagger `delay-75/150/225`.
- **Shimmer**: loaders skeleton `1.5s infinite`.
- **Hardware**: animar SOLO `transform` y `opacity`. Nunca `top/left/width/height`.
- **`prefers-reduced-motion: reduce`**: desactivar `animate-pulse`, `animate-shimmer`, `glow-*`, tooltips fades. (Guard existente en `globals.css`.)

---

## 8. Anti-Patterns (Banned)

- Emojis en cualquier parte de la UI.
- Inter o serif genéricas.
- Negro puro `#000000` en superficies de contenido (solo rails decorativos).
- Gradientes/neones "AI purple"; glows en botones.
- Layout de 3 columnas iguales para features.
- Hero centrado (variance ≥6).
- `h-screen` — usar `min-h-[100dvh]`.
- Spinners circulares — skeleton shimmer.
- Texto filler ("Scroll para explorar", chevrons rebotando).
- Nombres genéricos ("John Doe", "Acme", "Nexus").
- **Números fabricados/estadísticas inventadas** — datos del juego reales o placeholders `[metric]`. Las cantidades en `ejemplo.html` son ilustrativas; el producto renderiza datos vivos.
- `LABEL // YEAR`. **Excepción auténtica**: el ejemplo usa `CUARTEL GENERAL // VISIÓN DE OPERACIONES` como recurso retro deliberado del *layout de ejemplo*; prohibido fuera de ese patrón de cabecera de ejemplo.
- Clichés de copy AI ("Elevate", "Seamless", "Unleash").
- Ratios de contraste < AA para texto esencial (usar tabla de §2).
- Radios/sombras arbitrarios fuera del sistema unificado.

---

## 9. Implementation Sync Status

### Ya alineado en código (`globals.css` / `tailwind.config.ts`)
| Token real | Valor | Coincide con |
|-----------|-------|--------------|
| `--background` | `0 0% 6.7%` → `#111111` | ✅ main column |
| `--primary` | `355 100% 21%` → `#6C0000` | ✅ burgundy |
| `--border` / `--input` | `0 0% 20%` → `#333333` | ✅ borde primario |
| `--muted-foreground` | `0 0% 75%` → `#bfbfbf` | ✅ AA sobre `#111111` (≈9.4:1) — ajuste critique aplicado |
| `--primary-foreground` | `0 100% 90%` → `#ffcccc` | ✅ pink retro |
| Radii | `base 8 / md 6 / sm 4 / xl 12` | ✅ sistema unificado |
| Shadows | `base / tactical / tactical-elevated` | ✅ tokens canónicos |
| `--resource-*` | armas/municion/alcohol/dolares | ✅ tokens RTS (`design-tokens.css`) |

### Pendiente de migración (objetivo `ejemplo.html`)
| Hoy (código) | Objetivo | Nota |
|--------------|----------|------|
| Body: `Roboto`/`Tahoma` (`--font-roboto`, `font-sans: Tahoma…`) | `Work Sans` (fallback `Tahoma`) | Reemplazar en `next/font/google` + `--font-sans` |
| Display: `Bebas Neue` (`--font-bebas-neue`) | `Space Grotesk` 500/700 | Resultado más fiel al ejemplo; Bebas Neue es legado |
| Mono: `Roboto Mono` (`--font-mono`) | `Space Mono` | Números/coords/timers |
| Iconos: `lucide-react` | `Material Symbols Outlined` | Iconografía del ejemplo; migración progresiva por vista |
| Faltan clases | `crimson-th`, `cell-dark`, `cell-darker`, `btn-tactical`, `btn-crimson`, `retro-border` | Portar CSS de `docs/ejemplo.html` a `design-tokens.css` + utilidades |

### Checklist de ajustes de la critique (referencias)
- [ ] `resource-bar.tsx` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- [ ] `overview-view.tsx` header → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] `map-view.tsx` → vista lista móvil <640px
- [ ] `queue-status-card.tsx` → Accordion en móvil
- [ ] Dialogs rooms/recruitment/tech → grids colapsables
- [ ] `text-[10px]`/`text-[11px]` críticos → `text-xs sm:text-base`
- [ ] Touch targets `≥44px` en icon buttons
- [ ] Tablas móvil → stack vertical <768px
- [ ] Imágenes responsive (`w-full h-auto`), cards `min-h-[200px] sm:min-h-[250px]`

---

*Fuente: `docs/ejemplo.html` · Estructura: `taste-design` · Ajustes: design critique (response 2026-09-23). Valores verificados contra código real en `globals.css`, `design-tokens.css`, `tailwind.config.ts`, `src/app/layout.tsx`.*