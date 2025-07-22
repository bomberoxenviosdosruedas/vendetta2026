# Guia de Prompts para la Implementacion de Calculo de Misiones

Este documento proporciona los prompts necesarios para implementar la nueva logica de calculo de distancias, costes y tiempos para las misiones en el proyecto "Vendetta".

---

## 1. Backend: Implementacion de las Nuevas Formulas de Calculo

### **Prompt 1.1: Refactorizacion de la Logica de Misiones**

> "Vamos a reestructurar por completo la logica de calculo para las misiones. Esto requiere modificar el backend para usar las nuevas formulas basadas en coordenadas virtuales.
>
> 1.  **Crea un nuevo archivo de formulas**: Dentro de `src/lib/formulas`, crea un nuevo archivo llamado `mission-formulas.ts`. Este archivo contendra toda la logica nueva.
> 2.  **Implementa las funciones de conversion y distancia**: Dentro de `mission-formulas.ts`, crea las siguientes funciones `export`:
>     *   Una funcion que convierta las coordenadas del juego `(ciudad, barrio, edificio)` en coordenadas virtuales `(altura, anchura)` siguiendo las formulas:
>         *   `altura = (barrio - 1) * 15 + Math.ceil(edificio / 17)`
>         *   `anchura = (ciudad - 1) * 17 + (edificio - (Math.floor((edificio - 1) / 17) * 17))`
>     *   Una funcion `calcularDistancia(origen, destino)` que tome dos sets de coordenadas del juego, las convierta a sus equivalentes virtuales usando la funcion anterior, y luego calcule la distancia euclidiana con el teorema de Pitagoras: `distancia = Math.sqrt(diff_altura^2 + diff_anchura^2)`. **No redondees el resultado final**.
> 3.  **Implementa la funcion de tiempo de viaje**: En el mismo archivo, crea una funcion `calcularDuracionViaje(distancia, velocidadMasLenta)`. Esta funcion debe implementar la formula: `(0.21989 * Math.pow(velocidadMasLenta, -0.2)) * Math.pow(distancia, 0.2)`. El resultado esta en dias, asi que **conviertelo a segundos** (`resultado * 86400`) y redondealo al entero mas cercano.
> 4.  **Actualiza la Server Action**: Modifica la server action `enviarMision` en `src/lib/actions/mission.actions.ts`. Debe importar y usar las nuevas funciones `calcularDistancia` y `calcularDuracionViaje` para determinar el tiempo de la mision en lugar de la logica anterior.
> 5.  **Refactoriza la velocidad de flota**: La funcion `calcularVelocidadFlota` debe ser movida a `mission-formulas.ts` y actualizada para ser mas eficiente, utilizando un `Map` para las configuraciones de tropas."

---

## 2. Frontend: Adaptacion de la Interfaz a los Nuevos Calculos

### **Prompt 2.1: Actualizacion de la Vista de Misiones**

> "Ahora que el backend calcula los tiempos de viaje correctamente, necesitamos que la interfaz del usuario en la pagina de Misiones refleje estos calculos en tiempo real antes de enviar la mision.
>
> 1.  **Refactoriza `src/components/dashboard/missions-view.tsx`**:
>     *   Importa las nuevas funciones de calculo desde `mission-formulas.ts`.
>     *   Utiliza `useState` y `useEffect` o `useCallback` para recalcular dinamicamente el `travelTime` cada vez que las coordenadas de destino o la cantidad de tropas seleccionadas cambien.
>     *   Asegurate de que el tiempo de viaje mostrado al usuario se formatea correctamente usando la funcion de utilidad existente para duraciones."

