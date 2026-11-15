"""Piloto / lote: CSV de Rol 1 y Rol 3 -> JSON del contrato.

  python run_pilot.py --cells cells.csv --series series.csv --out ../rol5-panel-app/public/data
  opcionales: --monthly monthly.csv --enso-results enso_results.csv --break2014 break2014.csv --enso-json enso.json
  sin datos:  python run_pilot.py --synthetic --out /tmp/altaris_demo
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import export, io, synth  # noqa: E402
from altaris.config import load_config  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=str(Path(__file__).with_name("config.yaml")))
    ap.add_argument("--cells"); ap.add_argument("--series"); ap.add_argument("--monthly")
    ap.add_argument("--enso-results"); ap.add_argument("--break2014"); ap.add_argument("--enso-json")
    ap.add_argument("--out", required=True); ap.add_argument("--commit", default="LOCAL")
    ap.add_argument("--calibration"); ap.add_argument("--synthetic", action="store_true"); ap.add_argument("--n-cells", type=int, default=40)
    a = ap.parse_args()
    cfg = load_config(a.config)
    cal = json.loads(Path(a.calibration).read_text(encoding="utf-8")) if a.calibration else None
    if a.synthetic:
        cells, series, _ = synth.make_region(a.n_cells, tuple(cfg["period"]))
        res = export.run(cells, series, cfg, a.out, data_kind="mock", commit=a.commit, calibration=cal)
    else:
        if not (a.cells and a.series):
            ap.error("faltan --cells y --series (o usa --synthetic)")
        res = export.run(
            io.read_cells(a.cells), io.read_series_long(a.series), cfg, a.out,
            monthly=io.read_monthly(a.monthly) if a.monthly else None,
            enso_results=io.read_enso_results(a.enso_results) if a.enso_results else None,
            breaks=io.read_break2014(a.break2014) if a.break2014 else None,
            enso_phase=io.read_enso_json(a.enso_json) if a.enso_json else None, commit=a.commit, calibration=cal)
    print(res)


if __name__ == "__main__":
    main()
