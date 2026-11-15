"""Exporta meta.json, grid.json y cells/{id}.json para la web (Rol 2).

Uso: python pipeline/11_export_json.py [--synthetic]
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import io, steps  # noqa: E402

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Exporta meta.json, grid.json y cells/{id}.json para la web")
    ap.add_argument("--synthetic", action="store_true", help="usar data/synthetic/ (datos inventados)")
    args = ap.parse_args()
    steps.run_export(io.load_config(synthetic=args.synthetic))
