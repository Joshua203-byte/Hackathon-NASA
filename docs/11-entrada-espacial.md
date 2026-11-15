# Entrada espacial: el planeta, el cielo real y el vuelo a Centroamérica

Rama `ca/intro-globo`. Responsable: Joshua (con Claude). Idea original: Joshua.

Al abrir la página se ve la Tierra en el espacio, con las estrellas, los planetas y la Luna en su sitio real. La cámara vuela hasta Centroamérica, las celdas se encienden sobre la imagen satelital y aparece la interfaz de siempre. Después el globo se puede mover y acercar.

## Qué es real y qué no

| Elemento | De dónde sale | Real o aproximado |
|---|---|---|
| Estrellas (5 044, hasta magnitud 6) | Catálogo Hipparcos/Yale vía `d3-celestial` (BSD-3), coordenadas J2000 | Real. Cada estrella en su ascensión recta y declinación |
| Constelaciones (150 trazos) | `d3-celestial` | Real, dibujadas muy tenues |
| Planetas (Mercurio a Saturno), Luna y Sol | `astronomy-engine` (MIT), efemérides para la fecha y hora de quien abre la página | Real. Urano y Neptuno no se dibujan: no se ven a simple vista |
| Orientación del cielo respecto de la Tierra | `Rotation_EQJ_HOR` de `astronomy-engine` con la latitud y longitud que mira la cámara | Real: el cielo gira con la Tierra y con el movimiento de la cámara |
| Día y noche | Posición del Sol con `astronomy-engine`; por cada píxel se calcula si es de día, crepúsculo o noche. En el lado nocturno, las luces de ciudades (NASA Black Marble) | Real para el instante en que se abre la página. Solo con el globo lejos (se apaga entre zoom 3,2 y 4,6) |
| La Tierra con sus nubes | NASA GIBS, VIIRS de NOAA-20, color verdadero, del **último día completo** (30 h atrás en UTC: la de hoy está a medias y se ve en negro) | Real, de ayer o anteayer; **no** es en vivo. Solo con el globo lejos. La fecha se muestra en la intro y en la atribución |
| Imagen de cerca | Blue Marble de NASA GIBS (niveles 5 a 8), sobre el Blue Marble propio (niveles 0 a 4) | Compuesto sin nubes, a propósito: de cerca las nubes taparían la región y ensuciarían la lectura de las celdas |
| Atmósfera | `sky` de MapLibre | Efecto visual |

**De cerca siempre es de día y sin nubes.** Si se mantuviera la noche real, quien abriera la página de noche en Centroamérica vería la región a oscuras; y con nubes no se leerían las celdas. Por eso las dos capas reales se funden al acercarse.

**No se muestra la lluvia de hoy.** GIBS publica IMERG casi en tiempo real y se comprobó que responde, pero se dejó fuera: sería el tiempo de hoy junto a un veredicto sobre 24 años, y se prestaría a leer que una cosa explica la otra.

**Si GIBS no responde** (sin red, bloqueado o caído), queda el Blue Marble propio con el día y la noche, que no dependen de nada externo. Las nubes son todo o nada: si falla una sola de las 64 teselas no se muestran, porque un planeta con huecos se ve peor.

## Cómo está hecho

