"""Cotejo del formulario de Centroamérica con el JSON: cada cifra que se pueda leer del texto se compara con los datos.

  python check_form_ca.py --data /ruta/ca/data --form ../docs/rol6/submission-en-ca.md

A diferencia de check_form_numbers.py (que guarda las cifras de la versión de 3 países), este NO lleva cifras escritas:
las lee del formulario con expresiones regulares y las compara con grid.json, cells/ y meta.json. Sirve para cualquier región.

Comprueba:
  * que no queden marcas [PENDING-CA];
  * que `data_kind` sea `observed`;
  * la tabla de resultados (por indicador y país, incluidas las filas "all ...");
  * toda mención "N cells" (debe ser el total o el de un país);
  * que aparezcan todos los países de los datos;
  * el DOI;
  * las frases "flagged in X % ... Y %" y "negative in N of M cells (median -Z % per decade)", si están;
  * la calibración ("consistent ... in pure noise"), si está.
Lo que el script no sabe leer (cifras de los casos, prosa libre) se cota a mano o con check_form_numbers.py.
Código de salida 1 si hay algo por REVISAR. Código escrito con asistencia de IA (Claude); revisado por el equipo.
"""
import argparse
import re
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ca_tables import CTRY, IND, collect  # noqa: E402

NUM = r"[\d][\d,]*"
rows = []


def chk(claim, form, actual, ok=None):
    if ok is None:
        ok = str(form) == str(actual)
    rows.append(("OK" if ok else "REVISAR", claim, str(form), str(actual)))


