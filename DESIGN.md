# Design System: Vendetta Syndicate Noir

## 1. Visual Theme & Atmosphere
A high-stakes Mafia RTS tactical command interface ("Cockpit Dense", Variance: 6, Motion: 6, Density: 8). The visual mood is nocturnal, ruthless, and meticulously engineered: deep obsidian and charcoal layers accented by razor-sharp syndicate crimson (`#dc2626`) and warm cartel gold (`#eab308`). The atmosphere evokes an executive syndicate operations table illuminated by streetlamps and radar terminals—dark, tactile, disciplined, and free from consumer-app fluff or neon slop.

**Atmosphere Scores:**
- Density: 8 (Cockpit Dense) — High information density, tactical HUD feel
- Variance: 6 (Offset Asymmetric) — Intentional asymmetry in hero/command sections
- Motion: 6 (Fluid CSS) — Spring-physics micro-interactions, no cinematic choreography

## 2. Color Palette & Roles
- **Obsidian Void** (`#09090C` / `240 10% 4.5%`) — Primary background foundation under everything; deep non-pure-black noir canvas.
- **Charcoal Surface** (`#131317` / `240 8% 8.5%`) — Standard card, module, and container fill.
- **Elevated Bunker** (`#1C1C23` / `240 7% 12%`) — Interactive surface, hover states, and active list items.
- **Overlay Floating** (`#23232C` / `240 7% 15%`) — Floating modals, dropdowns, sticky tactical bars.
- **Whisper Border** (`#272730` / `240 6% 16%`) — 1px structural containment lines with subtle opacity.
- **Syndicate Crimson** (`#DC2626` / `0 72% 51%`) — Primary accent for critical CTA buttons, combat indicators, alerts, and offensive posture. **Max saturation: 72%**.
- **Cartel Gold** (`#EAB308` / `45 93% 47%`) — Secondary prestige accent for family tags, ranking crowns, and high-tier achievements.
- **Dirty Cash / Dollars** (`#10B981` / `160 84% 39%`) — Laundered cash economy metric.
- **Gunpowder / Ammunition** (`#F59E0B` / `38 92% 50%`) — Munitions inventory metric.
- **Bootleg Alcohol** (`#D97706` / `35 90% 44%`) — Contraband alcohol metric.
- **Ballistics / Weapons** (`#EF4444` / `0 84% 60%`) — Armaments stockpile metric.
- **Off-White Text** (`#F4F4F6` / `210 25% 96%`) — Primary typography, high legibility.
- **Muted Zinc Text** (`#A1A1AA` / `215 16% 62%`) — Subtitles, coordinates, and metadata. **Verify contrast ≥ 4.5:1 on dark surfaces**.
- **Vendetta Classic Burgundy** (`#6C0000`) — Authentic retro syndicate button and header background.
- **Vendetta Classic Pink** (`#FFCCCC`) — Authentic retro cell text and indicator dots (`.dotF`, `.dotE`).
- **Vendetta Classic Gold** (`#FFF400` / `#FFE569`) — Retro hover state and highlighted ranking accent.

**Color Constraints:**
- Maximum 1 primary accent (Syndicate Crimson). Secondary accent (Cartel Gold) for prestige only.
- No purple/blue neon gradients. No oversaturated accents above 80% saturation.
- Never use pure black (`#000000`) — use Obsidian Void or Charcoal Surface.

## 3. Typography Rules
- **Display / Headlines:** `Bebas Neue` (`var(--font-bebas-neue)`) / `Tahoma` — Track-wide, uppercase, assertive, cinematic mobster hierarchy. `letter-spacing: 0.03em`.
- **Body / Interface:** `Tahoma`, `Arial`, `Helvetica`, `sans-serif` (base: **14px / 0.875rem minimum**, not 10pt) — Authentic Vendetta syndicate feel, high density readability. **Mobile-first: `sm:text-base` for critical text currently at `text-xs`**.
- **Mono / Tactical HUD:** `Roboto Mono` (`var(--font-mono)`) — Tabular numbers for coordinates `[X:Y:Z]`, resource quantities, countdown timers, and statistics. Never use proportional digits for RTS data. **Enforced for all numbers at Density ≥ 7**.
- **Banned:** `Inter`, generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`, `Palatino`), pure black (`#000000`), neon purple gradients.
- **Line Height:** Relaxed leading for body (1.6), tight for headlines (1.1).
- **Max Line Width:** 65 characters for body text.

