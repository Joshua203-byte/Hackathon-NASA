"""Motor estadístico de ALTARIS (Rol 2).

Todo es determinista. Ninguna función rellena valores faltantes: los años
sin dato (NaN) se descartan antes de calcular.

Convenciones
- `years` y `values` son arreglos 1-D del mismo largo; `values` puede traer NaN.
- Las pendientes se devuelven en unidades físicas por DÉCADA.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from functools import lru_cache

import numpy as np
import pymannkendall as pmk
from scipy import stats as sps
from statsmodels.stats.multitest import multipletests


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def _valid(years, values):
    years = np.asarray(years, dtype=float)
    values = np.asarray(values, dtype=float)
    if years.shape != values.shape:
        raise ValueError("years y values deben tener el mismo largo")
    mask = np.isfinite(values) & np.isfinite(years)
    return years[mask], values[mask]


# ---------------------------------------------------------------------------
# Pendiente de Sen (Theil-Sen)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class SenResult:
    slope_dec: float      # unidades por década
    intercept: float      # valor de la recta en el año `x0`
    x0: float             # año de referencia del intercepto
    ci_low_dec: float
    ci_high_dec: float


def sen_slope(years, values, alpha: float = 0.05, x0: float | None = None) -> SenResult:
    """Pendiente de Sen con IC (1 - alpha), en unidades por década.

    La recta es: y(año) = intercept + (slope_dec / 10) * (año - x0).
    Por defecto x0 es el primer año de `years` (válido o no).
    """
    if x0 is None:
        x0 = float(np.asarray(years, dtype=float)[0])
    x, y = _valid(years, values)
    if len(y) < 3:
        nan = float("nan")
        return SenResult(nan, nan, x0, nan, nan)
    res = sps.theilslopes(y, x, alpha=1 - alpha)
    slope, low, high = float(res.slope), float(res.low_slope), float(res.high_slope)
    # scipy usa intercept = mediana(y) - pendiente * mediana(x); se re-expresa en x0
    intercept_x0 = float(np.median(y) - slope * (np.median(x) - x0))
    return SenResult(slope * 10, intercept_x0, x0, low * 10, high * 10)


# ---------------------------------------------------------------------------
# Mann-Kendall
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class MKResult:
    p: float
    variant: str          # "original" | "hamed_rao" | "tfpw" (respaldo si Hamed-Rao falla)
    lag1_autocorr: float
    lag1_significant: bool


def lag1_autocorr(x: np.ndarray) -> float:
    x = np.asarray(x, dtype=float)
    if len(x) < 3:
        return float("nan")
    xm = x - x.mean()
    den = float(np.sum(xm * xm))
    if den == 0:
        return 0.0
    return float(np.sum(xm[:-1] * xm[1:]) / den)


def lag1_is_significant(r1: float, n: int, alpha: float = 0.05) -> bool:
    """Límites de Anderson (1942) para r1 bajo ruido blanco."""
    if not np.isfinite(r1) or n < 4:
        return False
    z = sps.norm.ppf(1 - alpha / 2)
    lo = (-1 - z * math.sqrt(n - 2)) / (n - 1)
    hi = (-1 + z * math.sqrt(n - 2)) / (n - 1)
    return bool(r1 < lo or r1 > hi)


def mann_kendall(years, values, alpha: float = 0.05, autocorr_alpha: float = 0.05) -> MKResult:
    """Mann-Kendall con revisión de autocorrelación.

    1. Se quita la tendencia de Sen y se calcula r1 de los residuos.
    2. Si r1 es significativo se usa la variante de Hamed y Rao (1998);
       si no, la prueba original.
    """
    x, y = _valid(years, values)
    n = len(y)
    if n < 4 or np.all(y == y[0]):
        return MKResult(float("nan") if n < 4 else 1.0, "original", float("nan"), False)
    sen = sps.theilslopes(y, x)
    resid = y - (sen.intercept + sen.slope * x)
    r1 = lag1_autocorr(resid)
    sig = lag1_is_significant(r1, n, autocorr_alpha)
    if sig:
        with np.errstate(invalid="ignore"):
            p = float(pmk.hamed_rao_modification_test(y, alpha=alpha).p)
        variant = "hamed_rao"
        if not np.isfinite(p):
            # Hamed-Rao puede dar varianza corregida negativa en series cortas.
            # Respaldo: pre-blanqueo sin tendencia (TFPW, Yue et al. 2002).
            p = float(pmk.trend_free_pre_whitening_modification_test(y, alpha=alpha).p)
            variant = "tfpw"
    else:
        p = float(pmk.original_test(y, alpha=alpha).p)
        variant = "original"
    return MKResult(p, variant, r1, sig)


def _mk_original_p(y: np.ndarray) -> float:
    """Mann-Kendall original con corrección por empates (igual a pymannkendall.original_test).

    Versión rápida para series cortas; se usa en la huella (miles de ventanas).
    """
    n = len(y)
    if n < 3:
        return float("nan")
    diff = y[None, :] - y[:, None]
    s = float(np.sum(np.sign(diff[np.triu_indices(n, 1)])))
    _, counts = np.unique(y, return_counts=True)
    var_s = (n * (n - 1) * (2 * n + 5) - np.sum(counts * (counts - 1) * (2 * counts + 5))) / 18.0
    if var_s <= 0:
        return 1.0
    if s > 0:
        z = (s - 1) / math.sqrt(var_s)
    elif s < 0:
        z = (s + 1) / math.sqrt(var_s)
    else:
        z = 0.0
    return float(2 * (1 - sps.norm.cdf(abs(z))))


# ---------------------------------------------------------------------------
# Huella de estabilidad
# ---------------------------------------------------------------------------

def windows(start: int, end: int, min_len: int = 10):
    """Todas las ventanas (inicio, fin) con largo ≥ min_len, ordenadas."""
    out = []
    for s in range(start, end + 1):
        for e in range(s + min_len - 1, end + 1):
            out.append((s, e))
    return out


@lru_cache(maxsize=64)
def _triu(n: int):
    return np.triu_indices(n, 1)


def footprint(years, values, min_len: int = 10, min_valid_fraction: float = 0.8):
    """Sen + MK (original) en cada ventana de ≥ min_len años.

    Devuelve una lista de [inicio, fin, pendiente_por_década, p].
    Si una ventana tiene menos de `min_valid_fraction` de años válidos,
    pendiente y p son None. Los p NO se corrigen: las ventanas se solapan
    y la huella es una exploración de sensibilidad, no una prueba formal.
    """
    years = np.asarray(years, dtype=int)
    values = np.asarray(values, dtype=float)
    ok = np.isfinite(values)
    xv = years[ok].astype(float)          # años válidos, ordenados
    yv = values[ok]
    # Matrices de pares precalculadas una vez por serie; cada ventana es un bloque contiguo.
    with np.errstate(divide="ignore", invalid="ignore"):
        slopes_m = (yv[None, :] - yv[:, None]) / (xv[None, :] - xv[:, None])
    sign_m = np.sign(yv[None, :] - yv[:, None])
    sqrt2 = math.sqrt(2.0)
    out = []
    for s, e in windows(int(years.min()), int(years.max()), min_len):
        i0 = int(np.searchsorted(xv, s, "left"))
        i1 = int(np.searchsorted(xv, e, "right"))
        n = i1 - i0
        if n < max(3, math.ceil(min_valid_fraction * (e - s + 1))):
            out.append([s, e, None, None])
            continue
        iu = _triu(n)
        slope = float(np.median(slopes_m[i0:i1, i0:i1][iu])) * 10
        # Mann-Kendall original con corrección por empates (equivale a _mk_original_p)
        S = float(sign_m[i0:i1, i0:i1][iu].sum())
        var_s = n * (n - 1) * (2 * n + 5) / 18.0
        if np.any(sign_m[i0:i1, i0:i1][iu] == 0):  # hay empates: corrección
            _, counts = np.unique(yv[i0:i1], return_counts=True)
            var_s -= float(np.sum(counts * (counts - 1) * (2 * counts + 5))) / 18.0
        if var_s <= 0:
            p = 1.0
        else:
            z = (S - np.sign(S)) / math.sqrt(var_s)
            p = math.erfc(abs(z) / sqrt2)
        out.append([s, e, slope, p])
    return out


def footprint_summary(fp, base_slope_dec: float, verdict_min_len: int = 15, alpha: float = 0.05):
    """`sign_agreement` y `sig_fraction` sobre las ventanas de ≥ verdict_min_len años.

    - sign_agreement: fracción de ventanas con el mismo signo que el periodo base.
    - sig_fraction: fracción de ventanas con p < alpha y el mismo signo.
    Las ventanas sin dato (None) no cuentan en el denominador.
    """
    if not np.isfinite(base_slope_dec):
        return float("nan"), float("nan"), 0
    base_sign = np.sign(base_slope_dec)
    rows = [w for w in fp if (w[1] - w[0] + 1) >= verdict_min_len and w[2] is not None]
    if not rows:
        return float("nan"), float("nan"), 0
    same = [np.sign(w[2]) == base_sign for w in rows]
    sig = [s and (w[3] is not None and w[3] < alpha) for s, w in zip(same, rows)]
    return float(np.mean(same)), float(np.mean(sig)), len(rows)


# ---------------------------------------------------------------------------
# Comparaciones múltiples
# ---------------------------------------------------------------------------

def fdr_adjust(pvals, method: str = "fdr_bh") -> np.ndarray:
    """Benjamini-Hochberg ignorando NaN (los NaN se devuelven como NaN)."""
    p = np.asarray(pvals, dtype=float)
    out = np.full_like(p, np.nan)
    m = np.isfinite(p)
    if m.any():
        out[m] = multipletests(p[m], method=method)[1]
    return out


def coefficient_of_variation(values) -> float:
    v = np.asarray(values, dtype=float)
    v = v[np.isfinite(v)]
    if len(v) < 2 or v.mean() == 0:
        return float("nan")
    return float(v.std(ddof=1) / v.mean())
