import math
from pathlib import Path

import numpy as np

from altaris import enso, stats
from altaris.config import load_config

CFG = load_config()
ONI = enso.load_oni(Path(__file__).resolve().parents[2] / "data" / "rol3" / "oni.csv")
YEARS = list(range(2001, 2025))


def test_oni_tamano_y_valores_conocidos():
    assert sorted(ONI) == YEARS and all(len(v) == 12 for v in ONI.values())
    assert ONI[2015]["NDJ"] == 2.59 and ONI[2010]["OND"] == -1.57 and ONI[2023]["NDJ"] == 1.99
    assert ONI[2001]["DJF"] == -0.76 and ONI[2024]["NDJ"] == -0.43 and ONI[2008]["DJF"] == -1.76


def test_indicadores_y_fases():
    mo = enso.oni_for_indicator(ONI, "may_oct_mm", YEARS)           # MJJ..ASO
    assert math.isclose(mo[2015], np.mean([1.19, 1.44, 1.73, 2.02]), abs_tol=1e-9)
    assert enso.phase(mo[2015]) == "nino" and enso.is_strong(mo[2015])
    assert enso.phase(mo[2010]) == "nina" and enso.is_strong(mo[2010])
    ja = enso.oni_for_indicator(ONI, "jul_aug_mm", YEARS)            # solo JJA
    assert ja[2015] == 1.44
    an = enso.oni_for_indicator(ONI, "annual_mm", YEARS)
    assert len(an) == 24 and math.isclose(an[2001], np.mean(list(ONI[2001].values())), abs_tol=1e-9)
    assert enso.phase(0.5) == "nino" and enso.phase(-0.5) == "nina" and enso.phase(0.49) == "neutral"
    assert enso.is_strong(1.0) and not enso.is_strong(0.99)


def test_pettitt_detecta_escalon_y_no_ruido():
    rng = np.random.default_rng(1)
    step = [100 + rng.normal(0, 5) + (60 if y >= 2014 else 0) for y in YEARS]
    cp, p = enso.pettitt(YEARS, step)
    assert cp == 2014 and p < 0.01 and enso.break_flag(cp, p)
    hits = 0
    for s in range(400):
        noise = list(np.random.default_rng(100 + s).normal(100, 10, 24))
        cp, p = enso.pettitt(YEARS, noise)
        hits += p < 0.05
    assert hits / 400 < 0.09                      # ~5 % esperado; el aproximado de Pettitt es algo conservador
    assert enso.break_flag(2010, 0.001) is False and enso.break_flag(2014, 0.2) is False
    assert enso.pettitt(YEARS[:5], [1, 2, 3, 4, 5]) == (None, float("nan")) or enso.pettitt(YEARS[:5], [1, 2, 3, 4, 5])[0] is None


def test_pettitt_valor_manual_pequeno():
    # serie 1,1,1,1,5,5,5,5 -> cambio claro en el 5.º año; K = max|U|
    cp, p = enso.pettitt(list(range(2001, 2009)), [1, 1, 1, 1, 5, 5, 5, 5])
    assert cp == 2005
    # U_4 = 2*sum(rangos 1..4)-4*9 ; rangos promedio 2.5 -> 2*10-36 = -16 ; K=16 ; p = 2exp(-6*256/(512+64))
    assert math.isclose(p, min(1, 2 * math.exp(-6 * 256 / 576)), rel_tol=1e-9)


def test_enso_test_tendencia_real_sobrevive_y_la_inducida_por_enso_no():
    oni = enso.oni_for_indicator(ONI, "may_oct_mm", YEARS)
    o = np.array([oni[y] for y in YEARS])
    rng = np.random.default_rng(3)
    t = np.array(YEARS) - 2001
    real = 1000 - 8 * t + rng.normal(0, 25, 24)                       # tendencia lineal, sin relacion con ENSO
    base = stats.sen_slope(YEARS, real, 0.95)
    r = enso.enso_test(YEARS, real, oni, base, CFG)
    assert r["survives"] is True and r["slope_without_strong_enso"] < 0 and r["slope_oni_removed"] < 0
    # lluvia que solo sigue a ONI, y ONI tiene "tendencia" aparente en el periodo: la pendiente desaparece al quitar ONI
    drive = 1000 - 150 * o + rng.normal(0, 10, 24)
    b2 = stats.sen_slope(YEARS, drive, 0.95)
    r2 = enso.enso_test(YEARS, drive, oni, b2, CFG)
    assert abs(r2["slope_oni_removed"]) < abs(b2.slope_dec) or abs(b2.slope_dec) < 3


def test_spearman_signo_y_series_planas():
    oni = enso.oni_for_indicator(ONI, "may_oct_mm", YEARS)
    o = np.array([oni[y] for y in YEARS])
    r, p = enso.spearman(YEARS, list(1000 - 100 * o), oni)
    assert r < -0.99 and p < 1e-6
    assert all(math.isnan(x) for x in enso.spearman(YEARS, [500.0] * 24, oni))
    base = stats.sen_slope(YEARS, [500.0] * 24, 0.95)
    assert enso.enso_test(YEARS, [None] * 24, oni, stats.sen_slope(YEARS, [None] * 24, 0.95), CFG)["survives"] is None


def test_enso_json_por_indicador_lo_lee_el_exportador(tmp_path):
    import json
    from altaris import export, io, synth
    doc = {"years": {"2001": {"phase": "nina", "strong": False}},
           "by_indicator": {"may_oct_mm": {"2001": {"phase": "nina", "strong": False}},
                            "jul_aug_mm": {"2001": {"phase": "neutral", "strong": False}}}}
    p = tmp_path / "enso.json"; p.write_text(json.dumps(doc))
    ph = io.read_enso_json(p)
    assert ph["may_oct_mm"][2001] == "nina" and ph["jul_aug_mm"][2001] == "neutral"
    cells, series, _ = synth.make_region(6, tuple(CFG["period"]))
    export.run(cells, series, CFG, tmp_path / "o", enso_phase=ph)
    d = json.loads((tmp_path / "o" / "cells" / f"{cells[0]['id']}.json").read_text())
    assert d["indicators"]["may_oct_mm"]["series"][0]["enso"] == "nina"
    assert d["indicators"]["jul_aug_mm"]["series"][0]["enso"] == "neutral"


def test_pendiente_cero_no_conserva_el_signo():
    # 0.0 y -0.0 son la misma pendiente: ninguna tiene signo, así que ninguna "conserva" el de la base
    for base in (-5.0, 5.0):
        assert not enso._keeps_sign(0.0, base) and not enso._keeps_sign(-0.0, base)
    assert enso._keeps_sign(-3.0, -5.0) and enso._keeps_sign(3.0, 5.0)
    assert not enso._keeps_sign(3.0, -5.0) and not enso._keeps_sign(-3.0, 5.0)
    assert not enso._keeps_sign(1.0, 0.0)          # base sin signo: nada lo conserva (igual que antes)
