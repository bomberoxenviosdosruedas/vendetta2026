# Design System: Vendetta 2006 — Retro Syndicate Cockpit (Bronce & Pergamino)

> **Fuente de verdad visual**: `docs/mockup/overview_design.md` (tokens) +
> `docs/mockup/overview_escritorio.html` (desktop) + `docs/mockup/overview_movil.html` (móvil).
> Este documento **reemplaza** la versión anterior (basada en `docs/ejemplo.html`) y
> establece el look "Vendetta 2006": mafia RTS de navegador de mediados de los 2000,
> bronce industrial, pergamino quemado y densidad de consola. *No modernizar a SaaS.*
> Los HTML de `docs/ejemplo.html` y `docs/prompts/*` son referencias históricas del
> diseño anterior; **no tomarlas como verdad fuente**.

---

## Configuration — Style Dials

| Dial | Level | Description |
|------|-------|-------------|
| **Creativity** | `7` | Retro fiel a 2004, sin modernizarlo. Bevels metálicos, textura pergamino, 1px borders duros |
| **Density** | `8–9` | Cockpit Dense — tablas de datos compactas, celdas 2–6px, máxima utilización de pantalla |
| **Variance** | `7` | Sidebar docked 215px + viewport central max 900px con radial gradient; drawer móvil off-canvas 275px |
| **Motion Intent** | `5` | Pulsos (`animate-pulse`) en estados vivos/alerta, `transition-colors` en hovers. Reloj servidor 1s. Sin cinemática |

---

## 1. Visual Theme & Atmosphere

Sala de operaciones de un sindicato mafioso en 2006: canvas carbón `#0b0b0b`, topbar
fija **48px** a 100vw con degradado bronce, sidebar izquierda docked de **215px** en
`#050505`, viewport central escrolleable con fondo radial
`radial-gradient(circle at 50% 10%, #161410 0%, #080808 80%)` y contenido limitado a
**900px**. Tablas sobre pergamino `#DFDBC9`, cabeceras bronce con `text-shadow`.
Estética **Retro Tactical / Skeuomorphic-Brutalist**: bevels metálicos pesados,
gradientes oliva-bronce profundos y contenedores de pergamino oscuro.

**Atmosphere Scores:** Density `8–9` (Cockpit Dense) · Variance `7` (Offset Asymmetric, sidebar docked + drawer) · Motion `5–6` (micro-pulsos, sin cinemática)

---

## 2. Color Palette & Roles

### Superficies (layout master frame)
| Rol | Hex | Uso |
|-----|-----|-----|
| **Canvas** | `#0b0b0b` | Fondo de página (`bg-[#0b0b0b]`), fuera del viewport |
| **Sidebar Panel** | `#050505` | Nav lateral docked 215px (`border-r-2 #332d20`) |
| **Main Viewport** | `#161410 → #080808` | Radial gradient del área de juego |
| **Topbar Bronce** | `#443c2c → #2a2418 → #16120b` | Header de recursos 48px, `border-b-2 #5a4b33` |
| **Header Bronce (tablas)** | `#5c523d → #3a3224 → #201a11` | Barras de título `.c`, `crimson-th`/`bronze-th` |
| **Pergamino** | `#DFDBC9` | Tablas de datos, celdas, nav, drawer móvil |

### Bordes estructurales
- `#5a4b33` — borde inferior del topbar (bronze); `#332d20` — sidebar border-r; `#4a3e29` — tablas `.c`.
- `#4a3e29` / `#5a503a` / `#5e5138` — bordes de chips y badges (nunca negro puro).
- 1px duro siempre; el topbar usa `border-b-2`.

### Texto
| Rol | Hex | Uso |
|-----|-----|-----|
| **Pergamino / Body** | `#221c13` | Texto sobre pregamino (`cell-parchment`) |
| **Dark para cabeceras** | `#FFFFFF` | Títulos `.c` sobre bronce, `text-shadow: 1px 1px 1px #000` |
| **Cabecera móvil** | `#f7e6c4` | `v-header-c` (bronce móvil) |
| **Muted sobre oscuro** | `#a39a82` / `#888888` | Meta, captions, timestamps |
| **Footer** | `#786c52` / `#777777` | Líneas de pie |

