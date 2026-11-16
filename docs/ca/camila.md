# Camila · Rol 3 · Ciencia · Centroamérica

**Rama:** `ca/camila-ciencia`  ·  **Actualizado con el JSON real de 7 países** (`altaris_ca_json.zip`, motor `7e93e46`, 4 332 celdas)  ·  Plan: [docs/10-centroamerica.md](../10-centroamerica.md)

Escrito para: Joshua (GO/NO-GO), Andrés (formulario y README) e Izel (textos del panel). Es el contrato C5.

## Reglas

- Subo **solo a `ca/camila-ciencia`**. No hago `push` a `main` ni a la rama de otra persona.
- Toco **solo mis archivos**: `docs/ca/camila.md`, `docs/09-casos-y-textos-camila.md` y `docs/08-revision-camila.md`. Ningún umbral cambia.
- El JSON grande **no se sube**. Lo revisé desde una carpeta fuera del repositorio.
- `docs/09` queda **intacto**: es el respaldo si hay NO-GO. Las variantes de 7 países viven aquí.

## Resumen para decidir (12:45)

1. **Condiciones científicas del GO: se cumplen.** En las 2 025 celdas de GTM, SLV y HND, pendiente, intervalo, p, huella, ENSO y bandera son **idénticos** a la versión de 3 países (0 diferencias). Lo único que cambia es `p_fdr` y, por eso, el veredicto de 29 celdas, todas de Guatemala y todas de `limitada` a `consistente`.
2. **Los 3 casos conservan sus cifras y su veredicto.** Solo cambia el `p_fdr`.
3. **Hay que corregir textos que dejan de ser ciertos**, sobre todo la frase de ENSO y todo lo que diga "solo Guatemala" (sección 3.2).
4. **El hallazgo se amplía con la misma salvedad.** Las bandas `consistente` de Costa Rica y Panamá se parecen a la de Guatemala y NASA POWER las contradice (sección 2).

**Mi recomendación científica: GO**, con las cuatro reglas de redacción de la sección 6. Si el formulario presenta las 196 celdas como "hallazgo climático", no firmo.

---

## 1. Por qué un veredicto puede cambiar solo por haber más celdas

### Qué cambia y qué no (leído en `pipeline/altaris/verdict.py` y comprobado en los datos)

| Por **celda** (no cambia) | Depende de **cuántas celdas** se corrigen juntas |
|---|---|
| Pendiente de Sen, intervalo, p de Mann–Kendall, huella, ENSO, bandera de 2013–2015, ciclo mensual | Solo `p_fdr` (Benjamini–Hochberg, por indicador) |

Solo `consistente` usa `p_fdr`. Por eso `sin_evidencia` no puede cambiar, y los únicos cambios posibles son `consistente` ↔ `limitada`.

### Qué pasó de verdad

| Indicador | Antes (3 países) | Ahora (7 países) | En las celdas comunes |
|---|---|---|---|
| Lluvia de temporada | 44 `consistente` | 196 | 14 celdas de Guatemala suben de `limitada` a `consistente`. Ninguna baja |
| Lluvia anual | 56 | 231 | 15 celdas de Guatemala suben. Ninguna baja |
| Canícula | 0 | 0 | Sin cambios |

Las 2 025 celdas comunes tienen **0 diferencias** en pendiente, IC, p, huella, ENSO y bandera. La clave `2001-2024` de `window_results` difiere en 40 casos solo porque hereda el veredicto del periodo base.

El FDR actuó **en el sentido contrario al peor caso** que calculé antes (todas bajarían): como las celdas nuevas aportan señal propia, a las de Guatemala les resultó **más fácil** pasar. Mi sensibilidad extrema seguía siendo válida (con celdas nuevas sin señal, las 44 habrían bajado), pero el resultado dependía de las celdas nuevas, no de las de Guatemala. Eso es justo lo que hay que explicar.

### Texto para el panel, el formulario y el pasaporte

