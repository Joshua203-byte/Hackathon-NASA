"""Rol 1 · 04 — NASA POWER por punto: segunda variable y contraste de signo con IMERG.

  python 04_power.py                                  # 3 sitios de contraste (Choluteca, La Ceiba, Cd. de Guatemala)
  python 04_power.py --cells N1335W08715 N1575W08685  # los sitios de los casos que elija Camila
  python 04_power.py --cells ... --out ../data/rol1/power_casos        # sin tocar el contraste entregado

Código escrito con asistencia de IA (Claude); revisado y probado por el equipo (ver docs/rol1-datos.md).

Verificado en la API de POWER (Monthly API v2.10.0, 15 nov 2026):
  * PRECTOTCORR  "The average MERRA-2 bias corrected total precipitation" · mm/day
  * T2M          temperatura del aire a 2 m · °C
  * ALLSKY_SFC_SW_DWN  irradiancia solar global horizontal, cielo real · MJ/m²/day
  * fuentes declaradas por la API: MERRA2 (lluvia y T2M) y SYN1DEG/CERES (radiación); relleno -999.
  * la clave AAAA13 de la respuesta es el valor anual; aquí se ignora y se recalcula desde los meses.

Salida en data/rol1/power/:
  power_monthly.csv   cell_id,parameter,year,month,value   (lluvia ya en mm/mes con días reales)
  power_series.csv    cell_id,indicator,year,value         (mismo formato que series.csv)
  power_trends.csv    Sen + Mann-Kendall con las MISMAS funciones del motor de Joshua (altaris/stats.py)
  crosscheck.csv      signo de la tendencia de lluvia IMERG vs POWER y correlación interanual
  provenance.json     URL, versión, fecha de acceso, definiciones y cita pedida por POWER
"""
import argparse
import csv
import json
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402

from altaris import imerg, stats  # noqa: E402
from altaris.config import load_config  # noqa: E402
from altaris.indicators import indicators_from_monthly  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
API = "https://power.larc.nasa.gov/api/temporal/monthly/point"
PARAMS = {"PRECTOTCORR": "mm/day", "T2M": "C", "ALLSKY_SFC_SW_DWN": "MJ/m^2/day"}
CROSSCHECK = {"N1335W08715": "Choluteca (HND, Pacífico)", "N1575W08685": "La Ceiba (HND, Caribe)",
              "N1465W09055": "Ciudad de Guatemala (GTM, altiplano)"}
FILL = -999.0


def fetch(lat, lon, y0, y1, retries=4):
    url = (f"{API}?parameters={','.join(PARAMS)}&community=AG&longitude={lon:.2f}&latitude={lat:.2f}"
           f"&start={y0}&end={y1}&format=JSON")
    for k in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "altaris-pipeline"})
            with urllib.request.urlopen(req, timeout=180) as r:
                return url, json.load(r)
        except Exception:
            if k == retries - 1:
                raise
            time.sleep(2 ** k)


def monthly_values(resp, param, y0, y1):
    """{(año, mes): valor} sin el anual (AAAA13); relleno → None. Lluvia: mm/día → mm/mes."""
    raw = resp["properties"]["parameter"][param]
    out = {}
    for y in range(y0, y1 + 1):
        for m in range(1, 13):
            v = raw.get(f"{y}{m:02d}")
            if v is None or v == FILL:
                out[(y, m)] = None
            elif param == "PRECTOTCORR":
                out[(y, m)] = float(v) * imerg.days_in_month(y, m)
            else:
                out[(y, m)] = float(v)
    return out


def seasonal_mean(vals, years, months):
    """Media de los meses indicados (para T2M y radiación); None si falta alguno. Nunca se rellena."""
    res = []
    for y in years:
        xs = [vals[(y, m)] for m in months]
        res.append(None if any(x is None for x in xs) else float(np.mean(xs)))
    return res


