"""Build bilingual cell narratives offline. Template implementation assisted by Codex."""
import argparse
import json
import math
import re
from decimal import Decimal
from pathlib import Path

VERDICTS = {
    "consistente": ("La evidencia respalda una tendencia consistente en este registro.",
                    "The evidence supports a consistent trend in this record."),
    "limitada": ("La señal es débil y sigue sin confirmarse.",
                 "The signal is weak and remains unconfirmed."),
    "sin_evidencia": ("La evidencia disponible no permite distinguir una tendencia.",
                      "The available evidence does not distinguish a trend."),
    "incompleta": ("Faltan observaciones para evaluar la tendencia.",
                   "Too many observations are missing to assess the trend."),
}
NUMBER = re.compile(r"(?<!\w)[+−-]?\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?")
FORBIDDEN = re.compile(r"\b(predic\w*|caus\w*|forecast\w*|va a llover|will rain|probability|probabilidad)\b", re.I)


def validate(text, slope):
    allowed = set() if slope is None else {Decimal(str(slope))}
    for token in NUMBER.findall(text):
        if Decimal(token.replace("−", "-").replace(",", ".")) not in allowed:
            raise ValueError(f"Unsupported number: {token}")
    if FORBIDDEN.search(text):
        raise ValueError("Unsupported predictive, causal or probability claim")


def narrate(indicator, simulated):
    verdict = indicator["verdict"]
    es, en = VERDICTS[verdict]
    slope = (indicator.get("statistics") or {}).get("slope_per_decade")
    if slope is not None and (type(slope) not in (float, int) or not math.isfinite(slope)):
        raise ValueError("Invalid rainfall slope")
    if verdict != "incompleta" and slope is not None:
        value = str(slope)
        es += f" La pendiente estimada es de {value.replace('.', ',')} mm por década."
        en += f" The estimated slope is {value} mm per decade."
    else:
        es += " Consulta la completitud de la serie en el panel."
        en += " Check the series completeness in the panel."
    if simulated:
        es = "Ejemplo simulado. " + es
        en = "Simulated example. " + en
    for text in (es, en):
        validate(text, slope)
    return {"es": es, "en": en, "generated_by": "template"}


def run(root, check):
    meta = json.loads((root / "meta.json").read_text(encoding="utf-8"))
    simulated = meta.get("data_kind") == "mock" or meta.get("pipeline_commit") == "MOCK"
    grid = json.loads((root / "grid.json").read_text(encoding="utf-8"))
    updates = {}
    for row in grid["cells"]:
        key = row["id"]
        if not re.fullmatch(r"[NS]\d{4}[EW]\d{5}", key):
            raise ValueError(f"Invalid cell id: {key}")
        path = root / "cells" / f"{key}.json"
        cell = json.loads(path.read_text(encoding="utf-8"))
        if cell["id"] != key:
            raise ValueError(f"Cell id mismatch: {key}")
        for name in ("annual_mm", "jul_aug_mm", "may_oct_mm"):
            if name not in cell["indicators"]:
                continue
            ind = cell["indicators"][name]
            expected = narrate(ind, simulated)
            if check and ind.get("narrative") != expected:
                raise ValueError(f"Stale narrative: {key}/{name}")
            ind["narrative"] = expected
        updates[path] = cell
    if not check:
        for path, cell in updates.items():
            payload = json.dumps(cell, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
            path.write_text(payload + "\n", encoding="utf-8")
    print(f"{len(updates)} cells {'checked' if check else 'narrated'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("data", type=Path, help="Directory containing meta.json, grid.json and cells/")
    parser.add_argument("--check", action="store_true", help="Verify without writing")
    args = parser.parse_args()
    run(args.data, args.check)
