"""Pruebas del veredicto: una por rama, más los bordes exactos de cada umbral."""
import itertools
import math

import pytest

from altaris import verdict as V
from altaris.config import load_config
from altaris.reasons import REASONS
from altaris.stats import WindowResult

CFG = load_config()


def run(**over):
    kw = dict(valid_years=24, n_years=24, slope_dec=-30.0, mean=400.0, ci=(-50.0, -10.0), p=0.01,
              p_fdr=0.02, sign_agreement=0.95, sig_fraction=0.7, enso_survives=True, break_flag=False, cfg=CFG)
    kw.update(over)
    return V.base_verdict(**kw)


# ------------------------------------------------------------------ ramas del periodo base
def test_consistente():
    assert run() == ("consistente", ["criterios_cumplidos"])


def test_incompleta_por_pocos_anios_y_borde():
    assert run(valid_years=21) == ("incompleta", ["pocos_anios"])
    assert run(valid_years=22)[0] != "incompleta"            # faltan exactamente 2: se permite
    assert run(slope_dec=float("nan"))[0] == "incompleta"


def test_fdr_no_significativo_baja_a_limitada_si_hay_senal():
    v, r = run(p_fdr=0.30)
    assert v == "limitada" and "fdr_no_significativo" in r


def test_ic_incluye_cero():
    v, r = run(ci=(-50.0, 5.0))
    assert v == "limitada" and "ic_incluye_cero" in r


def test_huella_inestable():
    v, r = run(sign_agreement=0.70, sig_fraction=0.20)
    assert v == "limitada" and "huella_inestable" in r


def test_enso_no_sobrevive():
    v, r = run(enso_survives=False)
    assert v == "limitada" and "enso_no_sobrevive" in r


def test_enso_pendiente_no_bloquea_pero_se_anota():
    v, r = run(enso_survives=None)
    assert v == "consistente" and "enso_pendiente" in r


def test_salto_2014_pone_techo_de_limitada():
    v, r = run(break_flag=True)
    assert v == "limitada" and r == ["posible_salto_2014"]


def test_chequeo_2014_pendiente_se_anota():
    v, r = run(break_flag=None)
    assert v == "consistente" and "chequeo_2014_pendiente" in r


def test_sin_fdr_nunca_hay_consistente():
    v, r = run(p_fdr=None)
    assert v == "limitada" and "fdr_pendiente" in r
    assert run(p_fdr=float("nan"))[0] != "consistente"


def test_sin_evidencia():
    v, r = run(p=0.50, p_fdr=0.80, ci=(-40.0, 40.0), sign_agreement=0.5, sig_fraction=0.0, slope_dec=-5.0)
    assert v == "sin_evidencia" and "p_no_significativo" in r


def test_limitada_por_signo_estable_y_pendiente_grande_aunque_p_alto():
    # 7.5 % de la media por década y 85 % de las ventanas con el mismo signo
    v, _ = run(p=0.30, p_fdr=0.60, ci=(-80.0, 20.0), sign_agreement=0.85, sig_fraction=0.1, slope_dec=-30.0)
    assert v == "limitada"
    # 2.5 % de la media por década: no alcanza
    v, _ = run(p=0.30, p_fdr=0.60, ci=(-80.0, 20.0), sign_agreement=0.85, sig_fraction=0.1, slope_dec=-10.0)
    assert v == "sin_evidencia"


# ------------------------------------------------------------------ bordes exactos
def test_bordes_de_umbrales():
    assert run(sign_agreement=0.90)[0] == "consistente"          # >= 0.90
    assert run(sign_agreement=0.8999)[0] == "limitada"
    assert run(sig_fraction=0.50)[0] == "consistente"             # >= 0.50
    assert run(sig_fraction=0.4999)[0] == "limitada"
    assert run(p_fdr=0.05)[0] != "consistente"                    # estrictamente menor
    assert run(p_fdr=0.0499)[0] == "consistente"
    assert run(p=0.10, p_fdr=0.5, ci=(-80, 20), sign_agreement=0.5, sig_fraction=0)[0] == "sin_evidencia"  # p < 0.10 estricto


