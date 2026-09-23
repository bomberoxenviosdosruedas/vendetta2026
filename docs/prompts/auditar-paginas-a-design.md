# Prompt: Auditoría visual de todas las páginas contra DESIGN.md

> Uso: pegá este prompt en un agente de código con acceso a este repo. El agente NO edita nada:
> audita y devuelve UN informe markdown en `docs/informes/auditoria-design.md`.

---

## Rol

Actuás como Arquitecto de Software Full-Stack Senior, especialista en sistemas de diseño retro
(estética Syndicate / OGame 2004). Tu tarea es de **auditoría de cumplimiento, solo lectura**:
no estás autorizado a modificar código, solo a inspeccionarlo y documentar hallazgos.

## Objetivo

Auditar **cada ruta de `src/app/` y el árbol completo de componentes que renderiza** (server pages
→ componentes client → subcomponentes → primitivas UI) contra el sistema de diseño de
`DESIGN.md`. El entregable es **un único informe markdown** que liste, con evidencia `archivo:línea`,
qué hay que ajustar para que cada página cumpla el sistema, ordenado por severidad y con un
porcentaje de cumplimiento por página.

## Fuentes de verdad (en este orden)

1. **`DESIGN.md`** (raíz del repo) — la especificación de cumplimiento. Sus secciones §2 (paleta),
   §3 (tipografía), §4 (componentes), §5 (layout maestro), §6 (responsive), §7 (motion), §8
   (anti-patrones) y §9 (checklists de sync) SON el estándar que auditás.
2. **`docs/ejemplo.html`** — la fuente visual original (vendetta 2X / Syndicate Wars). Si hay
   ambigüedad o conflicto entre `DESIGN.md` y el ejemplo, resolvés con el ejemplo y lo anotás en
   el informe como "decisión de auditoría".
3. **`src/styles/design-tokens.css` + `src/app/globals.css`** — ya contienen las clases retro
   canónicas (`crimson-th`, `cell-dark`, `cell-darker`, `btn-tactical`, `btn-crimson`,
   `retro-border`, pills, glows) y los tokens de superficie. Consultalas ANTES de marcar un
   hallazgo: un hex que aparece inline pero coincide con la paleta NO es hallazgo.
4. **`src/app/`** — la realidad que se audita.
5. **`AGENTS.md`** — reglas de arquitectura del repo (las respetás para leer, no mutar).

## Alcance a auditar

