"""Rol 1 · 03 — Máscara de países y entregables de la región para Joshua (Rol 2) y Camila (Rol 3).

  python 03_indicators.py
  python 03_indicators.py --cells-only   # sin IMERG: solo cells.csv y borders.geojson (rejilla IMERG 0.1°)

Entrada: data/interim/cube_monthly_mm.nc (de 02_build_cube.py) y Natural Earth 10m admin 0
(se descarga una vez en data/raw/natural_earth/; dato auxiliar declarado, no es de la NASA).
Regla del plan (5.2): una celda entra si su CENTRO cae dentro de Guatemala, El Salvador u Honduras.

Salida en data/rol1/:
  cells.csv, series.csv, monthly.csv   → formato de pipeline/README.md (Joshua y Camila)
  borders.geojson                      → bordes simplificados para el mapa (Elena)
  provenance.json                      → dataset, versión, DOI, fecha, búsqueda, controles de calidad

Código escrito con asistencia de IA (Claude); revisado y probado por el equipo (ver docs/rol1-datos.md).
"""
import io
import sys
import urllib.request
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402

from altaris import deliver, imerg  # noqa: E402
from altaris.config import load_config  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
CUBE = REPO / "data" / "interim" / "cube_monthly_mm.nc"
NE_DIR = REPO / "data" / "raw" / "natural_earth"
MANIFEST = REPO / "data" / "raw" / "imerg" / "manifest.json"
OUT = REPO / "data" / "rol1"


def natural_earth_shp() -> Path:
    shp = NE_DIR / "ne_10m_admin_0_countries.shp"
    if not shp.exists():
        NE_DIR.mkdir(parents=True, exist_ok=True)
        print(f"Descargando Natural Earth: {imerg.NATURAL_EARTH_URL}")
        req = urllib.request.Request(imerg.NATURAL_EARTH_URL, headers={"User-Agent": "altaris-pipeline"})
        with urllib.request.urlopen(req, timeout=300) as r:
            zipfile.ZipFile(io.BytesIO(r.read())).extractall(NE_DIR)
    return shp


def imerg_grid(bbox) -> tuple[np.ndarray, np.ndarray]:
    """Centros de celda de la rejilla IMERG 0.1° (…, x.05, x.15, …) dentro del recuadro."""
    lat = np.round(-89.95 + 0.1 * np.arange(1800), 2)
    lon = np.round(-179.95 + 0.1 * np.arange(3600), 2)
    i0, i1 = imerg.index_range(lat, *bbox["lat"])
    j0, j1 = imerg.index_range(lon, *bbox["lon"])
    return lat[i0:i1 + 1], lon[j0:j1 + 1]


