## Lo que quedó completo del Rol 1

1. **Datos reales de IMERG en `data/rol1/`:** las 2 025 celdas, la serie piloto de Choluteca, los bordes para el mapa y la procedencia para el pasaporte. Los valores coinciden con los archivos originales de NASA.
2. **Contraste con NASA POWER en tres sitios** (Choluteca, La Ceiba y Ciudad de Guatemala), con las mismas funciones estadísticas del motor de Joshua.
3. **Segunda variable** (temperatura y radiación) calculada en esos tres sitios.
4. **Replicabilidad comprobada:** cambiando solo el recuadro a El Salvador, todo se regenera en unos 3 minutos, y sus 169 celdas dan los mismos 20 808 valores que en la región completa.
5. **Fuentes y uso de IA para Andrés:** completé lo que pedía en su documento de fuentes y declaré el uso de Claude en la cabecera de cada archivo, como pide el plan.
6. **Pruebas:** pasan las 73.

## Hallazgo que hay que comunicarle al equipo

En el contraste con NASA POWER, **el signo de la tendencia de lluvia no coincide en 7 de 9 comparaciones**:

- En IMERG, ninguna de las nueve tendencias es significativa.
- En POWER, La Ceiba muestra un alza significativa en los tres indicadores, y Choluteca, en la lluvia anual.
- Las dos fuentes sí coinciden en qué años fueron secos o húmedos.

O sea, en al menos un sitio la tendencia depende de la fuente de datos. Camila debe revisarlo y probablemente haya que declararlo como limitación. Está documentado con todas las cifras en la sección 4 de [docs/rol1-datos.md](docs/rol1-datos.md).

## Avisos al pasarlo

- **Joshua:** que congele los umbrales (`frozen: true`) **antes** de correr la región. Su motor tarda unos 12 minutos con las 2 025 celdas.
- **Camila:** cuando elija los tres casos, se corre `python 04_power.py --cells <ID1> <ID2> <ID3>` para tener la segunda variable en sus sitios. Es lo único del Rol 1 que queda pendiente, y depende de ella.
- **Elena:** los bordes para el mapa están en `data/rol1/borders.geojson`.

¿Quieres que abra un *pull request* hacia `main` con una descripción para el equipo?