### Acentos (semántica de juego)
| Rol | Hex | Uso |
|-----|-----|-----|
| **Gold (jerarquía/live)** | `#ffe569` | Chips interactivos, totales, cantidad de tropas `( 261 )`, `[LLENO]`, res-chips |
| **Green (positivo/online)** | `#4caf50` / `#008800` | Flujo de caja entrante, estados seguros, `En Línea`, timers activos `#44dd55` |
| **Red (crítico/alerta)** | `#e53935` / `#c00000` | Cap lleno, `[LLENO]` 100% pulsante, logout `#8b1a10`, badges mensajes `#b32400` |
| **Orange (armas/porcentaje)** | `#ff9800` / `#ee7000` | Barras de armas/munición, porcentajes |
| **Blue (enlaces coords)** | `#174872` | Enlaces de coordenadas sobre pergamino |
| **Link hover rojo** | `#8b0000` | `a:hover` sobre pergamino |

### Degradados obligatorios (brand gradients)
- **`crimson-th` (ALIAS → bronce)**: `linear-gradient(180deg, #5c523d 0%, #3a3224 50%, #201a11 100%)`, border `#4a3e29`, texto blanco con `text-shadow 1px 1px 1px #000`. **Vale para todas las páginas** (alias global).
- **`v-header-c`** (cabecera de sección móvil): `linear-gradient(180deg, #534533 0%, #3a2e20 48%, #271e13 52%, #423524 100%)`, `color #f7e6c4`, `border-top #74634c`, `border-bottom #231b11`.
- **`retro-btn`**: `linear-gradient(180deg, #ece6d2 0%, #cfc8b0 50%, #aba187 100%)`, border `#635742`, `inset 1px 1px 0 #fff / -1px -1px 0 #8b7d65`. Presión → invertir gradiente + `inset 1px 1px 2px #443a29`.
- **`retro-btn-dark`**: `linear-gradient(180deg, #4d3f2e 0%, #2f2518 50%, #1f180f 100%)`, border `#6b5a43`, `inset 1px 1px 0 #6e5e48 / -1px -1px 0 #110d08`, `color #e2cca2`. Presión → `#19130c`.
- **`quick-action-badge`**: `linear-gradient(180deg, #382c1b 0%, #20170c 100%)`, border `#57462c`, `color #dfcaa2`, hover `filter: brightness(1.15)`.

### Contraste verificado
| Par | Ratio | Uso |
|-----|-------|-----|
| `#221c13` sobre `#DFDBC9` | ≈ 15:1 | ✅ AAA — texto sobre pergamino |
| `#FFFFFF` sobre `#5c523d` | ≈ 8:1 | ✅ AAA — títulos `.c` |
| `#f7e6c4` sobre `#534533` | ≈ 6.5:1 | ✅ AA — `v-header-c` |
| `#ffe569` sobre `#252017` | ≈ 8:1 | ✅ AAA — res-chip |
| `#174872` sobre `#f1ebda` | ≈ 5.5:1 | ✅ AA — enlaces de coords |
| `#8b1a10` + texto blanco | ≈ 6:1 | ✅ AA — logout |

### Banned
- Emojis (`🔫`, `💵`, `🥷`, `☰`…) — **SIEMPRE** Material Symbols equivalentes.
- `Inter`, serif genéricas (`Times New Roman`, `Georgia`), gradientes "AI purple".
- Negro puro `#000000` como superficie de texto/celda (solo bordes de tabla).
- Métricas inventadas (no existe campo "lealtad" en `PuntuacionUsuario`): usar datos reales o placeholder `[--]`.

---

## 3. Typography Rules

| Rol | Fuente | Reglas |
|-----|--------|--------|
| **Display / Headers** | `Chivo` (400/500/700/900) | Cabeceras de sección, títulos, "VENDETTA 2006". `uppercase tracking-wider` |
| **Body / UI** | `Arimo` (400–700), fallback `Tahoma/Arial` | Menús, tablas, descripciones, avatares |
| **Data / Timers / Coordenadas** | `JetBrains Mono` (400/700) | `00:00:00`, `7.462.002`, `40:23:220`, reloj `31-08-2024 04:51:38`. `tabular-nums` obligatorio |
| **Iconos** | `Material Symbols Outlined` | Reemplazo canónico de emojis. Tamaños 12–20px |

