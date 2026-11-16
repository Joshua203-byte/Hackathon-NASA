# Plan de interfaz: una sola versión para estudiantes, con el detalle estadístico en un segundo nivel

Rama del plan: `ca/ux-estudiantes` (solo este documento). Redactado por Joshua con Claude el domingo 15 de noviembre, por la tarde.
**Quién lo hace:** otra persona del equipo (propuesta: Camila, o quien ella designe). Joshua no lo implementa.
**Estado:** nada de lo de abajo está hecho, salvo el punto T1.1, que ya existe en la rama `ca/ux-fase1` (ver sección 3). Camila ya corrigió `docs/09` y añadió la verificación con Giovanni (`docs/validacion_giovanni/`); son documentos y no cambian este plan.

## 0. Cómo usar este documento

1. Lee las secciones 1 y 2 completas antes de tocar código: explican qué se decidió y qué **no** se puede hacer.
2. Trabaja en una rama nueva a partir de `main` (por ejemplo `ca/ux-fase1b`, `ca/ux-fase2`), **no** sobre `ca/ux-estudiantes`.
3. Haz las fases en orden. Cada fase es entregable por sí sola: si el tiempo se acaba, lo hecho hasta ahí sirve.
4. Después de cada fase corre las pruebas de la sección 6. **Nada se mezcla a `main` sin que Joshua lo apruebe** y sin que Camila haya aprobado los textos nuevos.
5. Si usas un asistente de código, puedes darle esta instrucción: *«Lee `docs/12-plan-ux-estudiantes.md` y ejecuta la fase 1. No cambies cifras, umbrales ni el pipeline. Corre las pruebas de la sección 6 antes de cada commit.»*

## 1. Qué se decidió y por qué

### Para quién es la herramienta (texto oficial del reto)
La pestaña *Details* del reto «Be An Earth System Trend Detective!», en la sección *Potential considerations → Audience* (es una sugerencia, no una regla: empieza con «You may (but are not required to) consider the following»):

> «This challenge involves science data and statistical analysis, so the likely audience is high school and college students, along with members of the public who have some scientific background. Providing simple definitions of the variables would help these users considerably. The concept is to help the users become data detectives – finding variables of interest, then determining whether those variables show a trend and whether that trend is significant.»

Y en *Objectives*, el último elemento pide probar la significancia «using methods such as a t-test, the Mann-Kendall test, or confidence intervals». En *Working with the data*: «Finding a trend is interesting even if it doesn't reach the level of significance».

### Decisión de producto
- **Una sola versión**, pensada para estudiantes. **No** hay selector de nivel ni dos modos.
- **Lo técnico no desaparece: pasa a un segundo nivel plegado** («Ver detalle estadístico»). Los jueces tienen que poder ver que el análisis es riguroso, y el reto mismo pide mostrar Mann–Kendall e intervalos de confianza.
- **El contenido es el mismo para todos.** Los números, el veredicto y las conclusiones no cambian; solo cambia el orden (lo llano primero) y que cada término nuevo lleve una definición corta.
- **Las dos preguntas del inicio** («¿Qué lluvia te interesa?» y «¿Dónde?») no sirven para dividir al público: sirven para que el usuario elija **variable y lugar**, que es lo que el reto sugiere («respond to a short series of questions about what or where they would like to investigate»).

### Flujo final
1. Animación de entrada en cada carga, con «Saltar».
2. Guía de primera visita: dos preguntas, tres pasos cortos, «Omitir» siempre visible.
3. Mapa con los 7 países y los tres ejemplos.
4. Panel de la celda: **primero** la gráfica, el veredicto en una frase y qué significa; **después**, plegado, el detalle estadístico; el pasaporte completo queda como hoy.
5. Botón «¿No entiendes algo?» que muestra una ayuda corta por zona (última fase).

## 2. Qué NO hacer (límites que protegen el rigor)

