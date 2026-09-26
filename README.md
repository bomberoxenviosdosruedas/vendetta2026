# 🕶️ Vendetta - Mafia Strategy RTS Engine

> Plataforma web de estrategia militar, expansión territorial y gestión de recursos en tiempo real inspirada en los clásicos juegos de navegador de la mafia. Construye propiedades, investiga tecnologías criminales, recluta sicarios y compite con tu familia por el control de la ciudad.

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7_ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🎯 Visión General y Mecánicas Core

En **Vendetta**, cada jugador administra una organización criminal con múltiples propiedades repartidas en barrios y ciudades:

- **Economía de 4 Recursos**: Armas, Munición, Alcohol y Dólares. Se generan pasivamente según el nivel de los edificios y se almacenan hasta el tope de capacidad de los depósitos.
- **Gestión de Propiedades**: Construcción y ampliación de habitaciones clave (Oficina Central, Campo de Tiro, Cervecería, Fundición, Laboratorios, etc.).
- **Árbol Tecnológico (Entrenamientos)**: Investigaciones de combate, extorsión, contrabando, espionaje y honor que desbloquean nuevas tropas y bonificadores tácticos.
- **Reclutamiento y Tropas**: Desde matones, porteros y carteristas hasta asesinos, francotiradores, tropas de ocupación y servicios secretos (CIA, FBI).
- **Misiones y Despliegues**: Envíos de tropas en tiempo real para misiones de transporte, espionaje, ataques de saqueo u ocupación territorial.
- **Familias (Sindicatos)**: Alianzas mafiosas con rangos jerárquicos, banco de recursos compartido, tablón de mensajes y guerras de facciones.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Web** | Next.js 16 (App Router) | Renderizado del lado del servidor (RSC), Server Actions y rutas dinámicas |
| **Lenguaje** | TypeScript 7 | Tipado estricto en todo el flujo de datos y lógica de dominio |
| **Base de Datos & ORM** | PostgreSQL + Prisma 7 | Modelado relacional, migraciones declarativas y consultas transaccionales |
| **Estilos & UI** | Tailwind CSS 4 + Shadcn UI (Radix) | Diseño visual oscuro de mafia, accesible, responsivo y ultra optimizado |
| **Iconografía** | Lucide React | Paquete estándar de iconos SVG |
| **Animaciones** | Motion (Framer) + GSAP | Micro-interacciones y transiciones fluidas |
| **Validación** | Zod | Validación de entradas en Server Actions y esquemas de API |

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Vistas principales del juego (Overview, Rooms, Map, Missions)
│   │   │   ├── layout.tsx        # Server Layout que procesa el Game Tick y valida recursos
│   │   │   ├── rooms/            # Construcción y gestión de habitaciones
│   │   │   ├── training/         # Investigaciones y árbol de tecnologías
│   │   │   ├── recruitment/      # Reclutamiento de unidades criminales
│   │   │   ├── missions/         # Centro de mando y órdenes de ataque/transporte
│   │   │   ├── map/              # Exploración de coordenadas urbanas
│   │   │   ├── family/           # Gestión de familias mafiosas y solicitudes
│   │   │   └── rankings/         # Clasificaciones globales por puntos y honor
│   │   ├── admin/                # Panel de control protegido para balance de stats y bonus
│   │   ├── login/                # Autenticación de usuarios
│   │   └── page.tsx              # Puerta de acceso con verificación superuser
│   ├── components/
│   │   ├── dashboard/            # Vistas interactivas de cliente ('use client')
│   │   ├── admin/                # Formularios y matrices de balanceo del juego
│   │   └── ui/                   # Componentes base Shadcn (dialog, table, button, etc.)
│   ├── contexts/                 # Contextos de React (ej: selección de propiedad activa)
│   ├── lib/
│   │   ├── actions/              # Server Actions para mutaciones (rooms, troops, missions)
│   │   ├── formulas/             # Matemática pura desacoplada (costes, tiempos, combate)
│   │   ├── prisma/               # Cliente Singleton de Prisma
│   │   ├── auth.ts               # Autenticación de jugadores basada en cookies HTTP-only
│   │   ├── auth-admin.ts         # Autenticación del panel de administración
│   │   └── data.ts               # Data Access Layer (DAL) con lecturas optimizadas y cache
│   └── hooks/                    # Hooks personalizados (useToast, useMobile, etc.)
├── prisma/
│   ├── schema.prisma             # Esquema integral de entidades y relaciones
│   ├── seed.ts                   # Orquestador maestro de seeding
│   └── datosactuales/            # Datasets base de prueba y configuración inicial
├── docs/knowledge_base/          # Documentación técnica completa (Single Source of Truth)
├── AGENTS.md                     # Puntero normativo para agentes IA
├── .aiexclude                    # Filtro de archivos para optimización de tokens IA
└── .gitignore                    # Reglas de exclusión para Git
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: v20+ (recomendado v22 LTS)
- **pnpm** (gestor de paquetes oficial)
- Instancia de **PostgreSQL** accesible

