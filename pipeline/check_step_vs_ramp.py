"""Escalón o rampa en las celdas `consistente` (revisión de Rol 3, docs/08, decisión 1).

Para cada serie `consistente` compara dos modelos por BIC:
  rampa    recta por mínimos cuadrados (2 parámetros)
  escalón  dos medias con el mejor año de corte (3 parámetros)
Diferencia de BIC > 2 a favor de uno = "rampa" o "escalón"; si no, "indistinguible".
Es un chequeo de lectura, no entra en el veredicto.

  python check_step_vs_ramp.py --data ../rol5-panel-app/public/data
"""
from __future__ import annotations

import argparse
import collections
import json
from pathlib import Path

import numpy as np


def classify(t: np.ndarray, y: np.ndarray) -> tuple[str, int, float]:
    n = len(y)
    a = np.vstack([t, np.ones(n)]).T
    rss_l = float(((y - a @ np.linalg.lstsq(a, y, rcond=None)[0]) ** 2).sum())
    rss_s, cut = min((((y[:k] - y[:k].mean()) ** 2).sum() + ((y[k:] - y[k:].mean()) ** 2).sum(), int(t[k]))
                     for k in range(3, n - 2))
    bic_l = n * np.log(rss_l / n) + 2 * np.log(n)
    bic_s = n * np.log(rss_s / n) + 3 * np.log(n)
    d = bic_l - bic_s
    return ("escalon" if d > 2 else "rampa" if d < -2 else "indistinguible"), cut, round(float(d), 1)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", required=True, help="carpeta con cells/*.json")
    ap.add_argument("--indicators", nargs="+", default=["may_oct_mm", "annual_mm"])
    a = ap.parse_args()

    tally = collections.Counter()
    for f in sorted(Path(a.data, "cells").glob("*.json")):
        cell = json.loads(f.read_text(encoding="utf-8"))
        for key in a.indicators:
            x = cell["indicators"].get(key)
            if not x or x["verdict"] != "consistente":
                continue
            pts = [(p["year"], p["value"]) for p in x["series"] if p["value"] is not None]
            t, y = (np.array(v, float) for v in zip(*pts))
            kind, _, _ = classify(t, y)
            tally[(key, x["break_2014"]["pettitt_year"], kind)] += 1

    print("indicador | año Pettitt | modelo | celdas")
    for (key, yr, kind), n in sorted(tally.items()):
        print(f"{key} | {yr} | {kind} | {n}")


if __name__ == "__main__":
    main()