**Alcance**
- No tocar `pipeline/`, umbrales, reglas de veredicto, cifras ni `rol5-panel-app/public/data/` salvo lo indicado en T2.5 (glosario).
- **No editar `public/data/reasons.json`:** lo genera el motor (`pipeline/altaris/reasons.py`, y una prueba exige un texto por cada código). Los textos en llano van en un archivo del panel (ver T2.1).
- No añadir un asistente de IA ni llamadas a servicios externos nuevos. El sitio es estático y los resultados no los calcula ni los inventa ningún modelo. Queda fuera de esta entrega.
- No cambiar el color del mapa para «limitada» ni la frase verde de «consistente» sin la decisión de la sección 8.

**Redacción** (reglas de Camila en `docs/ca/camila.md`, más las que salieron de las pruebas con personas)
1. No presentar las 196 celdas «consistente» como hallazgo climático: son evidencia que pasa las pruebas de este análisis.
2. La salvedad de Guatemala (cambio en 2010–2012 y desacuerdo con NASA POWER) también vale para Costa Rica y Panamá.
3. No citar la significancia de ENSO anual ni decir «negativo en todas las celdas».
4. No escribir «solo en Guatemala» ni «los tres países».
5. **No decir «bajó» o «subió» cuando el veredicto es «limitada» o «sin evidencia».** Se dice «la recta estimada baja…, pero no alcanza para afirmarlo».
6. **No decir que un cambio «es real».** El veredicto más alto es «tendencia consistente», y el caso 3 sigue siendo una pregunta abierta.
7. **No usar la palabra «normal» para el vaivén de la lluvia.** Una persona entendió «según las normas meteorológicas». Usar «vaivén natural» o «variación natural». Y no sugerir nunca que se compara contra una «norma climática»: cada periodo se compara consigo mismo.
8. Todo texto nuevo lleva **español e inglés**.

## 3. Mapa del código

Todo está en `rol5-panel-app/`. React 19 + TypeScript + Vite + Recharts + MapLibre.

| Qué | Dónde |
|---|---|
| Página y tarjeta de inicio | `src/Shell.tsx` (título `h1` y párrafo de la tarjeta `.intro`, hacia las líneas 110–118) |
| Mapa, intro, leyenda, botón «Centrar región» | `src/panel/components/RegionMap.tsx` |
| Cuándo se reproduce la intro | `src/panel/space/introPlan.ts` |
| Panel de la celda | `src/panel/components/CellPanel.tsx` |
| Veredicto y «Por qué este veredicto» | `src/panel/components/VerdictBadge.tsx` (`reasonText`) |
| Gráfica año por año | `src/panel/components/SeriesChart.tsx` |
| Control de años | `src/panel/components/YearSlider.tsx` |
| Frases del veredicto (`answerLine`, `VERDICT_PLAIN`, `NEXT_STEP`), etiquetas de indicadores y países | `src/panel/labels.ts` |
| Casos de estudio | `src/panel/cases.ts` |
| Recorrido de 4 pasos | `src/panel/components/TourOverlay.tsx` + `public/data/tour.json` |
| Glosario | `public/data/glossary.json` (8 términos) + `src/panel/components/Glossary.tsx` |
| Estado en la URL | `src/panel/urlState.ts` |
| Anclas del recorrido y de la ayuda | atributos `data-tour="series|verdict|compare|footprint|passport|years|cards|enso|mirror|cycle|secondary"` |

**Ya hecho (opcional aprovecharlo):** la rama `ca/ux-fase1` tiene un commit con T1.1 (intro en cada carga, sin botón de repetir). Para usarlo: `git cherry-pick <commit de ca/ux-fase1>`. Se verificó con `tsc` y `vitest` (70 pruebas); **no** se corrió el e2e de navegador sobre ese cambio.

## 4. Fases

Los tiempos son estimaciones de Joshua, no medidas.

### Fase 1: cambios confirmados, de bajo riesgo (≈ 45 min)

**T1.1 — La animación se reproduce en cada carga y se quita «Ver desde el espacio».**
Hecho en `ca/ux-fase1`. Queda «Centrar región». Siguen sin intro: enlaces con `cell`, `case`, `mirror`, `layer`, `ind`, `lens`, `win`, `tour`, `dataset`; `prefers-reduced-motion`; pruebas automáticas (`navigator.webdriver`). `?intro=1` la fuerza y `?intro=0` la apaga.

