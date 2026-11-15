"""Pasos del pipeline del Rol 2. Los scripts 04, 05, 08, 09 y 11 son envoltorios finos.

04 trends      → data/interim/trends.csv
05 footprint   → data/interim/footprint.json + footprint_summary.csv
08 verdict     → data/interim/verdicts.csv + verdict_summary.csv
09 calibration → data/interim/calibration.json
11 export      → web/public/data/{meta,grid}.json + cells/{id}.json
"""
from __future__ import annotations

import datetime as dt
import time

import numpy as np
import pandas as pd

from . import io, stats
from .verdict import VerdictInput, decide


def _log(msg: str) -> None:
    print(f"[{dt.datetime.now():%H:%M:%S}] {msg}", flush=True)


# ---------------------------------------------------------------------------
# 04 — Tendencias por celda e indicador + FDR
# ---------------------------------------------------------------------------

def run_trends(cfg: dict) -> pd.DataFrame:
    t0 = time.time()
    years = io.period_years(cfg)
    cells = io.load_cells(cfg)
    table = io.series_table(io.load_indicators(cfg), years)
    land = set(cells["id"])
    alpha = cfg["stats"]["alpha"]
    rows = []
    for (cid, ind), vals in table.items():
        if cid not in land:
            continue
        sen = stats.sen_slope(years, vals, alpha=alpha, x0=years[0])
        mk = stats.mann_kendall(years, vals, alpha=alpha, autocorr_alpha=cfg["stats"]["autocorr_alpha"])
        valid = vals[np.isfinite(vals)]
        rows.append({
            "id": cid, "indicator": ind,
            "n_years": len(years), "valid_years": int(len(valid)),
            "mean": float(valid.mean()) if len(valid) else np.nan,
            "cv": stats.coefficient_of_variation(vals),
            "slope_dec": sen.slope_dec, "intercept": sen.intercept, "x0": sen.x0,
            "ci_lo": sen.ci_low_dec, "ci_hi": sen.ci_high_dec,
            "p": mk.p, "mk_variant": mk.variant, "lag1": mk.lag1_autocorr,
        })
    df = pd.DataFrame(rows)
    # FDR por indicador sobre las celdas de tierra
    df["p_fdr"] = np.nan
    for ind, idx in df.groupby("indicator").groups.items():
        df.loc[idx, "p_fdr"] = stats.fdr_adjust(df.loc[idx, "p"].to_numpy(), cfg["stats"]["fdr_method"])
    df = df.sort_values(["id", "indicator"]).reset_index(drop=True)
    out = io.path(cfg, "trends")
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    _log(f"04 tendencias: {len(df)} series ({df['id'].nunique()} celdas) en {time.time() - t0:.1f} s → {out.name}")
    return df


# ---------------------------------------------------------------------------
# 05 — Huella de estabilidad
# ---------------------------------------------------------------------------

def run_footprint(cfg: dict) -> pd.DataFrame:
    t0 = time.time()
    years = io.period_years(cfg)
    table = io.series_table(io.load_indicators(cfg), years)
    trends = pd.read_csv(io.path(cfg, "trends"))
    fcfg = cfg["footprint"]
    recs = list(trends.itertuples(index=False))
    n_jobs = int(fcfg.get("n_jobs", 1))
    args = [(years, table[(r.id, r.indicator)], fcfg["min_len"], fcfg["min_valid_fraction"]) for r in recs]
    if n_jobs != 1 and len(args) > 200:
        from joblib import Parallel, delayed
        all_fp = Parallel(n_jobs=n_jobs, batch_size=64)(delayed(stats.footprint)(*a) for a in args)
    else:
        all_fp = [stats.footprint(*a) for a in args]
    fps, rows = {}, []
    for r, fp in zip(recs, all_fp):
        fps[f"{r.id}|{r.indicator}"] = [[s, e, io.rnd(sl, 3), io.rnd(p, 5)] for s, e, sl, p in fp]
        sa, sf, nw = stats.footprint_summary(fp, r.slope_dec, fcfg["verdict_min_len"], cfg["stats"]["alpha"])
        rows.append({"id": r.id, "indicator": r.indicator, "sign_agreement": sa,
                     "sig_fraction": sf, "n_windows_verdict": nw, "n_windows": len(fp)})
    io.write_json(fps, io.path(cfg, "footprint"))
    df = pd.DataFrame(rows)
    df.to_csv(io.path(cfg, "footprint_summary"), index=False)
    _log(f"05 huella: {len(df)} series × {df['n_windows'].max() if len(df) else 0} ventanas "
         f"en {time.time() - t0:.1f} s")
    return df


