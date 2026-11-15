# Fuentes, condiciones de entrega y créditos

Revisión de Andrés / Rol 6 preparada el 14 de noviembre de 2026. Se conservan enlaces y síntesis para poder volver a comprobar la edición antes del envío.

| Tema | Evidencia consultada | Decisión para ALTARIS |
|---|---|---|
| Enunciado de 2026 | El reto pide seleccionar variables de observación o modelos terrestres, mostrar su evolución, localizar y cuantificar cambios y evaluar su significancia. [Enunciado NASA Space Apps](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/) | Mostrar una celda identificable, una serie con unidades y una explicación de la incertidumbre. |
| Fecha, registro y envío | La página de 2026 indica registro individual, elección de evento y equipo de hasta seis. El envío se hace desde la pestaña Project y cierra el 15 de noviembre a las 23:59 locales. [Edición 2026](https://www.spaceappschallenge.org/2026/) | Andrés comprueba los seis miembros y la sede en la cuenta del equipo. La asignación en Git no confirma registro. |
| Demo y material generado con IA | Una respuesta marcada como contestada por un Navigator indica hasta 30 segundos de video o siete láminas. Indica declarar el uso de IA, marcar imágenes o videos generados por IA y acreditar recursos. La respuesta menciona uso demostrable de una fuente NASA del reto para premios globales. [Aclaración de 2026](https://github.com/nasa/spaceapps/discussions/1947) | Se elige video corto en inglés. Se usan capturas del prototipo con identificación visible de producción asistida y datos simulados. Revisar créditos y fuente NASA real al reemplazar el ensayo. |
| Guías completas | Los accesos directos a la [guía de envío](https://www.spaceappschallenge.org/resources/project-submission-guide/) y la [guía de evaluación](https://www.spaceappschallenge.org/resources/judging-awards-guide/) no devolvieron contenido íntegro verificable en esta revisión. | Quedan pendientes texto completo, campos, límites de caracteres, requisitos de idioma y rúbrica vigente. Los cinco criterios de la propuesta siguen siendo guía interna. |
| Relevancia territorial | FAO sitúa a más de diez millones de personas en el Corredor Seco centroamericano. La cifra corresponde al corredor en su conjunto. [Ficha de FAO](https://www.fao.org/fileadmin/user_upload/rlc/docs/DryCorridor.pdf) | Usar como contexto, sin atribuir esa población a Honduras, al mapa publicado o al alcance del prototipo. |
| Próximos pasos locales | Se comprobó que abren las páginas de [SERVIR](https://www.servirglobal.net/) y [NASA Harvest](https://www.nasaharvest.org/). | Los enlaces acompañan las preguntas del sector y conducen a recursos de seguimiento. |

## Recursos del proyecto y uso efectivo

- **Datos servidos actualmente.** Series y ejemplos sintéticos generados por el equipo. La celda con JSON inválido se usa exclusivamente para comprobar el manejo de errores. Las observaciones previstas proceden de GPM IMERG y una segunda variable de NASA POWER. ONI de NOAA es una fuente auxiliar. David debe completar colección, versión, DOI, fecha, cobertura, licencia y transformación de cada fuente efectivamente incorporada.
- **Software.** React y React DOM para la interfaz, Recharts para gráficas, TypeScript y Vite para compilar, Vitest y Playwright para verificar. Las versiones exactas están en [package-lock.json](../../rol5-panel-app/package-lock.json). Python genera las narraciones sin servicios externos. El video de ensayo usa capturas de la app local, textos en inglés y codificación VP8/WebM con Pillow y OpenCV.
- **Cartografía y material audiovisual.** El selector actual dibuja las coordenadas del fixture. Natural Earth y la textura satelital corresponden a integraciones previstas. Añadir proveedor, licencia y atribución de los archivos que terminen en la demo. El video de ensayo utiliza gráficos del equipo y carece de banda sonora o fotografías.
- **Equipo.** David, datos. Joshua, estadística. Camila, ENSO y revisión científica. Elena, web y despliegue. Izel, panel y pasaporte. Andrés, producto, contenido, usuarios y entrega. Las contribuciones futuras se actualizan al congelar la versión.

## Registro de IA

| Herramienta | Uso documentado | Artefactos y revisión |
|---|---|---|
| Claude | Asistencia en el código inicial del panel, declarada en su README | [Panel del Rol 5](../../rol5-panel-app/README.md). Izel puede precisar los archivos originales. |
| OpenAI Codex | Asistencia en panel, pruebas, pasaporte, integración y documentación de relevos | Rama del panel, historial de Git y pruebas automatizadas. |
| OpenAI Codex | Apoyo a Andrés en contenido bilingüe, código del narrador y su prueba, búsqueda de referencias, borrador del formulario, protocolo, textos y composición de la demo | Archivos de este directorio, `pipeline/10_narrate.py` y JSON de contenido. El narrador ejecutado utiliza plantillas deterministas. Revisión editorial por Andrés y científica por Camila pendiente para el material final. |
