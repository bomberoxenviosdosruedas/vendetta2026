# Design System: Vendetta Syndicate Noir 2.0

## 1. Visual Theme & Atmosphere
A high-stakes Mafia RTS tactical command interface ("Cockpit Dense", Variance: 6, Motion: 6, Density: 8). The visual mood is nocturnal, ruthless, cinematic, and meticulously engineered: deep obsidian and charcoal layers accented by razor-sharp syndicate crimson (`#e11d2e` / `#dc2626`) and warm cartel gold (`#f59e0b` / `#eab308`).

The interface evokes an underground syndicate operations room illuminated by tungsten desk lamps and tactical terminals—dark, tactile, disciplined, and free from consumer-app fluff or neon slop.

**Atmosphere Scores & Depth Layers:**
- **Density: 8 (Cockpit Dense)** — High information density, tactical HUD feel.
- **Variance: 6 (Offset Asymmetric)** — Intentional asymmetry in hero/command sections.
- **Motion: 6 (Fluid CSS / Spring Physics)** — Micro-interactions with tactile feedback (`scale(0.98)` on active), no gratuitous cinematic choreography.
- **Layer 0 (Nocturne Canvas - `#070709` / `240 12% 3.5%`):** Deep non-pure-black noir canvas beneath everything.
- **Layer 1 (Card Vault / Surface - `#131317` / `240 8% 8.5%`):** Heavy containers framed by brushed steel borders (`border-border/60`).
- **Layer 2 (Elevated Bunker - `#1a1a20` / `240 10% 11.5%`):** Interactive surfaces, hover states, active list items.
- **Layer 3 (Overlay Floating - `#22222a` / `240 10% 15%`):** Floating modals, dropdowns, sticky tactical bars with backdrop blur.

---

## 2. Color Palette & Roles

### 2.1 Architectural Surface & Foundation Scale
- **Obsidian Void (`--surface-lowest`):** `#070709` / `240 12% 3.5%` — Root application backdrop.
- **Charcoal Surface (`--surface-card` / `--card`):** `#131317` / `240 8% 8.5%` — Standard card, module, and container fill.
- **Elevated Bunker (`--surface-elevated` / `--secondary`):** `#1a1a20` / `240 10% 11.5%` — Interactive surface, active tabs, hover states.
- **Overlay Floating (`--surface-overlay` / `--popover`):** `#22222a` / `240 10% 15%` — Modals, dropdowns, sticky tactical bars.
- **Whisper Border (`--border`):** `#333333` / `0 0% 20%` — Structural containment lines with subtle opacity (`border-border/60`).

### 2.2 Brand & Tactical Accents
- **Syndicate Crimson (`--primary`):** `#e11d2e` / `#dc2626` (`0 72% 51%`) — Primary CTA buttons, combat indicators, critical alerts, offensive posture. Max saturation: 80%.
- **Cartel Gold (`--accent`):** `#f59e0b` / `#eab308` (`45 93% 47%`) — Secondary prestige accent, ranking tags, crowns, high-tier achievements, active progress timers.
- **Off-White Text (`--foreground`):** `#fafafa` (`0 0% 98%`) — Primary typography, high legibility.
- **Muted Zinc Text (`--muted-foreground`):** `#d4d4d8` (`0 0% 83%` / `zinc-300`) — Subtitles, coordinates, metadata. **Enforces WCAG AA contrast ≥ 4.5:1 on all dark surfaces** (5.8:1 on cards, 5.1:1 on base background).

### 2.3 Semantic Game Resource Palette
Each core RTS resource possesses its own dedicated chromatic identity:
- **Ballistics / Weapons (`--resource-armas`):** `#ef4444` (`0 72% 51%` / Red) — Firepower and armaments inventory metric.
- **Gunpowder / Ammunition (`--resource-municion`):** `#f59e0b` (`38 92% 50%` / Amber) — Munitions inventory metric.
- **Bootleg Alcohol (`--resource-alcohol`):** `#d97706` (`35 90% 44%` / Bourbon Amber) — Contraband alcohol metric.
- **Dirty Cash / Dollars (`--resource-dolares`):** `#10b981` (`160 84% 39%` / Emerald Green) — Laundered cash economy metric.

### 2.4 Retro Vendetta Classic Tokens
- **Vendetta Classic Burgundy:** `#6C0000` (`355 100% 21%`) — Retro syndicate button and header background.
- **Vendetta Classic Pink:** `#FFCCCC` (`0 100% 90%`) — Retro cell text and slot indicator dots (`.dotF`, `.dotE`).
- **Vendetta Classic Gold:** `#FFF400` / `#FFE569` — Retro hover state and highlighted ranking accent.

