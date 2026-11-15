"""Pruebas del motor estadístico (plan 5.3, Rol 2)."""
import math

import numpy as np
import pymannkendall as pmk
import pytest

from altaris import stats

YEARS = np.arange(2001, 2025)


def noisy_trend(rng, slope_per_year=0.0, sd=20.0, base=400.0, years=YEARS):
    return base + slope_per_year * (years - years.mean()) + rng.normal(0, sd, len(years))


# ------------------------------------------------------------------ conteo de ventanas
@pytest.mark.parametrize("n_years,min_len,expected", [(24, 10, 120), (24, 15, 55), (25, 10, 136), (25, 15, 66)])
def test_numero_de_ventanas(n_years, min_len, expected):
    assert stats.n_windows(n_years, min_len) == expected


def test_footprint_tiene_120_ventanas_y_orden_esperado():
    rng = np.random.default_rng(1)
    w = stats.footprint(YEARS, noisy_trend(rng), (2001, 2024), min_len=10)
    assert len(w) == 120
    assert [x.key for x in w[:3]] == ["2001-2010", "2001-2011", "2001-2012"]
    assert w[15].key == "2002-2011"          # tras las 15 ventanas que empiezan en 2001
    assert w[-1].key == "2015-2024"
    assert sum(1 for x in w if x.length >= 15) == 55


# ------------------------------------------------------------------ Sen
def test_pendiente_conocida_cae_dentro_del_ic():
    rng = np.random.default_rng(7)
    slope_year = -3.0                          # -30 mm por década
    y = noisy_trend(rng, slope_year, sd=15)
    r = stats.sen_slope(YEARS, y)
    assert abs(r.slope_dec - (-30.0)) < 15.0
    assert r.ci_low_dec <= -30.0 <= r.ci_high_dec
    assert r.n_valid == 24


def test_serie_sin_ruido_recupera_la_pendiente_exacta():
    y = 400 + 2.5 * (YEARS - 2001)
    r = stats.sen_slope(YEARS, y)
    assert r.slope_dec == pytest.approx(25.0)


def test_un_anio_extremo_mueve_a_sen_menos_que_a_la_regresion_lineal():
    rng = np.random.default_rng(11)
    y = noisy_trend(rng, -2.0, sd=15)
    y_out = y.copy()
    y_out[12] = y[12] * 3.0                    # una tormenta enorme
    sen0, sen1 = stats.sen_slope(YEARS, y).slope_dec, stats.sen_slope(YEARS, y_out).slope_dec
    ols0 = np.polyfit(YEARS, y, 1)[0] * 10
    ols1 = np.polyfit(YEARS, y_out, 1)[0] * 10
    assert abs(sen1 - sen0) < abs(ols1 - ols0)


def test_valores_faltantes_no_se_rellenan():
    rng = np.random.default_rng(3)
    y = noisy_trend(rng, -2.0, sd=15)
    y_missing = y.copy().astype(object)
    y_missing[4] = None
    y_missing[9] = float("nan")
    r = stats.sen_slope(YEARS, y_missing)
    assert r.n_valid == 22
    keep = np.ones(24, bool)
    keep[[4, 9]] = False
    ref = stats.sen_slope(YEARS[keep], y[keep])
    assert r.slope_dec == pytest.approx(ref.slope_dec)
    assert r.ci_low_dec == pytest.approx(ref.ci_low_dec)


def test_con_muy_pocos_datos_devuelve_nan_y_no_inventa():
    r = stats.sen_slope([2001, 2002, 2003], [1.0, 2.0, 3.0])
    assert math.isnan(r.slope_dec) and r.n_valid == 3


# ------------------------------------------------------------------ Mann-Kendall
def test_mk_rapido_coincide_con_pymannkendall_incluidos_empates():
    rng = np.random.default_rng(5)
    for _ in range(50):
        y = np.round(rng.normal(300, 60, 24) / 25) * 25      # muchos empates
        p, z = stats.mk_original(y)
        ref = pmk.original_test(y)
        assert p == pytest.approx(ref.p, abs=1e-12)
        assert z == pytest.approx(ref.z, abs=1e-12)


def test_mk_con_serie_constante_no_falla():
    p, z = stats.mk_original(np.full(24, 100.0))
    assert p == 1.0 and z == 0.0


