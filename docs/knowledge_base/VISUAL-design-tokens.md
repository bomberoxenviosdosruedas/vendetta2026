---
name: Vendetta Syndicate
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cac6bc'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#939187'
  outline-variant: '#48473f'
  surface-tint: '#cac7b5'
  primary: '#fcf7e5'
  on-primary: '#323125'
  primary-container: '#dfdbc9'
  on-primary-container: '#626052'
  inverse-primary: '#615f50'
  secondary: '#ffbf81'
  on-secondary: '#4a2800'
  secondary-container: '#ff9800'
  on-secondary-container: '#653900'
  tertiary: '#fff5f3'
  on-tertiary: '#690000'
  tertiary-container: '#ffd0c8'
  on-tertiary-container: '#c20301'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e7e3d0'
  primary-fixed-dim: '#cac7b5'
  on-primary-fixed: '#1d1c11'
  on-primary-fixed-variant: '#49473a'
  secondary-fixed: '#ffdcbe'
  secondary-fixed-dim: '#ffb870'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#693c00'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#930000'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  header-bronze-top: '#443c2c'
  header-bronze-mid: '#2a2418'
  header-bronze-bot: '#16120b'
  table-header-top: '#5c523d'
  table-header-mid: '#3a3224'
  table-header-bot: '#201a11'
  cell-parchment: '#dfdbc9'
  cell-parchment-hover: '#efeadd'
  cell-dark-bg: '#25221c'
  border-bronze: '#5a4b33'
  border-dark: '#332d20'
  gold-accent: '#ffe569'
  money-green: '#4caf50'
  danger-red: '#e53935'
typography:
  headline-lg:
    fontFamily: Chivo
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  headline-md:
    fontFamily: Chivo
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  headline-sm:
    fontFamily: Chivo
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
  body-md:
    fontFamily: Arimo
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Arimo
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  body-xs:
    fontFamily: Arimo
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 12px
spacing:
  gutter: 0.5rem
  margin: 1rem
  space-xs: 0.125rem
  space-sm: 0.25rem
  space-md: 0.5rem
  space-lg: 0.75rem
  space-xl: 1rem
---

## Brand & Style
Vendetta Syndicate embodies a gritty, tactical mid-2000s browser-based MMORPG aesthetic (inspired by classic mafia / cartel management games). The brand conveys ruthless criminal enterprise management, high stakes, calculation, and tactical grit.

The design movement is **Retro Tactical / Skeuomorphic-Brutalist**:
- High-density data tables and compact cell structures reminiscent of classic web strategies.
- Heavy metallic bevels, deep olive/bronze gradients, and scorched dark parchment containers.
- Dark, atmospheric canvas with stark high-contrast warm beige (`#DFDBC9`) and metallic bronze accents.
- Purposeful absence of bubbly modern whitespace in favor of maximum screen utilization, tactical legibility, and physical console-like density.

## Colors
The palette is rooted in classic 2000s dark-mode strategy interfaces:
- **Canvas Base (`neutral`)**: Pitch charcoal `#0b0b0b` to `#050505` providing maximum contrast.
- **Parchment Surface (`primary`)**: `#DFDBC9`, a vintage manila-folder hue used for data tables, primary links, and high-readability row cells.
- **Industrial Bronze Gradients**: Used across headers (`#443c2c` down to `#16120b`) and primary section titles (`#5c523d` down to `#201a11`).
- **Tactical Accents**:
  - Gold (`#ffe569`) highlights interactive chips, total scores, and resource status.
  - Green (`#4caf50` / `#008800`) indicates incoming/positive cash flow, ally rankings, and safe statuses.
  - Red (`#e53935` / `#c00000`) marks critical resource caps, attack warnings, and logout states.

