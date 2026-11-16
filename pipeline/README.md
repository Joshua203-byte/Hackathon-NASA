# pipeline/ — ALTARIS statistical engine

Input: yearly series per grid cell (from the data step) and ENSO / 2014-break results.
Output: `meta.json`, `grid.json`, `cells/{id}.json`, `reasons.json`, following the data contract read by the web panel.
No machine learning and no prediction: Theil–Sen slope + Mann–Kendall (Hamed–Rao when there is significant positive autocorrelation) + Benjamini–Hochberg FDR + a stability "footprint" over all year windows.

## Usage
```bash
pip install -r requirements.txt
python -m pytest tests -q                                   # 70 tests
python run_pilot.py --synthetic --out /tmp/demo             # no real data: test JSON (data_kind "mock")
python 09_calibration.py --n-sim 1000 --out calibration.json  # false positives and power
python run_pilot.py --cells cells.csv --series series.csv \
    --monthly monthly.csv --enso-results enso_results.csv --break2014 break2014.csv \
    --enso-json enso.json --calibration calibration.json --commit $(git rev-parse --short HEAD) \
    --out ../rol5-panel-app/public/data
```
`run_batch.py` is the same program (for the full batch). Thresholds live in `config.yaml` and are frozen (`frozen: true`) in a commit BEFORE the region is run.

## Input formats (CSV, UTF-8, empty = missing value; never filled with 0)
| File | Columns | Produced by |
|---|---|---|
| `cells.csv` | `cell_id,lat,lon,country` (id like `N1345W08815`) | data step |
| `series.csv` | `cell_id,indicator,year,value` (indicator ∈ `may_oct_mm, jul_aug_mm, annual_mm`, in mm) | data step |
| `monthly.csv` (optional) | `cell_id,year,month,mm` (mm/month, already using real days) → climatology and mid-summer drought | data step |
| `enso_results.csv` | `cell_id,indicator,enso_r,enso_p_fdr,survives,slope_without_strong_enso,p_without_strong_enso,slope_oni_removed,p_oni_removed` | ENSO step |
| `break2014.csv` | `cell_id,indicator,pettitt_year,p,flag` | ENSO step |
| `enso.json` | `{"years": {"2001": {"phase": "nino\|nina\|neutral", "strong": false}}}` | ENSO step |

If ENSO or 2014 results are missing, the verdict records them as pending (`enso_pendiente`, `chequeo_2014_pendiente`) and does not block; the FDR is always computed here. Without FDR there is no `consistente` verdict.

## Verdict (config.yaml → verdict)
Internal labels (shown to users as "Incomplete data", "Consistent evidence", "Limited evidence", "No evidence of a trend"):
`incompleta` (more than 2 years missing) → `consistente` (FDR < 0.05, CI excludes zero, ≥ 90 % of windows of ≥ 15 years with the same sign, ≥ 50 % significant, survives ENSO, no 2014 break) → `limitada` → `sin_evidencia`. A possible 2014 break caps the verdict at `limitada`.
For a single window the ceiling is `limitada`: one window alone has no FDR across cells, no ENSO test and no footprint of its own. The full period inherits the base verdict.
Each verdict carries reason codes (`reasons.json`, Spanish/English) so that the panel can translate them.

## Structure
`altaris/stats.py` (Sen, MK, footprint, FDR) · `verdict.py` · `reasons.py` · `indicators.py` (mm/h→mm, indicators, mid-summer drought) · `analyze.py` · `export.py` · `io.py` · `synth.py` (synthetic data) · `tests/`.
