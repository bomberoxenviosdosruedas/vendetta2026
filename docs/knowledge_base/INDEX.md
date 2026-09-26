# Knowledge Base Index — Vendetta 2006

> **Single Source of Truth** para arquitectura, diseño, game loop y convenciones.
> **Regla de oro**: Cualquier agente DEBE leer este índice antes de tocar código.

---

## 📚 Catálogo de Archivos

| Archivo | Descripción | Prioridad |
|---------|-------------|-----------|
| [`AGENTS-full.md`](AGENTS-full.md) | Reglas completas: arquitectura, patrones Next.js 16, Prisma, Server Actions, DAL, fórmulas puras, transacciones | 🔴 Crítica |
| [`DESIGN-system.md`](DESIGN-system.md) | Design system completo: paleta bronce/pergamino cálida, tipografía Chivo/Arimo/JetBrains Mono, componentes, layout master frame, responsive, motion, **radio 0 obligatorio** y **variantes de acento por superficie** | 🔴 Crítica |
| [`GAME-LOOP.md`](GAME-LOOP.md) | Lazy Server-Authoritative Tick: Vercel Cron + navegación, ejecución paralela, idempotencia, fórmulas puras | 🔴 Crítica |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Estructura `src/`, DAL con `React.cache()`, Server Actions, path aliases, modelos Prisma clave | 🟡 Alta |
| [`VISUAL-design-tokens.md`](VISUAL-design-tokens.md) | Tokens YAML (colores, tipografía, spacing) + specs visuales desde mockup | 🟡 Alta |
| [`PROMPTS/`](PROMPTS/) | Prompts de auditoría/ajuste a design system (referencia histórica) | 🟢 Media |
| [`MOCKUPS/`](MOCKUPS/) | HTML/PNG de referencia: overview escritorio/móvil · **`dashboard_overview_unificado.html`** (layout global + overview fundidos en 1 archivo, Tailwind CDN + Vanilla JS) | 🟢 Media |
| [`ARCHIVE-blueprint-legacy.md`](ARCHIVE-blueprint-legacy.md) | **OBSOLETO** — specs v0 (Inter, crimson #8B0000) — **NO USAR** | ⚫ Archivado |
| [`ARCHIVE-ejemplo-legacy.html`](ARCHIVE-ejemplo-legacy.html) | **OBSOLETO** — referencia histórica diseño anterior | ⚫ Archivado |
| [`errores_imagenes/`](errores_imagenes/) | Capturas de error visual para debugging | 🟢 Media |

---

## 🚀 Quick Start para Agentes

1. **Leer primero**: `AGENTS-full.md` §1–§3 (filosofía, comandos, arquitectura)
2. **Design system**: `DESIGN-system.md` §1–§4 (colores, tipografía, componentes)
3. **Game Loop**: `GAME-LOOP.md` (entender el tick antes de mutar recursos/colas)
4. **Archivos clave** (AGENTS-full.md §10): `layout.tsx`, `user.actions.ts`, `data.ts`, `prisma.ts`, `room-formulas.ts`, `schema.prisma`

---

## ⚠️ Reglas de Uso

- **NO** usar `blueprint.md` ni `ejemplo.html` — son legacy y contradicen el design system actual
- **NO** cargar `prisma/datosactuales/`, `public/img/`, `.next/`, `node_modules/`, lockfiles (ver `.aiexclude`)
- **SÍ** usar `grep`/`read` quirúrgicos sobre archivos necesarios
- **Verificación obligatoria**: `npm run lint && npm run typecheck && npm run build` antes de confirmar

---

*Última actualización: 2026-09-26*