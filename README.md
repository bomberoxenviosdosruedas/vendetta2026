# Vendetta - Informe de Arquitectura Técnica

## 1. Visión General del Proyecto

**Vendetta** es una aplicación web de estrategia y gestión de recursos en tiempo real con temática de mafiosos. Los jugadores asumen el rol de un jefe mafioso, gestionando recursos, propiedades, tropas y entrenamientos para expandir su imperio.

La aplicación está construida sobre un stack moderno, utilizando:
- **Next.js**: Con el App Router para un enrutamiento y renderizado del lado del servidor eficientes.
- **TypeScript**: Para seguridad de tipos y un desarrollo más robusto.
- **Prisma**: Como ORM para la interacción con una base de datos PostgreSQL.
- **Shadcn/UI & Tailwind CSS**: Para una interfaz de usuario moderna, responsiva y personalizable.

---

## 2. Arquitectura del Directorio `src`

La estructura del proyecto está organizada por dominios para promover la modularidad y la escalabilidad.

-   **/app**: Contiene todas las rutas, páginas y layouts, siguiendo las convenciones del App Router.
    -   `(dashboard)`: Un grupo de rutas que comparten un layout común (`layout.tsx`), el cual gestiona el estado del juego en cada carga. Las páginas son Server Components por defecto, lo que permite la lectura de datos directamente desde el servidor.
    -   `page.tsx`: La página de inicio de sesión y registro.
-   **/components**: Alberga componentes de React reutilizables.
    -   `dashboard`: Componentes específicos del dominio del juego (ej. `RoomsView`, `ResourceBar`, `MissionsView`).
    -   `ui`: Componentes de UI genéricos de `shadcn/ui`.
-   **/contexts**: Contiene los Contextos de React para la gestión de estado en el cliente (ej. `property-context.tsx` para gestionar la propiedad seleccionada).
-   **/lib**: Es el núcleo de la lógica de negocio del servidor.
    -   `actions`: Contiene las **Server Actions** separadas por dominio (`room.actions.ts`, `troop.actions.ts`, etc.). Es la principal vía para que el frontend modifique datos en el backend.
    -   `formulas`: Contiene funciones puras para cálculos del juego (costos, tiempos, producción), también organizadas por dominio.
    -   `data.ts`: Capa de acceso a datos (Data Access Layer) que centraliza todas las **operaciones de lectura** de la base de datos. Utiliza `React.cache` para optimizar consultas de datos estáticos.
    -   `auth.ts`: Gestiona la autenticación y las sesiones de usuario mediante cookies.
    -   `prisma/prisma.ts`: Instancia y configura el cliente de Prisma.
-   **/prisma**: Contiene todo lo relacionado con la base de datos.
    -   `schema.prisma`: La definición de todos los modelos y relaciones de la base de datos.
    -   `datosactuales`: Archivos JSON utilizados por los scripts de `seeding` para poblar la base de datos con datos de prueba y configuración inicial.
    -   `seed.ts`: El script orquestador que ejecuta la importación de datos.

---

## 3. Esquema de la Base de Datos (`prisma/schema.prisma`)

El esquema está diseñado para separar claramente los datos de configuración estática, los datos dinámicos del jugador y las colas de eventos.

### Modelos de Configuración (Estáticos)
Estos modelos definen las "reglas del juego". Se cargan una sola vez a través del seeding y son de solo lectura para la aplicación.
-   `ConfiguracionHabitacion`: Define las propiedades base de cada tipo de edificio (costos, duración, puntos, etc.).
-   `ConfiguracionEntrenamiento`: Define las propiedades de cada tipo de entrenamiento.
-   `ConfiguracionTropa`: Define las estadísticas y costos de cada tipo de unidad reclutable.
-   `PoderAtaque`: Almacena la tabla de modificadores de ataque basados en el número de propiedades y el nivel de honor.

### Modelos de Usuario y Propiedad (Dinámicos)
-   `User`: Modelo central que representa a un jugador.
-   `Propiedad`: Cada usuario puede tener múltiples propiedades. Cada propiedad tiene sus propios recursos (`armas`, `municion`, etc.) y su propio conjunto de edificios y tropas.
-   `HabitacionUsuario`: Tabla pivote que almacena el `nivel` de una `ConfiguracionHabitacion` específica para una `Propiedad` de un usuario.
-   `TropaUsuario`: Almacena la `cantidad` de cada tipo de `ConfiguracionTropa` en una `Propiedad`.
-   `EntrenamientoUsuario`: Almacena el `nivel` de cada `ConfiguracionEntrenamiento` para un `User`.
-   `PuntuacionUsuario`: Almacena los puntos totales y desglosados del usuario para facilitar el cálculo de rankings.

