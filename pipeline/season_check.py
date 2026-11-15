"""¿Cuándo llueve más en cada país? Revisa si 'lluvia de mayo a octubre' y 'canícula' describen la temporada de cada celda.

  python season_check.py --data ../rol5-panel-app/public/data            # carpeta con grid.json y cells/
  python season_check.py --data /ruta/a/ca/data --csv tabla.csv

Para cada celda toma su ciclo mensual (monthly_climatology_mm) y busca la ventana de 6 meses consecutivos más lluviosa.
Imprime, por país: cuántas celdas la empiezan en mayo, junio, julio o después, y cuántas no tienen canícula.
Solo lee el JSON ya exportado; no calcula tendencias.
"""
import argparse
import collections
import csv
import json
from pathlib import Path


def wet_start(monthly):
    """Mes (1-12) en que empieza la ventana circular de 6 meses con más lluvia."""
    return max(range(12), key=lambda i: sum(monthly[(i + k) % 12] for k in range(6))) + 1


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", required=True)
    ap.add_argument("--csv")
    a = ap.parse_args()
    root = Path(a.data)
    grid = json.loads((root / "grid.json").read_text(encoding="utf-8"))["cells"]
    rows = collections.defaultdict(lambda: collections.Counter())
    skipped = 0
    for c in grid:
        d = json.loads((root / "cells" / f"{c['id']}.json").read_text(encoding="utf-8"))
        m = d.get("monthly_climatology_mm") or []
        if len(m) != 12 or any(v is None for v in m):
            skipped += 1
            continue
        r = rows[c["country"]]
        r["celdas"] += 1
        s = wet_start(m)
        r["mayo" if s == 5 else "junio" if s == 6 else "jul_o_despues" if s >= 7 else "antes_de_mayo"] += 1
        r["sin_canicula"] += 0 if d.get("has_canicula") else 1
    cols = ["celdas", "antes_de_mayo", "mayo", "junio", "jul_o_despues", "sin_canicula"]
    print("pais," + ",".join(cols) + "\n" + "\n".join(f"{p}," + ",".join(str(rows[p][k]) for k in cols) for p in sorted(rows)))
    tot = {k: sum(rows[p][k] for p in rows) for k in cols}
    print("TOTAL," + ",".join(str(tot[k]) for k in cols))
    if skipped:
        print(f"(sin ciclo mensual completo, omitidas: {skipped})")
    print("\nLectura: 'mayo' y 'junio' calzan con la ventana mayo-octubre; 'jul_o_despues' tiene su temporada lluviosa en otros meses.")
    if a.csv:
        with open(a.csv, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f); w.writerow(["pais"] + cols)
            for p in sorted(rows):
                w.writerow([p] + [rows[p][k] for k in cols])


if __name__ == "__main__":
    main()
