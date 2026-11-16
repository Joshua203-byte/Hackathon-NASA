# Estado del proyecto (corte domingo 15 de noviembre, 09:05, El Salvador)

Entrega: domingo 15 de noviembre 23:59. Meta interna de envío: 21:00. Congelación: 15:00.
Repositorio oficial: `Joshua203-byte/Hackathon-NASA`. Todo lo descrito aquí está en `main`.

**Ampliación a Centroamérica (7 países), en paralelo y sin tocar `main` hasta un GO a las 12:45:** el reparto por persona, las ramas, el horario y los criterios están en [10-centroamerica.md](10-centroamerica.md).

**GO a Centroamérica (domingo 15, tarde): aprobado por Joshua.** El JSON de `main` pasa a ser el de 7 países: 4 332 celdas reales, 196 `consistente` en lluvia de temporada (antes 44), los 3 casos conservan su veredicto. Las condiciones 1 y 2 del GO se cumplen (`docs/ca/COMPARACION.md`). Las cifras y la tabla de arriba que dicen 2 025 celdas o 3 países describen la versión anterior. Para cifras actuales: `docs/ca/TABLAS.md`.
**Formulario de 7 países al 15 nov, 22:50:** reescrito para el sitio ya publicado (URL final, declaración de IA, inventario de fuentes, verificación con Giovanni); `check_form_ca.py` da 41 OK y 0 por revisar. Siguen abiertos solo: la firma de Camila, el enlace público del video, el párrafo de pruebas con personas y la marca `release audit` (comprobar enlaces en ventana privada).
**Interfaz para estudiantes en `main` (lo implementó Camila siguiendo [12-plan-ux-estudiantes.md](12-plan-ux-estudiantes.md); `main` = `c7fe4e5` al revisarlo a las 20:30):** una sola versión con el detalle estadístico plegado, razones en llano, definiciones, guía de primera visita, tira de 4 pasos en los casos y botón «¿No entiendes algo?». La animación se reproduce en cada carga y ya no hay botón para repetirla. No tocó datos, pipeline ni umbrales (solo `public/data/glossary.json`). Verificado por Joshua sobre ese `main`: `tsc`, 88 pruebas del panel, build, `ca-mock` con los 7 países reales (16 PASS), `real-cases` (10 PASS) y `pilot` (3 PASS); capturas en escritorio y celular. En `pilot.mjs` se cambió `innerText` por `textContent` porque las razones ahora van en un bloque plegado. **Siguen abiertas, sin decidir:** el color de «limitada» en el mapa y la frase verde de «consistente» (ver sección 8 del plan). Falta que Izel publique esta versión y la mire en un celular real, y que Andrés grabe el video después.
**Entrada espacial en `main`:** al abrir se ve la Tierra con su cielo real, el día y la noche de ese instante y las nubes del último día completo (NASA GIBS), y la cámara vuela a Centroamérica. Detalle, límites y cómo apagarla en [11-entrada-espacial.md](11-entrada-espacial.md). No se probó en un celular real: Izel debe mirarla al publicar.
**Falta (no depende del motor):** firma y revisión de las 18:00 de Camila (`docs/ca/camila.md`; en `docs/09` queda una frase suya, «el único tipo de lugar», que ya no es cierta); Izel publica producción (`npm run deploy` desde `rol5-panel-app/`) y la prueba en incógnito y celular; Andrés rellena marcas `[PENDING]` del formulario, decide el README alternativo, video de 30 s, sesiones con personas y envío a las 21:00; Joshua: `git tag congelada-1500` a las 15:00.

**Avance estimado: 80 %.** Datos, motor, revisión científica, casos, panel, mapa, despliegue y cotejo de cifras están hechos. Falta lo que depende de personas y de la entrega: pruebas con usuarios, video, guía oficial, congelación y envío. Es una estimación por bloques, no una medida.

**Revisión de las 07:30 sobre `main`:** pasan las 70 pruebas del motor y las 44 del panel, compila, y las 45 cifras del formulario coinciden con el JSON. El JSON del repositorio tiene las mismas cifras que la corrida verificada de las 02:30. Los 3 casos abren con su segunda variable.

## 1. Hecho