## 4. Component Stylings
- **Buttons:** Tactile feedback (`-1px translateY` on active, `scale 0.98`). Solid crimson or subtle border variants. No neon outer glows. **Minimum touch target: 44×44px including padding**.
- **Cards:** Crisp 1px borders with `border-border/60`, subtle dark gradient fill (`from-card to-card/70`), soft ambient drop shadow. **Generously rounded corners: `rounded-xl` (0.75rem / 12px)**. Used only when elevation serves hierarchy. **High-density (mobile): replace with `border-t` dividers or negative space**.
- **Badges / Status:** Compact, `rounded-md` with 1px border and semitransparent background.
- **Loaders:** Skeletal shimmer matching exact layout dimensions; no generic circular spinners.
- **Empty States:** Composed syndicate dossier cards with actionable CTA (e.g., "Sin Familia - Unirse o Crear").
- **Images:** **Responsive by default** — `w-full h-auto object-cover` with relative constraints. **No fixed `w-20 h-16` dimensions**. Cards: `min-h-[200px] sm:min-h-[250px]`.
- **Tables:** **Mobile stack** — convert to vertical card layout `< 768px`. Desktop: `font-size: 0.875rem` minimum, tabular-nums for data columns.
- **Inputs/Forms:** Label above input, helper text optional, error text below. Standard gap spacing. Focus ring in Syndicate Crimson (`focus:ring-2 focus:ring-primary`).

## 5. Layout Principles
- **Grid-first responsive architecture** — CSS Grid over Flexbox math. Never use `calc()` percentage hacks.
- **Mobile-first collapse:** All multi-column layouts collapse to single column **< 768px (sm breakpoint)**. No horizontal overflow.
- **Hero/Command Header:** Asymmetric Split Screen or Left-Aligned. **Centered Hero layouts BANNED** when variance > 4.
- **Feature rows:** **No 3-column equal card layouts**. Use 2-column Zig-Zag, asymmetric grid, or horizontal scroll.
- **Containment:** `max-w-[1400px]` centered container with consistent padding (`padding: 2rem` desktop, `1.5rem` mobile).
- **Full-height sections:** Use `min-h-[100dvh]` — **never `h-screen`** (iOS Safari catastrophic jump).
- **Sticky Resource Bar:** Fixed top, backdrop blur, z-20, responsive grid collapse.

## 6. Responsive Breakpoints (Tailwind Config)
```typescript
// tailwind.config.ts - REQUIRED ADDITIONS
screens: {
  sm: '640px',    // Mobile landscape / small tablet
  md: '768px',    // Tablet portrait
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1400px', // Ultra-wide
}
```
**Mobile-First Rules:**
- **< 640px (base):** Single column, stacked cards, full-width buttons
- **sm (≥ 640px):** 2-column grids for resource bars, dashboard widgets
- **md (≥ 768px):** 3-column command header, sidebar navigation visible
- **lg (≥ 1024px):** Full tactical layout, 4-column resource bar
- **xl (≥ 1280px):** Expanded whitespace, side panels

## 7. Motion & Interaction
- **Spring Physics Default:** `stiffness: 100, damping: 20` — premium, weighty feel. No linear easing.
- **wz_tooltip animations:** 100ms ultra-fast cubic-bezier fade-in (`wz-fade-in`: `cubic-bezier(0.16, 1, 0.3, 1)`) and fade-out with shadow offset.
- **Tactile feedback:** `btn-tactical-press` — `transform: scale(0.98) translateY(1px)`, `filter: brightness(0.92)` on `:active`.
- **Perpetual Micro-Loops:** Active dashboard components (countdown bars, live tickers) use `pulse-subtle` (2s ease-in-out infinite) or `shimmer` (1.5s infinite).
- **Staggered Orchestration:** Cascade delays for waterfall reveals — `delay-75`, `delay-150`, `delay-225` for list items.
- **Performance:** Animate exclusively via `transform` and `opacity`. Never animate `top`, `left`, `width`, `height`.
- **prefers-reduced-motion:** **ALL animations respect `@media (prefers-reduced-motion: reduce)`** — disable `wz-fade-in`, `glow-crimson` infinite, `pulse-subtle`, `shimmer`.

```css
@media (prefers-reduced-motion: reduce) {
  .wz-tooltip { animation: none; opacity: 1; transform: none; }
  .animate-glow-crimson,
  .animate-pulse-subtle,
  .animate-shimmer { animation: none; }
}
```

## 8. Border Radius Convention
**Unified Radius System** — Single source of truth in `tailwind.config.ts`:
```typescript
borderRadius: {
  lg: 'var(--radius)',        // 0.5rem / 8px — Cards, modals
  md: 'calc(var(--radius) - 2px)', // 0.375rem / 6px — Buttons, badges, inputs
  sm: 'calc(var(--radius) - 4px)', // 0.25rem / 4px — Small badges, dots
  xl: 'calc(var(--radius) + 4px)', // 0.75rem / 12px — Hero cards, featured panels
}
```
**Usage:** Use semantic tokens (`rounded-lg`, `rounded-md`, `rounded-sm`, `rounded-xl`) — **never arbitrary `rounded-[value]` or mixed `rounded-md` vs `calc()`**.