def n(s):
    return int(s.replace(",", ""))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", required=True)
    ap.add_argument("--form", required=True)
    a = ap.parse_args()
    grid, meta, cells = collect(a.data)
    text = Path(a.form).read_text(encoding="utf-8")
    total = len(grid)
    by_c = {c: sum(1 for g in grid if g["country"] == c) for c in {g["country"] for g in grid}}
    name2code = {v["en"].lower(): k for k, v in CTRY.items()}

    chk("Datos observados (data_kind)", "observed", meta.get("data_kind"))
    pend = [i + 1 for i, l in enumerate(text.splitlines()) if "[PENDING-CA]" in l]
    chk("Marcas [PENDING-CA] sin rellenar", 0, len(pend), ok=not pend)
    chk("DOI en el formulario", meta.get("dataset_doi"), meta.get("dataset_doi") if str(meta.get("dataset_doi")) in text else "no aparece")

    for c in sorted(by_c):
        nm = CTRY.get(c, {}).get("en", c)
        chk(f"País mencionado: {nm}", "sí", "sí" if nm.lower() in text.lower() else "no aparece")

    # menciones de número de celdas
    for m in re.finditer(rf"({NUM})\s+(?:land\s+)?cells\b", text):
        v = n(m.group(1))
        ok = v == total or v in by_c.values()
        chk(f"Mención «{m.group(0)}»", v, f"total {total:,}; por país {sorted(by_c.values(), reverse=True)}", ok=ok)

    # tabla de resultados
    ind_of = lambda s: next((k for k, v in IND.items() if s.lower().startswith(v["en"].lower()[:8])), None)
    seen = 0
    for line in text.splitlines():
        cols = [x.strip() for x in line.strip().strip("|").split("|")]
        if len(cols) != 6 or not all(re.fullmatch(NUM, x) for x in cols[2:]):
            continue
        k = ind_of(cols[0])
        if k is None:
            continue
        seen += 1
        who = cols[1].lower()
        sel = [g for g in grid if k in g["ind"] and (who.startswith("all") or name2code.get(who) == g["country"])]
        if not sel:
            chk(f"Tabla {cols[0]} / {cols[1]}", "fila reconocible", "país desconocido", ok=False)
            continue
        cnt = {v: sum(1 for g in sel if g["ind"][k]["verdict"] == v) for v in ("consistente", "limitada", "sin_evidencia")}
        form = tuple(n(x) for x in cols[2:])
        actual = (cnt["consistente"], cnt["limitada"], cnt["sin_evidencia"], len(sel))
        chk(f"Tabla {cols[0]} / {cols[1]}", form, actual)
    chk("Filas de la tabla de resultados leídas", ">= 1", seen, ok=seen >= 1)

    # salto de 2014. Se leen dos redacciones: por país («in Guatemala: 12.1 % of its cells for rainy-season rainfall and 34.9 %
    # for midsummer», «against 0.1 % and 2.2 % in Honduras») o de toda la región («flagged in 5.6 % of cells ... and 17.6 %»).
    def pct(k, code=None):
        ids = [g["id"] for g in grid if k in g["ind"] and (code is None or g["country"] == code)]
        return round(100 * sum(1 for i in ids if (cells[i]["indicators"][k].get("break_2014") or {}).get("flag")) / max(1, len(ids)), 1)

    ctry_re = r"([A-Z][a-z]+(?: [A-Z][a-z]+)?)"
    for m in re.finditer(rf"in {ctry_re}: ([\d.]+) % of its cells for rainy-season rainfall and ([\d.]+) % for midsummer", text):
        code = name2code.get(m.group(1).lower())
        if code:
            chk(f"Bandera 2014 {m.group(1)}: temporada (%)", float(m.group(2)), pct("may_oct_mm", code))
            chk(f"Bandera 2014 {m.group(1)}: canícula (%)", float(m.group(3)), pct("jul_aug_mm", code))
    for m in re.finditer(rf"([\d.]+) % and ([\d.]+) % in {ctry_re}", text):
        code = name2code.get(m.group(3).lower())
        if code:
            chk(f"Bandera 2014 {m.group(3)}: temporada (%)", float(m.group(1)), pct("may_oct_mm", code))
            chk(f"Bandera 2014 {m.group(3)}: canícula (%)", float(m.group(2)), pct("jul_aug_mm", code))
    m = re.search(r"flagged in ([\d.]+) % of cells for rainy-season[^.]*? and ([\d.]+) % for midsummer", text)
    if m:
        chk("Bandera 2014 región: temporada (%)", float(m.group(1)), pct("may_oct_mm"))
        chk("Bandera 2014 región: canícula (%)", float(m.group(2)), pct("jul_aug_mm"))

    # «negative in N of M cells (median −Z % per decade)»: se compara con el país nombrado antes, o con Honduras
    for m in re.finditer(rf"negative in ({NUM}) of ({NUM}) cells \(median [−-]([\d.]+) % per decade\)", text):
        pre = text[max(0, m.start() - 160):m.start()].lower()
        code = next((name2code[nm] for nm in name2code if nm in pre), "HND")
        r = [g["ind"]["may_oct_mm"] for g in grid if g["country"] == code and "may_oct_mm" in g["ind"]]
        chk(f"{CTRY[code]['en']}: celdas con pendiente negativa", f"{n(m.group(1)):,} de {n(m.group(2)):,}",
            f"{sum(x['slope_dec'] < 0 for x in r):,} de {len(r):,}")
        chk(f"{CTRY[code]['en']}: mediana % por década", -float(m.group(3)), round(statistics.median(100 * x["slope_dec"] / x["mean"] for x in r), 1))

    cal = meta.get("calibration") or {}
    m = re.search(r"consistent\W+appeared ([\d.]+) % of the time and \W*limited\W* ([\d.]+) %", text)
    if m and cal:
        chk("Calibración: consistente en ruido (%)", float(m.group(1)), round(100 * cal["false_positive_rate"]["consistente"], 1))
        chk("Calibración: limitada en ruido (%)", float(m.group(2)), round(100 * cal["false_positive_rate"]["limitada"], 1))

    bad = sum(r[0] != "OK" for r in rows)
    print(f"{len(rows) - bad} de {len(rows)} comprobaciones coinciden\n")
    print("| Estado | Comprobación | Formulario | Datos |\n|---|---|---|---|")
    for r in rows:
        print("| " + " | ".join(r) + " |")
    if pend:
        print(f"\nLíneas con [PENDING-CA]: {pend[:20]}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