- **Mapa:** MapLibre 5 con `projection: globe`. Es el mismo mapa de antes, con las mismas celdas, capas y casos. Cambió el fondo (teselas de la Tierra en lugar de un color liso) y se quitaron el relleno beige de los países y el límite de `maxBounds`.
- **Teselas de la Tierra:** `public/earth/{z}/{x}/{y}.jpg`, niveles 0 a 4 (4096 px de ancho, la resolución de la fuente), 341 archivos y 3,3 MB en total. Solo se descargan las teselas visibles. Se generan con `scripts/build_space_assets.py`.
- **Cielo:** `src/panel/space/sky.ts` (geometría, con pruebas), `SpaceSky.tsx` (lienzo detrás del mapa, transparente fuera del globo) y `public/sky/stars.json` (148 KB).
- **Cámara:** `RegionMap.tsx`. La intro mantiene el planeta entero una pausa corta y vuela unos 8 segundos al encuadre de la región. `cameraForBounds` ya compensa los márgenes: si se le suman otra vez el resultado queda corrido (error que tuve y corregí).
- **Capas reales** (`src/panel/space/sun.ts`, `liveEarth.ts`): cada una es un solo lienzo del planeta entero (64 teselas del nivel 3, 2048 px) que entra con un fundido. Con teselas sueltas las nubes aparecían por cuadros a mitad del vuelo. La intro espera a las nubes como máximo 2,5 s. `?live=0` las apaga y `?live=1` las fuerza; las pruebas automáticas no piden nada a GIBS.
- **Dónde arranca la cámara:** a 62° del punto donde el Sol está en el cenit, para que se vea el planeta iluminado con el filo de la noche; se evita el Pacífico central.
- **Cuándo se reproduce** (`src/panel/space/introPlan.ts`): una vez por sesión del navegador, y no si hay movimiento reducido, un enlace a algo concreto (`cell`, `case`, `layer`, `ind`, `lens`, `win`, `tour`, `mirror`, `dataset`) o una prueba automática. `?intro=1` la fuerza y `?intro=0` la apaga.
- **Controles:** «Saltar» (o un clic en cualquier parte) durante la intro. Después, «Ver desde el espacio» la repite y «Centrar región» vuelve al encuadre.
- **Accesibilidad:** con `prefers-reduced-motion` no hay vuelo, solo el globo ya encuadrado.

## Cómo regenerar los recursos

```bash
cd rol5-panel-app
python scripts/build_space_assets.py --texture earth-blue-marble.jpg --stars stars.6.json --lines constellations.lines.json --night earth-night.jpg
```

Las tres entradas salen de los paquetes npm `three-globe` (`example/img/earth-blue-marble.jpg`) y `d3-celestial` (`data/stars.6.json`, `data/constellations.lines.json`).

## Qué se comprobó y qué no

- Pruebas: 71 de panel en verde (24 nuevas: geometría del cielo, posición del Sol, día y noche, fecha y URL de GIBS, arranque de la cámara, cuándo se reproduce la intro y precarga de teselas). El Sol a las 20:00 UTC del 15 de noviembre cae en −18,6° de latitud y unos −124° de longitud, como da la cuenta a mano. Con el Sol a mediados de noviembre en ascensión recta de unas 15 h y declinación cerca de −18°, como debe ser.
- Navegador (Chromium con renderizado por software): sin errores de consola en la intro, el salto, la repetición y el centrado; capturas en escritorio (1600×900) y celular (390×844). `real-cases` (10 PASS), `pilot` (3 PASS) y `ca-mock` con los datos reales de 7 países (16 PASS: clic en el globo en cada país, 3 casos y celular) pasan.
- **No se probó:** una GPU real ni un celular real. El globo con 4 332 celdas y 5 000 estrellas puede ir más lento en equipos modestos. Si pasa, el salto está siempre disponible.
- GIBS se probó de verdad (se abrió el dominio en el entorno): 64 de 64 teselas de VIIRS del 14 de noviembre y el Blue Marble de cerca, sin errores, en escritorio y celular.
- **Depende de un servicio externo:** si NASA cambia el nombre de la capa o deja de publicar NOAA-20, las nubes dejan de verse y queda el Blue Marble (la capa de Suomi NPP ya devolvía 404 para esta fecha).
- `e2e/accept.mjs` falla igual en `main` sin estos cambios (la prueba quedó desfasada con el rediseño de la interfaz). No es una regresión de esta rama.

## Precarga

Durante la pausa inicial se piden las 85 teselas del planeta entero y las del nivel 4 alrededor de la región (`warmTiles.ts`). Sin eso, en una captura a mitad de vuelo aparecía un parche liso de color de océano donde las teselas aún no habían llegado. `public/_headers` les da caché de una semana.

## Créditos

- Blue Marble: NASA Earth Observatory (dominio público).
- Estrellas y constelaciones: Hipparcos / Yale Bright Star, empaquetadas por `d3-celestial` (BSD-3-Clause).
- Posiciones de planetas, Luna y Sol: `astronomy-engine` de Don Cross (MIT).
- Imagen diaria: NASA GIBS / EOSDIS, VIIRS de NOAA-20 (uso libre con atribución).
- Luces nocturnas: NASA Black Marble (dominio público).
- Paquete con las imágenes: `three-globe` (MIT).
- El código del cielo y de la intro se escribió con asistencia de IA (Claude) y lo revisa el equipo.