def test_ruido_puro_da_cerca_del_5_por_ciento_de_falsos_positivos():
    rng = np.random.default_rng(2026)
    n = 2000
    ps = np.array([stats.mk_original(rng.normal(400, 60, 24))[0] for _ in range(n)])
    frac = float((ps < 0.05).mean())
    assert 0.035 < frac < 0.065, frac


def test_mann_kendall_completo_sobre_ruido_puro_tambien_cerca_del_5_por_ciento():
    rng = np.random.default_rng(99)
    n = 600
    hits = 0
    for _ in range(n):
        y = rng.normal(400, 60, 24)
        if stats.mann_kendall(YEARS, y).p < 0.05:
            hits += 1
    assert 0.02 < hits / n < 0.08, hits / n


def test_tendencia_clara_es_significativa():
    rng = np.random.default_rng(4)
    y = noisy_trend(rng, -6.0, sd=15)
    assert stats.mann_kendall(YEARS, y).p < 0.001


def test_usa_hamed_rao_con_autocorrelacion_fuerte_y_original_sin_ella():
    rng = np.random.default_rng(8)
    walk = 400 + np.cumsum(rng.normal(0, 25, 24))           # autocorrelación muy alta
    assert stats.mann_kendall(YEARS, walk).variant == "hamed_rao"
    # sustituye por ruido blanco hasta encontrar una serie sin autocorrelación significativa
    for seed in range(30):
        white = np.random.default_rng(seed).normal(400, 60, 24)
        r = stats.mann_kendall(YEARS, white)
        if abs(r.lag1) <= 1.96 / math.sqrt(24):
            assert r.variant == "original"
            break
    else:
        pytest.fail("no se encontró ruido blanco sin autocorrelación significativa")


# ------------------------------------------------------------------ Huella
def test_ventana_con_pocos_anios_validos_queda_sin_resultado():
    rng = np.random.default_rng(6)
    y = noisy_trend(rng, -2.0).astype(object)
    for i in range(0, 12):                                    # faltan 2001-2012
        y[i] = None
    w = {x.key: x for x in stats.footprint(YEARS, y, (2001, 2024), min_len=10)}
    assert not w["2001-2010"].valid
    assert math.isnan(w["2001-2010"].slope_dec)
    assert w["2013-2024"].valid


def test_resumen_de_huella_serie_estable():
    y = 400 - 5.0 * (YEARS - 2001) + np.random.default_rng(1).normal(0, 4, 24)
    base = stats.sen_slope(YEARS, y).slope_dec
    w = stats.footprint(YEARS, y, (2001, 2024))
    s = stats.footprint_summary(w, base)
    assert s.n_used == 55
    assert s.sign_agreement == 1.0
    assert s.sig_fraction > 0.9


def test_resumen_de_huella_serie_inestable():
    # baja fuerte al principio y sube al final: el signo cambia según la ventana
    y = np.concatenate([np.linspace(500, 300, 12), np.linspace(300, 520, 12)])
    y = y + np.random.default_rng(2).normal(0, 3, 24)
    base = stats.sen_slope(YEARS, y).slope_dec
    s = stats.footprint_summary(stats.footprint(YEARS, y, (2001, 2024)), base)
    assert s.sign_agreement < 0.9


def test_resumen_con_pendiente_cero_o_nan_no_inventa():
    w = stats.footprint(YEARS, np.full(24, 100.0), (2001, 2024))
    s = stats.footprint_summary(w, 0.0)
    assert math.isnan(s.sign_agreement) and math.isnan(s.sig_fraction)


# ------------------------------------------------------------------ FDR
def test_fdr_benjamini_hochberg_a_mano():
    p = [0.01, 0.04, 0.03, 0.005]
    adj = stats.fdr_adjust(p)
    assert adj == pytest.approx([0.02, 0.04, 0.04, 0.02])


def test_fdr_ignora_nan():
    adj = stats.fdr_adjust([0.01, float("nan"), 0.04])
    assert math.isnan(adj[1])
    assert adj[0] == pytest.approx(0.02) and adj[2] == pytest.approx(0.04)


def test_cv():
    assert stats.cv([100, 100, 100, 100]) == 0.0
    assert stats.cv([10, 20, 30]) == pytest.approx(0.5)
    assert math.isnan(stats.cv([1, 2]))
