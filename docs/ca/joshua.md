# Joshua · Rol 2 · Motor · Centroamérica

**Rama:** `ca/joshua-motor`  ·  **Hora meta:** 12:00  ·  Plan completo: [docs/10-centroamerica.md](../10-centroamerica.md)

## Estado a las 11:40: los datos reales ya corrieron

| Tarea | Estado | Dónde |
|---|---|---|
| Comparación entre regiones | Hecho | `pipeline/compare_regions.py` · informe real: [COMPARACION.md](COMPARACION.md) |
| Tablas para el formulario | Hecho | `pipeline/ca_tables.py` · [TABLAS.md](TABLAS.md) |
| Cotejo del formulario de Centroamérica | Hecho | `pipeline/check_form_ca.py` |
| Motor sobre los datos reales de David (C1) | **Hecho** | ENSO 17 s · motor 539 s (4 núcleos) · 4 332 celdas |
| Zip del JSON (C2) | **Entregado por el chat** (`altaris_ca_json.zip`, 49 MB, sha256 que empieza por `77e7978646f518e4`) | no se sube al repositorio |
| Archivos livianos | Hecho | `data/ca/rol3/`, `data/ca/json-light/` |
| Temporada por país | Hecho | [TEMPORADAS.csv](TEMPORADAS.csv) |
| GO / NO-GO | **Pendiente (12:45)** | |

## Resultado de la comparación contra la versión de 3 países

- **Condición 1 (idéntico por celda): CUMPLE.** En las 2 025 celdas comunes coinciden serie, media, pendiente, intervalo, p, huella, ventanas, ENSO y salto de 2014.
- **Condición 2 (cambios explicados por el FDR): CUMPLE.** 29 celdas-indicador cambiaron de veredicto: 14 en lluvia de temporada y 15 en lluvia anual, **todas de Guatemala y todas de `limitada` a `consistente`**, y las 29 cruzan el umbral de FDR (el p ajustado baja de 0,05–0,07 a 0,035–0,047). Ninguna celda perdió `consistente`.
- **Los 3 casos conservan su veredicto.** Solo cambia su p ajustado (caso 3, temporada: 0,032 → 0,024).
- `meta.json`: `observed`, DOI correcto, `frozen: true`, commit `7e93e46`, 4 332 celdas.

## Un defecto encontrado en el camino (y mi primer diagnóstico estaba mal)

La primera corrida falló la condición 1 en 8 celdas de `jul_aug_mm` (`enso_test.survives`). Elena lo encontró también, por su cuenta, con la misma causa.

- **Causa:** en esas celdas la variante «sin años ENSO fuertes» da una pendiente exactamente cero, y `altaris/enso.py` usa `math.copysign`, que distingue `0.0` de `-0.0`. Según la versión de numpy o scipy sale uno u otro y `survives` cambia con la misma serie. Ningún veredicto cambiaba (las 8 son `sin_evidencia`): solo aparece o desaparece el código `enso_no_sobrevive`.
- **Primer arreglo (`a4c2c40`), equivocado:** decía que un cero no tiene signo. Al re-correr apareció una celda más con diferencia, `N1465W09115`, que ya estaba publicada con `survives = true` porque la regla vieja trataba el cero como positivo. Mi arreglo cambiaba una celda publicada.
- **Arreglo final (`597dc8d`):** `slope + 0.0` convierte `-0.0` en `0.0` y no cambia ninguna regla. Reproduce exactamente la versión de 3 países en las 9 celdas. Quedó anotado en `threshold_changes` de `config_centroamerica.yaml` con las dos versiones, y con prueba (`tests/test_enso.py`).
- **Cómo descartarlo:** revertir `597dc8d` y `a4c2c40` y volver a correr (unos 9 minutos).
- **Queda sin resolver, y no afecta ningún veredicto:** que el cero cuente como positivo es una asimetría heredada. Se dejó documentada en el código y en la prueba.

## Qué hace cada herramienta

**`compare_regions.py --old <JSON actual> --new <JSON nuevo> [--md informe.md]`**: compara las celdas que están en las dos exportaciones.

- **Condición 1 del GO:** todo lo que es por celda (serie, media, pendiente, intervalo, p, huella, ventanas, ENSO, salto de 2014) debe ser **idéntico**.
- **Condición 2:** lo único que puede cambiar es el p ajustado (FDR) y, por él, el veredicto. Todo cambio de veredicto debe cruzar el umbral de FDR; si no lo cruza sale como **NO EXPLICADO**. También exige que los 3 casos no cambien.
- Sale con código 0 si las dos se cumplen y 1 si no.

**`ca_tables.py --data <JSON> [--lang en|es] [--out archivo]`**: tablas en Markdown de celdas por país, veredictos por país e indicador, banderas de 2014, pendientes, ENSO, celdas `consistente` y calibración. Avisa en grande si los datos no son `observed`.

**`check_form_ca.py --data <JSON> --form <formulario.md>`**: lee las cifras del formulario y las compara con el JSON. Detecta marcas `[PENDING-CA]` sin rellenar y **rechaza datos que no sean `observed`**. Sale con 1 si algo no coincide. Con el formulario de 3 países: 27 de 27; con 3 cifras alteradas a propósito: detecta las 3.

## Lo medido

| Paso | Celdas | Datos | Tiempo |
|---|---|---|---|
| `06_enso.py` | 4 332 | reales | 17 s |
| `run_pilot.py` (motor completo, con mensuales) | 4 332 | reales | **508 a 539 s** (≈0,12 s por celda, 4 núcleos) |
| `run_pilot.py` (ensayo previo) | 1 196 | simulados | 139 s |
| Corrida completa de Elena (ENSO, motor y referencias) | 4 332 | reales | 5 min 32 s con 16 núcleos |

