# Pipeline ALTARIS: motor estadístico y veredicto (Rol 2)

## Instalación

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r pipeline/requirements.txt   # Windows
# .venv/bin/python -m pip install -r pipeline/requirements.txt     # macOS / Linux
```

## Un comando

```bash
python pipeline/run_all.py                 # datos reales en data/interim/
python pipeline/run_all.py --synthetic     # datos inventados en data/synthetic/
python -m pytest                           # pruebas (desde la raíz del repo)
```

`run_all.py` corre 04 → 05 → 08 → 09 → 11. Cada paso también se puede correr solo (`python pipeline/04_trends.py`, etc.).
Para que dos corridas den un `meta.json` idéntico, pasar `--generated-at 2026-11-15T12:00:00-06:00`.

| Script | Hace | Salida |
|---|---|---|
| `make_synthetic.py` | 5 celdas **inventadas** para que la web arranque | `data/synthetic/*.csv` |
| `04_trends.py` | Sen + IC 95 %, Mann-Kendall (original / Hamed-Rao / TFPW), FDR por indicador | `trends.csv` |
| `05_footprint.py` | Huella: Sen + MK en las 120 ventanas de ≥10 años | `footprint.json`, `footprint_summary.csv` |
| `08_verdict.py` | Veredicto + razones + etiqueta `alta_variabilidad`; tabla resumen para Rol 6 | `verdicts.csv`, `verdict_summary.csv` |
| `09_calibration.py` | Falsos positivos y potencia (series barajadas, tendencia inyectada) | `calibration.json` |
| `11_export_json.py` | Contrato de la sección 3.2 | `web/public/data/{meta,grid}.json`, `cells/{id}.json` |

## Lo que necesito de Rol 1 y Rol 3

Todo va en `data/interim/` (las rutas están en `config.yaml → paths`). Los opcionales pueden faltar: el pipeline corre igual y lo marca como pendiente.

| Archivo | De | Columnas | Obligatorio |
|---|---|---|---|
| `cells.csv` | Rol 1 | `id, lat, lon, country` (+ `name`, `canicula` opcionales) | Sí |
| `indicators.csv` **o** `indicators.nc` | Rol 1 | CSV largo: `id, indicator, year, value` (NaN = año no válido; **nunca 0**) | Sí |
| `climatology.csv` | Rol 1 | `id, m1 … m12` (mm/mes medios) | No |
| `break_2014.csv` | Rol 1 (P1) | `id, indicator, pettitt_year, p, flag` | No → razón `salto_2014_pendiente` |
| `enso_test.csv` | Rol 3 | `id, indicator, enso_r, enso_p_fdr, slope_without_strong_enso, p_without_strong_enso, slope_oni_removed, p_oni_removed, survives` | No → razón `enso_pendiente` |
| `enso_phases.csv` | Rol 3 | `year, indicator, oni, phase (nino/nina/neutral), strong` | No |
| `narratives.json` | Rol 6 | `{"<id>\|<indicador>": {"es", "en", "generated_by"}}` | No → plantilla |

`indicators.nc`: una variable por indicador (`may_oct_mm`, `jul_aug_mm`, `annual_mm`) con dimensiones `(year, cell)` y coordenada `cell` = id, o `(year, lat, lon)`, en cuyo caso el id se arma con la regla `N1345W08815`.

## Campos que se añadieron al contrato de la sección 3.2

Todos son añadidos: no se quitó ni se renombró nada.

- `grid.json` → celda: `canicula`. Indicador: `tags` (p. ej. `["alta_variabilidad"]`).
- `cells/{id}.json` → `lat`, `lon`, `country`, `canicula`. Por indicador: `mean`, `valid_years`, `n_years`, `tags`; en `statistics`: `intercept_year`, `sign_agreement`, `sig_fraction`, `cv`; en cada año de `series`: `enso_strong`.
- `statistics.intercept` es el valor de la recta de Sen en `intercept_year` (el primer año del periodo): `y(año) = intercept + slope_per_decade/10 × (año − intercept_year)`.
- `mk_variant` puede valer `original`, `hamed_rao` o `tfpw` (respaldo cuando Hamed-Rao da una varianza negativa).
- `limitations` y `verdict_reasons` son **claves fijas** que la web traduce (ES/EN). Ver `altaris/verdict.py → REASONS` y `altaris/steps.py → GENERAL_LIMITATIONS`.
- `meta.json`: `synthetic`, `indicator_info`, `threshold_changes`, `inputs_available`, `recipe` (la receta reproducible del pasaporte) y `calibration.power_all`.