**T1.2 — Tarjeta de inicio (`Shell.tsx`).** El título `h1` se queda («Una línea que baja no siempre es una tendencia» / «A falling line is not always a trend»). El párrafo cambia a:

- ES: «Que llueva menos unos años no significa que la lluvia esté cambiando. ALTARIS compara {N} años de datos de la NASA y te dice cuánta confianza merece cada tendencia. Toca un lugar del mapa y mira si lo que ves se sostiene o puede ser solo el vaivén natural de la lluvia.»
- EN: «Rain falling for a few years does not mean rainfall is changing. ALTARIS compares {N} years of NASA data and tells you how much confidence each trend deserves. Tap a place on the map and see whether what you see holds up or may be just the natural ups and downs of rainfall.»

`{N}` es `yearsN`, calculado de los datos (hoy 24). **Debajo se añade una línea con los países, calculada de los datos** con `regionNames(boot.grid, lang)`: ES «Lugares analizados: {países}.» / EN «Places analysed: {countries}.». Es obligatorio: la prueba `e2e/ca-mock.mjs` («la intro nombra los 7 países») lee ese texto, y con datos de 3 países debe decir 3.

**T1.3 — Gráfica año por año (`SeriesChart.tsx`).** Hoy la línea de los datos y la banda son azules (`#2a78d6`) y una persona leyó «azul = positivo». Cambios:
- Línea y puntos de la lluvia de cada año: color **neutro** (`#44586a`).
- Recta de tendencia (`sen`) y banda: color según el **signo de la pendiente del periodo completo** (`data.statistics?.slope_per_decade`): negativa `#8c510a` (café), positiva `#01665e` (verde azulado), nula o ausente `#555`. Son los mismos colores del mapa de pendiente (`SLOPE_RAMP`).
- La recta de la ventana elegida (`winSen`, `#111`) no cambia.
- Debajo de la gráfica, una **leyenda de tres elementos** con su muestra de color: «● lluvia de cada año», «— tendencia estimada», «▒ margen de error de la tendencia» (EN: «● rainfall each year», «— estimated trend», «▒ margin of error of the trend»).
- Nombres en el tooltip: «Tendencia estimada (periodo completo)» y «Tendencia estimada (años elegidos)» en lugar de «Recta de Sen…» (EN: «Estimated trend (full period)» / «Estimated trend (chosen years)»).
- Texto bajo la gráfica (`figcaption`), reemplazando el actual «La banda es el IC 95 % de la pendiente…»:
  - ES: «Cada punto es la lluvia de un año. La banda sombreada muestra hasta dónde podría llegar la recta con estos datos: si es ancha o cruza la horizontal, la tendencia es incierta. Los años sin dato quedan en blanco.»
  - EN: «Each dot is the rainfall of one year. The shaded band shows how far the line could go with these data: if it is wide or crosses the horizontal, the trend is uncertain. Years without data are left blank.»
  - Se mantiene el caso sin intervalo («Sin intervalo de confianza proporcionado por el pipeline…»).
- Verificar contraste de colores (WCAG AA) sobre fondo blanco. Camila debe ver la gráfica terminada: aparece en el video.

**T1.4 — Control de años (`YearSlider.tsx`).**
- Etiqueta «Cambia los años» → «Elige los años» (EN «Choose the years»).
- Botón «▶ Ver cómo cambia» → «▶ Recorrer los años» (EN «▶ Step through the years»).
- Bajo el rango, una línea nueva: ES «Cada periodo se compara consigo mismo, no con una norma climática.» / EN «Each period is compared with itself, not with a climate norm.»

**T1.5 — `labels.ts`, líneas 78–79 (`NEXT_STEP`).** ES «Elige otros años en el gráfico de abajo. Si la historia cambia mucho, tómala con cautela.» / EN «Choose other years in the chart below. If the story changes a lot, treat it with caution.»

**Aceptación de la fase 1:** tsc y vitest en verde; `real-cases`, `pilot` y `ca-mock` pasan (sección 6); capturas en escritorio (1600×900) y celular (390×844) de la tarjeta de inicio y de la gráfica, enviadas a Camila.

### Fase 2: una sola versión, con el detalle técnico plegado (≈ 60–75 min)