def trend(years, values, cfg):
    ys = np.array(years, float)
    vs = np.array([np.nan if v is None else v for v in values], float)
    sen = stats.sen_slope(ys, vs, confidence=cfg["stats"]["confidence"])
    mk = stats.mann_kendall(ys, vs, sen=sen, lag1_z=cfg["stats"]["lag1_z"])
    return sen, mk


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cells", nargs="*", help="cell_id de los sitios (por defecto, los 3 de contraste)")
    ap.add_argument("--out", default=None, help="carpeta de salida (por defecto, data/rol1/power)")
    a = ap.parse_args()
    cfg = load_config()
    y0, y1 = cfg["period"]
    years = list(range(y0, y1 + 1))
    out = Path(a.out).resolve() if a.out else REPO / "data" / "rol1" / "power"
    out.mkdir(parents=True, exist_ok=True)

    cells = {r["cell_id"]: r for r in csv.DictReader(open(REPO / "data/rol1/cells.csv", encoding="utf-8"))}
    imerg_series = {}
    for r in csv.DictReader(open(REPO / "data/rol1/series.csv", encoding="utf-8")):
        imerg_series.setdefault((r["cell_id"], r["indicator"]), {})[int(r["year"])] = float(r["value"]) if r["value"] else None
    targets = a.cells or list(CROSSCHECK)
    missing = [c for c in targets if c not in cells]
    if missing:
        sys.exit(f"Estas celdas no están en data/rol1/cells.csv: {missing}")

    prov = {"service": "NASA POWER Monthly and Annual API", "endpoint": API, "community": "AG",
            "parameters": {}, "requests": [], "accessed": imerg.now_iso(),
            "reference": ("The data was obtained from National Aeronautics and Space Administration (NASA) Langley "
                          "Research Center's Prediction Of Worldwide Energy Resources (POWER) project funded through "
                          "the NASA Earth Science Division."),
            "data_reference": None,
            "independence_note": ("PRECTOTCORR es reanálisis MERRA-2 con corrección de sesgo, no el algoritmo "
                                  "satelital de IMERG. No se verificó con qué observaciones se corrige el sesgo; "
                                  "como ambos productos pueden usar pluviómetros, se trata como contraste "
                                  "parcialmente independiente. Resolución nativa de MERRA-2 (~0.5° × 0.625°), "
                                  "mucho más gruesa que IMERG (0.1°)."),
            "conversion": "PRECTOTCORR: mm/día × días reales del mes = mm/mes; T2M y radiación: medias mensuales"}

    rows_m, rows_s, rows_t, rows_x = [], [], [], []
    for cid in targets:
        lat, lon = float(cells[cid]["lat"]), float(cells[cid]["lon"])
        url, resp = fetch(lat, lon, y0, y1)
        hdr = resp.get("header", {})
        prov["requests"].append({"cell_id": cid, "url": url, "power_grid_point": resp.get("geometry", {}).get("coordinates"),
                                 "sources": hdr.get("sources"), "api_version": hdr.get("api", {}).get("version")})
        prov["parameters"].update({k: v for k, v in resp.get("parameters", {}).items()})
        ver = hdr.get("api", {}).get("version", "?")
        prov["data_reference"] = f"The data was obtained from the POWER Project's Monthly {ver} version on {time.strftime('%Y/%m/%d')}."
        vals = {p: monthly_values(resp, p, y0, y1) for p in PARAMS}
        for p, d in vals.items():
            for (y, m), v in sorted(d.items()):
                rows_m.append([cid, p, y, m, "" if v is None else f"{v:.3f}"])
        # lluvia POWER: mismos indicadores (sumas) y misma regla de validez que IMERG
        mat = np.array([[np.nan if vals["PRECTOTCORR"][(y, m)] is None else vals["PRECTOTCORR"][(y, m)]
                         for m in range(1, 13)] for y in years])
        series = {f"power_{k}": v for k, v in indicators_from_monthly(mat, cfg["indicators"]).items()}
        for p, tag, unit in (("T2M", "t2m", "C"), ("ALLSKY_SFC_SW_DWN", "allsky", "MJ_m2_day")):
            series[f"{tag}_may_oct_mean_{unit}"] = seasonal_mean(vals[p], years, range(5, 11))
            series[f"{tag}_annual_mean_{unit}"] = seasonal_mean(vals[p], years, range(1, 13))
        for ind, vs in series.items():
            rows_s += [[cid, ind, y, "" if v is None else f"{v:.3f}"] for y, v in zip(years, vs)]
            sen, mk = trend(years, vs, cfg)
            rows_t.append([cid, ind, sum(v is not None for v in vs), f"{sen.slope_dec:.3f}",
                           f"{sen.ci_low_dec:.3f}", f"{sen.ci_high_dec:.3f}", f"{mk.p:.4f}", mk.variant])
        # contraste de signo con IMERG (plan 5.2, B3): se compara el SIGNO, no solo valores
        for k in cfg["indicators"]:
            iv = [imerg_series[(cid, k)].get(y) for y in years]
            pv = series[f"power_{k}"]
            si, _ = trend(years, iv, cfg)
            sp, _ = trend(years, pv, cfg)
            both = [(x, y) for x, y in zip(iv, pv) if x is not None and y is not None]
            r = float(np.corrcoef(*zip(*both))[0, 1]) if len(both) > 2 else float("nan")
            rows_x.append([cid, CROSSCHECK.get(cid, ""), k, f"{si.slope_dec:.2f}", f"{sp.slope_dec:.2f}",
                           "sí" if np.sign(si.slope_dec) == np.sign(sp.slope_dec) else "no",
                           f"{r:.3f}", f"{np.mean([x for x, _ in both]):.1f}", f"{np.mean([y for _, y in both]):.1f}"])

    def write(name, header, rows):
        with open(out / name, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(header)
            w.writerows(rows)

    write("power_monthly.csv", ["cell_id", "parameter", "year", "month", "value"], rows_m)
    write("power_series.csv", ["cell_id", "indicator", "year", "value"], rows_s)
    write("power_trends.csv", ["cell_id", "indicator", "valid_years", "slope_per_decade", "ci_low", "ci_high",
                               "p_value", "mk_variant"], rows_t)
    write("crosscheck.csv", ["cell_id", "site", "indicator", "imerg_slope_dec_mm", "power_slope_dec_mm",
                             "same_sign", "pearson_r_interannual", "imerg_mean_mm", "power_mean_mm"], rows_x)
    imerg.write_json(prov, out / "provenance.json")

    print("Contraste de signo IMERG vs POWER (pendiente de Sen en mm por década):")
    for x in rows_x:
        print(f"  {x[0]} {x[1]:<38} {x[2]:<11} IMERG {x[3]:>8}  POWER {x[4]:>8}  mismo signo: {x[5]:<2}  r={x[6]}  "
              f"media IMERG {x[7]} / POWER {x[8]}")
    print(f"Escrito en {out}: power_monthly.csv, power_series.csv, power_trends.csv, crosscheck.csv, provenance.json")


if __name__ == "__main__":
    main()