# ---------------------------------------------------------------------------
# 08 — Veredicto
# ---------------------------------------------------------------------------

def _optional_lookup(df: pd.DataFrame | None, col: str) -> dict:
    if df is None or col not in df.columns:
        return {}
    return {(r["id"], r["indicator"]): r[col] for _, r in df.iterrows()}


def _as_bool(x):
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return None
    if isinstance(x, str):
        return x.strip().lower() in ("true", "1", "yes", "si", "sí")
    return bool(x)


def run_verdict(cfg: dict) -> pd.DataFrame:
    trends = pd.read_csv(io.path(cfg, "trends"))
    fps = pd.read_csv(io.path(cfg, "footprint_summary"))
    df = trends.merge(fps, on=["id", "indicator"], how="left")
    enso = _optional_lookup(io.load_optional_csv(cfg, "enso_test"), "survives")
    brk = _optional_lookup(io.load_optional_csv(cfg, "break_2014"), "flag")
    if not enso:
        _log("08 aviso: no hay enso_test.csv (Rol 3); la condición ENSO queda pendiente")
    if not brk:
        _log("08 aviso: no hay break_2014.csv (Rol 1); el chequeo 2014 queda pendiente")
    verdicts, reasons, tags = [], [], []
    for r in df.itertuples(index=False):
        key = (r.id, r.indicator)
        res = decide(VerdictInput(
            valid_years=r.valid_years, n_years=r.n_years, slope_dec=r.slope_dec,
            ci_low=r.ci_lo, ci_high=r.ci_hi, p=r.p, p_fdr=r.p_fdr, mean=r.mean,
            sign_agreement=r.sign_agreement, sig_fraction=r.sig_fraction, cv=r.cv,
            enso_survives=_as_bool(enso.get(key)) if enso else None,
            break_2014_flag=_as_bool(brk.get(key)) if brk else None,
        ), cfg["verdict"])
        verdicts.append(res.verdict)
        reasons.append(";".join(res.reasons))
        tags.append(";".join(res.tags))
    df["verdict"], df["verdict_reasons"], df["tags"] = verdicts, reasons, tags
    df.to_csv(io.path(cfg, "verdicts"), index=False)

    # Tabla resumen (para Rol 6): celdas por veredicto, país e indicador
    cells = io.load_cells(cfg)[["id", "country"]]
    summ = (df.merge(cells, on="id").groupby(["indicator", "country", "verdict"]).size()
            .unstack("verdict", fill_value=0))
    for v in ("consistente", "limitada", "sin_evidencia", "incompleta"):
        if v not in summ.columns:
            summ[v] = 0
    summ = summ[["consistente", "limitada", "sin_evidencia", "incompleta"]]
    summ["total"] = summ.sum(axis=1)
    summ.to_csv(io.path(cfg, "verdict_summary"))
    _log("08 veredictos por indicador y país:\n" + summ.to_string())
    return df


# ---------------------------------------------------------------------------
# 09 — Calibración: falsos positivos y potencia (sección 4.7)
# ---------------------------------------------------------------------------

