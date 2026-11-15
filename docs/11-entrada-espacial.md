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
| Imagen de la Tierra | Blue Marble, NASA Earth Observatory (dominio público), 4096×2048 | Es un compuesto de promedios mensuales, **no** una foto de hoy: sin nubes ni día y noche |
| Atmósfera | `sky` de MapLibre | Efecto visual |

**No se modela el día y la noche.** El globo siempre se ve iluminado. Si se pintara la noche real, quien abriera la página de noche en Centroamérica vería la región a oscuras.

## Cómo está hecho

- **Mapa:** MapLibre 5 con `projection: globe`. Es el mismo mapa de antes, con las mismas celdas, capas y casos. Cambió el fondo (teselas de la Tierra en lugar de un color liso) y se quitaron el relleno beige de los países y el límite de `maxBounds`.
- **Teselas de la Tierra:** `public/earth/{z}/{x}/{y}.jpg`, niveles 0 a 4 (4096 px de ancho, la resolución de la fuente), 341 archivos y 3,3 MB en total. Solo se descargan las teselas visibles. Se generan con `scripts/build_space_assets.py`.
- **Cielo:** `src/panel/space/sky.ts` (geometría, con pruebas), `SpaceSky.tsx` (lienzo detrás del mapa, transparente fuera del globo) y `public/sky/stars.json` (148 KB).
- **Cámara:** `RegionMap.tsx`. La intro mantiene el planeta entero una pausa corta y vuela unos 8 segundos al encuadre de la región. `cameraForBounds` ya compensa los márgenes: si se le suman otra vez el resultado queda corrido (error que tuve y corregí).
- **Cuándo se reproduce** (`src/panel/space/introPlan.ts`): una vez por sesión del navegador, y no si hay movimiento reducido, un enlace a algo concreto (`cell`, `case`, `layer`, `ind`, `lens`, `win`, `tour`, `mirror`, `dataset`) o una prueba automática. `?intro=1` la fuerza y `?intro=0` la apaga.
- **Controles:** «Saltar» (o un clic en cualquier parte) durante la intro. Después, «Ver desde el espacio» la repite y «Centrar región» vuelve al encuadre.
- **Accesibilidad:** con `prefers-reduced-motion` no hay vuelo, solo el globo ya encuadrado.

## Cómo regenerar los recursos

```bash
cd rol5-panel-app
python scripts/build_space_assets.py --texture earth-blue-marble.jpg --stars stars.6.json --lines constellations.lines.json
```

Las tres entradas salen de los paquetes npm `three-globe` (`example/img/earth-blue-marble.jpg`) y `d3-celestial` (`data/stars.6.json`, `data/constellations.lines.json`).

## Qué se comprobó y qué no

- Pruebas: 62 de panel en verde (15 nuevas: geometría del cielo, cuándo se reproduce la intro y la precarga de teselas). Con el Sol a mediados de noviembre en ascensión recta de unas 15 h y declinación cerca de −18°, como debe ser.
- Navegador (Chromium con renderizado por software): sin errores de consola en la intro, el salto, la repetición y el centrado; capturas en escritorio (1600×900) y celular (390×844). `real-cases` (10 PASS), `pilot` (3 PASS) y `ca-mock` con los datos reales de 7 países (16 PASS: clic en el globo en cada país, 3 casos y celular) pasan.
- **No se probó:** una GPU real ni un celular real. El globo con 4 332 celdas y 5 000 estrellas puede ir más lento en equipos modestos. Si pasa, el salto está siempre disponible.
- **No se pudo probar:** la imagen en alta resolución de NASA GIBS en vivo (la red de este entorno bloquea el dominio). Con el acercamiento máximo la textura se ve suave; es suficiente como contexto bajo las celdas.
- `e2e/accept.mjs` falla igual en `main` sin estos cambios (la prueba quedó desfasada con el rediseño de la interfaz). No es una regresión de esta rama.

## Precarga

Durante la pausa inicial se piden las 85 teselas del planeta entero y las del nivel 4 alrededor de la región (`warmTiles.ts`). Sin eso, en una captura a mitad de vuelo aparecía un parche liso de color de océano donde las teselas aún no habían llegado. `public/_headers` les da caché de una semana.

## Créditos

- Blue Marble: NASA Earth Observatory (dominio público).
- Estrellas y constelaciones: Hipparcos / Yale Bright Star, empaquetadas por `d3-celestial` (BSD-3-Clause).
- Posiciones de planetas, Luna y Sol: `astronomy-engine` de Don Cross (MIT).
- Paquete con la imagen: `three-globe` (MIT).
- El código del cielo y de la intro se escribió con asistencia de IA (Claude) y lo revisa el equipo.
