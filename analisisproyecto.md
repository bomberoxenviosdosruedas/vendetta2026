
# Análisis de Negocio y Requerimientos Funcionales: Vendetta

## 1. Dominio de Negocio y Propósito Principal

**Vendetta** es una aplicación web de estrategia y gestión de recursos en tiempo real, ambientada en una temática de mafiosos. El propósito principal de la aplicación es ofrecer una experiencia de juego multijugador donde los usuarios asumen el rol de un jefe mafioso. El objetivo es construir y expandir un imperio criminal compitiendo o colaborando con otros jugadores.

El núcleo del juego gira en torno a los siguientes pilares:
- **Gestión de Recursos**: Los jugadores deben gestionar la producción, almacenamiento y gasto de recursos clave como armas, munición, alcohol y dólares.
- **Construcción y Desarrollo**: Los jugadores desarrollan sus propiedades mediante la construcción y mejora de diferentes "habitaciones" o edificios, cada uno con una función específica (producción, investigación, defensa, etc.).
- **Estrategia Militar**: Los jugadores reclutan y entrenan diferentes tipos de "tropas" (unidades) para llevar a cabo misiones de ataque, defensa, espionaje y ocupación de nuevos territorios.
- **Investigación y Progreso**: Existe un árbol tecnológico donde los jugadores invierten recursos y tiempo en "entrenamientos" para desbloquear nuevas unidades, mejorar sus estadísticas y obtener ventajas estratégicas.
- **Interacción Multijugador**: La aplicación fomenta la interacción a través de un sistema de familias (clanes), mensajería directa, rankings de clasificación y un mapa global donde se visualizan las propiedades de todos los jugadores.

## 2. Entidades y Modelo de Datos

El modelo de datos es la columna vertebral que soporta la lógica del juego. Las entidades principales son:

- **User**: Representa al jugador. Almacena sus credenciales, perfil (nombre, título, avatar) y es la entidad central que se relaciona con todas las demás.

- **Propiedad**: Cada jugador puede poseer múltiples propiedades en un mapa global definido por coordenadas (ciudad, barrio, edificio). Cada propiedad es una base de operaciones independiente con sus propios recursos, edificios y tropas.

- **Configuraciones (Modelos Estáticos)**:
  - **ConfiguracionHabitacion**: Define las "plantillas" para cada tipo de edificio. Contiene sus costos base, tiempo de construcción, puntos que otorga y qué recurso produce.
  - **ConfiguracionEntrenamiento**: Define las plantillas para cada tipo de investigación o tecnología, incluyendo sus costos, duración y puntos.
  - **ConfiguracionTropa**: Define las estadísticas base de cada unidad (ataque, defensa, velocidad, etc.), sus costos y los entrenamientos que potencian sus habilidades (bonus).

- **Entidades de Progreso (Modelos Dinámicos)**:
  - **HabitacionUsuario**: Vincula a un `User` con una `ConfiguracionHabitacion` en una `Propiedad` específica, almacenando el `nivel` actual de dicho edificio.
  - **EntrenamientoUsuario**: Vincula a un `User` con una `ConfiguracionEntrenamiento`, almacenando el `nivel` de investigación alcanzado.
  - **TropaUsuario**: Almacena la `cantidad` de cada tipo de tropa que un `User` posee en una `Propiedad` determinada.

- **Colas de Eventos (Gestión de Tareas Asíncronas)**:
  - **ColaConstruccion**: Registra las órdenes de construcción de edificios para una propiedad. Permite encolar múltiples construcciones.
  - **ColaReclutamiento**: Gestiona el proceso de reclutamiento de tropas en una propiedad.
  - **ColaEntrenamiento**: Gestiona las órdenes de investigación de tecnologías para un usuario.
  - **ColaMisiones**: Registra las flotas de tropas en movimiento, sus destinos, y sus tiempos de llegada y regreso.

- **Family y Social**:
  - **Family**: Representa un clan o alianza de jugadores. Tiene un nombre, un tag y miembros.
  - **FamilyMember**: Vincula a un `User` con una `Family`, asignándole un rol (Líder, Miembro).
  - **Message**: Almacena los mensajes enviados entre jugadores.

## 3. Casos de Uso y Flujos de Usuario

La aplicación soporta una variedad de flujos de usuario que definen la jugabilidad:

- **Autenticación y Registro**: Un usuario puede crear una nueva cuenta o iniciar sesión. Al registrarse, se le asigna automáticamente una "Propiedad Principal" con recursos y edificios iniciales para comenzar a jugar.

