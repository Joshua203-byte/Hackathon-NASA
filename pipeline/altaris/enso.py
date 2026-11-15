"""Rol 3 (hecho por Joshua con Claude para destrabar el pipeline): ENSO y salto 2014. Plan, secciones 4.5 y 4.10.

- ONI (NOAA CPC): promedio anual del indicador segun las temporadas trimestrales que lo cubren.
- Fase: Niño si >= +0.5, Niña si <= -0.5, neutral en otro caso; "fuerte" si |ONI| >= 1.0.
- Respuesta: Spearman lluvia-ONI por celda, FDR por indicador entre celdas.
- Prueba ENSO de la tendencia, dos variantes (se guardan ambas):
    1) sin los años ENSO fuertes: Sen + Mann-Kendall;
    2) residuos de la regresion lineal lluvia ~ ONI: Sen + Mann-Kendall.
  survives = True si en AMBAS variantes la pendiente conserva el signo del periodo base y queda dentro de su IC 95 %.
  (Criterio conservador: el plan dice "la pendiente"; aqui se exige a las dos.)
- Salto 2014: prueba de Pettitt (aproximacion de Pettitt 1979). flag si el cambio cae en 2013-2015 con p < 0.05.
"""
from __future__ import annotations

import csv
import math
from pathlib import Path

import numpy as np
from scipy import stats as sst

from . import stats

PHASE_THRESHOLD = 0.5
STRONG_THRESHOLD = 1.0
SEASONS = ["DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS", "ASO", "SON", "OND", "NDJ"]
# trimestres moviles que cubren cada indicador (plan 4.5)
INDICATOR_SEASONS = {
    "may_oct_mm": ["MJJ", "JJA", "JAS", "ASO"],
    "jul_aug_mm": ["JJA"],
    "annual_mm": SEASONS,
}
BREAK_YEARS = (2013, 2014, 2015)
BREAK_ALPHA = 0.05
MIN_YEARS_AFTER_REMOVAL = 10


def load_oni(path) -> dict[int, dict[str, float]]:
    out: dict[int, dict[str, float]] = {}
    with open(path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            out.setdefault(int(r["year"]), {})[r["season"]] = float(r["anom"])
    return out


def oni_for_indicator(oni: dict[int, dict[str, float]], key: str, years) -> dict[int, float]:
    seas = INDICATOR_SEASONS[key]
    res = {}
    for y in years:
        vals = [oni[y][s] for s in seas if y in oni and s in oni[y]]
        if len(vals) == len(seas):
            res[int(y)] = float(np.mean(vals))
    return res


def phase(v: float) -> str:
    return "nino" if v >= PHASE_THRESHOLD else "nina" if v <= -PHASE_THRESHOLD else "neutral"


def is_strong(v: float) -> bool:
    return abs(v) >= STRONG_THRESHOLD


def _arrays(years, values, oni_by_year):
    ys, xs, ov = [], [], []
    for y, v in zip(years, values):
        if v is None or not math.isfinite(v) or int(y) not in oni_by_year:
            continue
        ys.append(int(y)); xs.append(float(v)); ov.append(oni_by_year[int(y)])
    return np.array(ys), np.array(xs), np.array(ov)


def spearman(years, values, oni_by_year) -> tuple[float, float]:
    ys, xs, ov = _arrays(years, values, oni_by_year)
    if len(xs) < 5 or np.ptp(xs) == 0:
        return float("nan"), float("nan")
    r, p = sst.spearmanr(ov, xs)
    return float(r), float(p)


def _within(slope: float, ci: tuple[float, float]) -> bool:
    return ci[0] <= slope <= ci[1]


def enso_test(years, values, oni_by_year, base: stats.SenResult, cfg: dict) -> dict:
    """Las dos variantes y `survives`. `base` es el Sen del periodo base (el mismo que usa el motor)."""
    st = cfg["stats"]
    ys, xs, ov = _arrays(years, values, oni_by_year)
    out = {"slope_without_strong_enso": float("nan"), "p_without_strong_enso": float("nan"),
           "slope_oni_removed": float("nan"), "p_oni_removed": float("nan"), "survives": None}
    if not math.isfinite(base.slope_dec) or len(xs) < 5:
        return out
    # variante 1: sin años fuertes
    keep = np.array([not is_strong(o) for o in ov])
    if keep.sum() >= MIN_YEARS_AFTER_REMOVAL:
        s1 = stats.sen_slope(ys[keep], xs[keep], st["confidence"])
        m1 = stats.mann_kendall(ys[keep], xs[keep], s1, st["lag1_z"])
        out["slope_without_strong_enso"], out["p_without_strong_enso"] = s1.slope_dec, m1.p
    # variante 2: residuos de lluvia ~ ONI
    if np.ptp(ov) > 0:
        b, a = np.polyfit(ov, xs, 1)
        resid = xs - (a + b * ov)
        s2 = stats.sen_slope(ys, resid, st["confidence"])
        m2 = stats.mann_kendall(ys, resid, s2, st["lag1_z"])
        out["slope_oni_removed"], out["p_oni_removed"] = s2.slope_dec, m2.p
    a1, a2 = out["slope_without_strong_enso"], out["slope_oni_removed"]
    if math.isfinite(a1) and math.isfinite(a2):
        ci = (base.ci_low_dec, base.ci_high_dec)
        sg = math.copysign(1, base.slope_dec) if base.slope_dec != 0 else 0
        ok = all(math.copysign(1, a) == sg and _within(a, ci) for a in (a1, a2))
        out["survives"] = bool(ok)
    return out


def pettitt(years, values) -> tuple[int | None, float]:
    """Pettitt (1979). Devuelve (primer año del segundo regimen, p aproximado). Sin datos suficientes: (None, nan)."""
    ys, xs = [], []
    for y, v in zip(years, values):
        if v is not None and math.isfinite(v):
            ys.append(int(y)); xs.append(float(v))
    n = len(xs)
    if n < 8:
        return None, float("nan")
    x = np.array(xs)
    r = sst.rankdata(x)               # rangos con empates promediados
    u = np.empty(n - 1)
    for t in range(1, n):             # U_t = 2*sum_{i<=t} r_i - t*(n+1)
        u[t - 1] = 2.0 * r[:t].sum() - t * (n + 1)
    k = float(np.max(np.abs(u)))
    tau = int(np.argmax(np.abs(u))) + 1          # t = nº de años en el primer segmento
    p = float(min(1.0, 2.0 * math.exp(-6.0 * k * k / (n ** 3 + n ** 2))))
    return ys[tau], p                 # ys[tau] = primer año del segundo regimen


def break_flag(cp_year: int | None, p: float) -> bool:
    return cp_year is not None and math.isfinite(p) and p < BREAK_ALPHA and cp_year in BREAK_YEARS
