"""Rol 1 · Regenera todos los datos con un comando (criterio "Listo cuando" del plan, sección 5.2).

  python run_rol1.py            # descarga (reanudable) → cubo + piloto Choluteca → entregables de la región
  python run_rol1.py --config otra_region.yaml --data-dir /ruta/datos   # otra región, sin tocar la principal

Equivale a: 01_download_imerg.py, 02_build_cube.py y 03_indicators.py, en ese orden.
Necesita credenciales de NASA Earthdata (ver la cabecera de 01_download_imerg.py).
Salida: data/rol1/ (cells.csv, series.csv, monthly.csv, borders.geojson, provenance.json, piloto_choluteca/).

Código escrito con asistencia de IA (Claude); revisado y probado por el equipo (ver docs/rol1-datos.md).
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

for step in ("01_download_imerg.py", "02_build_cube.py", "03_indicators.py"):
    print(f"\n=== {step} ===", flush=True)
    r = subprocess.run([sys.executable, str(HERE / step), *sys.argv[1:]], cwd=HERE)
    if r.returncode != 0:
        sys.exit(f"{step} terminó con error ({r.returncode}). Corregir y volver a correr: lo ya hecho se reutiliza.")
print("\nListo: entregables en <data-dir>/rol1/ (por defecto, data/rol1/)")