**T2.1 — Razones en llano.** Crear `src/panel/plain.ts` con `PLAIN_REASON: Record<string, { es: string; en: string }>` y `reasonPlain(code, lang)`. **Una prueba debe fallar si un código de `public/data/reasons.json` no tiene versión llana.** Textos propuestos (Camila los revisa uno por uno; los códigos son los 15 de `reasons.json`):

| Código | ES | EN |
|---|---|---|
| `criterios_cumplidos` | Pasa todas las pruebas de este análisis: la señal es estadísticamente significativa, el margen de error no incluye el cero y se mantiene al cambiar los años. | It passes every test in this analysis: the signal is statistically significant, the margin of error excludes zero and it holds when the years change. |
| `pocos_anios` | Faltan años con datos: no hay base para evaluar una tendencia. | Too many years are missing: there is not enough to assess a trend. |
| `fdr_no_significativo` | Al mirar miles de lugares a la vez, una señal así puede salir por azar. Tras ese ajuste (FDR), deja de ser significativa. | When thousands of places are checked at once, a signal like this can appear by chance. After that adjustment (FDR), it is no longer significant. |
| `ic_incluye_cero` | El margen de error incluye el cero: con estos datos la lluvia podría estar bajando, subiendo o sin cambio. | The margin of error includes zero: with these data rainfall could be falling, rising or not changing. |
| `huella_inestable` | La lectura cambia al mover los años: con otro periodo la tendencia cambia de dirección o deja de ser clara. | The reading changes when the years move: with another period the trend changes direction or stops being clear. |
| `enso_no_sobrevive` | Al descontar El Niño y La Niña, la tendencia cambia de dirección o sale de su margen de error: parte de lo que se ve podría deberse a ellos. | When El Niño and La Niña are removed, the trend changes direction or leaves its margin of error: part of what you see could be due to them. |
| `posible_salto_2014` | Hay un posible salto entre 2013 y 2015, cuando cambió el satélite que mide la lluvia: no se puede descartar que sea un efecto del instrumento. | There is a possible jump between 2013 and 2015, when the satellite measuring rainfall changed: an instrument effect cannot be ruled out. |
| `p_no_significativo` | La prueba estadística (Mann–Kendall) no distingue esta tendencia del vaivén natural de la lluvia. | The statistical test (Mann–Kendall) cannot tell this trend apart from the natural ups and downs of rainfall. |
| `fdr_pendiente` | Falta el ajuste por mirar muchos lugares a la vez: el resultado puede cambiar al procesar toda la región. | The adjustment for checking many places at once is missing: the result may change when the whole region is processed. |
| `enso_pendiente` | Falta comprobar el efecto de El Niño y La Niña: el resultado puede cambiar. | The El Niño / La Niña check is missing: the result may change. |
| `chequeo_2014_pendiente` | Falta comprobar el posible salto de 2014: el resultado puede cambiar. | The check for a possible 2014 jump is missing: the result may change. |
| `ventana_pocos_anios` | Estos años no bastan: hay muy pocos años con datos en este periodo. | These years are not enough: this period has too few years with data. |
| `ventana_sin_correccion` | En este periodo hay señal, pero no pasó los ajustes ni controles: sirve para probar qué tan sensible es el resultado, no para confirmarlo. | In this period there is a signal, but it did not go through the adjustments or checks: it tests how sensitive the result is, it does not confirm it. |
| `ventana_signo_opuesto` | En este periodo la tendencia va en sentido contrario a la del periodo completo. | In this period the trend goes the opposite way to the full period. |
| `ventana_p_no_significativo` | En este periodo no se distingue una tendencia del vaivén natural de la lluvia. | In this period a trend cannot be told apart from the natural ups and downs of rainfall. |

**T2.2 — «Por qué este veredicto» (`VerdictBadge.tsx`).** Hoy lista `verdict_reasons` con `reasonText` (técnico). Cambiar a: la lista usa `reasonPlain`; dentro del mismo bloque, un `<details>` anidado **«Ver detalle estadístico»** (EN «Show statistical detail») que lista las razones técnicas actuales (`reasonText`, sin cambios) y los campos de `data.statistics`: `method`, `mk_variant`, `slope_per_decade` (pendiente de Theil–Sen), `ci_95` (IC 95 %), `p_value` (Mann–Kendall), `adjusted_p_fdr`, `lag1_autocorr`. Con una línea de definición al lado de cada término (ver T2.5).

