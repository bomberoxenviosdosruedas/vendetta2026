# AGENTS.md - Reglas Globales de Arquitectura y Desarrollo para Agentes IA

> **Vendetta** - Motor de Estrategia y Gestión de Recursos en Tiempo Real (Mafia RTS)  
> **Stack Core**: Next.js 16 (App Router), TypeScript 7, Prisma ORM (PostgreSQL), Tailwind CSS 4, Shadcn UI, React 19.

---

## 1. Perfil y Filosofía del Agente

Actúa como un **Arquitecto de Software Full-Stack Senior**. Todas las modificaciones deben regirse por:

- **Rigor Tipográfico Estricto**: Cero tolerancia con `any`. Tipado explícito de retornos, interfaces de dominio cohesivas y validación con Zod en fronteras de entrada.
- **Next.js App Router Nativo**: Server Components por defecto; `'use client'` **solo** en hojas interactivas del árbol DOM.
- **Asincronía Obligatoria en APIs Dinámicas**: En Next.js 15+, `cookies()`, `headers()`, `params` y `searchParams` **SIEMPRE** son Promesas (`await`).
- **Integridad Transaccional**: Toda mutación multi-tabla (recursos, colas, combates) debe ejecutarse en `prisma.$transaction`.
- **Economía de Contexto**: Respetar `.aiexclude`. No cargar volcados pesados (`.json` de `prisma/datosactuales/`) salvo petición explícita.

---

## 2. Comandos de Desarrollo Exactos

```bash
# Desarrollo (puerto 3000, bind 0.0.0.0)
npm run dev

# Build de producción (standalone output)
npm run build

# Ejecución producción
npm run start

# Lint + Typecheck (orden obligatorio)
npm run lint && npm run typecheck

# Prisma
npm run generate          # prisma generate (postinstall automático)
npx prisma db push        # Sync schema en dev
npx prisma migrate dev --name <nombre>  # Migración formal
npm run prisma:seed       # Poblar BD con seed maestro
npx prisma studio         # UI visual

# Genkit (IA)
npm run genkit:dev        # Dev server Genkit
npm run genkit:watch      # Con watch mode
```

**Orden de verificación pre-commit**: `lint → typecheck → build`

---

## 3. Arquitectura de Código y Estructura Crítica

```
src/
├── app/
│   ├── (dashboard)/          # Layout protegido + Game Tick en cada navegación
│   │   ├── layout.tsx        # EJECUTA: verificarYFinalizar* en paralelo + obtenerEstadoJuegoActualizado + actualizarPuntuacionUsuario
│   │   ├── rooms/            # Construcción/gestión habitaciones
│   │   ├── training/         # Árbol tecnológico
│   │   ├── recruitment/      # Reclutamiento tropas
│   │   ├── missions/         # Centro de mando
│   │   ├── map/              # Exploración coordenadas
│   │   ├── family/           # Gestión familias
│   │   └── rankings/         # Clasificaciones globales
│   ├── admin/                # Panel balance (ruta /admin)
│   ├── login/                # Auth usuarios
│   └── page.tsx              # Puerta acceso + verificación superuser
├── components/
│   ├── dashboard/            # Vistas interactivas ('use client')
│   ├── admin/                # Formularios/matrices balanceo
│   └── ui/                   # Primitivas Shadcn (@/components/ui/*)
├── contexts/                 # React Context (ej: property-context.tsx)
├── lib/
│   ├── actions/              # Server Actions (mutaciones BD)
│   ├── formulas/             # Funciones PURAS (sin Prisma, sin side-effects)
│   ├── prisma/prisma.ts      # Singleton Prisma con adapter PrismaPg + Accelerate
│   ├── data.ts               # DAL con React.cache() + Promise.all
│   ├── auth.ts               # Auth jugadores (cookies HTTP-only)
│   ├── auth-admin.ts         # Auth panel admin
│   └── auth-super.ts         # Auth superuser
├── hooks/                    # useToast, useMobile, etc.
└── types/                    # Tipos globales dominio
prisma/
├── schema.prisma             # Esquema integral (ver modelos clave abajo)
├── seed.ts                   # Orquestador seeding
└── datosactuales/            # Datasets base (EXCLUIDOS en .aiexclude)
```

