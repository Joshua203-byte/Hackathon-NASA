# Revisión científica: lo que Camila tiene que decidir (corte domingo 15 de noviembre, 02:45)

Todas las cifras salen del JSON final (motor `802a9b0`, 2 025 celdas, 2001–2024) y de `data/rol3/`. Las fichas completas de los candidatos están en [casos-candidatos.md](casos-candidatos.md).

## Resolución (domingo 15, 04:15): Camila, con Claude

**Ninguna decisión cambia veredictos ni cifras. No hace falta regenerar el JSON por esta revisión.**

| # | Decisión | Qué se hizo |
|---|---|---|
| 1 | **Opción A.** La regla de 2013–2015 se queda como está y el cambio de 2012 se declara como salvedad de la franja | Nada que regenerar. Sin entrada nueva en `threshold_changes` |
| 2 | `survives` sigue exigiendo **las dos** variantes. La razón se **reescribe**, no se oculta | `pipeline/altaris/reasons.py` y los dos `reasons.json` del panel |
| 3 | Se aprueba la frase de ENSO propuesta, con una precisión (abajo) | Texto para el caso, el formulario y el panel |
| 4 | Casos: **1** `N1335W08715`, **2** `N1475W08765`, **3** `N1495W09125` frente a `N1335W08715` | IDs pasados a David y a Joshua (comandos abajo) |
| 5 | Lectura general aprobada con dos correcciones. Limitaciones de `config.yaml` aprobadas sin cambios | — |

### 1. Por qué A, y no B

Corrí un chequeo nuevo, [`pipeline/check_step_vs_ramp.py`](../pipeline/check_step_vs_ramp.py). Para cada serie `consistente` compara una recta (rampa) con dos medias separadas por el mejor año de corte (escalón), usando BIC con un margen de 2:

| Año de Pettitt | Temporada: escalón / no se distingue / rampa | Anual: escalón / no se distingue / rampa |
|---|---|---|
| 2012 | 1 / 35 / 0 | 0 / 29 / 0 |
| 2009 | 5 / 3 / 0 | 7 / 12 / 3 |
| 2010 y 2016 | — | 3 / 2 / 0 |

- Las celdas con cambio en 2012 **no se distinguen de una rampa**, que es lo que dice el punto 1 de la decisión: 2012 es la mitad del registro. Ese año no es evidencia de un salto.
- Donde el escalón sí gana, el corte cae casi siempre en **2009**, cinco años antes del cambio a GPM. La opción B no tocaría esas celdas y castigaría justo a las que parecen rampa. Ataca el problema equivocado y además cambia umbrales después de ver el mapa.
- C queda descartada: sube veredictos después de ver el mapa.

**Salvedad obligatoria de la franja** (caso 3, formulario y panel): "La caída de la franja de las tierras altas de Guatemala es grande, de −13 % a −31 % por década. En la mayoría de sus celdas la prueba de Pettitt ubica un cambio en 2012 o en 2009, y con 24 años no se distingue un escalón de una tendencia gradual. Es una zona con pocos pluviómetros, y en la celda más fuerte (`N1495W09125`) NASA POWER no ve ninguna caída (+40 mm por década frente a −452; ver [09](09-casos-y-textos-camila.md)). Puede ser una señal real o un artefacto del producto: no se puede separar con este registro."

### 2. Texto de `enso_no_sobrevive`

- Nuevo: "Al descontar ENSO, la pendiente cambia de signo o sale de su intervalo de confianza" (en inglés: "When ENSO is removed, the slope changes sign or leaves its confidence interval"). Describe lo que mide la prueba y es correcto en cualquier veredicto, incluido `sin_evidencia`.
- No se oculta, porque ocultarla obligaría a cambiar el motor y a regenerar.
- Se mantienen las dos variantes. Es el criterio más conservador y no cambia ningún veredicto.
- De paso, `posible_salto_2014` dice ahora "Posible salto entre 2013 y 2015", que es la ventana real de la regla. En las celdas con bandera el año más frecuente es 2015.

