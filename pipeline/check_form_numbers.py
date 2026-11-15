"""Tarea 16: cada cifra de docs/rol6/submission-en.md frente a los datos publicados.

  python pipeline/check_form_numbers.py .      (desde la raíz del repositorio)

Código escrito con asistencia de IA (Claude); revisado por el equipo.
"""
import csv, json, statistics, sys
from pathlib import Path

R = Path(sys.argv[1])
D = R / "rol5-panel-app/public/data"
grid = json.load(open(D / "grid.json", encoding="utf-8"))["cells"]
cells = {c["id"]: c for c in grid}
rows = []


def chk(claim, form, actual, ok=None):
    if ok is None:
        ok = str(form) == str(actual)
    rows.append((("OK" if ok else "REVISAR"), claim, str(form), str(actual)))


def cell(cid):
    return json.load(open(D / "cells" / f"{cid}.json", encoding="utf-8"))["indicators"]


def close(a, b, tol):
    return abs(float(a) - float(b)) <= tol


# Datos
chk("Celdas", 2025, len(grid))
vy = {c["ind"][k]["valid_years"] for c in grid for k in c["ind"]}
chk("Años válidos en todas las celdas", "{24}", vy)

meta = json.load(open(D / "meta.json", encoding="utf-8"))
chk("DOI", "10.5067/GPM/IMERG/3B-MONTH/07", meta["dataset_doi"])
chk("Periodo", "[2001, 2024]", meta["period"])

# Tabla de resultados
vs = {(r["indicator"], r["country"]): r for r in csv.DictReader(open(D / "verdict_summary.csv", encoding="utf-8"))}
form_tab = {("may_oct_mm", "HND"): (0, 295, 644, 939), ("may_oct_mm", "SLV"): (0, 70, 99, 169),
            ("may_oct_mm", "GTM"): (44, 556, 317, 917), ("annual_mm", "HND"): (0, 89, 850, 939),
            ("annual_mm", "SLV"): (0, 30, 139, 169), ("annual_mm", "GTM"): (56, 496, 365, 917)}
for k, f in form_tab.items():
    r = vs[k]
    a = (int(r["consistente"]), int(r["limitada"]), int(r["sin_evidencia"]), int(r["total"]))
    chk(f"Tabla {k[0]} {k[1]}", f, a)
ja = [vs[("jul_aug_mm", c)] for c in ("HND", "SLV", "GTM")]
a = (sum(int(r["consistente"]) for r in ja), sum(int(r["limitada"]) for r in ja),
     sum(int(r["sin_evidencia"]) for r in ja), sum(int(r["total"]) for r in ja))
chk("Tabla jul_aug_mm tres países", (0, 956, 1069, 2025), a)

# Honduras
hn = [c["ind"]["may_oct_mm"] for c in grid if c["country"] == "HND"]
chk("Honduras: celdas con pendiente negativa (temporada)", "924 de 939", f"{sum(i['slope_dec'] < 0 for i in hn)} de {len(hn)}")
med = statistics.median(100 * i["slope_dec"] / i["mean"] for i in hn)
chk("Honduras: mediana % por década", -4.5, round(med, 1))
# Guatemala franja
cons = [c["ind"]["may_oct_mm"] for c in grid if c["ind"]["may_oct_mm"]["verdict"] == "consistente"]
med = statistics.median(100 * i["slope_dec"] / i["mean"] for i in cons)
chk("Franja de Guatemala: mediana % por década (temporada, consistente)", -19, round(med), ok=round(med) == -19)
rng = [100 * i["slope_dec"] / i["mean"] for i in cons]
chk("Todas las consistente están en Guatemala", "GTM", ",".join(sorted({c["country"] for c in grid if any(c["ind"][k]["verdict"] == "consistente" for k in c["ind"])})))

# ENSO
for k in ("may_oct_mm", "jul_aug_mm"):
    chk(f"ENSO: correlación negativa en todas las celdas ({k})", "2025 de 2025", f"{sum(c['ind'][k]['enso_r'] < 0 for c in grid)} de 2025")

# POWER
x = list(csv.DictReader(open(R / "data/rol1/power/crosscheck.csv", encoding="utf-8")))
chk("POWER: signo distinto en 3 sitios", "7 de 9", f"{sum(r['same_sign'] == 'no' for r in x)} de {len(x)}")
pc = {(r["cell_id"], r["indicator"]): r for r in csv.DictReader(open(R / "data/rol1/power_casos/crosscheck.csv", encoding="utf-8"))}
p = pc[("N1495W09125", "may_oct_mm")]
chk("Caso 3: POWER mm por década", "+40 frente a -452", f"{float(p['power_slope_dec_mm']):+.0f} frente a {float(p['imerg_slope_dec_mm']):.0f}")
chk("Caso 3: r IMERG-POWER año a año", 0.18, round(float(p["pearson_r_interannual"]), 2))

