"""De lluvia mensual a indicadores anuales (plan 4.1 y 4.2).

Lo normal es que Rol 1 (David) genere los indicadores de toda la región. Estas funciones existen para
(a) procesar la serie piloto el sábado por la noche y (b) que Rol 1 y Rol 2 usen la MISMA regla.

Reglas:
  * IMERG mensual viene como tasa en mm/h: mm_mes = tasa * 24 * días_reales_del_mes (febrero bisiesto incluido).
  * Un indicador de un año solo es válido si existen TODOS sus meses. Nunca se rellena con ceros.
  * Canícula (plan 4.2): promedio de la lluvia media de julio y agosto menor que el de junio y septiembre.
"""
from __future__ import annotations

import calendar
import math
from typing import Any

import numpy as np


def days_in_month(year: int, month: int) -> int:
    return calendar.monthrange(year, month)[1]


def rate_to_monthly_mm(rate_mm_per_hour: float, year: int, month: int) -> float:
    """Tasa media (mm/h) de un mes -> acumulado del mes (mm), con los días reales."""
    return float(rate_mm_per_hour) * 24.0 * days_in_month(year, month)


def monthly_matrix(years: list[int], records: list[tuple[int, int, float | None]]) -> np.ndarray:
    """(n_years, 12) con NaN donde falta el mes. `records` = [(año, mes, mm), ...]."""
    idx = {y: i for i, y in enumerate(years)}
    m = np.full((len(years), 12), np.nan)
    for year, month, mm in records:
        if year in idx and 1 <= month <= 12 and mm is not None and math.isfinite(mm):
            m[idx[year], month - 1] = mm
    return m


def indicators_from_monthly(monthly: np.ndarray, indicators_cfg: dict[str, Any]) -> dict[str, list[float | None]]:
    """Indicadores anuales (None cuando falta algún mes del indicador)."""
    out: dict[str, list[float | None]] = {}
    for key, spec in indicators_cfg.items():
        cols = [mth - 1 for mth in spec["months"]]
        block = monthly[:, cols]
        full = np.isfinite(block).all(axis=1)
        vals = np.where(full, block.sum(axis=1), np.nan)
        out[key] = [None if not np.isfinite(v) else float(v) for v in vals]
    return out


def climatology(monthly: np.ndarray, min_years: int = 10) -> list[float | None]:
    """Media de cada mes sobre el periodo. None si hay menos de `min_years` datos de ese mes."""
    res: list[float | None] = []
    for j in range(12):
        col = monthly[:, j]
        col = col[np.isfinite(col)]
        res.append(float(col.mean()) if len(col) >= min_years else None)
    return res


def has_canicula(clim: list[float | None]) -> bool | None:
    jun, jul, aug, sep = clim[5], clim[6], clim[7], clim[8]
    if any(v is None for v in (jun, jul, aug, sep)):
        return None
    return (jul + aug) / 2.0 < (jun + sep) / 2.0
