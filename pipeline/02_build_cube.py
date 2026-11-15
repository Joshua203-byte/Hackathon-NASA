"""Rol 1 · 02 — Cubo mensual en mm/mes y serie piloto de Choluteca.

  python 02_build_cube.py                 # cubo + piloto Choluteca (lo primero que necesitan Joshua y Camila)
  python 02_build_cube.py --pilot-only    # solo la serie de Choluteca, aunque falten meses de la región

Lee data/raw/imerg/YYYYMM.nc (de 01_download_imerg.py), convierte mm/h → mm/mes con los días reales
(febrero bisiesto incluido) y guarda data/interim/cube_monthly_mm.nc con dimensiones (time, lat, lon),
latitud ascendente. Los meses ausentes quedan como NaN: nunca se rellenan con ceros.

Piloto: data/rol1/piloto_choluteca/{cells.csv, series.csv, monthly.csv} en el formato de pipeline/README.md.

Código escrito con asistencia de IA (Claude); revisado y probado por el equipo (ver docs/rol1-datos.md).
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402

from altaris import deliver, imerg  # noqa: E402
from altaris.config import load_config  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
RAW = REPO / "data" / "raw" / "imerg"
CUBE = REPO / "data" / "interim" / "cube_monthly_mm.nc"
PILOT_DIR = REPO / "data" / "rol1" / "piloto_choluteca"


def build_cube(raw_dir: Path, period: tuple[int, int]):
    """(meses, lat, lon, cube_mm) con NaN en meses o celdas sin dato."""
    import xarray as xr

    y0, y1 = period
    months = [(y, m) for y in range(y0, y1 + 1) for m in range(1, 13)]
    lat = lon = None
    cube = None
    present = 0
    for t, (y, m) in enumerate(months):
        f = raw_dir / f"{y}{m:02d}.nc"
        if not f.exists():
            continue
        with xr.open_dataset(f, engine="h5netcdf") as ds:
            ds = ds.sortby("lat").sortby("lon")
            if lat is None:
                lat, lon = ds["lat"].values.astype(float), ds["lon"].values.astype(float)
                cube = np.full((len(months), len(lat), len(lon)), np.nan, dtype="float32")
            elif not (np.allclose(ds["lat"].values, lat) and np.allclose(ds["lon"].values, lon)):
                raise ValueError(f"{f.name}: la rejilla no coincide con la de los demás meses")
            cube[t] = imerg.rate_to_mm(ds["precipitation_rate"].values, y, m)
        present += 1
    if cube is None:
        raise SystemExit(f"No hay meses descargados en {raw_dir}. Correr antes 01_download_imerg.py")
    return months, lat, lon, cube, present


def save_cube(months, lat, lon, cube, path: Path):
    import pandas as pd
    import xarray as xr

    time = pd.to_datetime([f"{y}-{m:02d}-01" for y, m in months])
    ds = xr.Dataset({"precip_mm": (("time", "lat", "lon"), cube)},
                    coords={"time": time, "lat": np.round(lat, 2), "lon": np.round(lon, 2)},
                    attrs={"units": "mm/mes", "source": f"{imerg.SHORT_NAME} V{imerg.VERSION}", "doi": imerg.DOI,
                           "conversion": "mm/mes = tasa (mm/h) × 24 × días reales del mes",
                           "missing": "NaN = sin dato; nunca se rellena con 0"})
    path.parent.mkdir(parents=True, exist_ok=True)
    ds.to_netcdf(path, engine="h5netcdf", encoding={"precip_mm": {"zlib": True, "complevel": 4}})


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pilot-only", action="store_true")
    ap.add_argument("--config", help="otro config.yaml (p. ej. para otra región)")
    ap.add_argument("--data-dir", help="carpeta de datos en lugar de <repo>/data")
    a = ap.parse_args()
    global RAW, CUBE, PILOT_DIR
    if a.data_dir:
        d = Path(a.data_dir)
        RAW, CUBE, PILOT_DIR = d / "raw" / "imerg", d / "interim" / "cube_monthly_mm.nc", d / "rol1" / "piloto_choluteca"
    cfg = load_config(a.config)
    months, lat, lon, cube, present = build_cube(RAW, tuple(cfg["period"]))
    print(f"Meses con dato: {present}/{len(months)}. Rejilla {len(lat)} × {len(lon)} "
          f"(lat {lat[0]:.2f}..{lat[-1]:.2f}, lon {lon[0]:.2f}..{lon[-1]:.2f})")

    # Piloto Choluteca primero: es lo que destraba a Joshua (H1) y a Camila
    cid, plat, plon = imerg.pilot_cell()
    i, j = int(np.argmin(abs(lat - plat))), int(np.argmin(abs(lon - plon)))
    if abs(lat[i] - plat) > 0.01 or abs(lon[j] - plon) > 0.01:
        print(f"Aviso: la celda piloto {cid} no está en este recuadro; se omite el piloto.")
        files = None
    else:
        files = deliver.write_deliverables(
        PILOT_DIR, [{"cell_id": cid, "lat": plat, "lon": plon, "country": "HND"}],
        {cid: cube[:, i, j]}, months, cfg)
    if files:
        print(f"Piloto {imerg.PILOT['name']} ({cid}, {plat} N, {-plon} O) → {', '.join(p.name for p in files)}")
        print(deliver.summary(PILOT_DIR / "series.csv"))

    if not a.pilot_only:
        save_cube(months, lat, lon, cube, CUBE)
        print(f"Cubo guardado: {CUBE}")


if __name__ == "__main__":
    main()