**ES.** El veredicto *consistente* exige que la señal siga siendo significativa después de corregir por comparaciones múltiples. Esa corrección depende de cuántos lugares se miran a la vez y de cuántos tienen señal. Al pasar de 3 a 7 países el umbral no cambió (0,05); cambió el número de comparaciones. Por eso 29 celdas de Guatemala pasaron de *señal débil* a *consistente* sin que cambiara ninguna de sus cifras.

**EN.** The *consistent* verdict requires the signal to remain significant after correcting for multiple comparisons. That correction depends on how many places are examined together and how many carry a signal. Going from 3 to 7 countries the threshold did not change (0.05); the number of comparisons did. That is why 29 Guatemalan cells moved from *weak signal* to *consistent* without any of their figures changing.

**Frase corta:** "Más comparaciones, mismo umbral."

### Un efecto parecido en ENSO, que hay que evitar citar

La correlación anual con ONI era significativa tras FDR en 576 celdas de los 3 países y ahora lo es en **1** de 4 332. La correlación de cada celda no cambió: cambió la corrección. **No se cita el número de celdas con correlación anual significativa** en ninguna versión. Para ENSO se usa el signo (sección 3.2), no el conteo de significativas anuales.

---

## 2. Qué muestra el JSON real de 7 países

### 2.1 Veredictos (lluvia de temporada)

| País | Celdas | `consistente` | `limitada` | `sin_evidencia` |
|---|---|---|---|---|
| Honduras | 939 | 0 | 295 | 644 |
| El Salvador | 169 | 0 | 70 | 99 |
| Guatemala | 917 | 58 | 542 | 317 |
| Belice | 192 | 1 | 125 | 66 |
| Nicaragua | 1 076 | 15 | 600 | 461 |
| Costa Rica | 425 | 80 | 129 | 216 |
| Panamá | 614 | 42 | 340 | 232 |

**Ninguna celda `incompleta`** en ningún país ni indicador. El mensaje de Honduras y El Salvador se mantiene: 0 celdas `consistente`, con 24 años no se afirma una tendencia. Anual: BLZ 5, CRI 106, GTM 71, NIC 1, PAN 48. Todas las tablas salen de `verdict_summary.csv`; las dejo aquí solo para leer.

### 2.2 Las nuevas bandas `consistente` de Costa Rica y Panamá se parecen a la de Guatemala

| País | Celdas | Dirección | Mediana por década | Año de Pettitt más frecuente | Zona |
|---|---|---|---|---|---|
| Guatemala | 58 | 58 a la baja | −18,4 % | 2012 (42), 2009 (16) | lat 14,85 a 15,35, lon −91,75 a −90,05 (tierras altas) |
| Costa Rica | 80 | 80 a la baja | −15,8 % | 2012 (42), 2010 (25), 2011 (13) | lat 8,95 a 10,25, lon −83,85 a −82,75 |
| Panamá | 42 | 34 a la baja, 8 al alza | −17,7 % | 2012 (19), 2011 (15), 2017 (5) | lat 7,35 a 9,45, lon −82,85 a −78,15 |
| Nicaragua | 15 | 13 a la baja, 2 al alza | −14,1 % | 2012 (12) | lat 11,45 a 14,55, lon −85,55 a −83,85 |

- Todas son bajadas grandes (−11 % a −31 % por década), con cambio estadístico hacia **2010–2012**, en la mitad del registro. Es la misma firma de Guatemala.
- Con el chequeo escalón/rampa ([`check_step_vs_ramp.py`](../../pipeline/check_step_vs_ramp.py), sobre las series `consistente` de temporada y anual) los países se comportan distinto. En **Costa Rica el escalón gana en 140 de 186 series y en Panamá en 73 de 90**. En Nicaragua y Belice gana la rampa (18 de 22). En Guatemala, 102 de 129 no se distinguen (23 escalón, 4 rampa). El corte de Costa Rica y Panamá cae en 2010–2012, **antes** del paso de TRMM a GPM (2014): la bandera de 2013–2015 no puede atraparlo y esa explicación no sirve aquí. **No sé qué lo causa** y no lo especulo en el texto.
- **Contraste con NASA POWER** (corrida mía, en una copia aparte; ver [`data/rol3/ca_power/`](../../data/rol3/ca_power/)). En la celda más fuerte de cada país:

