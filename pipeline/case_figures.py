"""Cifras exactas de uno o varios sitios, listas para el formulario, el video y el pasaporte.
Solo lee el JSON ya exportado; no recalcula nada.

  python case_figures.py --data ../rol5-panel-app/public/data --cells N1335W08715 N1495W09125 [--out casos.md]
"""
import argparse
import json
from pathlib import Path

NAMES = {"may_oct_mm": "Lluvia de temporada (may–oct)", "jul_aug_mm": "Lluvia de canícula (jul–ago)",
         "annual_mm": "Lluvia anual"}


def f(x, nd=1):
    return "—" if x is None else f"{x:.{nd}f}"


def window_summary(ind):
    wr = ind.get("window_results") or {}
    rows = [(k, w) for k, w in wr.items() if k != "2001-2024"]
    lens = lambda k: int(k.split("-")[1]) - int(k.split("-")[0]) + 1
    long = [(k, w) for k, w in rows if lens(k) >= 15]
    cnt = {}
    for _, w in long:
        cnt[w["verdict"]] = cnt.get(w["verdict"], 0) + 1
    return len(long), cnt


def card(data, cid, reasons):
    g = {c["id"]: c for c in json.loads((data / "grid.json").read_text(encoding="utf-8"))["cells"]}
    d = json.loads((data / "cells" / f"{cid}.json").read_text(encoding="utf-8"))
    c = g[cid]
    out = [f"## {cid} — {c['country']} (lat {c['lat']}, lon {c['lon']})", ""]
    out.append("| Indicador | Media | Pendiente por década | IC 95 % | p | p ajustado (FDR) | Huella: signo / significativas | ENSO (r) | Veredicto |")
    out.append("|---|---|---|---|---|---|---|---|---|")
    for k, ind in d["indicators"].items():
        s, gi = ind["statistics"], c["ind"][k]
        if not s:
            out.append(f"| {NAMES.get(k, k)} | — | — | — | — | — | — | — | {ind['verdict']} |")
            continue
        out.append(f"| {NAMES.get(k, k)} | {f(gi['mean'], 0)} {ind['units']} | {f(s['slope_per_decade'])} | "
                   f"[{f(s['ci_95'][0])}, {f(s['ci_95'][1])}] | {s['p_value']:.4g} | {gi['p_fdr']:.4g} | "
                   f"{gi['sign_agreement']:.2f} / {gi['sig_fraction']:.2f} | {f(gi['enso_r'], 2)} | **{ind['verdict']}** |")
    out.append("")
    for k, ind in d["indicators"].items():
        n, cnt = window_summary(ind)
        et, b = ind.get("enso_test") or {}, ind.get("break_2014") or {}
        out.append(f"**{NAMES.get(k, k)}**")
        out.append(f"- Razones del veredicto: {', '.join(ind['verdict_reasons'])}"
                   + (f" ({'; '.join(reasons[r]['es'] for r in ind['verdict_reasons'] if r in reasons)})" if reasons else ""))
        out.append(f"- Variante de Mann-Kendall: {ind['statistics']['mk_variant']}; autocorrelación lag-1: {ind['statistics']['lag1_autocorr']}")
        out.append(f"- Ventanas de ≥15 años ({n}): " + ", ".join(f"{v} {x}" for v, x in sorted(cnt.items())))
        if et:
            out.append(f"- ENSO: sin años fuertes {f(et.get('slope_without_strong_enso'))} (p {et.get('p_without_strong_enso')}); "
                       f"sin efecto ONI {f(et.get('slope_oni_removed'))} (p {et.get('p_oni_removed')}); sobrevive: {et.get('survives')}")
        if b:
            out.append(f"- Salto 2014 (Pettitt): año {b.get('pettitt_year')}, p {b.get('p')}, bandera {b.get('flag')}")
        out.append("")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--cells", nargs="+", required=True)
    ap.add_argument("--out")
    a = ap.parse_args()
    data = Path(a.data)
    try:
        reasons = json.loads((data / "reasons.json").read_text(encoding="utf-8"))
        reasons = {k: v for k, v in reasons.items()} if isinstance(reasons, dict) else {}
    except Exception:
        reasons = {}
    meta = json.loads((data / "meta.json").read_text(encoding="utf-8"))
    head = [f"# Cifras de los casos", "", f"Periodo {meta['period'][0]}–{meta['period'][1]}; {meta['dataset']}; DOI {meta['dataset_doi']}; "
            f"motor `{meta['pipeline_commit']}`; calibración: {'sí' if meta.get('calibration') else 'no'}.", ""]
    text = "\n".join(head + [card(data, c, reasons) for c in a.cells])
    if a.out:
        Path(a.out).write_text(text, encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
