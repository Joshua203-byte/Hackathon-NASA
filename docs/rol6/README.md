# Entrega ALTARIS · Andrés, Rol 6

**Actualización del 15 de noviembre — ampliación:** [reporte de Andrés](../ca/andres.md), [formulario de siete países](submission-en-ca.md), [README alternativo en inglés](README-en-ca.md), [guion de video en dos versiones](guion-video-30s.md) y [referencias en inglés](references-en.md). Las [guías oficiales 2026](guias-2026-resumen.md) ya se leyeron directamente. La ampliación conserva marcadores hasta recibir datos y revisión; el formulario de tres países sigue siendo el respaldo.

> **Documento histórico (corte del 14 de noviembre).** El estado vigente y lo que falta están en [06-estado-y-reparto.md](../06-estado-y-reparto.md). Desde entonces hay datos reales, mapa y despliegue.

**Corte del 14 de noviembre de 2026, El Salvador.** Andrés coordina producto, contenido, pruebas, demo y envío. El panel permite ensayar con cuatro celdas simuladas. Todavía faltan el conjunto observado, la selección científica de los tres casos y las sesiones con personas.

| Entregable | Disponible ahora | Condición para cerrarlo |
|---|---|---|
| Reglas, créditos y uso de IA | [Registro de fuentes y verificación 2026](fuentes.md) | Comparar con la guía íntegra vigente, los campos visibles en Project y las instrucciones de la sede. Andrés comprueba los seis registros y que cuenta con acceso de envío. |
| Formulario | [Texto en inglés](submission-en.md) listo para revisar por secciones | Joshua proporciona cifras, Camila revisa interpretaciones, Elena aporta URL pública. Andrés comprueba audiencia del enlace y términos en el portal. |
| Contenido del panel | [Glosario](../../rol5-panel-app/public/data/glossary.json), [reglas de preguntas](../../rol5-panel-app/public/data/decision_rules.json) y [recorrido ES/EN](../../rol5-panel-app/public/data/tour.json) | Adaptar la ventana del paso tres al Caso 1 observado. Camila aprueba los textos de los casos antes de la demo final. |
| Narraciones por celda | [Generador por plantillas](../../pipeline/10_narrate.py) y textos precalculados en los JSON | Ejecutar sobre la carpeta de exportación científica después de calcular los veredictos. Revisar una celda de cada categoría con Camila. |
| Demo de ensayo | [Video en inglés, 28 s, WebM](altaris-prototype.webm), con capturas del software | Regrabar sobre versión congelada, cronometrar dos ensayos, comprobar reproducción pública con una persona ajena y verificar que aparezca el aporte NASA real. |
| Pruebas con personas | [Invitación, guion y hoja anónima](pruebas-usuarios.md) | Reclutar cinco adultos, medir tres tareas sin ayuda y registrar los resultados efectivamente obtenidos. |
| Envío | Plazo y ruta del portal registrados | Andrés envía desde la cuenta del equipo, conserva confirmación y anota URL y hora. Meta interna del domingo: 21:00. |

## Reproducir la narración

Desde la raíz, `python pipeline/10_narrate.py rol5-panel-app/public/data --check` comprueba los textos actuales. Sin `--check`, actualiza las narraciones de los indicadores de lluvia de las celdas listadas en `grid.json`. Se preservan estadísticas y las celdas de prueba inválidas ajenas a la rejilla. Procesar una copia de la exportación para ensayar una actualización. La interfaz lee el texto precalculado y muestra su origen como `template`.

## Relevo de los tres casos

| Caso que debe recibir Andrés | Evidencia mínima de Camila y Joshua | Pregunta que abre el caso |
|---|---|---|
| Corredor Seco hondureño | ID, indicador, periodo, pendiente, completitud, veredicto y razones | “How has seasonal rainfall changed at this site, and how strong is the evidence?” |
| Sensibilidad al periodo | ID, indicador, ventana existente y cifras de ambas ventanas | “Does the apparent trend hold when we change the first or last year?” |
| Contraste entre sitios | Dos IDs, indicador comparable, resultado ENSO y sus límites | “How do these two sites differ during the same climate phase?” Si no se distingue el contraste ENSO, comparar dos veredictos y explicar esa limitación. |

## Guion de la demo

El video actual usa capturas del sitio hondureño simulado `N1335W08725`, rotuladas en inglés. No tiene voz ni música. De 0 a 5 s se selecciona la ubicación; de 5 a 11 s se lee la pendiente; de 11 a 17 s se cambia la ventana; de 17 a 23 s se interpreta la evidencia limitada; de 23 a 28 s se presenta el pasaporte. Para la toma definitiva usar el ID y veredicto reales, mostrar el producto NASA y su procedencia, y volver a verificar duración y enlaces. Probar también el video sin sonido, en incógnito y desde un teléfono.