### Variables de fuente legacy (NO renombrar)
```css
--font-work-sans: 'Arimo';        /* body/sans  */
--font-space-grotesk: 'Chivo';    /* display    */
--font-space-mono: 'JetBrains Mono'; /* data/mono */
```
La UI migró con PowerShell (`font-['Space_Grotesk']`→`font-['Chivo']`, etc.) conservando los
nombres de variable legacy. `docs/ejemplo.html` y `docs/prompts/*` conservan los nombres
viejos de fuente (documentación histórica, no tocar).

### Escala tipográfica canónica
- **Base UI densa (desktop)**: `12px` — densidad retro intencional.
- **Móvil**: contenido crítico mínimo `13–14px`; mono metadata `9–11px` permitido para timers/coords/badges.
- **Headlines**: `18px` header principal topbar / `11–13px` cabeceras de sección Chivo bold.
- **Mono**: timers `10–12px` bold, cantidad `( 261 )` gold, coords `10px`.

---

## 4. Component Stylings

### Tables & Data Grids
- **Header Row (`.c` / `crimson-th` / `bronze-th`)**: gradiente `#5c523d → #201a11`, texto blanco bold con `text-shadow 1px 1px 1px #000`, borde `#4a3e29`, height `24px`.
- **Sub-header / Cell (`th`, `td.th`)**: fondo pergamino `#DFDBC9`, `border 1px #000000`, texto negro, padding `2px 5px`.
- **Interactive Rows**: hover → `#efeadd`, links `#174872` (coords) / hover `#8b0000` (links de texto).
- **Filas alternadas**: `#f1ebda` / `#e9e3d2` + `divide-[#cfc9b5]`.

### Buttons & Console Controls
- **`nav-btn`**: beveled parchment `#c8c3b0`, `border #444`, hover `#dfdbc9`. Selector de base ▲▼.
- **`nav-select`**: recessed `#eee8d5`, centrado, `border #333`.
- **`msg-btn`**: `#c7c2b0`, `border-top 1px #fff` + `border-bottom 1px #555`, height `32px`, bold, hover `#ded9c6`. Tile apilado para Mensajes/Informes/Misiones/Combates.
- **`retro-btn` / `retro-btn-dark`**: bevels nuevos (ver §2) para marco y overview.

### Resource Gauges & Chips
- **`res-chip`**: `#252017`, `border #4a3e29`, `radius 2px`, texto `#ffe569` `9px` bold, hover `#352e20`. Uso: chip "Producción" del topbar.
- **`timer-pill`**: `#1a1711`, `color #44dd55` mono bold, `border #4a3e2b`, `inset 0 1px 3px rgba(0,0,0,0.8)`. Todos los countdowns.
- **Capacity Bar**: track 3px `#2b2b2b` (desktop) / `h-1.5` `#231e16` mobile; fill Orange `#ff9800` (armas/muni), Green `#4caf50` (dólares), Red `#e53935`/`#ff0000` (alcohol).

### Unit & Profile Cards
- **`badge-unit`**: `#25221c`, `border #5a503a`, `radius 3px`, `inset 0 0 5px rgba(0,0,0,0.8)`, centrado. Imagen/icono arriba, nombre bold, cantidad `( N )` mono `#ffe569`.
- **`avatar-box`**: `#242018`, `border 2px #5e5138`, `radius 3px`, `inset 0 0 8px rgba(0,0,0,0.9)`, texto centrado. Jugador/Base/Familia.
- **`quick-action-badge`**: tile bronce oscuro (gradiente §2) para accesos rápidos móviles.