# ------------------------------------------------------------------ catálogo de razones
def test_el_motor_no_emite_codigos_fuera_del_catalogo():
    grid = dict(
        p=[0.001, 0.07, 0.5],
        p_fdr=[None, 0.01, 0.2],
        ci=[(-5.0, -1.0), (-5.0, 5.0)],
        sign_agreement=[0.5, 0.85, 0.95],
        sig_fraction=[0.1, 0.8],
        enso_survives=[None, True, False],
        break_flag=[None, True, False],
        valid_years=[10, 24],
    )
    keys = list(grid)
    n = 0
    for combo in itertools.product(*grid.values()):
        v, r = run(**dict(zip(keys, combo)))
        assert v in V.VERDICTS
        assert r, (v, combo)                                      # todo veredicto trae razones
        assert V.all_codes_known(r), (r, combo)
        n += 1
    assert n > 1000


# ------------------------------------------------------------------ ventanas
def win(start, end, slope, p, lo, hi, valid=True):
    return WindowResult(start, end, end - start + 1, valid, slope, p, lo, hi)


BASE = dict(base_key="2001-2024", base_sign=-30.0, base_ci=(-50.0, -10.0),
            base_verdict="consistente", base_reasons=["criterios_cumplidos"], cfg=CFG)


def test_ventana_igual_al_periodo_base_hereda_su_veredicto():
    ci, v, r = V.window_verdict(win(2001, 2024, -30, 0.01, -50, -10), **BASE)
    assert (ci, v, r) == ((-50.0, -10.0), "consistente", ["criterios_cumplidos"])


def test_ventana_sin_anios_suficientes_es_incompleta():
    ci, v, r = V.window_verdict(win(2001, 2010, math.nan, math.nan, math.nan, math.nan, valid=False), **BASE)
    assert v == "incompleta" and r == ["ventana_pocos_anios"] and ci == (None, None)


def test_ventana_significativa_es_limitada_y_nunca_consistente():
    ci, v, r = V.window_verdict(win(2004, 2024, -35, 0.001, -60, -12), **BASE)
    assert v == "limitada" and r == ["ventana_sin_correccion"]


def test_ventana_con_signo_opuesto_lo_anota():
    ci, v, r = V.window_verdict(win(2001, 2015, 25, 0.01, 5, 45), **BASE)
    assert v == "limitada" and "ventana_signo_opuesto" in r


def test_ventana_no_significativa():
    ci, v, r = V.window_verdict(win(2001, 2021, -11, 0.14, -40, 15), **BASE)
    assert v == "sin_evidencia" and r == ["ventana_p_no_significativo"]


def test_ventana_con_p_bajo_pero_ic_con_cero_no_pasa():
    ci, v, r = V.window_verdict(win(2001, 2021, -11, 0.04, -40, 1), **BASE)
    assert v == "sin_evidencia" and r == ["ic_incluye_cero"]


def test_ninguna_ventana_puede_ser_consistente():
    for p in (1e-9, 0.001, 0.04, 0.2):
        _, v, _ = V.window_verdict(win(2002, 2020, -60, p, -90, -30), **BASE)
        assert v != "consistente"


def test_config_que_permita_ventanas_consistentes_se_rechaza():
    bad = dict(CFG)
    bad["window_verdict"] = {**CFG["window_verdict"], "max_label": "consistente"}
    with pytest.raises(ValueError):
        V.window_verdict(win(2002, 2020, -60, 0.01, -90, -30), **{**BASE, "cfg": bad})


def test_todas_las_razones_de_ventana_estan_en_el_catalogo():
    for w in (win(2001, 2015, 25, 0.01, 5, 45), win(2001, 2021, -11, 0.14, -40, 15), win(2004, 2024, -35, 0.001, -60, -12)):
        _, _, r = V.window_verdict(w, **BASE)
        assert V.all_codes_known(r)
    assert "ventana_pocos_anios" in REASONS


def test_p_max_sign_rule_opcional():
    import copy
    base_kw = dict(valid_years=24, n_years=24, slope_dec=-30.0, mean=400.0, ci=(-80.0, 20.0), p=0.30, p_fdr=0.6,
                   sign_agreement=0.85, sig_fraction=0.1, enso_survives=True, break_flag=False)
    assert V.base_verdict(**base_kw, cfg=CFG)[0] == "limitada"                # regla del plan (null)
    cfg2 = copy.deepcopy(CFG)
    cfg2["verdict"]["limitada"]["p_max_sign_rule"] = 0.20
    assert V.base_verdict(**base_kw, cfg=cfg2)[0] == "sin_evidencia"           # tope activo: p=0.30 no cuenta
    assert V.base_verdict(**{**base_kw, "p": 0.15}, cfg=cfg2)[0] == "limitada"