| Celda | IMERG, temporada (mm por década) | POWER, temporada (mm por década, p) | Mismo signo | r año a año |
|---|---|---|---|---|
| `N0955W08325` (Costa Rica) | −335 (IC −507 a −189) | **+483** (IC +288 a +594, p < 0,0001) | no | −0,41 |
| `N0765W07815` (Panamá) | +353 (IC +211 a +449) | −197 (IC −494 a +117, p 0,24) | no | 0,01 |
| `N1495W09125` (Guatemala, de antes) | −452 | +40 (p 0,60) | no | 0,18 |

En las dos celdas nuevas, las fuentes dan signo contrario y casi no coinciden en qué años fueron húmedos o secos. En Costa Rica POWER ve un aumento **significativo**. Son 2 celdas de las 138 `consistente` nuevas de temporada, así que no generalizo, pero no hay ninguna de las tres comprobadas donde las dos fuentes coincidan. POWER (~0,5° de resolución, reanálisis) no es independiente de IMERG del todo, por eso se presenta como contraste y no como prueba.

**Lectura:** el producto de lluvia puede estar mostrando en tres regiones de montaña un cambio que no es del clima, o puede ser real. Con este registro no se separa. La salvedad de Guatemala (docs/09, caso 3) se aplica **igual** a Costa Rica y Panamá.

### 2.3 Banderas de 2013–2015 por país

| País | Temporada | Canícula | Anual |
|---|---|---|---|
| Belice | 26 de 192 (13,5 %) | 5 (2,6 %) | 6 (3,1 %) |
| Costa Rica | 0 | 5 (1,2 %) | 0 |
| Guatemala | 111 de 917 (12,1 %) | 320 (34,9 %) | 104 (11,3 %) |
| Honduras | 1 | 21 (2,2 %) | 0 |
| Nicaragua | 9 (0,8 %) | 14 (1,3 %) | 2 |
| Panamá | 42 de 614 (6,8 %) | 135 (22,0 %) | 35 (5,7 %) |
| El Salvador | 1 | 15 (8,9 %) | 0 |

"Sobre todo un fenómeno de Guatemala" **sigue siendo cierto**, y Panamá es el segundo. En Costa Rica la bandera casi no aparece, y sin embargo sus 80 celdas `consistente` tienen cambio en 2010–2012: la bandera de 2013–2015 **no protege** a Costa Rica, justo lo que ya se veía en Guatemala.

---

## 3. Los casos y los textos

### 3.1 Qué pasa con los 3 casos (verificado en el JSON de 7 países)

Los IDs quedan fijos: `N1335W08715`, `N1475W08765`, `N1495W09125`.

| Caso | Cifras por celda | Veredicto | `p_fdr` antes → ahora |
|---|---|---|---|
| 1. Choluteca | Idénticas (−48,1; IC −257,4 a +170,9; p 0,785; ENSO −0,64) | `sin_evidencia` | 0,879 → 0,874 |
| 2. `N1475W08765` | Idénticas (−48,3; IC −163,7 a +108,0; p 0,535). 2008–2023: −345 (p 0,003). 2001–2010: +382 (p 0,02) | `sin_evidencia`; ventanas `limitada` | 0,781 → 0,737 |
| 3. `N1495W09125` | Idénticas (−452,4; IC −641,3 a −282,1; p 0,00012; ENSO −0,05) | `consistente` (temporada y anual) | 0,032 → **0,024** (anual 0,020 → 0,013) |

Para la versión de 7 países, en los textos de `docs/09` cambia solo esto:
- "Tras corregir por las **2 025** celdas" → "**4 332**".
- Caso 1, p ajustado "0,88" → "**0,87**". Caso 3, "0,032" → "**0,024**".
- Caso 3, canícula `N1495W09125`: sigue `limitada` por la bandera de 2014.

### 3.2 Textos que dejan de ser ciertos

