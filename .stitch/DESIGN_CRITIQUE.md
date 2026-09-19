# Auditoría y Crítica del Sistema de Diseño: Vendetta

**Fecha de Análisis:** Septiembre 2026  
**Proyecto:** Vendetta - Motor RTS de Gestión Mafiosa  
**Referencia:** `.stitch/DESIGN.md` (Sistema Base Extraído)

---

## 1. Diagnóstico Ejecutivo

El sistema de diseño actual de Vendetta sienta una base funcional sólida utilizando **Next.js 16**, **Tailwind CSS**, primitivas de **Shadcn UI**, la tipografía de cartel criminal **Bebas Neue** y una paleta oscura con acentos carmesí. Sin embargo, adolece de problemas característicos de una implementación temprana de template: **aplanamiento de capas por colisión de tokens**, **estilos arbitrarios hardcodeados**, **ausencia de tokens dedicados para la economía del juego (los 4 recursos)** y **falta de inmersión sensorial mafiosa** (parece más un panel genérico de métricas SaaS que una central clandestina de un sindicato del crimen).

---

## 2. Puntos Críticos y Oportunidades de Mejora

### 2.1 Colisión y Deficiencia en la Escala de Superficies (Elevación Plana)
- **Problema:** En `src/app/globals.css`, tanto `--card` como `--secondary` comparten exactamente el mismo valor: `240 4% 10%` (`#19191b`).
- **Consecuencia Visual:** Cuando un botón secundario, un badge secundario o un contenedor anidado se renderiza dentro de una tarjeta (`Card`), pierde contraste y profundidad. No existe jerarquía visual de niveles (Surface 0 -> Surface 1 -> Surface 2 -> Surface 3).
- **Solución Recomendada:** Implementar una escala tonal escalonada de superficies oscuras (Canvas: `#0a0a0c`, Base Card: `#121215`, Elevated Card/Hover: `#18181d`, Floating Dropdown/Modal: `#202026`).

### 2.2 Dependencia de Colores Hardcodeados en Componentes
- **Problema:** Múltiples componentes esenciales recurren a clases de utilidad ad-hoc de Tailwind sin respaldo en variables CSS:
  - En `src/components/dashboard/resource-bar.tsx`: `text-red-500`, `text-yellow-500`, `bg-background/95`.
  - En `src/components/dashboard/overview-view.tsx`: `bg-black/80`, `border-white/20`, `text-white/80`.
  - En `src/components/dashboard/rooms-view.tsx`: `text-amber-500`, imágenes con placeholders genéricos.
- **Consecuencia:** Imposibilita el re-theming centralizado, genera desincronización de saturación y rompe la consistencia en caso de variaciones de pantalla o modos de alto contraste.
- **Solución Recomendada:** Centralizar estados de capacidad y alertas en tokens semánticos: `--warning`, `--warning-foreground`, `--critical`, `--resource-*`.

### 2.3 Ausencia de Tokens de Dominio para Recursos RTS
- **Problema:** Un juego RTS de mafia vive de sus recursos: **Armas**, **Munición**, **Alcohol** y **Dólares**. Actualmente se tratan como texto genérico con un icono PNG/SVG incrustado.
- **Solución Recomendada:** Crear tokens de color y badges temáticos dedicados:
  - **Armas (Weapons):** Acero balístico / Carmesí táctico (`#ef4444`).
  - **Munición (Ammunition):** Latón de casquillo / Ámbar azufre (`#f59e0b`).
  - **Alcohol (Contraband):** Tonel añejo / Borgoña destilado (`#a855f7` o `#d97706`).
  - **Dólares (Dirty Cash):** Verde billete lavado / Esmeralda lavado (`#10b981`).
  Esto permite crear barras de progreso, badges de coste y tooltips con codificación cromática instantánea.

### 2.4 Pobreza en Micro-interacciones y Feedback Háptico Táctico
- **Problema:** `tailwind.config.ts` solo declara `fade-in`, `fade-in-up`, `accordion` y `shimmer`.
- **Experiencia de Usuario:** Las acciones críticas (ampliar edificio, ordenar reclutamiento, recolectar botín) no ofrecen satisfacción táctil:
  - No hay efecto de presión de botón estilo consola táctica (`active:scale-[0.98]`).
  - Los temporizadores de cuenta regresiva carecen de pulsos o alertas cuando finalizan.
  - Las colas de construcción no tienen distinción visual clara entre "en proceso activo", "en cola de espera" o "pausado por falta de fondos".

### 2.5 Jerarquía y Fluidez Tipográfica
- **Problema:** `Bebas Neue` es una tipografía estilísticamente potente pero con altura de mayúsculas pronunciada y espacio vertical restringido. En títulos largos o modales estrechos, se comprime y se vuelve difícil de escanear.
- **Solución Recomendada:**
  - Regular `letter-spacing` (tracking `0.04em` a `0.08em` en títulos medianos).
  - Adoptar una tipografía numérica especializada o afianzar `Roboto Mono` / `tabular-nums font-mono` para todos los valores dinámicos y cuentas atrás del HUD.

---

## 3. Plan de Mejora y Entregables

1. **`.stitch/DESIGN_IMPROVED.md`**: Definición completa del sistema de diseño mejorado **Vendetta Syndicate Noir 2.0**, con tokens semánticos ampliados, escala de elevación, reglas de micro-interacción y pautas para generación en Stitch.
2. **`src/styles/design-tokens.css`**: Definición modular de variables CSS semánticas listas para ser importadas en `globals.css` sin riesgo de romper componentes existentes.
3. **Mejoras en `tailwind.config.ts` y `src/app/globals.css`**: Incorporación de tokens de recursos, sombras con brillo carmesí/oro y animaciones tácticas.
