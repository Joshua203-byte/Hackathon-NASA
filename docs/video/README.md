# Video de 30 segundos (inglés)

Producido el 15 de noviembre de 2026 por Joshua con asistencia de Claude. **Duración: 28,6 s**, 1920×1080, 30 fps, H.264 + AAC (pista de audio en silencio). El archivo `altaris_demo.mp4` no está en el repositorio (16 MB): se entrega aparte y se sube a una plataforma pública.

## Qué se ve (todo en inglés, todo real)
| Tiempo | Imagen | Rótulo |
|---|---|---|
| 0:00–0:02,5 | Globo desde el espacio | NASA Space Apps Challenge 2026 · Team ALTARIS |
| 0:02,5–0:05 | Vuelo a Centroamérica | The challenge: Be An Earth System Trend Detective! |
| 0:05–0:10 | Se encienden las 4 332 celdas | ALTARIS · How much confidence does a rainfall trend deserve? · NASA GPM IMERG V07 · 4,332 places · 7 countries · 2001–2024 |
| 0:10–0:13 | Caso de Honduras (interfaz real) | Open any place: 24 years of NASA satellite rainfall, one square at a time. |
| 0:13–0:18 | El deslizador pasa de 2001–2024 a 2001–2010; la pendiente cambia de −48,3 a +381,9 mm por década | Change the years. The same place tells a different story. |
| 0:18–0:23 | Tabla con el veredicto «Limited evidence» y sus razones | Read the evidence: A weak signal is not a confirmed change. |
| 0:23–0:25 | Pasaporte de evidencia | Audit it: Every result ships with an evidence passport. |
| 0:25–0:28,6 | Cierre con la dirección, el equipo y los créditos | Turn any rainfall line into a question you can test. Next: more places, more variables, and every student a data detective. |

## Cómo se hizo (declaración de producción)
- Las imágenes son **capturas reales de la aplicación** con los datos observados del JSON de 7 países (`pipeline_commit` 7e93e46), compilada desde `main` (`bb8ee96`). No hay imágenes ni video generados con IA ni fotografías externas; la versión en silencio no tiene audio y la versión con música lleva una banda sonora original generada con código (ver abajo).
- La captura es determinista: un guion en Playwright calcula la cámara del globo, el deslizador y el desplazamiento en cada instante y toma una imagen por cuadro (`capture.cjs`); `encode.py` mezcla las dos escenas y codifica con ffmpeg. Los rótulos son una capa HTML sobre la misma página.
- El globo usa el Blue Marble de la NASA, las nubes de NASA GIBS (VIIRS NOAA-20) y las estrellas del catálogo Hipparcos/Yale. Fuentes: Inter y Space Grotesk.
- **Asistencia de IA:** los guiones de captura y montaje y el código de la aplicación se escribieron con asistencia de IA (Claude); las decisiones de contenido y el guion son del equipo. Declararlo en el formulario («Use of AI»).
- La copia de captura de la aplicación lleva una línea añadida en `RegionMap.tsx` (`window.__map = map`) para poder mover la cámara; esa línea **no** está en el código publicado.

## Versión con música (opcional)
Hay dos archivos: `altaris_demo.mp4` (en silencio) y `altaris_demo_music.mp4` (con fondo musical). El mensaje lo llevan los rótulos en las dos.
- **La música es original y generada con código** (`music.py`, síntesis con numpy; sin muestras, sin música de terceros), compuesta con asistencia de IA (Claude). Sigue el video: pad abierto mientras el globo cruza el espacio, golpe grave suave al aparecer el título, arpegio constante al explorar, un barrido descendente en sincronía con el deslizador de años (13,3–16,8 s), acordes suspendidos sin tercera en «a weak signal is not a confirmed change», y una resolución luminosa en el cierre.
- **Medido:** −18,9 LUFS integrados, pico −4,8 dBFS, sin saturación, 28,6 s. **No se pudo escuchar** durante la producción: hay que oírla antes de usarla, con auriculares y en el celular.
- **Declaración obligatoria si se usa:** el audio generado exige declaración en el texto y en los metadatos. El archivo ya lo trae en sus metadatos. En «Use of AI» del formulario añadir: *«The background music of the demo video is an original score synthesised with code (no samples or third-party music) and composed with AI assistance (Claude); it is AI-generated audio.»* Si se entrega la versión en silencio, no hace falta.

## Requisitos del reto y estado
| Requisito | Estado |
|---|---|
| Máximo 30 segundos | **Cumple**: 28,6 s (`ffprobe`) |
| Presentarse: nombre y equipo | **Cumple** (0:00–0:02,5) |
| El reto que aborda | **Cumple** (0:02,5–0:05) |
| Nombre y lema del proyecto | **Cumple** (0:05–0:10) |
| Cómo funciona, con imágenes y el uso de datos abiertos de NASA | **Cumple**: interfaz real; IMERG V07, GIBS y Blue Marble citados |
| Mirada al futuro | **Cumple**, de forma breve (cierre) |
| Legible y sin necesidad de contexto previo | Rótulos de 46–64 px a 1080p; interfaz ampliada 1,25×. **Falta** que una persona ajena lo vea sin sonido y en celular |
| Sin menores de 18 años ni datos personales | **Cumple**: solo aparecen los nombres de pila del equipo |
| Enlace público sin contraseña ni registro | **Pendiente**: lo hace Andrés al subirlo |
| La dirección del cierre abre la versión publicada | **Pendiente**: comprobar `altaris.altaris-panel-rol5.workers.dev` |

## Regenerar
Requiere la aplicación compilada con la línea de captura, `vite` en el puerto 5300 y Playwright con ffmpeg.
```bash
node capture.cjs            # 858 cuadros en frames/ (≈ 15 min)
python3 encode.py           # altaris_demo.mp4 y altaris_demo.en.srt
```
Los textos están al principio de `capture.cjs` (capa de rótulos) y en la lista `cues` de `encode.py` (subtítulos).