### 3. ENSO

Frase aprobada: "En este registro, los años El Niño son más secos en toda la región; no se distingue un contraste Pacífico–Caribe."
Precisión: la correlación con ONI habla de la variabilidad de un año a otro, no de la tendencia. En la franja de Guatemala la correlación es débil (−0,05 en `N1495W09125`), y su tendencia sobrevive a las dos variantes. No escribir "ENSO explica la tendencia" ni "ENSO causa la caída".

### 4. Casos: ajustes a las salvedades

- **Caso 1, `N1335W08715`:** sin cambios. Además: POWER da el signo contrario (+171 mm por década en temporada), otra razón para no afirmar nada.
- **Caso 2, `N1475W08765`:** para "sube" conviene citar **2001–2010** (+382 mm por década, p 0,02, `limitada`, signo opuesto al del periodo base) en lugar de 2001–2016 (+177, p 0,26, que no es significativa). Hay que decir que es una ventana corta, de 10 años. Así quedan tres lecturas de la misma celda: periodo completo `sin_evidencia`; 2008–2023 baja −345 mm por década, p 0,003, `limitada`; 2001–2010 sube +382, `limitada`. Todas las cifras están comprobadas en `cells/N1475W08765.json`.
- **Caso 3, `N1495W09125`:** sigue siendo `consistente` con A y también lo sería con B (su cambio cae en 2009). El escalón se ajusta un poco mejor que la rampa (diferencia de BIC de 2,7), así que hay que decir "la lluvia es más baja desde alrededor de 2009" y no "cae 30 % por década". Va con la salvedad de la franja.

```bash
# David
python pipeline/04_power.py --cells N1335W08715 N1475W08765 N1495W09125
# Joshua
python pipeline/case_figures.py --data rol5-panel-app/public/data --cells N1335W08715 N1475W08765 N1495W09125
```

### 5. Lectura general

Aprobada, con dos correcciones:
- Las banderas de 2014 se dan **siempre por país**: en canícula, 35 % en Guatemala y 2 % en Honduras. No dar el 17,6 % solo.
- `limitada` no se cuenta como hallazgo en ningún texto: en ruido puro aparece en un tercio de las series.

Las limitaciones de `config.yaml` quedan como están. La salvedad de la franja va en el texto del caso y no en el pasaporte general, porque cambiar `limitations` obligaría a regenerar.

**Pendiente menor para quien regenere:** la narrativa en inglés del JSON escribe las unidades en español ("mm/temporada per decade"). Está corregido en `pipeline/altaris/narrative.py`, pero solo se verá si se regenera el JSON. Si la congelación de las 15:00 regenera, entra solo. Si no, queda así.

---

*Lo que sigue es el paquete original de revisión, sin cambios.*

Orden sugerido: la decisión 1 es la única que puede cambiar el mapa, así que va primero.

## Decisión 1. La bandera de 2014 y el salto de 2012 en Guatemala

**La regla de hoy:** bandera si la prueba de Pettitt ubica el cambio en 2013, 2014 o 2015 con p < 0,05. Una celda con bandera no pasa de `limitada`.

**Lo que hace la regla:**

| Indicador | Guatemala | Honduras | El Salvador |
|---|---|---|---|
| Lluvia de temporada | 111 de 917 (12,1 %) | 1 de 939 | 1 de 169 |
| Canícula | 320 de 917 (34,9 %) | 21 de 939 (2,2 %) | 15 de 169 (8,9 %) |
| Lluvia anual | 104 de 917 (11,3 %) | 0 | 0 |

- La bandera es casi exclusivamente un fenómeno de Guatemala.
- En todas las celdas con bandera el cambio es hacia **menos** lluvia: mediana de −20 % (temporada), −29 % (canícula) y −17 % (anual) entre antes y después del año del cambio.
- Es lo único que impide `consistente` en 29 celdas de Guatemala en lluvia de temporada y en 30 en lluvia anual.

