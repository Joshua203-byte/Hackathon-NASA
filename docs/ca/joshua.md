# Joshua · Rol 2 · Motor · Centroamérica

**Rama:** `ca/joshua-motor`  ·  **Hora meta:** 12:00  ·  Plan completo: [docs/10-centroamerica.md](../10-centroamerica.md)

## Estado a las 10:20

Todo lo que se podía hacer **sin los datos reales de David** está hecho y probado con datos simulados. Falta correr el motor sobre los CSV reales (comandos abajo).

| Tarea | Estado | Dónde |
|---|---|---|
| Comparación entre regiones | Hecho | `pipeline/compare_regions.py` |
| Tablas para el formulario | Hecho | `pipeline/ca_tables.py` |
| Cotejo del formulario de Centroamérica | Hecho | `pipeline/check_form_ca.py` |
| Ensayo de punta a punta con 7 países simulados | Hecho (sección «Lo medido») | `pipeline/make_ca_mock.py --csv-out` |
| Correr el motor sobre los datos reales | **Pendiente de David (C1)** | comandos abajo |
| Zip del JSON y comparación real | Pendiente | — |

## Qué hace cada herramienta

**`compare_regions.py --old <JSON actual> --new <JSON nuevo> [--md informe.md]`**: compara las celdas que están en las dos exportaciones.

- **Condición 1 del GO:** todo lo que es por celda (serie, media, pendiente, intervalo, p, huella, ventanas, ENSO, salto de 2014) debe ser **idéntico**.
- **Condición 2:** lo único que puede cambiar es el p ajustado (FDR) y, por él, el veredicto. Todo cambio de veredicto debe cruzar el umbral de FDR; si no lo cruza sale como **NO EXPLICADO**. También exige que los 3 casos no cambien.
- Sale con código 0 si las dos se cumplen y 1 si no.

**`ca_tables.py --data <JSON> [--lang en|es] [--out archivo]`**: tablas en Markdown de celdas por país, veredictos por país e indicador, banderas de 2014, pendientes, ENSO, celdas `consistente` y calibración. Avisa en grande si los datos no son `observed`.

**`check_form_ca.py --data <JSON> --form <formulario.md>`**: lee las cifras del formulario y las compara con el JSON: tabla de resultados, menciones de «N cells», países, DOI, banderas de 2014 (por país o de toda la región), pendientes negativas y calibración. Detecta marcas `[PENDING-CA]` sin rellenar y **rechaza datos que no sean `observed`**. Sale con 1 si algo no coincide. Con el formulario actual de 3 países: 27 de 27 comprobaciones; con 3 cifras alteradas a propósito: detecta las 3.

## Lo medido (datos SIMULADOS, esta máquina de 4 núcleos)

| Paso | Celdas | Tiempo |
|---|---|---|
| Generar los CSV de entrada | 1 196 | 1,7 s |
| `06_enso.py` (ENSO + salto de 2014) | 1 196 | 6 s |
| `run_pilot.py` (motor completo, con mensuales) | 1 196 | **139 s** (0,12 s por celda) |
| `run_pilot.py` | 506 (los 3 países de antes) | 58 s |

- **Extrapolación a ~4 300 celdas:** unos **8 minutos** con la velocidad medida aquí. La nota de Rol 1 decía ~12 minutos para las 2 025 celdas reales, lo que sería unos 26 minutos para 4 300. **Cuenta con un rango de 8 a 26 minutos** hasta que se mida con datos reales.
- **El ensayo cumple las dos condiciones:** al pasar de 506 a 1 196 celdas, lo por celda coincide en las 506 comunes y los 3 cambios de veredicto (`limitada` → `consistente`) cruzan el umbral de FDR (p ajustado 0,061 → 0,046). Los umbrales son idénticos en las dos exportaciones.
- **Esto NO es un resultado científico.** Las series son inventadas. Solo prueba que las herramientas, los formatos y el flujo funcionan.

## Cuando David entregue (C1)

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
```

`add_secondary.py` termina con código 1 si falta alguna de las 3 celdas de los casos (comprobado). Con los datos reales están las tres; con el simulado submuestreado no, y es esperable. Con las tres celdas reales de `main` corre bien (comprobado).

Luego, la comparación, las tablas y la temporada:

```bash
python compare_regions.py --old ../rol5-panel-app/public/data --new /tmp/ca/data --md ../docs/ca/COMPARACION.md
python ca_tables.py --data /tmp/ca/data --out ../docs/ca/TABLAS.md
python season_check.py --data /tmp/ca/data
(cd /tmp/ca && zip -r altaris_ca_json.zip data)      # se manda por el chat; NO se sube al repositorio
```

**Qué subir a esta rama:** `data/ca/rol3/*.csv` y `enso.json`, `data/ca/json-light/` (copia de `meta.json`, `grid.json`, `reasons.json` y `verdict_summary.csv`), `docs/ca/COMPARACION.md`, `docs/ca/TABLAS.md` y este reporte actualizado.

**Antes de dar el GO**, comprobar que `meta.json` de la exportación nueva diga `data_kind: observed`, tenga el DOI y el commit real (no `MOCK`) y `frozen: true`.

## Reporte (a llenar con los datos reales)

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| | | |
