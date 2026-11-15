"""ENSO y salto 2014 para todas las celdas (Rol 3). Produce en --out:
  enso_results.csv, break2014.csv, enso.json (formato del panel + `by_indicator`), resumen.txt

  python 06_enso.py --cells ../data/rol1/cells.csv --series ../data/rol1/series.csv \
      --oni ../data/rol3/oni.csv --out ../data/rol3
"""
import argparse
import csv
import json
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import analyze, enso, io, stats  # noqa: E402
from altaris.config import load_config  # noqa: E402

try:
    from joblib import Parallel, delayed
except ImportError:
    Parallel = None


def one(cell, key, ys, vs, oni_ind, cfg):
    ys, vs = analyze.align_to_period(ys, vs, tuple(cfg["period"]))
    base = stats.sen_slope(ys, vs, cfg["stats"]["confidence"])
    r, p = enso.spearman(ys, vs, oni_ind)
    t = enso.enso_test(ys, vs, oni_ind, base, cfg)
    cp, pp = enso.pettitt(ys, vs)
    return cell, key, r, p, t, cp, pp


def fmt(x, nd=4):
    return "" if x is None or (isinstance(x, float) and not math.isfinite(x)) else round(x, nd)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=str(Path(__file__).with_name("config.yaml")))
    ap.add_argument("--cells", required=True); ap.add_argument("--series", required=True)
    ap.add_argument("--oni", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--jobs", type=int, default=-1)
    a = ap.parse_args()
    cfg = load_config(a.config)
    years = list(range(cfg["period"][0], cfg["period"][1] + 1))
    oni = enso.load_oni(a.oni)
    keys = list(cfg["indicators"])
    oni_ind = {k: enso.oni_for_indicator(oni, k, years) for k in keys}
    series = io.read_series_long(a.series)
    ids = [c["id"] for c in io.read_cells(a.cells)]
    todo = [(c, k) for c in ids for k in keys if k in series.get(c, {})]
    args = [(c, k, *series[c][k], oni_ind[k], cfg) for c, k in todo]
    res = (Parallel(n_jobs=a.jobs)(delayed(one)(*x) for x in args) if Parallel and a.jobs != 1
           else [one(*x) for x in args])

    # FDR del Spearman por indicador entre celdas
    pf = {}
    for k in keys:
        rows = [(c, p) for c, kk, r, p, *_ in res if kk == k]
        adj = stats.fdr_adjust([p for _, p in rows])
        pf.update({(c, k): float(v) for (c, _), v in zip(rows, adj)})

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    surv = {k: [0, 0, 0] for k in keys}   # [si, no, pendiente]
    brk = {k: [0, 0] for k in keys}
    with open(out / "enso_results.csv", "w", newline="", encoding="utf-8") as f1, \
         open(out / "break2014.csv", "w", newline="", encoding="utf-8") as f2:
        w1, w2 = csv.writer(f1), csv.writer(f2)
        w1.writerow(["cell_id", "indicator", "enso_r", "enso_p_fdr", "survives", "slope_without_strong_enso",
                     "p_without_strong_enso", "slope_oni_removed", "p_oni_removed"])
        w2.writerow(["cell_id", "indicator", "pettitt_year", "p", "flag"])
        for c, k, r, p, t, cp, pp in res:
            s = t["survives"]
            w1.writerow([c, k, fmt(r, 3), fmt(pf.get((c, k)), 5), "" if s is None else str(s).lower(),
                         fmt(t["slope_without_strong_enso"], 3), fmt(t["p_without_strong_enso"], 5),
                         fmt(t["slope_oni_removed"], 3), fmt(t["p_oni_removed"], 5)])
            fl = enso.break_flag(cp, pp)
            w2.writerow([c, k, "" if cp is None else cp, fmt(pp, 5), str(fl).lower()])
            surv[k][2 if s is None else (0 if s else 1)] += 1
            brk[k][0 if fl else 1] += 1

    byi = {}
    for k in keys:
        byi[k] = {str(y): {"phase": enso.phase(v), "strong": enso.is_strong(v), "oni": round(v, 3)}
                  for y, v in oni_ind[k].items()}
    doc = {"years": byi["may_oct_mm"], "by_indicator": byi, "source": "NOAA CPC ONI (ver data/rol3/oni_provenance.md)",
           "note": "`years` usa el indicador may_oct_mm; `by_indicator` trae la fase de cada indicador."}
    (out / "enso.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")

    lines = ["ENSO y salto 2014 — resumen", ""]
    for k in keys:
        n = sum(surv[k])
        lines.append(f"{k}: sobrevive ENSO {surv[k][0]} | no sobrevive {surv[k][1]} | pendiente {surv[k][2]} (de {n}); "
                     f"bandera 2014 en {brk[k][0]} de {sum(brk[k])} ({100 * brk[k][0] / max(1, sum(brk[k])):.1f} %)")
    for k in keys:
        yrs = ", ".join(f"{y}:{v['phase']}{'*' if v['strong'] else ''}" for y, v in byi[k].items())
        lines.append(f"\nFases {k} (* = fuerte):\n{yrs}")
    (out / "resumen.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines[:2 + len(keys)]))


if __name__ == "__main__":
    main()