### Bar & Frame de sección (móvil)
- **`v-outer-frame`**: `#dfdbc9`, `border #5a4f3d`, `box-shadow 0 2px 4px rgba(0,0,0,0.5)`. Container de cada sección del overview.
- **`v-header-c`**: cabecera de sección bronce (gradiente §2), `#f7e6c4`, con enlaces `#ffe569`.
- **`v-sub-header`**: `linear-gradient(#c9c3ad → #b2ab95)`, `color #201a11`, uppercase, `letter-spacing 0.5px`.

### Legacy (vistas NO migradas — no tocar sus clases)
- `btn-tactical`, `btn-crimson`, `cell-dark`, `cell-darker`, `resource-pill-*`, `glow-border-*`.
- El alias `crimson-th` SÍ percola a todas las páginas (único cambio global intencional).

---

## 5. Layout Principles (Master Frame)

```
┌────────────────────────────────────────────────────────────────────┐
│ TOPBAR 48px · 100vw · bronce #443c2c→#16120b · border-b-2 #5a4b33 │
│  [Logo] [Tabla Recursos: Armas|Muni|Alcohol|Dólares|Hora] [Chips] │
├──────────────┬─────────────────────────────────────────────────────┤
│ SIDEBAR 215px│  MAIN VIEWPORT (scroll propio)                     │
│ #050505      │  radial-gradient(#161410 → #080808)                │
│ border-r-2   │  ┌──────────────────────────────────────────────┐  │
│ selector base│  │ content: max-w-[900px] mx-auto               │  │
│ nav pergamino│  │ secciones v-outer-frame / tablas pergamino   │  │
│ footer 2006  │  └──────────────────────────────────────────────┘  │
└──────────────┴─────────────────────────────────────────────────────┘
```

### Desktop (≥1024px)
- **Viewport locked**: `h-[100dvh] overflow-hidden flex flex-col`; main scrollea interno (`lg:overflow-y-auto`).
- **Topbar**: `h-12` fija, logo + tabla de recursos (5 col) + chips (Producción / En Línea / TICK / CAPO + logout).
- **Sidebar**: `w-[215px]`, `bg #050505`, `overflow-y-auto`, `box-shadow 2px 0 10px rgba(0,0,0,0.8)`.
- **Main**: `flex-1 overflow-y-auto`, contenido `max-w-[900px] mx-auto`, padding `16px 24px 30px`.

### Móvil (<1024px)
- **Header sticky**: identity bar (`☰ Menú` retro-btn / logo / online) + strip reloj·Base·Producción + **grid recursos 2×2 pergamino**.
- **Main**: `max-w-[440px] mx-auto`.
- **Drawer**: off-canvas `w-[275px]`, `bg #dfdbc9`, `border-r-2 #54432a`, cabecera bronce "MENÚ PRINCIPAL" + ✕, selector base (`▲ ▼` coords) y nav con grupos. Overlay `bg-black/75`.

---

## 6. Responsive Rules

| Breakpoint | Comportamiento |
|------------|----------------|
| `<640px` | Drawer móvil visible; grid recursos 2×2 pergamino; secciones en `v-outer-frame`; tropas grid 2 col |
| `sm ≥640px` | Sin cambios estructurales mayores en móvil |
| `lg ≥1024px` | **Switch**: topbar desktop 48px + tabla 5 col; sidebar 215px visible; drawer oculto; main 900px |
| `xl ≥1280px` | Chips extra (En Línea) y logo completo |

### Reglas duras
1. **Topbar desktop**: `hidden lg:flex`; header móvil: `lg:hidden`.
2. **Sidebar 215px**: solo `lg+`; en móvil el nav vive en el drawer.
3. **Touch targets** móviles ≥44×44px en botones de acción; naigación retro puede ser 36px.
4. **Timers/coords** nunca se cortan: `min-w`, `truncate` solo en labels.
5. **Badge-unit badge card mobile**: `grid-cols-2`, desktop `grid-cols-4`+.

---

## 7. Motion & Interaction

