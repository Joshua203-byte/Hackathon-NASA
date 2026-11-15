"""Veredicto determinista (plan 4.6). Se evalúa en este orden:

  incompleta -> consistente -> limitada -> sin_evidencia

Todos los umbrales viven en config.yaml. Aquí no hay números mágicos.
La IA generativa NO participa: nunca calcula cifras ni decide un veredicto.
"""
from __future__ import annotations

import math
from typing import Any

from .reasons import REASONS
from .stats import WindowResult

VERDICTS = ("consistente", "limitada", "sin_evidencia", "incompleta")


def _finite(x: Any) -> bool:
    return x is not None and isinstance(x, (int, float)) and math.isfinite(x)


def ci_excludes_zero(lo: Any, hi: Any) -> bool:
    return _finite(lo) and _finite(hi) and (lo > 0 or hi < 0)


def base_verdict(
    *,
    valid_years: int,
    n_years: int,
    slope_dec: float,
    mean: float,
    ci: tuple[float, float],
    p: float,
    p_fdr: float | None,
    sign_agreement: float,
    sig_fraction: float,
    enso_survives: bool | None,
    break_flag: bool | None,
    cfg: dict,
) -> tuple[str, list[str]]:
    """Veredicto del periodo base. Devuelve (veredicto, razones)."""
    v = cfg["verdict"]
    fdr_level = cfg["stats"]["fdr"]["level"]

    if valid_years < n_years - v["max_missing_years"] or not _finite(slope_dec):
        return "incompleta", ["pocos_anios"]

    fail: list[str] = []
    pending: list[str] = []

    # 1) FDR
    if not _finite(p_fdr):
        pending.append("fdr_pendiente")
        fdr_ok = False
    elif p_fdr < fdr_level:
        fdr_ok = True
    else:
        fdr_ok = False
        fail.append("fdr_no_significativo")

    # 2) intervalo de confianza
    ci_ok = ci_excludes_zero(*ci) if v["consistente"]["require_ci_excludes_zero"] else True
    if not ci_ok:
        fail.append("ic_incluye_cero")

    # 3) huella
    c = v["consistente"]
    stable_ok = (_finite(sign_agreement) and _finite(sig_fraction)
                 and sign_agreement >= c["sign_agreement_min"] and sig_fraction >= c["sig_fraction_min"])
    if not stable_ok:
        fail.append("huella_inestable")

    # 4) ENSO (si no llegó, no bloquea pero queda anotado)
    enso_failed = False
    if c["require_enso_survives"]:
        if enso_survives is None:
            pending.append("enso_pendiente")
        elif enso_survives is False:
            enso_failed = True
            fail.append("enso_no_sobrevive")

    # 5) salto de 2014
    break_true = False
    if c["forbid_break_2014"]:
        if break_flag is None:
            pending.append("chequeo_2014_pendiente")
        elif break_flag is True:
            break_true = True
            fail.append("posible_salto_2014")

    core_ok = fdr_ok and ci_ok and stable_ok and not enso_failed

    if core_ok and not break_true:
        return "consistente", ["criterios_cumplidos"] + pending

    # Candidata a consistente pero con salto en 2014: el techo es limitada.
    if core_ok and break_true:
        return "limitada", fail + pending

    # limitada: señal débil, NO confirmada
    lim = v["limitada"]
    pct_ok = (_finite(mean) and mean != 0 and
              abs(slope_dec) >= (lim["min_slope_pct_of_mean_per_decade"] / 100.0) * abs(mean))
    weak = (_finite(p) and p < lim["p_unadjusted_max"]) or (
        _finite(sign_agreement) and sign_agreement >= lim["sign_agreement_min"] and pct_ok)
    if weak:
        return "limitada", fail + pending

    if _finite(p) and p >= lim["p_unadjusted_max"]:
        fail.append("p_no_significativo")
    return "sin_evidencia", fail + pending


def window_verdict(
    w: WindowResult,
    *,
    base_key: str,
    base_sign: float,
    base_ci: tuple[float | None, float | None],
    base_verdict: str,
    base_reasons: list[str],
    cfg: dict,
) -> tuple[tuple[float | None, float | None], str, list[str]]:
    """Resultado oficial de una ventana para el comparador del panel.

    Regla (justificada en config.yaml, `window_verdict`):
      * La ventana igual al periodo base hereda su veredicto.
      * Una ventana sin años suficientes es `incompleta`.
      * En el resto, una ventana no tiene corrección por comparaciones múltiples entre celdas, ni huella
        propia, ni controles ENSO ni de 2014. Por eso su techo es `limitada` ("señal débil, no confirmada"):
        p < p_max y, si se exige, IC que excluye cero.
      * Si el signo contradice al del periodo base se añade `ventana_signo_opuesto` (informativo).
    """
    wv = cfg["window_verdict"]
    if wv["max_label"] != "limitada":
        raise ValueError("window_verdict.max_label solo admite 'limitada': una ventana no puede ser 'consistente'")
    if w.key == base_key:
        return base_ci, base_verdict, list(base_reasons)
    if not w.valid:
        return (None, None), "incompleta", ["ventana_pocos_anios"]

    ci = (w.ci_low_dec, w.ci_high_dec)
    sig = w.p < wv["p_max"]
    ci_ok = ci_excludes_zero(*ci) if wv["require_ci_excludes_zero"] else True
    if sig and ci_ok:
        reasons = ["ventana_sin_correccion"]
        if _finite(base_sign) and base_sign != 0 and math.copysign(1, w.slope_dec) != math.copysign(1, base_sign):
            reasons.append("ventana_signo_opuesto")
        return ci, "limitada", reasons
    return ci, "sin_evidencia", ["ventana_p_no_significativo"] if not sig else ["ic_incluye_cero"]


def all_codes_known(reasons: list[str]) -> bool:
    return all(r in REASONS for r in reasons)
