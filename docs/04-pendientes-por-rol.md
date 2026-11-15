# Trabajo pendiente por rol

**Estado al 14 de noviembre de 2026.** En el corte revisado, `main` contenía la propuesta v3.1 (`79e3ba1`) y el panel inicial estaba publicado en `izel/panel-celda` (`97833fc`). Esta entrega incorpora en esa rama las ampliaciones del panel, los ejemplos simulados y sus pruebas. El equipo confirmó que aún faltan resultados del pipeline, el mapa definitivo y pruebas con participantes. Los nombres son las asignaciones tentativas de la [propuesta, sección 5](../PROPUESTA_ALTARIS_PLAN_EQUIPO.md#5-roles).

## Rol 1 · David · Datos e ingesta

1. Probar Earthdata con un archivo IMERG. Registrar dimensiones, unidades, faltantes, tamaño y último año completo. Lanzar la descarga y extraer primero la serie mensual de Choluteca. Entregarla a Joshua y Camila con coordenadas, periodo y procedencia.
2. Recortar al Triángulo Norte, convertir tasas a milímetros por mes usando los días reales y verificar febrero bisiesto. Generar el cubo, máscara por país, `cells.csv` y `borders.geojson`. Entregar bordes a Elena.
3. Generar `indicators.nc` con lluvia de mayo–octubre, julio–agosto y anual, años válidos, ciclo mensual y aplicabilidad de canícula. Joshua y Camila pueden procesar la misma versión en paralelo.
4. Contrastar el signo de la tendencia en tres sitios con otra fuente, documentar su independencia y entregar el chequeo de 2014 a Joshua. Con los IDs de casos de Camila, obtener la segunda variable NASA y pasarla por el motor. Documentar DOI, versión, fecha y receta reproducible. Probar un recorte de El Salvador antes de afirmar replicabilidad.

## Rol 2 · Joshua · Motor estadístico

1. Fijar umbrales en `config.yaml` y acordar con Izel la semántica de los resultados por ventana. Hay ejemplos de JSON en el panel para probar el contrato desde ahora. El veredicto por ventana necesita una regla científicamente justificada y un resultado explícito del motor.
2. Implementar pendiente de Sen e IC, Mann–Kendall, tratamiento de autocorrelación, huella y exportador. Probar pendiente conocida, ruido puro, año extremo y valores faltantes. Procesar la primera serie real y entregar su JSON a Izel.
3. Con los indicadores regionales, medir primero 50 celdas, calcular tendencias, huellas y FDR por indicador. Publicar una primera versión de `grid.json`, `cells/*.json` y `meta.json` para la integración web, señalando controles pendientes.
4. Incorporar pruebas ENSO y bandera de 2014. Calibrar falsos positivos y potencia con series barajadas y tendencias inyectadas. Revisar diez celdas y entregar a Rol 6 la tabla por país, indicador y veredicto con la versión de los JSON.

## Rol 3 · Camila · ENSO y revisión científica

1. Descargar ONI de NOAA con su procedencia, calcular fases por año e indicador y preparar `enso.json`. Preparar correlación de Spearman, compuesto El Niño menos neutral y las dos pruebas de sensibilidad. Leer las referencias y redactar limitaciones.
2. Comprobar con la celda piloto que años y estaciones coincidan. Con la región completa, calcular correlaciones, FDR y resultados ENSO por celda. Pasar los campos a Joshua.
3. Examinar el ciclo mensual de la costa norte de Honduras. Elegir desde los resultados el caso del Corredor Seco, un caso sensible a la ventana y el contraste Pacífico–Caribe si se distingue. Entregar inmediatamente los IDs a David y luego `cases.json` con enlaces a Elena y Rol 6.
4. Revisar cifras y afirmaciones de web, demo y formulario. Documentar incertidumbre, referencias y posibles preguntas del jurado. El agrupamiento de celdas es P2 y requiere que P0 y P1 funcionen.

## Rol 4 · Elena · Mapa y despliegue

1. Montar la web principal con MapLibre y reutilizar el panel de esta rama. Acordar con Izel un único estado de URL para celda, indicador, lente, ventana, idioma, ENSO y recorrido.
2. Con los ejemplos simulados, implementar mapa, clic que carga el detalle, leyenda, bordes y primer despliegue identificado como demo. El selector geográfico de esta rama permite comprobar la interacción antes de integrar MapLibre.
3. Conectar primero el sitio piloto y luego la región. Implementar capas de veredicto, pendiente, estabilidad y ENSO según disponibilidad. Medir rendimiento, integrar lentes y enlaces de casos, comprobar carga, errores, accesibilidad, ES/EN, móvil e incógnito.
4. Tras completar mapa, selección, URL y primer despliegue, evaluar globo P1 con textura y licencia verificadas. Priorizar que la URL pública y los enlaces profundos funcionen. Meta del plan: carga en menos de tres segundos.

## Rol 5 · Izel · Panel y pasaporte

1. Entregar esta rama a Elena y Joshua. Ya incluye serie, huella, comparador, vistas ENSO y espejo, lentes, tarjetas, segunda variable, matriz, glosario, recorrido, pasaporte y microvalidación. La sesión verificó 34 pruebas unitarias, 41 comprobaciones de navegador, tipos y compilación con ejemplos simulados.
2. Recibir el JSON piloto, cotejar cifras y unidades con el panel y las exportaciones. Repetir con una celda completa y otra incompleta del conjunto regional. Revisar ventanas sin veredicto, canícula no aplicable, ENSO faltante y procedencia.
3. Integrar el panel con el mapa de Elena, verificar que el caso espejo use los sitios seleccionados por Camila y que la segunda variable se muestre donde la suministre David. Para la matriz de lluvia y radiación del plan hace falta una serie real de radiación. El ejemplo incluido utiliza temperatura simulada.
4. Acordar con Rol 6 cómo recopilar los resultados anónimos guardados en cada navegador. Entregar un enlace reproducible, comprobar comprensión en un minuto y corregir los problemas observados. Véase la [guía técnica de integración y pruebas](../rol5-panel-app/INTEGRACION.md).

## Rol 6 · Andrés · Producto, usuarios y entrega

1. Andrés confirmó el rol. Comprobar el registro del equipo en la plataforma. Leer el reto y las guías de evaluación y entrega de 2026, registrar fuentes y confirmar formato, idioma, límites y declaración de IA. Preparar formulario en inglés y guion provisional.
2. Revisar en ES/EN glosario, preguntas por sector y recorrido existentes. Verificar SERVIR y NASA Harvest. Preparar narración por plantillas con validación de cifras y campo `generated_by`. Documentar recursos, licencias y uso de IA. Reclutar cinco adultos y preparar tres tareas y dos preguntas de comprensión.
3. Con los casos y cifras revisados, terminar textos y narración. Con la web pública, medir tiempos y respuestas, guardar resultados anónimos y pasar los tres problemas más graves a Elena e Izel. La meta es que cuatro de cinco completen las tareas y respondan ambas preguntas correctamente. Reportar el resultado observado.
4. Sobre la versión congelada, producir y ensayar la demo en el formato confirmado. Cerrar README y formulario, verificar enlaces desde incógnito, enviar y guardar la confirmación.

[Avance y materiales de Andrés](rol6/README.md).

**Contingencia si el equipo vuelve a cinco integrantes**, Joshua redacta el formulario, Camila audita los textos, David lleva fuentes y registro de IA, y Elena e Izel se reparten interfaz, pruebas y demo. Se propone que Izel coordine participantes y Elena realice el envío. Confirmar desde el inicio quién tiene acceso a la plataforma.

El [cronograma de relevos](05-cronograma-y-relevos.md) indica qué insumo habilita cada tarea y qué puede continuar en paralelo.
