import numpy as np
import pymannkendall as pmk
import pytest

from altaris import stats

YEARS = np.arange(2001, 2025)


def test_sen_recovers_known_slope_with_noise():
    rng = np.random.default_rng(0)
    true_per_decade = -20.0
    errs = []
    for _ in range(200):
        y = 300 + true_per_decade / 10 * (YEARS - 2001) + rng.normal(0, 15, len(YEARS))
        errs.append(stats.sen_slope(YEARS, y).slope_dec - true_per_decade)
    assert abs(np.mean(errs)) < 1.5          # sin sesgo apreciable
    assert np.median(np.abs(errs)) < 6       # error típico pequeño frente a la pendiente


def test_sen_intercept_and_ci_contain_truth():
    y = 100 + 2.0 * (YEARS - 2001)           # 20 por década, sin ruido
    r = stats.sen_slope(YEARS, y, x0=2001)
    assert r.slope_dec == pytest.approx(20.0)
    assert r.intercept == pytest.approx(100.0)
    assert r.ci_low_dec <= 20.0 <= r.ci_high_dec


def test_pure_noise_false_positive_rate_near_alpha():
    rng = np.random.default_rng(1)
    ps = [stats.mann_kendall(YEARS, rng.normal(0, 1, len(YEARS))).p for _ in range(2000)]
    rate = np.mean(np.array(ps) < 0.05)
    assert 0.03 <= rate <= 0.07, rate


def test_sen_robust_to_one_extreme_year():
    rng = np.random.default_rng(2)
    y = 300 - 1.5 * (YEARS - 2001) + rng.normal(0, 10, len(YEARS))
    base = stats.sen_slope(YEARS, y).slope_dec
    y2 = y.copy()
    y2[10] += 400                             # un año extremo
    assert abs(stats.sen_slope(YEARS, y2).slope_dec - base) < 3


def test_missing_values_are_dropped_not_filled():
    rng = np.random.default_rng(3)
    y = 300 + rng.normal(0, 20, len(YEARS))
    y_nan = y.copy()
    y_nan[[2, 9]] = np.nan
    keep = np.isfinite(y_nan)
    a = stats.sen_slope(YEARS, y_nan, x0=2001)
    b = stats.sen_slope(YEARS[keep], y[keep], x0=2001)
    assert a == b
    # Si se rellenara con ceros el resultado cambiaría muchísimo
    y_zero = np.where(keep, y, 0.0)
    assert abs(stats.sen_slope(YEARS, y_zero).slope_dec - a.slope_dec) > 1
    assert stats.mann_kendall(YEARS, y_nan).p == pytest.approx(stats.mann_kendall(YEARS[keep], y[keep]).p)


def test_fast_mk_matches_pymannkendall():
    rng = np.random.default_rng(4)
    for _ in range(100):
        n = rng.integers(10, 25)
        y = np.round(rng.normal(0, 1, n), 1)  # con empates
        assert stats._mk_original_p(y) == pytest.approx(pmk.original_test(y).p, abs=1e-12)


def test_mann_kendall_reports_variant_and_lag1():
    rng = np.random.default_rng(5)
    # AR(1) fuerte → debería activar la variante con corrección
    e = np.zeros(len(YEARS))
    for i in range(1, len(e)):
        e[i] = 0.9 * e[i - 1] + rng.normal()
    r = stats.mann_kendall(YEARS, e)
    assert r.variant in ("hamed_rao", "tfpw")
    assert r.lag1_significant
    assert np.isfinite(r.p)


def test_window_counts_match_plan():
    assert len(stats.windows(2001, 2024, 10)) == 120
    assert len(stats.windows(2001, 2024, 15)) == 55
    assert len(stats.windows(2001, 2025, 10)) == 136
    assert len(stats.windows(2001, 2025, 15)) == 66


def test_footprint_shape_and_missing_windows():
    rng = np.random.default_rng(6)
    y = 300 + rng.normal(0, 20, len(YEARS))
    y[0:4] = np.nan                           # 4 años faltantes al inicio
    fp = stats.footprint(YEARS, y, min_len=10, min_valid_fraction=0.8)
    assert len(fp) == 120
    first = [w for w in fp if w[0] == 2001 and w[1] == 2010][0]
    assert first[2] is None and first[3] is None   # 6/10 válidos < 80 %
    full = [w for w in fp if w[0] == 2005 and w[1] == 2024][0]
    assert full[2] is not None


def test_footprint_matches_theilslopes_per_window():
    rng = np.random.default_rng(7)
    y = 300 - 2 * (YEARS - 2001) + rng.normal(0, 25, len(YEARS))
    for s, e, slope, p in stats.footprint(YEARS, y):
        m = (YEARS >= s) & (YEARS <= e)
        assert slope == pytest.approx(stats.sen_slope(YEARS[m], y[m]).slope_dec)
        assert p == pytest.approx(pmk.original_test(y[m]).p)


def test_footprint_summary():
    fp = [[2001, 2024, -10, 0.01], [2001, 2015, -5, 0.2], [2005, 2024, 3, 0.5], [2001, 2010, -1, 0.9],
          [2003, 2020, None, None]]
    sa, sf, n = stats.footprint_summary(fp, base_slope_dec=-10, verdict_min_len=15)
    assert n == 3                             # la de 10 años y la vacía no cuentan
    assert sa == pytest.approx(2 / 3)
    assert sf == pytest.approx(1 / 3)


def test_fdr_ignores_nan():
    out = stats.fdr_adjust([0.01, np.nan, 0.04, 0.03])
    assert np.isnan(out[1])
    assert np.all(out[[0, 2, 3]] >= np.array([0.01, 0.04, 0.03]))
