"""Tablas en Markdown, listas para pegar en el formulario, a partir de una exportación del motor.

  python ca_tables.py --data /ruta/ca/data                 # en inglés (el formulario va en inglés)
  python ca_tables.py --data /ruta/ca/data --lang es --out TABLAS.md

Todo sale del JSON ya exportado (grid.json, cells/, meta.json); no calcula tendencias ni cambia nada.
Cada cifra del formulario debe salir de aquí o de `check_form_ca.py`.
Código escrito con asistencia de IA (Claude); revisado por el equipo.
"""
import argparse
import collections
import json
import statistics
from pathlib import Path

IND = {"may_oct_mm": {"en": "Rainy season (May–Oct)", "es": "Lluvia de temporada (may–oct)"},
       "jul_aug_mm": {"en": "Midsummer (Jul–Aug)", "es": "Canícula (jul–ago)"},
       "annual_mm": {"en": "Annual", "es": "Anual"}}
CTRY = {"HND": {"en": "Honduras", "es": "Honduras"}, "GTM": {"en": "Guatemala", "es": "Guatemala"},
        "SLV": {"en": "El Salvador", "es": "El Salvador"}, "BLZ": {"en": "Belize", "es": "Belice"},
        "NIC": {"en": "Nicaragua", "es": "Nicaragua"}, "CRI": {"en": "Costa Rica", "es": "Costa Rica"},
        "PAN": {"en": "Panama", "es": "Panamá"}}
VERD = ("consistente", "limitada", "sin_evidencia", "incompleta")
VERD_L = {"en": {"consistente": "Consistent", "limitada": "Limited", "sin_evidencia": "No evidence", "incompleta": "Incomplete"},
          "es": {"consistente": "Consistente", "limitada": "Limitada", "sin_evidencia": "Sin evidencia", "incompleta": "Incompleta"}}
T = {"en": {"cells": "Cells", "country": "Country", "ind": "Indicator", "total": "Total", "all": "All countries"},
     "es": {"cells": "Celdas", "country": "País", "ind": "Indicador", "total": "Total", "all": "Todos los países"}}


def _name(code, lang):
    return CTRY.get(code, {}).get(lang, code)


def collect(data_dir):
    d = Path(data_dir)
    grid = json.loads((d / "grid.json").read_text(encoding="utf-8"))["cells"]
    meta = json.loads((d / "meta.json").read_text(encoding="utf-8"))
    cells = {c["id"]: json.loads((d / "cells" / f"{c['id']}.json").read_text(encoding="utf-8")) for c in grid}
    return grid, meta, cells