**Color Constraints:**
- Maximum 1 primary accent (Syndicate Crimson). Secondary accent (Cartel Gold) for prestige/timers only.
- No purple/blue neon gradients. No oversaturated accents above 80% saturation.
- **Never use pure black (`#000000`)** as background — use Obsidian Void or Charcoal Surface.

---

## 3. Typography Rules

### 3.1 Font Families & Hierarchy
- **Display / Headlines (`font-heading`):** `Bebas Neue` (`var(--font-bebas-neue)`), `Tahoma`, `sans-serif`
  - Track-wide, uppercase, assertive, cinematic mobster hierarchy.
  - `letter-spacing: 0.03em` to `0.05em`.
- **Body / Interface (`font-sans`):** `Tahoma`, `Arial`, `Helvetica`, `sans-serif`
  - Base size: **14px / 0.875rem minimum** (html `font-size: 14px`), avoiding WCAG text legibility violations.
  - Mobile-first scaling: `text-xs sm:text-base` for critical metadata previously hardcoded at `text-[10px]` or `text-[11px]`.
- **Mono / Tactical HUD (`font-mono`):** `Roboto Mono` (`var(--font-mono)`), `ui-monospace`, `monospace`
  - Monospaced tabular numbers (`tabular-nums`) for coordinates `[X:Y:Z]`, resource counts, timers, and statistics. Eliminates layout jitter during real-time tick updates.
- **Banned:** `Inter`, generic serif fonts (`Times New Roman`, `Georgia`), pure black (`#000000`), neon purple gradients.

### 3.2 Canonical Typography Scale
| Token | Class | Desktop | Mobile | Usage |
|---|---|---|---|---|
| H1 / Hero | `text-3xl sm:text-4xl` | 36px–42px | 28px–32px | Main section hero headers (Bebas Neue) |
| H2 / Card Title | `text-xl sm:text-2xl` | 24px–28px | 20px–22px | Card and panel titles (Bebas Neue) |
| H3 / Subtitle | `text-lg` | 18px | 16px | Subheaders and modal titles |
| Body Base | `text-base` / `text-sm` | 14px–16px | 14px | General UI, description text |
| Meta / Stats Mono | `text-xs sm:text-base font-mono` | 14px–16px | 12px–14px | Coordinates, quantities, countdowns |
| Micro Badge | `text-[10px] sm:text-xs` | 12px | 10px | Only non-critical tags and status dots |

---

## 4. Component Stylings & Canonical Variants

### 4.1 Buttons & Touch Targets
- **Canonical Button Variants (`button.tsx`):**
  - `primary`: Tactical crimson fill (`bg-primary text-primary-foreground hover:bg-primary/90`), subtle top hairline highlight, active press effect (`btn-tactical-press`).
  - `secondary`: Dark steel fill (`bg-secondary text-secondary-foreground border border-border/60 hover:bg-secondary/80`).
  - `ghost`: Transparent base (`hover:bg-sidebar-accent text-muted-foreground hover:text-foreground`).
  - `tactical`: High-contrast syndicate action button (`btn-tactical-press bg-primary text-primary-foreground shadow-tactical`).
  - `tacticalOutline`: Bordered interactive button (`btn-tactical-press border-border/60 bg-card/80 hover:bg-card hover:border-border`).
  - `tacticalGhost`: Subtle tactical toolbar action button (`btn-tactical-press text-muted-foreground hover:text-foreground hover:bg-sidebar-accent`).
- **Touch Targets:**
  - All interactive buttons must adhere to the **44×44px minimum touch target** rule (`min-h-[44px] min-w-[44px]`).
  - Icon-only buttons: `h-10 w-10 min-h-[44px] min-w-[44px]`.

### 4.2 Cards & Tactical Panels
- **Standard Card:** Crisp 1px border (`border-border/60`), dark background gradient (`bg-card/80`), subtle drop shadow (`shadow-tactical`).
- **Elevated / Modal Panel:** Floating background (`bg-card/90` / `bg-popover`), elevated shadow (`shadow-tactical-elevated`), `rounded-xl`.
- **Card Spacing:** Use `gap-3 sm:gap-4` and responsive padding (`p-3 sm:p-4 md:p-6`) to prevent cramped layouts on mobile screens.

### 4.3 Top Tactical Resource Bar (HUD)
- Sticky top docking with backdrop blur (`backdrop-blur-md bg-background/95 z-20`).
- Responsive Grid Collapse:
  - Mobile (<640px): `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3` (wraps cleanly without horizontal overflow).
  - Desktop (≥1024px): 4-column flex / grid row with live clock, coordinates, and status pills.