# Calibración
cal = json.load(open(R / "pipeline/calibration.json", encoding="utf-8"))
chk("Calibración: simulaciones", 1000, cal["n_sim"])
chk("Calibración: consistente en ruido %", 0.0, round(100 * cal["false_positive_rate"]["consistente"], 1))
chk("Calibración: limitada en ruido %", 33.1, round(100 * cal["false_positive_rate"]["limitada"], 1))
pw = {p["injected_trend_pct_per_decade"]: p for p in cal["power_all"]}
chk("Calibración: -10 %/década -> consistente %", 15.2, round(100 * pw[-10.0]["detected_consistente"], 1))
chk("Calibración: -20 %/década -> consistente %", 54.4, round(100 * pw[-20.0]["detected_consistente"], 1))

# Casos
c1 = cell("N1335W08715")["may_oct_mm"]
s = c1["statistics"]
chk("Caso 1: pendiente", -48, round(s["slope_per_decade"]))
chk("Caso 1: IC 95 %", "[-257, 171]", f"[{round(s['ci_95'][0])}, {round(s['ci_95'][1])}]")
chk("Caso 1: p ajustado", 0.88, round(s["adjusted_p_fdr"], 2))
chk("Caso 1: veredicto", "sin_evidencia", c1["verdict"])
chk("Caso 1: r con ONI", -0.64, round(cells["N1335W08715"]["ind"]["may_oct_mm"]["enso_r"], 2))
c2 = cell("N1475W08765")["may_oct_mm"]
fp = {(w[0], w[1]): w for w in c2["footprint"]}
chk("Caso 2: periodo completo", -48, round(c2["statistics"]["slope_per_decade"]))
chk("Caso 2: veredicto completo", "sin_evidencia", c2["verdict"])
chk("Caso 2: 2008-2023 pendiente", -345, round(fp[(2008, 2023)][2]))
chk("Caso 2: 2008-2023 veredicto", "limitada", c2["window_results"]["2008-2023"]["verdict"])
chk("Caso 2: 2001-2010 pendiente", 382, round(fp[(2001, 2010)][2]))
chk("Caso 2: 2001-2010 veredicto", "limitada", c2["window_results"]["2001-2010"]["verdict"])
ser = c2["series"]
ys = ser.get("years") if isinstance(ser, dict) else None
vals = ser.get("values") if isinstance(ser, dict) else None
if ys is None and isinstance(ser, list):
    ys = [r[0] if isinstance(r, list) else r["year"] for r in ser]
    vals = [r[1] if isinstance(r, list) else r["value"] for r in ser]
ann = cell("N1475W08765")["may_oct_mm"]["series"]
if isinstance(ann, dict):
    ay, av = ann["years"], ann["values"]
else:
    ay = [r[0] if isinstance(r, list) else r["year"] for r in ann]
    av = [r[1] if isinstance(r, list) else r["value"] for r in ann]
chk("Caso 2: año más húmedo (temporada)", "2008", str(sorted(zip(av, ay), reverse=True)[0][1]))
chk("Caso 2: 2010 y 2011 entre los 4 más húmedos (temporada)", "sí", "sí" if {2010, 2011} <= {y for _, y in sorted(zip(av, ay), reverse=True)[:4]} else "no")
c3 = cell("N1495W09125")["may_oct_mm"]
s = c3["statistics"]
chk("Caso 3: pendiente", -452, round(s["slope_per_decade"]))
chk("Caso 3: media mm", 1478, round(cells["N1495W09125"]["ind"]["may_oct_mm"]["mean"]))
chk("Caso 3: p ajustado", 0.032, round(s["adjusted_p_fdr"], 3))
chk("Caso 3: veredicto", "consistente", c3["verdict"])

# Banderas de 2014 por país
br = {(r["cell_id"], r["indicator"]): r["flag"] == "true" for r in csv.DictReader(open(R / "data/rol3/break2014.csv", encoding="utf-8"))}
form_br = {"GTM": (12.1, 34.9), "HND": (0.1, 2.2), "SLV": (0.6, 8.9)}
for ctry, (fm, fj) in form_br.items():
    ids = [c["id"] for c in grid if c["country"] == ctry]
    am = round(100 * sum(br[(i, "may_oct_mm")] for i in ids) / len(ids), 1)
    aj = round(100 * sum(br[(i, "jul_aug_mm")] for i in ids) / len(ids), 1)
    chk(f"Bandera 2013-2015 {ctry} (temporada, canícula) %", (fm, fj), (am, aj))

ok = sum(r[0] == "OK" for r in rows)
print(f"{ok} de {len(rows)} cifras coinciden\n")
print("| Estado | Cifra | Formulario | Datos |\n|---|---|---|---|")
for r in rows:
    print("| " + " | ".join(r) + " |")
