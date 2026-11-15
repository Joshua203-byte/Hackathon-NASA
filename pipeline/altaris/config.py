"""Carga de config.yaml con comprobaciones mínimas."""
from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

DEFAULT_PATH = Path(__file__).resolve().parent.parent / "config.yaml"


def load_config(path: str | Path | None = None) -> dict[str, Any]:
    p = Path(path) if path else DEFAULT_PATH
    with p.open(encoding="utf-8") as fh:
        cfg = yaml.safe_load(fh)
    y0, y1 = cfg["period"]
    if not (isinstance(y0, int) and isinstance(y1, int) and y1 > y0):
        raise ValueError(f"period inválido: {cfg['period']}")
    fp = cfg["stats"]["footprint"]
    if fp["summary_min_len"] < fp["min_len"]:
        raise ValueError("summary_min_len no puede ser menor que min_len")
    n_years = y1 - y0 + 1
    if fp["min_len"] > n_years:
        raise ValueError("min_len mayor que el periodo")
    cfg["_n_years"] = n_years
    cfg["_path"] = str(p)
    return cfg
