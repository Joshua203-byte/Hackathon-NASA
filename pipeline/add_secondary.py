"""Añade la segunda variable de NASA POWER (temperatura y radiación) a cells/{id}.json.

Lee la salida de `04_power.py` (por defecto `data/rol1/power_casos/`, los 3 casos de Camila) y
escribe `secondary_variables` en cada celda, con el formato que espera el panel
(rol5-panel-app/INTEGRACION.md, sección "Segunda variable y matriz P2").

- La pendiente de Sen y Mann-Kendall salen de `altaris.stats`, igual que en `04_power.py`.
  El script comprueba que coincidan con `power_trends.csv` antes de escribir.
- No hay veredicto: es una prueba en un solo punto, sin FDR, huella ni control ENSO.
  `verdict` queda en null y el panel no muestra ninguno.
- No toca los indicadores de lluvia ni ningún otro campo de la celda.
- Es idempotente: reemplaza `secondary_variables` si ya existía.

Hay que volver a correrlo después de regenerar el JSON (docs/06, sección 6):

    python pipeline/add_secondary.py --data rol5-panel-app/public/data
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from altaris import stats  # noqa: E402
from altaris.config import load_config  # noqa: E402

# Variables de temporada (may–oct): es la ventana de los 3 casos y del indicador por defecto.
VARIABLES = {
    "t2m_may_oct_mean_C": {
        "key": "T2M_MAY_OCT",
        "param": "T2M",
        "units": "°C",
        "label": {"es": "Temperatura a 2 m, media de mayo a octubre", "en": "2 m temperature, May–October mean"},
    },
    "allsky_may_oct_mean_MJ_m2_day": {
        "key": "ALLSKY_MAY_OCT",
        "param": "ALLSKY_SFC_SW_DWN",
        "units": "MJ/m²/d",
        "label": {"es": "Radiación solar en superficie, media de mayo a octubre", "en": "Surface solar radiation, May–October mean"},
    },
}
PRODUCT = {"T2M": "MERRA-2", "ALLSKY_SFC_SW_DWN": "CERES SYN1deg"}
LIMITATIONS = [
    "NASA POWER es un producto de reanálisis y satélite de resolución gruesa (~0,5°), no la celda de 0,1° de IMERG.",
    "Prueba de Mann-Kendall en un solo punto: sin corrección FDR, sin huella de ventanas y sin control ENSO. No tiene veredicto.",
    "La matriz con la lluvia muestra asociación entre años, no causa.",
]


def r(x: float, d: int):
    return None if x is None or not math.isfinite(x) else round(float(x), d)


def sig(x: float):
    return None if x is None or not math.isfinite(x) else float(f"{x:.4g}")


def read_csv(path: Path):
    with path.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def build(cell_id: str, var: str, rows: list[dict], trends: dict, prov: dict, rain_enso: dict, cfg: dict) -> dict:
    spec = VARIABLES[var]
    years = [int(x["year"]) for x in rows]
    values = [None if x["value"] in ("", "nan", "NaN") else float(x["value"]) for x in rows]
    ys = np.array(years, float)
    vs = np.array([np.nan if v is None else v for v in values], float)
    sen = stats.sen_slope(ys, vs, confidence=cfg["stats"]["confidence"])
    mk = stats.mann_kendall(ys, vs, sen=sen, lag1_z=cfg["stats"]["lag1_z"])

    t = trends.get((cell_id, var))
    if t is None:
        raise SystemExit(f"{cell_id} {var}: falta en power_trends.csv")
    for got, want, name in [(sen.slope_dec, t["slope_per_decade"], "pendiente"), (sen.ci_low_dec, t["ci_low"], "IC bajo"),
                            (sen.ci_high_dec, t["ci_high"], "IC alto"), (mk.p, t["p_value"], "p")]:
        if abs(got - float(want)) > max(1e-3, 1e-3 * abs(float(want))):
            raise SystemExit(f"{cell_id} {var}: {name} {got:.4f} no coincide con power_trends.csv ({want})")
    if mk.variant != t["mk_variant"]:
        raise SystemExit(f"{cell_id} {var}: variante {mk.variant} distinta de power_trends.csv ({t['mk_variant']})")

    mean = float(np.nanmean(vs))
    req = next(q for q in prov["requests"] if q["cell_id"] == cell_id)
    lon, lat = req["power_grid_point"][:2]
    return {
        "key": spec["key"],
        "label": spec["label"],
        "source": f"NASA POWER Monthly API {req['api_version']} · {spec['param']} ({PRODUCT[spec['param']]}) · punto {lat}, {lon} · consulta {prov['accessed'][:10]}",
        "doi": "",
        "period": [min(years), max(years)],
        "data": {
            "units": spec["units"],
            "series": [{"year": y, "value": r(v, 3), "anomaly": None if v is None else r(v - mean, 3), "enso": rain_enso.get(y)}
                       for y, v in zip(years, values)],
            "statistics": {
                "method": "Theil-Sen + Mann-Kendall",
                "mk_variant": mk.variant,
                "lag1_autocorr": r(mk.lag1, 3),
                "slope_per_decade": r(sen.slope_dec, 3),
                "intercept": r(sen.intercept, 3),
                "ci_95": [r(sen.ci_low_dec, 3), r(sen.ci_high_dec, 3)],
                "p_value": sig(mk.p),
                "adjusted_p_fdr": None,
            },
            "footprint": [],
            "window_results": {},
            "enso_test": None,
            "break_2014": None,
            "verdict": None,
            "verdict_reasons": [],
            "narrative": None,
            "limitations": LIMITATIONS,
        },
    }


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", required=True, help="carpeta con cells/ (p. ej. rol5-panel-app/public/data)")
    ap.add_argument("--power", default=str(ROOT.parent / "data" / "rol1" / "power_casos"), help="salida de 04_power.py")
    ap.add_argument("--config", default=str(ROOT / "config.yaml"))
    a = ap.parse_args(argv)

    cfg = load_config(a.config)
    power = Path(a.power)
    prov = json.loads((power / "provenance.json").read_text(encoding="utf-8"))
    trends = {(t["cell_id"], t["indicator"]): t for t in read_csv(power / "power_trends.csv")}
    series: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in read_csv(power / "power_series.csv"):
        if row["indicator"] in VARIABLES:
            series[(row["cell_id"], row["indicator"])].append(row)

    cells = sorted({c for c, _ in series})
    for cell_id in cells:
        path = Path(a.data) / "cells" / f"{cell_id}.json"
        if not path.exists():
            raise SystemExit(f"No existe {path}")
        detail = json.loads(path.read_text(encoding="utf-8"))
        rain = detail["indicators"].get("may_oct_mm") or next(iter(detail["indicators"].values()))
        rain_enso = {p["year"]: p.get("enso") for p in rain["series"]}
        detail["secondary_variables"] = [
            build(cell_id, var, sorted(series[(cell_id, var)], key=lambda x: int(x["year"])), trends, prov, rain_enso, cfg)
            for var in VARIABLES if (cell_id, var) in series
        ]
        path.write_text(json.dumps(detail, ensure_ascii=False), encoding="utf-8")
        summary = ", ".join(f"{v['key']} {v['data']['statistics']['slope_per_decade']:+} {v['data']['units']}/déc (p {v['data']['statistics']['p_value']})"
                            for v in detail["secondary_variables"])
        print(f"{cell_id}: {summary}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
