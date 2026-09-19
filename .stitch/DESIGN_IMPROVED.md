---
name: Vendetta Syndicate Noir 2.0
colors:
  surface-lowest: '#070709'
  surface: '#0d0d10'
  surface-card: '#131317'
  surface-elevated: '#1a1a20'
  surface-overlay: '#22222a'
  on-surface: '#f8fafc'
  on-surface-variant: '#94a3b8'
  border-subtle: '#22222a'
  border-strong: '#32323e'
  primary: '#e11d2e'
  on-primary: '#ffffff'
  primary-glow: 'rgba(225, 29, 46, 0.25)'
  accent-gold: '#f59e0b'
  on-accent-gold: '#18181b'
  gold-glow: 'rgba(245, 158, 11, 0.2)'
  resource-weapons: '#ef4444'
  resource-ammo: '#f59e0b'
  resource-alcohol: '#d97706'
  resource-dollars: '#10b981'
  status-success: '#10b981'
  status-warning: '#f59e0b'
  status-critical: '#ef4444'
  status-info: '#38bdf8'
typography:
  display-2xl:
    fontFamily: Bebas Neue
    fontSize: 42px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: 0.06em
  display-xl:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.05em
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.04em
  title-md:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0
  body-base:
    fontFamily: Roboto
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.01em
  body-muted:
    fontFamily: Roboto
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0
  label-caps:
    fontFamily: Roboto
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  stat-mono:
    fontFamily: Roboto
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0
rounded:
  xs: 0.125rem
  sm: 0.25rem
  DEFAULT: 0.375rem
  md: 0.5rem
  lg: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
---

# Design System: Vendetta Syndicate Noir 2.0
**Stack:** Next.js 16 (App Router), Tailwind CSS 4, Shadcn UI, Lucide React  
**Theme:** Premium Gritty Mafia RTS Tactical Command Center

---

## 1. Visual Theme & Atmosphere

Vendetta Syndicate Noir 2.0 elevates the visual world of organized crime into a cinematic, tactile, and highly authoritative experience. Rather than looking like a flat dashboard with dark mode enabled, the interface feels like an underground operations terminal in a dimly lit, smoke-hazy 1940s-1970s speak-easy office: polished mahogany under tungsten lamps, heavy steel vaults, cold gunmetal, and ledgers marked with blood and gold.

The visual tone is established by four layers of depth:
1. **Layer 0 (Nocturne Canvas - `#070709`):** The shadowy void beneath the command center.
2. **Layer 1 (Card Vault - `#131317`):** Heavy containers framed by brushed steel borders (`#22222a`) with subtle inner chamfering.
3. **Layer 2 (Elevated Panels & Modals - `#1a1a20`):** Focused action surfaces with ambient crimson or gold rim light reflections.
4. **Layer 3 (Floating HUD & Tooltips - `#22222a` with blur):** Frosted glass surfaces with high-contrast tactical data.

Density is calibrated for strategic decision making (Density Level 8): information-rich, with clear distinction between static intel, live real-time countdowns, and quick-action orders.

---

## 2. Color Palette & Roles

### 2.1 The Architectural Surface Scale (Layered Depth)
- **Canvas Base (`--surface-lowest`):** `#070709` (HSL `240 12% 3.5%`) — Root application backdrop.
- **Surface Card (`--surface-card`):** `#131317` (HSL `240 9% 8.5%`) — Standard panels, queue lists, room rows.
- **Surface Elevated (`--surface-elevated`):** `#1a1a20` (HSL `240 10% 11.5%`) — Hover states, active tabs, dropdown menus.
- **Surface Overlay (`--surface-overlay`):** `#22222a` (HSL `240 10% 15%`) — Sticky tooltips, modal dialogs, drawer headers.

### 2.2 Brand & Tactical Accents
- **Crimson Blood Red (`--primary`):** `#e11d2e` (HSL `355 80% 50%`) — Primary syndicate authority. CTAs, attack buttons, combat alerts, boss insignia.
- **Syndicate Gold (`--accent-gold`):** `#f59e0b` (HSL `38 92% 50%`) — High-tier progression, treasury upgrades, prestige rankings, active timers in progress.
- **Brushed Steel Border (`--border-subtle`):** `#22222a` (1px structure) / `#32323e` (high-contrast focus ring).

### 2.3 Semantic Game Resource Palette
Each core resource in the syndicate economy possesses its own dedicated chromatic identity:
- **Armas (Weapons - `#ef4444` / Red):** Represents firepower, ballistics, and lethal intimidation.
- **Munición (Ammunition - `#f59e0b` / Amber):** Represents gunpowder supply, rate of fire, and raid readiness.
- **Alcohol (Contraband - `#d97706` / Bourbon Amber):** Represents bootlegging operations, distillery yields, and underworld trade.
- **Dólares (Dirty Cash - `#10b981` / Emerald Green):** Represents money laundering, protection rackets, and bribe reserves.

### 2.4 Functional Status & Capacity States
- **Safe / Optimal (<80% capacity):** Accent Emerald (`#10b981`) or Syndicate Gold (`#f59e0b`).
- **Warning (>80% capacity or low defense):** Amber warning (`#f59e0b`).
- **Critical / Depleted (>95% capacity or incoming raid):** Crimson danger (`#ef4444`) with pulsing aura.

---

## 3. Typography Rules