| Texto actual | Por qué | Qué escribir |
|---|---|---|
| "Los años El Niño son más secos en toda la región" / "la correlación con ONI es negativa en todas las celdas" | 154 celdas de temporada y 161 de canícula tienen correlación **positiva** (Costa Rica 81, Nicaragua 52, Panamá 21 en temporada). Ninguna es significativa tras FDR. En Costa Rica y Nicaragua están en promedio más al este (hacia el Caribe) que las negativas; en Panamá, más al oeste | "En este registro, los años El Niño son más secos: todas las correlaciones significativas con ONI son negativas (1 767 celdas de temporada y 2 112 de canícula, de 4 332). Unas pocas celdas de Costa Rica, Nicaragua y Panamá tienen correlación positiva, pero ninguna es significativa; no se distingue un contraste Pacífico–Caribe" |
| "No hay efecto espejo" | Se mantiene, con el matiz de arriba | Igual que la fila anterior. **No** decir "no hay ninguna celda con signo positivo" |
| "Honduras, Guatemala y El Salvador" donde diga "los tres países" | Ya son siete | "siete países de Centroamérica" |
| "Solo en Guatemala hay celdas `consistente`" / "una franja del oeste" | Ahora también hay en Costa Rica, Panamá, Nicaragua y Belice | "Cuatro zonas: las tierras altas de Guatemala y áreas de Costa Rica, Panamá y Nicaragua" |
| "Honduras: 924 de 939 con pendiente negativa; mediana −4,5 %" | No cambia (celdas idénticas) | Se mantiene |
| "El 17,6 % de banderas en canícula" | Cambia al sumar países | No dar un total: dar la tabla 2.3 |

### 3.3 Qué decir del hallazgo

**ES.** En 24 años de lluvia IMERG, ningún lugar de Honduras ni de El Salvador sostiene una tendencia. En cuatro zonas de montaña (las tierras altas de Guatemala y áreas de Costa Rica, Panamá y Nicaragua) 196 celdas pasan todas las pruebas. Las bajas son muy grandes (de −11 % a −31 % por década), el cambio se ubica hacia 2010–2012 y, en las celdas donde lo comprobamos, NASA POWER no reproduce el signo. Son preguntas abiertas, no hallazgos climáticos: pueden ser reales o un artefacto del producto en zonas con pocos pluviómetros.

