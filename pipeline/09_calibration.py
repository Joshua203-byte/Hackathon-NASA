"""Calibración del motor con verdad conocida (plan 4.7).

Simula `n_sim` series por escenario y las pasa por el MISMO motor (con FDR a través de las series):
  - ruido sin tendencia  -> tasa de falsos positivos (consistente / limitada o más)
  - tendencia inyectada  -> potencia (se detecta como consistente / limitada o más)
Escribe calibration.json con la forma que espera meta.json -> calibration.
Los controles ENSO y 2014 no se simulan aquí: quedan "pendientes" y no bloquean (esto da la POTENCIA máxima
y los falsos positivos de la parte estadística; el resto solo puede bajar el veredicto).

  python 09_calibration.py --n-sim 1000 --out calibration.json
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import analyze, stats, synth  # noqa: E402
from altaris.config import load_config  # noqa: E402

try:
    from joblib import Parallel, delayed
except ImportError:  # sin joblib: serial
    Parallel = None


def _one(seed, years, trend, cfg, ar1):
    rng = np.random.default_rng(seed)
    vals = synth.make_series(rng, years, 1000.0, 0.12, trend, ar1)
    return analyze.analyze_indicator("may_oct_mm", years, vals, cfg)


def scenario(trend, n, cfg, seed, ar1=0.1):
    years = list(range(cfg["period"][0], cfg["period"][1] + 1))
    seeds = np.random.SeedSequence(seed).generate_state(n)
    if Parallel:
        ana = Parallel(n_jobs=-1)(delayed(_one)(int(s), years, trend, cfg, ar1) for s in seeds)
    else:
        ana = [_one(int(s), years, trend, cfg, ar1) for s in seeds]
    adj = stats.fdr_adjust([a.mk.p for a in ana], cfg["stats"]["fdr"]["method"])
    cons = lim = 0
    for a, pf in zip(ana, adj):
        b = analyze.build_indicator(a, cfg, "mm", p_fdr=float(pf) if np.isfinite(pf) else None)
        cons += b["verdict"] == "consistente"
        lim += b["verdict"] in ("consistente", "limitada")
    return cons / n, lim / n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=str(Path(__file__).with_name("config.yaml")))
    ap.add_argument("--n-sim", type=int)
    ap.add_argument("--out", default="calibration.json")
    a = ap.parse_args()
    cfg = load_config(a.config)
    cal = cfg["calibration"]
    n, seed = a.n_sim or cal["n_sim"], cal["seed"]
    fp_c, fp_l = scenario(0.0, n, cfg, seed)
    power = []
    for i, t in enumerate(cal["injected_trends"]):
        c, l = scenario(t, n, cfg, seed + 1 + i)
        power.append({"injected_trend_pct_per_decade": round(t * 100, 1),
                      "detected_consistente": round(c, 3), "detected_limitada_o_mas": round(l, 3)})
    res = {"n_sim": n, "seed": seed,
           "false_positive_rate": {"consistente": round(fp_c, 4), "limitada": round(fp_l, 4)},
           "power": power[0], "power_all": power}
    Path(a.out).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