## Typography
Typographic rules follow dense, utilitarian browser gaming conventions:
- **Headlines (`Chivo`)**: Heavy, sharp, authoritative display text for table section bars, banner titles, and header indicators.
- **Body (`Arimo`)**: Neutral, compact, high-legibility sans-serif matching web-safe classic screen rendering (Tahoma/Arial fallback) across menu links and data labels.
- **Data & Timers (`JetBrains Mono`)**: Strict monospaced tabular numerals for countdowns (`00:00:00`), military resource quantities (`15.429.615`), and coordinate references (`40:23:220`).

## Layout & Spacing
The layout uses a fixed docked cockpit layout with viewport containment:
- **Fixed Resource Topbar**: `48px` rigid height, spans 100vw, holding live meter bars and resource counts.
- **Docked Sidebar**: Fixed `215px` width on the left, containing a full-height collapsible command menu and planet coordinate selector.
- **Main Viewport Canvas**: Fluid scrollable central staging area capped at a max-width of `900px` to maintain classic table readability without horizontal distortion.
- **Rhythm**: Micro-spacing scale (`2px`, `4px`, `8px`, `12px`). Table cell paddings are locked between `2px` and `6px` to maximize vertical data density.

## Elevation & Depth
Elevation is expressed through skeuomorphic layered relief and heavy bevels rather than modern diffused drop shadows:
- **Header & Title Bars**: Linear vertical gradients with 1px top highlight and 1px inset dark shadow, finished with `text-shadow: 1px 1px 1px #000000`.
- **Containers**: Inset perimeter shadows (`inset 0 0 5px rgba(0,0,0,0.8)`) applied to unit badges and avatar boxes to create an inset console aperture effect.
- **Borders**: Dual-line contrast borders (`1px solid #000000` or `#4a3e29`) delineating data cells.
- **Drop Shadows**: Deep black ambient drop (`0 4px 12px rgba(0, 0, 0, 0.9)`) on top navigation and sticky floating action bars.

## Shapes
Sharp, industrial precision:
- Standard `roundedness: 0` (0px radius) across all tables, table headers, coordinate selectors, and action trays.
- Micro-radius of `2px` to `3px` is reserved strictly for interactive badge units (`.badge-unit`, `.avatar-box`) and status chips (`.res-chip`) to evoke mechanical stamped physical chips.

## Components

### Tables & Data Grids
- **Header Row (`.c`)**: Linear gradient background (`#5c523d` to `#201a11`), bold white text (`#ffffff`) with 1px drop shadow, 1px solid `#4a3e29` border, height `24px`.
- **Sub-header / Cell (`th`, `td.th`)**: Solid parchment background (`#DFDBC9`), 1px solid black border, black text (`#000000`), compact padding (`2px 5px`).
- **Interactive Rows**: On hover, parchment cells tint to `#efeadd` with dark red underline hyperlinks (`#8b0000`).

### Buttons & Console Controls
- **Tactical Nav Button (`.nav-btn`)**: Beveled parchment button (`#c8c3b0`), 1px dark border, bold sans-serif text, hover transition to `#dfdbc9`.
- **Quick Action Bar (`.msg-btn`)**: Stacked beveled tiles, `#c7c2b0` background, 1px white top highlight, 1px dark bottom shadow, displaying icon and bold count.
- **Dropdown Selector (`.nav-select`)**: Recessed `#eee8d5` background, centered text, 1px border.

### Resource Gauges & Chips
- **Resource Chip (`.res-chip`)**: `#252017` dark bronze base, 1px `#4a3e29` border, `#ffe569` gold text, 2px rounded corners.
- **Capacity Bar (`.res-bar-container`)**: 3px tall slot with `#2b2b2b` background and saturated fill bars (Orange `#ff9800`, Green `#4caf50`, Red `#e53935`).

### Unit & Profile Cards
- **Unit Badge (`.badge-unit`)**: Stamped recessed dark frame (`#25221c`), 1px `#5a503a` border, internal inset shadow, top emoji/graphic, bold title, and monospaced gold quantity `( 261 )`.
- **Avatar Box (`.avatar-box`)**: 130x115px fixed frame, `#242018` background, 2px `#5e5138` border, centered faction icon and tier rank subtitle.