**EN.** In 24 years of IMERG rainfall, no place in Honduras or El Salvador supports a trend. In four mountainous areas (Guatemala's highlands and parts of Costa Rica, Panama and Nicaragua), 196 cells pass every test. The declines are very large (−11 % to −31 % per decade), the change falls around 2010–2012, and at the cells where we checked, NASA POWER does not reproduce the sign. These are open questions, not climate findings: they may be real or an artefact of the product in areas with few rain gauges.

---

## 4. Limitaciones nuevas (ES / EN), con datos

Se **añaden** a las seis de `config.yaml`. Ya sin marcas pendientes.

1. **Temporada lluviosa distinta según la zona**
   - **ES.** "Los indicadores de mayo–octubre y de julio–agosto describen el ciclo típico de la vertiente Pacífica. En la mayoría de las celdas mayo–octubre reúne entre el 56 % y el 91 % de la lluvia anual, pero en 106 celdas de la costa Caribe de Honduras reúne menos del 55 %, y en 48 de Costa Rica menos del 60 %. La canícula (julio–agosto) no aplica en 1 501 de 4 332 celdas (688 de 1 076 en Nicaragua)."
   - **EN.** "The May–October and July–August indicators describe the typical Pacific-slope cycle. In most cells May–October holds 56 % to 91 % of annual rainfall, but in 106 Caribbean-coast cells in Honduras it holds under 55 %, and in 48 cells in Costa Rica under 60 %. The midsummer dry spell (July–August) does not apply in 1,501 of 4,332 cells (688 of 1,076 in Nicaragua)."
2. **Istmo angosto**
   - **ES.** "En Costa Rica y Panamá el istmo es angosto: una celda satelital de unos 11 km puede mezclar mar y tierra, y la máscara de país usa el centro de la celda. Los valores costeros pueden reflejar lluvia sobre el mar."
   - **EN.** "In Costa Rica and Panama the isthmus is narrow: an 11 km satellite cell can mix sea and land, and the country mask uses the cell centre. Coastal values may reflect rain over the sea."
3. **ENSO por vertiente**
   - **ES.** "Todas las correlaciones significativas con ONI son negativas. Unas pocas celdas de Costa Rica, Nicaragua y Panamá tienen signo positivo, sin significancia; en Costa Rica y Nicaragua están en promedio más al este, pero no forman un patrón claro. Con este registro no se puede afirmar un contraste entre vertientes."
   - **EN.** "All significant correlations with ONI are negative. A few cells in Costa Rica, Nicaragua and Panama have a positive sign without significance; in Costa Rica and Nicaragua they lie on average further east, but form no clear pattern. This record cannot support a claim of contrast between slopes."
4. **Número de comparaciones**
   - **ES.** "El veredicto *consistente* depende de cuántas celdas se analizan juntas (corrección FDR): con más celdas, el mismo dato puede quedar en otro veredicto. El umbral no cambió."
   - **EN.** "The *consistent* verdict depends on how many cells are analysed together (FDR correction): with more cells, the same data can fall under a different verdict. The threshold did not change."
5. **Las zonas `consistente` y el producto**
   - **ES.** "En las cuatro zonas `consistente` el cambio se ubica entre 2010 y 2012, en el centro del registro, antes del paso de TRMM a GPM. En los sitios donde lo contrastamos, NASA POWER da el signo contrario. No podemos separar un cambio real de un efecto del producto."
   - **EN.** "In the four `consistent` areas the change falls between 2010 and 2012, mid-record and before the TRMM-to-GPM transition. At the sites where we compared, NASA POWER gives the opposite sign. We cannot tell a real change from a product effect."

### Temporada por país (`season_check.py` sobre el JSON real)

| País | Celdas | Empieza en mayo | Empieza en junio | Julio o después | Sin canícula | % de lluvia anual en may–oct (mediana) |
|---|---|---|---|---|---|---|
| BLZ | 192 | 0 | 191 | 1 | 23 | 69 |
| CRI | 425 | 250 | 167 | 8 | 165 | 69 |
| GTM | 917 | 815 | 102 | 0 | 78 | 77 |
| HND | 939 | 393 | 427 | 119 | 262 | 70 |
| NIC | 1 076 | 602 | 474 | 0 | 688 | 77 |
| PAN | 614 | 93 | 521 | 0 | 285 | 69 |
| SLV | 169 | 169 | 0 | 0 | 0 | 90 |
| **Total** | 4 332 | 2 322 | 1 882 | 128 | 1 501 | — |

La ventana de 6 meses "empieza en mayo o junio" en 4 204 de 4 332 celdas, así que **el nombre "lluvia de temporada" es correcto en casi toda la región**. Corrijo lo que había supuesto: los países nuevos no fallan en la temporada; lo que falla es la **canícula** (no aplica en el 35 % de las celdas, sobre todo en Nicaragua y Panamá). Aviso a Izel: el panel debe seguir mostrando "canícula no aplicable" en esas celdas, y el resumen por país de canícula no debe contarlas como `sin_evidencia`.

---

## 5. Checklist científico (docs/10, sección 6)

- [x] El motor no usa FDR salvo en `consistente`. Solo hay cambios `consistente` ↔ `limitada` (comprobado: 29 celdas, todas hacia arriba).
- [x] **Celdas comunes idénticas**: 2 025 celdas, 0 diferencias en pendiente, IC, p, huella, ENSO y bandera, en los 3 indicadores.
- [x] **Todo cambio de veredicto en GTM/SLV/HND se explica por el FDR**: 14 + 15 celdas, todas de Guatemala, todas `limitada` → `consistente`, y en todas la razón que desaparece es `fdr_no_significativo`.
- [x] **Los 3 casos conservan sus cifras y su veredicto** (sección 3.1).
- [x] Ningún umbral cambió. `meta.json` trae las dos entradas de `threshold_changes` y ninguna es un umbral (la segunda es un `-0.0`; sin efecto sobre veredictos, según Joshua, y no lo contradice ninguna de mis comprobaciones).
- [x] 0 celdas `incompleta` en los 7 países.
- [x] Limitaciones nuevas escritas y rellenas con datos (sección 4). `season_check.py` pegado.
- [x] ENSO por país revisado; frase corregida (3.2). La correlación anual significativa se **retira** de los textos.
- [x] Bandera por país (2.3): "sobre todo Guatemala" se mantiene; Panamá es la segunda.
- [x] **Formulario de 7 países** (`submission-en-ca.md`, de Andrés). **Revisado por Joshua con Claude el 15 nov, ~23:05 (no por Camila).** Se buscó cada fila de la tabla 3.2 y las cuatro reglas en el formulario, el README alternativo, la interfaz, el recorrido y el glosario publicados: ninguna frase de 3.2 sobrevive. **Se corrigió una violación de la regla 3**: el formulario citaba una asociación anual significativa con ENSO («one significant association»); se retiró. Cotejo de cifras: `check_form_ca.py`, 41 OK y 0 por revisar.
- [x] Revisión final. **Hecha por Joshua con Claude, no a las 18:00 sino el 15 nov alrededor de las 23:05**, sobre `main`. Comprobado: la interfaz ya no dice «el único tipo de lugar» (caso 3, p ajustado 0,024), sin «normal», «es real» ni «bajó» en los textos nuevos; las 196 celdas se presentan como evidencia que pasa las pruebas del análisis y no como hallazgo climático. **Decisiones abiertas que no bloquean la entrega:** el color naranja de «limitada» en el mapa y la frase verde de «consistente» («La evidencia respalda que la lluvia está bajando…»), que sigue sin cambiar.

**Revisión científica hecha. Las secciones 1 a 4 y las cifras las revisó Camila; las dos últimas casillas las cerró Joshua con Claude. Firma de Joshua:** ______________________  **Hora:** ________

---

## 6. Cuatro reglas de redacción (condición de mi recomendación de GO)

1. **No presentar las 196 celdas como "hallazgo climático" ni como "tendencia confirmada".** Se dice "pasan todas las pruebas" y "pregunta abierta".
2. La salvedad de la franja de Guatemala se aplica **también** a Costa Rica y Panamá (sección 2.2), con el contraste de NASA POWER de las 3 celdas.
3. No citar el número de celdas con ENSO significativo anual, ni "negativa en todas las celdas".
4. No decir "solo en Guatemala" ni "los tres países".

---

## Reporte

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| Descomprimí `altaris_ca_json.zip` fuera del repositorio y revisé el JSON de 7 países (4 332 celdas) | Comparé las 2 025 celdas comunes con `main`: pendiente, IC, p, huella, ENSO y bandera idénticos (0 diferencias). Los 29 cambios de veredicto son `limitada` → `consistente` en Guatemala, con `fdr_no_significativo` como razón que desaparece | Que Joshua confirme que `compare_regions.py` coincide con mis 0 diferencias |
| Expliqué el efecto del número de celdas en el veredicto y lo medí | 44 → 196 en temporada (GTM 44 → 58); mi sensibilidad extrema (todas bajan) no ocurrió porque las celdas nuevas aportan señal. La correlación anual de ENSO pasó de 576 significativas a 1 | — |
| Verifiqué los 3 casos | Cifras por celda idénticas; `p_fdr` 0,032 → 0,024 en el caso 3; veredictos iguales | — |
| Revisé ENSO, bandera de 2014 y temporada por país | Correlaciones: 0 positivas significativas. `season_check.py` y la mediana de lluvia may–oct sobre anual por país | — |
| Analicé las bandas `consistente` de CRI, PAN y NIC | Pettitt 2010–2012; escalón gana en 140 de 186 series de Costa Rica y 73 de 90 de Panamá (rampa en Nicaragua y Belice); POWER da signo contrario en las 2 celdas que corrí (CRI +483, p < 0,0001; PAN −197) | Con más tiempo: correr POWER en 3 o 4 celdas más; David puede hacerlo con `04_power.py --cells` |
| Redacté textos, limitaciones y 4 reglas | Sección 3.2 lista lo que deja de ser cierto en `docs/09` y el formulario | Revisar `submission-en-ca.md` cuando Andrés lo suba. **Firma de Camila** |
