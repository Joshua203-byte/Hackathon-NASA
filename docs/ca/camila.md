# Camila · Rol 3 · Ciencia · Centroamérica

**Rama:** `ca/camila-ciencia`  ·  **Hora meta:** 11:30 criterios · 12:30 firma  ·  Plan completo: [docs/10-centroamerica.md](../10-centroamerica.md)

Escrito para: Joshua (GO/NO-GO), Andrés (formulario y README) e Izel (textos del panel). Todo lo de abajo es el contrato C5. Las cifras marcadas **[CON DATOS]** se rellenan cuando llegue el JSON de 7 países.

## Reglas

- Subo **solo a `ca/camila-ciencia`**. No hago `push` a `main` ni a la rama de otra persona.
- Toco **solo mis archivos**: `docs/ca/camila.md`, `docs/09-casos-y-textos-camila.md` y `docs/08-revision-camila.md`. No cambio `config_centroamerica.yaml`: es de Joshua y ningún umbral se toca.
- No subo el JSON grande (~300 MB).
- `docs/09` queda **intacto**: es el respaldo si hay NO-GO. Las variantes de Centroamérica viven en este archivo.

---

## 1. Por qué un veredicto puede cambiar solo por haber más celdas

### Qué cambia y qué no (lo comprobé en `pipeline/altaris/verdict.py`)

| Se calcula **por celda** (no cambia al añadir países) | Depende de **cuántas celdas** se corrigen juntas |
|---|---|
| Pendiente de Sen, intervalo de confianza, p de Mann–Kendall, huella, ENSO, bandera de 2013–2015, ciclo mensual, cada ventana | Solo `p_fdr` (la p ajustada de Benjamini–Hochberg, por indicador) |

El único criterio del veredicto que usa `p_fdr` es el de `consistente`. `limitada` y `sin_evidencia` se deciden con la p sin ajustar, la huella y el tamaño de la pendiente. Consecuencias:

1. **Una celda `sin_evidencia` no puede cambiar.** Es el caso de los casos 1 y 2.
2. **Los únicos cambios posibles son `consistente` ↔ `limitada`**, y solo en celdas cuyo único motivo de fallo (o de acierto) es el FDR.
3. En las celdas de Guatemala, El Salvador y Honduras, **pendiente, intervalo y p tienen que ser idénticos** a los actuales. Si no lo son, es un error y no un efecto del FDR: es la condición 1 del GO.

### Texto para el panel, el formulario y el pasaporte

**ES.** El veredicto *consistente* exige que la señal siga siendo significativa después de corregir por comparaciones múltiples. Esa corrección depende de cuántos lugares se miran a la vez: con más celdas en el análisis, cada una tiene que ser más convincente para pasar, y con más celdas con señal real, las demás lo tienen más fácil. El umbral no cambia (0,05); cambia el número de comparaciones. Por eso, al pasar de 3 a 7 países, una celda puede subir o bajar entre *consistente* y *limitada* sin que sus datos ni sus cifras hayan cambiado.

**EN.** The *consistent* verdict requires the signal to remain significant after correcting for multiple comparisons. That correction depends on how many places are examined together: with more cells in the analysis, each one must be more convincing to pass, and with more cells carrying a real signal, the others pass more easily. The threshold does not change (0.05); the number of comparisons does. So going from 3 to 7 countries, a cell can move between *consistent* and *limited* even though its data and its figures have not changed.

**Frase corta (una línea, para el cambio de versión):** "Más comparaciones, mismo umbral."

### Lo que esto significa para el hallazgo de Guatemala

Calculé con los datos reales actuales cuánto margen tienen las celdas `consistente`:

| Indicador | `consistente` hoy | Rango de `p_fdr` | Si las ~2 300 celdas nuevas **no tuvieran ninguna señal** | Si solo el 5 % de las nuevas tuviera una señal muy fuerte |
|---|---|---|---|---|
| Lluvia de temporada | 44 | 0,032 a 0,045 | **0 de 44** siguen | 44 de 44 siguen |
| Lluvia anual | 56 | hasta 0,046 | 31 de 56 siguen | 56 de 56 siguen |

