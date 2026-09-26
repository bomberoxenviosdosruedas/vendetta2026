# Design System: Vendetta 2006 — Retro Syndicate Cockpit (Bronce & Pergamino)

> **Fuente de verdad visual**: `.stitch/DESIGN_ajustado.md` ("Vendetta 2026 Classic
> Noir", brief normativo) + `docs/knowledge_base/MOCKUPS/dashboard_overview_unificado.html`.
> Este documento refleja la **implementación real** verificada contra el DOM compilado.
> Los HTML de `docs/ejemplo.html` y `docs/prompts/*` son referencias históricas del
> diseño anterior; **no tomarlas como verdad fuente**.
>
> ⚠️ `.stitch/DESIGN_IMPROVED.md` (Bebas Neue / Roboto, frío-neutro) está **superado**
> y **no debe reaplicarse**.

---

## Configuration — Style Dials

| Dial | Level | Description |
|------|-------|-------------|
| **Creativity** | `7` | Retro fiel a 2004, sin modernizarlo. Bevels metálicos, textura pergamino, 1px borders duros |
| **Density** | `8–9` | Cockpit Dense — tablas de datos compactas, celdas 2–6px, máxima utilización de pantalla |
| **Variance** | `7` | Sidebar docked 260px + viewport central con radial gradient; drawer móvil off-canvas 275px |
| **Motion Intent** | `5` | Pulsos (`animate-pulse`) en estados vivos/alerta, `transition-colors` en hovers. Reloj servidor 1s. Sin cinemática |

---

## 1. Visual Theme & Atmosphere

Sala de operaciones de un sindicato mafioso en 2006: canvas carbón **cálido** `#0a0806`
(humo con un resto de sepia, *no* gris neutro), topbar fija **48px** a 100vw con degradado
bronce, sidebar izquierda docked de **260px** en **nogal curado** `#1f1813`, viewport
central escrolleable con fondo radial
`radial-gradient(circle at 50% 10%, #211a15 0%, #0a0806 80%)`. Tablas sobre pergamino
`#eee6d8`. Estética **Retro Tactical / Skeuomorphic-Brutalist**: bevels metálicos pesados,
gradientes oliva-bronce profundos y contenedores de pergamino oscuro.

**Atmosphere Scores:** Density `8–9` (Cockpit Dense) · Variance `7` (Offset Asymmetric, sidebar docked + drawer) · Motion `5–6` (micro-pulsos, sin cinemática)

---

## 2. Color Palette & Roles

> **Resolución de la contradicción del brief**: `DESIGN_ajustado.md` se contradice entre
> su prosa (bronce / pergamino / carmesí / oro / fósforo) y su *frontmatter* YAML (primarios
> M3 crema `#fce8ba` / rosa `#ffb3ac` / menta `#a2ffa3`). **Gana la prosa** — es la fuente
> autoritativa. Del frontmatter sólo se harvesting los **neutros aditivos** (`surface-container-*`).

### Superficies (layout master frame)
| Rol | Hex | Uso |
|-----|-----|-----|
| **Canvas** | `#0a0806` | Fondo de página, fuera del viewport (humo con resto sepia) |
| **Sidebar Panel** | `#1f1813` | Nav lateral docked 260px (nogal curado) |
| **Main Viewport** | `#211a15 → #0a0806` | Radial gradient del área de juego |
| **Rampa de elevación** | `#130d08` · `#211a15` · `#251e19` · `#302823` · `#3c332d` | `surface-container-lowest → -highest` (warm, **no** la escala gris dark-mode por defecto) |
| **Topbar Bronce** | `#5a4a34 → #3b2d20 → #241b12` | Header de recursos 48px |
| **Header Bronce (tablas)** | `#5a4a34 → #3b2d20 → #241b12` | Barras de título, `crimson-th`/`bronze-th` |
| **Pergamino** | `#eee6d8` (panel) · `#f4eee2` (celda) · `#e4dbca` (fila alt) | Tablas de datos, celdas, nav, drawer móvil |

### Bordes estructurales
- `#5a4f3d` — bisel iluminado; `#4a3a2c` — borde de panel; `#3a2e24` — borde bajo; `#332d20` — divisor.
- 1px duro siempre; el topbar usa `border-b-2`. `* { border-color: #3a2e24 }` como fallback global.

### Texto
| Rol | Hex | Uso |
|-----|-----|-----|
| **Tinta sobre pergamino** | `#241c13` | `cell-parchment*`, `v-outer-frame` (**obligatorio**: ver §4) |
| **Body sobre oscuro** | `#eee0d7` | Default del `body` |
| **Dark para cabeceras** | `#f2e3c2` | Títulos `.c` / `crimson-th` sobre bronce, `text-shadow: 0 -1px 0 #120d08` |
| **Cabecera móvil** | `#f2e3c2` | `v-header-c` (bronce móvil) |
| **Muted sobre oscuro** | `#a39a82` / `#979083` | Meta, captions, timestamps, coords |
| **Footer** | `#a89e87` / `#948868` | Líneas de pie (verificadas ≥4.5:1 sobre `#1f1813`) |

### Acentos (semántica de juego)
| Rol | Hex | Uso |
|-----|-----|-----|
| **Carmesí (primario)** | `#a02020` (hondo `#6d1414`) | Sangre/vendetta, badges, alertas, `focus-visible` |
| **Gold (jerarquía/live)** | `#ffe569` | Chips interactivos, totales, cantidad de tropas `( 261 )`, `[LLENO]`, res-chips |
| **Latón (rank)** | `#dfcca0` | Munición, subtítulos, texto de chip |
| **Fósforo (vivo)** | `#5fe06e` | Ticks vivos, timers, `En Línea`,流入 de caja |
| **Ámbar (cautela)** | `#fabd00` | Porcentajes / atención |
| **Naranja (capacidad)** | `#ff9800` | Barras de capacidad |
| **Ember (4ª tinta)** | `#ee7000` | Alcohol — *extensión documentada*, ver abajo |
| **Blue (enlaces coords)** | `#174872` | Enlaces de coordenadas sobre pergamino |
| **Link hover rojo** | `#8b0000` | `a:hover` sobre pergamino |

#### Variantes por superficie (regla dura)
Los acentos tienen **dos variantes** y una sola nunca funciona en ambos contextos:

| Tinta | Sobre pergamino (oscuro) | Sobre nogal/cañón (claro) |
|-------|--------------------------|---------------------------|
| Fósforo | `#1e6b28` (4.94:1) · `#256e2e` | `#5fe06e` (10.3:1) |
| Latón | `#6b5210` (5.55:1) | `#dfcca0` (11.1:1) |
| Ember | `#8f4200` (5.34:1) | `#ee7000` (5.8:1) |
| Carmesí | `#8b1a10` (7.0:1) | `#f0706a` (6.0:1) |

> **Extensión documentada — ember como 4ª tinta de recurso**: el brief define 3 tintes de
> recurso (carmesí/oro/fósforo) pero la UI tiene 4 barras. Asignación final:
> armas → `#a02020` (carmesí), munición → `#dfcca0` (latón), alcohol → `#ee7000` (ember),
> dólares → `#5fe06e` (fósforo, sustituyendo al `#00ff00`/−`#00c000` crudos).

### Degradados obligatorios (brand gradients)
- **`crimson-th` / `bronze-th` (ALIAS → bronce)**: `linear-gradient(180deg, #5a4a34 0%, #3b2d20 50%, #241b12 100%)`, border `#4a3a2c`, texto `#f2e3c2` con `text-shadow: 0 -1px 0 #120d08`. **Vale para todas las páginas** (alias global).
- **`v-header-c`** (cabecera de sección): `linear-gradient(180deg, #5a4a34 0%, #3b2d20 48%, #241b12 52%, #423524 100%)`, `color #f2e3c2`, `border #5a4f3d`. **12px** (ver desviaciones §10).
- **`retro-btn` — INVERTIDO a bronce oscuro**: `linear-gradient(180deg, #5a4732 0%, #35281b 100%)`, bordes bisel `top/left #7c684d`, `bottom/right #140d07`, `color #ffe569` Chivo. Presión → invertir gradiente + `inset 0 1px 3px #000` + `translateY(1px)`. El look pergamino claro anterior vive en **`.retro-btn-parchment`**.
- **`retro-btn-dark`**: `background #1b1612`, border `#3a2e24`, `color #dfcca0`; hover → border `#a02020` + texto `#ffe569`; pressed `#120e0a`.
- **`quick-action-badge`**: nogal `#1f1813`, border `#4a3a2c`, doble bisel inset `#5a4f3d`/`#171009`, `color #dfcca0`; hover `brightness(1.15)`. `__count` = `#a02020` sobre `#6d1414`.

### Contraste verificado (auditoría WCAG AA sobre el DOM compilado)
Auditado programáticamente en `/overview` (261 nodos de texto, 702 elementos).
**0 fallos AA** y **0 radios no-cero** tras la corrección.

| Par | Ratio | Uso |
|-----|-------|-----|
| `#241c13` sobre `#f4eee2` | ≈ 14.2:1 | ✅ AAA — texto sobre pergamino |
| `#f2e3c2` sobre `#5a4a34` | ≈ 8.9:1 | ✅ AAA — títulos `.c` |
| `#ffe569` sobre `#35281b` | ≈ 9.9:1 | ✅ AAA — `retro-btn` |
| `#5fe06e` sobre `#050505` | ≈ 12.9:1 | ✅ AAA — `timer-pill` |
| `#a2927a` sobre `#2d2417` | ≈ 5.0:1 | ✅ AA — strip "Servidor:" |
| `#a89e87` sobre `#1f1813` | ≈ 6.6:1 | ✅ AA — pie de sidebar |
| `#1e6b28` sobre `#e5dfcb` | ≈ 4.9:1 | ✅ AA — fósforo sobre pergamino |
| `#6b5210` sobre `#e5dfcb` | ≈ 5.6:1 | ✅ AA — latón sobre pergamino |
| `#174872` sobre `#f4eee2` | ≈ 7.4:1 | ✅ AAA — enlaces de coords |

### Banned
- Emojis (`🔫`, `💵`, `🥷`, `☰`…) — **SIEMPRE** Material Symbols equivalentes.
- `Inter`, serif genéricas (`Times New Roman`, `Georgia`), gradientes "AI purple".
- Negro puro `#000000` como superficie de texto/celda (solo bordes de tabla).
- **Gris frío** como superficie o texto de mute (`#a0a0a0`, `#888888`, `#333333`) — usar las variantes cálidas (`#a39a82`, `#979083`, `#3a2e24`).
- **Curvas**: todo `border-radius` es `0`. Ver §8.
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
- **Header Row (`.c` / `crimson-th` / `bronze-th`)**: gradiente `#5a4a34 → #241b12`, texto `#f2e3c2` con `text-shadow 0 -1px 0 #120d08`, borde `#4a3a2c`, height `24px`.
- **Sub-header / Cell (`th`, `td.th`)**: fondo pergamino `#f4eee2` / `#e4dbca`, borde `#cfc5b0`, texto `#241c13`, padding `2px 5px`.
- **Interactive Rows**: hover → `#f4eee2`, links `#174872` (coords) / hover `#8b0000` (links de texto).
- **Filas alternadas**: `#eee6d8` / `#e4dbca` + `divide-[#cfc5b0]`.
- **Ledger grid**: `border-collapse` con rejilla 1px; celdas `3px` (compactas) / `6px` (holgadas).

### Buttons & Console Controls
- **`nav-btn`**: beveled parchment `#c8c3b0`, `border #444`, texto `#241c13`, hover `#f1ebda`. Selector de base ▲▼.
- **`nav-select`**: recessed `#f4eee2`, `border #4a3a2c`, `inset 0 1px 3px rgba(0,0,0,0.35)`.
- **`msg-btn`**: `#c7c2b0`, `border-bottom 1px #555`, height `32px`, bold, hover `#ded9c6`.
- **`retro-btn`**: **bronce oscuro invertido** (§2) — texto gold `#ffe569`. Chivo. `min-h` 40–44px en táctil.
- **`retro-btn-parchment`**: el control claro de pergamino (ex-`retro-btn`), texto `#241c13`.
- **`retro-btn-dark`**: cañón `#1b1612`, texto latón `#dfcca0`, hover carmesí.

### Resource Gauges & Chips
- **`res-chip`**: `#251e19`, `border #4a3a2c`, texto `#ffe569` `9px` bold, hover `#302823` + border gold.
- **`timer-pill`**: pozo `#050505`, `color #5fe06e` mono bold, `border #0c7017`, `inset 0 1px 3px rgba(0,0,0,0.9)`. Variante `--spent`: `#979083` sobre `#3a2e24`.
- **Capacity Bar**: track `#2b2b2b` (desktop) / `h-1.5` `#231e16` mobile; fill por recurso (§2).
- **Celdas de instrumento** (`vb-cell` / `vb-well`): celda `#1d1712` con texto `#dfcca0`; pozo `#080605`.

### Unit & Profile Cards
- **`badge-unit`**: casing `#3a2e24`, `box-shadow inset 0 0 0 1px #5a4f3d, inset 0 0 5px rgba(0,0,0,0.85)`, centrado. Nombre `#f2e3c2` 9px, cantidad `( N )` mono `#ffe569`.
- **`avatar-box`**: casing `#3a2e24` `2px`, `inset 0 0 0 1px #5a4f3d, inset 0 0 8px rgba(0,0,0,0.9)`. Subtítulo mono `#dfcca0`.
- **`quick-action-badge`**: tile nogal (§2) + `__count` carmesí.

### Bar & Frame de sección (móvil)
- **`v-outer-frame`**: **cama de pergamino `#eee6d8` dentro de un bisel doble bronce/madera** — borde exterior `#4a3a2c`, `inset 0 0 0 1px #171009` (bisel interior), `inset 0 2px 4px rgba(0,0,0,0.45)` (stamp L2), `0 3px 8px rgba(0,0,0,0.8)` (drop L1).
  - ⚠️ **Declara `color: #241c13` y es load-bearing.** El `body` pone texto *claro* (`#eee0d7`) para el cockpit oscuro; sin esta declaración cualquier hijo sin color propio renderiza claro-sobre-claro (medido 1.01:1). Los hijos con color propio (`.v-header-c`, `.retro-btn`, `.timer-pill`, `.cell-parchment`) no se ven afectados.
  - `.v-outer-frame--wood`: chasis genuinamente nogal `#1f1813` con `color #eee0d7`, para paneles que deben quedar oscuros.
- **`v-header-c`**: cabecera de sección bronce (§2), texto `#f2e3c2`, enlaces `#ffe569`.
- **`v-sub-header`**: `linear-gradient(180deg, #cfc5b0 → #b2ab95)`, `color #241c13`, uppercase, `letter-spacing 0.5px`.
- **`v-divider`**: doble línea — `border-top #332d20` + `border-bottom #5a4f3d`.

### Legacy (vistas NO migradas — no tocar sus clases)
- `btn-tactical`, `btn-crimson`, `cell-dark`, `cell-darker`, `resource-pill-*`, `glow-border-*`.
- El alias `crimson-th` SÍ percola a todas las páginas (único cambio global intencional).
- **Clases con 0 consumidores** (deprecadas, no re-introducir): `cell-parchment`, `v-sub-header`, `res-chip`, `nav-btn`.

---

## 5. Layout Principles (Master Frame)

```
┌────────────────────────────────────────────────────────────────────┐
│ TOPBAR 48px · 100vw · bronce #5a4a34→#241b12                     │
│  [Logo] [Tabla Recursos: Armas|Muni|Alcohol|Dólares|Hora] [Chips] │
├──────────────┬─────────────────────────────────────────────────────┤
│ SIDEBAR 260px│  MAIN VIEWPORT (scroll propio)                     │
│ #1f1813      │  radial-gradient(#211a15 → #0a0806)                │
│ walnut nogal │  ┌──────────────────────────────────────────────┐  │
│ selector base│  │ content: mx-auto (max-w 440→1400px)         │  │
│ nav pergamino│  │ secciones v-outer-frame / tablas pergamino   │  │
│ footer 2006  │  └──────────────────────────────────────────────┘  │
└──────────────┴─────────────────────────────────────────────────────┘
```

### Desktop (≥1024px)
- **Viewport locked**: `h-[100dvh] overflow-hidden flex flex-col`; main scrollea interno (`lg:overflow-y-auto`).
- **Topbar**: `h-12` fija, logo + tabla de recursos (5 col) + chips (Producción / En Línea / TICK / CAPO + logout).
- **Sidebar**: `w-[260px]`, `bg #1f1813` (nogal), `overflow-y-auto`.
- **Main**: `flex-1 overflow-y-auto`, contenido `max-w-[440px] md:max-w-[960px] xl:max-w-[1280px] 2xl:max-w-[1400px]`, padding `px-2 → xl:px-8`.

### Móvil (<1024px)
- **Header sticky**: identity bar (`☰ Menú` retro-btn / logo / online) + strip reloj·Base·Producción + **grid recursos 2×2 pergamino**.
- **Main**: `max-w-[440px] mx-auto`.
- **Drawer**: off-canvas `w-[275px]`, `bg` pergamino, cabecera bronce "MENÚ PRINCIPAL" + ✕, selector base (`▲ ▼` coords) y nav con grupos.

---

## 6. Responsive Rules

| Breakpoint | Comportamiento |
|------------|----------------|
| `<640px` | Drawer móvil visible; grid recursos 2×2 pergamino; secciones en `v-outer-frame`; tropas grid 2 col |
| `sm ≥640px` | Sin cambios estructurales mayores en móvil |
| `lg ≥1024px` | **Switch**: topbar desktop 48px + tabla 5 col; sidebar 260px visible; drawer oculto; main 960px |
| `xl ≥1280px` | Chips extra (En Línea), logo completo, main 1280px |
| `2xl ≥1536px` | Main 1400px |

### Reglas duras
1. **Topbar desktop**: `hidden lg:flex`; header móvil: `lg:hidden`.
2. **Sidebar 260px**: solo `lg+`; en móvil el nav vive en el drawer.
3. **Touch targets** móviles ≥44×44px en botones de acción; navegación retro puede ser 36px.
4. **Timers/coords** nunca se cortan: `min-w`, `truncate` solo en labels.
5. **Badge-unit badge card mobile**: `grid-cols-2`, desktop `grid-cols-4`+.

---

## 7. Motion & Interaction

- **Pulso perpetuo**: `animate-pulse` en estado `[LLENO]`/alerta, punto "En Línea", badges rojos.
- **Hover pergamino**: `transition-colors 0.15s`, fila → `#f4eee2`, link → `#8b0000`.
- **Presión retro-btn**: invertir gradiente + `inset 0 1px 3px #000` + `translateY(1px)` (`.retro-btn:active`).
- **Reloj servidor vivo**: 1s (`LiveClock`), strip `#2d2417` con texto `#a2927a`/`#c9bea5`.
- **Drawer móvil**: `transform -translate-x-full ↔ translate-x-0`, `transition-transform 300ms ease-in-out`.
- **Hardware**: animar SOLO `transform`/`opacity`. `prefers-reduced-motion: reduce` desactiva pulsos.
- Entrada de filas: `fade-in-up` (ya en tokens).
- **Focus visible**: `outline: 1px solid #a02020` global (carmesí, nunca halo suave).

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
- **Curvas — `border-radius: 0` en TODO.** *"Curves are banned"* (brief). Se hace cumplir a nivel
  de token: `@theme { --radius-*: 0px }` neutraliza toda la escala `rounded-sm/md/lg/xl/2xl/3xl/full/base`.
  Dos utilidades de Tailwind se emitten con geometría **dura** (no atadas a la escala) y se
  anulan explícitamente al final de `@layer utilities` en `globals.css`:
  `.rounded` (0.25rem) y `.rounded-[2px]`. **No reintroducir `rounded-*` en TSX.**
- **Acento sin variante de superficie** — un `#ffe569` sobre pergamino da 1.03:1. Usar siempre
  la variante de la tabla §2.
- **Gris frío** en superficies o texto de mute.

---

## 9. Roadmap de Migración por Página

| Página | Estado | Cambios pendientes |
|--------|--------|--------------------|
| **Tokens + primitivas shadcn + componentes** | ✅ Hecho (esta pasada) | Capa de tokens reescrita, 26 primitivas Radix restiladas, puente shadcn |
| `(dashboard)/layout` + marco global | ✅ Hecho | Topbar 48px bronce, sidebar nogal 260px, drawer móvil, viewport locked, scrollbar bronce |
| `/overview` | ✅ Hecho | Secciones fieles al mockup; tabla de puntos con tinta `#221c13` |
| `room.status/construction/recruitment/training` | ✅ Hecho | Filas pergamino + timer-pill (visibles vía QueueStatusCard) |
| `/rooms`, `/buildings`, `/recruitment`, `/training`, `/technologies` | 🔜 Pendiente | Grids → tablas pergamino + badge-unit + `.c` headers. **Tintas ya migradas** |
| `/missions`, `/simulator` | 🔜 Pendiente | Tablas → `.c` + pergamino + timer-pill |
| `/map` | 🔜 Pendiente | Vista lista móvil <640px; coords en links `#174872` |
| `/family`, `/messages` | 🔜 Pendiente | Listas pergamino + badges |
| `/resources`, `/rankings`, `/statistics`, `/profile`, `/settings` | 🔜 Pendiente | Datos sobre pergamino; rankings con glow SOLO trofeos |
| **Rediseño cockpit de 3 columnas (teletría)** | ⏸️ Aprobado, fuera de alcance | Reestructurar `/overview` a 3 columnas de telemetría (perfil+misiones+construcción / Rankings+Tecnologías / recursos+tro+puntos). Vive en el roadmap del brief, **no** en esta pasada |
| `city-news-ticker`, `activity-history` | ⏸️ Retirados del overview | Componentes conservados en repo (sin importar) |

Orden sugerido: cockpit 3 columnas → vistas de gestión (rooms/recruitment) → misiones/mapa → resto.

---

## 10. Implementation Sync Status

### Tokens reales en código
| Token / Clase | Valor | Ubicación |
|---------------|-------|-----------|
| `--canvas-bg` / `--surface-prime` | `#0a0806` / `#1f1813` | `design-tokens.css` |
| Rampa `surface-container-*` | `#130d08`→`#3c332d` (warm) | `design-tokens.css` |
| Rampa pergamino | `#f4eee2` / `#eee6d8` / `#e4dbca` / `#cfc5b0` / `#241c13` | `design-tokens.css` |
| `crimson-th` / `bronze-th` | bronce `#5a4a34→#241b12`, texto `#f2e3c2` | `design-tokens.css` |
| `v-header-c`, `v-sub-header`, `v-outer-frame`, `v-outer-frame--wood`, `v-divider` | §4 | `design-tokens.css` |
| `cell-parchment*`, `ledger-num`, `ledger-row-selected` | §4 | `design-tokens.css` |
| `retro-btn` (invertido), `retro-btn-parchment`, `retro-btn-dark` | §2 | `design-tokens.css` |
| `timer-pill`, `timer-pill--spent`, `res-chip`, `badge-unit*`, `avatar-box*`, `msg-btn`, `nav-btn`, `nav-select`, `quick-action-badge`(+`__count`) | §4 | `design-tokens.css` |
| `v-input`, `v-textarea`, `v-checkbox`, `v-switch`, `v-menu`, `v-well*`, `v-slider-thumb`, `v-tabs-list`, `v-alert`, `v-panel`, `v-dossier`, `v-btn-primary`, `v-ledger` | §2–§4 | `design-tokens.css` |
| **Puente shadcn** (sección `SHADCN BRIDGE`) | Clases `v-*` para que las primitivas Radix hereden el lenguaje material sin hexes ad-hoc | `design-tokens.css` |
| `--font-work-sans/space-grotesk/space-mono` | Arimo / Chivo / JetBrains Mono | `globals.css` + `layout.tsx` (Google Fonts) |
| `--radius-*` | **`0px` (todos)** | `globals.css` `@theme` |
| Scrollbar | track `#1b1610`, thumb bronce | `globals.css` |

### Radios
- **`0px` en todo el sistema.** Sin excepciones. Ver §8 para el mecanismo de arranque.

### Desviaciones documentadas respecto del brief
1. **`v-header-c` a 12px, no 13px.** El brief pide 13px, pero su propia *Density Philosophy*
   desaconseja hacer crecer un elemento que se repite ~20× en pantalla. 12px mantiene la
   densidad sin romper el ancho de columna.
2. **Ember `#ee7000` como 4ª tinta de recurso.** El brief define 3 tintes pero hay 4 barras
   de recurso; se añade ember para alcohol en lugar de forzar un tono fuera de paleta.
3. **`v-outer-frame` como cama de pergamino + bisel doble**, no como chasis repintado de
   nogal. Entrega la firma *double-bezel* del brief con riesgo de regresión cero sobre sus
   35 archivos consumidores (el relleno claro se preserva, sólo se añade el bisel).
4. **`crimson-th`/`bronze-th` conservan mayúsculas y tipografía** (30 archivos). Sólo se
   aplicó el nuevo gradiente bronce + texto `#f2e3c2`; cambiar `text-transform` provocaba
   wraps en columnas de tabla.
5. **Prosa > frontmatter YAML** en la paleta (ver nota al inicio de §2).
6. **`border-[#e53935]` conservado** en `map-view.tsx` (borde de celda "hasOwner"). Es un
   *borde*, no texto: ya cumplía 3.12:1, y sustituirlo por el carmesí del brief `#a02020`
   lo habría dejado en 1.71:1 (prácticamente invisible).

### Verificación
- `lint` → **126 problemas (baseline idéntico)**
- `typecheck` → **74 errores (baseline idéntico)**, todos en prisma8 / GSAP / Recharts / day-picker
- `build` → ✅ 31 rutas
- **Auditoría WCAG AA sobre el DOM compilado de `/overview`**: 261 nodos de texto, **0 fallos**
  (antes 109), **0 radios no-cero** sobre 702 elementos (antes: 25 usos de `rounded` a 4px + `rounded-[2px]`).

---

*Fuente: `.stitch/DESIGN_ajustado.md` + `MOCKUPS/dashboard_overview_unificado.html` · Implementación: 2026-09-26 · Valores verificados contra `design-tokens.css`, `globals.css`, `tailwind.config.ts` y el DOM compilado.*