"""Genera DATOS SINTÉTICOS de 5 celdas para que la web arranque sin esperar a Rol 1 (Rol 2, B0).

Los datos son INVENTADOS. Cada celda está diseñada para ejercitar un veredicto:
  1. Choluteca      → baja fuerte en canícula (debería salir `consistente`)
  2. Comayagua      → caída solo en los últimos años (huella frágil → `limitada`)
  3. La Ceiba       → sin tendencia, vertiente Caribe, sin canícula (`sin_evidencia`)
  4. San Miguel     → alta variabilidad y bandera de 2014 en el anual
  5. Guatemala      → 3 años faltantes (`incompleta`)
Las fases ENSO también son inventadas: NO son el ONI real.

Salida: data/synthetic/*.csv (formato idéntico al que entregarán Rol 1 y Rol 3).
Uso: python pipeline/make_synthetic.py && python pipeline/run_all.py --synthetic
"""
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from altaris import io  # noqa: E402

PACIFIC = np.array([5, 5, 10, 40, 180, 280, 170, 160, 300, 250, 60, 15], float)
CARIBE = np.array([200, 120, 80, 60, 90, 150, 170, 170, 180, 280, 330, 280], float)

CELLS = [
    # id, nombre, lat, lon, país, clima
    ("N1325W08715", "Choluteca (sintético)", 13.25, -87.15, "HND", "pac"),
    ("N1455W08765", "Comayagua (sintético)", 14.55, -87.65, "HND", "pac"),
    ("N1575W08685", "La Ceiba (sintético)", 15.75, -86.85, "HND", "car"),
    ("N1345W08815", "San Miguel (sintético)", 13.45, -88.15, "SLV", "pac"),
    ("N1465W09055", "Ciudad de Guatemala (sintético)", 14.65, -90.55, "GTM", "pac"),
]


