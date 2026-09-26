# Arquitectura — Vendetta 2006

---

## Estructura `src/`

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
```

---

## Modelos Prisma Clave (`prisma/schema.prisma`)

### Configuración Estática (Solo Lectura en Runtime)
- `ConfiguracionHabitacion` — Edificios: costos, tiempos, producción, capacidad
- `ConfiguracionEntrenamiento` — Investigaciones: costos, tiempos, requisitos
- `ConfiguracionTropa` — Unidades: ataque, defensa, capacidad, velocidad, salario, tipo

### Estado Dinámico (Por Jugador)
- `Propiedad` — Propiedades del usuario (ciudad, barrio, edificio, recursos, ultimaActualizacion)
- `HabitacionUsuario` — Nivel de cada edificio por propiedad (pivote)
- `TropaUsuario` — Cantidad de cada tropa por propiedad
- `TropaSeguridadUsuario` — Tropas defensivas estacionadas
- `EntrenamientoUsuario` — Nivel de cada investigación por usuario
- `ColaConstruccion` / `ColaReclutamiento` / `ColaEntrenamiento` — Colas de producción
- `ColaMisiones` — Misiones en curso (ataque, transporte, espionaje, ocupación)
- `Family` / `FamilyMember` / `FamilyInvitation` — Sindicatos y membresía
- `PuntuacionUsuario` — Score global (edificios + tropas + investigaciones)
- `Message` — Mensajería interna

---

## Patrones Críticos Verificados

### 1. Next.js 16 App Router — Cookies/Headers/Params **SIEMPRE ASYNC**
```typescript
import { cookies, headers } from 'next/headers';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vendetta-session')?.value;
  // ...
}

interface PageProps {
  params: Promise<{ propertyCoords: string }>;
  searchParams: Promise<{ tab?: string }>;
}
export default async function Page({ params, searchParams }: PageProps) {
  const { propertyCoords } = await params;
  const { tab } = await searchParams;
}
```

### 2. Server Actions (`src/lib/actions/`)
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

### 3. Prisma Singleton (`src/lib/prisma/prisma.ts`)
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

### 4. Transacciones Atómicas (Patrón Obligatorio)
```typescript
await prisma.$transaction(async (tx) => {
  const updated = await tx.propiedad.update({
    where: { id: propiedadId },
    data: { dinero: { decrement: costo.dinero }, armas: { decrement: costo.armas } }
  });
  if (updated.dinero < 0 || updated.armas < 0) throw new Error("Recursos insuficientes");

  await tx.colaConstruccion.create({ data: { propiedadId, habitacionId, nivelDestino, fechaFinalizacion } });
});
```

### 5. Data Access Layer (`src/lib/data.ts`)
- **`React.cache()`** para memorizar lecturas idempotentes por request HTTP
- **`Promise.all`** para agrupar lecturas relacionadas y evitar waterfalls
- Tipos extendidos con `& { relations }` para cargar datos completos en una query

### 6. Path Aliases (`tsconfig.json`)
```json
"@/*": ["./src/*"]
```
Imports: `@/lib/actions/room.actions`, `@/components/ui/button`, etc.

---

## Referencias Rápidas de Archivos

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

*Última actualización: 2026-09-26*