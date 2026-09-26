# Game Loop — Lazy Server-Authoritative Tick

> **No hay daemon de fondo**. El tick se ejecuta en dos capas coordinadas.

---

## 1. Capa Automática (Vercel Cron)
- **Endpoint**: `/api/cron/game-tick` (configurado en `vercel.json`)
- **Frecuencia**: Cada minuto
- **Auth**: Requiere header `x-vercel-cron: 1` o `Authorization: Bearer <CRON_SECRET>`
- **Función**: `procesarTickMasivo()`
  - Descubre usuarios con eventos vencidos (construcción, reclutamiento, entrenamiento, misiones)
  - Los finaliza actualizando tropas, recursos y puntuación **sin requerir sesión**
  - Pasa `{ marcarVisto: false }` para NO tocar `lastSeen` de usuarios inactivos

---

## 2. Capa Al Navegar (Layout Dashboard)
- **Ubicación**: `src/app/(dashboard)/layout.tsx`
- **Trigger**: Cada navegación del usuario autenticado
- **Función**: `processGameTick(sessionUser)`

### Ejecución Paralela (Obligatoria)
```typescript
const [afterConstruction, afterRecruitment, afterMission, afterTraining] = await Promise.all([
  verificarYFinalizarConstruccion(sessionUser),
  verificarYFinalizarReclutamiento(sessionUser),
  verificarYFinalizarMisiones(sessionUser),
  verificarYFinalizarEntrenamientos(sessionUser),
]);

// Merge resultados + actualizar recursos + recalcular score
const combinedUser = { ...sessionUser, ...afterConstruction, ...afterRecruitment, ...afterMission, ...afterTraining };
const userWithResources = await obtenerEstadoJuegoActualizado(combinedUser);  // Cálculo diferencial Date.now() - ultimaActualizacion
const finalUser = await actualizarPuntuacionUsuario(userWithResources);
```

---

## 3. Idempotencia Obligatoria
Toda finalización (construcción, reclutamiento, entrenamiento, misión) usa `deleteMany` como guarda:
- El cron y el tick de navegación pueden correr en paralelo **sin duplicar** tropas, niveles o mensajes
- Verificar siempre existencia antes de crear/actualizar

---

## 4. Fórmulas Puras (`src/lib/formulas/`)
**Sin Prisma, sin side-effects, testeables unitariamente**:
- `room-formulas.ts`: costos, tiempos, producción, capacidad almacenamiento
- `troop-formulas.ts`: stats de tropas con bonus
- `training-formulas.ts`: costos/tiempos de investigación
- `mission-formulas.ts`: viajes, combate, transporte
- `score-formulas.ts`: cálculo de puntuación global
- `produccion-formulas.ts`: generación diferencial de recursos

---

## 5. Referencias de Código Clave
| Archivo | Función |
|---------|---------|
| `src/app/(dashboard)/layout.tsx` | Entry point del tick al navegar |
| `src/lib/actions/user.actions.ts` | `verificarYFinalizar*`, `obtenerEstadoJuegoActualizado`, `actualizarPuntuacionUsuario` |
| `src/lib/formulas/produccion-formulas.ts` | Cálculo diferencial de recursos |
| `src/app/api/cron/game-tick/route.ts` | Endpoint Vercel Cron |

---

*Última actualización: 2026-09-26*