**El problema:** las celdas que sí salieron `consistente` también tienen un cambio significativo, solo que fuera de la ventana de la regla.

| | `consistente` | Pettitt p < 0,05 | Año del cambio |
|---|---|---|---|
| Lluvia de temporada | 44 | 44 de 44 | 2012 en 36, 2009 en 8 |
| Lluvia anual | 56 | 56 de 56 | 2012 en 29, 2009 en 22, 2016 en 3, 2010 en 2 |

Si la ventana de la regla fuera 2012–2015, dejarían de ser `consistente` 36 de las 44 celdas de temporada y 29 de las 56 anuales.

**Tres cosas que hay que tener presentes al decidir:**

1. Pettitt no distingue un escalón de una rampa. En una serie con una tendencia sostenida, la prueba casi siempre encuentra un "cambio" hacia la mitad del registro. Que las 44 celdas `consistente` tengan un punto de cambio significativo no prueba que haya un salto instrumental; es lo que se espera si la tendencia es real.
2. El año que más se repite en la bandera no es 2014 en lluvia de temporada, sino **2015** (105 celdas, contra 6 en 2014). En canícula sí es 2014 (303 celdas). 2015 es año de El Niño fuerte y 2014–2016 fue sequía en la región. La bandera puede estar marcando esa sequía real y no el cambio de TRMM a GPM. Con este registro no se pueden separar.
3. La franja `consistente` (lat 14,85 a 15,35, lon −91,75 a −90,05) baja entre −13 % y −31 % por década, mediana −19 %. Es una caída muy grande. IMERG y POWER discrepan en el signo en 7 de 9 comparaciones, y en tierras altas con pocos pluviómetros el ajuste de IMERG es débil.

**Opciones:**

| Opción | Efecto | Costo |
|---|---|---|
| A. Dejar la regla como está y declarar el salto de 2012 como limitación de la franja | No cambia nada. Sin regenerar | Hay que escribir la salvedad en el caso, el formulario y el panel |
| B. Ampliar la ventana a 2012–2015 | 36 celdas de temporada y 29 anuales pasan a `limitada`. Quedan 8 y 27 `consistente` | Regenerar el JSON (unos 15 minutos) y anotarlo en `threshold_changes`. Es un cambio hecho después de ver el mapa, y hay que decirlo así |
| C. Quitar 2015 de la ventana por ser El Niño fuerte | Unas 105 celdas de temporada pierden la bandera; algunas podrían subir a `consistente` | Igual que B, y además sube veredictos después de ver el mapa: es la opción más difícil de defender |

Recomendación de Joshua y Claude, para que la discutas: **A**. No toca umbrales después de ver resultados, y la salvedad ya está redactada en `docs/07`. B es defendible si prefieres que el mapa sea más conservador.

## Decisión 2. Criterio de `survives` (ENSO)

**La regla de hoy:** la tendencia "sobrevive" si en las **dos** variantes (sin años ENSO fuertes; residuos de lluvia ~ ONI) la pendiente conserva el signo y queda dentro del IC 95 % del periodo base.

**No cambia ningún veredicto, elijas lo que elijas.** De las series que no sobreviven (515 en temporada, 431 en canícula, 336 en anual), 509, 427 y 336 ya eran `sin_evidencia`, y las otras 10 son `limitada`. Ninguna celda deja de ser `consistente` solo por ENSO. Si se exigiera una sola variante, sobrevivirían 448, 386 y 186 más, y los veredictos quedarían iguales.

Lo que sí hay que decidir es el **texto**. Hoy una celda `sin_evidencia` muestra "La tendencia no sobrevive al descontar los años ENSO fuertes", y ahí no había tendencia. Opciones: ocultar esa razón cuando el veredicto es `sin_evidencia`, o reescribirla ("La pendiente cambia al descontar ENSO"). Es un cambio de texto en `pipeline/altaris/reasons.py`, sin regenerar cifras.