def _engine_verdicts(years, series_list, cfg) -> list[str]:
    """Pasa series por el motor completo (Sen, MK, huella, FDR conjunto, veredicto).

    Supuestos declarados: la prueba ENSO se da por superada y no hay bandera
    de 2014 (no aplican a series barajadas). El FDR se aplica sobre el
    conjunto de series simuladas.
    """
    alpha = cfg["stats"]["alpha"]
    fcfg = cfg["footprint"]
    rows = []
    for vals in series_list:
        sen = stats.sen_slope(years, vals, alpha=alpha)
        mk = stats.mann_kendall(years, vals, alpha=alpha, autocorr_alpha=cfg["stats"]["autocorr_alpha"])
        fp = stats.footprint(years, vals, fcfg["verdict_min_len"], fcfg["min_valid_fraction"])
        sa, sf, _ = stats.footprint_summary(fp, sen.slope_dec, fcfg["verdict_min_len"], alpha)
        valid = vals[np.isfinite(vals)]
        rows.append((sen, mk, sa, sf, len(valid), float(valid.mean()) if len(valid) else np.nan,
                     stats.coefficient_of_variation(vals)))
    p_fdr = stats.fdr_adjust([r[1].p for r in rows], cfg["stats"]["fdr_method"])
    out = []
    for (sen, mk, sa, sf, nv, mean, cv), pf in zip(rows, p_fdr):
        out.append(decide(VerdictInput(nv, len(years), sen.slope_dec, sen.ci_low_dec, sen.ci_high_dec,
                                       mk.p, pf, mean, sa, sf, cv, enso_survives=True,
                                       break_2014_flag=False), cfg["verdict"]).verdict)
    return out


def _rates(verdicts: list[str]) -> dict:
    n = len(verdicts)
    c = sum(v == "consistente" for v in verdicts)
    lim = sum(v == "limitada" for v in verdicts)
    return {"consistente": c / n, "limitada": lim / n, "limitada_o_mas": (c + lim) / n}


def run_calibration(cfg: dict, n_sim: int | None = None) -> dict:
    t0 = time.time()
    ccfg = cfg["calibration"]
    n_sim = int(n_sim or ccfg["n_sim"])
    rng = np.random.default_rng(ccfg["seed"])
    years = io.period_years(cfg)
    table = io.series_table(io.load_indicators(cfg), years)
    trends = pd.read_csv(io.path(cfg, "trends"))
    ok = trends[trends["n_years"] - trends["valid_years"] <= cfg["verdict"]["max_missing_years"]]
    keys = list(zip(ok["id"], ok["indicator"]))
    if not keys:
        raise RuntimeError("No hay series completas para calibrar")
    pick = rng.choice(len(keys), size=n_sim, replace=len(keys) < n_sim)
    # Barajar el orden de los años destruye cualquier tendencia (y también la autocorrelación)
    shuffled = [rng.permutation(table[keys[i]]) for i in pick]

    null_rates = _rates(_engine_verdicts(years, shuffled, cfg))
    power = []
    for pct in ccfg["injected_trend_pct_per_decade"]:
        injected = []
        for vals in shuffled:
            mean = np.nanmean(vals)
            trend = pct / 100 * mean / 10 * (years - years[0])
            injected.append(np.clip(vals + trend, 0, None))
        r = _rates(_engine_verdicts(years, injected, cfg))
        power.append({"injected_trend_pct_per_decade": pct,
                      "detected_consistente": r["consistente"],
                      "detected_limitada_o_mas": r["limitada_o_mas"]})
    result = {
        "n_sim": n_sim,
        "seed": ccfg["seed"],
        "false_positive_rate": {"consistente": null_rates["consistente"], "limitada": null_rates["limitada"]},
        "power": power[0],
        "power_all": power,
        "assumptions": [
            "series reales elegidas al azar entre las completas y barajadas en el tiempo",
            "barajar destruye también la autocorrelación",
            "FDR aplicado sobre el conjunto de series simuladas",
            "la prueba ENSO se da por superada y no hay bandera de 2014",
        ],
    }
    io.write_json(result, io.path(cfg, "calibration"))
    _log(f"09 calibración ({n_sim} series, {time.time() - t0:.1f} s): "
         f"falsos positivos consistente={null_rates['consistente']:.3f} limitada={null_rates['limitada']:.3f}; "
         + "; ".join(f"potencia {p['injected_trend_pct_per_decade']}%/déc: consistente={p['detected_consistente']:.3f}, "
                     f"limitada o más={p['detected_limitada_o_mas']:.3f}" for p in power))
    return result


# ---------------------------------------------------------------------------
# 11 — Exportar JSON para la web (contrato de la sección 3.2)
# ---------------------------------------------------------------------------

GENERAL_LIMITATIONS = [
    "celda_11km",            # no ve microclimas de ladera
    "agregado_mensual",      # no mide rachas secas ni extremos diarios
    "registro_corto",        # variabilidad decenal y tendencia pueden confundirse
    "union_trmm_gpm",        # posible discontinuidad instrumental ~2014
    "pluviometros_escasos",  # ajuste más débil donde hay pocos pluviómetros
    "oni_no_nasa",           # ONI no es dato de la NASA
    "huella_no_es_prueba",   # ventanas solapadas: exploración de sensibilidad
]