### Pasos de Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd vendetta2026
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Configurar el entorno**:
   ```bash
   cp .env.example .env
   # Configura tu DATABASE_URL en el archivo .env
   ```

4. **Generar el cliente Prisma y sincronizar la base de datos**:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Poblar la base de datos con las configuraciones y datos iniciales**:
   ```bash
   pnpm run prisma:seed
   ```

6. **Iniciar el servidor de desarrollo**:
   ```bash
   pnpm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

---

## 🔑 Variables de Entorno

Declara estas variables en tu archivo `.env` local (consulta `.env.example`):

```env
# Conexión a la base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/vendetta?schema=public"

# Clave API de Gemini para características inteligentes (opcional)
GEMINI_API_KEY=""

# Entorno de ejecución
NODE_ENV="development"
```

---

## 🗄️ Flujo de Base de Datos con Prisma

El esquema (`prisma/schema.prisma`) modela la interacción entre entidades estáticas del juego y datos de progreso de los jugadores:

### Comandos Principales
```bash
# Regenerar tipos TypeScript tras modificar schema.prisma
pnpm prisma generate

# Sincronizar esquema directamente con la base de datos (modo desarrollo)
pnpm prisma db push

# Crear y aplicar una migración SQL formal
pnpm prisma migrate dev --name <nombre_migracion>

# Ejecutar script de seeding maestro
pnpm run prisma:seed

# Abrir Prisma Studio para inspección visual de tablas
pnpm prisma studio
```

---

## ⚙️ Arquitectura del Motor de Juego (Game Tick)

A diferencia de los MMO tradicionales que dependen de costosos daemons en segundo plano, Vendetta implementa un motor **Lazy Server-Authoritative Tick**:

1. **Cálculo Diferencial en Cada Request**: Cuando el usuario interactúa o navega por el layout `(dashboard)`, el servidor evalúa el tiempo transcurrido desde la última actualización (`Date.now() - ultimaConexion`).

2. **Resolución de Colas en Paralelo**:
   - `verificarYFinalizarConstruccion`: Sube de nivel las habitaciones finalizadas y activa la siguiente orden en cola.
   - `verificarYFinalizarReclutamiento`: Agrega tropas completadas al ejército de la propiedad.
   - `verificarYFinalizarMisiones`: Calcula los resultados de viajes (ataques, transportes) y el retorno de tropas.
   - `verificarYFinalizarEntrenamientos`: Aplica las nuevas tecnologías al árbol del usuario.

3. **Generación de Recursos**: La función `obtenerEstadoJuegoActualizado` suma la producción horaria proporcional calculada por las fórmulas puras de `src/lib/formulas/produccion-formulas.ts`.

4. **Actualización de Puntuación**: Los puntos de edificios, tropas e investigaciones se recalculan y actualizan en `PuntuacionUsuario`.

---

## 🛡️ Panel de Administración y Control

El sistema incluye herramientas internas para el equipo de desarrollo y balance de juego:

- **Ruta**: `/admin`
- **Gestión de Entidades**:
  - Modificación en caliente de costes, tiempos y factores de escalado para edificios (`ConfiguracionHabitacion`).
  - Ajuste de atributos y requisitos para tecnologías (`ConfiguracionEntrenamiento`).
  - Balance de tropas (ataque, defensa, capacidad, velocidad) y matriz de bonificaciones contra otros tipos de unidades.

---

## 📜 Scripts Disponibles

```bash
# Servidor de desarrollo en puerto 3000
pnpm run dev

# Compilación de producción (Next.js standalone)
pnpm run build

# Ejecución en producción
pnpm run start

# Verificación de linting de código
pnpm run lint

# Type checking
pnpm run typecheck

# Seeding de base de datos
pnpm run prisma:seed
```

---

## 📚 Documentación Técnica

Toda la documentación detallada para desarrolladores y agentes IA reside en **`docs/knowledge_base/`**:

- [`INDEX.md`](docs/knowledge_base/INDEX.md) — Tabla de contenidos maestra
- [`AGENTS-full.md`](docs/knowledge_base/AGENTS-full.md) — Reglas completas de arquitectura
- [`DESIGN-system.md`](docs/knowledge_base/DESIGN-system.md) — Design system completo
- [`GAME-LOOP.md`](docs/knowledge_base/GAME-LOOP.md) — Motor de tick perezoso
- [`ARCHITECTURE.md`](docs/knowledge_base/ARCHITECTURE.md) — Estructura de código y patrones
- [`VISUAL-design-tokens.md`](docs/knowledge_base/VISUAL-design-tokens.md) — Tokens visuales YAML