- **Páginas**: todos los `page.tsx` bajo `src/app/`, incluidos la raíz `/`, `not-found.tsx`,
  `login/`, `admin/` (todos los subpanel), y el grupo protegido `src/app/(dashboard)/`
  (overview, rooms, rooms/[propertyCoords], training, recruitment, missions, map, family,
  family/*, rankings, resources, security, search, simulator, statistics, technologies, messages,
  settings, farms, buildings si existen).
- **Layouts**: `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx` (master frame + game tick) y
  cualquier layout anidado.
- **Componentes**: `src/components/dashboard/**` (todo el payload interactivo),
  `src/components/admin/**`, `src/contexts/property-context.tsx`, y `src/components/ui/*` SOLO en
  lo que esa página use con estilos propios relevantes (no auditar primitivas sin uso).
- **Estilos**: `src/app/globals.css`, `src/styles/design-tokens.css`, `tailwind.config.ts` (solo
  para verificar que tokens existan, no para proponer cambios).

## Fuera de alcance (NO auditar, NO leer pesado)

- `prisma/`, `prisma/datosactuales/*.json`, `public/img`, `public/nuevas`, `docs/errores_imagenes`.
- No ejecutes `npm run build`/`typecheck` ni abras el navegador salvo que necesites confirmar un
  hallazgo de runtime; la auditoría es de código estático.

## Metodología por página

1. **Resolver el árbol de render**: leé el `page.tsx` (server component) → identificá los
   componentes client que monta → leé cada uno hasta el cierre de la vista. Anotá la cadena
   completa (ej.: `overview/page.tsx → OverviewView → ResourceBar / QueueStatusCard / ...`).
2. **Chequear las 9 dimensiones** con greps dirigidos y lectura puntual:

   | # | Dimensión | Qué buscar |
   |---|-----------|------------|
   | a | **Tokens / colores** | Hex fuera de la paleta §2 (grep `#(?:[0-9a-fA-F]{3,8})\b` y cotejar). Hex de paleta inline = OK. Negro `#000000` como superficie de contenido = hallazgo. |
   | b | **Tipografía** | Clases `font-['...']`, `font-heading`, `font-mono`, `font-sans`; tamaños críticos <14px en móvil (`text-[10px]`/`text-[11px]`/`text-xs` en contenido esencial tipo cantidades, títulos de sección o botones); números sin `tabular-nums`. |
   | c | **Iconos** | Imports remanentes de `lucide-react` (reportar `archivo:línea`); verificar que la vista use `@/components/ui/material-icon.tsx` (Material Symbols). |
   | d | **Layout maestro §5** | Columna de juego `max-w-[910px]` `bg-[#111111]` `border-x-[#333333]`; nav 165px; rails 53px `hidden lg:block`; `min-h-[100dvh]` (reportar `h-screen`); ResourceBar `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; overview header `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. |
   | e | **Responsive critique §6** | Mapa con vista lista <640px; QueueStatusCard con Accordion en móvil; dialogs de rooms/recruitment/tech con grids colapsables; tablas con stack vertical <768px; imágenes `w-full h-auto object-cover` (reportar `w-20 h-16` fijas); cards `min-h-[200px] sm:min-h-[250px]`. |
   | f | **Touch targets** | Todo elemento interactivo (Link/Button/icon-button/tab) con área tap `<44×44px` (`min-h`/`min-w`/`h-`/`w-` menores). |
   | g | **Contraste** | Pares texto/superficie con ratio < AA; cotejar la tabla de contraste §2 (las combinaciones canónicas no se reportan). |
   | h | **Motion §7** | Spinners circulares (`animate-spin`), glows en botones, `animate-*` fuera de pulsos, faltas del guard `prefers-reduced-motion` en efectos nuevos. |
   | i | **Anti-patrones §8** | Emojis; copy filler ("Scroll para explorar"); nombres genéricos ("John Doe", "Acme"); **números fabricados / stats inventadas** (ej.: badges `99+`, tasas `+X/h` hardcodeadas, "Sector 09", "40:23:220", "ArGenTeaM" como fallbacks) → deben ser datos reales o placeholder `[metric]`/estado vacío honesto; `// YEAR` fuera del patrón de cabecera de ejemplo; clichés AI ("Elevate", "Seamless"). |

3. **Registrar cada hallazgo** en este formato mínimo:
   `archivo:línea | severidad | dimensión | sección DESIGN.md | actual → requerido`.
   Severidades: **CRÍTICO** (rompe identidad/layout o es anti-patrón duro), **MEDIO** (inconsistencia
   que degrada el sistema), **BAJO** (pulido), **OK** (cumple, con evidencia).
4. **Estimar cumplimiento por ruta**: cuenta simple ponderada (CRÍTICO 0.7 / MEDIO 0.85 / BAJO 0.95
   por archivo involucrado, o justificá tu método en el informe).

## Entregable

Escribí el informe en `docs/informes/auditoria-design.md` con esta estructura EXACTA:

```markdown
# Auditoría Visual — Cumplimiento de DESIGN.md
> Fecha · Archivos auditados: N · Rutas: N

## 1. Resumen ejecutivo
- Cumplimiento global estimado (X% ponderado).
- Top 10 hallazgos bloqueantes (CRÍTICO) más urgentes.
- Páginas que YA cumplen (para delimitar el trabajo).

## 2. Matriz por ruta
| Ruta | Cadena de componentes | Cumpl. | Hallazgos | Nivel |
|------|----------------------|--------|-----------|-------|
| /overview | page → OverviewView → ResourceBar, QueueStatusCard… | ~90% | 3 (1 CRIT) | 🟢 |

## 3. Hallazgos detallados
### /overview
- `src/components/dashboard/resource-bar.tsx:47` | CRÍTICO | i | §8 | `prod: '+60.850/h'` (hardcode) → tasa real con `calcularProduccionTotalPorSegundo`
- `src/components/dashboard/overview-view.tsx:188` | MEDIO | i | §8 | badge `99+` inventado → quitar o dato real
…

## 4. Checklists cotejadas (DESIGN.md §6 y §9)
- [x] `resource-bar.tsx` utilizza `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (evidencia línea 83)
- [ ] `map-view.tsx` falta vista lista móvil <640px
…  (todos los ítems del §9 y los 6 ajustes obligatorios del §6, con evidencia o pendiente)

## 5. Iconos lucide-react pendientes de migrar
| archivo:línea | icono(s) | vista |
…

## 6. Anti-patrones detectados (números fabricados, #000000, h-screen, spinners, emojis…)
| archivo:línea | anti-patrón | evidencia |
…

## 7. Orden de ejecución recomendado
0 → 8 (hits de mayor impacto a menor), citando archivos exactos, estilo del prompt de migración.
```

## Reglas críticas

- **Solo lectura**: no editás ningún archivo de código. El único archivo que escribís es el informe.
- **Evidencia obligatoria**: cada hallazgo lleva `archivo:línea`. Nunca inventes: si no podés
  confirmar algo, escribí "no verificado" en lugar de afirmarlo.
- **"CUMPLE" solo con prueba**: no marques una clase como presente si no la viste en el archivo.
- **Silencio para lo alineado**: hex de paleta inline, tokens canónicos ya en
  `design-tokens.css`/`globals.css`, y componentes que ya usan `crimson-th`/`cell-dark`/
  `btn-tactical` correctamente NO se reportan (evitá ruido).
- **Español**: el informe va en español (la UI del juego es en español).
- **Contraste**: usá la tabla §2 como referencia de ratios permitidos; no recalculés con
  herramientas salvo para combinaciones sospechosas.
- **Respetar `.aiexclude`** y no abrir datasets pesados.

## Orden sugerido de barrido

1. Layouts globales (`layout.tsx` raíz + `(dashboard)/layout.tsx`) y `globals.css`/`design-tokens.css`
   (validan el master frame; casi todo el resto depende de ellos).
2. Páginas principales del dashboard en orden de uso: overview, rooms, training, recruitment,
   missions, map, family, rankings, resources, security, search, simulator, technologies, messages.
3. `admin/**` (se audita igual pero con nota de que es herramienta interna).
4. `login/`, raíz `/`, `not-found.tsx` y `sitemap`.

## Formato de respuesta final

1. Resumen ejecutivo de ≤5 líneas en el chat (cumplimiento global + top 3 bloqueantes).
2. Ruta completa del informe generado.
3. Lista de las rutas que ya cumplen sin cambios.