### 3.1 Dual-Font System
- **Display & Headlines (`font-heading`):** `Bebas Neue`
  - Always uppercase.
  - Generous letter spacing to enhance legibility: `tracking-[0.05em]` for H1/H2, `tracking-[0.04em]` for badges and button labels.
  - Compressed leading (`leading-none` or `leading-tight`) avoids unnecessary vertical sprawl.
- **Body, Intel & Data (`font-sans`):** `Roboto`
  - High x-height ensures readability across dense RTS matrices.
  - Numbers and counts strictly use `tabular-nums` (monospaced figures) to eliminate shaking during tick-based increments.
  - Secondary metadata rendered in warm slate (`#94a3b8`).

### 3.2 Typographic Hierarchy Reference Table
| Role | Font | Size | Weight | Tracking | Color |
|---|---|---|---|---|---|
| Page Hero Title | Bebas Neue | 36px - 42px | 400 | +0.06em | `#f8fafc` |
| Section / Card Title | Bebas Neue | 22px - 26px | 400 | +0.05em | `#f8fafc` |
| Subsection / Field Title | Roboto | 15px | 600 | 0 | `#f8fafc` |
| Primary Data Stat | Roboto | 16px - 18px | 700 (tabular) | 0 | `#f8fafc` / Resource Accent |
| Body Text / Lore | Roboto | 14px | 400 | +0.01em | `#94a3b8` |
| Micro-Label / Tag | Roboto | 11px | 700 (all caps) | +0.08em | `#64748b` |

---

## 4. Component Stylings & Micro-Interactions

### 4.1 Tactical Buttons
- **Primary Syndicate Button:**
  - Background: Linear gradient from `#e11d2e` to `#b91c1c` with subtle top hairline highlight.
  - Text: White, font-bold, uppercase tracking.
  - Hover: Background brightness +10%, box-shadow `0 0 12px rgba(225, 29, 46, 0.4)`.
  - Active: Scale `0.98` with `translate-y-[1px]` for physical, tactile feedback.
- **Secondary Steel Button:**
  - Background: `#1a1a20`, border `1px solid #32323e`.
  - Hover: Border color shifts to `#e11d2e/60`, text highlights to white.
- **Ghost Action:**
  - Transparent base, hover background `#22222a/60`.

### 4.2 Crime Family Cards & Panels
- **Structure:** Crisp 1px border (`#22222a`), rounded-md (`0.375rem`), background `#131317`.
- **Lighting Effect:** Optional top-edge border glow (`border-t border-t-white/10`) to simulate harsh downlighting from a desk lamp.
- **Hover Behavior:** For interactive cards (e.g. troop selection, room upgrade row), border-color transitions to `#32323e` with a delicate ambient shadow (`shadow-[0_4px_20px_rgba(0,0,0,0.5)]`).

### 4.3 Top Tactical Resource Bar (HUD)
- Sticky top docking with backdrop blur (`backdrop-blur-md bg-[#0d0d10]/90`).
- Resource items formatted as compact status pills:
  - Mini SVG resource icon (18x18px).
  - Micro-label in muted uppercase (`ARMAS`, `MUNICIÓN`, `ALCOHOL`, `DÓLARES`).
  - Formatted tabular integer (`de-DE` localized).
  - Storage capacity progress bar integrated as a 2px micro-bar beneath the number, dynamically transitioning from green to amber to red as capacity approaches 100%.

### 4.4 Construction, Training & Mission Queues
- **Active State:** Border highlight with subtle pulsing amber glow (`animate-pulse-subtle`).
- **Progress Bar:** High-visibility gradient track (`bg-accent-gold` with animated shimmer sheen).
- **Cancel Button:** Subtle destructive icon button (`text-muted-foreground hover:text-red-500 hover:bg-red-500/10`).

---

## 5. Layout Principles

### Grid & Structure
- **Global Container:** Centered at `max-w-7xl` (1280px - 1400px), with consistent padding (`px-4 sm:px-6 lg:px-8`).
- **Tactical Grid:** Standard 12-column responsive layout for dashboard modules, collapsing seamlessly to single column on mobile screens (`grid-cols-1 md:grid-cols-12`).
- **Sidebar Integration:** Collapsible left sidebar containing categorized operations, with fixed bottom boss profile and quick logout.

---

## 6. Design System Notes for Stitch Generation

### Atmospheric Prompt Descriptors
- "Gritty mafia underworld tactical terminal, dark carbon surfaces, brushed gunmetal borders, vivid crimson and syndicate gold accents, Bebas Neue condensed headers, tabular-nums resource counters."

### Example Stitch Component Prompts
- **Room Management Row:**
  *"Design a dark mafia crime RTS room upgrade card. Deep carbon surface (#131317), 1px subtle zinc border, 80x60 thumbnail with subtle vignette, Bebas Neue title 'OFICINA DEL JEFE', crimson 'NIVEL 4' badge, horizontal cost pill row with Weapons, Ammo, and Cash SVG icons + tabular amounts, a countdown timer with small clock icon, and an aggressive red 'AMPLIAR' CTA button with tactile active state."*
- **Resource HUD Bar:**
  *"Design a sticky top HUD bar for a mafia RTS game. Frosted dark glass background (#0d0d10/90), 4 resource columns with distinct color-coded accents: Weapons (red), Ammo (amber), Alcohol (bourbon), Cash (emerald). Include a live synchronized clock on the right, and subtle bottom capacity meters."*
