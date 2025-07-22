# Guia de Prompts para Implementar Bonificaciones y Fórmulas de Tropas

Este documento proporciona los prompts necesarios para implementar la nueva lógica de cálculo de bonificaciones para las estadísticas de las tropas, incluyendo capacidad de carga, valor de combate y velocidad.

---

## 1. Backend: Actualización de las Fórmulas de Cálculo de Tropas

### **Prompt 1.1: Refactorización Completa de `troop-formulas.ts`**

> "Vamos a actualizar toda la lógica de cálculo de bonificaciones de tropas para reflejar las nuevas reglas de capacidad, combate y velocidad. Modifica el archivo `src/lib/formulas/troop-formulas.ts`.
>
> 1.  **Refactoriza `calcularStatsTropaConBonus`**:
>     *   Cambia la fórmula de cálculo para ataque y defensa. En lugar de `ENTERO(BASE*RAIZ(SUMA_NIVELES)/10+BASE)`, debe ser una fórmula multiplicativa. El nuevo cálculo debe ser `Valor Base * (1 + RAÍZ(Nivel Formación 1) / 10) * (1 + RAÍZ(Nivel Formación 2) / 10) * ...`. Itera sobre las formaciones de `bonusAtaque` y `bonusDefensa` y multiplica los factores de bonificación.
>     *   Esta función ahora debe devolver también `capacidadActual` y `velocidadActual` además de `ataqueActual` y `defensaActual`.
>
> 2.  **Implementa la Bonificación de Capacidad por Contrabando**:
>     *   Dentro de `calcularStatsTropaConBonus`, si la tropa no es de tipo 'DEFENSA' y tiene una capacidad base mayor que 0, calcula la `capacidadActual` aplicando la fórmula `Capacidad Base * (1 + RAÍZ(Nivel de Contrabando) / 10)`. El nivel de 'contrabando' debe obtenerse del mapa de entrenamientos del usuario.
>
> 3.  **Implementa las Bonificaciones de Velocidad**:
>     *   Dentro de `calcularStatsTropaConBonus`, aplica la bonificación de velocidad correspondiente. Define dos listas de IDs de tropas, una para `rutas` y otra para `encargos`.
>     *   Si el ID de la tropa está en la lista de 'rutas', calcula la `velocidadActual` con la fórmula `Velocidad Base * (1 + RAÍZ(Nivel de Rutas) / 10)`.
>     *   Si el ID de la tropa está en la lista de 'encargos', calcula la `velocidadActual` con la fórmula `Velocidad Base * (1 + RAÍZ(Nivel de Encargos) / 10)`.
>     *   Si una tropa no está en ninguna lista, su `velocidadActual` es igual a su `velocidad` base."

---

## 2. Frontend: Integración de las Nuevas Estadísticas en la Interfaz

### **Prompt 2.1: Actualización de las Vistas de Reclutamiento y Seguridad**

> "Ahora que las fórmulas del backend devuelven las estadísticas actualizadas (ataque, defensa, capacidad y velocidad), necesitamos que la interfaz de usuario lo refleje.
>
> 1.  **Actualiza `recruitment/page.tsx` y `security/page.tsx`**:
>     *   Modifica el mapeo de `troopConfigs` para que la llamada a `calcularStatsTropaConBonus` también recupere `capacidadActual` y `velocidadActual`.
>     *   Pasa estos nuevos valores (`capacidadActual` y `velocidadActual`) como props a `RecruitmentView` y `SecurityView`.
>
> 2.  **Modifica `recruitment-view.tsx` y `security-view.tsx`**:
>     *   Actualiza los componentes para recibir y mostrar las nuevas estadísticas. En la sección de detalles de cada tropa, junto al ataque y la defensa, muestra la capacidad y la velocidad con sus respectivos iconos.
>
> 3.  **Refactoriza el Modal de Detalles (`troop-details-modal.tsx`)**:
>     *   El modal ahora debe recibir y mostrar las 4 estadísticas (`ataqueActual`, `defensaActual`, `capacidadActual`, `velocidadActual`).
>     *   Actualiza la tabla y la vista de tarjetas dentro del modal para incluir la capacidad y la velocidad, mostrando tanto el valor base como el valor actual con las bonificaciones aplicadas."