Cada corrida completa cuesta unos 9 minutos. El rango de 8 a 26 minutos que había anunciado era demasiado pesimista.

## Lo que sale con los 7 países

Cifras para Camila y Andrés; todo en [TABLAS.md](TABLAS.md).

- **`consistente` en lluvia de temporada: 196 celdas** (antes 44): Costa Rica 80, Guatemala 58, Panamá 42, Nicaragua 15, Belice 1. **Honduras y El Salvador: 0.** En lluvia anual: 231 (antes 56).
- **La contingencia pesimista de Camila no ocurrió:** las 44 celdas siguen `consistente`, porque las celdas nuevas aportan señal.
- **Los países nuevos repiten el patrón de Guatemala.** Las celdas `consistente` de Costa Rica son 80 de 80 con pendiente negativa (−11 % a −21 % por década, mediana −16 %) y su cambio de régimen cae en 2010–2012. En Panamá, 34 de 42 son negativas (mediana −18 %), con el cambio sobre todo en 2011–2012. Es lo mismo que en la franja de Guatemala (cambio hacia 2012, −19 % por década). No lo interpreto: es material para Camila.
- **ENSO ya no es «negativo en toda la región».** En lluvia de temporada hay correlación positiva con ONI en 154 celdas, todas de los países nuevos: Nicaragua 52, Costa Rica 81, Panamá 21. En Guatemala, Honduras, El Salvador y Belice no hay ninguna. La frase «en toda la región» hay que retirarla (Camila ya lo había previsto).
- **ENSO anual:** las celdas significativas pasan de 576 a 1. No es un error. Las 576 compartían el mismo p ajustado (0,0485), pasaban el umbral por 0,0015, y con más celdas ese valor sube a 0,0571. Era un resultado de borde, no robusto (cálculo mío con los valores de `enso_results.csv`).
- **Temporada lluviosa:** en Belice 191 de 192 celdas empiezan en junio, y en Panamá 521 de 614. Nicaragua tiene 688 de 1 076 celdas sin canícula. Detalle en [TEMPORADAS.csv](TEMPORADAS.csv).

## Cómo se corrió (reproducible)

```bash
git fetch origin && git checkout origin/ca/david-datos -- data/ca/rol1
cd pipeline
python 06_enso.py --config config_centroamerica.yaml \
  --cells ../data/ca/rol1/cells.csv --series ../data/ca/rol1/series.csv \
  --oni ../data/rol3/oni.csv --out ../data/ca/rol3
python run_pilot.py --config config_centroamerica.yaml \
  --cells ../data/ca/rol1/cells.csv --series ../data/ca/rol1/series.csv --monthly ../data/ca/rol1/monthly.csv \
  --enso-results ../data/ca/rol3/enso_results.csv --break2014 ../data/ca/rol3/break2014.csv \
  --enso-json ../data/ca/rol3/enso.json --calibration calibration.json \
  --commit $(git rev-parse --short HEAD) --out /tmp/ca/data
cp ../data/ca/rol3/enso.json /tmp/ca/data/enso.json
cp ../rol5-panel-app/public/data/{tour,glossary,decision_rules}.json /tmp/ca/data/
python add_secondary.py --data /tmp/ca/data
python compare_regions.py --old ../rol5-panel-app/public/data --new /tmp/ca/data --md ../docs/ca/COMPARACION.md
python ca_tables.py --data /tmp/ca/data --out ../docs/ca/TABLAS.md
python season_check.py --data /tmp/ca/data --csv ../docs/ca/TEMPORADAS.csv
```

## Para el formulario de Andrés

El borrador `submission-en-ca.md` (rama `ca/andres-producto`) tiene 21 marcas `[PENDING-CA]` y todavía no trae la tabla de resultados. `python pipeline/check_form_ca.py --data <JSON> --form <formulario>` dice exactamente qué no coincide; hoy da 9 de 11 comprobaciones (faltan las marcas y la tabla). Las cifras se copian de [TABLAS.md](TABLAS.md).

## Antes de dar el GO

- [x] Condición 1 y condición 2 de `compare_regions.py`.
- [x] `meta.json` con `data_kind: observed`, DOI, commit real y `frozen: true`.
- [ ] Firma científica de Camila (en especial: ENSO positivo en los países nuevos, y el patrón de 2010–2012 en Costa Rica y Panamá).
- [ ] Vista previa de Elena con este JSON, y QA de Izel.
- [ ] Cotejo del formulario con `check_form_ca.py` sin marcas pendientes.

## Reporte

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| Verifiqué la entrega de David por mi cuenta y corrí el motor con los datos reales | 4 332 celdas, 24 de 24 años en las 12 996 series, 0 diferencias en 145 800 valores anuales y 583 200 mensuales de las 2 025 celdas de antes | |
| Encontré y corregí un defecto de ENSO (0.0 contra -0.0) en dos pasos | `compare_regions.py` pasó de 8 celdas con diferencia, a 1 nueva, a 0. Pruebas de `test_enso.py` en verde | Decidir con calma, después de la entrega, la asimetría heredada (el cero cuenta como positivo) |
| Entregué el zip y los archivos livianos | 4 340 archivos, 4 332 celdas, sin `NaN`, sin celdas faltantes respecto de `grid.json` | GO / NO-GO a las 12:45 |
