"""Análisis de un indicador de una celda y construcción de su JSON (contrato del plan 3.2).

Se hace en dos etapas porque el FDR necesita los p de TODAS las celdas:
  1) analyze_indicator  -> IndicatorAnalysis (números, sin veredicto)
  2) build_indicator    -> dict del contrato, con veredicto, razones y resultados por ventana
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any

import numpy as np

from . import stats, verdict

MK_METHOD = "Theil-Sen + Mann-Kendall"


# ----------------------------------------------------------------------------- redondeo / JSON
def num(x: Any, nd: int = 4) -> float | None:
    """None si no es finito; si no, redondeo a nd decimales."""
    if x is None:
        return None
    try:
        xf = float(x)
    except (TypeError, ValueError):
        return None
    return round(xf, nd) if math.isfinite(xf) else None


def sig(x: Any, digits: int = 4) -> float | None:
    """Cifras significativas (para p-valores pequeños)."""
    if x is None:
        return None
    xf = float(x)
    if not math.isfinite(xf):
        return None
    return float(f"{xf:.{digits}g}")


# ----------------------------------------------------------------------------- etapa 1
@dataclass
class IndicatorAnalysis:
    key: str
    years: list[int]
    values: list[float | None]
    period: tuple[int, int]
    valid_years: int
    mean: float
    cv: float
    sen: stats.SenResult
    mk: stats.MKResult
    windows: list[stats.WindowResult] = field(default_factory=list)
    summary: stats.FootprintSummary | None = None

    @property
    def n_years(self) -> int:
        return self.period[1] - self.period[0] + 1


def align_to_period(years, values, period: tuple[int, int]) -> tuple[list[int], list[float | None]]:
    """Serie completa del periodo: un año ausente queda como None, nunca como 0."""
    by_year = {}
    for y, v in zip(years, values):
        if v is not None and isinstance(v, (int, float, np.floating)) and math.isfinite(v):
            by_year[int(y)] = float(v)
    ys = list(range(period[0], period[1] + 1))
    return ys, [by_year.get(y) for y in ys]


def analyze_indicator(key: str, years, values, cfg: dict) -> IndicatorAnalysis:
    period = tuple(cfg["period"])
    ys, vs = align_to_period(years, values, period)
    st, fp = cfg["stats"], cfg["stats"]["footprint"]
    x, y = stats.clean(ys, vs)
    valid = len(y)
    mean = float(y.mean()) if valid else float("nan")
    sen = stats.sen_slope(ys, vs, st["confidence"])
    mk = stats.mann_kendall(ys, vs, sen, st["lag1_z"])
    a = IndicatorAnalysis(key, ys, vs, period, valid, mean, stats.cv(vs), sen, mk)
    if math.isfinite(sen.slope_dec):
        a.windows = stats.footprint(ys, vs, period, fp["min_len"], st["confidence"], fp["min_valid_fraction"])
        a.summary = stats.footprint_summary(a.windows, sen.slope_dec, fp["summary_min_len"], st["alpha_mk"])
    return a


# ----------------------------------------------------------------------------- etapa 2
def _enso_test(d: dict | None) -> dict | None:
    if d is None:
        return None
    return {
        "slope_without_strong_enso": num(d.get("slope_without_strong_enso"), 3),
        "p_without_strong_enso": sig(d.get("p_without_strong_enso")),
        "slope_oni_removed": num(d.get("slope_oni_removed"), 3),
        "p_oni_removed": sig(d.get("p_oni_removed")),
        "survives": d.get("survives"),
    }


def _break_2014(d: dict | None) -> dict | None:
    if d is None:
        return None
    return {"pettitt_year": d.get("pettitt_year"), "p": sig(d.get("p")), "flag": bool(d.get("flag"))}


def build_indicator(
    a: IndicatorAnalysis,
    cfg: dict,
    units: str,
    *,
    p_fdr: float | None = None,
    enso_phase: dict[int, str] | None = None,
    enso_test: dict | None = None,
    break_2014: dict | None = None,
    tags: list[str] | None = None,
    limitations: list[str] | None = None,
) -> dict:
    """Objeto `CellIndicator` del contrato (plan 3.2 y tipos del panel de Rol 5)."""
    sen, mk = a.sen, a.mk
    has_stats = math.isfinite(sen.slope_dec)
    summ = a.summary

    v, reasons = verdict.base_verdict(
        valid_years=a.valid_years, n_years=a.n_years, slope_dec=sen.slope_dec, mean=a.mean,
        ci=(sen.ci_low_dec, sen.ci_high_dec), p=mk.p, p_fdr=p_fdr,
        sign_agreement=summ.sign_agreement if summ else float("nan"),
        sig_fraction=summ.sig_fraction if summ else float("nan"),
        enso_survives=None if enso_test is None else enso_test.get("survives"),
        break_flag=None if break_2014 is None else bool(break_2014.get("flag")),
        cfg=cfg,
    )

    series = []
    for y, val in zip(a.years, a.values):
        series.append({
            "year": y,
            "value": num(val, 2),
            "anomaly": num(val - a.mean, 2) if (val is not None and math.isfinite(a.mean)) else None,
            "enso": (enso_phase or {}).get(y),
        })

    footprint, window_results = [], {}
    base_key = f"{a.period[0]}-{a.period[1]}"
    base_ci = (sen.ci_low_dec, sen.ci_high_dec)
    for w in a.windows:
        footprint.append([w.start, w.end, num(w.slope_dec, 3), sig(w.p), num(w.ci_low_dec, 3), num(w.ci_high_dec, 3)])
        ci, wv, wr = verdict.window_verdict(
            w, base_key=base_key, base_sign=sen.slope_dec, base_ci=base_ci,
            base_verdict=v, base_reasons=reasons, cfg=cfg)
        window_results[w.key] = {"ci_95": [num(ci[0], 3), num(ci[1], 3)], "verdict": wv, "verdict_reasons": wr}

    out: dict[str, Any] = {
        "units": units,
        "series": series,
        "statistics": {
            "method": MK_METHOD,
            "mk_variant": mk.variant,
            "lag1_autocorr": num(mk.lag1, 3),
            "slope_per_decade": num(sen.slope_dec, 3),
            "intercept": num(sen.intercept, 3),
            "ci_95": [num(sen.ci_low_dec, 3), num(sen.ci_high_dec, 3)],
            "p_value": sig(mk.p),
            "adjusted_p_fdr": sig(p_fdr),
        } if has_stats else None,
        "footprint": footprint,
        "window_results": window_results,
        "enso_test": _enso_test(enso_test),
        "break_2014": _break_2014(break_2014),
        "verdict": v,
        "verdict_reasons": reasons,
        "narrative": None,
        "limitations": list(limitations if limitations is not None else cfg.get("limitations", [])),
    }
    if tags:
        out["tags"] = list(tags)
    return out


def grid_indicator(a: IndicatorAnalysis, built: dict, *, p_fdr: float | None,
                   enso_r: float | None = None, enso_p_fdr: float | None = None) -> dict:
    """Fila ligera de grid.json para pintar el mapa."""
    s = built["statistics"]
    return {
        "mean": num(a.mean, 2),
        "slope_dec": s["slope_per_decade"] if s else None,
        "ci95": s["ci_95"] if s else None,
        "p": s["p_value"] if s else None,
        "p_fdr": sig(p_fdr),
        "sign_agreement": num(a.summary.sign_agreement, 3) if a.summary else None,
        "sig_fraction": num(a.summary.sig_fraction, 3) if a.summary else None,
        "enso_r": num(enso_r, 3),
        "enso_p_fdr": sig(enso_p_fdr),
        "valid_years": a.valid_years,
        "verdict": built["verdict"],
    }
