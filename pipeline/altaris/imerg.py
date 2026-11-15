"""Rol 1 · Datos e ingesta (David): IMERG mensual V07 → recorte → cubo mm/mes → entregables CSV.

Hechos verificados en el catálogo CMR de NASA (14 nov 2026):
  * Colección GPM_3IMERGM versión 07, concept-id C2723754851-GES_DISC, archivos *.V07B.HDF5.
  * DOI 10.5067/GPM/IMERG/3B-MONTH/07 (Huffman, Stocker, Bolvin, Nelkin, Tan; GES DISC, 2023).
  * 288 gránulos de 2001-01 a 2024-12. 2025 solo llega hasta septiembre → periodo base 2001–2024.
  * ~17 MB por archivo global; el recorte del Triángulo Norte (60 × 95 celdas) pesa unos KB.

Lo que NO está verificado sin iniciar sesión (y se comprueba en la primera corrida, ver
`describe_variables`): nombre exacto de la variable, orden de dimensiones, unidades y valor de relleno.
Se espera `Grid/precipitation` en mm/hr con dimensiones (time, lon, lat).

Código escrito con asistencia de IA (Claude); revisado y probado por el equipo (ver docs/rol1-datos.md).
"""
from __future__ import annotations

import calendar
import datetime as dt
import json
import math
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path

import sys

import numpy as np

# La consola de Windows usa cp1252: los mensajes llevan tildes y flechas.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

SHORT_NAME = "GPM_3IMERGM"
VERSION = "07"
CONCEPT_ID = "C2723754851-GES_DISC"
DOI = "10.5067/GPM/IMERG/3B-MONTH/07"
CITATION = ("Huffman, G.J., E.F. Stocker, D.T. Bolvin, E.J. Nelkin, J. Tan (2023), GPM IMERG Final "
            "Precipitation L3 1 month 0.1 degree x 0.1 degree V07, Greenbelt, MD, Goddard Earth Sciences "
            "Data and Information Services Center (GES DISC), https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07")
OPENDAP_BASE = f"https://opendap.earthdata.nasa.gov/collections/{CONCEPT_ID}/granules/"
VAR = "precipitation"
COUNTRIES = {"GTM": "Guatemala", "SLV": "El Salvador", "HND": "Honduras"}
NATURAL_EARTH_URL = "https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries.zip"

# Choluteca (Honduras), sitio piloto del plan (zona del Corredor Seco).
# Centro urbano ≈ 13.30 N, 87.19 O → celda de 0.1° que lo contiene.
PILOT = {"name": "Choluteca", "lat": 13.30, "lon": -87.19}


# ---------------------------------------------------------------------------
# Rejilla e identificadores
# ---------------------------------------------------------------------------

def cell_id(lat: float, lon: float) -> str:
    """Centro de la celda con 2 decimales sin punto: N1345W08815 = 13.45 N, 88.15 O (plan 3.2)."""
    ns = "N" if lat >= 0 else "S"
    ew = "E" if lon >= 0 else "W"
    return f"{ns}{round(abs(lat) * 100):04d}{ew}{round(abs(lon) * 100):05d}"


def cell_center(x: float) -> float:
    """Centro de la celda IMERG (rejilla 0.1° con centros en .x5) que contiene la coordenada x."""
    return round(math.floor(x * 10) / 10 + 0.05, 2)


def pilot_cell() -> tuple[str, float, float]:
    lat, lon = cell_center(PILOT["lat"]), cell_center(PILOT["lon"])
    return cell_id(lat, lon), lat, lon


def index_range(coords: np.ndarray, lo: float, hi: float) -> tuple[int, int]:
    """Índices [i0, i1] (inclusivos) de los centros de celda dentro de [lo, hi]. Usa las coordenadas reales."""
    coords = np.asarray(coords, dtype=float)
    idx = np.where((coords > lo) & (coords < hi))[0]
    if idx.size == 0:
        raise ValueError(f"Ningún centro de celda entre {lo} y {hi}")
    return int(idx.min()), int(idx.max())


# ---------------------------------------------------------------------------
# Conversión (misma regla que altaris/indicators.py del Rol 2)
# ---------------------------------------------------------------------------

def days_in_month(year: int, month: int) -> int:
    return calendar.monthrange(year, month)[1]


def rate_to_mm(rate_mm_per_hour: np.ndarray, year: int, month: int) -> np.ndarray:
    """mm/h medio del mes → mm del mes, con los días reales (febrero bisiesto incluido)."""
    return np.asarray(rate_mm_per_hour, dtype=float) * 24.0 * days_in_month(year, month)


def clean_rate(arr: np.ndarray, fill_values=()) -> np.ndarray:
    """Valores de relleno y negativos → NaN. Nunca se convierten en 0."""
    a = np.asarray(arr, dtype=float).copy()
    for fv in fill_values:
        if fv is not None and np.isfinite(fv):
            a[np.isclose(a, fv)] = np.nan
    a[a < 0] = np.nan
    return a


# ---------------------------------------------------------------------------
# Gránulos y OPeNDAP
# ---------------------------------------------------------------------------

GRANULE_RE = re.compile(r"3IMERG\.(\d{4})(\d{2})01-")


def granule_year_month(name: str) -> tuple[int, int]:
    m = GRANULE_RE.search(name)
    if not m:
        raise ValueError(f"No se reconoce el mes en el nombre del gránulo: {name}")
    return int(m.group(1)), int(m.group(2))


