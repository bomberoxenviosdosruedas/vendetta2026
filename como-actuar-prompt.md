# Cómo Interactuar con el Asistente AI (Guía de Prompts)

Este documento establece un flujo de trabajo recomendado para solicitar cambios en el proyecto "Vendetta". Seguir este proceso en tres pasos nos permitirá construir funcionalidades de manera ordenada, eficiente y con alta calidad.

## Contexto Previo: Análisis de la Estructura

Antes de solicitar cualquier implementación (Paso 1 o 2), siempre comenzaré analizando el archivo `estructura.json`. Esto me permite:

-   **Evitar duplicidad**: Reutilizaré componentes, funciones o lógica que ya existan.
-   **Mantener la consistencia**: Seguiré los patrones de diseño y la arquitectura actual del proyecto.
-   **Entender el alcance**: Tendré una visión clara de dónde encajan los nuevos cambios.

## El Flujo de Trabajo en Tres Pasos

Para implementar una nueva funcionalidad completa (por ejemplo, "permitir al usuario reclutar una tropa"), divide tu solicitud en los siguientes tres prompts.

---

### **Paso 1: Implementación del Backend**

En este primer paso, nos centraremos exclusivamente en la lógica del servidor y la base de datos.

**Cómo formular el prompt:**

> "Para la funcionalidad de [nombre de la funcionalidad], necesito que implementes el backend. Esto incluye:
> 1.  **Modelo de datos (si es necesario):** [Describe los cambios en `prisma/schema.prisma`, como añadir nuevos modelos o campos].
> 2.  **Lógica de negocio:** [Describe las funciones a crear en `/lib/data.ts` o nuevas Server Actions para leer o escribir datos].
> 3.  **Actualización de datos iniciales (si es necesario):** [Indica si hay que modificar `prisma/seed.ts` para reflejar los nuevos cambios en el schema]."

**Ejemplo Práctico:**

> "Para la funcionalidad de 'Reclutamiento de Tropas', necesito que implementes el backend. Esto incluye:
> 1.  Añadir un nuevo modelo en Prisma llamado `ColaReclutamiento` con campos como `userId`, `tropaId`, `cantidad`, `fechaFinalizacion`.
> 2.  Crear una Server Action `reclutarTropa(tropaId, cantidad)` que verifique si el usuario tiene recursos suficientes, los descuente y añada una nueva entrada a la `ColaReclutamiento`."

---

### **Paso 2: Implementación del Frontend**

Una vez que el backend esté listo y confirmado, procederemos a construir la interfaz de usuario que lo consumirá.

**Cómo formular el prompt:**

> "Ahora, implementa el frontend para la funcionalidad de [nombre de la funcionalidad].
> 1.  **Componente/Vista:** [Describe el componente a crear o modificar, por ejemplo, en `/src/app/(dashboard)/recruitment/page.tsx`].
> 2.  **Interacción:** [Explica cómo el usuario interactúa con la UI y cómo esta debe llamar a la lógica de backend que creamos en el paso 1].
> 3.  **Visualización de datos:** [Detalla cómo se deben mostrar los datos obtenidos del backend]."

**Ejemplo Práctico:**

> "Ahora, implementa el frontend para el 'Reclutamiento de Tropas'.
> 1.  En la página de 'Reclutamiento', muestra una lista de las tropas disponibles obtenidas desde la base de datos.
> 2.  Cada tropa debe tener un campo de entrada para la cantidad y un botón 'Reclutar'.
> 3.  Al hacer clic en 'Reclutar', se debe invocar la Server Action `reclutarTropa` que creamos anteriormente, pasándole el ID de la tropa y la cantidad."

---

### **Paso 3: Revisión, Optimización y Confirmación**

Este es el paso final de control de calidad. Una vez que tanto el backend como el frontend están implementados, verificamos que todo funcione correctamente y aplicamos mejoras.

**Cómo formular el prompt:**

> "Revisa la implementación completa de la funcionalidad de [nombre de la funcionalidad].
> 1.  **Confirma la conexión**: Asegúrate de que el frontend se comunica correctamente con el backend.
> 2.  **Aplica buenas prácticas**: Revisa el código de los pasos 1 y 2 y aplica optimizaciones si es necesario (por ejemplo, UI optimista, manejo de estados de carga/error, refactorización para mayor claridad).
> 3.  **Valida el resultado**: Confirma que el flujo completo funciona como se esperaba."

**Ejemplo Práctico:**

> "Revisa la implementación del 'Reclutamiento de Tropas'.
> 1.  Verifica que al hacer clic en 'Reclutar', se llame a la Server Action y la base de datos se actualice.
> 2.  Añade un estado de carga al botón 'Reclutar' para que el usuario sepa que la acción se está procesando. Implementa una UI optimista para que la tropa aparezca en la cola de reclutamiento inmediatamente."

---

Siguiendo este proceso, podremos avanzar de manera estructurada, minimizando errores y asegurando que cada pieza de la aplicación se construya sobre una base sólida.