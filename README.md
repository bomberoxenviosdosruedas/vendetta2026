# Vendetta - README de Arquitectura

Este documento proporciona una visión general técnica del proyecto "Vendetta", un juego de estrategia y gestión de recursos con temática de mafiosos. El objetivo es documentar el estado actual de la aplicación para facilitar la evaluación por parte de un experto en Next.js y proponer mejoras en la arquitectura.

## 1. Visión General del Proyecto

**Vendetta** es una aplicación web concebida como un juego de estrategia y gestión de recursos en tiempo real, similar en concepto a juegos como *OGame*. Los jugadores asumen el rol de un jefe mafioso, gestionando recursos (armas, munición, alcohol, dólares), construyendo y mejorando edificios, y reclutando unidades para expandir su imperio.

La aplicación está construida sobre un stack moderno, utilizando **Next.js** con el App Router, **TypeScript** para la seguridad de tipos, y **Prisma** como ORM para la interacción con la base de datos PostgreSQL.

## 2. Estructura del Directorio (`/src`)

La estructura del proyecto está organizada para separar las responsabilidades y promover la escalabilidad.

- **/app**: Contiene todas las rutas, páginas y layouts de la aplicación, siguiendo las convenciones del App Router de Next.js. Las páginas son Server Components por defecto, lo que permite el acceso directo a datos en el backend.
- **/components**: Alberga componentes de React reutilizables, divididos en componentes de UI genéricos (`/ui`, basados en shadcn/ui) y componentes específicos del dominio de la aplicación (`/dashboard`).
- **/lib**: Es el núcleo de la lógica de negocio.
    - `auth.ts`: Gestiona la autenticación y las sesiones de usuario mediante cookies.
    - `data.ts`: Centraliza las funciones de acceso a la base de datos (lectura de datos).
    - `prisma/`: Contiene la configuración y el cliente de Prisma.
- **/ai**: Destinado a la integración con **Genkit** para futuras funcionalidades de inteligencia artificial.
- **/prisma**: Contiene el `schema.prisma`, las migraciones y los scripts de *seeding* para poblar la base de datos con datos iniciales.

## 3. Flujo de Autenticación y Sesión de Usuario

El sistema de autenticación actual es una implementación simplificada diseñada para esta fase del desarrollo:

1.  **Inicio de Sesión**: El usuario introduce sus credenciales en el componente `LoginForm` (`/src/components/login-form.tsx`).
2.  **Validación Estática**: Las credenciales se validan de forma estática en el propio componente. Actualmente, solo se permite el acceso al usuario `bomberox` con la contraseña `123456789`.
3.  **Creación de Sesión**: Si las credenciales son correctas, se invoca la Server Action `login` desde `lib/auth.ts`. Esta función establece una cookie segura, `httpOnly`, llamada `vendetta-session` que almacena el nombre de usuario.
4.  **Recuperación de Sesión**: En los Server Components, como `ResourceBar`, se utiliza la función `getSessionUser` de `lib/auth.ts`. Esta función lee la cookie `vendetta-session`, recupera el nombre de usuario y lo utiliza para obtener los datos completos del usuario desde la base de datos a través de `getUserByUsername`.

Este mecanismo permite que los componentes del lado del servidor obtengan de forma segura el contexto del usuario autenticado en cada renderizado.

## 4. Modelo de Datos Actual (Prisma)

La base de datos se define en `prisma/schema.prisma`.

### Modelo `User`
El modelo `User` es central pero actualmente monolítico. Almacena tanto la información de perfil del jugador como sus recursos de juego en una única tabla.

- **Datos de Perfil**: `id`, `name`, `username`, `password`, `title`, `avatarUrl`.
- **Datos de Juego (Recursos)**: `armas`, `municion`, `alcohol`, `ingresos`, `ingresosAnterior`.

### Modelos de Configuración Estática
Estos modelos definen las "reglas del juego" y se pueblan mediante un script de *seeding* (`prisma/seed.ts`) a partir de archivos JSON. Son datos de solo lectura para la aplicación.

