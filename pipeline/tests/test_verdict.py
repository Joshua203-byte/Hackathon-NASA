import copy

import pytest

from altaris import io
from altaris.verdict import REASONS, VerdictInput, decide

CFG = io.load_config()["verdict"]


def strong(**kw):
    base = dict(valid_years=24, n_years=24, slope_dec=-30, ci_low=-45, ci_high=-12, p=0.001, p_fdr=0.01,
                mean=300, sign_agreement=1.0, sig_fraction=0.9, cv=0.15, enso_survives=True,
                break_2014_flag=False)
    base.update(kw)
    return VerdictInput(**base)


def test_consistente_when_all_conditions_hold():
    r = decide(strong(), CFG)
    assert r.verdict == "consistente"
    assert "fdr_significativo" in r.reasons and "sobrevive_enso" in r.reasons


def test_incompleta_when_more_than_two_years_missing():
    assert decide(strong(valid_years=21), CFG).verdict == "incompleta"
    assert decide(strong(valid_years=22), CFG).verdict == "consistente"


@pytest.mark.parametrize("kw,reason", [
    (dict(p_fdr=0.2), "fdr_no_significativo"),
    (dict(ci_high=3), "ic_incluye_cero"),
    (dict(sign_agreement=0.85), "huella_inestable"),
    (dict(sig_fraction=0.3), "pocas_ventanas_significativas"),
    (dict(enso_survives=False), "no_sobrevive_enso"),
])
def test_each_failed_condition_drops_to_limitada_with_reason(kw, reason):
    r = decide(strong(**kw), CFG)
    assert r.verdict == "limitada"
    assert reason in r.reasons


def test_break_2014_caps_at_limitada():
    r = decide(strong(break_2014_flag=True), CFG)
    assert r.verdict == "limitada"
    assert "posible_salto_2014" in r.reasons


def test_pending_inputs_do_not_block_but_are_reported():
    r = decide(strong(enso_survives=None, break_2014_flag=None), CFG)
    assert r.verdict == "consistente"
    assert "enso_pendiente" in r.reasons and "salto_2014_pendiente" in r.reasons


def test_sin_evidencia():
    r = decide(strong(slope_dec=-2, ci_low=-20, ci_high=15, p=0.6, p_fdr=0.8, sign_agreement=0.5,
                      sig_fraction=0.0), CFG)
    assert r.verdict == "sin_evidencia"
    assert r.reasons[0] == "sin_senal"


def test_limitada_via_sign_rule_and_optional_p_cap():
    v = strong(slope_dec=-20, ci_low=-60, ci_high=15, p=0.4, p_fdr=0.6, sign_agreement=0.85, sig_fraction=0.0)
    assert decide(v, CFG).verdict == "limitada"           # regla del plan: 20 ≥ 5 % de 300
    capped = copy.deepcopy(CFG)
    capped["p_max_sign_rule"] = 0.25
    assert decide(v, capped).verdict == "sin_evidencia"   # con el tope opcional


def test_alta_variabilidad_tag():
    assert "alta_variabilidad" in decide(strong(cv=0.5), CFG).tags
    assert decide(strong(cv=0.1), CFG).tags == []


def test_all_reasons_are_from_fixed_vocabulary():
    cases = [strong(), strong(valid_years=10), strong(p_fdr=0.5, break_2014_flag=True),
             strong(p=0.9, p_fdr=0.9, sign_agreement=0.1, sig_fraction=0, ci_high=10, enso_survives=None)]
    for c in cases:
        assert set(decide(c, CFG).reasons) <= REASONS