**T2.3 — Preferencia «Mostrar siempre el detalle estadístico».** Un interruptor pequeño en el encabezado del panel. Guarda en `localStorage` (`altaris-detalle`) **envuelto en `try/catch`**: el almacenamiento puede fallar o estar bloqueado y la página debe verse bien sin él. Por defecto, cerrado. Con la preferencia activa, todos los «Ver detalle estadístico» aparecen abiertos.

**T2.4 — Frase de una línea con la cifra** (opcional, solo si da tiempo): reutilizar `answerLine` de `labels.ts` y añadir la cifra («la recta estimada baja unos 48 mm por década») **solo** si el veredicto lo permite (regla 5 de la sección 2). Ejemplo correcto para evidencia limitada: «La recta estimada baja unos 18 mm por década, pero la señal es frágil porque cambia si movemos los años.»

**T2.5 — Definiciones en línea.** Añadir a `public/data/glossary.json` tres términos (mismo formato que los 8 existentes) y mostrar **una línea de definición bajo cada término nuevo** (no ventanas emergentes; en celular no funcionan bien):
- `tendencia`: «Hacia dónde va un valor con los años: si en general sube o baja, más allá de los altibajos de cada año.» / «Where a value is heading over the years: generally rising or falling, beyond the ups and downs of each year.»
- `significativo`: «Que es poco probable que se deba solo al azar. No quiere decir grande ni importante.» / «Unlikely to be due to chance alone. It does not mean large or important.»
- `decada`: «Diez años. «−48 mm por década» es el cambio que estima la recta cada diez años.» / «Ten years. “−48 mm per decade” is the change the line estimates every ten years.»

Términos existentes que ya hay que mostrar con su definición cuando aparezcan: `pendiente_sen`, `intervalo_confianza`, `valor_p`, `fdr`, `huella_estabilidad`, `completitud`, `mm_temporada`, `enso_oni`.

**Aceptación de la fase 2:** ninguna razón técnica se perdió (sigue visible dentro de «Ver detalle estadístico»); el veredicto y todas las cifras son idénticos a antes; la preferencia sobrevive a recargar; la prueba que cruza `reasons.json` con `PLAIN_REASON` pasa; las tres pruebas de navegador siguen pasando.

### Fase 3: guía de primera visita y pasos de los casos (≈ 60–90 min)

**T3.1 — Componente `Welcome.tsx`**, que Shell muestra cuando termina la intro (o directamente si no hay intro). Solo en la primera visita (`localStorage` `altaris-guia-vista`, con `try/catch`), con las mismas excepciones que la intro (enlaces profundos, movimiento reducido, pruebas automáticas). `?guide=1` la fuerza y `?guide=0` la apaga. **«Omitir» siempre visible.** Foco accesible y cierre con Esc.

**T3.2 — Pregunta 1: «¿Qué lluvia te interesa?»** (EN «Which rainfall interests you?»). Tres opciones que fijan `ind`; **reutilizar los textos de `IND_OPTION` y `IND_LABEL` de `labels.ts`**, no inventar definiciones nuevas:
- Lluvia de temporada (mayo a octubre) → `may_oct_mm`
- Canícula (julio y agosto) → `jul_aug_mm`
- Todo el año → `annual_mm`

**T3.3 — Pregunta 2: «¿Dónde?»** (EN «Where?»). Los países salen de los datos (`countryName` y las celdas de `boot.grid`); no escribirlos a mano. Más una opción «Muéstrame un ejemplo» (EN «Show me an example») que abre el primer caso. Al elegir un país, el mapa encuadra ese país: añadir una propiedad `focusBounds` a `RegionMap` (límites de las celdas del país) y usar `fitBounds` con `finalPadding()` (ya existe en `RegionMap.tsx`). **No cambian los textos ni las conclusiones: solo el indicador y el lugar que se ven.**