def main():
    cfg = io.load_config(synthetic=True)
    rng = np.random.default_rng(42)
    years = io.period_years(cfg)
    n = len(years)
    t = (years - years[0]) / 10.0  # décadas desde el inicio
    oni = np.round(rng.normal(0, 0.9, n), 2)  # INVENTADO

    monthly_rows, ind_rows, clim_rows = [], [], []
    for cid, name, lat, lon, country, kind in CELLS:
        clim = PACIFIC if kind == "pac" else CARIBE
        sd = 0.12
        mult = np.ones((n, 12))
        if cid == "N1325W08715":       # baja fuerte de jul–ago, moderada en temporada
            mult[:, 6:8] *= (1 - 0.14 * t)[:, None]
            mult[:, 4:10] *= (1 - 0.03 * t)[:, None]
        elif cid == "N1455W08765":     # caída solo desde 2020
            mult[years >= 2020, 4:10] *= 0.72
        elif cid == "N1345W08815":     # alta variabilidad + salto en 2014
            sd = 0.40
            mult[years >= 2014, :] *= 1.18
        # señal ENSO: Pacífico más seco con El Niño; Caribe más húmedo (efecto espejo)
        enso_eff = (1 - 0.12 * oni) if kind == "pac" else (1 + 0.10 * oni)
        mult[:, 4:10] *= enso_eff[:, None]
        noise = np.exp(rng.normal(0, sd, (n, 1)) + rng.normal(0, 0.08, (n, 12)))
        mm = clim[None, :] * mult * noise
        if cid == "N1465W09055":       # años faltantes: no se rellenan
            mm[[3, 11, 17], 6] = np.nan

        clim_rows.append({"id": cid, **{f"m{m + 1}": float(np.nanmean(mm[:, m])) for m in range(12)}})
        for i, y in enumerate(years):
            row = mm[i]
            vals = {
                "may_oct_mm": row[4:10].sum() if np.isfinite(row[4:10]).all() else np.nan,
                "jul_aug_mm": row[6:8].sum() if np.isfinite(row[6:8]).all() else np.nan,
                "annual_mm": row.sum() if np.isfinite(row).all() else np.nan,
            }
            for k, v in vals.items():
                ind_rows.append({"id": cid, "indicator": k, "year": int(y), "value": round(float(v), 2)})

    cells = pd.DataFrame([{"id": c[0], "name": c[1], "lat": c[2], "lon": c[3], "country": c[4]} for c in CELLS])
    clim_df = pd.DataFrame(clim_rows)
    # bandera de canícula (sección 4.2): media(jul, ago) < media(jun, sep)
    cells["canicula"] = [(r.m7 + r.m8) / 2 < (r.m6 + r.m9) / 2 for r in clim_df.itertuples()]

    phase = np.where(oni >= 0.5, "nino", np.where(oni <= -0.5, "nina", "neutral"))
    phases = pd.DataFrame([{"year": int(y), "indicator": ind, "oni": float(o), "phase": p,
                            "strong": bool(abs(o) >= 1.0)}
                           for ind in cfg["indicators"] for y, o, p in zip(years, oni, phase)])

    enso_rows, brk_rows = [], []
    for cid, _, _, _, _, kind in CELLS:
        for ind in cfg["indicators"]:
            r = -0.48 if kind == "pac" else 0.41
            enso_rows.append({"id": cid, "indicator": ind, "enso_r": r, "enso_p_fdr": 0.03 if abs(r) > 0.45 else 0.08,
                              "slope_without_strong_enso": None, "p_without_strong_enso": None,
                              "slope_oni_removed": None, "p_oni_removed": None, "survives": True})
            brk_rows.append({"id": cid, "indicator": ind, "pettitt_year": 2014 if cid == "N1345W08815" else 2009,
                             "p": 0.02 if (cid == "N1345W08815" and ind == "annual_mm") else 0.4,
                             "flag": bool(cid == "N1345W08815" and ind == "annual_mm")})

    out = io.REPO_ROOT / io.SYNTHETIC_DIR
    out.mkdir(parents=True, exist_ok=True)
    cells.to_csv(out / "cells.csv", index=False)
    pd.DataFrame(ind_rows).to_csv(out / "indicators.csv", index=False)
    clim_df.round(1).to_csv(out / "climatology.csv", index=False)
    phases.to_csv(out / "enso_phases.csv", index=False)
    brk = pd.DataFrame(brk_rows)
    brk.to_csv(out / "break_2014.csv", index=False)
    enso = pd.DataFrame(enso_rows)
    enso.to_csv(out / "enso_test.csv", index=False)
    _fill_enso_test(cfg, out)
    print(f"Datos sintéticos escritos en {out}")


def _fill_enso_test(cfg, out):
    """Calcula la prueba ENSO sintética con el mismo motor (quitar años fuertes)."""
    from altaris import stats

    years = io.period_years(cfg)
    ind = pd.read_csv(out / "indicators.csv")
    ph = pd.read_csv(out / "enso_phases.csv")
    strong = set(ph.loc[ph["strong"], "year"].astype(int))
    table = io.series_table(ind, years)
    enso = pd.read_csv(out / "enso_test.csv")
    for i, r in enso.iterrows():
        vals = table[(r["id"], r["indicator"])].copy()
        base = stats.sen_slope(years, vals)
        keep = vals.copy()
        keep[[y in strong for y in years]] = np.nan
        s = stats.sen_slope(years, keep)
        mk = stats.mann_kendall(years, keep)
        enso.loc[i, "slope_without_strong_enso"] = round(s.slope_dec, 2)
        enso.loc[i, "p_without_strong_enso"] = round(mk.p, 4)
        enso.loc[i, "slope_oni_removed"] = round(s.slope_dec, 2)
        enso.loc[i, "p_oni_removed"] = round(mk.p, 4)
        enso.loc[i, "survives"] = bool(np.sign(s.slope_dec) == np.sign(base.slope_dec)
                                       and base.ci_low_dec <= s.slope_dec <= base.ci_high_dec)
    enso.to_csv(out / "enso_test.csv", index=False)


if __name__ == "__main__":
    main()
