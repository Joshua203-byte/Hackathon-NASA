# Casos, textos y revisión científica final (Camila, Rol 3, domingo 15 de noviembre, 05:00)

**Actualizado para 7 países (domingo 15, 15:30).** Las cifras por celda no cambiaron. Cambian solo el número de celdas (2 025 → 4 332), el p ajustado y cuántos lugares son `consistente` (44 → 196 en temporada); el análisis de 7 países está en [docs/ca/camila.md](ca/camila.md).

Cifras del JSON de `rol5-panel-app/public/data/` (motor `802a9b0` en la primera versión, `7e93e46` en la de 7 países) y del contraste NASA POWER guardado en [`data/rol3/casos_power/`](../data/rol3/casos_power/). Las decisiones que justifican estos textos están en [08](08-revision-camila.md#resolución-domingo-15-0415-camila-con-claude).

## 0. Corrección a la resolución de docs/08

En docs/08 escribí que "NASA POWER no reproduce el signo de IMERG" en la franja de Guatemala, pero el contraste anterior de Guatemala era Ciudad de Guatemala (`N1465W09055`, lat 14,65), que queda **fuera** de la franja. Lo comprobé en la celda del caso 3, y la afirmación se sostiene con más fuerza:

| Celda | Indicador | IMERG (mm por década) | POWER (mm por década, p) | Mismo signo | r año a año |
|---|---|---|---|---|---|
| `N1495W09125` | Temporada | −452 | +40 (0,60) | no | 0,18 |
| `N1495W09125` | Canícula | −171 | −9 (0,86) | sí | 0,36 |
| `N1495W09125` | Anual | −469 | +77 (0,60) | no | 0,08 |
| `N1475W08765` | Temporada | −48 | +124 (0,050) | no | 0,73 |
| `N1475W08765` | Anual | +16 | +360 (0,003) | sí | 0,57 |
| `N1335W08715` | Temporada | −48 | +171 (0,14) | no | 0,80 |

En la celda del caso 3, POWER **no ve ninguna caída**, y las dos fuentes apenas coinciden en qué años fueron húmedos o secos (r de 0,08 a 0,36, frente a 0,73–0,80 en Honduras). Esto refuerza la lectura de "pregunta abierta".

POWER se calcula con la resolución gruesa de MERRA-2 (~0,5°) y no es una fuente plenamente independiente (ver `provenance.json`). Este contraste lo corrí yo, en una copia aparte, para revisar el caso. **No sustituye la tarea 5 de David**: sus archivos en `data/rol1/power/` quedan intactos.

## 1. Textos de los tres casos

Español para el panel y la demo, inglés para el formulario. Toda cifra sale del JSON o de `data/rol3/casos_power/`.

### Caso 1. Corredor Seco, Honduras (`N1335W08715`, Choluteca)

**ES.** En Choluteca, la lluvia de temporada (mayo–octubre) de 2001–2024 tiene una pendiente de −48 mm por década, pero el intervalo de confianza va de −257 a +171: incluye el cero. Tras corregir por las 4 332 celdas, el p ajustado es 0,87. Veredicto: **sin evidencia de tendencia**. No encontrar una tendencia también es un hallazgo: con 24 años de datos no se puede afirmar que la lluvia esté bajando aquí. Lo que sí se ve es ENSO: los años El Niño son más secos (correlación con ONI −0,64). NASA POWER da incluso el signo contrario (+171 mm por década, no significativo).

**EN.** In Choluteca, 2001–2024 rainy-season rainfall (May–October) has a slope of −48 mm per decade, but the 95 % confidence interval runs from −257 to +171 and includes zero. After correcting across 4,332 cells, the adjusted p-value is 0.87. Verdict: **no evidence of a trend**. Not finding a trend is a finding too: 24 years of data cannot support the claim that rainfall is falling here. What the record does show is ENSO: El Niño years are drier (correlation with ONI −0.64). NASA POWER even gives the opposite sign (+171 mm per decade, not significant).

**No decir:** "la lluvia baja en el Corredor Seco".

### Caso 2. La misma celda, tres historias (`N1475W08765`, Honduras, lat 14,75, lon −87,65)

**ES.** Una sola celda, tres respuestas según los años que se miren:

- **2001–2024 (periodo completo):** −48 mm por década, p 0,54. **Sin evidencia.**
- **2008–2023:** −345 mm por década, p 0,003. **Señal débil, no confirmada.**
- **2001–2010:** +382 mm por década, p 0,02. **Señal débil, no confirmada**, con signo contrario.

El cambio no viene de la lluvia sino de los años elegidos: 2008 es el año más húmedo de la serie (1 616 mm), y 2010 y 2011 también están entre los más húmedos. Empezar en 2008 los pone al principio, y la pendiente baja; terminar en 2010 los pone al final, y la pendiente sube. Las ventanas se solapan y no se corrigen por comparaciones múltiples, por eso ninguna pasa de "señal débil". Además, NASA POWER sugiere lo contrario en la misma celda: lluvia anual al alza (+360 mm por década, p 0,003).

**EN.** One cell, three answers depending on the years you look at:

- **2001–2024 (full period):** −48 mm per decade, p 0.54. **No evidence.**
- **2008–2023:** −345 mm per decade, p 0.003. **Weak signal, not confirmed.**
- **2001–2010:** +382 mm per decade, p 0.02. **Weak signal, not confirmed**, with the opposite sign.

The change comes from the years chosen, not from the rain: 2008 is the wettest year in the series (1,616 mm), and 2010 and 2011 are also among the wettest. Starting in 2008 puts them at the beginning and the slope falls; ending in 2010 puts them at the end and the slope rises. The windows overlap and are not corrected for multiple comparisons, so none goes beyond "weak signal". NASA POWER even suggests the opposite at this cell: annual rainfall rising (+360 mm per decade, p 0.003).

**Aviso:** 2001–2010 es una ventana corta, de 10 años. Hay que decirlo si se muestra.

### Caso 3. Dos sitios, dos veredictos (`N1495W09125`, Guatemala, frente a `N1335W08715`)

**ES.** En las tierras altas del oeste de Guatemala, la lluvia de temporada media es de 1 478 mm y IMERG da una pendiente de −452 mm por década (IC de −641 a −282, p ajustado 0,024), estable en casi todas las ventanas. El motor dice **tendencia consistente** aquí y en otras zonas de Centroamérica (196 celdas de temporada, en Guatemala, Costa Rica, Panamá y Nicaragua). A unos 480 km, en Choluteca: **sin evidencia**. Mismo producto, mismos años, mismas fases de ENSO.

Pero esto es una pregunta abierta, no un hallazgo climático:

- la caída se concentra alrededor de 2009, y con 24 años no se distingue un escalón de una tendencia gradual;
- es una zona montañosa con pocos pluviómetros para ajustar IMERG;
- NASA POWER no ve ninguna caída en la misma celda (+40 mm por década), y las dos fuentes apenas coinciden año a año (r 0,18).

Puede ser una señal real o un artefacto del producto. Con este registro no se puede separar.

**EN.** In Guatemala's western highlands, mean rainy-season rainfall is 1,478 mm and IMERG gives a slope of −452 mm per decade (CI −641 to −282, adjusted p 0.024), stable across almost every window. The engine returns a **consistent trend** here and in other parts of Central America (196 rainy-season cells, in Guatemala, Costa Rica, Panama and Nicaragua). About 480 km away, in Choluteca: **no evidence**. Same product, same years, same ENSO phases.

But this is an open question, not a climate finding:

- the drop is concentrated around 2009, and 24 years cannot tell a step from a gradual trend;
- it is mountainous terrain with few rain gauges to adjust IMERG;
- NASA POWER sees no decline at the same cell (+40 mm per decade), and the two sources barely agree year to year (r 0.18).

It may be a real signal or a product artefact. This record cannot separate them.

**No decir:** "cae 30 % por década" ni "el cambio climático seca Guatemala".

**Segunda variable** (POWER T2M, para el panel si Izel la integra): en esta celda la temperatura de mayo–octubre sube +0,27 °C por década (IC de 0,09 a 0,48, p 0,004). Se puede mostrar al lado de la lluvia, pero **sin relación causal**: es otra fuente, de otra resolución.

## 2. Limitaciones (texto final)

Las seis de `pipeline/config.yaml` quedan aprobadas tal cual. Cambiarlas obligaría a regenerar el JSON, y son correctas. Para el formulario y la demo se añaden dos frases que **no** van al pasaporte:

- La bandera del salto de 2013–2015 se da **por país**. En lluvia de temporada: 111 de 917 celdas en Guatemala (12,1 %), 1 en Honduras y 1 en El Salvador. En canícula: 320 en Guatemala (34,9 %), 21 en Honduras (2,2 %) y 15 en El Salvador (8,9 %).
- Las zonas `consistente` (Guatemala, Costa Rica, Panamá y Nicaragua) van con la salvedad del caso 3.

## 3. Revisión de la narrativa (tarea 10, con Andrés)

Corrí `10_narrate.py` sobre una copia del JSON final, sin escribir en `public/data`, y lo comparé con la plantilla que ya trae el motor. Revisé una celda por categoría; no hay ninguna `incompleta` en el JSON final.

| Veredicto | Celda | `10_narrate.py` | Plantilla del motor (la actual) |
|---|---|---|---|
| `consistente` | `N1465W09125` anual | "La pendiente estimada es de 500,163 mm por década" | Indicador, periodo, pendiente con signo, IC 95 % y veredicto |
| `limitada` | `N1325W08695` temporada | "-85,995 mm por década" | Igual que arriba |
| `sin_evidencia` | `N1305W08705` temporada | "-10,252 mm por década" | Igual, más "No encontrar una tendencia también es un hallazgo" |

**Decisión: no correr `10_narrate.py` sobre el JSON final.** Se queda la plantilla del motor (`pipeline/altaris/narrative.py`):

- `10_narrate.py` quita el intervalo de confianza, el periodo, el indicador y las unidades;
- escribe tres decimales ("500,163");
- no pone signo a las pendientes positivas;
- pierde la frase de `sin_evidencia`.

Su validador de cifras es buena idea, pero rechazaría el IC. Si Andrés quiere conservarlo, hay que adaptarlo para que admita las cifras de `statistics`. La única corrección pendiente de la plantilla, las unidades en inglés, ya está en `narrative.py` y entra si se regenera.

## 4. Auditoría del formulario (`docs/rol6/submission-en.md`)

Comprobé las cifras contra `verdict_summary.csv` y las celdas:

- Las tablas de resultados (seis filas por país y la de canícula, 956 y 1 069) coinciden.
- Coinciden también: 924 de 939 pendientes negativas en Honduras, la mediana de −4,5 %, la calibración y el signo de ENSO.

Corregí los párrafos marcados `[PENDING: Camila]`:

- **Guatemala:** el cambio se ubica en 2009 o 2012, no "alrededor de 2012", y se añade el contraste POWER de la celda.
- **Tres casos:** IDs definitivos, la ventana 2001–2010 en lugar de 2001–2016, y la salvedad del caso 3.
- **Limitaciones:** las banderas de 2013–2015 se dan por país, no solo como 17,6 %.
- **Método, punto 6:** "change-point test in 2013–2015" en lugar de "around 2014", que es la ventana real de la regla.

No toqué los `[PENDING: URL]` ni los `[PENDING: guide]`, que son de Andrés, Izel y Elena.

**Frases que no deben aparecer** en el formulario, la demo ni el panel: "rainfall is declining in Honduras", "ENSO explains/causes the trend", "Pacific–Caribbean mirror effect", "falls 30 % per decade", cualquier resultado de pruebas con usuarios que no se haya hecho. Ninguna está hoy en el formulario.

## 5. Preguntas probables del jurado

| Pregunta | Respuesta corta |
|---|---|
| ¿Por qué 24 años y no 30 o más? | IMERG empieza a mediados de 2000; 2001 es el primer año completo, y 2025 no estaba completo al empezar. Es una limitación declarada: 24 años no separan tendencia y variabilidad decenal. Por eso el producto existe |
| ¿No es demasiado estricto? Nadie sale `consistente` en Honduras | La calibración dice que `consistente` casi nunca aparece en ruido (0,0 %) y detecta una caída del 20 % por década en el 54 % de los casos. Es estricto a propósito: el objetivo es no afirmar de más |
| ¿Por qué algunas zonas de montaña sí y Honduras no? | Porque allí IMERG muestra una caída muy grande. Pero en las celdas donde contrastamos, POWER no la reproduce, las zonas tienen pocos pluviómetros y el cambio se ubica hacia 2009–2012. Lo presentamos como pregunta abierta |
| ¿Y el cambio de satélites TRMM→GPM? | Hay una prueba de Pettitt con bandera en 2013–2015, y una celda con bandera no pasa de `limitada`. Es sobre todo un fenómeno de Guatemala. 2015 coincide con El Niño fuerte, así que la bandera no separa instrumento y sequía real |
| ¿Cambiaron umbrales después de ver resultados? | Una vez, documentada en `threshold_changes`, y solo hizo los veredictos más conservadores. La revisión de la regla de 2014 se cerró **sin** cambiarla, precisamente para no ajustar después de ver el mapa |
| ¿ENSO explica la tendencia? | No. ENSO explica cuánto llueve de un año a otro (todas las correlaciones significativas son negativas: El Niño, más seco), pero ningún veredicto `consistente` depende de ENSO, y la tendencia de esas zonas sobrevive al quitarlo |
| ¿Hay efecto espejo Pacífico–Caribe? | No en este registro: todas las correlaciones significativas con ONI son negativas. Unas pocas celdas de Costa Rica, Nicaragua y Panamá tienen signo positivo, sin significancia |
| ¿Por qué no usar estaciones? | No tenemos acceso abierto a una red homogénea para los tres países. El panel le pide al usuario contrastar con pluviómetros locales |
| ¿Usaron IA para las cifras? | No. Las cifras y los veredictos son deterministas (Python, reglas en `config.yaml`). La IA se usó para código, pruebas y textos, y está declarada |
| ¿Es reproducible? | La receta de docs/06 §6 regenera el JSON con las mismas cifras. Hay 73 pruebas del motor, 38 del panel y una revisión independiente de 9 celdas con `scipy` |

## 6. Lo que sigue dependiendo de otros

- **David (tarea 5):** su corrida oficial de `04_power.py` con los tres IDs. Mis cifras deberían coincidir; si no coinciden, mandan las suyas y se corrige este documento.
- **Joshua (tarea 6):** `case_figures.py` con los tres IDs.
- **Izel (tarea 9):** en `tour.json`, el paso 3 abre la ventana 2001–2016. Para el caso 2 conviene **2008-2023** o **2001-2010**.
- **Izel o Elena:** en `public/data/cells/` sigue `N0000W00000.json`, una celda rota de los datos simulados. El panel no la enlaza, pero no es dato real. Quitarla si `e2e/accept.mjs` no la necesita: con `N9999W09999` ya se prueba la tarjeta de error.
- **Izel:** volver a publicar para que se vean los `reasons.json` nuevos.