## 9. Component-Specific Responsive Fixes (Priority Recommendations)

### 🔴 CRITICAL: overview-view.tsx — Tactical Command Header Grid
```tsx
// BEFORE (broken mobile):
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// AFTER (fixed):
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```
**Impact:** Fixes header táctico principal disposition on mobile. Cards stack 1→2→3 columns.

### 🟡 HIGH: Typography Mobile Scaling
```css
/* globals.css - UPDATE base font-size */
html { font-size: 14px; } /* was 10pt ≈ 13.3px */

/* Components: apply sm:text-base to critical text-xs text */
<span className="text-xs sm:text-base font-mono ..."> /* metadata, coordinates */
```

### 🟡 HIGH: Scalable Images & Cards
```tsx
// BEFORE (fixed dimensions):
<Image ... width={20} height={20} className="h-5 w-5" />
<Card className="min-h-[250px]">

// AFTER (responsive):
<Image ... className="h-5 w-5 sm:h-6 sm:w-6" /> /* or w-full h-auto object-cover */
<Card className="min-h-[200px] sm:min-h-[250px]">
```

### 🟡 HIGH: resource-bar.tsx — Mobile Grid Collapse & Reorder
```tsx
// BEFORE:
<div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 md:flex md:items-center md:gap-x-6 w-full">

// AFTER:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:flex md:items-center md:gap-x-4 w-full">
  {resources.map((res, idx) => (
    <div key={res.name} className="flex items-center gap-2" style={{ order: idx < 2 ? 1 : 2 }}>
      {/* Mobile: 2×2 grid, Desktop: 4-column flex */}
    </div>
  ))}
</div>
```

### 🟢 MEDIUM: Contrast & Touch Targets
- **Verify:** `#A1A1AA` (Muted Zinc) on `Charcoal Surface` `#131317` = **4.8:1** ✓ Passes AA
- **Verify:** `#A1A1AA` on `Obsidian Void` `#09090C` = **4.2:1** ⚠️ Fails AA for small text — **use `#D4D4D8` (Zinc-300) for body on darkest backgrounds**
- **Touch targets:** All interactive elements ≥ 44×44px. Icon buttons: `h-10 w-10` minimum. Add `min-h-[44px] min-w-[44px]` to clickable areas.

## 10. Anti-Patterns (Banned) — Enforced by DESIGN.md
- No emojis anywhere in the interface.
- No `Inter` font.
- No generic serif fonts.
- No pure black (`#000000`).
- No AI purple/blue neon glows.
- No oversaturated accents (>80% saturation).
- No fake round numbers (`99.99%`, `50%`, hardcoded `99%` loyalty).
- No fabricated data or statistics.
- No uneven grid layout gaps or overlapping elements.
- No centered Hero sections (variance > 4).
- No 3-column equal card feature rows.
- No generic placeholder names ("John Doe", "Acme", "Nexus").
- No `LABEL // YEAR` formatting ("SYSTEM // 2024").
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen").
- No filler UI text: "Scroll to explore", "Swipe down", scroll arrows, bouncing chevrons.
- No broken Unsplash links — use `picsum.photos` or SVG avatars.
- No `h-screen` — use `min-h-[100dvh]`.
- No fixed pixel dimensions on images/cards — use relative constraints.
- No animations without `prefers-reduced-motion` guard.

## 11. Implementation Checklist (Tailwind Config Sync)
- [ ] Add `sm: '640px'`, `md: '768px'`, `lg: '1024px'`, `xl: '1280px'` to `theme.screens`
- [ ] Add `xl: 'calc(var(--radius) + 4px)'` to `theme.borderRadius`
- [ ] Add `prefers-reduced-motion` media query to globals.css
- [ ] Update `html` font-size to `14px` (0.875rem base)
- [ ] Replace all `text-xs` critical metadata with `text-xs sm:text-base`
- [ ] Replace fixed `min-h-[250px]` with `min-h-[200px] sm:min-h-[250px]`
- [ ] Replace fixed image dimensions with responsive classes
- [ ] Update resource-bar grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- [ ] Update overview-view header grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] Verify Muted Zinc contrast on darkest surfaces; adjust to Zinc-300 if needed
- [ ] Audit all interactive elements for ≥ 44×44px touch targets