## Decisión 3. Qué decir de ENSO

- La correlación de Spearman con ONI es negativa en todas las celdas en lluvia de temporada (de −0,68 a −0,04) y en canícula (de −0,86 a −0,06). En lluvia anual solo 1 de 2 025 es positiva (+0,06).
- Es significativa tras FDR en 1 230 celdas (temporada), 1 425 (canícula) y 576 (anual).
- **No hay efecto espejo.** Más El Niño, menos lluvia en toda la región. No existe un par de sitios con respuesta de signo opuesto.
- Frase propuesta: "En este registro, los años El Niño son más secos en toda la región; no se distingue un contraste Pacífico–Caribe."
- No escribir "ENSO explica la tendencia".

## Decisión 4. Los tres casos

| Caso | Candidato | Lo que muestra | Salvedad obligatoria |
|---|---|---|---|
| 1. Corredor Seco hondureño | `N1335W08715` (Choluteca) | Temporada: −48 mm por década, IC 95 % de −257 a +171, p ajustado 0,88, `sin_evidencia`. Correlación con ONI −0,64 | "No encontrar tendencia también es un hallazgo". No decir que la lluvia baja |
| 2. Sensibilidad al periodo | `N1475W08765` (Honduras, lat 14,75, lon −87,65) | Periodo completo: −48 mm por década, p 0,54, `sin_evidencia`. Empezando en 2008 (2008–2023): −345 mm por década, p 0,003, `limitada`. Con 2001–2016 el signo se vuelve **positivo** (+177, p 0,26) | Las ventanas se solapan y no se corrigen. El cambio viene de empezar en los años húmedos 2010–2011 |
| 3. Contraste entre sitios | `N1495W09125` (Guatemala) frente a `N1335W08715` | Temporada: −452 mm por década sobre 1 478 mm, p ajustado 0,032, `consistente`, frente a `sin_evidencia` | Lo de la decisión 1: cambio en 2012, discrepancia IMERG–POWER. No presentarlo como "cae 30 % por década" |

Alternativas para el Caso 2 con el mismo patrón: `N1425W08755` y `N1455W08755`. En Honduras ninguna ventana larga significativa cambia de signo; eso solo ocurre en 19 celdas de Guatemala y El Salvador (la más clara, `N1565W09095`).

El Caso 2 con `N1475W08765` es el más didáctico de los tres: la misma celda da "sin evidencia", "baja fuerte" o "sube" según los años que se elijan. Es exactamente lo que el proyecto quiere enseñar.

Cuando elijas, pasa los tres IDs a David (`python 04_power.py --cells ID1 ID2 ID3`) y a Joshua.

## Lectura general, para aprobar o corregir

| | Honduras | El Salvador | Guatemala |
|---|---|---|---|
| Celdas con pendiente negativa (temporada) | 924 de 939 | 114 de 169 | 807 de 917 |
| Mediana de la pendiente | −4,5 % por década | −3,6 % por década | −7,4 % por década |
| `consistente` | 0 | 0 | 44 |

- Honduras: el signo es casi siempre negativo, pero ninguna celda sostiene la tendencia. Mensaje: con 24 años no se puede afirmar.
- `limitada` aparece en 33 % de las series de ruido puro en la calibración. El 45 % de `limitada` en lluvia de temporada está poco por encima de ese nivel: no es evidencia.
- El 17,6 % de banderas en canícula es en realidad 35 % en Guatemala y 2 % en Honduras. Conviene decirlo por país.

## Qué tiene que salir de esta revisión

1. Opción A, B o C de la decisión 1.
2. El texto de `enso_no_sobrevive`.
3. Los tres IDs.
4. Visto bueno o correcciones a la lectura general y a las limitaciones de `pipeline/config.yaml`.
