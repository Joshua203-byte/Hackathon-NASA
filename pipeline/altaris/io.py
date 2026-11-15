"""Entrada y salida del pipeline: config, tablas de Rol 1 / Rol 3 y JSON."""
from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path

import numpy as np
import pandas as pd
import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = REPO_ROOT / "pipeline" / "config.yaml"
SYNTHETIC_DIR = "data/synthetic"


def load_config(path: Path | str = CONFIG_PATH, synthetic: bool = False) -> dict:
    with open(path, encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    cfg["synthetic"] = bool(synthetic)
    if synthetic:
        # Los datos inventados viven aparte para no mezclarlos con los reales.
        for key in ("cells", "indicators", "climatology", "break_2014", "enso_test", "enso_phases", "narratives",
                    "trends", "footprint", "footprint_summary", "verdicts", "verdict_summary",
                    "calibration"):
            name = Path(cfg["paths"][key]).name
            cfg["paths"][key] = f"{SYNTHETIC_DIR}/{name}"
    return cfg


def path(cfg: dict, key: str) -> Path:
    return REPO_ROOT / cfg["paths"][key]


def period_years(cfg: dict) -> np.ndarray:
    a, b = cfg["period"]
    return np.arange(int(a), int(b) + 1)


# ---------------------------------------------------------------------------
# Entradas
# ---------------------------------------------------------------------------

def load_cells(cfg: dict) -> pd.DataFrame:
    df = pd.read_csv(path(cfg, "cells"))
    required = {"id", "lat", "lon", "country"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"cells.csv sin columnas {missing}")
    if "name" not in df.columns:
        df["name"] = None
    if "canicula" not in df.columns:
        df["canicula"] = None
    return df.sort_values("id").reset_index(drop=True)


def load_indicators(cfg: dict) -> pd.DataFrame:
    """Devuelve una tabla larga: id, indicator, year, value (NaN = año no válido).

    Acepta:
    - CSV largo con columnas id, indicator, year, value.
    - NetCDF con una variable por indicador y dimensiones (year, cell) con
      coordenada `cell` = id, o (year, lat, lon). Ver pipeline/README.md.
    """
    p = path(cfg, "indicators")
    if p.suffix == ".csv":
        df = pd.read_csv(p)
    elif p.suffix == ".nc":
        df = _indicators_from_netcdf(p, list(cfg["indicators"]))
    else:
        raise ValueError(f"Formato de indicadores no soportado: {p.suffix}")
    df = df[df["indicator"].isin(cfg["indicators"].keys())]
    a, b = cfg["period"]
    df = df[(df["year"] >= a) & (df["year"] <= b)]
    return df[["id", "indicator", "year", "value"]].reset_index(drop=True)


def cell_id(lat: float, lon: float) -> str:
    """N1345W08815 = 13.45° N, 88.15° O (centro de la celda, 2 decimales sin punto)."""
    ns = "N" if lat >= 0 else "S"
    ew = "E" if lon >= 0 else "W"
    return f"{ns}{round(abs(lat) * 100):04d}{ew}{round(abs(lon) * 100):05d}"


def _indicators_from_netcdf(p: Path, indicators: list[str]) -> pd.DataFrame:
    import xarray as xr  # import diferido: solo si Rol 1 entrega NetCDF

    ds = xr.open_dataset(p)
    frames = []
    for ind in indicators:
        if ind not in ds:
            continue
        da = ds[ind]
        df = da.to_dataframe(name="value").reset_index()
        if "cell" in df.columns:
            df = df.rename(columns={"cell": "id"})
        elif {"lat", "lon"} <= set(df.columns):
            df["id"] = [cell_id(a, b) for a, b in zip(df["lat"], df["lon"])]
        else:
            raise ValueError("indicators.nc debe tener dimensión `cell` o (`lat`, `lon`)")
        df["indicator"] = ind
        frames.append(df[["id", "indicator", "year", "value"]])
    ds.close()
    return pd.concat(frames, ignore_index=True)


def load_optional_csv(cfg: dict, key: str) -> pd.DataFrame | None:
    p = path(cfg, key)
    return pd.read_csv(p) if p.exists() else None


def series_table(ind_df: pd.DataFrame, years: np.ndarray) -> dict[tuple[str, str], np.ndarray]:
    """{(id, indicador): arreglo de valores alineado a `years`, NaN donde falta}."""
    out = {}
    year_idx = {int(y): i for i, y in enumerate(years)}
    for (cid, ind), g in ind_df.groupby(["id", "indicator"], sort=True):
        arr = np.full(len(years), np.nan)
        for y, v in zip(g["year"], g["value"]):
            arr[year_idx[int(y)]] = v
        out[(cid, ind)] = arr
    return out


# ---------------------------------------------------------------------------
# Salidas
# ---------------------------------------------------------------------------

def rnd(x, nd: int):
    """Redondeo seguro para JSON: NaN/inf → None."""
    if x is None:
        return None
    if isinstance(x, (bool, np.bool_)):
        return bool(x)
    x = float(x)
    if not math.isfinite(x):
        return None
    return round(x, nd)


def write_json(obj, p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")


def read_json(p: Path):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def git_commit() -> str | None:
    try:
        out = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=REPO_ROOT,
                             capture_output=True, text=True, timeout=10)
        return out.stdout.strip() or None
    except Exception:
        return None