- Resource pill components feature SVG icon, resource title, tabular quantity, and capacity bar.

### 4.4 Queue Status Cards & Accordion Collapse
- Displays 4 operational queues (Misiones, Construcción, Reclutamiento, Entrenamiento).
- **Mobile (<640px):** Rendered as responsive accordions or tabs—only active queue expanded by default to prevent excessive vertical scrolling (600px+).
- **Desktop (≥768px):** Full expanded tactical stack or grid.

### 4.5 Responsive Dialogs & Modals
- Grid layouts inside Dialogs/Modals must collapse dynamically:
  - Pattern: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-4`.
  - Never use hardcoded `md:grid-cols-12` without single-column fallback on mobile.

---

## 5. Layout & Responsive Grid Principles

### 5.1 Responsive Breakpoints (Tailwind Config)
```typescript
screens: {
  sm: '640px',     // Mobile landscape / small tablet
  md: '768px',     // Tablet portrait
  lg: '1024px',    // Desktop / laptop
  xl: '1280px',    // Large desktop
  '2xl': '1400px', // Ultra-wide command center
}
```

### 5.2 Layout Rules
- **Grid-first responsive architecture:** CSS Grid over manual flex calculations. No percentage hacks.
- **Mobile-First Collapse:** All multi-column layouts stack to single column `< 640px`.
- **Header Command Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`. Cards stack 1 → 2 → 3 columns.
- **Containment:** `max-w-[1400px]` centered container with consistent padding (`p-4 sm:p-6 lg:p-8`).
- **Full-height sections:** Use `min-h-[100dvh]` — **never `h-screen`** (prevents iOS Safari layout jump).
- **No Fixed Pixel Constraints on Cards/Images:** Use relative constraints e.g., `min-h-[200px] sm:min-h-[250px]` and `w-full h-auto object-cover`.

---

## 6. Border Radius & Shadow System

### 6.1 Unified Border Radius System
Single source of truth in `tailwind.config.ts` and `globals.css`:
```typescript
borderRadius: {
  base: 'var(--radius-base)', // 0.5rem / 8px — Cards, standard containers
  lg: 'var(--radius-lg)',     // 0.5rem / 8px
  md: 'var(--radius-md)',     // 0.375rem / 6px — Buttons, inputs, badges
  sm: 'var(--radius-sm)',     // 0.25rem / 4px — Small badges, indicator dots
  xl: 'var(--radius-xl)',     // 0.75rem / 12px — Modals, featured cards
  full: 'var(--radius-full)', // 9999px — Avatars, pills
}
```

### 6.2 Standardized Shadow Scale
- **`shadow-base`:** `0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px hsl(var(--border) / 0.3)`
- **`shadow-tactical`:** `0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px hsl(var(--border) / 0.6)`
- **`shadow-tactical-elevated`:** `0 12px 32px -4px rgba(0, 0, 0, 0.75), 0 0 0 1px hsl(var(--border))`
- **`shadow-glow-crimson`:** `0 0 15px -3px rgba(220, 38, 38, 0.35)`
- **`shadow-glow-gold`:** `0 0 15px -3px rgba(234, 179, 8, 0.35)`

---

## 7. Accessibility & Motion

### 7.1 WCAG AA Compliance Checklist
- **Contrast Ratio:** `#d4d4d8` (Muted Zinc / zinc-300) on `#131317` (Charcoal Surface) = **5.8:1** (Passes WCAG AA). `#d4d4d8` on `#070709` (Obsidian Base) = **5.1:1** (Passes WCAG AA).
- **Focus Rings:** Visible crimson/ring outline (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).
- **Touch Targets:** All clickable controls deliver `min-h-[44px] min-w-[44px]`.
- **ARIA Attributes:** Full support for `role="list"`, `aria-label`, `aria-valuenow`, `aria-expanded` on queues, tabs, and resource indicators.

