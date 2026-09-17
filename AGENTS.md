# AGENTS.md - Reglas Globales de Arquitectura y Desarrollo para Agentes IA

> **Vendetta** - Motor de Estrategia y Gestión de Recursos en Tiempo Real (Mafia RTS)  
> **Stack Core**: Next.js 15/16 (App Router), TypeScript 5+, Prisma ORM (PostgreSQL), Tailwind CSS, Shadcn UI.

---

## 1. Perfil y Filosofía del Agente

Actúa como un **Arquitecto de Software Full-Stack Senior**. Todas las modificaciones, refactorizaciones y nuevas características deben regirse por los siguientes principios:

- **Rigor Tipográfico y Estricto en TypeScript**: Cero tolerancia con `any`. Tipado explícito de retornos, interfaces de dominio cohesivas y validación con Zod en fronteras de entrada.
- **Next.js App Router Nativo**: Server Components por defecto; `'use client'` confinado exclusivamente a hojas interactivas del árbol DOM.
- **Asincronía Obligatoria en APIs Dinámicas**: En Next.js 15+, APIs como `cookies()`, `headers()`, `params` y `searchParams` **SIEMPRE** deben ser tratadas como Promesas asíncronas (`await`).
- **Integridad Transaccional**: Toda mutación multi-tabla en el estado del juego (recursos, colas de construcción/reclutamiento, combates) debe ejecutarse dentro de `prisma.$transaction`.
- **Economía de Contexto para IA**: Respetar estrictamente `.aiexclude`. No cargar volcados de datos pesados (`.json` de prueba) en el prompt a menos que sea explícitamente requerido.

---

## 2. Arquitectura de Código y Estructura de Directorios

```text
/src
  ├── app/                  # Rutas del App Router (Server Components por defecto)
  │    ├── (dashboard)/     # Layout protegido con Game Tick en cada navegación
  │    ├── admin/           # Panel de administración y balanceo del juego
  │    └── api/             # Endpoints HTTP (solo para webhooks / integraciones externas)
  ├── components/           # Componentes UI organizados por dominio
  │    ├── dashboard/       # Vistas de juego (RoomsView, MissionsView, etc.)
  │    ├── admin/           # Tablas y matrices de configuración
  │    └── ui/              # Primitivas de Shadcn UI accesibles y headless
  ├── contexts/             # Contextos de React para estado transitorio de cliente
  ├── lib/                  # Núcleo de lógica de negocio y persistencia
  │    ├── actions/         # Server Actions (mutaciones de base de datos)
  │    ├── formulas/        # Funciones puras de cálculo de juego (tiempo, coste, daño)
  │    ├── prisma/          # Instancia singleton del cliente Prisma
  │    ├── data.ts          # Data Access Layer (DAL) para lecturas optimizadas
  │    └── auth*.ts         # Gestión de sesiones y cookies seguras
  └── types/                # Definiciones de tipos globales del dominio
/prisma
  ├── schema.prisma         # Esquema declarativo de base de datos
  ├── seed.ts               # Orquestador de carga inicial
  └── datosactuales/        # Datos semilla (omitir en revisiones rutinarias de IA)
```

---

## 3. Directrices Específicas de Next.js (App Router)

### 3.1 Manejo de Cookies y Headers
```typescript
// ✅ CORRECTO (Next.js 15+)
import { cookies, headers } from 'next/headers';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vendetta-session')?.value;
  if (!token) return null;
  // ...
}

// ❌ INCORRECTO - Lanzará runtime error: sync-dynamic-apis
const cookieStore = cookies();
const token = cookieStore.get('vendetta-session')?.value;
```

### 3.2 Tipado y Resolución de `params` y `searchParams`
```typescript
// ✅ CORRECTO: params y searchParams son Promises
interface PageProps {
  params: Promise<{ propertyCoords: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { propertyCoords } = await params;
  const { tab } = await searchParams;
  // ...
}
```

### 3.3 Server Actions (`src/lib/actions/`)
- Utilizar `'use server'` en la parte superior del módulo o función.
- Validar parámetros con esquemas `Zod` antes de consultar o mutar el estado.
- Retornar siempre un formato de respuesta estándar:
  ```typescript
  type ActionResult<T = unknown> = 
    | { success: true; data: T; message?: string }
    | { success: false; error: string; code?: string };
  ```