def opendap_url(granule_ur: str) -> str:
    """granule_ur tipo 'GPM_3IMERGM.07:3B-MO....V07B.HDF5' → URL OPeNDAP en la nube."""
    return OPENDAP_BASE + granule_ur.replace(":", "%3A")


@dataclass(frozen=True)
class VarLayout:
    path: str            # p. ej. "/Grid/precipitation"
    dims: tuple[str, ...]  # p. ej. ("time", "lon", "lat")
    lat_path: str
    lon_path: str


def parse_dmr(dmr_xml: str, var: str = VAR) -> VarLayout:
    """Lee el DMR (DAP4) y devuelve la ruta y el orden de dimensiones de `var` y de lat/lon."""
    root = ET.fromstring(dmr_xml)

    def strip(tag):
        return tag.split("}", 1)[-1]

    found = {}

    def walk(node, prefix):
        for child in node:
            t = strip(child.tag)
            name = child.get("name")
            if t == "Group":
                walk(child, f"{prefix}/{name}")
            elif name and t in ("Float32", "Float64", "Int16", "Int32", "Int64"):
                dims = tuple(d.get("name", "").split("/")[-1] for d in child if strip(d.tag) == "Dim")
                found[name] = (f"{prefix}/{name}", dims)

    walk(root, "")
    if var not in found or "lat" not in found or "lon" not in found:
        raise ValueError(f"El DMR no trae {var}, lat y lon. Variables vistas: {sorted(found)}")
    return VarLayout(found[var][0], found[var][1], found["lat"][0], found["lon"][0])


def subset_constraint(layout: VarLayout, lat_rng: tuple[int, int], lon_rng: tuple[int, int]) -> str:
    """Restricción DAP4 que pide solo el recorte, respetando el orden real de dimensiones."""
    sl = []
    for d in layout.dims:
        if d == "lat":
            sl.append(f"[{lat_rng[0]}:1:{lat_rng[1]}]")
        elif d == "lon":
            sl.append(f"[{lon_rng[0]}:1:{lon_rng[1]}]")
        else:  # time u otra dimensión de largo 1
            sl.append("[0:1:0]")
    return (f"{layout.path}{''.join(sl)};"
            f"{layout.lat_path}[{lat_rng[0]}:1:{lat_rng[1]}];"
            f"{layout.lon_path}[{lon_rng[0]}:1:{lon_rng[1]}]")


def to_lat_lon(da) -> "np.ndarray":
    """DataArray con dims que incluyen lat y lon (y quizá time de largo 1) → arreglo (lat, lon) con lat ascendente."""
    extra = [d for d in da.dims if d not in ("lat", "lon")]
    for d in extra:
        if da.sizes[d] != 1:
            raise ValueError(f"Dimensión inesperada {d} de largo {da.sizes[d]}")
        da = da.isel({d: 0})
    da = da.transpose("lat", "lon").sortby("lat").sortby("lon")
    return da


def describe_variables(ds) -> dict:
    """Lo que el plan pide anotar al abrir el primer archivo (sección 5.2, B0)."""
    out = {}
    for name, v in ds.data_vars.items():
        out[name] = {"dims": list(v.dims), "shape": list(v.shape),
                     "units": str(v.attrs.get("units", v.attrs.get("Units", ""))),
                     "fill_value": _jsonable(v.encoding.get("_FillValue", v.attrs.get("_FillValue"))),
                     "dtype": str(v.dtype)}
    return out


def _jsonable(x):
    if x is None:
        return None
    try:
        x = float(np.asarray(x).ravel()[0])
        return x if math.isfinite(x) else str(x)
    except Exception:
        return str(x)


# ---------------------------------------------------------------------------
# Máscara de países (Natural Earth admin 0)
# ---------------------------------------------------------------------------

def load_country_shapes(shp_path: Path, iso3: list[str]):
    """{ISO3: geometría shapely} desde el shapefile de Natural Earth 10m admin 0."""
    import shapefile  # pyshp
    from shapely.geometry import shape

    r = shapefile.Reader(str(shp_path), encoding="utf-8")
    fields = [f[0] for f in r.fields[1:]]
    key = next(k for k in ("ADM0_A3", "ISO_A3", "SOV_A3") if k in fields)
    out = {}
    for rec, shp in zip(r.records(), r.shapes()):
        code = rec[fields.index(key)]
        if code in iso3:
            out[code] = shape(shp.__geo_interface__)
    missing = set(iso3) - set(out)
    if missing:
        raise ValueError(f"Natural Earth no trae {missing}")
    return out


def assign_countries(lats: np.ndarray, lons: np.ndarray, shapes: dict) -> dict[tuple[float, float], str]:
    """Celda incluida si su CENTRO cae dentro del país (regla del plan, sección 5.2)."""
    from shapely import contains_xy

    out = {}
    lon2d, lat2d = np.meshgrid(lons, lats)
    for code, geom in shapes.items():
        inside = contains_xy(geom, lon2d, lat2d)
        for i, j in zip(*np.where(inside)):
            out[(round(float(lats[i]), 2), round(float(lons[j]), 2))] = code
    return out


def borders_geojson(shapes: dict, tolerance: float = 0.005) -> dict:
    from shapely.geometry import mapping

    feats = []
    for code, geom in sorted(shapes.items()):
        feats.append({"type": "Feature", "properties": {"iso3": code, "name": COUNTRIES[code]},
                      "geometry": mapping(geom.simplify(tolerance, preserve_topology=True))})
    return {"type": "FeatureCollection", "features": feats}


# ---------------------------------------------------------------------------
# Procedencia
# ---------------------------------------------------------------------------

def now_iso() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def write_json(obj, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