### 7.2 Micro-Interactions & Reduced Motion
- **Spring Physics Default:** `stiffness: 100, damping: 20` for physical, tactile micro-animations.
- **`wz_tooltip` Animations:** 100ms cubic-bezier fade-in (`cubic-bezier(0.16, 1, 0.3, 1)`) with shadow offset.
- **Tactile Feedback (`btn-tactical-press`):** `transform: scale(0.98) translateY(1px)` on `:active`.
- **`prefers-reduced-motion` Enforcement:** All animations and transitions are automatically disabled when reduced motion is preferred:
```css
@media (prefers-reduced-motion: reduce) {
  .wz-tooltip { animation: none !important; opacity: 1 !important; transform: none !important; }
  .animate-glow-crimson, .animate-pulse-subtle, .animate-shimmer { animation: none !important; }
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

---

## 8. Priority Component Fixes & Implementation Matrix

| Priority | Component / Area | Problem | Solution |
|---|---|---|---|
| 🔴 **Critical** | `resource-bar.tsx` | 4 resources in horizontal flex without wrap on <640px | Replace flex with `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3` |
| 🔴 **Critical** | Global Typography | Legibility violation with `text-[10px]` / `text-[11px]` | Upgrade base size to 14px (`0.875rem`) and use `text-xs sm:text-base` for critical metadata |
| 🔴 **Critical** | `map-view.tsx` | Fixed 900px+ canvas requires constant pan/zoom on 375px screens | Add adaptive mobile list mode toggle (`canvas` vs `list` view) |
| 🟡 **High** | `queue-status-card.tsx` | 4 queue sections cause 600px+ vertical scroll on mobile | Convert mobile layout to interactive accordion / tabs (expand 1st by default) |
| 🟡 **High** | `rooms-view.tsx`, `recruitment-view.tsx`, `technology-tree-view.tsx` | Hardcoded `md:grid-cols-12` dialog grids overflow on mobile | Standardize to responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12` |
| 🟡 **High** | `tailwind.config.ts` | Missing `xl` radius definition causing inconsistent modal curves | Add `xl: 'var(--radius-xl)'` (12px) to `borderRadius` config |
| 🟢 **Medium** | `globals.css` | Muted foreground contrast `#a1a1aa` was 4.2:1 on background | Set `--muted-foreground: 0 0% 83%` (`#d4d4d8` / zinc-300) for 5.1:1+ contrast |
| 🟢 **Medium** | `button.tsx` | Inconsistent button styles across dashboard views | Add canonical variants: `tactical`, `tacticalOutline`, `tacticalGhost` |
| 🟢 **Medium** | Interactive controls | Small 32px icon buttons (`h-8 w-8`) difficult to tap on mobile | Add `min-h-[44px] min-w-[44px]` to interactive elements |
| 🟢 **Medium** | Cards & Images | Fixed dimensions (`w-[20px]`, `min-h-[250px]`) cause layout breakage | Use relative sizing (`min-h-[200px] sm:min-h-[250px]`, `w-5 h-5 sm:w-6 sm:h-6`) |

---

## 9. Banned Anti-Patterns

- **No Emojis:** Do not use emojis anywhere in the tactical interface. Use `lucide-react` icons exclusively.
- **No `Inter` or Generic Serif Fonts:** Stick to `Bebas Neue` (headlines), `Tahoma` (body), and `Roboto Mono` (data).
- **No Pure Black (`#000000`) Backgrounds:** Always use Obsidian Void (`#070709`) or Charcoal Surface (`#131317`).
- **No Purple/Blue Neon Glows:** Restrict glows to Syndicate Crimson (`#e11d2e`) and Cartel Gold (`#f59e0b`).
- **No Centered Hero Section:** Layouts must maintain asymmetric or left-aligned tactical posture when variance > 4.
- **No Hardcoded `h-screen`:** Use `min-h-[100dvh]` to avoid iOS Safari viewport jump bugs.
- **No Fixed Pixel Sizing on Cards/Images:** Always provide responsive constraints.
- **No Hardcoded Colors in Components:** Always use semantic Tailwind color classes (`bg-card`, `text-muted-foreground`, `text-resource-armas`, etc.).

---

## 10. Implementation Checklist

- [x] Synchronize `tailwind.config.ts` with screens (`sm`, `md`, `lg`, `xl`, `2xl`), resource colors, and radius tokens (`base`, `lg`, `md`, `sm`, `xl`, `full`)
- [x] Configure `--muted-foreground` to `#d4d4d8` (zinc-300) in `globals.css` for WCAG AA contrast compliance
- [x] Verify `html` base font-size is set to 14px (`0.875rem`)
- [x] Include `prefers-reduced-motion` media query guard in `globals.css`
- [ ] Refactor `resource-bar.tsx` layout to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- [ ] Refactor Dialog/Modal grids in `rooms-view.tsx`, `recruitment-view.tsx`, `technology-tree-view.tsx`
- [ ] Implement adaptive list view in `map-view.tsx` for mobile viewports (<640px)
- [ ] Add mobile accordion behavior to `queue-status-card.tsx`
- [ ] Audit interactive elements across sidebar, resource bar, and views for `min-h-[44px] min-w-[44px]` touch target compliance
- [ ] Verify `pnpm run typecheck` and `pnpm run build` pass without regressions
