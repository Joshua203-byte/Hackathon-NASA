"""Estadística de tendencias. Determinista, sin ML.

Piezas:
  sen_slope        pendiente de Theil-Sen (mm por década) con IC
  mann_kendall     prueba de Mann-Kendall; usa Hamed-Rao si hay autocorrelación de retardo 1
  footprint        la misma pareja (Sen + MK) en todas las ventanas de años posibles
  footprint_summary  sign_agreement y sig_fraction
  fdr_adjust       Benjamini-Hochberg

Regla de oro: los años sin dato NO se rellenan. Se descartan y se cuentan en `n_valid`.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
import pymannkendall as pmk
from scipy import stats as sps
from statsmodels.stats.multitest import multipletests

NAN = float("nan")


# ----------------------------------------------------------------------------- utilidades
def clean(years, values) -> tuple[np.ndarray, np.ndarray]:
    """Descarta pares con NaN/None. Nunca rellena."""
    x = np.asarray(years, dtype=float)
    y = np.array([np.nan if v is None else v for v in values], dtype=float)
    if x.shape != y.shape:
        raise ValueError("years y values deben tener la misma longitud")
    ok = np.isfinite(x) & np.isfinite(y)
    return x[ok], y[ok]


def cv(values) -> float:
    """Coeficiente de variación (desviación estándar muestral / media)."""
    _, y = clean(np.arange(len(values)), values)
    if len(y) < 3 or y.mean() == 0:
        return NAN
    return float(y.std(ddof=1) / abs(y.mean()))


# ----------------------------------------------------------------------------- Sen
@dataclass(frozen=True)
class SenResult:
    slope_dec: float      # unidades del indicador por década
    intercept: float      # valor en el año 0 de la recta (convención de scipy: med(y) - b*med(x))
    ci_low_dec: float
    ci_high_dec: float
    n_valid: int


def sen_slope(years, values, confidence: float = 0.95, min_n: int = 5) -> SenResult:
    x, y = clean(years, values)
    n = len(y)
    if n < min_n:
        return SenResult(NAN, NAN, NAN, NAN, n)
    slope, intercept, lo, hi = sps.theilslopes(y, x, alpha=confidence)
    return SenResult(float(slope) * 10.0, float(intercept), float(lo) * 10.0, float(hi) * 10.0, n)


# ----------------------------------------------------------------------------- Mann-Kendall
@dataclass(frozen=True)
class MKResult:
    p: float
    variant: str          # "original" | "hamed_rao"
    lag1: float           # autocorrelación de retardo 1 de la serie sin tendencia
    z: float
    n_valid: int


def _p_two_sided(z: float) -> float:
    return math.erfc(abs(z) / math.sqrt(2.0))


def mk_original(y) -> tuple[float, float]:
    """Mann-Kendall original (con corrección de empates). Devuelve (p, z).

    Es la misma cuenta que pymannkendall.original_test; se reescribe para ser rápida en la huella
    (cientos de miles de ventanas). La prueba test_stats.py comprueba que coinciden.
    """
    y = np.asarray(y, dtype=float)
    n = len(y)
    if n < 3:
        return NAN, NAN
    iu = np.triu_indices(n, 1)
    s = float(np.sign(y[iu[1]] - y[iu[0]]).sum())
    _, counts = np.unique(y, return_counts=True)
    tie = float((counts * (counts - 1) * (2 * counts + 5)).sum())
    var_s = (n * (n - 1) * (2 * n + 5) - tie) / 18.0
    if var_s <= 0:
        return 1.0, 0.0
    if s > 0:
        z = (s - 1.0) / math.sqrt(var_s)
    elif s < 0:
        z = (s + 1.0) / math.sqrt(var_s)
    else:
        z = 0.0
    return _p_two_sided(z), z


def lag1_autocorr(years, values, slope_dec: float, intercept: float) -> float:
    """Autocorrelación de retardo 1 de los residuos respecto de la recta de Sen.

    Si faltan años, los residuos consecutivos del arreglo no son años consecutivos: es una
    aproximación y se declara en la documentación.
    """
    x, y = clean(years, values)
    if len(y) < 5 or not math.isfinite(slope_dec):
        return NAN
    r = y - (intercept + (slope_dec / 10.0) * x)
    r = r - r.mean()
    den = float((r * r).sum())
    if den == 0:
        return 0.0
    return float((r[:-1] * r[1:]).sum() / den)


def mann_kendall(years, values, sen: SenResult | None = None, lag1_z: float = 1.96) -> MKResult:
    """Mann-Kendall con revisión de autocorrelación (plan 4.3).

    1. Se calcula la autocorrelación de retardo 1 de los residuos de la recta de Sen.
    2. Si |r1| > z / sqrt(n) se usa la variante de Hamed y Rao (pymannkendall); si no, la original.
    3. Se guarda cuál se usó.
    """
    x, y = clean(years, values)
    n = len(y)
    if n < 5:
        return MKResult(NAN, "original", NAN, NAN, n)
    if sen is None:
        sen = sen_slope(x, y)
    r1 = lag1_autocorr(x, y, sen.slope_dec, sen.intercept)
    p_orig, z_orig = mk_original(y)
    if math.isfinite(r1) and abs(r1) > lag1_z / math.sqrt(n):
        try:
            # Hamed-Rao puede dar varianza negativa en series cortas: entonces p es NaN y se usa la original.
            with np.errstate(all="ignore"):
                res = pmk.hamed_rao_modification_test(y)
            if math.isfinite(res.p):
                return MKResult(float(res.p), "hamed_rao", r1, float(res.z), n)
        except Exception:  # serie degenerada: se vuelve a la prueba original
            pass
    return MKResult(p_orig, "original", r1, z_orig, n)


# ----------------------------------------------------------------------------- Huella
@dataclass(frozen=True)
class WindowResult:
    start: int
    end: int
    n_valid: int
    valid: bool
    slope_dec: float
    p: float
    ci_low_dec: float
    ci_high_dec: float

    @property
    def length(self) -> int:
        return self.end - self.start + 1

    @property
    def key(self) -> str:
        return f"{self.start}-{self.end}"


def n_windows(n_years: int, min_len: int) -> int:
    """Número de ventanas (inicio, fin) con longitud >= min_len dentro de n_years años."""
    return sum(n_years - L + 1 for L in range(min_len, n_years + 1))


def footprint(years, values, period: tuple[int, int], min_len: int = 10,
              confidence: float = 0.95, min_valid_fraction: float = 0.9) -> list[WindowResult]:
    """Pendiente de Sen y p de Mann-Kendall (original) en cada ventana (inicio, fin).

    Orden: por año de inicio y luego por año de fin (2001-2010, 2001-2011, ..., 2002-2011, ...).
    Las ventanas se solapan: no son pruebas independientes y sus p NO se corrigen.
    Una ventana con menos de `min_valid_fraction` de años válidos queda sin resultado.
    """
    y0, y1 = period
    yrs = np.asarray(years, dtype=float)
    vals = np.array([np.nan if v is None else v for v in values], dtype=float)
    out: list[WindowResult] = []
    for s in range(y0, y1 + 1):
        for e in range(s + min_len - 1, y1 + 1):
            length = e - s + 1
            m = (yrs >= s) & (yrs <= e) & np.isfinite(vals)
            n = int(m.sum())
            if n < math.ceil(min_valid_fraction * length) or n < 5:
                out.append(WindowResult(s, e, n, False, NAN, NAN, NAN, NAN))
                continue
            sen = sen_slope(yrs[m], vals[m], confidence)
            p, _ = mk_original(vals[m])
            out.append(WindowResult(s, e, n, True, sen.slope_dec, p, sen.ci_low_dec, sen.ci_high_dec))
    return out


@dataclass(frozen=True)
class FootprintSummary:
    sign_agreement: float    # fracción de ventanas válidas (>= summary_min_len) con el signo del periodo base
    sig_fraction: float      # fracción con ese signo y p < alpha
    n_used: int


def footprint_summary(windows: list[WindowResult], base_slope_dec: float,
                      summary_min_len: int = 15, alpha: float = 0.05) -> FootprintSummary:
    use = [w for w in windows if w.valid and w.length >= summary_min_len]
    if not use or not math.isfinite(base_slope_dec) or base_slope_dec == 0:
        return FootprintSummary(NAN, NAN, len(use))
    sign = np.sign(base_slope_dec)
    same = [np.sign(w.slope_dec) == sign for w in use]
    sig = [s and (w.p < alpha) for s, w in zip(same, use)]
    n = len(use)
    return FootprintSummary(float(sum(same)) / n, float(sum(sig)) / n, n)


# ----------------------------------------------------------------------------- FDR
def fdr_adjust(pvals, method: str = "fdr_bh") -> np.ndarray:
    """p ajustados por Benjamini-Hochberg. Los NaN se ignoran y quedan como NaN."""
    p = np.asarray(pvals, dtype=float)
    out = np.full(p.shape, np.nan)
    ok = np.isfinite(p)
    if ok.any():
        out[ok] = multipletests(p[ok], method=method)[1]
    return out
