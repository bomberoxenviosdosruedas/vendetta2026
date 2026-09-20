# Design System: Vendetta Syndicate Noir

## 1. Visual Theme & Atmosphere
A high-stakes Mafia RTS tactical command interface ("Cockpit Dense", Variance: 6, Motion: 6, Density: 8). The visual mood is nocturnal, ruthless, and meticulously engineered: deep obsidian and charcoal layers accented by razor-sharp syndicate crimson (`#dc2626`) and warm cartel gold (`#eab308`). The atmosphere evokes an executive syndicate operations table illuminated by streetlamps and radar terminals—dark, tactile, disciplined, and free from consumer-app fluff or neon slop.

## 2. Color Palette & Roles
- **Obsidian Void** (`#09090C` / `240 10% 4.5%`) — Primary background foundation under everything; deep non-pure-black noir canvas.
- **Charcoal Surface** (`#131317` / `240 8% 8.5%`) — Standard card, module, and container fill.
- **Elevated Bunker** (`#1C1C23` / `240 7% 12%`) — Interactive surface, hover states, and active list items.
- **Overlay Floating** (`#23232C` / `240 7% 15%`) — Floating modals, dropdowns, sticky tactical bars.
- **Whisper Border** (`#272730` / `240 6% 16%`) — 1px structural containment lines with subtle opacity.
- **Syndicate Crimson** (`#DC2626` / `0 72% 51%`) — Primary accent for critical CTA buttons, combat indicators, alerts, and offensive posture.
- **Cartel Gold** (`#EAB308` / `45 93% 47%`) — Secondary prestige accent for family tags, ranking crowns, and high-tier achievements.
- **Dirty Cash / Dollars** (`#10B981` / `160 84% 39%`) — Laundered cash economy metric.
- **Gunpowder / Ammunition** (`#F59E0B` / `38 92% 50%`) — Munitions inventory metric.
- **Bootleg Alcohol** (`#D97706` / `35 90% 44%`) — Contraband alcohol metric.
- **Ballistics / Weapons** (`#EF4444` / `0 84% 60%`) — Armaments stockpile metric.
- **Off-White Text** (`#F4F4F6` / `210 25% 96%`) — Primary typography, high legibility.
- **Muted Zinc Text** (`#A1A1AA` / `215 16% 62%`) — Subtitles, coordinates, and metadata.
- **Vendetta Classic Burgundy** (`#6C0000`) — Authentic retro syndicate button and header background.
- **Vendetta Classic Pink** (`#FFCCCC`) — Authentic retro cell text and indicator dots (`.dotF`, `.dotE`).
- **Vendetta Classic Gold** (`#FFF400` / `#FFE569`) — Retro hover state and highlighted ranking accent.

## 3. Typography Rules
- **Display / Headlines:** `Bebas Neue` (`var(--font-bebas-neue)`) / `Tahoma` — Track-wide, uppercase, assertive, cinematic mobster hierarchy.
- **Body / Interface:** `Tahoma`, `Arial`, `Helvetica`, `sans-serif` (10pt base) — Authentic Vendetta syndicate feel, high density readability.
- **Mono / Tactical HUD:** `Roboto Mono` (`var(--font-mono)`) — Tabular numbers for coordinates `[X:Y:Z]`, resource quantities, countdown timers, and statistics. Never use proportional digits for RTS data.
- **Banned:** `Inter`, generic serif fonts (`Times New Roman`, `Georgia`), pure black (`#000000`), neon purple gradients.

## 4. Component Stylings
- **Buttons:** Tactile feedback (`-1px translateY` on active, `scale 0.98`). Solid crimson or subtle border variants. No neon outer glows.
- **Cards:** Crisp 1px borders with `border-border/60`, subtle dark gradient fill (`from-card to-card/70`), soft ambient drop shadow.
- **Badges / Status:** Compact, rounded-md with 1px border and semitransparent background.
- **Loaders:** Skeletal shimmer matching layout dimensions; no generic circular spinners.
- **Empty States:** Composed syndicate dossier cards with actionable CTA (e.g., "Sin Familia - Unirse o Crear").

## 5. Layout Principles
- Strict grid alignment: cards must maintain consistent height and clear visual weight across columns. No orphaned cells or missing grid rows.
- Tactical command hierarchy: Top dossier row for Boss, Headquarters, and Syndicate status; followed by real-time tickers and live operational queues.
- Mobile-first collapse: multi-column dashboard collapses cleanly into single column (< 768px). No horizontal overflow.
- Strict containment: `container` padding with sticky resource bar.

## 6. Motion & Interaction
- **wz_tooltip animations:** 100ms ultra-fast cubic-bezier fade-in (`wz-fade-in`) and fade-out (`wz-fade-out`) with shadow offset (`box-shadow: 4px 4px 10px rgba(0,0,0,0.65)`).
- Tactile feedback on buttons and interactive cards (`btn-tactical-press`, `vendetta-btn:active`).
- Micro-shimmer on active countdown bars and loading skeletons.
- Smooth `fadeIn` / `fadeInUp` transitions for tab changes and layout views.
- No heavy physics that lag or disrupt gameplay.

## 7. Anti-Patterns (Banned)
- No emojis anywhere in the interface.
- No `Inter` font.
- No generic serif fonts.
- No pure black (`#000000`).
- No AI purple/blue neon glows.
- No oversaturated accents.
- No fake round numbers (`99.99%`, `50%`, hardcoded `99%` loyalty).
- No fabricated data or statistics.
- No uneven grid layout gaps or overlapping elements.
