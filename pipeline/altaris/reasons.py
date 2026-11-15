"""Catálogo de razones del veredicto (`verdict_reasons`).

Es la lista COMPLETA de códigos que el motor puede emitir. La web (Rol 5) traduce cada código con
estos textos (se exportan a reasons.json). Un código nuevo exige añadirlo aquí; la prueba
test_verdict.py comprueba que el motor no emite códigos fuera de este catálogo.

`kind`:
  fail     un criterio no se cumplió (explica por qué no es `consistente`)
  pending  un control aún no llegó; el veredicto es provisional hasta que llegue
  info     contexto
"""
from __future__ import annotations

REASONS: dict[str, dict] = {
    # --- periodo base
    "criterios_cumplidos": {
        "kind": "info", "level": "base",
        "es": "Cumple todos los criterios: significativa tras la corrección, intervalo que no incluye cero y estable al mover la ventana",
        "en": "Meets all criteria: significant after correction, interval excludes zero, and stable when the window moves",
    },
    "pocos_anios": {
        "kind": "fail", "level": "base",
        "es": "Faltan años válidos: no se evalúa la tendencia",
        "en": "Too few valid years: trend not assessed",
    },
    "fdr_no_significativo": {
        "kind": "fail", "level": "base",
        "es": "No es significativa tras corregir por comparaciones múltiples (FDR)",
        "en": "Not significant after multiple-comparison correction (FDR)",
    },
    "ic_incluye_cero": {
        "kind": "fail", "level": "base",
        "es": "El intervalo de confianza de la pendiente incluye cero",
        "en": "The confidence interval of the slope includes zero",
    },
    "huella_inestable": {
        "kind": "fail", "level": "base",
        "es": "El signo o la significancia cambian al mover la ventana de años",
        "en": "Sign or significance changes when the year window moves",
    },
    "enso_no_sobrevive": {
        "kind": "fail", "level": "base",
        "es": "Al descontar ENSO, la pendiente cambia de signo o sale de su intervalo de confianza",
        "en": "When ENSO is removed, the slope changes sign or leaves its confidence interval",
    },
    "posible_salto_2014": {
        "kind": "fail", "level": "base",
        "es": "Posible salto entre 2013 y 2015: no se puede descartar un efecto del cambio de satélites",
        "en": "Possible break between 2013 and 2015: an instrument-change effect cannot be ruled out",
    },
    "p_no_significativo": {
        "kind": "fail", "level": "base",
        "es": "La prueba de Mann-Kendall no encuentra una tendencia distinguible del azar",
        "en": "The Mann-Kendall test finds no trend distinguishable from chance",
    },
    "fdr_pendiente": {
        "kind": "pending", "level": "base",
        "es": "Corrección por comparaciones múltiples pendiente: se calcula al procesar toda la región",
        "en": "Multiple-comparison correction pending: computed when the whole region is processed",
    },
    "enso_pendiente": {
        "kind": "pending", "level": "base",
        "es": "Control ENSO pendiente: el veredicto puede cambiar cuando llegue",
        "en": "ENSO check pending: the verdict may change when it arrives",
    },
    "chequeo_2014_pendiente": {
        "kind": "pending", "level": "base",
        "es": "Chequeo del salto de 2014 pendiente: el veredicto puede cambiar cuando llegue",
        "en": "2014 break check pending: the verdict may change when it arrives",
    },
    # --- ventanas (window_results)
    "ventana_pocos_anios": {
        "kind": "fail", "level": "window",
        "es": "La ventana no tiene suficientes años válidos",
        "en": "The window does not have enough valid years",
    },
    "ventana_sin_correccion": {
        "kind": "info", "level": "window",
        "es": "Señal en esta ventana sin corrección por comparaciones múltiples ni controles: es una prueba de sensibilidad, no una confirmación",
        "en": "Signal in this window without multiple-comparison correction or controls: a sensitivity check, not a confirmation",
    },
    "ventana_signo_opuesto": {
        "kind": "info", "level": "window",
        "es": "En esta ventana la pendiente tiene signo contrario al del periodo base",
        "en": "In this window the slope has the opposite sign to the base period",
    },
    "ventana_p_no_significativo": {
        "kind": "fail", "level": "window",
        "es": "En esta ventana no hay tendencia distinguible del azar",
        "en": "In this window there is no trend distinguishable from chance",
    },
}

# El panel de Rol 5 ya traduce estos para sus ejemplos; se conserva su nombre.
PENDING_CODES = tuple(k for k, v in REASONS.items() if v["kind"] == "pending")


def catalog() -> dict[str, dict]:
    return {k: {"es": v["es"], "en": v["en"], "kind": v["kind"], "level": v["level"]} for k, v in REASONS.items()}
