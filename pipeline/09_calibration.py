"""Calibración del veredicto: falsos positivos y potencia (Rol 2).

Uso: python pipeline/09_calibration.py [--synthetic]
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import io, steps  # noqa: E402

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Calibración del veredicto: falsos positivos y potencia")
    ap.add_argument("--synthetic", action="store_true", help="usar data/synthetic/ (datos inventados)")
    args = ap.parse_args()
    steps.run_calibration(io.load_config(synthetic=args.synthetic))