Es un análisis de sensibilidad con casos extremos, **no una predicción**: depende de cuántas celdas nuevas tengan señal, y eso solo se sabe con los datos. Pero dice dos cosas ya:

- **Ninguna de las 44 celdas tiene margen.** Todas están entre 0,032 y 0,045 frente al umbral de 0,05. Con el doble de celdas y sin señal nueva, todas lo cruzan hacia arriba. Esto **refuerza** la lectura de "pregunta abierta" para la franja: ya era frágil en la versión de 3 países y ahora está medido.
- **El número de celdas `consistente` en 7 países es incierto en ambos sentidos.** Hay 69 celdas de temporada y 72 anuales que hoy son `limitada` solo por el FDR y que podrían subir si las celdas nuevas aportan señal.

**Consecuencia para los textos:** hasta tener el JSON de 7 países, en la versión de Centroamérica **no se escribe** "44 celdas consistentes", "solo en Guatemala" ni "Honduras: ninguna". Todo eso sale de `ca_tables.py` (Joshua).

---

## 2. Qué hago si un caso cambia

Los tres IDs **quedan fijos**: `N1335W08715`, `N1475W08765`, `N1495W09125`. **No se reemplaza un caso después de ver que cambió**; sería elegir después de ver el resultado, que es justo lo que el proyecto no hace.

| Caso | Qué no cambia | Qué puede cambiar | Si cambia |
|---|---|---|---|
| 1. Choluteca `N1335W08715` | Pendiente −48, IC −257 a +171, p 0,785, `sin_evidencia`, ENSO −0,64, POWER +171 | `p_fdr` (hoy 0,88) y el "2 025 celdas" del texto | Se escribe el nuevo `p_fdr` y el número de celdas del JSON. El veredicto **no puede** cambiar |
| 2. `N1475W08765` | Las tres lecturas (completo, 2008–2023, 2001–2010) con sus cifras, POWER | `p_fdr` del periodo completo | Igual. Los veredictos de ventana no usan FDR |
| 3. `N1495W09125` | Pendiente −452, IC −641 a −282, p 0,00012, huella 1,00 / 0,96, ENSO −0,05, POWER +40 | `p_fdr` (hoy 0,032) y, por eso, **el veredicto** | Ver abajo |

**Caso 3, la contingencia acordada de antemano:**

- **Si sigue `consistente`:** el texto de `docs/09` sirve, con el número de celdas y el `p_fdr` nuevos.
- **Si baja a `limitada` solo por el FDR** (lo esperable en el peor escenario: p ajustado 0,032 → 0,068): la celda y sus cifras son las mismas. El caso pasa a ser **más didáctico, no menos**: "La misma celda pasa o no la prueba según con cuántos lugares se compare". Cambia la etiqueta de *tendencia consistente* a *señal débil, no confirmada*, se explica el FDR con el texto de la sección 1, y el contraste con Choluteca queda en *limitada* frente a *sin evidencia*. Se mantienen las salvedades de la franja. **No** se usa la frase "el único lugar con tendencia consistente".
- **Si el motivo de fallo no es solo el FDR** (otra razón en `verdict_reasons`): es un error de datos, no un efecto del FDR. NO-GO hasta explicarlo.

**Cómo leo la condición 2 del GO (docs/10, sección 6):** "las 3 celdas de los casos conservan sus cifras" significa pendiente, IC, p, huella, ENSO y POWER idénticos. `p_fdr` y el veredicto de `consistente` pueden cambiar, y no impiden el GO si el único motivo es el FDR. Joshua: si lo entiendes distinto, dímelo antes de las 12:30.

---

## 3. Limitaciones nuevas (ES / EN)

Se **añaden** a las seis de `config.yaml`, que no cambian. Hecho con datos reales de 3 países (`season_check.py`, abajo); lo de los 4 países nuevos queda como hipótesis hasta verificar.

**Estas tres frases dependen de datos de los países nuevos. Se publican solo con los números verificados; las marcas `[CON DATOS]` se rellenan con la tabla de la sección 4.**

