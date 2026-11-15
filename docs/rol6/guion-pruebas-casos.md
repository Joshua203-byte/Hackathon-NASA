# Guion de las 5 pruebas con personas, con los casos reales (tarea 11) \*

\* **Avanzado, no terminado. Falta que Andrés lo termine:** reclutar a las personas, hacer las sesiones, llenar la tabla y pasar el resultado al formulario. Lo preparó David el domingo 15 de madrugada.

Este guion **completa** el protocolo de Andrés en [pruebas-usuarios.md](pruebas-usuarios.md), sin reemplazarlo. Ese documento sigue mandando en consentimiento, anonimato y registro. Aquí se agrega lo concreto: qué abrir, qué pedir y cuál es la respuesta correcta en cada tarea, con las cifras reales de la app.

## Antes de empezar (5 minutos, una sola vez)

- [ ] Abrir <https://altaris.altaris-panel-rol5.workers.dev> en el dispositivo de la prueba y comprobar que carga el mapa.
- [ ] Si Izel ya volvió a publicar `main`, el recorrido guiado muestra el caso real. Si no, igual se puede hacer la prueba: el guion no depende del recorrido.
- [ ] Tener a mano la tabla de registro de [pruebas-usuarios.md](pruebas-usuarios.md) y un cronómetro.
- [ ] Para cada persona, una ventana de incógnito nueva. Así no se mezclan las respuestas guardadas en el navegador.
- [ ] Anotar en la tabla la versión publicada (fecha y hora de la última publicación) y el idioma de la app.

## Las tres tareas, con su respuesta correcta

Leer cada tarea en voz alta, tal cual. Empezar el cronómetro al terminar de leer. No ayudar hasta que la persona lo pida, y anotarlo si lo pide.

### Tarea 1 · Ubicación

> «Busca en el mapa la zona de Choluteca, en el sur de Honduras, y abre sus datos.»

- **Éxito:** abre la celda `N1335W08715` o una vecina de Choluteca y llega al panel con la serie de lluvia.
- **Atajo, solo si se rinde:** <https://altaris.altaris-panel-rol5.workers.dev/?case=1>. Se anota como "con ayuda".
- **Qué debería ver:** veredicto **sin evidencia** en lluvia de temporada (mayo–octubre), con una pendiente de −48 mm por década y un intervalo de −257 a +171.

### Tarea 2 · Interpretación (la más importante)

Abrir el caso 2: <https://altaris.altaris-panel-rol5.workers.dev/?case=2> (celda `N1475W08765`, Honduras).

> «¿La lluvia está bajando en este lugar? Cambia los años que se analizan y explícame cuánta confianza le tienes a lo que ves.»

- **Éxito si hace las dos cosas:**
  1. **Cambia la ventana de años** en el gráfico triangular o en el comparador.
  2. **Explica que la respuesta depende de los años elegidos** y que con el periodo completo no hay evidencia.
- **Respuestas que cuentan como correctas:**
  - «Con los 24 años no se puede decir que baje.»
  - «Si empiezo en 2008 parece que baja mucho, pero si miro 2001–2010 parece que sube.»
  - «Depende de qué años mire, así que no le tengo mucha confianza.»
- **Respuestas que NO cuentan:**
  - «Sí, la lluvia está bajando» (sin matiz).
  - Que cambie la ventana pero no saque ninguna conclusión.
- **Cifras de referencia, para el entrevistador:**

| Años | Pendiente (mm por década) | Veredicto |
|---|---|---|
| 2001–2024 (completo) | −48 | sin evidencia |
| 2008–2023 | −345 | limitada |
| 2001–2010 | +382 | limitada |

- **Registrar aparte** si lo logra en **un minuto o menos**. Es el criterio de Izel.

### Tarea 3 · Uso

> «Si vivieras o trabajaras en esta zona, ¿qué harías con esta información?»

- **Éxito:** menciona una pregunta local y un dato que buscaría para contrastarla. Por ejemplo: «preguntaría a los agricultores si notan menos lluvia», «compararía con el pluviómetro del municipio» o «no cambiaría la siembra solo por esto».
- **No cuenta:** «Ya sé que va a llover menos». Eso es una predicción, y la herramienta no predice.

## Las dos preguntas de la app

Al final del pasaporte, la app muestra dos preguntas. No mostrar la respuesta. Se registra solo el **primer** intento.

| Pregunta | Respuesta correcta | Incorrecta |
|---|---|---|
| ¿Qué significa evidencia limitada? | **Señal débil, no confirmada** | Cambio confirmado |
| ¿Para qué sirve cambiar la ventana? | **Explorar la sensibilidad a los años elegidos** | Predecir la lluvia futura |

## Resultado para el formulario

Al terminar, contar (solo con personas reales, sin repetir):

| Indicador | Resultado |
|---|---|
| Personas que hicieron la prueba | __ |
| Completaron las 3 tareas sin ayuda | __ de __ |
| Acertaron las 2 preguntas | __ de __ |
| Cumplieron las dos cosas anteriores (**meta: 4 de 5**) | __ de __ |
| Interpretaron, cambiaron la ventana y explicaron en ≤ 1 minuto | __ de __ |
| Los 3 problemas más graves (tarea, qué pasó, cuántas veces) | 1. … 2. … 3. … |

Frase para el formulario en inglés (reemplazar los números; si hubo menos de cinco personas, poner el número real):

> *"In a quick comprehension test, __ people new to the project used the public app. __ of __ completed the three tasks (find a site, interpret the trend after changing the years, name a local use) without help, and __ of __ answered both comprehension questions correctly. The main difficulty was __."*

Si no se llega a hacer ninguna sesión, el formulario debe decirlo: *"User testing was planned but not carried out before the deadline."* No inventar resultados.

## A quién pasar los problemas

- Mapa o navegación: Elena.
- Interpretación, ventana de años o pasaporte: Izel.
- Textos confusos: Andrés, con revisión de Camila si toca la ciencia.