- **Gestión de Propiedades y Recursos**:
  - El usuario visualiza sus recursos (armas, munición, etc.) en tiempo real a través de una barra de recursos.
  - Puede cambiar entre sus diferentes propiedades usando un selector, y la interfaz se actualiza para mostrar los datos de la propiedad seleccionada.
  - La producción de recursos se calcula y actualiza en el servidor en cada carga de página, simulando una generación continua.

- **Construcción de Edificios**:
  - Desde la vista de "Habitaciones", el usuario ve una lista de todos los edificios disponibles.
  - Puede iniciar la "ampliación" de un edificio. El sistema verifica si tiene los recursos necesarios y si la cola de construcción no está llena.
  - Si las condiciones se cumplen, los recursos se descuentan y la construcción se añade a la `ColaConstruccion`. El progreso se visualiza en la UI.

- **Entrenamiento e Investigación**:
  - Desde la vista de "Entrenamiento", el usuario accede al árbol tecnológico.
  - Puede iniciar la investigación de una nueva tecnología si cumple los requisitos (recursos y nivel de otros entrenamientos).
  - La investigación se añade a la `ColaEntrenamiento` y su progreso es visible.

- **Reclutamiento de Tropas**:
  - En las vistas de "Reclutamiento" y "Seguridad", el usuario puede reclutar unidades de ataque o defensa.
  - El sistema valida los recursos y añade la orden a la `ColaReclutamiento`.

- **Misiones y Combate**:
  - El usuario puede enviar flotas de tropas a otras coordenadas del mapa para atacar, espiar u ocupar.
  - El sistema calcula la duración del viaje basándose en la distancia y la velocidad de la tropa más lenta.
  - La misión se registra en la `ColaMisiones` y el movimiento de la flota es visible en la UI.
  - El **Simulador de Batalla** permite a los usuarios predecir el resultado de un combate introduciendo los ejércitos y niveles de entrenamiento del atacante y el defensor.

- **Gestión de Familia**:
  - Los jugadores pueden crear su propia familia o recibir invitaciones para unirse a una existente.
  - Dentro de una familia, pueden ver a otros miembros y (si tienen permisos) gestionar el clan.

- **Panel de Administración**:
  - Existe una interfaz protegida para administradores que permite realizar operaciones CRUD sobre todas las configuraciones del juego (costos, estadísticas de tropas, requisitos de edificios), facilitando el balanceo y la gestión del juego sin necesidad de modificar el código.

## 4. Reglas de Negocio y Lógica Clave

La lógica del juego está gobernada por un conjunto de reglas y fórmulas implementadas en el servidor:

- **Costos Exponenciales**: El costo para subir de nivel un edificio o entrenamiento no es lineal. Se calcula usando un factor cuadrático (`nivel * nivel`), lo que hace que cada nivel sea progresivamente más caro que el anterior.

- **Tiempos de Construcción/Entrenamiento**:
  - El tiempo de construcción de un edificio se reduce en función del nivel de la "Oficina del Jefe".
  - El tiempo de entrenamiento de tecnologías se reduce en función del nivel de la "Escuela de Especialización".
  - El tiempo de reclutamiento de tropas se reduce en función del nivel del "Campo de Entrenamiento" o "Seguridad".

- **Producción de Recursos**: La producción por hora de los edificios generadores de recursos (armería, cervecería, etc.) se calcula mediante fórmulas específicas que dependen del nivel del edificio.

- **Capacidad de Almacenamiento**: Los recursos no se pueden acumular infinitamente. La capacidad máxima de cada recurso está determinada por el nivel de los edificios de almacenamiento correspondientes (Almacén de Armas, Caja Fuerte, etc.).

- **Estadísticas de Tropas**: El ataque y la defensa de una tropa no son estáticos. Se calculan dinámicamente aplicando un bonus basado en la raíz cuadrada de la suma de los niveles de los entrenamientos relevantes que el jugador haya investigado.

- **Cálculo de Distancia y Viaje**: La distancia entre dos puntos del mapa se calcula mediante una fórmula personalizada que pondera las diferencias entre ciudades, barrios y edificios. La duración del viaje depende de esta distancia y de la velocidad de la unidad más lenta en la flota.

- **Lógica del Bucle de Juego (Game Tick)**: En cada interacción del usuario con el dashboard, el servidor realiza una secuencia de verificaciones y actualizaciones en un orden específico:
  1. Finaliza eventos completados (construcciones, reclutamientos, misiones).
  2. Actualiza los recursos generados desde la última conexión.
  3. Recalcula y guarda la puntuación total del jugador.
  4. Renderiza la página con el estado final y actualizado.