**T3.4 — Tres pasos cortos** (máximo 2 frases cada uno, con «n/4» y «Omitir»), sobre estas zonas: la leyenda de colores del mapa (`.map-legend`), «Toca un lugar» (el mapa) y los ejemplos (`.case-links`). Cierre: «¿Vemos un ejemplo guiado?» que lanza el **recorrido de 4 pasos que ya existe** (`startTour` en `Shell.tsx`); no se reescribe. Textos a redactar por Camila; deben respetar la sección 2.

**T3.5 — Tira de 4 pasos en cada caso.** Cuando la celda abierta coincide con un caso (`CASES.find(c => c.cell === url.cell && c.ind === url.ind)`), mostrar arriba del panel: **1 Pregunta** (título del caso) → **2 Variable** (`IND_LABEL`) → **3 Lugar** (país y código de celda) → **4 Veredicto** (etiqueta del veredicto). Todo sale de los datos; no se escribe a mano.

**Aceptación de la fase 3:** la guía no aparece en pruebas automáticas ni en enlaces profundos; con `?guide=1` se completa de principio a fin en escritorio y celular; «Omitir» cierra en cualquier paso.

### Fase 4: botón «¿No entiendes algo?» (≈ 45–60 min)

Un botón en la barra superior. Al activarlo aparece un «?» pequeño en la esquina de cada zona y, al tocarlo, una explicación **de máximo 3 frases** con enlace «Más en el glosario». **Una sola explicación abierta a la vez.** Zonas, usando las anclas `data-tour` que ya existen:

| Zona | Pregunta que responde | Idea del texto (ES; falta EN) |
|---|---|---|
| Mapa y leyenda | ¿Qué es cada cuadro y qué significan los colores? | Cada cuadro es un lugar de unos 11 × 11 km. El color dice cuánta confianza merece la tendencia de lluvia de ese lugar, no cuánto llueve. |
| `verdict` | ¿Qué quiere decir este veredicto? | Es la respuesta del análisis a «¿se puede afirmar que la lluvia está cambiando?». «Sin evidencia» no significa que no cambie nada: significa que estos datos no alcanzan para afirmarlo. |
| `series` | ¿Cómo leo esta gráfica? | Cada punto es un año. La recta resume hacia dónde va la lluvia y la banda muestra cuánta incertidumbre tiene esa recta. |
| `years` | ¿Para qué sirve elegir los años? | Prueba si la historia se sostiene: si al acortar o alargar el periodo la tendencia cambia mucho, hay que tomarla con cautela. |
| `footprint` | ¿Qué es este triángulo? | Cada casilla es un periodo distinto. Muestra de un vistazo en cuáles hay tendencia y en cuáles no. |
| `compare` | ¿Qué comparo aquí? | El periodo completo frente al periodo que elegiste. |
| `enso` | ¿Qué es ENSO? | El Niño y La Niña son cambios del océano Pacífico que alteran la lluvia de un año a otro. Aquí se ve si la lluvia de este lugar sigue ese patrón. |
| `passport` | ¿Qué es el pasaporte de evidencia? | Un resumen descargable con los datos, el método y las limitaciones, para que cualquiera pueda comprobar el resultado. |

Accesibilidad: cada «?» es un `<button>` con `aria-label`, alcanzable con teclado, y la explicación se cierra con Esc. Respetar `prefers-reduced-motion`.

## 5. Qué no se mueve (para que nada se rompa sin querer)

- Los datos, el veredicto, las razones técnicas y el pasaporte no cambian: solo se reordenan y se acompañan de texto llano.
- Las claves de URL (`cell`, `ind`, `win`, `lens`, `layer`, `case`, `mirror`, `tour`, `lang`) y los enlaces `?case=1/2/3` siguen funcionando: están en el formulario y en el video.
- El recorrido de 4 pasos (`.tour`, «1/4» … «4/4») debe seguir igual: las pruebas lo comprueban.
- La prueba «la intro nombra los 7 países» exige que la tarjeta `.intro` contenga los nombres de los países de los datos cargados.

## 6. Pruebas y comandos

Desde `rol5-panel-app/`:

```bash
npx tsc --noEmit
npx vitest run
npm run build
```

Pruebas de navegador (necesitan haber corrido `npm run build` antes):

