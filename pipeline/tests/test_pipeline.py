"""Prueba de punta a punta con los datos sintéticos: corre, respeta el contrato y es determinista."""
import subprocess
import sys

import pytest

from altaris import io, steps

PIPE = io.REPO_ROOT / "pipeline"


@pytest.fixture(scope="module")
def synthetic_inputs():
    subprocess.run([sys.executable, str(PIPE / "make_synthetic.py")], check=True, capture_output=True)


def _run(tmp, synthetic_inputs):
    cfg = io.load_config(synthetic=True)
    for k in ("trends", "footprint", "footprint_summary", "verdicts", "verdict_summary", "calibration"):
        cfg["paths"][k] = str(tmp / f"{k}.out")
    cfg["paths"]["web_data"] = str(tmp / "web")
    steps.run_trends(cfg)
    steps.run_footprint(cfg)
    steps.run_verdict(cfg)
    steps.run_export(cfg, generated_at="2026-11-15T00:00:00-06:00")
    return tmp / "web"


def test_end_to_end_contract_and_determinism(tmp_path, synthetic_inputs):
    a = _run(tmp_path / "a", synthetic_inputs)
    b = _run(tmp_path / "b", synthetic_inputs)
    for rel in ["grid.json", *[f"cells/{p.name}" for p in (a / "cells").glob("*.json")]]:
        assert (a / rel).read_bytes() == (b / rel).read_bytes(), rel

    grid = io.read_json(a / "grid.json")
    meta = io.read_json(a / "meta.json")
    assert meta["synthetic"] is True and meta["n_cells"] == len(grid["cells"]) == 5
    verdicts = {c["id"]: {k: v["verdict"] for k, v in c["ind"].items()} for c in grid["cells"]}
    assert verdicts["N1325W08715"]["jul_aug_mm"] == "consistente"
    assert verdicts["N1455W08765"]["may_oct_mm"] == "limitada"
    assert all(v == "incompleta" for v in verdicts["N1465W09055"].values())

    cell = io.read_json(a / "cells" / "N1325W08715.json")
    ind = cell["indicators"]["jul_aug_mm"]
    assert len(ind["series"]) == 24 and len(ind["footprint"]) == 120
    assert ind["verdict_reasons"] and ind["narrative"]["generated_by"] == "template"
    assert set(ind["statistics"]) >= {"method", "mk_variant", "lag1_autocorr", "slope_per_decade",
                                      "intercept", "ci_95", "p_value", "adjusted_p_fdr"}
    assert len(cell["monthly_climatology_mm"]) == 12


def test_calibration_runs(tmp_path, synthetic_inputs):
    cfg = io.load_config(synthetic=True)
    cfg["paths"]["calibration"] = str(tmp_path / "calib.json")
    res = steps.run_calibration(cfg, n_sim=20)
    assert 0 <= res["false_positive_rate"]["consistente"] <= 1
    assert res["power"]["injected_trend_pct_per_decade"] == -10
