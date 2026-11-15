"""Datos sintéticos con verdad conocida (para pruebas, calibración y demo del motor). NO son observaciones."""
from __future__ import annotations

import numpy as np

COUNTRIES = ["HND", "SLV", "GTM"]


def make_series(rng: np.random.Generator, years, mean: float, cv: float = 0.15, trend_pct_dec: float = 0.0,
                ar1: float = 0.0) -> list[float]:
    """Serie anual: media, ruido (AR1 opcional) y tendencia lineal como fracción de la media por década."""
    n = len(years)
    sd = mean * cv
    e = rng.normal(0, sd, n)
    for i in range(1, n):
        e[i] = ar1 * e[i - 1] + np.sqrt(1 - ar1 ** 2) * e[i]
    t = (np.asarray(years) - years[0]) / 10.0
    return list(np.maximum(mean + trend_pct_dec * mean * (t - t.mean()) + e, 0.0))


def make_region(n_cells: int = 40, period=(2001, 2024), seed: int = 7, frac_trend: float = 0.25):
    """Región sintética: una fracción de celdas con tendencia real de -10 %/década, el resto ruido."""
    rng = np.random.default_rng(seed)
    years = list(range(period[0], period[1] + 1))
    cells, series, truth = [], {}, {}
    for i in range(n_cells):
        lat = round(13.0 + (i % 8) * 0.5 + 0.05, 2)
        lon = round(-88.0 + (i // 8) * 0.5 - 0.05, 2)
        cid = f"{'N' if lat >= 0 else 'S'}{abs(round(lat * 100)):04d}{'E' if lon >= 0 else 'W'}{abs(round(lon * 100)):05d}"
        cells.append({"id": cid, "lat": lat, "lon": lon, "country": COUNTRIES[i % 3]})
        has = rng.random() < frac_trend
        truth[cid] = has
        series[cid] = {}
        for key, mean in (("may_oct_mm", 1000.0), ("jul_aug_mm", 330.0), ("annual_mm", 1400.0)):
            series[cid][key] = (years, make_series(rng, years, mean, 0.12, -0.10 if has else 0.0, 0.1))
    return cells, series, truth