VERDICT_LABEL = {
    "es": {"consistente": "Evidencia consistente", "limitada": "Evidencia limitada (señal débil, no confirmada)",
           "sin_evidencia": "Sin evidencia suficiente", "incompleta": "Evaluación incompleta"},
    "en": {"consistente": "Consistent evidence", "limitada": "Limited evidence (weak, unconfirmed signal)",
           "sin_evidencia": "Insufficient evidence", "incompleta": "Incomplete assessment"},
}


def template_narrative(ind_cfg: dict, period: list[int], r, verdict: str) -> dict:
    """Plantilla determinista (Plan B del narrador de Rol 6). Solo usa cifras del JSON."""
    a, b = period
    lab = VERDICT_LABEL
    if verdict == "incompleta":
        es = f"{ind_cfg['label_es']}: solo hay {r.valid_years}/{r.n_years} años válidos, así que no se evalúa la tendencia."
        en = f"{ind_cfg['label_en']}: only {r.valid_years}/{r.n_years} valid years, so the trend is not assessed."
    else:
        s, lo, hi = io.rnd(r.slope_dec, 1), io.rnd(r.ci_lo, 1), io.rnd(r.ci_hi, 1)
        u = ind_cfg["units"]
        es = (f"{ind_cfg['label_es']}, {a}–{b}: pendiente de Sen de {s:+} {u} por década "
              f"(IC 95 %: {lo} a {hi}). Veredicto: {lab['es'][verdict]}.")
        en = (f"{ind_cfg['label_en']}, {a}–{b}: Sen slope of {s:+} {u} per decade "
              f"(95% CI: {lo} to {hi}). Verdict: {lab['en'][verdict]}.")
        if verdict == "sin_evidencia":
            es += " No encontrar una tendencia también es un hallazgo."
            en += " Not finding a trend is a finding too."
    return {"es": es, "en": en, "generated_by": "template"}