- **Pulso perpetuo**: `animate-pulse` en estado `[LLENO]`/alerta, punto "En Línea", badges rojos.
- **Hover pergamino**: `transition-colors 0.15s`, fila → `#efeadd`, link → `#8b0000`.
- **Presión retro-btn**: invertir gradiente + sombra inset (`.retro-btn:active`).
- **Reloj servidor vivo**: 1s (`LiveClock`), `#fff400` desktop / en strip móvil.
- **Drawer móvil**: `transform -translate-x-full ↔ translate-x-0`, `transition-transform 300ms ease-in-out`.
- **Hardware**: animar SOLO `transform`/`opacity`. `prefers-reduced-motion: reduce` desactiva pulsos.
- Entrada de filas: `fade-in-up` (ya en tokens).

---

## 8. Anti-Patterns (Banned)

- Emojis — usar Material Symbols.
- Inter / serif genéricas; "AI purple"; glows en botones.
- Negro puro como superficie de contenido.
- `h-screen` → `h-[100dvh]` / `min-h-[100dvh]`.
- Spinners circulares → skeleton shimmer.
- Texto filler, nombres genéricos, clichés AI.
- **Números/estadísticas fabricados** — datos reales o placeholder `[--]` (ej.: "Lealtad").
- `LABEL // YEAR` fuera de la cabecera de overview del mockup **desktop**.
- Radios/sombras arbitrarios: tablas radius 0; chips/badges 2–3px.

---

## 9. Roadmap de Migración por Página

| Página | Estado | Cambios pendientes |
|--------|--------|--------------------|
| `(dashboard)/layout` + marco global | ✅ Hecho | Topbar 48px bronce, sidebar 215px, drawer móvil, viewport locked, scrollbar bronce |
| `/overview` | ✅ Hecho | Secciones fieles al mockup (perfil, misiones, construcción, reclutamiento, tropas, puntos) |
| `room.status/construction/recruitment/training` | ✅ Hecho | Filas pergamino + timer-pill (visibles vía QueueStatusCard) |
| `/rooms`, `/buildings`, `/recruitment`, `/training`, `/technologies` | 🔜 Pendiente | Grids de habitaciones/tropas/tech → tablas pergamino + badge-unit + .c headers |
| `/missions`, `/simulator` | 🔜 Pendiente | Tablas de misiones/simulador → .c + pergamino + timer-pill |
| `/map` | 🔜 Pendiente | Vista lista móvil <640px; coords en links `#174872` |
| `/family`, `/messages` | 🔜 Pendiente | Listas pergamino + badges; mensajes red `#b32400` |
| `/resources`, `/rankings`, `/statistics`, `/profile`, `/settings` | 🔜 Pendiente | Datos sobre pergamino; rankings con glow SOLO trofeos |
| `city-news-ticker`, `activity-history` | ⏸️ Retirados del overview | Componentes conservados en repo (sin importar) |

Orden sugerido: vistas de gestión (rooms/recruitment) → misiones/mapa → resto.

---

## 10. Implementation Sync Status

### Tokens reales en código
| Token / Clase | Valor | Ubicación |
|---------------|-------|-----------|
| `crimson-th` | bronce `#5c523d→#201a11` (alias `.bronze-th`) | `design-tokens.css` |
| `v-header-c`, `v-sub-header`, `v-outer-frame` | bronce móvil / pergamino | `design-tokens.css` |
| `cell-parchment`, `cell-parchment-alt` | `#f1ebda` / `#e5dfcb` | `design-tokens.css` |
| `retro-btn`, `retro-btn-dark` | bevels §2 | `design-tokens.css` |
| `timer-pill`, `res-chip`, `badge-unit`, `avatar-box`, `msg-btn`, `nav-btn`, `nav-select`, `quick-action-badge` | §4 | `design-tokens.css` |
| `--font-work-sans/space-grotesk/space-mono` | Arimo / Chivo / JetBrains Mono | `globals.css` + `layout.tsx` (Google Fonts) |
| Scrollbar | track `#1b1610`, thumb `#5e4c34` | `globals.css` |

### Radios
- `0px` tablas/selectores; `2–3px` chips/badges/avatar-box; `rounded-sm` en retro-btns móviles moderados.

---

*Fuente: `docs/mockup/overview_design.md` + `overview_escritorio.html` + `overview_movil.html` · Implementación: 2026-09-24 · Valores verificados contra código real en `design-tokens.css`, `globals.css`, componentes del dashboard.*