- `ConfiguracionHabitacion`: Define las propiedades base de cada tipo de edificio (costes, tiempo de construcción, producción, etc.).
- `ConfiguracionEntrenamiento`: Define las propiedades de cada tipo de entrenamiento disponible.
- `ConfiguracionTropa`: Define las estadísticas y costes de cada tipo de unidad reclutable.

## 5. Interacción Frontend-Backend

### Lectura de Datos (Server-Side)
La aplicación aprovecha intensivamente los Server Components de Next.js para la lectura de datos. Componentes como `ResourceBar` y `RoomsView` son asíncronos y utilizan funciones de `lib/data.ts` (ej. `getSessionUser`, `getRoomConfigurations`) para obtener datos directamente de la base de datos. Esto elimina la necesidad de endpoints de API para la lectura y reduce el *waterfall* de peticiones cliente-servidor.

### Escritura de Datos (Flujo Propuesto)
Actualmente, no hay implementaciones de escritura. El flujo propuesto para acciones del usuario (ej. hacer clic en "Ampliar" en `RoomsView`) es el siguiente:

1.  El usuario desencadena una acción en la UI.
2.  Se invoca una **Server Action** o se realiza una petición a una **API Route**.
3.  El backend valida si el usuario tiene los recursos necesarios.
4.  Si la validación es exitosa, se crea un nuevo evento (ej. `CONSTRUCCION_INICIADA`) y se añade a una cola de eventos.
5.  El backend actualiza el estado de la base de datos (ej. descuenta los recursos) y devuelve una respuesta a la UI.
6.  La UI se actualiza, preferiblemente de forma optimista, para reflejar el inicio de la acción.

## 6. Puntos Críticos a Evaluar para Mejoras

Se solicita al experto que evalúe la arquitectura actual y proponga mejoras, centrándose en las siguientes áreas:

#### 1. Base de Datos
- **Pregunta**: ¿Cómo se debería reestructurar el `schema` de Prisma para escalar de manera eficiente? La mezcla de datos de perfil y de juego en el modelo `User` parece insostenible.
- **Hipótesis**: ¿Sería beneficioso crear modelos separados como `PerfilUsuario` y `ProgresoUsuario` o `RecursosUsuario`? ¿Cómo se relacionarían con el modelo `User` principal? ¿Qué impacto tendría esto en el rendimiento de las consultas?

#### 2. Gestión de Recursos Continuos
- **Pregunta**: ¿Cuál es la estrategia más eficiente y precisa para implementar la generación de recursos basada en el tiempo (el "truco de OGame")? Los recursos deben acumularse incluso cuando el usuario está desconectado.
- **Opciones**:
    a) **Cálculo en el momento de la solicitud**: Calcular los recursos generados desde la última conexión cada vez que el usuario realiza una acción.
    b) **Proceso en segundo plano**: Utilizar un *worker* o *cron job* para actualizar los recursos de todos los usuarios a intervalos regulares. ¿Cuál es el *trade-off* en términos de coste, precisión y carga en la base de datos?

#### 3. Cola de Eventos (Event Queue)
- **Pregunta**: ¿Cuál es el diseño óptimo para una cola de eventos que gestione construcciones, entrenamientos y otras tareas asíncronas de larga duración?
- **Opciones**: ¿Cómo se debe modelar la cola en Prisma? ¿Qué plataforma es más adecuada para procesar esta cola? ¿**Scheduled Functions** (Netlify/Firebase), **Vercel Cron Jobs**, o una solución más robusta como BullMQ en un servidor separado?

#### 4. Server Actions vs. API Routes
- **Pregunta**: Para las acciones de escritura iniciadas por el usuario, ¿cuándo se debe preferir el uso de **Server Actions** sobre las **API Routes** tradicionales?
- **Contexto**: Considerar factores como la latencia percibida, la simplicidad del código (colocación), la reutilización de la lógica y la facilidad para implementar `Optimistic UI`.

#### 5. Optimistic UI
- **Pregunta**: ¿Cuál es la mejor manera de implementar una UI optimista en componentes como `RoomsView`?
- **Contexto**: Después de que un usuario inicie una ampliación, la UI debería reflejar inmediatamente el estado "en construcción" sin esperar la confirmación completa del backend. ¿Cómo se gestionan los posibles errores de validación en el servidor y se revierte el estado en la UI?
