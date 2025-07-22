# Guía de Prompts para la Refactorización del Directorio `src/lib`

Este documento se basa en el análisis de `src/analisissrclib.md` y proporciona una serie de prompts estructurados para refactorizar el backend de "Vendetta", asegurando una arquitectura modular, escalable y mantenible. **Todas las rutas de archivo mencionadas en estos prompts son relativas a `src/lib` y deben ejecutarse dentro de ese directorio.**

---

## Fase 1: Separación de Lógica de Negocio y Acciones

El objetivo de esta fase es extraer la lógica de negocio pura (cálculos) a su propia capa (`formulas`) y dejar en la capa de `actions` únicamente la orquestación de las mutaciones de datos.

### **Prompt 1.1: Creación de la Capa de Fórmulas (`formulas`)**

> "Vamos a refactorizar la lógica de negocio. Crea el directorio `src/lib/formulas` y mueve todas las funciones de cálculo puras a archivos específicos dentro de él.
> 1.  Crea `src/lib/formulas/room-formulas.ts` y mueve toda la lógica relacionada con el cálculo de costos, tiempos de construcción y producción de las habitaciones. Esto incluye funciones como `calcularCostosNivel`, `calcularTiempoConstruccion` y toda la lógica de `calcularProduccionRecurso`.
> 2.  Crea `src/lib/formulas/troop-formulas.ts` y mueve la lógica para calcular el tiempo de reclutamiento y las estadísticas de las tropas con sus bonificaciones.
> 3.  Crea `src/lib/formulas/score-formulas.ts` para encapsular los cálculos de puntuación (`calcularPuntosHabitaciones`, `calcularPuntosTropas`, etc.).
> 4.  Asegúrate de que todas estas funciones sean exportadas y elimina la lógica duplicada de los archivos de `actions`."

### **Prompt 1.2: Reorganización de la Capa de Acciones (`actions`)**

> "Con la lógica de negocio ya separada, vamos a organizar las Server Actions por dominio.
> 1.  Crea el directorio `src/lib/actions` si no existe.
> 2.  Mueve las Server Actions existentes a archivos específicos dentro de este directorio. Por ejemplo, `iniciarAmpliacion` debe ir a `src/lib/actions/room.actions.ts`, `iniciarReclutamiento` a `src/lib/actions/troop.actions.ts`, y `obtenerEstadoJuegoActualizado` a `src/lib/actions/user.actions.ts`.
> 3.  Modifica estas acciones para que importen las funciones de cálculo desde `src/lib/formulas` en lugar de contener la lógica ellas mismas. Su única responsabilidad debe ser: validar, llamar a las fórmulas, interactuar con la base de datos (a través de `prisma`) y revalidar la caché de Next.js (`revalidatePath`)."

---

## Fase 2: Refinamiento de la Capa de Datos y Autenticación

### **Prompt 2.1: Consolidación de la Capa de Datos**

> "Revisa el archivo `src/lib/data.ts` para asegurar que cumple estrictamente con su rol de Capa de Acceso a Datos.
> 1.  Verifica que `src/lib/data.ts` solo contenga funciones de **lectura** de la base de datos (`findMany`, `findUnique`).
> 2.  Asegúrate de que todas las consultas complejas (con múltiples `include`) estén definidas aquí y no en los componentes.
> 3.  Confirma que se está utilizando `React.cache` para las consultas de datos que son estáticos o que cambian con poca frecuencia (como `getRoomConfigurations`) para optimizar el rendimiento."

### **Prompt 2.2: Verificación de la Lógica de Autenticación**

> "Asegúrate de que la lógica de autenticación esté correctamente aislada.
> 1.  Revisa `src/lib/auth.ts` y confirma que todas las funciones relacionadas con la gestión de cookies de sesión (`login`, `logout`, `getSessionUser`) estén contenidas en este archivo.
> 2.  Verifica que las Server Actions que requieren un usuario autenticado estén llamando a `getSessionUser` al principio como una guarda de seguridad."

---

Al completar estas fases, el directorio `src/lib` estará perfectamente alineado con los principios de una arquitectura robusta y modular, tal como se describe en `src/analisissrclib.md`.