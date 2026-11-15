# pipeline/ — Motor estadístico de ALTARIS (Rol 2 · Joshua)

Entra: series anuales por celda (de Rol 1) y resultados ENSO / salto 2014 (de Rol 3).
Sale: `meta.json`, `grid.json`, `cells/{id}.json`, `reasons.json` en el contrato del plan (sección 3.2), que lee el panel de Rol 5.
Sin ML, sin predicción: Theil-Sen + Mann-Kendall (Hamed-Rao si hay autocorrelación positiva significativa) + FDR de Benjamini-Hochberg + huella de estabilidad.

## Uso
```bash
pip install -r requirements.txt
python -m pytest tests -q                                   # 57 pruebas
python run_pilot.py --synthetic --out /tmp/demo             # sin datos reales: JSON de prueba (data_kind "mock")
python 09_calibration.py --n-sim 1000 --out calibration.json  # falsos positivos y potencia
python run_pilot.py --cells cells.csv --series series.csv \
    --monthly monthly.csv --enso-results enso_results.csv --break2014 break2014.csv \
    --enso-json enso.json --calibration calibration.json --commit $(git rev-parse --short HEAD) \
    --out ../rol5-panel-app/public/data
```
`run_batch.py` es el mismo programa (para el lote completo). Los umbrales viven en `config.yaml` y se congelan (`frozen: true`) en un commit ANTES de correr la región.

## Formatos de entrada (CSV, UTF-8, vacío = dato faltante; nunca se rellena con 0)
| Archivo | Columnas | Quién |
|---|---|---|
| `cells.csv` | `cell_id,lat,lon,country` (id tipo `N1345W08815`) | Rol 1 |
| `series.csv` | `cell_id,indicator,year,value` (indicator ∈ `may_oct_mm, jul_aug_mm, annual_mm`, en mm) | Rol 1 |
| `monthly.csv` (opcional) | `cell_id,year,month,mm` (mm/mes, ya con días reales) → climatología y canícula | Rol 1 |
| `enso_results.csv` | `cell_id,indicator,enso_r,enso_p_fdr,survives,slope_without_strong_enso,p_without_strong_enso,slope_oni_removed,p_oni_removed` | Rol 3 |
| `break2014.csv` | `cell_id,indicator,pettitt_year,p,flag` | Rol 3 |
| `enso.json` | `{"years": {"2001": {"phase": "nino\|nina\|neutral", "strong": false}}}` | Rol 3 |

Si faltan ENSO o 2014, el veredicto lo anota como pendiente (`enso_pendiente`, `chequeo_2014_pendiente`) y no bloquea; el FDR siempre se calcula aquí. Sin FDR no hay `consistente`.

## Veredicto (config.yaml → verdict)
`incompleta` (faltan más de 2 años) → `consistente` (FDR < 0.05, IC sin cero, ≥90 % de ventanas ≥15 años con el mismo signo, ≥50 % significativas, sobrevive ENSO, sin salto 2014) → `limitada` → `sin_evidencia`. Un posible salto 2014 limita a `limitada`.
Por ventana el techo es `limitada`: una ventana sola no tiene FDR entre celdas, ni ENSO, ni huella propia. El periodo completo hereda el veredicto base.
Cada veredicto trae códigos de razón (`reasons.json`, es/en) para que el panel los traduzca.

## Estructura
`altaris/stats.py` (Sen, MK, huella, FDR) · `verdict.py` · `reasons.py` · `indicators.py` (mm/h→mm, indicadores, canícula) · `analyze.py` · `export.py` · `io.py` · `synth.py` (datos sintéticos) · `tests/`.
