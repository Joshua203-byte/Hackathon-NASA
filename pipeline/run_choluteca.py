"""Reproduce the observed single-cell integration pilot without replacing demo fixtures."""
import csv
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/rol1/piloto_choluteca"
OUTPUT = ROOT / "rol5-panel-app/public/data/pilot"


def main():
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    subprocess.run([
        sys.executable, str(ROOT / "pipeline/run_pilot.py"),
        "--cells", str(SOURCE / "cells.csv"),
        "--series", str(SOURCE / "series.csv"),
        "--monthly", str(SOURCE / "monthly.csv"),
        "--commit", commit, "--out", str(OUTPUT),
    ], check=True, cwd=ROOT)
    meta_path = OUTPUT / "meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    meta["analysis_scope"] = {
        "kind": "single_cell_pilot", "n_cells": 1,
        "pending": ["regional_fdr", "enso", "break_2014", "calibration", "threshold_freeze"],
        "note": {
            "es": "Piloto observado de Choluteca, 2001–2024, una celda. El ajuste FDR cubre solo esta celda y coincide con p; falta el ajuste regional. ENSO, chequeo de 2014, calibración y congelación de umbrales pendientes. Veredictos provisionales.",
            "en": "Observed Choluteca pilot, 2001–2024, one cell. FDR covers this cell only and equals p; regional adjustment is pending. ENSO, the 2014 check, calibration and threshold freeze are pending. Verdicts are provisional.",
        },
    }
    meta["aux_data"] = ["Natural Earth (cell location and country mask)"]
    meta["source_files"] = [str((SOURCE / name).relative_to(ROOT)).replace("\\", "/") for name in ("cells.csv", "series.csv", "monthly.csv")]
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    subprocess.run([sys.executable, str(ROOT / "pipeline/10_narrate.py"), str(OUTPUT)], check=True)
    cell = json.loads((OUTPUT / "cells/N1335W08715.json").read_text(encoding="utf-8"))
    with (SOURCE / "series.csv").open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    for key, data in cell["indicators"].items():
        expected = {int(r["year"]): float(r["value"]) for r in rows if r["indicator"] == key and r["value"]}
        assert all(abs(p["value"] - expected[p["year"]]) <= .051 for p in data["series"])
        assert len(data["series"]) == len(expected) == 24
        s = data["statistics"]
        print(key, s["slope_per_decade"], s["ci_95"], s["p_value"], data["verdict"])


if __name__ == "__main__":
    main()