1. **Temporada lluviosa distinta según la zona**
   - **ES.** "Los indicadores de mayo–octubre y de julio–agosto describen el ciclo típico de la vertiente Pacífica. En otras zonas la temporada lluviosa cae en otros meses: en Honduras, 119 celdas de la costa Caribe tienen su máximo desde julio en adelante, y [CON DATOS: n] de las celdas de Belice, Nicaragua, Costa Rica y Panamá se comportan igual. Para ellas el indicador mide otra cosa que su temporada de lluvias."
   - **EN.** "The May–October and July–August indicators describe the typical Pacific-slope cycle. In other areas the rainy season falls in other months: in Honduras, 119 Caribbean-coast cells peak from July onwards, and [CON DATOS: n] cells in Belize, Nicaragua, Costa Rica and Panama behave the same way. For these cells the indicator measures something other than their rainy season."

2. **Istmo angosto**
   - **ES.** "En Costa Rica y Panamá el istmo es angosto: una celda satelital de unos 11 km puede mezclar mar y tierra, y la máscara de país usa el centro de la celda. Los valores de celdas costeras pueden reflejar lluvia sobre el mar."
   - **EN.** "In Costa Rica and Panama the isthmus is narrow: an 11 km satellite cell can mix sea and land, and the country mask uses the cell centre. Values for coastal cells may reflect rain over the sea."

3. **ENSO por vertiente**
   - **ES.** "La relación entre ENSO y la lluvia puede ser distinta en la vertiente Caribe y en la Pacífica. [CON DATOS: resultado] En los datos de 3 países la correlación con ONI es negativa en casi todas las celdas; esa lectura no se extiende a los países nuevos sin comprobarla."
   - **EN.** "The relationship between ENSO and rainfall may differ between the Caribbean and Pacific slopes. [CON DATOS: result] In the 3-country data the correlation with ONI is negative in almost every cell; that reading is not extended to the new countries without checking."

4. **Número de comparaciones (para el pasaporte y el formulario)**
   - **ES.** "El veredicto *consistente* depende de cuántas celdas se analizan juntas (corrección FDR): con más celdas el mismo dato puede quedar en otro veredicto. El umbral no cambió."
   - **EN.** "The *consistent* verdict depends on how many cells are analysed together (FDR correction): with more cells the same data can fall under a different verdict. The threshold did not change."

**Texto que ya no es cierto en la versión de 7 países y hay que revisar** (en `docs/09` y en `submission-en-ca.md`):

- "ENSO: más El Niño, menos lluvia **en toda la región**" y "no hay efecto espejo Pacífico–Caribe". Solo se mantienen si los 7 países lo muestran. Se comprueba con `enso_results.csv`.
- "Tras corregir por las **2 025 celdas**".
- "Honduras, Guatemala y El Salvador" donde diga "los tres países".
- "El cambio entre antes y después de la bandera de 2013–2015 es **sobre todo un fenómeno de Guatemala**". Se comprueba por país en `ca_tables.py`.

---

## 4. Temporada lluviosa por país

**3 países (datos reales actuales, `python pipeline/season_check.py --data rol5-panel-app/public/data`):**

| País | Celdas | Empieza en mayo | Empieza en junio | Julio o después | Sin canícula |
|---|---|---|---|---|---|
| GTM | 917 | 815 | 102 | 0 | 78 |
| HND | 939 | 393 | 427 | 119 | 262 |
| SLV | 169 | 169 | 0 | 0 | 0 |
| **Total** | 2 025 | 1 377 | 529 | 119 | 340 |

**7 países [CON DATOS]:** pegar aquí la salida de `season_check.py` sobre el JSON de Joshua, con filas BLZ, NIC, CRI y PAN.

| País | Celdas | Antes de mayo | Mayo | Junio | Julio o después | Sin canícula |
|---|---|---|---|---|---|---|
| BLZ | | | | | | |
| NIC | | | | | | |
| CRI | | | | | | |
| PAN | | | | | | |

