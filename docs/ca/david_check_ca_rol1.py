"""Comprobaciones de David para Centroamérica: países, igualdad con data/rol1, años válidos."""
import json, sys
import pandas as pd

repo = sys.argv[1]
old, new = f"{repo}/data/rol1", f"{repo}/data/ca/rol1"

cn = pd.read_csv(f"{new}/cells.csv")
co = pd.read_csv(f"{old}/cells.csv")
print("== 1. Celdas por país (CA)")
print(cn.country.value_counts().to_string(), "\nTotal:", len(cn))

print("\n== 2. Igualdad con data/rol1 (GTM, SLV, HND)")
common = set(co.cell_id) & set(cn.cell_id)
print("Celdas en rol1:", len(co), "| comunes:", len(common),
      "| de rol1 que faltan en CA:", len(set(co.cell_id) - set(cn.cell_id)))
m = co.merge(cn, on="cell_id", suffixes=("_o", "_n"))
print("País distinto en celdas comunes:", int((m.country_o != m.country_n).sum()))
extra3 = cn[cn.country.isin(["GTM", "SLV", "HND"]) & ~cn.cell_id.isin(co.cell_id)]
print("Celdas GTM/SLV/HND nuevas en CA (no estaban en rol1):", len(extra3))
for f, keys, val in [("series", ["cell_id", "indicator", "year"], "value"),
                     ("monthly", ["cell_id", "year", "month"], "mm")]:
    a = pd.read_csv(f"{old}/{f}.csv")
    b = pd.read_csv(f"{new}/{f}.csv")
    b = b[b.cell_id.isin(common)]
    j = a.merge(b, on=keys, how="outer", suffixes=("_o", "_n"), indicator=True)
    d = (j[val + "_o"] - j[val + "_n"]).abs()
    both_nan = j[val + "_o"].isna() & j[val + "_n"].isna()
    diff = int(((d > 1e-9) | (d.isna() & ~both_nan)).sum())
    print(f"{f}: filas rol1={len(a)} CA(comunes)={len(b)} solo_un_lado={int((j._merge!='both').sum())} "
          f"diferencias={diff} max_abs={d.max():.6g}")

print("\n== 3. Años válidos")
s = pd.read_csv(f"{new}/series.csv")
v = s.dropna(subset=["value"]).groupby(["cell_id", "indicator"]).year.nunique()
print("Años distintos en series:", s.year.min(), "-", s.year.max())
print("Pares celda-indicador con 24/24:", int((v == 24).sum()), "de", len(v),
      "| esperados:", len(cn) * s.indicator.nunique())
bad = v[v < 24]
if len(bad):
    print(bad.reset_index().merge(cn, on="cell_id").country.value_counts().to_string())
p = json.load(open(f"{new}/provenance.json", encoding="utf-8"))
print("provenance.quality:", json.dumps(p.get("quality"), ensure_ascii=False)[:800])
print("provenance.bbox:", p.get("bbox"), "| period:", p.get("period"))