```bash
node e2e/real-cases.mjs          # 10 PASS
node e2e/pilot.mjs               # 3 PASS
CA_MOCK_DIR=$PWD/public node e2e/ca-mock.mjs   # 16 PASS con los datos reales de 7 países
```

En Windows (PowerShell): `$env:CA_MOCK_DIR="$PWD/public"; node e2e/ca-mock.mjs`. Si Chrome no está en la ruta por defecto, definir `CHROME_PATH`.

- **Estado de referencia en `main`:** 71 pruebas de panel, 10 + 3 + 16 de navegador.
- **`e2e/accept.mjs` falla también en `main`** (quedó desfasada con el rediseño anterior). Se ignora; no es una regresión.
- **Pruebas nuevas esperadas:** cada código de `reasons.json` tiene versión llana en ES y EN (T2.1); la preferencia de detalle se guarda y se lee, y funciona sin `localStorage`; la guía y la intro respetan las mismas excepciones; cada zona de la ayuda (T4) tiene su texto en ES y EN.

## 7. Proceso y tiempos

- **Commits:** uno por concepto, en español, explicando el porqué, y diciendo con honestidad qué se verificó y qué no (convención del equipo).
- **Quién aprueba qué:** Camila aprueba los textos (≈ 20 frases en la fase 2, ≈ 15 en la 3, ≈ 25 en la 4). Joshua aprueba la mezcla a `main`.
- **Después de cada mezcla:** Izel debe volver a publicar (`npm run deploy` desde `rol5-panel-app/`) y Andrés debe grabar el video **después de la última mezcla**. Joshua mueve la etiqueta `congelada-1500` al commit definitivo.
- **Hora límite propuesta para mezclar: 20:00 (El Salvador)**, para dejar una hora al video y al formulario. Es una propuesta de Joshua que aún no se ha confirmado con el equipo. El envío está previsto a las 21:00 y la entrega vence a las 23:59.
- **Realista antes del envío:** la fase 1 y quizá la 2. Las fases 3 y 4 pueden quedar en rama, listas para después de la entrega.

## 8. Decisiones abiertas (no las tome quien implementa)

1. **Color de «limitada» en el mapa.** Hoy es naranja, un color de alerta. «Limitada» son 2 101 de 4 332 celdas (48 %), y la calibración (`meta.json`) da un 33,1 % de falsos positivos para «limitada» en ruido puro (0 % para «consistente»). El mapa comunica más de lo que el método respalda. Opciones: gris azulado neutro, o tramado. Cambiarlo **no altera ningún resultado**. Pendiente de Joshua y Camila.
2. **Frase verde de «consistente»** (`labels.ts`, hacia la línea 63): «La evidencia respalda que la lluvia está bajando, con las limitaciones que se indican abajo.» choca con la tarjeta del caso 3 («pregunta abierta, no un hallazgo climático»). Propuesta: «Pasa todas las pruebas de este análisis: la lluvia parece estar bajando, pero lee las limitaciones abajo.» Decide Camila.
3. **Etiqueta «Sin evidencia de tendencia».** El reto dice que una tendencia sin significancia sigue siendo interesante. Quizá «Aún no se puede confirmar una tendencia». Toca etiquetas que usan las pruebas de navegador: revisar antes.
4. ~~`docs/09-casos-y-textos-camila.md` con la frase «el único tipo de lugar…»~~ **Ya corregido por Camila** (rama `ca/camila-ciencia`, p ajustado 0,024 y las 196 celdas). No tocar.

## 9. Lista de aceptación final

- [ ] Los números de cualquier celda son idénticos a los de `main`.
- [ ] Todo texto nuevo está en español e inglés.
- [ ] Ningún texto nuevo viola la sección 2 (en particular las reglas 5, 6 y 7).
- [ ] La intro se reproduce en cada carga normal y no aparece con `?case`, `?cell`, movimiento reducido ni en pruebas automáticas.
- [ ] Se ve bien a 1600×900 y a 390×844, sin desbordamiento horizontal.
- [ ] `tsc`, `vitest` y las tres pruebas de navegador pasan, y el resultado de cada una se informa tal cual.
- [ ] Camila aprobó los textos y Joshua aprobó la mezcla.