### Modelos Prisma Clave (referencia rápida)
- `ConfiguracionHabitacion` / `ConfiguracionEntrenamiento` / `ConfiguracionTropa`: Config estática del juego
- `Propiedad` / `HabitacionUsuario` / `ColaConstruccion` / `ColaReclutamiento`: Estado por jugador
- `TropaUsuario` / `EntrenamientoUsuario` / `ColaEntrenamiento`: Ejército e investigación
- `ColaMisiones` / `Family` / `FamilyMember` / `Message`: Misiones, alianzas, mensajería
- `PuntuacionUsuario`: Score global (edificios + tropas + investigaciones)

---

## 4. Directrices Next.js 16 (App Router) - Patrones Verificados

### 4.1 Cookies / Headers / Params - **SIEMPRE ASYNC**
```typescript
// ✅ CORRECTO
import { cookies, headers } from 'next/headers';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vendetta-session')?.value;
  // ...
}

// ✅ CORRECTO - params y searchParams son Promises
interface PageProps {
  params: Promise<{ propertyCoords: string }>;
  searchParams: Promise<{ tab?: string }>;
}
export default async function Page({ params, searchParams }: PageProps) {
  const { propertyCoords } = await params;
  const { tab } = await searchParams;
}
```

### 4.2 Server Actions (`src/lib/actions/`)
- `'use server'` **al inicio del módulo** (no por función)
- Validar con **Zod** antes de consultar/mutar
- Retorno estándar:
  ```typescript
  type ActionResult<T = unknown> = 
    | { success: true; data: T; message?: string }
    | { success: false; error: string; code?: string };
  ```
- `revalidatePath()` **solo** si la mutación afecta datos en pantalla
- Usar `prisma.$transaction([...])` para mutaciones atómicas multi-tabla

### 4.3 Path Aliases (tsconfig.json)
```json
"@/*": ["./src/*"]
```
Imports: `@/lib/actions/room.actions`, `@/components/ui/button`, etc.

---

## 5. Prisma ORM - Patrones Críticos Verificados

### 5.1 Cliente Singleton (`src/lib/prisma/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const databaseUrl = process.env.DATABASE_URL || '';
const isAccelerate = databaseUrl.startsWith('prisma://') || databaseUrl.startsWith('prisma+postgres://');

function createPrismaClient() {
  if (isAccelerate) {
    return new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate()) as unknown as PrismaClient;
  }
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```
**Soporta ambos**: PostgreSQL directo (`postgresql://`) y Prisma Accelerate (`prisma://`).

### 5.2 Transacciones Atómicas (Patrón Obligatorio)
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Verificar y decrementar recursos
  const updated = await tx.propiedad.update({
    where: { id: propiedadId },
    data: { dinero: { decrement: costo.dinero }, armas: { decrement: costo.armas } }
  });
  if (updated.dinero < 0 || updated.armas < 0) throw new Error("Recursos insuficientes");

  // 2. Registrar en cola
  await tx.colaConstruccion.create({ data: { propiedadId, habitacionId, nivelDestino, fechaFinalizacion } });
});
```

### 5.3 Data Access Layer (`src/lib/data.ts`)
- **`React.cache()`** para memorizar lecturas idempotentes por request HTTP
- **`Promise.all`** para agrupar lecturas relacionadas y evitar waterfalls
- Tipos extendidos con `& { relations }` para cargar datos completos en una query

---

## 6. Game Loop - Lazy Server-Authoritative Tick

**No hay daemon de fondo**. El tick se ejecuta en dos capas:

1. **Automática (sin login)**: Vercel Cron (`vercel.json` → `/api/cron/game-tick`, cada minuto) ejecuta `procesarTickMasivo()`, que descubre usuarios con eventos vencidos (construcción, reclutamiento, entrenamiento, misiones) y los finaliza actualizando tropas, recursos y puntuación **sin requerir sesión**. Esta ruta exige `x-vercel-cron: 1` o `Authorization: Bearer <CRON_SECRET>`.
2. **Al navegar**: `(dashboard)/layout.tsx` ejecuta `processGameTick(sessionUser)` para el usuario activo:

```typescript
// En layout.tsx - EJECUCIÓN PARALELA
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

