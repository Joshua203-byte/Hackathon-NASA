"""Narrativa determinista de plantilla (Plan B del narrador de Rol 6). Solo usa cifras del propio JSON.
Si Rol 6 entrega narratives.json ({"<id>|<indicador>": {"es","en","generated_by"}}), eso tiene prioridad."""
from __future__ import annotations

import math

LABEL = {
    "es": {"consistente": "tendencia consistente", "limitada": "señal débil, no confirmada",
           "sin_evidencia": "sin evidencia de tendencia", "incompleta": "datos incompletos"},
    "en": {"consistente": "consistent trend", "limitada": "weak signal, not confirmed",
           "sin_evidencia": "no evidence of a trend", "incompleta": "incomplete data"},
}
NAME = {
    "may_oct_mm": ("Lluvia de temporada (may–oct)", "Rainy-season rainfall (May–Oct)"),
    "jul_aug_mm": ("Lluvia de canícula (jul–ago)", "Midsummer-drought rainfall (Jul–Aug)"),
    "annual_mm": ("Lluvia anual", "Annual rainfall"),
}


def template(key: str, units: str, period, valid_years: int, n_years: int, stat: dict | None, verdict: str) -> dict:
    es_n, en_n = NAME.get(key, (key, key))
    a, b = period
    if verdict == "incompleta" or not stat:
        es = f"{es_n}: solo hay {valid_years}/{n_years} años válidos, así que no se evalúa la tendencia."
        en = f"{en_n}: only {valid_years}/{n_years} valid years, so the trend is not assessed."
    else:
        s = round(stat["slope_per_decade"], 1)
        st = f"{s:+}" if s else "0.0"   # una pendiente que redondea a cero va sin signo (evita "-0.0")
        lo, hi = (round(x, 1) if x is not None and math.isfinite(x) else None for x in stat["ci_95"])
        es = (f"{es_n}, {a}–{b}: pendiente de Sen de {st} {units} por década (IC 95 %: {lo} a {hi}). "
              f"Veredicto: {LABEL['es'][verdict]}.")
        en = (f"{en_n}, {a}–{b}: Sen slope of {st} {units} per decade (95% CI: {lo} to {hi}). "
              f"Verdict: {LABEL['en'][verdict]}.")
        if verdict == "sin_evidencia":
            es += " No encontrar una tendencia también es un hallazgo."
            en += " Not finding a trend is a finding too."
    return {"es": es, "en": en, "generated_by": "template"}
