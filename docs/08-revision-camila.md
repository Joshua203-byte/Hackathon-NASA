# Revisión científica: lo que Camila tiene que decidir (corte domingo 15 de noviembre, 02:45)

Todas las cifras salen del JSON final (motor `802a9b0`, 2 025 celdas, 2001–2024) y de `data/rol3/`. Las fichas completas de los candidatos están en [casos-candidatos.md](casos-candidatos.md). Nada de esto está decidido: son los datos para decidir.

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