def run_export(cfg: dict, generated_at: str | None = None) -> None:
    t0 = time.time()
    years = io.period_years(cfg)
    cells = io.load_cells(cfg)
    table = io.series_table(io.load_indicators(cfg), years)
    vdf = pd.read_csv(io.path(cfg, "verdicts"), keep_default_na=True)
    fps = io.read_json(io.path(cfg, "footprint"))
    clim = io.load_optional_csv(cfg, "climatology")
    enso_df = io.load_optional_csv(cfg, "enso_test")
    brk_df = io.load_optional_csv(cfg, "break_2014")
    phases = io.load_optional_csv(cfg, "enso_phases")
    narr_path = io.path(cfg, "narratives") if "narratives" in cfg["paths"] else None
    narratives = io.read_json(narr_path) if narr_path and narr_path.exists() else {}
    calib_path = io.path(cfg, "calibration")
    calib = io.read_json(calib_path) if calib_path.exists() else None

    enso_by = {(r["id"], r["indicator"]): r for _, r in enso_df.iterrows()} if enso_df is not None else {}
    brk_by = {(r["id"], r["indicator"]): r for _, r in brk_df.iterrows()} if brk_df is not None else {}
    clim_by = {r["id"]: [io.rnd(r[f"m{m}"], 1) for m in range(1, 13)]
               for _, r in clim.iterrows()} if clim is not None else {}
    phase_by = {}
    if phases is not None:
        for _, r in phases.iterrows():
            phase_by[(r["indicator"], int(r["year"]))] = (r["phase"], _as_bool(r.get("strong")))

    out_dir = io.REPO_ROOT / cfg["paths"]["web_data"]
    (out_dir / "cells").mkdir(parents=True, exist_ok=True)
    grid_cells = []
    period = list(cfg["period"])

    for c in cells.itertuples(index=False):
        sub = vdf[vdf["id"] == c.id]
        if sub.empty:
            continue
        canicula = _as_bool(c.canicula)
        grid_ind, detail_ind = {}, {}
        for r in sub.itertuples(index=False):
            key = (c.id, r.indicator)
            e = enso_by.get(key)
            b = brk_by.get(key)
            reasons = [x for x in str(r.verdict_reasons).split(";") if x and x != "nan"]
            tags = [x for x in str(r.tags).split(";") if x and x != "nan"]
            grid_ind[r.indicator] = {
                "mean": io.rnd(r.mean, 1), "slope_dec": io.rnd(r.slope_dec, 2),
                "ci95": [io.rnd(r.ci_lo, 2), io.rnd(r.ci_hi, 2)],
                "p": io.rnd(r.p, 4), "p_fdr": io.rnd(r.p_fdr, 4),
                "sign_agreement": io.rnd(r.sign_agreement, 3), "sig_fraction": io.rnd(r.sig_fraction, 3),
                "enso_r": io.rnd(e["enso_r"], 3) if e is not None and "enso_r" in e else None,
                "enso_p_fdr": io.rnd(e["enso_p_fdr"], 4) if e is not None and "enso_p_fdr" in e else None,
                "valid_years": int(r.valid_years), "verdict": r.verdict, "tags": tags,
            }
            vals = table[key]
            series = []
            for y, v in zip(years, vals):
                ph = phase_by.get((r.indicator, int(y)))
                series.append({"year": int(y), "value": io.rnd(v, 1),
                               "anomaly": io.rnd(v - r.mean, 1) if np.isfinite(v) else None,
                               "enso": ph[0] if ph else None,
                               "enso_strong": ph[1] if ph else None})
            limitations = list(GENERAL_LIMITATIONS)
            if r.indicator == "jul_aug_mm" and canicula is False:
                limitations.append("canicula_no_aplica")
            if r.verdict == "incompleta":
                limitations.append("anos_faltantes")
            if "posible_salto_2014" in reasons:
                limitations.append("posible_salto_2014")
            detail_ind[r.indicator] = {
                "units": cfg["indicators"][r.indicator]["units"],
                "mean": io.rnd(r.mean, 1),
                "valid_years": int(r.valid_years), "n_years": int(r.n_years),
                "series": series,
                "statistics": {
                    "method": "Theil-Sen + Mann-Kendall",
                    "mk_variant": r.mk_variant,
                    "lag1_autocorr": io.rnd(r.lag1, 3),
                    "slope_per_decade": io.rnd(r.slope_dec, 2),
                    "intercept": io.rnd(r.intercept, 2),
                    "intercept_year": int(r.x0),
                    "ci_95": [io.rnd(r.ci_lo, 2), io.rnd(r.ci_hi, 2)],
                    "p_value": io.rnd(r.p, 4), "adjusted_p_fdr": io.rnd(r.p_fdr, 4),
                    "sign_agreement": io.rnd(r.sign_agreement, 3), "sig_fraction": io.rnd(r.sig_fraction, 3),
                    "cv": io.rnd(r.cv, 3),
                },
                "footprint": fps.get(f"{c.id}|{r.indicator}", []),
                "enso_test": None if e is None else {
                    "slope_without_strong_enso": io.rnd(e.get("slope_without_strong_enso"), 2),
                    "p_without_strong_enso": io.rnd(e.get("p_without_strong_enso"), 4),
                    "slope_oni_removed": io.rnd(e.get("slope_oni_removed"), 2),
                    "p_oni_removed": io.rnd(e.get("p_oni_removed"), 4),
                    "survives": _as_bool(e.get("survives")),
                },
                "break_2014": None if b is None else {
                    "pettitt_year": int(b["pettitt_year"]) if pd.notna(b.get("pettitt_year")) else None,
                    "p": io.rnd(b.get("p"), 4), "flag": _as_bool(b.get("flag")),
                },
                "verdict": r.verdict,
                "verdict_reasons": reasons,
                "tags": tags,
                "narrative": narratives.get(f"{c.id}|{r.indicator}")
                or template_narrative(cfg["indicators"][r.indicator], period, r, r.verdict),
                "limitations": limitations,
            }
        grid_cells.append({"id": c.id, "lat": float(c.lat), "lon": float(c.lon), "country": c.country,
                           "cluster": None, "canicula": canicula, "ind": grid_ind})
        io.write_json({
            "id": c.id,
            "name": c.name if isinstance(c.name, str) else None,
            "lat": float(c.lat), "lon": float(c.lon), "country": c.country,
            "canicula": canicula,
            "monthly_climatology_mm": clim_by.get(c.id),
            "indicators": detail_ind,
        }, out_dir / "cells" / f"{c.id}.json")

    io.write_json({"cells": grid_cells}, out_dir / "grid.json")

    meta = {
        "generated_at": generated_at or dt.datetime.now().astimezone().isoformat(timespec="seconds"),
        "pipeline_commit": io.git_commit(),
        "synthetic": cfg["synthetic"],
        "dataset": ("DATOS SINTÉTICOS (inventados para desarrollo; no usar en la entrega)"
                    if cfg["synthetic"] else cfg["dataset"]),
        "dataset_doi": cfg["dataset_doi"],
        "period": period,
        "bbox": cfg["region"]["bbox"],
        "n_cells": len(grid_cells),
        "indicators": list(cfg["indicators"].keys()),
        "indicator_info": cfg["indicators"],
        "thresholds": {"stats": cfg["stats"], "footprint": cfg["footprint"], "verdict": cfg["verdict"]},
        "threshold_changes": cfg.get("threshold_changes", []),
        "calibration": calib or {"n_sim": cfg["calibration"]["n_sim"],
                                 "false_positive_rate": {"consistente": None, "limitada": None},
                                 "power": {"injected_trend_pct_per_decade": cfg["calibration"]["injected_trend_pct_per_decade"][0],
                                           "detected_consistente": None, "detected_limitada_o_mas": None}},
        "aux_data": cfg["aux_data"],
        "lenses": cfg["lenses"],
        "inputs_available": {"enso_test": enso_df is not None, "break_2014": brk_df is not None,
                             "climatology": clim is not None, "enso_phases": phases is not None},
        "recipe": recipe(cfg),
    }
    io.write_json(meta, out_dir / "meta.json")
    _log(f"11 exportados {len(grid_cells)} celdas a {out_dir} en {time.time() - t0:.1f} s")


