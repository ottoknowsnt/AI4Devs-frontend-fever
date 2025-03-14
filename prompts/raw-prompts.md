La aplicación actual dispone de una vista para listar todas las posiciones (http://localhost:3000/positions).

Ahora, el equipo de diseño te ha encargado implementar la vista de detalle de una posición en concreto, accesible al pulsar el botón "Ver proceso" de una de las posiciones listadas.

Se te proporciona el mockup adjunto y los siguientes requisitos:

1. La interfaz será tipo kanban, mostrando los candidatos como tarjetas en diferentes columnas que representan las fases del proceso de contratación.
2. EL mockup adjunto solo debe servir como base del diseño final, este debe ser adaptado al diseño actual de la aplicación, y seguir todas las convenciones del proyecto.
3. Deben mostrarse tantas columnas como fases haya en el proceso, incluso si no hay ningún candidato en alguna fase.
4. La tarjeta de cada candidato debe situarse en la fase correspondiente, y debe mostrar su nombre completo y su puntuación media.
5. En móvil, las fases deben mostrarse en vertical, ocupando todo el ancho de la pantalla.
6. Se debe mostrar el título de la posición en la parte superior, para dar contexto.

Los endpoints a utilizar para obtener los datos correspondientes son los siguientes:
- GET `/position/:id/interviewflow`: Este endpoint devuelve información sobre el proceso de contratación para una determinada posición. Nos serán útiles los siguientes campos:
  - `interviewFlow` -> `positionName`
  - `interviewFlow` -> `interviewFlow` -> `interviewSteps` -> `name`
- GET `/position/:id/candidates`: Este endpoint devuelve todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado `positionID`. Nos serán útiles los siguientes campos:
  - `fullName`
  - `currentInterviewStep` (name)
  - `averageScore`

- Todavía no existe un endpoint para obtener todas las posiciones, así que mantén las posiciones mock de la vista listado, pero usa los datos reales de los dos endpoints anteriores para la nueva vista detalle.

---

Has recibido los siguientes requisitos nuevos del equipo de diseño:

1. Se debe poder actualizar la fase en la que se encuentra un candidato arrastrando su tarjeta a otra columna.

Los endpoints a utilizar para implementar esta funcionalidad son los siguientes:
- PUT `/candidates/:id`: Este endpoint permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico, a través del siguiente cuerpo JSON:
  - `applicationId`: id entero de la aplicación del candidato. Este campo se incluye en la información de cada candidato proporcionada por el endpoint GET `/position/:id/candidates`.
  - `currentInterviewStep`: id de la fase a la que mover el candidato. Este campo se incluye en la información de cada fase proporcionada por el endpoint GET `/position/:id/interviewflow`.