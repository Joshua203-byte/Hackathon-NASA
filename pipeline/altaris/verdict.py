"""Veredicto determinista de ALTARIS (sección 4.6 del plan).

Orden de evaluación: incompleta → consistente → limitada → sin_evidencia.
Cada veredicto trae sus razones (`verdict_reasons`) con claves fijas que la
web traduce. Los umbrales viven en config.yaml y no se tocan después de ver
el mapa.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

VERDICTS = ("consistente", "limitada", "sin_evidencia", "incompleta")

# Claves fijas de razones (la web las traduce; no cambiar sin avisar a Rol 5)
REASONS = {
    "datos_incompletos",
    "fdr_significativo", "fdr_no_significativo",
    "ic_excluye_cero", "ic_incluye_cero",
    "huella_estable", "huella_inestable",
    "ventanas_significativas", "pocas_ventanas_significativas",
    "sobrevive_enso", "no_sobrevive_enso", "enso_pendiente",
    "sin_salto_2014", "posible_salto_2014", "salto_2014_pendiente",
    "p_sin_ajustar_bajo", "signo_estable_magnitud_relevante",
    "sin_senal",
}


@dataclass
class VerdictInput:
    valid_years: int
    n_years: int
    slope_dec: float
    ci_low: float
    ci_high: float
    p: float
    p_fdr: float
    mean: float
    sign_agreement: float
    sig_fraction: float
    cv: float = float("nan")
    enso_survives: bool | None = None     # None = prueba ENSO aún no disponible
    break_2014_flag: bool | None = None   # None = chequeo 2014 aún no disponible


@dataclass
class VerdictResult:
    verdict: str
    reasons: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)


def _ok(x) -> bool:
    return x is not None and isinstance(x, (int, float)) and math.isfinite(x)


def decide(v: VerdictInput, cfg: dict) -> VerdictResult:
    """Aplica las reglas de la sección 4.6. `cfg` es la sección `verdict` de config.yaml."""
    tags = []
    if _ok(v.cv) and v.cv > cfg["cv_alta_variabilidad"]:
        tags.append("alta_variabilidad")

    # 1. incompleta
    if v.n_years - v.valid_years > cfg["max_missing_years"] or not _ok(v.slope_dec) or not _ok(v.p):
        return VerdictResult("incompleta", ["datos_incompletos"], tags)

    # 2. condiciones de consistente
    checks = []  # (cumple, razón_si_cumple, razón_si_no)
    checks.append((_ok(v.p_fdr) and v.p_fdr < cfg["fdr_level"], "fdr_significativo", "fdr_no_significativo"))
    ci_excl = _ok(v.ci_low) and _ok(v.ci_high) and (v.ci_low > 0 or v.ci_high < 0)
    checks.append((ci_excl, "ic_excluye_cero", "ic_incluye_cero"))
    checks.append((_ok(v.sign_agreement) and v.sign_agreement >= cfg["sign_agreement_consistente"],
                   "huella_estable", "huella_inestable"))
    checks.append((_ok(v.sig_fraction) and v.sig_fraction >= cfg["sig_fraction_consistente"],
                   "ventanas_significativas", "pocas_ventanas_significativas"))

    pending = []
    if cfg.get("require_enso_survives", True):
        if v.enso_survives is None:
            pending.append("enso_pendiente")
        else:
            checks.append((bool(v.enso_survives), "sobrevive_enso", "no_sobrevive_enso"))

    if v.break_2014_flag is None:
        pending.append("salto_2014_pendiente")
    else:
        checks.append((not v.break_2014_flag, "sin_salto_2014", "posible_salto_2014"))

    passed = [ok for ok, _, _ in checks]
    pos = [a for ok, a, _ in checks if ok]
    neg = [b for ok, _, b in checks if not ok]

    if all(passed):
        return VerdictResult("consistente", pos + pending, tags)

    # 3. limitada (no es consistente y cumple al menos un disparador).
    #    Una celda con bandera de 2014 que cumplía todo lo demás queda en limitada.
    triggers = []
    if v.p < cfg["p_raw_limitada"]:
        triggers.append("p_sin_ajustar_bajo")
    p_cap = cfg.get("p_max_sign_rule")  # opcional; null = regla tal como está en el plan
    if (_ok(v.sign_agreement) and v.sign_agreement >= cfg["sign_agreement_limitada"]
            and _ok(v.mean) and v.mean > 0
            and abs(v.slope_dec) >= cfg["min_slope_pct_mean_per_decade"] / 100 * v.mean
            and (p_cap is None or v.p < p_cap)):
        triggers.append("signo_estable_magnitud_relevante")
    only_break = neg == ["posible_salto_2014"]
    if triggers or only_break:
        return VerdictResult("limitada", neg + triggers + pending, tags)

    # 4. sin_evidencia
    return VerdictResult("sin_evidencia", ["sin_senal"] + neg + pending, tags)
