# Informe de Lógica de Archivos en `src/lib`

A continuación, se detalla el propósito y la lógica de cada uno de los archivos TypeScript dentro del directorio `src/lib` y sus subdirectorios.

---

### 1. `src/lib/actions.ts`

**Propósito Principal**: Contener las **Server Actions** de la aplicación. Estas son funciones que se ejecutan exclusivamente en el servidor pero pueden ser llamadas directamente desde los componentes del cliente (frontend), sirviendo como el puente principal para realizar modificaciones en la base de datos (escrituras, actualizaciones, eliminaciones).

**Lógica Detallada**:
*   `obtenerEstadoJuegoActualizado(user)`:
    *   Calcula el tiempo transcurrido desde la última vez que se actualizaron los recursos del usuario.
    *   Llama a las funciones de `formulas-produccion.ts` para calcular cuántos recursos (armas, munición, alcohol, dólares) se han generado en ese tiempo.
    *   Actualiza la base de datos (`ProgresoUsuario`) con los nuevos totales de recursos y la nueva fecha de actualización.
    *   Devuelve el objeto de usuario con su progreso ya actualizado. Esta es la función clave que hace que los recursos se acumulen con el tiempo, incluso si el usuario está desconectado.
*   `iniciarAmpliacion(habitacionId)`:
    *   Es la acción que se ejecuta cuando un usuario hace clic en el botón "Ampliar" de una habitación.
    *   Verifica que el usuario esté autenticado.
    *   Calcula el costo de recursos necesarios para el siguiente nivel de la habitación usando las funciones de `formulas.ts`.
    *   Comprueba si el usuario tiene suficientes recursos.
    *   Si los tiene, realiza una transacción en la base de datos para descontar los recursos y aumentar el nivel de la habitación.
    *   Si no, devuelve un mensaje de error.
    *   Utiliza `revalidatePath` de Next.js para forzar la recarga de los datos en las páginas afectadas y que la UI refleje el cambio.

---

### 2. `src/lib/auth.ts`

**Propósito Principal**: Gestionar la autenticación y las sesiones de los usuarios.

**Lógica Detallada**:
*   Utiliza un sistema de **cookies** para manejar las sesiones de forma simplificada.
*   `login(username)`: Crea una cookie segura (`httpOnly`) llamada `vendetta-session` que almacena el nombre de usuario. Esta cookie se envía al navegador del cliente para mantenerlo autenticado.
*   `logout()`: Elimina la cookie de sesión, cerrando la sesión del usuario.
*   `getSessionUser()`: Lee la cookie desde el servidor para obtener el nombre de usuario y luego usa ese nombre para obtener el perfil completo del usuario y su progreso desde la base de datos (llamando a `getUserWithProgressByUsername` de `data.ts`). Esta función es fundamental para que los componentes del servidor sepan qué usuario está conectado.

---

### 3. `src/lib/data.ts`

**Propósito Principal**: Centralizar todas las operaciones de **lectura** de la base de datos. Este archivo actúa como la capa de acceso a datos (Data Access Layer) de la aplicación.

**Lógica Detallada**:
*   Define los tipos de datos personalizados de TypeScript (como `UserWithProgress`, `FullConfiguracionHabitacion`) para asegurar que los datos que se mueven por la aplicación tengan una estructura consistente y predecible.
*   Contiene funciones asíncronas para obtener datos específicos de la base de datos, como:
    *   `getRoomConfigurations()`: Obtiene la configuración base y de escalado de todas las habitaciones.
    *   `getTroopConfigurations()`: Obtiene la configuración de todas las tropas.
    *   `getTrainingConfigurations()`: Obtiene la configuración de todos los entrenamientos.
    *   `getUserByUsername(username)` y `getUserWithProgressByUsername(username)`: Funciones para buscar un usuario por su nombre de usuario, incluyendo todas sus relaciones (progreso, habitaciones, entrenamientos, tropas).

---

### 4. `src/lib/formulas-produccion.ts`

**Propósito Principal**: Encapsular y centralizar la lógica de negocio para el cálculo de la **producción de recursos**.

**Lógica Detallada**:
*   Contiene funciones de cálculo puras y específicas para cada edificio que produce recursos (Armería, Almacén de Munición, Cervecería, etc.).
*   Cada función (`calcularProduccionArmeria`, `calcularProduccionCerveceria`, etc.) implementa la fórmula matemática exacta que define cuántos recursos por hora produce un edificio según su nivel.
*   `calcularProduccionRecurso(idHabitacion, nivel)`: Una función "directora" que, dado un ID de habitación, selecciona y ejecuta la fórmula de cálculo correcta.
*   `calcularProduccionTotalPorSegundo(user)`: Agrega la producción de todas las habitaciones de un usuario para obtener una tasa total de generación de recursos (armas/seg, munición/seg, etc.). Este es el resultado que usa `actions.ts` para actualizar el progreso del juego.

---

### 5. `src/lib/formulas.ts`

**Propósito Principal**: Encapsular y centralizar la lógica de negocio para el cálculo de **costos y tiempos** de las mejoras.

**Lógica Detallada**:
*   `calcularCostosNivel(nivel, config)`: Calcula el costo de recursos para mejorar una habitación a un nivel específico. Utiliza el costo base y aplica un factor de crecimiento exponencial.
*   `calcularTiempoConstruccion(nivel, config, nivelOficinaJefe)`: Implementa la lógica compleja para determinar cuánto tiempo (en segundos) tardará en completarse una mejora, basándose en el nivel objetivo, el tipo de habitación y el nivel de la "Oficina del Jefe" del jugador (que proporciona una bonificación de reducción de tiempo).
*   `calcularCostosEntrenamiento` y `calcularTiempoEntrenamiento`: Funciones análogas a las anteriores, pero aplicadas a la mejora de los entrenamientos en lugar de las habitaciones.

---

### 6. `src/lib/prisma/prisma.ts`

**Propósito Principal**: Configurar e instanciar el cliente de Prisma.

**Lógica Detallada**:
*   Crea una única instancia global del cliente de Prisma.
*   Aplica la extensión `Accelerate` (`.extends(withAccelerate())`), que es una optimización de Prisma para entornos serverless (como Vercel o Netlify) que gestiona un pool de conexiones a la base de datos para mejorar el rendimiento y evitar agotar las conexiones.
*   Exporta esta instancia para que pueda ser utilizada por otros archivos del backend (`data.ts`, `actions.ts`) para interactuar con la base de datos.

---

### 7. `src/lib/utils.ts`

**Propósito Principal**: Contener funciones de utilidad genéricas y reutilizables en toda la aplicación, principalmente para el frontend.

**Lógica Detallada**:
*   `cn(...inputs)`: Es una función de utilidad muy común en proyectos con Tailwind CSS. Su propósito es fusionar inteligentemente clases de CSS. Permite combinar clases condicionalmente (gracias a `clsx`) y resuelve conflictos de clases de Tailwind (gracias a `tailwind-merge`). Por ejemplo, si se le pasa `'p-2'` y `'p-4'`, `twMerge` se asegurará de que solo se aplique `'p-4'`, evitando inconsistencias en el estilo.