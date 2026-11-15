"""Regenera todo lo del motor estadístico con un comando (Rol 2).

    python pipeline/run_all.py               # datos reales en data/interim/ (de Rol 1 y Rol 3)
    python pipeline/run_all.py --synthetic   # datos inventados en data/synthetic/
    python pipeline/run_all.py --skip-calibration

Orden: 04 tendencias → 05 huella → 08 veredicto → 09 calibración → 11 exportación.
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import io, steps  # noqa: E402

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--synthetic", action="store_true")
    ap.add_argument("--skip-calibration", action="store_true")
    ap.add_argument("--n-sim", type=int, default=None, help="sobrescribe calibration.n_sim")
    ap.add_argument("--generated-at", default=None, help="fecha fija para meta.json (reproducibilidad)")
    args = ap.parse_args()

    cfg = io.load_config(synthetic=args.synthetic)
    steps.run_trends(cfg)
    steps.run_footprint(cfg)
    steps.run_verdict(cfg)
    if not args.skip_calibration:
        steps.run_calibration(cfg, n_sim=args.n_sim)
    steps.run_export(cfg, generated_at=args.generated_at)
