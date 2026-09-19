---
name: Vendetta Noir
colors:
  surface: '#0d0d0f'
  surface-dim: '#0a0a0c'
  surface-bright: '#19191b'
  surface-container-lowest: '#050506'
  surface-container-low: '#0d0d0f'
  surface-container: '#19191b'
  surface-container-high: '#27272a'
  surface-container-highest: '#3f3f46'
  on-surface: '#f8fafc'
  on-surface-variant: '#94a3b8'
  inverse-surface: '#f8fafc'
  inverse-on-surface: '#0d0d0f'
  outline: '#27272a'
  outline-variant: '#3f3f46'
  surface-tint: '#df2020'
  primary: '#df2020'
  on-primary: '#ffffff'
  primary-container: '#7f1d1d'
  on-primary-container: '#fee2e2'
  inverse-primary: '#fca5a5'
  secondary: '#19191b'
  on-secondary: '#f8fafc'
  secondary-container: '#27272a'
  on-secondary-container: '#94a3b8'
  tertiary: '#f2af0d'
  on-tertiary: '#18181b'
  tertiary-container: '#78350f'
  on-tertiary-container: '#fef3c7'
  error: '#7f1d1d'
  on-error: '#f8fafc'
  error-container: '#450a0a'
  on-error-container: '#fca5a5'
  background: '#0d0d0f'
  on-background: '#f8fafc'
  surface-variant: '#19191b'
  accent: '#f2af0d'
  on-accent: '#18181b'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.04em
  title-sm:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0
  body-base:
    fontFamily: Roboto
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0
  body-muted:
    fontFamily: Roboto
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0
  label-caps:
    fontFamily: Roboto
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  stat-nums:
    fontFamily: Roboto
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.375rem
  lg: 0.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
---

# Design System: Vendetta Noir
**Stack:** Next.js 16 (App Router), Tailwind CSS 4, Shadcn UI, Lucide Icons  
**Theme:** Mafia Crime Syndicate Real-Time Strategy (RTS)

---

## 1. Visual Theme & Atmosphere

Vendetta Noir projects the gritty, ruthless atmosphere of 1930s-1970s organized crime command centers merged with modern tactical RTS density. The canvas is dominated by pitch-black and deep carbon undertones (`#0d0d0f`), evoking smoke-filled backrooms, nocturnal illicit transactions, and warehouse hideouts.

Contrast is intentional, austere, and dramatic: blood-crimson red (`#df2020`) punches through darkness to signify urgency, commands, combat, and administrative authority, while tarnished syndicate gold (`#f2af0d`) highlights wealth, prestige, and active progress. Information density is moderately high (Level 7) to give the player instant command-center clarity over cashflow, troop movements, contraband yields, and construction countdowns without decorative clutter.

---

## 2. Color Palette & Roles

### Primary Foundation
- **Nocturne Canvas** (`hsl(240 5% 5%)` / `#0d0d0f`): Root background surface across the entire viewport. Cold, pitch dark.
- **Armory Card Surface** (`hsl(240 4% 10%)` / `#19191b`): Container panels, list item cards, and modal backdrops.
- **Deep Slate Border** (`hsl(240 3.7% 15.9%)` / `#27272a`): 1px structural hairline borders between cards, rows, and input fields.
- **Smoked Backdrop** (`hsl(240 10% 3.9% / 0.8)` / `#0a0a0ccc`): Backdrop blur layer for floating sticky resource bars and mobile navigation drawers.

### Accent & Interactive
- **Crimson Blood Red** (`hsl(0 75% 50%)` / `#df2020`): The signature brand accent. Used for primary CTA buttons, active state highlights, critical alarms, and clan symbols.
- **Syndicate Gold** (`hsl(45 90% 50%)` / `#f2af0d`): High-value tertiary accent. Reserved for currency indicators, upgrades in queue, special bonuses, and VIP notifications.
- **Muted Steel Plate** (`hsl(240 4% 10%)` / `#19191b`): Secondary button backgrounds and muted surface hover targets.

