"""Lectura de las entregas de Rol 1 y Rol 3 en CSV (formatos en pipeline/README.md)."""
from __future__ import annotations

import csv
import json
from pathlib import Path


def _rows(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        yield from csv.DictReader(f)


def _f(x):
    x = (x or "").strip()
    if x == "" or x.lower() in ("nan", "none", "null", "na"):
        return None
    return float(x)


def read_cells(path) -> list[dict]:
    return [{"id": r["cell_id"], "lat": float(r["lat"]), "lon": float(r["lon"]), "country": r.get("country", "")}
            for r in _rows(path)]


def read_series_long(path) -> dict[str, dict[str, tuple[list[int], list[float | None]]]]:
    """cell_id,indicator,year,value -> {cell: {indicator: (years, values)}}"""
    tmp: dict = {}
    for r in _rows(path):
        tmp.setdefault(r["cell_id"], {}).setdefault(r["indicator"], {})[int(r["year"])] = _f(r["value"])
    out = {}
    for c, inds in tmp.items():
        out[c] = {}
        for k, d in inds.items():
            ys = sorted(d)
            out[c][k] = (ys, [d[y] for y in ys])
    return out


def read_monthly(path) -> dict[str, list[tuple[int, int, float | None]]]:
    """cell_id,year,month,mm -> {cell: [(year, month, mm)]} (mm ya en mm/mes)."""
    out: dict = {}
    for r in _rows(path):
        out.setdefault(r["cell_id"], []).append((int(r["year"]), int(r["month"]), _f(r["mm"])))
    return out


def read_enso_results(path) -> dict[tuple[str, str], dict]:
    out = {}
    for r in _rows(path):
        s = (r.get("survives") or "").strip().lower()
        out[(r["cell_id"], r["indicator"])] = {
            "enso_r": _f(r.get("enso_r")), "enso_p_fdr": _f(r.get("enso_p_fdr")),
            "survives": None if s == "" else s in ("1", "true", "yes", "si", "sí"),
            "slope_without_strong_enso": _f(r.get("slope_without_strong_enso")),
            "p_without_strong_enso": _f(r.get("p_without_strong_enso")),
            "slope_oni_removed": _f(r.get("slope_oni_removed")),
            "p_oni_removed": _f(r.get("p_oni_removed")),
        }
    return out


def read_break2014(path) -> dict[tuple[str, str], dict]:
    out = {}
    for r in _rows(path):
        s = (r.get("flag") or "").strip().lower()
        py = _f(r.get("pettitt_year"))
        out[(r["cell_id"], r["indicator"])] = {
            "pettitt_year": None if py is None else int(py), "p": _f(r.get("p")),
            "flag": s in ("1", "true", "yes", "si", "sí"),
        }
    return out


def read_enso_json(path) -> dict[int, str]:
    """enso.json de Rol 3: {"years": {"2001": {"phase": ..., "strong": ...}}} -> {año: fase}"""
    d = json.loads(Path(path).read_text(encoding="utf-8"))
    return {int(y): v["phase"] for y, v in d["years"].items()}