### Modelos de Colas de Eventos (Dinámicos)
-   `ColaConstruccion`: Registra las órdenes de construcción de edificios en una propiedad. Permite hasta 5 construcciones en cola.
-   `ColaReclutamiento`: Registra la orden de reclutamiento de tropas en una propiedad. Solo permite una orden activa por propiedad a la vez.
-   `ColaMisiones`: Registra las flotas de tropas en movimiento (ataques, transportes, etc.), con sus tiempos de llegada y regreso.
-   `ColaEntrenamiento`: Registra las órdenes de investigación de tecnologías para un usuario.

---

## 4. Flujo de Lógica y Datos

El flujo de la aplicación está optimizado para aprovechar las capacidades de los Server Components y Server Actions de Next.js.

### Bucle Principal del Juego (Game Tick del Servidor)
En cada carga de una página dentro del `(dashboard)/layout.tsx`, se ejecuta una secuencia de acciones en el servidor para actualizar el estado del juego:
1.  **Finalizar Eventos**: Se llaman en paralelo las funciones para verificar y finalizar eventos completados:
    -   `verificarYFinalizarConstruccion`: Promueve el siguiente edificio en la cola de construcción.
    -   `verificarYFinalizarReclutamiento`: Añade las tropas reclutadas a la propiedad.
    -   `verificarYFinalizarMisiones`: Devuelve las tropas de misiones completadas.
2.  **Actualizar Recursos**: La función `obtenerEstadoJuegoActualizado` calcula los recursos generados desde la última conexión y los actualiza en la base de datos.
3.  **Recalcular Puntuación**: `actualizarPuntuacionUsuario` recalcula los puntos del jugador con los nuevos datos.
4.  **Renderizado**: El estado final y actualizado del usuario se pasa a los componentes del cliente para su renderizado.

### Interacción Frontend-Backend
-   **Lectura de Datos**: Los componentes de servidor (`async/await`) en las páginas obtienen los datos directamente llamando a funciones de `src/lib/data.ts`.
-   **Escritura de Datos**: Las interacciones del usuario (como hacer clic en "Ampliar" o "Reclutar") llaman directamente a las **Server Actions** desde los componentes del cliente (`'use client'`). Estas acciones se encargan de la validación y la modificación de la base de datos.

---

## 5. Panel de Administración (`/admin`)

Para facilitar la gestión y el balanceo del juego, se ha implementado un panel de administración protegido.

-   **Acceso**: El panel está protegido por una contraseña simple definida en `src/lib/auth-admin.ts`. La sesión de administrador se gestiona a través de una cookie segura.
-   **Rutas**: La interfaz del panel se encuentra en las rutas que comienzan con `/app/admin/`.
-   **Funcionalidades**:
    -   **Gestión de Configuraciones**: Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre las entidades de configuración del juego a través de tablas interactivas y formularios modales:
        -   Habitaciones (`ConfiguracionHabitacion`)
        -   Entrenamientos (`ConfiguracionEntrenamiento`)
        -   Tropas (`ConfiguracionTropa`)
    -   **Matriz de Bonus de Ataque**: Ofrece una interfaz de matriz visual para gestionar las bonificaciones de daño entre diferentes tipos de tropas (`TropaBonusContrincante`), permitiendo un ajuste fino y rápido del balance de combate.
    -   **Responsivo**: La interfaz está diseñada para ser funcional en dispositivos móviles, utilizando componentes como `ScrollArea` para manejar tablas de datos complejas.

---

## 6. Datos de Prueba (`prisma/datosactuales`)

Este directorio es vital para el desarrollo y las pruebas, ya que permite recrear un estado consistente de la base de datos.
-   **Archivos JSON**: Cada archivo `.json` corresponde a un modelo en `prisma/schema.prisma`.
    -   `configuracion*.json`: Contienen los datos base del juego (costos, estadísticas, etc.). Son la "Biblia" del juego.
    -   `user.json`, `propiedad.json`, etc.: Contienen datos de un usuario de prueba (`bomberox`) con un estado de juego predefinido (recursos, niveles de edificios, tropas) que permite probar todas las funcionalidades sin tener que empezar de cero cada vez.
-   **Proceso de Seeding**: El comando `prisma db seed` (configurado en `package.json`) ejecuta el script `prisma/seed.ts`. Este script orquesta la ejecución de varios sub-scripts (`impoconfiguracion*.ts`, `impousuarioprueba.ts`) que leen los archivos JSON y utilizan `prisma.upsert()` para poblar la base de datos, asegurando un entorno de desarrollo predecible y funcional.
```