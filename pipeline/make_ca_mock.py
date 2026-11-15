"""Datos SIMULADOS de 7 países (Centroamérica) para que el panel, el mapa, el despliegue y los textos se prueben
SIN esperar a los datos reales. Mismo contrato de archivos que el motor produce (meta, grid, cells/, reasons).

  python make_ca_mock.py --out /tmp/ca-mock                # ~1 100 celdas, unos 7 min con 4 núcleos
  python make_ca_mock.py --out /tmp/ca-mock --stride 12    # ~360 celdas, 2-3 min (lo bastante para ver la interfaz)
  python make_ca_mock.py --out /tmp/ca-mock --stride 1     # todas (~4 300), unos 30 min: solo para pruebas de carga

Luego, para verlo en el panel:   cd rol5-panel-app && VITE_DATA_BASE_URL=http://127.0.0.1:8765/data npm run dev
(sirviendo la carpeta <out> con CORS; o copiando <out>/data/ sobre rol5-panel-app/public/data/ EN SU COPIA LOCAL, sin commitear).

QUÉ ES Y QUÉ NO ES
  * Las celdas de Guatemala, El Salvador y Honduras son las reales de data/rol1/cells.csv (solo la posición).
  * Las de Belice, Nicaragua, Costa Rica y Panamá salen de RECTÁNGULOS aproximados: no son las fronteras reales.
  * TODAS las series de lluvia son sintéticas (aleatorias con semilla fija). No hay ningún resultado científico aquí.
  * meta.json lleva data_kind "mock" y commit "MOCK": el panel muestra el aviso de DEMOSTRACIÓN.
  * Nunca se publica ni se usa en el formulario, el video o las pruebas con personas.
"""
import argparse
import csv
import json
import shutil
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import export, io, synth  # noqa: E402
from altaris.config import load_config  # noqa: E402

REPO = Path(__file__).resolve().parent.parent

# Rectángulos aproximados (lat_min, lat_max, lon_min, lon_max). Solo para dar forma al mapa de prueba.
BOXES = {
    "BLZ": (16.2, 18.4, -89.0, -88.2),
    "NIC": (11.0, 12.9, -87.2, -83.7),
    "CRI": (8.3, 10.9, -85.8, -82.7),
    "PAN": (7.3, 9.4, -82.9, -77.5),
}
MEAN = {"BLZ": 1900, "NIC": 1300, "CRI": 2400, "PAN": 2600, "GTM": 1700, "SLV": 1500, "HND": 1400}


def cid(lat, lon):
    return f"{'N' if lat >= 0 else 'S'}{abs(round(lat * 100)):04d}{'E' if lon >= 0 else 'W'}{abs(round(lon * 100)):05d}"


def build_cells():
    base = io.read_cells(REPO / "data" / "rol1" / "cells.csv")
    seen = {c["id"] for c in base}
    cells = list(base)
    for code, (la0, la1, lo0, lo1) in BOXES.items():
        for lat in np.arange(la0 + 0.05, la1, 0.1):
            for lon in np.arange(lo0 + 0.05, lo1, 0.1):
                la, lo = round(float(lat), 2), round(float(lon), 2)
                i = cid(la, lo)
                if i not in seen:
                    seen.add(i)
                    cells.append({"id": i, "lat": la, "lon": lo, "country": code})
    return sorted(cells, key=lambda c: c["id"])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True)
    ap.add_argument("--stride", type=int, default=4, help="una de cada N celdas (1 = todas)")
    ap.add_argument("--jobs", type=int, default=-1)
    ap.add_argument("--config", default=str(Path(__file__).with_name("config_centroamerica.yaml")))
    a = ap.parse_args()
    cfg = load_config(a.config)
    cells = build_cells()[:: max(1, a.stride)]
    years = list(range(cfg["period"][0], cfg["period"][1] + 1))
    rng = np.random.default_rng(20261115)
    series = {}
    for c in cells:
        has = rng.random() < 0.25
        mean = MEAN.get(c["country"], 1500) * float(rng.uniform(0.8, 1.2))
        series[c["id"]] = {
            "may_oct_mm": (years, synth.make_series(rng, years, mean * 0.72, 0.14, -0.10 if has else 0.0, 0.1)),
            "jul_aug_mm": (years, synth.make_series(rng, years, mean * 0.24, 0.20, 0.0, 0.1)),
            "annual_mm": (years, synth.make_series(rng, years, mean, 0.12, -0.08 if has else 0.0, 0.1)),
        }
    out = Path(a.out) / "data"
    res = export.run(cells, series, cfg, out, data_kind="mock", commit="MOCK", n_jobs=a.jobs)
    # archivos de referencia que el panel espera junto al JSON (los simulados que ya trae el repo)
    for f in ("tour.json", "glossary.json", "decision_rules.json", "enso.json"):
        src = REPO / "rol5-panel-app" / "public" / "data" / f
        if src.exists():
            shutil.copy(src, out / f)
    by = {}
    for c in cells:
        by[c["country"]] = by.get(c["country"], 0) + 1
    print(json.dumps({"celdas": len(cells), "por_pais": by, "veredictos": res["verdicts"], "carpeta": str(out)}, ensure_ascii=False))
    print("SIMULADO: no usar para nada que no sea probar la interfaz.")


if __name__ == "__main__":
    main()
