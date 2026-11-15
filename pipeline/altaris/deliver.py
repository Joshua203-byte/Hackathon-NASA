"""Rol 1 · Entregables para Rol 2 y Rol 3 en el formato de pipeline/README.md.

  cells.csv    cell_id,lat,lon,country
  series.csv   cell_id,indicator,year,value      (mm; vacío = año no válido)
  monthly.csv  cell_id,year,month,mm             (mm/mes con días reales; vacío = sin dato)

Los indicadores se calculan con altaris/indicators.py (la misma regla que usa el motor de Joshua):
un año solo es válido si existen TODOS sus meses; nunca se rellena con ceros.

Código escrito con asistencia de IA (Claude); revisado y probado por el equipo (ver docs/rol1-datos.md).
"""
from __future__ import annotations

import csv
import math
from pathlib import Path

import numpy as np

from .indicators import climatology, has_canicula, indicators_from_monthly


def _fmt(x, nd=2) -> str:
    return "" if x is None or not math.isfinite(float(x)) else f"{float(x):.{nd}f}"


def write_deliverables(out_dir: Path, cells: list[dict], monthly_by_cell: dict[str, np.ndarray],
                       months: list[tuple[int, int]], cfg: dict) -> list[Path]:
    """`monthly_by_cell[cell_id]` es un vector de mm/mes alineado con `months` (NaN = sin dato)."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    years = sorted({y for y, _ in months})
    yidx = {y: i for i, y in enumerate(years)}

    p_cells, p_series, p_monthly = out_dir / "cells.csv", out_dir / "series.csv", out_dir / "monthly.csv"
    with open(p_cells, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["cell_id", "lat", "lon", "country"])
        for c in sorted(cells, key=lambda c: c["cell_id"]):
            w.writerow([c["cell_id"], f"{c['lat']:.2f}", f"{c['lon']:.2f}", c["country"]])

    with open(p_series, "w", newline="", encoding="utf-8") as fs, \
            open(p_monthly, "w", newline="", encoding="utf-8") as fm:
        ws, wm = csv.writer(fs), csv.writer(fm)
        ws.writerow(["cell_id", "indicator", "year", "value"])
        wm.writerow(["cell_id", "year", "month", "mm"])
        for c in sorted(cells, key=lambda c: c["cell_id"]):
            vec = np.asarray(monthly_by_cell[c["cell_id"]], dtype=float)
            mat = np.full((len(years), 12), np.nan)
            for (y, m), v in zip(months, vec):
                mat[yidx[y], m - 1] = v
                wm.writerow([c["cell_id"], y, m, _fmt(v)])
            for key, vals in indicators_from_monthly(mat, cfg["indicators"]).items():
                for y, v in zip(years, vals):
                    ws.writerow([c["cell_id"], key, y, _fmt(v)])
    return [p_cells, p_series, p_monthly]


def quality_report(monthly_by_cell: dict[str, np.ndarray], months: list[tuple[int, int]], cfg: dict) -> dict:
    """Comprobaciones del plan (5.2, B2): sin negativos, totales creíbles, años válidos, canícula."""
    years = sorted({y for y, _ in months})
    yidx = {y: i for i, y in enumerate(years)}
    n_neg = 0
    may_oct, valid_counts, canicula = [], [], {True: 0, False: 0, None: 0}
    for vec in monthly_by_cell.values():
        vec = np.asarray(vec, dtype=float)
        n_neg += int(np.sum(vec < 0))
        mat = np.full((len(years), 12), np.nan)
        for (y, m), v in zip(months, vec):
            mat[yidx[y], m - 1] = v
        ind = indicators_from_monthly(mat, cfg["indicators"])
        may_oct += [v for v in ind["may_oct_mm"] if v is not None]
        valid_counts.append(sum(v is not None for v in ind["annual_mm"]))
        canicula[has_canicula(climatology(mat))] += 1
    mo = np.array(may_oct) if may_oct else np.array([np.nan])
    return {
        "n_cells": len(monthly_by_cell),
        "negative_values": n_neg,
        "may_oct_mm_percentiles": {"p1": _r(np.nanpercentile(mo, 1)), "p50": _r(np.nanpercentile(mo, 50)),
                                   "p99": _r(np.nanpercentile(mo, 99))},
        "annual_valid_years": {"min": int(min(valid_counts)) if valid_counts else 0,
                               "max": int(max(valid_counts)) if valid_counts else 0, "of": len(years)},
        "cells_with_canicula": canicula[True], "cells_without_canicula": canicula[False],
        "cells_canicula_unknown": canicula[None],
        "feb_2004_days": __import__("calendar").monthrange(2004, 2)[1],
    }


def _r(x):
    return None if not np.isfinite(x) else round(float(x), 1)


def summary(series_csv: Path) -> str:
    """Resumen legible de series.csv para el mensaje de relevo."""
    rows = list(csv.DictReader(open(series_csv, encoding="utf-8")))
    out = []
    for ind in sorted({r["indicator"] for r in rows}):
        vals = [float(r["value"]) for r in rows if r["indicator"] == ind and r["value"]]
        n = sum(1 for r in rows if r["indicator"] == ind)
        if vals:
            out.append(f"  {ind}: {len(vals)}/{n} años válidos, media {np.mean(vals):.0f} mm, "
                       f"rango {min(vals):.0f}–{max(vals):.0f}")
        else:
            out.append(f"  {ind}: 0/{n} años válidos")
    return "\n".join(out)
