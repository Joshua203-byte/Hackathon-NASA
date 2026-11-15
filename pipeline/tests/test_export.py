"""Extremo a extremo: sintético -> JSON, forma del contrato, determinismo, CSV y reglas de oro."""
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path

from altaris import export, io, reasons, synth
from altaris.config import load_config

CFG = load_config()
ROOT = Path(__file__).resolve().parent.parent
VERDICTS = {"consistente", "limitada", "sin_evidencia", "incompleta"}


def gen(tmp, n=24):
    cells, series, truth = synth.make_region(n, tuple(CFG["period"]))
    res = export.run(cells, series, CFG, tmp, data_kind="mock", generated_at="2026-01-01T00:00:00-06:00")
    return cells, series, truth, res


def test_forma_del_contrato(tmp_path):
    cells, _, _, res = gen(tmp_path)
    meta = json.loads((tmp_path / "meta.json").read_text())
    grid = json.loads((tmp_path / "grid.json").read_text())
    assert meta["n_cells"] == len(cells) == len(grid["cells"]) and meta["period"] == [2001, 2024]
    for c in cells:
        d = json.loads((tmp_path / "cells" / f"{c['id']}.json").read_text())
        assert len(d["monthly_climatology_mm"]) == 12
        for k, ci in d["indicators"].items():
            assert ci["verdict"] in VERDICTS and ci["verdict_reasons"]
            assert reasons_known(ci["verdict_reasons"])
            assert len(ci["series"]) == 24
            assert len(ci["footprint"]) == 120 and all(len(t) == 6 for t in ci["footprint"])
            assert len(ci["window_results"]) == 120
            assert all(w["verdict"] != "consistente" or key == "2001-2024" for key, w in ci["window_results"].items())
            assert ci["statistics"]["adjusted_p_fdr"] is not None
    raw = (tmp_path / "grid.json").read_text()
    assert "NaN" not in raw and "Infinity" not in raw


def reasons_known(codes):
    return all(c in reasons.REASONS for c in codes)


def test_determinismo(tmp_path):
    a, b = tmp_path / "a", tmp_path / "b"
    gen(a); gen(b)
    for f in sorted(a.rglob("*.json")):
        assert hashlib.md5(f.read_bytes()).hexdigest() == hashlib.md5((b / f.relative_to(a)).read_bytes()).hexdigest(), f


def test_mas_consistentes_en_celdas_con_tendencia_real_que_en_ruido(tmp_path):
    cells, _, truth, _ = gen(tmp_path, 40)
    grid = json.loads((tmp_path / "grid.json").read_text())["cells"]
    tp = sum(1 for g in grid if truth[g["id"]] and g["ind"]["may_oct_mm"]["verdict"] != "sin_evidencia")
    fp = sum(1 for g in grid if not truth[g["id"]] and g["ind"]["may_oct_mm"]["verdict"] == "consistente")
    assert fp == 0 and tp >= 1


def test_csv_ida_y_vuelta_da_el_mismo_resultado(tmp_path):
    cells, series, _, _ = gen(tmp_path / "x", 8)
    (tmp_path / "cells.csv").write_text("cell_id,lat,lon,country\n" + "".join(
        f"{c['id']},{c['lat']},{c['lon']},{c['country']}\n" for c in cells))
    rows = ["cell_id,indicator,year,value"]
    for c, d in series.items():
        for k, (ys, vs) in d.items():
            rows += [f"{c},{k},{y},{v}" for y, v in zip(ys, vs)]
    (tmp_path / "series.csv").write_text("\n".join(rows))
    out = tmp_path / "csv"
    subprocess.run([sys.executable, str(ROOT / "run_pilot.py"), "--cells", str(tmp_path / "cells.csv"),
                    "--series", str(tmp_path / "series.csv"), "--out", str(out)], check=True, capture_output=True)
    g1 = json.loads((tmp_path / "x" / "grid.json").read_text())["cells"]
    g2 = json.loads((out / "grid.json").read_text())["cells"]
    assert [c["ind"] for c in g1] == [c["ind"] for c in g2]


def test_enso_y_2014_entran_al_veredicto(tmp_path):
    cells, series, _, _ = synth.make_region(30, tuple(CFG["period"]))[0:3] + (None,)
    ens = {(c["id"], k): {"survives": False, "enso_r": -0.6, "enso_p_fdr": 0.01} for c in cells for k in CFG["indicators"]}
    export.run(cells, series, CFG, tmp_path, enso_results=ens)
    for c in cells:
        d = json.loads((tmp_path / "cells" / f"{c['id']}.json").read_text())
        assert all(ci["verdict"] != "consistente" for ci in d["indicators"].values())


def test_narrativa_resumen_y_receta(tmp_path):
    cells, _, _, _ = gen(tmp_path, 10)
    meta = json.loads((tmp_path / "meta.json").read_text())
    assert "recipe" in meta and meta["recipe"]["verdict_rules"]["consistente"] and meta["threshold_changes"] == []
    d = json.loads((tmp_path / "cells" / f"{cells[0]['id']}.json").read_text())
    nar = next(iter(d["indicators"].values()))["narrative"]
    assert nar["generated_by"] == "template" and nar["es"] and nar["en"]
    rows = (tmp_path / "verdict_summary.csv").read_text().strip().splitlines()
    assert rows[0].startswith("indicator,country,consistente") and len(rows) > 1
    assert sum(int(r.split(",")[-1]) for r in rows[1:]) == 10 * 3


def test_narrativa_de_rol6_tiene_prioridad(tmp_path):
    cells, series, _ = synth.make_region(6, tuple(CFG["period"]))
    k = f"{cells[0]['id']}|may_oct_mm"
    export.run(cells, series, CFG, tmp_path, narratives={k: {"es": "X", "en": "Y", "generated_by": "AI"}})
    d = json.loads((tmp_path / "cells" / f"{cells[0]['id']}.json").read_text())
    assert d["indicators"]["may_oct_mm"]["narrative"]["generated_by"] == "AI"
    assert d["indicators"]["jul_aug_mm"]["narrative"]["generated_by"] == "template"
