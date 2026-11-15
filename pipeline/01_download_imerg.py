"""Rol 1 · 01 — Descarga IMERG mensual V07 recortado al Triángulo Norte.

  python 01_download_imerg.py --check                 # B0: inicia sesión, baja 1 mes y describe variables
  python 01_download_imerg.py                         # 2001-01 a 2024-12 (periodo de config.yaml)
  python 01_download_imerg.py --start 2001 --end 2012 # partir la descarga por años (p. ej. con Elena)
  python 01_download_imerg.py --method download       # plan B: archivos completos (~17 MB c/u) y recorte local

Credenciales de NASA Earthdata (https://urs.earthdata.nasa.gov), una de estas:
  * variables de entorno EARTHDATA_USERNAME y EARTHDATA_PASSWORD, o
  * archivo ~/.netrc (Windows: %USERPROFILE%\\_netrc) con
      machine urs.earthdata.nasa.gov login <usuario> password <contraseña>
La cuenta debe tener autorizada la aplicación "NASA GESDISC DATA ARCHIVE".

Salida: data/raw/imerg/YYYYMM.nc (lluvia en mm/h, recorte lat × lon) y data/raw/imerg/manifest.json.
Reanudable: los meses ya descargados se saltan.

Código escrito con asistencia de IA (Claude); revisado y probado por el equipo (ver docs/rol1-datos.md).
"""
import argparse
import io as _io
import json
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402

from altaris import imerg  # noqa: E402
from altaris.config import load_config  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "data" / "raw" / "imerg"


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def login():
    import earthaccess

    for strategy in ("environment", "netrc"):
        try:
            auth = earthaccess.login(strategy=strategy)
            if auth and auth.authenticated:
                log(f"Sesión Earthdata iniciada ({strategy}).")
                return auth
        except Exception:
            pass
    if sys.stdin.isatty():
        try:
            auth = earthaccess.login(strategy="interactive", persist=True)
            if auth and auth.authenticated:
                return auth
        except (EOFError, KeyboardInterrupt):
            pass
    sys.exit("No hay credenciales de Earthdata. Ver la cabecera de este script (EARTHDATA_USERNAME/"
             "EARTHDATA_PASSWORD o ~/.netrc).")


def search(start: str, end: str):
    import earthaccess

    res = earthaccess.search_data(short_name=imerg.SHORT_NAME, version=imerg.VERSION,
                                  temporal=(f"{start}-01T00:00:00Z", f"{end}T23:59:59Z"))
    out = []
    for g in res:
        ur = g["umm"]["GranuleUR"]
        y, m = imerg.granule_year_month(ur)
        out.append({"granule_ur": ur, "year": y, "month": m, "result": g})
    out.sort(key=lambda r: (r["year"], r["month"]))
    return out


def open_nc_bytes(content: bytes):
    """Abre la respuesta DAP4 (.dap.nc4) y devuelve (precip, lat, lon) como DataArrays con dims lat/lon."""
    return _extract(content)


def _extract(source):
    """Busca precipitation/lat/lon en la raíz o en el grupo Grid y normaliza los nombres de dimensiones.

    `source` es una ruta (archivo completo) o los bytes de la respuesta OPeNDAP (se leen en memoria:
    en Windows un archivo temporal abierto no se puede borrar).
    """
    import xarray as xr

    def norm(name: str) -> str:  # "Grid_precipitation" o "/Grid/lat" → "precipitation", "lat"
        name = name.split("/")[-1]
        return name[5:] if name.startswith("Grid_") else name

    for group in (None, "Grid"):
        try:
            src = _io.BytesIO(source) if isinstance(source, (bytes, bytearray)) else source
            ds = xr.open_dataset(src, engine="h5netcdf", group=group, mask_and_scale=False, decode_times=False)
        except (OSError, ValueError):
            continue
        if imerg.VAR in {norm(k) for k in ds.variables}:
            ds = ds.load()
            ren = {k: norm(k) for k in set(ds.variables) | set(ds.dims) if norm(k) != k}
            ds = ds.rename(ren)
            desc = imerg.describe_variables(ds)
            da = ds[imerg.VAR]
            fills = [da.attrs.get("_FillValue"), da.attrs.get("missing_value"), da.encoding.get("_FillValue")]
            da = imerg.to_lat_lon(da)
            units = str(da.attrs.get("units", da.attrs.get("Units", "")))
            ds.close()
            return da, fills, units, desc
        ds.close()
    raise ValueError(f"No se encontró '{imerg.VAR}' en la respuesta o archivo")


