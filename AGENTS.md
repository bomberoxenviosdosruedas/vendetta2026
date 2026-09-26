# AGENTS.md — Puntero Normativo Inmutable

> **Vendetta** — Mafia RTS (Next.js 16.3.6, TS 7, Prisma 7.10, Tailwind 4.3.3, React 19.3.0)

---

## 🔴 DIRECTIVA OBLIGATORIA
**Antes de tocar cualquier código, LEER `docs/knowledge_base/INDEX.md`** para obtener el mapa completo de reglas de arquitectura, design system, game loop y convenciones.

---

## ⚡ Stack Core (Referencia Rápida)
- **Framework**: Next.js 16.3.6 (App Router) · **React**: 19.3.0
- **Language**: TypeScript 7 (npm:@typescript/typescript6@6.0.2 / typescript@7.0.2)
- **Database**: Prisma 7.10 + PostgreSQL (PrismaPg + Accelerate)
- **Styling**: Tailwind CSS 4.3.3 + Shadcn UI (Radix) + Lucide React
- **Animations**: Motion (Framer) + GSAP 3.15
- **Package Manager**: pnpm

---

## 🗂️ Mapa de Conocimiento (`docs/knowledge_base/`)
| Archivo | Contenido |
|---------|-----------|
| `INDEX.md` | **Entrada única** — tabla de contenidos + enlaces a todo |
| `AGENTS-full.md` | Reglas completas arquitectura, patrones Next.js, Prisma, Game Tick |
| `DESIGN-system.md` | Design system completo: colores, tipografía, componentes, layout |
| `GAME-LOOP.md` | Lazy Server-Authoritative Tick (cron + navegación) |
| `ARCHITECTURE.md` | Estructura src/, DAL, Server Actions, fórmulas puras |
| `VISUAL-design-tokens.md` | Tokens YAML + specs visuales (fuente: mockup) |
| `PROMPTS/` | Prompts de auditoría/ajuste a design system |
| `MOCKUPS/` | HTML/PNG de referencia (overview_escritorio/movil) |
| `ARCHIVE-blueprint-legacy.md` | **OBSOLETO** — specs v0 (Inter, crimson) — NO USAR |

---

## 🛠️ Comandos Esenciales
```bash
npm run dev          # Dev server (puerto 3000, 0.0.0.0)
npm run build        # Build producción (standalone)
npm run lint && npm run typecheck  # Pre-commit obligatorio
npx prisma db push   # Sync schema dev
npm run prisma:seed  # Seed maestro
```

---

## 🚫 Economía de Contexto
- **RESPECTAR `.aiexclude`**: No cargar `prisma/datosactuales/`, `public/img/`, `.next/`, `node_modules/`, lockfiles
- **Inspección quirúrgica**: Leer solo archivos necesarios para la tarea
- **Verificación post-cambio**: `lint → typecheck → build` antes de confirmar