def recipe(cfg: dict) -> dict:
    """Fragmento de "receta reproducible" para el pasaporte (Rol 2, B4–B5)."""
    a, b = cfg["period"]
    v = cfg["verdict"]
    return {
        "data_search": {"short_name": "GPM_3IMERGM", "version": "07", "temporal": f"{a}-01 a {b}-12",
                        "bbox": cfg["region"]["bbox"], "tool": "earthaccess (NASA Earthdata)"},
        "conversion": "mm/mes = tasa (mm/h) × 24 × días reales del mes (con bisiestos)",
        "indicators": {k: val["units"] for k, val in cfg["indicators"].items()},
        "trend": "scipy.stats.theilslopes(y, x, alpha=0.95); pendiente × 10 = por década",
        "significance": ("pymannkendall: original_test, o hamed_rao_modification_test si la "
                         "autocorrelación lag-1 de los residuos de Sen es significativa (límites de Anderson)"),
        "multiple_testing": f"statsmodels multipletests(method='{cfg['stats']['fdr_method']}') por indicador sobre las celdas de tierra",
        "footprint": (f"Sen + Mann-Kendall original en toda ventana de ≥{cfg['footprint']['min_len']} años; "
                      f"resumen sobre ventanas de ≥{cfg['footprint']['verdict_min_len']} años; p sin corregir"),
        "verdict_rules": {
            "incompleta": f"faltan más de {v['max_missing_years']} años válidos",
            "consistente": (f"p_FDR < {v['fdr_level']} y IC 95 % sin 0 y sign_agreement ≥ {v['sign_agreement_consistente']} "
                            f"y sig_fraction ≥ {v['sig_fraction_consistente']} y sobrevive ENSO y sin salto 2014"),
            "limitada": (f"no consistente y (p < {v['p_raw_limitada']} o (sign_agreement ≥ {v['sign_agreement_limitada']} "
                         f"y |pendiente| ≥ {v['min_slope_pct_mean_per_decade']} % de la media por década"
                         + (f" y p < {v['p_max_sign_rule']}" if v.get("p_max_sign_rule") is not None else "")
                         + "))"),
            "sin_evidencia": "todo lo demás",
        },
        "command": "python pipeline/run_all.py",
    }
