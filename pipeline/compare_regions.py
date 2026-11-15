"""Compara dos exportaciones del motor (p. ej. la versión de 3 países y la de Centroamérica) SOBRE LAS CELDAS COMUNES.

  python compare_regions.py --old ../rol5-panel-app/public/data --new /ruta/ca/data [--md COMPARACION.md]

Qué debe cumplirse (condiciones 1 y 2 del GO/NO-GO de docs/10-centroamerica.md):
  1. Todo lo que es POR CELDA es idéntico: serie, media, pendiente, intervalo, p, huella, ventanas, prueba ENSO,
     salto de 2014. Si algo de esto difiere, no es un efecto de agregar celdas: hay un error o un dato distinto.
  2. Lo único que puede cambiar es lo que depende de las demás celdas: p ajustado (FDR) y, por él, el veredicto
     (consistente <-> limitada). Todo cambio de veredicto debe cruzar el umbral de FDR; si no, sale como NO EXPLICADO.

Salida: informe en Markdown (pantalla y, con --md, archivo). Código de salida 0 si 1 y 2 se cumplen; 1 si no.
Solo lee los JSON ya exportados. Código escrito con asistencia de IA (Claude); revisado por el equipo.
"""
import argparse
import collections
import json
import sys
from pathlib import Path

GRID_SAME = ("mean", "slope_dec", "ci95", "p", "sign_agreement", "sig_fraction", "enso_r", "valid_years")
CASES = ("N1335W08715", "N1475W08765", "N1495W09125")


def _load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def _fdr_level(meta, default=0.05):
    try:
        return float(meta["thresholds"]["stats"]["fdr"]["level"])
    except (KeyError, TypeError):
        return default


def _cell_diffs(a: dict, b: dict, base_key: str) -> list[str]:
    """Campos por celda que difieren entre dos JSON de la misma celda."""
    out = []
    if a.get("monthly_climatology_mm") != b.get("monthly_climatology_mm"):
        out.append("monthly_climatology_mm")
    if a.get("has_canicula") != b.get("has_canicula"):
        out.append("has_canicula")
    for k in sorted(set(a["indicators"]) | set(b["indicators"])):
        ia, ib = a["indicators"].get(k), b["indicators"].get(k)
        if ia is None or ib is None:
            out.append(f"{k}: indicador solo en una de las dos")
            continue
        for f in ("units", "series", "footprint", "enso_test", "break_2014"):
            if ia.get(f) != ib.get(f):
                out.append(f"{k}.{f}")
        sa = {x: v for x, v in (ia.get("statistics") or {}).items() if x != "adjusted_p_fdr"}
        sb = {x: v for x, v in (ib.get("statistics") or {}).items() if x != "adjusted_p_fdr"}
        if sa != sb:
            out.append(f"{k}.statistics")
        wa = {x: v for x, v in (ia.get("window_results") or {}).items() if x != base_key}
        wb = {x: v for x, v in (ib.get("window_results") or {}).items() if x != base_key}
        if wa != wb:
            out.append(f"{k}.window_results")
    return out


def compare(old_dir, new_dir, cases=CASES) -> dict:
    old_dir, new_dir = Path(old_dir), Path(new_dir)
    go, gn = _load(old_dir / "grid.json")["cells"], _load(new_dir / "grid.json")["cells"]
    mo, mn = _load(old_dir / "meta.json"), _load(new_dir / "meta.json")
    level = _fdr_level(mn)
    base_key = f"{mn['period'][0]}-{mn['period'][1]}"
    old, new = {c["id"]: c for c in go}, {c["id"]: c for c in gn}
    common = sorted(set(old) & set(new))
    res = {"n_old": len(old), "n_new": len(new), "n_common": len(common), "only_old": sorted(set(old) - set(new)),
           "n_only_new": len(set(new) - set(old)), "fdr_level": level, "period_same": mo["period"] == mn["period"],
           "thresholds_same": mo.get("thresholds") == mn.get("thresholds"), "grid_diffs": [], "cell_diffs": [],
           "changes": [], "matrix": {}, "cases": {}}
    matrix = collections.defaultdict(collections.Counter)
    for cid in common:
        a, b = old[cid], new[cid]
        for k in sorted(set(a["ind"]) | set(b["ind"])):
            ga, gb = a["ind"].get(k), b["ind"].get(k)
            if ga is None or gb is None:
                res["grid_diffs"].append((cid, k, "indicador", ga is None, gb is None))
                continue
            for f in GRID_SAME:
                if ga.get(f) != gb.get(f):
                    res["grid_diffs"].append((cid, k, f, ga.get(f), gb.get(f)))
            matrix[k][(ga["verdict"], gb["verdict"])] += 1
            if ga["verdict"] != gb["verdict"]:
                crossed = (ga["p_fdr"] is not None and gb["p_fdr"] is not None
                           and (ga["p_fdr"] < level) != (gb["p_fdr"] < level))
                res["changes"].append({"id": cid, "country": a["country"], "ind": k, "old": ga["verdict"],
                                       "new": gb["verdict"], "p_fdr_old": ga["p_fdr"], "p_fdr_new": gb["p_fdr"],
                                       "explained": bool(crossed)})
    for cid in common:  # el detalle por celda es más caro: solo se lee una vez por celda
        d = _cell_diffs(_load(old_dir / "cells" / f"{cid}.json"), _load(new_dir / "cells" / f"{cid}.json"), base_key)
        if d:
            res["cell_diffs"].append((cid, d))
    res["matrix"] = {k: dict(v) for k, v in matrix.items()}
    for cid in cases:
        if cid in old and cid in new:
            res["cases"][cid] = {k: {"old": old[cid]["ind"][k]["verdict"], "new": new[cid]["ind"][k]["verdict"],
                                     "p_fdr_old": old[cid]["ind"][k]["p_fdr"], "p_fdr_new": new[cid]["ind"][k]["p_fdr"]}
                                 for k in old[cid]["ind"] if k in new[cid]["ind"]}
        else:
            res["cases"][cid] = None
    res["go1_ok"] = not res["grid_diffs"] and not res["cell_diffs"]
    res["go2_ok"] = all(c["explained"] for c in res["changes"]) and all(
        v is None or all(x["old"] == x["new"] for x in v.values()) for v in res["cases"].values())
    return res


