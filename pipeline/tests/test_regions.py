"""compare_regions.py, ca_tables.py y check_form_ca.py (herramientas de la ampliación a Centroamérica)."""
import json
import subprocess
import sys
from pathlib import Path

import pytest

import ca_tables
import compare_regions
from altaris import export, synth
from altaris.config import load_config

PIPE = Path(__file__).resolve().parent.parent
CFG = load_config()


@pytest.fixture(scope="module")
def dirs(tmp_path_factory):
    """Dos exportaciones de la MISMA serie: 20 celdas (antes) y 30 (después). Solo cambia el conjunto sobre el que se hace el FDR."""
    cells, series, _ = synth.make_region(30, tuple(CFG["period"]))
    root = tmp_path_factory.mktemp("regiones")
    export.run(cells[:20], series, CFG, root / "old", data_kind="mock", commit="MOCK")
    export.run(cells, series, CFG, root / "new", data_kind="mock", commit="MOCK")
    return root / "old", root / "new"


def test_compare_misma_serie_distinto_conjunto(dirs):
    old, new = dirs
    r = compare_regions.compare(old, new, cases=())
    assert (r["n_old"], r["n_new"], r["n_common"], r["n_only_new"]) == (20, 30, 20, 10)
    assert r["go1_ok"], r["grid_diffs"][:3]          # todo lo por celda es idéntico
    assert r["thresholds_same"] and r["period_same"]
    assert all(c["explained"] for c in r["changes"])  # los cambios de veredicto cruzan el umbral de FDR
    assert r["go2_ok"]
    assert "CUMPLE" in compare_regions.report(r)


def test_compare_detecta_una_diferencia_por_celda(dirs, tmp_path):
    old, new = dirs
    import shutil
    bad = tmp_path / "new"
    shutil.copytree(new, bad)
    cid = json.loads((bad / "grid.json").read_text())["cells"][0]["id"]
    f = bad / "cells" / f"{cid}.json"
    d = json.loads(f.read_text())
    k = next(iter(d["indicators"]))
    d["indicators"][k]["statistics"]["slope_per_decade"] += 1.0
    f.write_text(json.dumps(d))
    r = compare_regions.compare(old, bad, cases=())
    assert not r["go1_ok"] and any(cid == c for c, _ in r["cell_diffs"])
    assert "FALLA" in compare_regions.report(r)


def test_compare_marca_cambio_no_explicado(dirs, tmp_path):
    old, new = dirs
    import shutil
    bad = tmp_path / "new"
    shutil.copytree(new, bad)
    g = json.loads((bad / "grid.json").read_text())
    row = g["cells"][0]["ind"]["may_oct_mm"]
    row["verdict"] = "consistente" if row["verdict"] != "consistente" else "sin_evidencia"   # sin que p_fdr cruce el umbral
    (bad / "grid.json").write_text(json.dumps(g))
    r = compare_regions.compare(old, bad, cases=())
    assert not r["go2_ok"] and any(not c["explained"] for c in r["changes"])


def test_tablas_y_cotejo_del_formulario(dirs, tmp_path):
    _, new = dirs
    txt = ca_tables.tables(new, "en")
    assert "Total: **30** cells" in txt and "Rainy season (May–Oct)" in txt and "DATOS NO OBSERVADOS" in txt
    # una copia "observada" para el cotejo (el original es simulado y el cotejo lo rechaza a propósito)
    import shutil
    obs = tmp_path / "obs"
    shutil.copytree(new, obs)
    m = json.loads((obs / "meta.json").read_text())
    m["data_kind"], m["dataset_doi"] = "observed", "10.5067/GPM/IMERG/3B-MONTH/07"
    (obs / "meta.json").write_text(json.dumps(m))
    grid = json.loads((obs / "grid.json").read_text())["cells"]
    names = {"HND": "Honduras", "SLV": "El Salvador", "GTM": "Guatemala"}
    lines = ["Data: IMERG, doi:10.5067/GPM/IMERG/3B-MONTH/07. Region: Honduras, El Salvador and Guatemala, 30 land cells.", "",
             "| Indicator | Country | Consistent | Limited | No evidence | Cells |", "|---|---|---|---|---|---|"]
    for c in sorted({g["country"] for g in grid}):
        sel = [g for g in grid if g["country"] == c]
        n = lambda v: sum(1 for g in sel if g["ind"]["may_oct_mm"]["verdict"] == v)
        lines.append(f"| Rainy season (May–Oct) | {names[c]} | {n('consistente')} | {n('limitada')} | {n('sin_evidencia')} | {len(sel)} |")
    form = tmp_path / "form.md"
    form.write_text("\n".join(lines), encoding="utf-8")
    run = lambda: subprocess.run([sys.executable, str(PIPE / "check_form_ca.py"), "--data", str(obs), "--form", str(form)],
                                 capture_output=True, text=True)
    ok = run()
    assert ok.returncode == 0, ok.stdout
    form.write_text(form.read_text(encoding="utf-8") + "\nTBD [PENDING-CA]\n", encoding="utf-8")
    assert run().returncode == 1                              # una marca sin rellenar bloquea
    form.write_text("\n".join(lines).replace("| 30 land", "| 31 land").replace("30 land cells", "31 land cells"), encoding="utf-8")
    assert run().returncode == 1                              # un total equivocado bloquea
    # y el cotejo rechaza datos simulados
    sim = subprocess.run([sys.executable, str(PIPE / "check_form_ca.py"), "--data", str(new), "--form", str(form)], capture_output=True, text=True)
    assert sim.returncode == 1 and "data_kind" in sim.stdout