def cells_only(cfg):
    lat, lon = imerg_grid(cfg["bbox"])
    codes = imerg.active_countries(cfg)
    shapes = imerg.load_country_shapes(natural_earth_shp(), codes)
    owner = imerg.assign_countries(lat, lon, shapes)
    OUT.mkdir(parents=True, exist_ok=True)
    import csv
    with open(OUT / "cells.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["cell_id", "lat", "lon", "country"])
        for (la, lo), code in sorted(owner.items(), key=lambda kv: imerg.cell_id(*kv[0])):
            w.writerow([imerg.cell_id(la, lo), f"{la:.2f}", f"{lo:.2f}", code])
    imerg.write_json(imerg.borders_geojson(shapes), OUT / "borders.geojson")
    by = {c: sum(1 for v in owner.values() if v == c) for c in codes}
    print(f"Rejilla {len(lat)} × {len(lon)}; celdas de tierra: {len(owner)} {by}")
    pid = imerg.pilot_cell()
    print(f"Piloto {imerg.PILOT['name']} {pid[0]} → país {owner.get((pid[1], pid[2]))}")
    print("Escrito:", OUT / "cells.csv", OUT / "borders.geojson")


def main():
    import json

    import pandas as pd
    import xarray as xr

    import argparse
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cells-only", action="store_true")
    ap.add_argument("--config", help="otro config.yaml (p. ej. para otra región)")
    ap.add_argument("--data-dir", help="carpeta de datos en lugar de <repo>/data")
    a = ap.parse_args()
    global CUBE, MANIFEST, OUT
    if a.data_dir:
        d = Path(a.data_dir)
        CUBE, MANIFEST, OUT = d / "interim" / "cube_monthly_mm.nc", d / "raw" / "imerg" / "manifest.json", d / "rol1"
    cfg = load_config(a.config)
    if a.cells_only:
        return cells_only(cfg)
    if not CUBE.exists():
        raise SystemExit("Falta data/interim/cube_monthly_mm.nc. Correr antes 02_build_cube.py")
    with xr.open_dataset(CUBE, engine="h5netcdf") as ds:
        ds = ds.load()
    lat, lon = ds["lat"].values.astype(float), ds["lon"].values.astype(float)
    times = pd.to_datetime(ds["time"].values)
    months = [(t.year, t.month) for t in times]
    cube = ds["precip_mm"].values

    codes = imerg.active_countries(cfg)
    shapes = imerg.load_country_shapes(natural_earth_shp(), codes)
    owner = imerg.assign_countries(lat, lon, shapes)
    cells, monthly = [], {}
    li = {round(v, 2): i for i, v in enumerate(lat)}
    lj = {round(v, 2): j for j, v in enumerate(lon)}
    for (la, lo), code in sorted(owner.items()):
        cid = imerg.cell_id(la, lo)
        cells.append({"cell_id": cid, "lat": la, "lon": lo, "country": code})
        monthly[cid] = cube[:, li[la], lj[lo]]
    by_country = {c: sum(1 for x in cells if x["country"] == c) for c in codes}
    print(f"Celdas de tierra: {len(cells)} {by_country}")

    files = deliver.write_deliverables(OUT, cells, monthly, months, cfg)
    imerg.write_json(imerg.borders_geojson(shapes), OUT / "borders.geojson")
    qc = deliver.quality_report(monthly, months, cfg)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    prov = {
        "dataset": f"GPM IMERG Final Precipitation L3 1 month 0.1° V07 ({imerg.SHORT_NAME})",
        "version": "V07 (archivos V07B)", "doi": imerg.DOI, "citation": imerg.CITATION,
        "concept_id": imerg.CONCEPT_ID, "period": cfg["period"], "bbox": cfg["bbox"],
        "period_note": "2025 no está completo en IMERG Final mensual (CMR: hasta 2025-09) → periodo 2001–2024",
        "download": {k: manifest.get(k) for k in ("method", "search", "downloaded_at", "opendap",
                                                  "variables_observed", "missing_months", "failed")},
        "conversion": "mm/mes = tasa (mm/h) × 24 × días reales del mes (bisiestos incluidos)",
        "indicators": {k: v["months"] for k, v in cfg["indicators"].items()},
        "validity_rule": "un indicador de un año es válido solo si existen todos sus meses; nunca se rellena con 0",
        "mask": {"source": "Natural Earth 10m admin 0 (auxiliar, no NASA)", "url": imerg.NATURAL_EARTH_URL,
                 "rule": "centro de la celda dentro del país", "countries": {c: imerg.COUNTRY_NAMES[c] for c in codes}, "cells": by_country},
        "pilot": dict(zip(("cell_id", "lat", "lon"), imerg.pilot_cell())) | {"name": imerg.PILOT["name"]},
        "quality": qc,
        "generated_at": imerg.now_iso(),
    }
    imerg.write_json(prov, OUT / "provenance.json")
    print("Controles:", json.dumps(qc, ensure_ascii=False))
    if qc["negative_values"]:
        raise SystemExit("Hay valores negativos: revisar antes de entregar")
    print("Entregables:", ", ".join(str(p) for p in files + [OUT / "borders.geojson", OUT / "provenance.json"]))


if __name__ == "__main__":
    main()
