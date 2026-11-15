"""Huella de estabilidad (todas las ventanas de >= 10 años) (Rol 2).

Uso: python pipeline/05_footprint.py [--synthetic]
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import io, steps  # noqa: E402

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Huella de estabilidad (todas las ventanas de >= 10 años)")
    ap.add_argument("--synthetic", action="store_true", help="usar data/synthetic/ (datos inventados)")
    args = ap.parse_args()
    steps.run_footprint(io.load_config(synthetic=args.synthetic))