| Bloque | Dónde | Comprobación |
|---|---|---|
| Datos reales de IMERG | `data/rol1/` | 2 025 celdas, 2001–2024, 24 de 24 años válidos. DOI `10.5067/GPM/IMERG/3B-MONTH/07` |
| Contraste con NASA POWER en 3 sitios | `data/rol1/power/`, `docs/rol1-datos.md` | Signo distinto en 7 de 9 comparaciones: va como limitación |
| ENSO y salto 2014 | `data/rol3/`, `pipeline/06_enso.py` | Calculado en las 2 025 celdas. Sin revisar por Camila |
| Motor estadístico | `pipeline/` | 70 pruebas pasan. Umbrales congelados (`frozen: true`). Un cambio anotado en `threshold_changes` |
| Calibración | `pipeline/calibration.json` | 1 000 simulaciones con la configuración congelada |
| JSON final | `rol5-panel-app/public/data/` (en `main` desde el PR #3) | Regenerado desde cero con la receta de la sección 6 sobre el motor de `main` (`pipeline_commit` `a7a5b18`; código del motor igual a `802a9b0`). Mismos veredictos y cifras que el zip v2 y que `docs/07`. Incluye el `enso.json` real de `data/rol3/`. Los ejemplos simulados de las pruebas están en `src/panel/__tests__/fixtures/data/` |
| Revisión independiente | `docs/07`, sección 6 | 9 celdas recalculadas con `scipy`; coinciden |
| Panel de celda | `rol5-panel-app/` | Carga el JSON real y traduce las razones con `reasons.json`. 38 pruebas, compila |
| Mapa MapLibre | `rol5-panel-app/` | 2 025 celdas, bordes, capas de veredicto, pendiente, estabilidad y ENSO. Los 3 casos de Camila como tarjetas y marcadores; enlaces cortos `?case=1`, `?case=2`, `?case=3` |
| Despliegue en Cloudflare | `rol5-panel-app/wrangler.jsonc`, `npm run deploy` | <https://altaris.altaris-panel-rol5.workers.dev> sirve el mismo `public/data/` de `main` (comprobado archivo por archivo, salvo saltos de línea) y el panel carga sin errores. Probado en escritorio y en vista móvil emulada |
| Paquete de revisión para Camila | [08-revision-camila.md](08-revision-camila.md), [casos-candidatos.md](casos-candidatos.md) | Decisiones, evidencia y candidatos a los 3 casos |
| Formulario en inglés | [rol6/submission-en.md](rol6/submission-en.md) | Con cifras reales. Lo que falta va marcado `[PENDING]` |
| Cifras regionales | [07-cifras-y-candidatos.md](07-cifras-y-candidatos.md) | Provisionales hasta la revisión de Camila |

## 2. Falta

En orden de riesgo. Lo de arriba bloquea a lo de abajo.

| # | Qué | Quién | Depende de | Hora meta |
|---|---|---|---|---|
| 1 | ~~Confirmar la URL pública~~ **Hecha.** Sirve el JSON final (2 025 celdas, `data_kind: observed`) y los textos nuevos de Camila; probada en teléfono por David | Izel, Elena | — | — |
| 2 | ~~Revisión científica~~ **Hecha (04:15)**. Ver `docs/08`, sección Resolución | Camila | — | — |
| 3 | Guías 2026: **avanzada, no terminada.** Resumen en [rol6/guias-2026-resumen.md](rol6/guias-2026-resumen.md) (David, desde buscadores). Falta que Andrés compruebe en su navegador los puntos ⚠️, sobre todo IMERG en los recursos del reto. \* Documentación del uso de IA: pendiente, se retoma cuando la app esté probada | Andrés | Nada | 06:00 |
| 4 | Verificar acceso al portal y que los seis ven la pestaña Project | Andrés | Nada | 06:00 |
| 5 | ~~Segunda variable en los 3 casos~~ **Hecha.** `data/rol1/power_casos/`; coincide fila por fila con la corrida de Camila. Ver `docs/rol1-datos.md`, sección 8. **En el panel** desde el 15 a las 06:10: temperatura y radiación de mayo a octubre en las 3 celdas, sin veredicto (`pipeline/add_secondary.py`) | David | — | — |
| 6 | ~~Cifras finales de los casos~~ **Hecha.** [casos-finales.md](casos-finales.md); mismas cifras que `casos-candidatos.md`, solo cambian los textos de razones de Camila | Joshua | — | — |
| 7 | ~~Regenerar el JSON por la regla de 2014~~ **No hace falta** (opción A). Volver a publicar solo por los `reasons.json` nuevos | Izel | — | 09:00 |
| 8 | ~~Textos de los 3 casos y de las limitaciones~~ **Hecho (05:00)** en [09-casos-y-textos-camila.md](09-casos-y-textos-camila.md), y pasado al formulario | Camila | — | — |
| 9 | Recorrido real y pasaportes cotejados: caso 2, paso 3 en 2001–2010 (10 años), CSV/JSON/pantalla y 36 descargas ES/EN. Enlaces de Elena integrados, prueba móvil superada. [Evidencia](09-cotejo-panel-pasaporte.md) | Izel | Iniciar sesión en Cloudflare, publicar y verificar URL | 12:00 |
| 10 | ~~`10_narrate.py` sobre el JSON final~~ **Revisado (05:00):** no se corre, se queda la plantilla del motor (`docs/09` §3). Andrés confirma | Andrés, Camila | — | — |
| 11 | 5 sesiones con personas: **avanzada, no terminada \*.** Guion con los casos reales y respuestas correctas en [rol6/guion-pruebas-casos.md](rol6/guion-pruebas-casos.md) (David). \* Falta que Andrés reclute, haga las sesiones y pase el resultado | Andrés | URL y un caso revisado | 12:00–15:00 |
| 12 | Corregir lo que salga de las pruebas | Izel, Elena | Las sesiones | 15:00 |
| 13 | Congelación: `git tag congelada-1500` y `git push origin congelada-1500`; despliegue final sobre la etiqueta | Joshua, Izel | Todo lo anterior | 15:00 |
| 14 | Video definitivo de 30 s o menos, con datos reales, producto NASA y procedencia visibles | Andrés | Versión congelada | 18:00 |
| 15 | `[PENDING]` del formulario: **avanzada.** Completado lo que ya tenía respuesta (casos, URL, POWER). Quedan: `video`, `testing` y `guide` \* | Andrés, Joshua | Video, pruebas, guía | 18:00 |
| 16 | ~~Revisión: todo número del formulario sale del JSON~~ **Hecha.** 45 de 45 cifras coinciden ([rol6/cotejo-formulario.md](rol6/cotejo-formulario.md)); se corrigió la frase de los años húmedos del caso 2. Repetible con `python pipeline/check_form_numbers.py .` | Todos | — | — |
| 17 | Envío desde la cuenta del equipo; guardar confirmación, URL y hora | Andrés | Todo | 21:00 |

**Pendientes nuevos de la revisión de las 07:30:**

| # | Qué | Quién |
|---|---|---|
| 18 | **Volver a publicar** (`npm run deploy`) y comprobar la URL. Las 6 075 narrativas en inglés decían "mm/temporada"; el motor ya lo traducía, pero el JSON no se había regenerado. Ya está corregido en `public/data/` de `main` (solo cambia el texto en inglés; ninguna cifra) | Izel |
| 19 | ~~Vista en inglés del panel~~ **Hecho y en `main`** (`a7a3ec9`): unidades, veredictos y fuente de POWER traducidos | — |
| 21 | **Rediseño de usabilidad y visual, ya en `main` (`a7a3ec9`).** Mapa a pantalla completa con panel lateral, control de años con resultado en vivo, escala de evidencia rotulada, respuesta directa y "Qué puedes hacer", tipografías empaquetadas. Pasan 44 pruebas, `e2e/real-cases.mjs` y `e2e/pilot.mjs`. **No se corrió `e2e/accept.mjs`.** Hay que **volver a publicar** para que la URL lo muestre (tarea 18) y que las sesiones con personas usen esta versión | Izel |
| 22 | Pendientes de la interfaz: las razones del veredicto siguen con jerga (viven en `pipeline/altaris/reasons.py` y exigen regenerar `reasons.json`); no hay modo oscuro; preguntar primero para qué se necesita el dato; resaltar con un pulso la celda elegida | Joshua, Camila |
| 20 | ~~Borrar `public/data/cells/N0000W00000.json`~~ **Hecho** en `main`; entra en la próxima publicación | — |

**Resuelto (06:25):** el repositorio de GitHub ya es público. Se comprobó sin iniciar sesión y se revisó que no haya credenciales en los archivos ni en el historial.

Pendiente menor de Joshua: copiar este documento al Project de Claude, que sigue en la versión 2 del plan.

## 3. Decisiones de la revisión científica (resueltas el domingo 15 a las 04:15, ver [08](08-revision-camila.md#resolución-domingo-15-0415-camila-con-claude))

| # | Decisión | Resultado |
|---|---|---|
| 1 | Regla de la bandera de 2014 | **A**: se queda igual (2013–2015). El cambio de 2012 va como salvedad de la franja. Sin regenerar |
| 2 | Criterio de `survives` | Se mantienen las dos variantes |
| 3 | Texto de `enso_no_sobrevive` | Reescrito: "Al descontar ENSO, la pendiente cambia de signo o sale de su intervalo de confianza" |
| 4 | Los 3 casos | `N1335W08715`, `N1475W08765`, `N1495W09125` frente a `N1335W08715` |

Resueltas: FDR 0,05; `p_max_sign_rule: null`; techo `limitada` por ventana; periodo 2001–2024; web oficial `rol5-panel-app/`; hosting en Cloudflare; demo en video de 30 s. La rama `david-y-elena` no se mezcla.

## 4. Qué se puede afirmar y qué no

- **Sí:** con 24 años de IMERG no se puede sostener una tendencia de lluvia en Honduras ni en El Salvador. El signo es casi siempre negativo, pero los intervalos incluyen el cero.
- **Con salvedad:** la franja `consistente` de Guatemala. Caída muy grande, cambio hacia 2012 en la mayoría de sus celdas, zona con pocos pluviómetros.
- **No:** "la lluvia baja" en Honduras; un efecto espejo de ENSO; "ENSO explica la señal"; cualquier resultado de pruebas con personas.
- El video de ensayo (`docs/rol6/altaris-prototype.webm`) usa datos simulados y no debe enviarse.

## 5. Riesgos

- **Nadie ha leído las guías 2026 completas.** Solo está confirmada, por una respuesta en el foro oficial, la regla de la demo (30 s o 7 láminas), la declaración de IA y el requisito de una fuente NASA de los recursos del reto.
- **Cada regeneración del JSON exige tres pasos.** Commit de `rol5-panel-app/public/data/`, `npm run deploy` y comprobar la URL. Si se omite uno, el repositorio y la URL quedan distintos.

## 6. Cómo regenerar el JSON

```bash
cd pipeline
python run_pilot.py --cells ../data/rol1/cells.csv --series ../data/rol1/series.csv \
  --monthly ../data/rol1/monthly.csv --enso-results ../data/rol3/enso_results.csv \
  --break2014 ../data/rol3/break2014.csv --enso-json ../data/rol3/enso.json \
  --calibration calibration.json --commit $(git rev-parse --short HEAD) --out <carpeta>/data
```

Después, copiar a `<carpeta>/data/`:

- `data/rol3/enso.json` (el real);
- `tour.json`, `glossary.json` y `decision_rules.json` desde `rol5-panel-app/public/data/`.

Y volver a poner la segunda variable de los 3 casos (si no, se pierde): `python pipeline/add_secondary.py --data <carpeta>/data`.

Para publicar: `<carpeta>/data/` sobre `rol5-panel-app/public/data/`, commit y, desde `rol5-panel-app/`, `npm run deploy` (requiere `npx wrangler login` y la variable `CLOUDFLARE_ACCOUNT_ID`).

El panel no arranca si `meta.json` trae `dataset_doi: "POR CONFIRMAR"`; el DOI sale de `pipeline/config.yaml`.

## 7. Ramas

| Rama | Estado |
|---|---|
| `main` | Todo lo vigente |
| `izel/panel-celda` | Mezclada (mapa, despliegue en Cloudflare y JSON final, PR #3) |
| `andres/piloto-choluteca` | Mezclada (piloto y lectura de `reasons.json`) |
| `claude/sleepy-carson-nhvqxs` | Igual a `main` |
| `Joshua`, `andres/producto-entrega`, `david-Elena2` | Ya contenidas en `main` |
| `david-y-elena` | No se mezcla |