def report(r: dict, limit: int | None = 40) -> str:
    L = ["# Comparación de regiones", ""]
    L += [f"- Celdas en la versión anterior: **{r['n_old']}**; en la nueva: **{r['n_new']}** (comunes: **{r['n_common']}**, solo en la nueva: {r['n_only_new']}).",
          f"- Mismo periodo: **{'sí' if r['period_same'] else 'NO'}**. Umbrales idénticos en `meta.json`: **{'sí' if r['thresholds_same'] else 'NO'}**.",
          f"- Nivel de FDR usado para explicar cambios: {r['fdr_level']}."]
    if r["only_old"]:
        L.append(f"- **Celdas que estaban antes y ya no están ({len(r['only_old'])}):** {', '.join(r['only_old'][:10])}…")
    L += ["", "## Condición 1: lo que es por celda debe ser idéntico", ""]
    if r["go1_ok"]:
        L.append(f"**CUMPLE.** En las {r['n_common']} celdas comunes coinciden serie, media, pendiente, intervalo, p, huella, ventanas, ENSO y salto de 2014.")
    else:
        L.append(f"**FALLA.** {len(r['grid_diffs'])} diferencias en `grid.json` y {len(r['cell_diffs'])} celdas con diferencias en su JSON. Primeras:")
        for x in (r["grid_diffs"][:10]):
            L.append(f"- grid {x[0]} {x[1]} `{x[2]}`: {x[3]} → {x[4]}")
        for cid, d in r["cell_diffs"][:10]:
            L.append(f"- celda {cid}: {', '.join(d[:6])}")
    L += ["", "## Condición 2: cambios de veredicto y su causa", ""]
    ch = r["changes"]
    unexplained = [c for c in ch if not c["explained"]]
    L.append(f"Celdas-indicador que cambiaron de veredicto: **{len(ch)}**; explicadas por el FDR (cruzan el umbral): **{len(ch) - len(unexplained)}**; **no explicadas: {len(unexplained)}**.")
    L += ["", "Matriz de transición (anterior → nueva), por indicador:", "", "| Indicador | Anterior | Nueva | Celdas |", "|---|---|---|---|"]
    for k, m in sorted(r["matrix"].items()):
        for (a, b), n in sorted(m.items(), key=lambda kv: (kv[0][0] != kv[0][1], -kv[1])):
            L.append(f"| {k} | {a} | {b} | {n}{' (cambió)' if a != b else ''} |")
    if ch:
        L += ["", "Cambios (primero los no explicados):", "", "| Celda | País | Indicador | Antes | Ahora | p FDR antes → ahora | ¿Por FDR? |", "|---|---|---|---|---|---|---|"]
        for c in sorted(ch, key=lambda c: (c["explained"], c["id"], c["ind"]))[: (limit or len(ch))]:
            pf = lambda x: "—" if x is None else f"{x:.4g}"
            L.append(f"| {c['id']} | {c['country']} | {c['ind']} | {c['old']} | {c['new']} | {pf(c['p_fdr_old'])} → {pf(c['p_fdr_new'])} | {'sí' if c['explained'] else '**NO**'} |")
        if limit and len(ch) > limit:
            L.append(f"\n(se muestran {limit} de {len(ch)}; usar --md para el listado completo)")
    L += ["", "## Los 3 casos", "", "| Celda | Indicador | Veredicto antes | ahora | p FDR antes → ahora |", "|---|---|---|---|---|"]
    for cid, v in r["cases"].items():
        if v is None:
            L.append(f"| {cid} | — | no está en una de las dos exportaciones | | |")
            continue
        for k, x in v.items():
            pf = lambda y: "—" if y is None else f"{y:.4g}"
            L.append(f"| {cid} | {k} | {x['old']} | {x['new']}{'' if x['old'] == x['new'] else ' **(cambió)**'} | {pf(x['p_fdr_old'])} → {pf(x['p_fdr_new'])} |")
    L += ["", "## Resultado para el GO/NO-GO", "",
          f"- Condición 1 (idéntico por celda): **{'OK' if r['go1_ok'] else 'FALLA'}**",
          f"- Condición 2 (cambios explicados por el FDR y casos sin cambio): **{'OK' if r['go2_ok'] else 'REVISAR'}**"]
    return "\n".join(L) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--old", required=True, help="carpeta con grid.json, meta.json y cells/ de la versión anterior")
    ap.add_argument("--new", required=True, help="ídem, de la versión nueva")
    ap.add_argument("--md", help="guarda el informe completo en este archivo")
    ap.add_argument("--cases", nargs="*", default=list(CASES))
    a = ap.parse_args()
    r = compare(a.old, a.new, tuple(a.cases))
    print(report(r))
    if a.md:
        Path(a.md).write_text(report(r, limit=None), encoding="utf-8")
    sys.exit(0 if r["go1_ok"] and r["go2_ok"] else 1)


if __name__ == "__main__":
    main()