**Idempotencia obligatoria**: toda finalización (construcción, reclutamiento, entrenamiento, misión) usa `deleteMany` como guarda — el cron y el tick de navegación pueden correr en paralelo sin duplicar tropas, niveles o mensajes. El cron pasa `{ marcarVisto: false }` para NO tocar `lastSeen` de usuarios inactivos.

**Fórmulas Puras** (`src/lib/formulas/`): Sin Prisma, sin side-effects, testeables unitariamente. Incluyen:
- `room-formulas.ts`: costos, tiempos, producción, capacidad almacenamiento
- `troop-formulas.ts`, `training-formulas.ts`, `mission-formulas.ts`, `score-formulas.ts`, `produccion-formulas.ts`

---

## 7. Convenciones UI y Estilo

- **Iconos**: Solo `lucide-react`. Nada de SVGs inline si existe en lucide.
- **Componentes base**: Shadcn UI (`@/components/ui/*`).
- **Tema**: Oscuro (`dark`) por defecto. Variables HSL en `globals.css` / `src/styles/design-tokens.css`.
  - Acentos: Carmesí `#dc2626` (red-600), Dorado `#eab308` (yellow-600)
- **Animaciones**: Tailwind transitions + `motion/react` (Framer Motion) para micro-interacciones.
- **Feedback**: `useToast` (toast sonoro/visual) para errores/éxitos en Server Actions.

---

## 8. Variables de Entorno Requeridas

```env
# .env (no commiteado - ver .env.example)
DATABASE_URL="postgresql://user:pass@localhost:5432/vendetta?schema=public"
# O para Prisma Accelerate:
# DATABASE_URL="prisma://accelerate-url"

GEMINI_API_KEY=""           # Opcional - features IA
NODE_ENV="development"
```

---

## 9. Buenas Prácticas Operativas para Agentes

1. **Inspección Quirúrgica**: Leer solo archivos necesarios. No cargar `prisma/datosactuales/`, `public/img/`, `public/nuevas/`.
2. **Edición Segura**: Verificar sintaxis y deps en `package.json` antes de proponer cambios. No asumir paquetes no declarados.
3. **Preservar Rutas**: No renombrar endpoints/componentes sin `grep` de referencias cruzadas.
4. **Verificación Post-Cambio**: `npm run lint && npm run typecheck && npm run build` antes de confirmar.
5. **Game Tick Awareness**: Cualquier cambio en recursos/colas/entradas debe considerar el flujo en `(dashboard)/layout.tsx`.

---

## 10. Referencias de Archivos Clave para Contexto Rápido

| Archivo | Propósito |
|---------|-----------|
| `src/app/(dashboard)/layout.tsx` | Game Tick entry point, auth guard, resource calc |
| `src/lib/actions/user.actions.ts` | `verificarYFinalizar*`, `obtenerEstadoJuegoActualizado`, `actualizarPuntuacionUsuario` |
| `src/lib/data.ts` | DAL con `React.cache()`, tipos extendidos, queries optimizadas |
| `src/lib/prisma/prisma.ts` | Singleton Prisma (PrismaPg + Accelerate) |
| `src/lib/formulas/room-formulas.ts` | Matemática pura: costos, tiempos, producción, capacidad |
| `prisma/schema.prisma` | Esquema completo BD |
| `.aiexclude` | Filtro contexto IA (respeta estrictamente) |

---

*Última actualización: 2026-09-21. Verificar contra código real si hay dudas.*

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