Lectura: "mayo" y "junio" calzan con la ventana mayo–octubre. "Antes de mayo" y "julio o después" no. Si en un país más de ~1 de cada 4 celdas no calza, el nombre "lluvia de temporada" en el mapa engaña para ese país y hay que decirlo en la leyenda, no solo en la limitación (aviso a Izel y Elena).

---

## 5. Checklist científico (docs/10, sección 6) · firma a las 12:30

Marco lo que **ya pude comprobar** sin datos nuevos. Lo demás se firma con el JSON y la `COMPARACION` de Joshua.

- [x] El motor no usa FDR salvo en `consistente` (leído en `verdict.py`). Solo puede haber cambios `consistente` ↔ `limitada`.
- [x] Los textos de la explicación del FDR y las limitaciones nuevas están escritos en ES y EN (secciones 1 y 3).
- [x] La contingencia de los casos está acordada de antemano (sección 2).
- [x] Ningún umbral cambia: `config_centroamerica.yaml` solo cambia `bbox` y `countries` (comprobado con `diff`).
- [ ] **[CON DATOS]** `compare_regions.py`: pendiente, intervalo y p de GTM/SLV/HND idénticos a los actuales (0 diferencias).
- [ ] **[CON DATOS]** Todo cambio de veredicto en GTM/SLV/HND tiene como único motivo el FDR.
- [ ] **[CON DATOS]** Las 3 celdas de los casos conservan sus cifras por celda; se anota su nuevo `p_fdr` y veredicto.
- [ ] **[CON DATOS]** `season_check.py` pegado en la sección 4; `[CON DATOS]` de la limitación 1 rellenado.
- [ ] **[CON DATOS]** Correlación de ENSO por país (y por vertiente en CRI, PAN y NIC); limitación 3 rellenada. Si hay países con signo positivo, **se retira la frase "en toda la región"**.
- [ ] **[CON DATOS]** Bandera de 2013–2015 por país; la frase "sobre todo Guatemala" se mantiene o se corrige.
- [ ] **[CON DATOS]** Ninguna celda `incompleta` inesperada en los países nuevos (24 de 24 años válidos).
- [ ] **[CON DATOS]** Las frases prohibidas siguen sin aparecer en `submission-en-ca.md`: "rainfall is declining in Honduras", "ENSO explains the trend", "falls 30 % per decade", resultados de usuarios sin hacer.

**Firma:** ______________________  **Hora:** ________

---

## Reporte

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| Expliqué por qué el veredicto puede cambiar por haber más celdas (ES/EN, una línea y un párrafo) | Leí `verdict.py`: solo `consistente` usa `p_fdr`, así que `sin_evidencia` no puede cambiar y los casos 1 y 2 conservan su veredicto. Recalculé el BH con los `p_value` reales y reproduje `p_fdr` (diferencia máxima 1,8e-4) | Que Joshua confirme que el FDR se calcula sobre todas las celdas de los 7 países, por indicador, sin separar por país |
| Medí la sensibilidad de las 44 celdas `consistente` al número de celdas | Con 0 % de señal en las celdas nuevas, 0 de 44 siguen (caso 3: `p_fdr` 0,032 → 0,068); con 5 % de señal fuerte, 44 de 44. Es un análisis de sensibilidad, no una predicción | El resultado real, con el JSON de 7 países |
| Definí la contingencia de los 3 casos y cómo leo la condición 2 del GO | Los IDs quedan fijos y no se sustituyen. Casos 1 y 2 no pueden cambiar de veredicto; el caso 3 puede bajar a `limitada` solo por el FDR | Que Joshua acepte mi lectura de la condición 2 |
| Redacté 4 limitaciones nuevas en ES y EN y marqué las frases de `docs/09` que dejan de ser ciertas | `season_check.py` sobre los datos reales de 3 países (119 celdas de HND con temporada desde julio) y `diff` de `config.yaml` contra `config_centroamerica.yaml` | Rellenar `[CON DATOS]` con la salida de `season_check.py` y la correlación ENSO por país. No verifiqué nada de BLZ, NIC, CRI y PAN: son hipótesis hasta tener datos |