def tables(data_dir, lang="en") -> str:
    grid, meta, cells = collect(data_dir)
    keys = [k for k in IND if any(k in c["ind"] for c in grid)]
    countries = sorted({c["country"] for c in grid}, key=lambda x: -sum(1 for c in grid if c["country"] == x))
    t = T[lang]
    L = [f"# {'Tables for the form' if lang == 'en' else 'Tablas para el formulario'}", "",
         f"Source: `{data_dir}` · data_kind `{meta.get('data_kind')}` · engine `{meta.get('pipeline_commit')}` · "
         f"period {meta['period'][0]}–{meta['period'][1]} · DOI {meta.get('dataset_doi')}", ""]
    if meta.get("data_kind") != "observed":
        L += ["> **DATOS NO OBSERVADOS (`data_kind` distinto de `observed`): no usar estas cifras en el formulario.**", ""]
    L += [f"## 1. {t['cells']}", "", f"Total: **{len(grid):,}** cells.", "", f"| {t['country']} | {t['cells']} |", "|---|---|"]
    L += [f"| {_name(c, lang)} | {sum(1 for g in grid if g['country'] == c):,} |" for c in countries]

    L += ["", "## 2. Verdicts by country and indicator" if lang == "en" else "## 2. Veredictos por país e indicador", ""]
    L += [f"| {t['ind']} | {t['country']} | " + " | ".join(VERD_L[lang][v] for v in VERD[:3]) + f" | {t['cells']} |", "|---|---|---|---|---|---|"]
    for k in keys:
        for c in countries:
            n = collections.Counter(g["ind"][k]["verdict"] for g in grid if g["country"] == c and k in g["ind"])
            L.append(f"| {IND[k][lang]} | {_name(c, lang)} | " + " | ".join(f"{n[v]:,}" for v in VERD[:3]) + f" | {sum(n.values()):,} |")
        n = collections.Counter(g["ind"][k]["verdict"] for g in grid if k in g["ind"])
        L.append(f"| {IND[k][lang]} | **{t['all']}** | " + " | ".join(f"**{n[v]:,}**" for v in VERD[:3]) + f" | **{sum(n.values()):,}** |")
    inc = sum(1 for g in grid for k in g["ind"] if g["ind"][k]["verdict"] == "incompleta")
    L += ["", f"Incomplete: {inc}."]

    L += ["", "## 3. 2014 break flag (Pettitt, change in 2013–2015)" if lang == "en" else "## 3. Bandera del salto de 2014 (Pettitt, cambio en 2013–2015)", "",
          f"| {t['ind']} | {t['country']} | flagged | {t['cells']} | % |", "|---|---|---|---|---|"]
    for k in keys:
        for c in countries + [None]:
            ids = [g["id"] for g in grid if (c is None or g["country"] == c) and k in g["ind"]]
            fl = sum(1 for i in ids if (cells[i]["indicators"][k].get("break_2014") or {}).get("flag"))
            L.append(f"| {IND[k][lang]} | {_name(c, lang) if c else '**' + t['all'] + '**'} | {fl:,} | {len(ids):,} | {100 * fl / max(1, len(ids)):.1f} |")

    L += ["", "## 4. Slopes (rainy season)" if lang == "en" else "## 4. Pendientes (lluvia de temporada)", "",
          f"| {t['country']} | negative / cells | median % per decade | smallest adjusted p |" if lang == "en"
          else f"| {t['country']} | negativas / celdas | mediana % por década | menor p ajustado |", "|---|---|---|---|"]
    for c in countries:
        r = [g["ind"]["may_oct_mm"] for g in grid if g["country"] == c and "may_oct_mm" in g["ind"] and g["ind"]["may_oct_mm"]["slope_dec"] is not None]
        if not r:
            continue
        pct = statistics.median(100 * x["slope_dec"] / x["mean"] for x in r if x["mean"])
        pf = min((x["p_fdr"] for x in r if x["p_fdr"] is not None), default=float("nan"))
        L.append(f"| {_name(c, lang)} | {sum(x['slope_dec'] < 0 for x in r):,} / {len(r):,} | {pct:+.1f} | {pf:.3f} |")

    L += ["", "## 5. ENSO", "", "| Indicator | r with ONI: min to max | cells with positive r | significant after FDR | trend does not survive ENSO check |" if lang == "en"
          else "| Indicador | r con ONI: mín a máx | celdas con r positiva | significativas tras FDR | la tendencia no sobrevive al control |", "|---|---|---|---|---|"]
    for k in keys:
        r = [g["ind"][k] for g in grid if k in g["ind"] and g["ind"][k]["enso_r"] is not None]
        ns = sum(1 for g in grid if k in g["ind"] and (cells[g["id"]]["indicators"][k].get("enso_test") or {}).get("survives") is False)
        if not r:  # exportación sin control de ENSO todavía
            L.append(f"| {IND[k][lang]} | {'pending' if lang == 'en' else 'pendiente'} | | | |")
            continue
        L.append(f"| {IND[k][lang]} | {min(x['enso_r'] for x in r):.2f} to {max(x['enso_r'] for x in r):.2f} | {sum(x['enso_r'] > 0 for x in r):,} | "
                 f"{sum(1 for x in r if x['enso_p_fdr'] is not None and x['enso_p_fdr'] < 0.05):,} | {ns:,} |")

    L += ["", "## 6. Cells rated `consistente`" if lang == "en" else "## 6. Celdas `consistente`", "",
          f"| {t['ind']} | " + " | ".join(_name(c, lang) for c in countries) + " |", "|---|" + "---|" * len(countries)]
    for k in keys:
        L.append(f"| {IND[k][lang]} | " + " | ".join(str(sum(1 for g in grid if g['country'] == c and k in g['ind'] and g['ind'][k]['verdict'] == 'consistente')) for c in countries) + " |")
    lat = [g for g in grid if "may_oct_mm" in g["ind"] and g["ind"]["may_oct_mm"]["verdict"] == "consistente"]
    if lat:
        L.append(f"\nRainy-season `consistente` cells span lat {min(g['lat'] for g in lat):.2f} to {max(g['lat'] for g in lat):.2f}, lon {min(g['lon'] for g in lat):.2f} to {max(g['lon'] for g in lat):.2f}.")

    cal = meta.get("calibration") or {}
    if cal:
        pw = {p["injected_trend_pct_per_decade"]: p for p in cal.get("power_all", [])}
        L += ["", "## 7. Calibration" if lang == "en" else "## 7. Calibración", "",
              f"- Simulations: {cal.get('n_sim')}",
              f"- `consistente` in pure noise: {100 * cal['false_positive_rate']['consistente']:.1f} %; `limitada`: {100 * cal['false_positive_rate']['limitada']:.1f} %"]
        for p in sorted(pw):
            L.append(f"- Injected {p:+.0f} % per decade: `consistente` {100 * pw[p]['detected_consistente']:.1f} %, `limitada` or more {100 * pw[p]['detected_limitada_o_mas']:.1f} %")
    return "\n".join(L) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", required=True, help="carpeta con grid.json, meta.json y cells/")
    ap.add_argument("--lang", choices=("en", "es"), default="en")
    ap.add_argument("--out")
    a = ap.parse_args()
    text = tables(a.data, a.lang)
    print(text)
    if a.out:
        Path(a.out).write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
