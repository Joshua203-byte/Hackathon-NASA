"""ALTARIS — funciones compartidas del pipeline (stats, verdict, io, steps)."""
import sys

# La consola de Windows usa cp1252 por defecto; los mensajes llevan tildes y flechas.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass
