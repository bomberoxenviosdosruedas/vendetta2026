# Análisis Profesional de la Estructura del Directorio `src/lib`

Este documento ofrece un análisis detallado de la arquitectura implementada en el directorio `src/lib`, diseñada para maximizar la modularidad, escalabilidad y mantenibilidad del backend de la aplicación "Vendetta". La estructura sigue el principio de **separación de preocupaciones**, un pilar fundamental en el desarrollo de software moderno.

---

## 1. Visión General de la Arquitectura

La estrategia central es dividir la lógica del backend en tres capas distintas y bien definidas, cada una con una responsabilidad única:

1.  **Capa de Acciones (`actions/`)**: El punto de entrada para las mutaciones de datos desde el cliente.
2.  **Capa de Lógica de Negocio (`formulas/`)**: El cerebro que contiene todas las reglas y cálculos del juego.
3.  **Capa de Acceso a Datos (`data.ts`)**: El único canal para leer información de la base de datos.

Este enfoque desacopla la lógica, permitiendo que cada parte evolucione de forma independiente y facilitando las pruebas y la depuración.

---

## 2. Desglose de Directorios y Archivos

### **`src/lib/actions/`**

*   **Propósito**: Este directorio es el corazón de la interacción cliente-servidor para **modificar datos**. Contiene todas las **Server Actions** de Next.js. Cada vez que un usuario realiza una acción que cambia el estado del juego (construir, reclutar, atacar), invoca una función de esta capa.

*   **Estructura**: La lógica está organizada en archivos por dominio de negocio (ej. `room.actions.ts`, `troop.actions.ts`, `family.actions.ts`).

*   **Lógica Interna**:
    *   **Orquestación**: No contienen lógica de negocio compleja. Su función es la de un "director de orquesta".
    *   **Validación**: Realizan la validación inicial de los datos de entrada y de la sesión del usuario.
    *   **Invocación**: Llaman a las funciones puras de `src/lib/formulas` para obtener los resultados de los cálculos (ej. cuánto cuesta una tropa, cuánto tarda en construirse).
    *   **Transacciones**: Ejecutan las transacciones de base de datos (`prisma.update`, `prisma.create`) para persistir los cambios.
    *   **Revalidación**: Utilizan `revalidatePath` de Next.js para invalidar la caché y asegurar que la interfaz de usuario se actualice instantáneamente tras la mutación.

---

### **`src/lib/formulas/`**

*   **Propósito**: Este es el núcleo de la propiedad intelectual del juego. Contiene toda la **lógica de negocio pura y sin estado**. Aquí residen las "reglas del juego".

*   **Estructura**: Al igual que las acciones, se organiza por dominio (`room-formulas.ts`, `mission-formulas.ts`, etc.).

*   **Lógica Interna**:
    *   **Funciones Puras**: Cada función toma una entrada y, basándose en ella, devuelve una salida predecible sin efectos secundarios (no modifica la base de datos, no lee cookies).
    *   **Ejemplos**:
        *   `calcularCostosNivel()`: Determina el coste de recursos de una mejora.
        *   `calcularTiempoConstruccion()`: Calcula la duración de una construcción con las bonificaciones aplicadas.
        *   `calcularStatsTropaConBonus()`: Aplica las bonificaciones de los entrenamientos a las estadísticas base de una tropa.
    *   **Testabilidad**: Esta separación hace que la lógica del juego sea extremadamente fácil de probar de forma aislada, garantizando que los cálculos son correctos sin necesidad de simular una base de datos o una sesión de usuario.

---

### **`src/lib/data.ts`**

*   **Propósito**: Es la **Capa de Acceso a Datos (Data Access Layer)**, responsable exclusivamente de las **operaciones de lectura** de la base de datos.

*   **Lógica Interna**:
    *   **Centralización**: Todas las consultas `findUnique`, `findMany`, etc., se centralizan aquí. Si en el futuro se necesita cambiar la forma en que se obtienen los datos, solo se modifica este archivo.
    *   **Tipado de Datos**: Define y exporta los tipos de TypeScript personalizados (ej. `UserWithProgress`, `FullPropiedad`) que representan las entidades del juego con todas sus relaciones. Esto proporciona seguridad de tipos en toda la aplicación.
    *   **Optimización de Consultas**: Utiliza `include` de Prisma para obtener todos los datos necesarios en una sola consulta (ej. un usuario con todas sus propiedades, y a su vez, cada propiedad con sus habitaciones y tropas), evitando el problema de N+1 consultas.
    *   **Cacheo**: Emplea `React.cache` (o `unstable_cache` en versiones anteriores de Next.js) para cachear los resultados de las consultas de datos que no cambian con frecuencia (como la configuración de tropas o habitaciones), reduciendo drásticamente las llamadas a la base de datos y mejorando el rendimiento.

---

### **Otros Archivos Clave**

*   **`src/lib/auth.ts` / `auth-admin.ts`**: Gestionan de forma aislada todo lo relacionado con la autenticación: creación y lectura de cookies de sesión, verificación de permisos, etc. Separar esta lógica es crucial por seguridad y claridad.
*   **`src/lib/prisma/prisma.ts`**: Configura e instancia un cliente de Prisma único y global, optimizado con `Accelerate` para un rendimiento superior en entornos serverless.

---

## Conclusión

Esta arquitectura de `src/lib` promueve un código limpio, desacoplado y altamente eficiente. Al separar claramente las **acciones (qué hacer)**, las **fórmulas (cómo calcular)** y los **datos (qué información usar)**, el proyecto "Vendetta" está preparado para crecer de manera ordenada, facilitar la colaboración entre desarrolladores y minimizar la aparición de errores complejos.