### Typography & Text Hierarchy
- **Cold White Lead** (`hsl(210 40% 98%)` / `#f8fafc`): Headings, active values, and primary text content. Maximum readability against dark surfaces.
- **Shadow Slate** (`hsl(215 20.2% 65.1%)` / `#94a3b8`): Secondary descriptive text, subtitles, resource labels, and timestamps.
- **Subdued Ash** (`hsl(240 3.7% 40%)` / `#62626b`): Disabled indicators, minor captions, and inactive pagination controls.

### Functional States & Resources
- **Destructive / Threat** (`hsl(0 62.8% 30.6%)` / `#7f1d1d`): Severe alerts, queue cancellations, resource depletion warnings.
- **Armas (Weapons)**: Tactical steel gray with crimson cue (`/img/recursos/armas.svg`).
- **Munición (Ammunition)**: Sulfur brass & amber glow (`/img/recursos/municion.svg`).
- **Alcohol (Contraband)**: Distilled amber barrel tone (`/img/recursos/alcohol.svg`).
- **Dólares (Cash)**: Syndicate cold currency green/gold (`/img/recursos/dolares.svg`).

---

## 3. Typography Rules

### Hierarchy & Weights
The typography utilizes a dual-font personality: **Bebas Neue** commands attention for display headers and titles like an old newspaper headline or 1940s wanted poster, while **Roboto** handles dense data, tables, and system mechanics with precision.

- **Display H1 / Section Titles:** `Bebas Neue`, uppercase, 400 weight (condensed native), `tracking-wider`, 28px - 36px.
- **Card Titles & Headers:** `Bebas Neue` / `Roboto` semi-bold, 20px - 24px, uppercase tracking.
- **Data & Resource Values:** `Roboto`, 700 bold, `tabular-nums` enabled to avoid visual jitter during live count increments.
- **Body & Lore Text:** `Roboto`, 400 regular, 14px (`text-sm`), line-height `1.5`, color `#94a3b8`.
- **Micro Labels & Tags:** `Roboto`, 700 bold, 11px - 12px (`text-xs`), uppercase with `tracking-wider`.

### Spacing Principles
- Headings use compressed line heights (`leading-none` or `leading-tight`) given their condensed uppercase nature.
- Body paragraphs maintain comfortable reading gutters (`space-y-2` to `space-y-4`).
- Numerical HUD readouts always pair a micro-label (`text-xs text-muted-foreground uppercase`) stacked directly over the tabular numeric value (`font-bold text-foreground`).

---

## 4. Component Stylings

### Buttons
- **Primary CTA (`Button variant="default"`):** Background `#df2020`, text white. Hover shifts to `#b91c1c` (crimson/90). Height 40px (`h-10 px-4 py-2`).
- **Tactical Secondary (`Button variant="outline"`):** Border `1px solid #27272a`, background `#0d0d0f`, hover background `#f2af0d` or `#27272a`.
- **Ghost Actions (`Button variant="ghost"`):** Transparent fill, hover background `#27272a/50`, text `#f8fafc`.
- **Corner Radius:** Standardized at `0.5rem` (`rounded-md`).

### Cards & Containers
- **Visual Style:** Flat dark slate (`#19191b`) bounded by a crisp 1px border (`#27272a`).
- **Shadow:** Subtle dark ambient elevation (`shadow-sm`), avoiding soft glow to maintain a gritty, sharp industrial edge.
- **Padding:** Compact `p-4` on dashboard overview tiles; `p-6` on standalone management dialogues.
- **Dividers:** Clean horizontal separators (`divide-y divide-border`) separating items in list views (e.g. room upgrades, recruits).