def save_month(da, fills, units, year, month, method, source):
    import xarray as xr

    rate = imerg.clean_rate(da.values, [f for f in fills if f is not None])
    out = xr.Dataset({"precipitation_rate": (("lat", "lon"), rate.astype("float32"))},
                     coords={"lat": np.round(da["lat"].values.astype(float), 2),
                             "lon": np.round(da["lon"].values.astype(float), 2)},
                     attrs={"year": year, "month": month, "units_original": units, "method": method,
                            "source": source, "note": "tasa media mensual en mm/h; NaN = sin dato (nunca 0)"})
    path = OUT / f"{year}{month:02d}.nc"
    out.to_netcdf(path, engine="h5netcdf")
    return path


# ---------------------------------------------------------------------------
# Método OPeNDAP (por defecto): solo baja el recorte
# ---------------------------------------------------------------------------

def opendap_setup(session, first_ur: str, bbox):
    url = imerg.opendap_url(first_ur)
    r = session.get(url + ".dmr", timeout=120)
    r.raise_for_status()
    layout = imerg.parse_dmr(r.text)
    log(f"DMR: {layout.path} dims={layout.dims}")
    r = session.get(f"{url}.dap.nc4", params={"dap4.ce": f"{layout.lat_path};{layout.lon_path}"}, timeout=300)
    r.raise_for_status()
    lat, lon = _coords_from_bytes(r.content)
    lat_rng = imerg.index_range(lat, *bbox["lat"])
    lon_rng = imerg.index_range(lon, *bbox["lon"])
    log(f"Recorte: lat[{lat_rng[0]}:{lat_rng[1]}] ({lat[lat_rng[0]]:.2f}..{lat[lat_rng[1]]:.2f}), "
        f"lon[{lon_rng[0]}:{lon_rng[1]}] ({lon[lon_rng[0]]:.2f}..{lon[lon_rng[1]]:.2f})")
    return layout, lat_rng, lon_rng


def _coords_from_bytes(content: bytes):
    import h5py

    found = {}

    def grab(name, obj):  # visititems se detiene si la función devuelve algo distinto de None
        base = name.split("/")[-1]
        base = base[5:] if base.startswith("Grid_") else base
        if isinstance(obj, h5py.Dataset) and base in ("lat", "lon"):
            found[base] = obj[()]

    with h5py.File(_io.BytesIO(content), "r") as f:
        f.visititems(grab)
    return np.asarray(found["lat"], float), np.asarray(found["lon"], float)


def fetch_opendap(session, g, layout, lat_rng, lon_rng, retries=4):
    url = imerg.opendap_url(g["granule_ur"])
    ce = imerg.subset_constraint(layout, lat_rng, lon_rng)
    last = None
    for k in range(retries):
        try:
            r = session.get(f"{url}.dap.nc4", params={"dap4.ce": ce}, timeout=300)
            r.raise_for_status()
            da, fills, units, desc = open_nc_bytes(r.content)
            return save_month(da, fills, units, g["year"], g["month"], "opendap", url), desc
        except Exception as e:  # red o servidor: reintento con espera creciente
            last = e
            time.sleep(2 ** k)
    raise RuntimeError(f"{g['granule_ur']}: {last}")


# ---------------------------------------------------------------------------
# Método de respaldo: archivo completo y recorte local
# ---------------------------------------------------------------------------

def fetch_full(g, bbox, tmpdir: Path):
    import earthaccess

    files = earthaccess.download([g["result"]], local_path=str(tmpdir), show_progress=False)
    if not files:
        raise RuntimeError(f"No se pudo descargar {g['granule_ur']}")
    path = Path(files[0])
    da, fills, units, desc = _extract(path)
    da = da.sel(lat=slice(*bbox["lat"]), lon=slice(*bbox["lon"]))
    out = save_month(da, fills, units, g["year"], g["month"], "download", g["granule_ur"])
    path.unlink(missing_ok=True)
    return out, desc


# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--start", help="año o AAAA-MM (por defecto, inicio del periodo de config.yaml)")
    ap.add_argument("--end", help="año o AAAA-MM (por defecto, fin del periodo)")
    ap.add_argument("--method", choices=("opendap", "download"), default="opendap")
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--check", action="store_true", help="B0: solo un mes, medir y describir variables")
    ap.add_argument("--config", help="otro config.yaml (p. ej. para otra región)")
    ap.add_argument("--data-dir", help="carpeta de datos en lugar de <repo>/data")
    a = ap.parse_args()
    global OUT
    if a.data_dir:
        OUT = Path(a.data_dir) / "raw" / "imerg"

    cfg = load_config(a.config)
    y0, y1 = cfg["period"]
    start = a.start or str(y0)
    end = a.end or str(y1)
    start = start if "-" in start else f"{start}-01"
    end = end if "-" in end else f"{end}-12"
    end_day = f"{end}-{imerg.days_in_month(*map(int, end.split('-'))):02d}"
    OUT.mkdir(parents=True, exist_ok=True)

    login()
    granules = search(start, end_day)
    log(f"CMR: {len(granules)} gránulos {start} → {end}")
    if a.check:
        granules = granules[-1:]
    todo = [g for g in granules if not (OUT / f"{g['year']}{g['month']:02d}.nc").exists()]
    log(f"Pendientes: {len(todo)} (ya descargados: {len(granules) - len(todo)})")

    manifest_path = OUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    manifest.update({"dataset": f"{imerg.SHORT_NAME} V{imerg.VERSION}", "concept_id": imerg.CONCEPT_ID,
                     "doi": imerg.DOI, "citation": imerg.CITATION, "bbox": cfg["bbox"], "method": a.method,
                     "search": {"short_name": imerg.SHORT_NAME, "version": imerg.VERSION,
                                "temporal": [start, end], "n_granules": len(granules)}})
    manifest.setdefault("files", {})
    t0 = time.time()
    failed = []
    desc_first = None

    if a.method == "opendap" and todo:
        import earthaccess
        session = earthaccess.get_requests_https_session()
        layout, lat_rng, lon_rng = opendap_setup(session, todo[0]["granule_ur"], cfg["bbox"])
        manifest["opendap"] = {"variable": layout.path, "dims": list(layout.dims),
                               "lat_index": list(lat_rng), "lon_index": list(lon_rng)}
        with ThreadPoolExecutor(max_workers=a.workers) as ex:
            futs = {ex.submit(fetch_opendap, session, g, layout, lat_rng, lon_rng): g for g in todo}
            for k, f in enumerate(as_completed(futs), 1):
                g = futs[f]
                try:
                    path, desc = f.result()
                    desc_first = desc_first or desc
                    manifest["files"][f"{g['year']}-{g['month']:02d}"] = {"granule": g["granule_ur"], "file": path.name}
                except Exception as e:
                    failed.append(f"{g['year']}-{g['month']:02d}: {e}")
                if k % 24 == 0 or k == len(todo):
                    log(f"  {k}/{len(todo)} meses ({time.time() - t0:.0f} s)")
    elif todo:
        with tempfile.TemporaryDirectory() as td:
            for k, g in enumerate(todo, 1):
                try:
                    path, desc = fetch_full(g, cfg["bbox"], Path(td))
                    desc_first = desc_first or desc
                    manifest["files"][f"{g['year']}-{g['month']:02d}"] = {"granule": g["granule_ur"], "file": path.name}
                except Exception as e:
                    failed.append(f"{g['year']}-{g['month']:02d}: {e}")
                if k % 12 == 0 or k == len(todo):
                    log(f"  {k}/{len(todo)} meses ({time.time() - t0:.0f} s)")

    if desc_first:
        manifest["variables_observed"] = desc_first
        log("Variables del primer archivo (anotar en el pasaporte):\n" + json.dumps(desc_first, indent=1, ensure_ascii=False))
    expected = {f"{y}-{m:02d}" for y in range(int(start[:4]), int(end[:4]) + 1) for m in range(1, 13)
                if f"{y}-{m:02d}" >= start and f"{y}-{m:02d}" <= end}
    manifest["missing_months"] = sorted(expected - set(manifest["files"])) if not a.check else []
    manifest["failed"] = failed
    if todo and len(failed) < len(todo):  # solo si de verdad se bajó algo en esta corrida
        manifest["downloaded_at"] = imerg.now_iso()
    imerg.write_json(manifest, manifest_path)

    if a.check and todo and not failed:
        f = OUT / f"{todo[0]['year']}{todo[0]['month']:02d}.nc"
        log(f"B0 listo: 1 mes en {time.time() - t0:.1f} s, {f.stat().st_size / 1024:.1f} KB → estimado 288 meses: "
            f"{(time.time() - t0) * 288 / max(a.workers, 1) / 60:.1f} min con {a.workers} hilos")
    log(f"Hecho. Fallidos: {len(failed)}. Meses faltantes: {len(manifest['missing_months'])}.")
    if failed:
        log("Errores:\n  " + "\n  ".join(failed[:10]))
        log("Volver a correr el mismo comando reintenta solo lo que falta.")
        sys.exit(1)


if __name__ == "__main__":
    main()
