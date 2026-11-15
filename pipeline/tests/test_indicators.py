import math

import numpy as np
import pytest

from altaris import indicators as I
from altaris.config import load_config

CFG = load_config()


def test_febrero_bisiesto_usa_29_dias():
    assert I.days_in_month(2004, 2) == 29 and I.days_in_month(2003, 2) == 28
    assert I.rate_to_monthly_mm(0.1, 2004, 2) == pytest.approx(0.1 * 24 * 29)
    assert I.rate_to_monthly_mm(0.1, 2003, 2) == pytest.approx(0.1 * 24 * 28)
    assert I.rate_to_monthly_mm(0.1, 2003, 7) == pytest.approx(0.1 * 24 * 31)


def monthly_full(years):
    recs = [(y, m, 10.0 * m) for y in years for m in range(1, 13)]
    return I.monthly_matrix(list(years), recs)


def test_indicadores_suman_los_meses_correctos():
    years = [2001, 2002]
    out = I.indicators_from_monthly(monthly_full(years), CFG["indicators"])
    assert out["may_oct_mm"] == [10 * (5 + 6 + 7 + 8 + 9 + 10)] * 2        # 450
    assert out["jul_aug_mm"] == [10 * (7 + 8)] * 2                          # 150
    assert out["annual_mm"] == [10 * sum(range(1, 13))] * 2                 # 780


def test_un_mes_faltante_invalida_el_indicador_y_no_se_rellena_con_cero():
    years = [2001, 2002]
    recs = [(y, m, 10.0 * m) for y in years for m in range(1, 13) if not (y == 2002 and m == 8)]
    out = I.indicators_from_monthly(I.monthly_matrix(years, recs), CFG["indicators"])
    assert out["jul_aug_mm"][0] == 150.0 and out["jul_aug_mm"][1] is None   # falta agosto de 2002
    assert out["may_oct_mm"][1] is None and out["annual_mm"][1] is None
    assert out["may_oct_mm"][0] == 450.0


def test_un_mes_fuera_del_indicador_no_lo_invalida():
    years = [2001]
    recs = [(2001, m, 10.0 * m) for m in range(1, 13) if m != 2]            # falta febrero
    out = I.indicators_from_monthly(I.monthly_matrix(years, recs), CFG["indicators"])
    assert out["jul_aug_mm"] == [150.0] and out["may_oct_mm"] == [450.0] and out["annual_mm"] == [None]


def test_climatologia_y_canicula():
    years = list(range(2001, 2025))
    # pico en junio y septiembre, valle en julio-agosto: hay canícula
    base = [20, 25, 40, 80, 250, 380, 250, 260, 400, 320, 90, 30]
    m = I.monthly_matrix(years, [(y, k + 1, v) for y in years for k, v in enumerate(base)])
    clim = I.climatology(m)
    assert clim == pytest.approx(base)
    assert I.has_canicula(clim) is True
    # sin valle: vertiente con máximo a fin de año
    base2 = [100, 80, 60, 70, 150, 200, 260, 270, 280, 400, 420, 250]
    m2 = I.monthly_matrix(years, [(y, k + 1, v) for y in years for k, v in enumerate(base2)])
    assert I.has_canicula(I.climatology(m2)) is False


def test_climatologia_con_pocos_datos_es_none():
    m = I.monthly_matrix([2001, 2002], [(2001, 1, 5.0), (2002, 1, 6.0)])
    clim = I.climatology(m, min_years=10)
    assert clim[0] is None and I.has_canicula(clim) is None