### Navigation
- **Left Sidebar:** Vertical menu anchored by brand shield icon (`Swords`), with navigation sections grouped into:
  - Core Operations (Visión General, Habitaciones, Reclutamiento, Entrenamiento, Seguridad).
  - Syndicate Logistics (Tecnologías, Familia, Recursos, Mapa, Misiones, Simulador).
  - Intel & Settings (Mensajes, Estadísticas, Clasificaciones, Ajustes).
- **Active Navigation Item:** Highlighted with subtle background shift and bright foreground text.
- **Mobile Navigation:** Bottom or collapsible slide-out drawer via `SidebarProvider` with Sheet primitives.

### Domain-Specific Components
- **Top Sticky Resource Bar (HUD):**
  - Frosted glass container (`bg-background/95 backdrop-blur-sm border-b border-border`).
  - Displays the 4 syndicate assets: ARMAS, MUNICIÓN, ALCOHOL, DÓLARES alongside real-time server synchronizer and local clock (`LiveClock`).
  - Capacity warnings switch dynamically: regular (`text-accent`), >80% warning (`text-yellow-500`), >95% critical overflow (`text-red-500`).
- **Construction & Training Queues:**
  - Card progress indicators showing target level, countdown timers, and batch status.
  - Active queue status uses hourglass icon with amber warning tone.
- **Room / Troop Detail Cards:**
  - Thumbnail box (80x56px) with object-cover preview image.
  - Upgrade requirements row displaying item costs in resource icons + quantities + construction duration.

---

## 5. Layout Principles

### Grid & Structure
- **Max Width:** Centered container clamped at `1400px` (`2xl`) with horizontal padding (`2rem`).
- **Dashboard Grid:** Responsive 12-column grid (`grid grid-cols-1 md:grid-cols-12 gap-4`) for room listings and tactical matrices.
- **City Map Matrix:** Dedicated custom grid templates (`grid-cols-15` and `grid-cols-17`) for neighborhood territory maps.

### Whitespace Strategy
- Base unit: 4px.
- Component-level spacing: 8px (`gap-2`) to 16px (`gap-4`).
- Section breaks: 24px (`space-y-6`).

### Alignment & Visual Balance
- Strict left alignment for textual content and descriptions.
- Right or tabular alignment for numeric counts, currency values, and timers.
- Avatars and status icons framed in circular or `rounded-md` bounding borders.

---

## 6. Design System Notes for Stitch Generation

### Language to Use
- *Visual tone:* "Noir crime command terminal", "Syndicate tactical RTS dashboard", "Cold-blooded mafia management interface", "Grimy industrial dark mode with crimson highlights".
- *Elements:* "Hairline charcoal borders", "Tabular digital readouts", "Distressed syndicate gold accents", "High-contrast tactical iconography".

### Color References
- Canvas: `#0d0d0f`
- Surface: `#19191b`
- Border: `#27272a`
- Crimson Accent: `#df2020`
- Syndicate Amber/Gold: `#f2af0d`
- Text Primary: `#f8fafc`
- Text Muted: `#94a3b8`

### Component Prompts
- **Resource HUD:** "A top-docked sticky dark HUD bar with glassmorphic blur, showing 4 mafia resources (Weapons, Ammo, Alcohol, Cash) with SVG icons and bold white tabular numbers, bordered by subtle 1px zinc lines."
- **Operation Upgrade Card:** "A dark mafia management row item with an 80px rectangular thumbnail, Bebas Neue room title, crimson level badge, resource cost pills with miniature icons, a duration clock, and an outline action button."
- **HQ Overview Dashboard:** "A crime syndicate executive dashboard with high-contrast player avatar, property photo card with bottom gradient text overlay, quick notification action buttons, and a 5-column metric ribbon."

### Incremental Iteration
- When adding new modules, retain `Bebas Neue` strictly for headers and `Roboto` with `tabular-nums` for gameplay stats.
- Keep card backgrounds at dark zinc (`#19191b`) and never introduce pure white cards or bright saturated blue gradients.