- Llamar a `revalidatePath('/[ruta]')` únicamente cuando la mutación afecte datos mostrados en pantalla.

---

## 4. Estándares para Prisma ORM y Base de Datos

### 4.1 Instancia de Prisma (`src/lib/prisma/prisma.ts`)
- Utilizar siempre el singleton global para evitar agotamiento del pool de conexiones en recargas de desarrollo:
  ```typescript
  import { PrismaClient } from '@prisma/client';

  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

  export const prisma = globalForPrisma.prisma || new PrismaClient();

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  ```

### 4.2 Mutaciones Críticas y Atomicidad
Las operaciones de compra, reclutamiento y órdenes de misión deducen recursos y crean registros en cola. **Deben** ejecutarse en una transacción:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Verificar y decrementar recursos
  const updatedProp = await tx.propiedad.update({
    where: { id: propiedadId },
    data: {
      dinero: { decrement: costo.dinero },
      armas: { decrement: costo.armas },
    }
  });

  if (updatedProp.dinero < 0 || updatedProp.armas < 0) {
    throw new Error("Recursos insuficientes para completar la operación.");
  }

  // 2. Registrar en la cola correspondiente
  await tx.colaConstruccion.create({
    data: {
      propiedadId,
      habitacionId,
      nivelObjetivo,
      fechaFinalizacion,
    }
  });
});
```

### 4.3 Data Access Layer (`src/lib/data.ts`)
- Agrupar lecturas relacionadas usando `Promise.all` para evitar cascadas (waterfalls).
- Emplear `React.cache()` para memorizar lecturas idempotentes durante el ciclo de vida de una misma petición HTTP.

---

## 5. Arquitectura del Game Loop (Motor de Tiempo Real)

El juego utiliza un enfoque **Server-Authoritative Lazy Tick**:
1. **Lazy Evaluation**: Los recursos y colas no dependen de un daemon continuo de fondo que sature el servidor. Se calculan diferencialmente en función de `Date.now() - ultimaActualizacion`.
2. **Game Tick en Layout**: Al navegar en `(dashboard)/layout.tsx`, se resuelven en paralelo:
   - `verificarYFinalizarConstruccion`
   - `verificarYFinalizarReclutamiento`
   - `verificarYFinalizarMisiones`
   - `verificarYFinalizarEntrenamientos`
3. **Formulas Puras (`src/lib/formulas/`)**: Toda matemática de escalado de edificios, bonus de investigación o poder de combate debe aislarse en funciones puras sin efectos secundarios ni dependencias a Prisma. Esto garantiza testeabilidad y balanceo ágil.

---

## 6. Convenciones de UI y Estilo

- **Librería de Iconos**: Exclusivamente `lucide-react`. Prohibido incrustar SVGs crudos cuando exista un icono estándar.
- **Componentes Base**: Utilizar primitivas de Shadcn UI (`@/components/ui/*`).
- **Paleta y Tema**: Tema oscuro mafioso por defecto (`dark`), contrastes con variables HSL definidas en `globals.css` (acentos carmesí `#dc2626` y dorados `#eab308`).
- **Animaciones**: Utilizar Tailwind transitions y `motion` (`motion/react`) para micro-interacciones suaves.
- **Feedback al Usuario**: Utilizar `useToast` para notificaciones de error, advertencia o éxito en Server Actions.

---

## 7. Buenas Prácticas de Optimización para Agentes IA

1. **Inspección Quirúrgica**: Leer únicamente los fragmentos y archivos necesarios. No cargar carpetas de volcados completos.
2. **Edición Segura**: Validar sintaxis y dependencias antes de proponer cambios extensos. No asumir la existencia de paquetes no declarados en `package.json`.
3. **Preservar Rutas Existentes**: No renombrar endpoints o componentes sin verificar referencias cruzadas con `grep`.
4. **Verificación Post-Cambio**: Ejecutar validación de compilación y linteo para garantizar integridad del build.
