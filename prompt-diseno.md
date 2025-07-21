# Guía de Prompts para Mejoras Visuales y de UX en "Vendetta"

Este documento proporciona una serie de prompts estructurados para solicitar mejoras en la interfaz de usuario (UI) y la experiencia de usuario (UX) del proyecto. El objetivo es evolucionar hacia una aplicación más moderna, dinámica y usable en cualquier dispositivo.

---

## 1. Mejoras Generales de Estilo y Coherencia Visual

El objetivo de esta fase es establecer una base visual sólida y coherente en toda la aplicación.

### **Prompt 1.1: Refinamiento de la Paleta de Colores y Tema**

> "Vamos a refinar el tema visual de la aplicación. Actualiza el archivo `src/app/globals.css` para ajustar la paleta de colores. Quiero un tema oscuro más sofisticado:
> - **Background**: Un gris muy oscuro, casi negro, pero no completamente (ej. `240 5% 5%`).
> - **Card/Secondary**: Un gris ligeramente más claro que el fondo para crear contraste sutil (ej. `240 4% 10%`).
> - **Primary**: Un rojo intenso y autoritario, pero no estridente (ej. `0 75% 50%`).
> - **Accent**: Un dorado o ámbar vibrante para los detalles importantes y llamadas a la acción (ej. `45 90% 50%`).
> Asegúrate de que todas las variables de color en `:root` se actualicen para reflejar este nuevo esquema."

### **Prompt 1.2: Mejora de Tipografía y Espaciado**

> "Mejora la legibilidad y el impacto visual de la tipografía en toda la aplicación.
> 1.  En `src/app/layout.tsx`, utiliza `next/font` para importar dos fuentes de Google Fonts: 'Roboto' para el cuerpo del texto y 'Bebas Neue' para los títulos (`font-heading`).
> 2.  Configura estas fuentes como variables CSS en `tailwind.config.ts` para que se puedan usar con las clases `font-sans` y `font-heading`.
> 3.  Aplica la clase `font-heading` a los títulos principales (h1, h2, etc.) en componentes clave como `overview-view.tsx` y en las cabeceras de las páginas para darles un aspecto más fuerte y temático."

---

## 2. Animaciones y Microinteracciones

El objetivo es dar vida a la interfaz, proporcionando feedback visual al usuario y haciendo que la aplicación se sienta más reactiva.

### **Prompt 2.1: Animaciones de Entrada y Transiciones Suaves**

> "Quiero que la aplicación se sienta más dinámica.
> 1.  En `tailwind.config.ts`, define una animación de `fade-in` y `fade-in-up`.
> 2.  Crea una clase de utilidad `@layer components` en `globals.css` llamada `.main-view` que aplique esta animación de entrada a los contenedores principales de cada página (como en `overview/page.tsx`, `rooms/page.tsx`, etc.).
> 3.  Asegúrate de que las transiciones de color en los botones y otros elementos interactivos sean suaves añadiendo `transition-colors` en sus clases base en los componentes de `shadcn/ui`."

### **Prompt 2.2: Feedback en Acciones del Usuario**

> "Mejora el feedback visual cuando un usuario realiza una acción.
> 1.  En todos los formularios que ejecutan una Server Action (como en `training-view.tsx` o `rooms-view.tsx`), asegúrate de que el botón de envío muestre un ícono de `Loader2` con la animación `animate-spin` mientras la acción está pendiente (`isPending`).
> 2.  Implementa una UI optimista en las acciones más comunes, como añadir un edificio a la cola de construcción. Al hacer clic, el elemento debería aparecer inmediatamente en la UI en un estado 'pendiente', en lugar de esperar la respuesta del servidor."

---

## 3. Diseño Responsivo y Adaptativo

El objetivo es garantizar que "Vendetta" sea perfectamente jugable y visualmente atractivo en dispositivos móviles, tabletas y ordenadores de escritorio.

### **Prompt 3.1: Tablas de Datos Adaptativas**

> "Las tablas de datos, como las de la página de Clasificaciones (`rankings/page.tsx`), son ilegibles en móviles.
> 1.  Implementa un diseño adaptativo: en pantallas de escritorio (`md:` y superiores), muestra la `Table` completa.
> 2.  En pantallas móviles (por debajo de `md:`), oculta la tabla y en su lugar muestra una lista de componentes `Card`, donde cada tarjeta representa una fila de la tabla y presenta los datos de forma vertical y legible."

### **Prompt 3.2: Adaptación de Formularios y Vistas Complejas**

> "La vista del Simulador (`simulator-view.tsx`) y los modales de edición del panel de Admin son demasiado anchos para móviles.
> 1.  Modifica el layout del Simulador para que las columnas de 'Atacante' y 'Defensor' se apilen verticalmente en pantallas pequeñas en lugar de estar una al lado de la otra.
> 2.  Para los modales de edición (`room-config-form.tsx`, etc.), utiliza `ScrollArea` de `shadcn/ui` para que el contenido del formulario sea desplazable verticalmente si excede la altura de la pantalla del dispositivo, asegurando que el botón de 'Guardar' siempre sea accesible."

### **Prompt 3.3: Navegación Responsiva**

> "La barra lateral de navegación (`sidebar-nav.tsx`) debe ser funcional en móviles.
> 1.  El componente `Sidebar` de `shadcn/ui` ya tiene lógica responsiva. Asegúrate de que el `SidebarTrigger` (el botón de hamburguesa) sea visible solo en móviles (`md:hidden`) y que esté colocado en la cabecera principal.
> 2.  Verifica que al hacer clic en un elemento del menú en la vista móvil, la barra lateral se cierre automáticamente para no obstruir la vista de la página recién cargada."
