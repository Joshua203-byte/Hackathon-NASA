"""Exportador: series por celda -> meta.json, grid.json, cells/{id}.json, reasons.json (contrato del plan 3.2)."""
from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from . import analyze, indicators as ind, narrative, reasons, stats
from .analyze import num


def _clean_json(o):
    """Garantiza JSON válido: NaN/inf -> null."""
    if isinstance(o, dict):
        return {k: _clean_json(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_clean_json(v) for v in o]
    if isinstance(o, (float, np.floating)):
        return float(o) if math.isfinite(o) else None
    if isinstance(o, np.integer):
        return int(o)
    return o


def run(cells, series, cfg, out_dir, *, monthly=None, enso_results=None, breaks=None, enso_phase=None,
        calibration=None, narratives=None, n_jobs=1, commit="LOCAL", data_kind="observed", generated_at=None) -> dict:
    """Corre todo y escribe los JSON. Devuelve un resumen (conteo de veredictos)."""
    out = Path(out_dir)
    (out / "cells").mkdir(parents=True, exist_ok=True)
    enso_results, breaks = enso_results or {}, breaks or {}
    keys = list(cfg["indicators"])
    ids = [c["id"] for c in cells]

    # 1) análisis numérico de cada celda e indicador
    todo = [(c, k) for c in ids for k in keys if k in series.get(c, {})]
    if n_jobs != 1 and len(todo) > 50:
        from joblib import Parallel, delayed  # el orden se conserva: el resultado es idéntico al serial
        res = Parallel(n_jobs=n_jobs, batch_size="auto")(
            delayed(analyze.analyze_indicator)(k, *series[c][k], cfg) for c, k in todo)
    else:
        res = [analyze.analyze_indicator(k, *series[c][k], cfg) for c, k in todo]
    ana = dict(zip(todo, res))

    # 2) FDR por indicador, a través de las celdas
    p_fdr = {}
    for k in keys:
        cs = [c for c in ids if (c, k) in ana]
        adj = stats.fdr_adjust([ana[(c, k)].mk.p for c in cs], cfg["stats"]["fdr"]["method"]) if cs else []
        for c, v in zip(cs, adj):
            p_fdr[(c, k)] = float(v) if math.isfinite(v) else None

    # 3) etiqueta alta_variabilidad: CV por encima del percentil configurado, por indicador
    pct = cfg["verdict"]["alta_variabilidad"]["percentile"]
    cv_thr = {}
    for k in keys:
        cvs = [ana[(c, k)].cv for c in ids if (c, k) in ana and math.isfinite(ana[(c, k)].cv)]
        cv_thr[k] = float(np.percentile(cvs, pct)) if cvs else float("inf")

    # 4) construir y escribir
    counts: dict[str, dict[str, int]] = {k: {} for k in keys}
    grid_cells = []
    by_country: dict = {}
    for cell in cells:
        c = cell["id"]
        built_all, grid_ind = {}, {}
        for k in keys:
            if (c, k) not in ana:
                continue
            a = ana[(c, k)]
            er = enso_results.get((c, k))
            tags = ["alta_variabilidad"] if math.isfinite(a.cv) and a.cv >= cv_thr[k] else []
            built = analyze.build_indicator(
                a, cfg, cfg["indicators"][k]["units"], p_fdr=p_fdr[(c, k)],
                enso_phase=(enso_phase.get(k) if enso_phase and k in enso_phase else enso_phase),
                enso_test=er, break_2014=breaks.get((c, k)), tags=tags)
            nar = (narratives or {}).get(f"{c}|{k}")
            built["narrative"] = nar if nar else narrative.template(
                k, cfg["indicators"][k]["units"], cfg["period"], a.valid_years, a.n_years, built["statistics"], built["verdict"])
            built_all[k] = built
            grid_ind[k] = analyze.grid_indicator(
                a, built, p_fdr=p_fdr[(c, k)], enso_r=None if er is None else er.get("enso_r"),
                enso_p_fdr=None if er is None else er.get("enso_p_fdr"))
            by_country.setdefault((k, cell.get("country", ""), built["verdict"]), 0)
            by_country[(k, cell.get("country", ""), built["verdict"])] += 1
            counts[k][built["verdict"]] = counts[k].get(built["verdict"], 0) + 1

        clim, canicula = [None] * 12, None
        if monthly and c in monthly:
            m = ind.monthly_matrix(list(range(cfg["period"][0], cfg["period"][1] + 1)), monthly[c])
            clim = [num(v, 1) for v in ind.climatology(m)]
            canicula = ind.has_canicula(ind.climatology(m))
        detail = {"id": c, "name": None, "monthly_climatology_mm": clim, "has_canicula": canicula, "indicators": built_all}
        (out / "cells" / f"{c}.json").write_text(json.dumps(_clean_json(detail), ensure_ascii=False), encoding="utf-8")
        grid_cells.append({"id": c, "lat": cell["lat"], "lon": cell["lon"], "country": cell.get("country", ""),
                           "cluster": None, "ind": grid_ind})

    (out / "grid.json").write_text(json.dumps(_clean_json({"cells": grid_cells}), ensure_ascii=False), encoding="utf-8")
    meta = {
        "data_kind": data_kind,
        "generated_at": generated_at or datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
        "pipeline_commit": commit,
        "dataset": cfg["dataset"]["name"] + (" (DATOS SINTÉTICOS)" if data_kind == "mock" else ""),
        "dataset_doi": cfg["dataset"]["doi"],
        "period": list(cfg["period"]),
        "bbox": cfg["bbox"],
        "n_cells": len(cells),
        "indicators": keys,
        "threshold_changes": cfg.get("threshold_changes", []),
        "recipe": recipe(cfg),
        "thresholds": {"version": cfg["version"], "frozen": cfg["frozen"], "stats": cfg["stats"], "verdict": cfg["verdict"],
                       "window_verdict": cfg["window_verdict"]},
        "calibration": calibration,
        "aux_data": cfg["dataset"]["aux"],
        "lenses": cfg["lenses"],
    }
    (out / "meta.json").write_text(json.dumps(_clean_json(meta), ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "reasons.json").write_text(json.dumps(reasons.catalog(), ensure_ascii=False, indent=1), encoding="utf-8")
    _write_summary(out / "verdict_summary.csv", by_country)
    return {"n_cells": len(cells), "verdicts": counts}


def _write_summary(path, by_country) -> None:
    """Tabla para Rol 6: celdas por indicador, país y veredicto."""
    order = ("consistente", "limitada", "sin_evidencia", "incompleta")
    rows = sorted({(k, c) for k, c, _ in by_country})
    lines = ["indicator,country," + ",".join(order) + ",total"]
    for k, c in rows:
        vals = [by_country.get((k, c, v), 0) for v in order]
        lines.append(f"{k},{c}," + ",".join(map(str, vals)) + f",{sum(vals)}")
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def recipe(cfg: dict) -> dict:
    """Receta reproducible para el pasaporte (idea de Elena, adaptada a este motor)."""
    a, b = cfg["period"]
    v, st = cfg["verdict"], cfg["stats"]
    lim, con = v["limitada"], v["consistente"]
    cap = lim.get("p_max_sign_rule")
    return {
        "data_search": {"short_name": "GPM_3IMERGM", "version": "07", "temporal": f"{a}-01 a {b}-12",
                        "bbox": cfg["bbox"], "tool": "earthaccess (NASA Earthdata)"},
        "conversion": "mm/mes = tasa (mm/h) × 24 × días reales del mes (con bisiestos)",
        "indicators": {k: s["units"] for k, s in cfg["indicators"].items()},
        "trend": "scipy.stats.theilslopes; pendiente × 10 = por década",
        "significance": "Mann-Kendall (pymannkendall); Hamed-Rao si la autocorrelación lag-1 de los residuos es positiva y significativa",
        "multiple_testing": f"Benjamini-Hochberg por indicador sobre las celdas (nivel {st['fdr']['level']})",
        "footprint": (f"Sen + Mann-Kendall en toda ventana de ≥{st['footprint']['min_len']} años; resumen con ventanas de "
                      f"≥{st['footprint']['summary_min_len']} años; p sin corregir"),
        "verdict_rules": {
            "incompleta": f"faltan más de {v['max_missing_years']} años válidos",
            "consistente": (f"p_FDR < {st['fdr']['level']}, IC 95 % sin 0, sign_agreement ≥ {con['sign_agreement_min']}, "
                            f"sig_fraction ≥ {con['sig_fraction_min']}, sobrevive ENSO, sin salto 2014"),
            "limitada": (f"p < {lim['p_unadjusted_max']} o (sign_agreement ≥ {lim['sign_agreement_min']} y |pendiente| ≥ "
                         f"{lim['min_slope_pct_of_mean_per_decade']} % de la media por década"
                         + (f" y p < {cap}" if cap is not None else "") + ")"),
            "sin_evidencia": "todo lo demás",
        },
        "command": "python pipeline/run_pilot.py (ver pipeline/README.md)",
    }
