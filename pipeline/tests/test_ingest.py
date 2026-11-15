"""Pruebas del Rol 1 (ingesta IMERG). No necesitan cuenta Earthdata: usan archivos con la estructura de IMERG.

Código escrito con asistencia de IA (Claude); revisado y probado por el equipo (ver docs/rol1-datos.md).
"""
import csv
import importlib.util
import math
import sys
from pathlib import Path

import numpy as np
import pytest

xr = pytest.importorskip("xarray")
pytest.importorskip("h5netcdf")

from altaris import deliver, imerg, io as aio  # noqa: E402
from altaris.config import load_config  # noqa: E402

PIPE = Path(__file__).resolve().parent.parent
CFG = load_config()


def load_script(name):
    spec = importlib.util.spec_from_file_location(name.replace(".py", "").lstrip("0123456789_"), PIPE / name)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# ------------------------------------------------------------------ rejilla e identificadores
def test_cell_id_y_centro():
    assert imerg.cell_id(13.45, -88.15) == "N1345W08815"           # ejemplo del plan
    assert imerg.cell_center(13.30) == 13.35 and imerg.cell_center(-87.19) == -87.15
    assert imerg.pilot_cell() == ("N1335W08715", 13.35, -87.15)    # Choluteca


def test_index_range_usa_coordenadas_reales():
    lat = np.round(-89.95 + 0.1 * np.arange(1800), 2)
    lon = np.round(-179.95 + 0.1 * np.arange(3600), 2)
    i0, i1 = imerg.index_range(lat, 12.5, 18.5)
    j0, j1 = imerg.index_range(lon, -92.5, -83.0)
    assert (lat[i0], lat[i1], i1 - i0 + 1) == (12.55, 18.45, 60)
    assert (lon[j0], lon[j1], j1 - j0 + 1) == (-92.45, -83.05, 95)


# ------------------------------------------------------------------ conversión
def test_conversion_con_dias_reales_y_bisiesto():
    assert imerg.rate_to_mm(np.array([1.0]), 2004, 2)[0] == 24 * 29    # febrero bisiesto
    assert imerg.rate_to_mm(np.array([1.0]), 2005, 2)[0] == 24 * 28
    assert imerg.rate_to_mm(np.array([0.5]), 2010, 7)[0] == 0.5 * 24 * 31


def test_relleno_y_negativos_son_nan_nunca_cero():
    a = imerg.clean_rate(np.array([0.2, -9999.9, -0.1, 0.0]), [-9999.9])
    assert a[0] == pytest.approx(0.2) and math.isnan(a[1]) and math.isnan(a[2]) and a[3] == 0.0


# ------------------------------------------------------------------ OPeNDAP
DMR = """<?xml version="1.0" encoding="ISO-8859-1"?>
<Dataset xmlns="http://xml.opendap.org/ns/DAP/4.0#" name="x">
  <Group name="Grid">
    <Dimension name="time" size="1"/><Dimension name="lon" size="3600"/><Dimension name="lat" size="1800"/>
    <Float32 name="lat"><Dim name="/Grid/lat"/></Float32>
    <Float32 name="lon"><Dim name="/Grid/lon"/></Float32>
    <Float32 name="precipitation"><Dim name="/Grid/time"/><Dim name="/Grid/lon"/><Dim name="/Grid/lat"/></Float32>
  </Group>
</Dataset>"""


def test_parse_dmr_y_restriccion_respeta_orden_de_dimensiones():
    lay = imerg.parse_dmr(DMR)
    assert lay.path == "/Grid/precipitation" and lay.dims == ("time", "lon", "lat")
    ce = imerg.subset_constraint(lay, (1025, 1084), (875, 969))
    assert ce.startswith("/Grid/precipitation[0:1:0][875:1:969][1025:1:1084];")
    assert "/Grid/lat[1025:1:1084]" in ce and "/Grid/lon[875:1:969]" in ce


def test_url_opendap_y_mes_del_granulo():
    ur = "GPM_3IMERGM.07:3B-MO.MS.MRG.3IMERG.20240701-S000000-E235959.07.V07B.HDF5"
    assert imerg.granule_year_month(ur) == (2024, 7)
    assert imerg.opendap_url(ur).endswith("GPM_3IMERGM.07%3A3B-MO.MS.MRG.3IMERG.20240701-S000000-E235959.07.V07B.HDF5")


# ------------------------------------------------------------------ archivos con estructura IMERG
LAT = np.round(np.arange(13.05, 13.65, 0.1), 2)      # 6 celdas
LON = np.round(np.arange(-87.45, -86.95, 0.1), 2)    # 5 celdas


def fake_imerg_file(path: Path, rate: np.ndarray):
    """Como un HDF5 de IMERG: grupo Grid, precipitation (time, lon, lat) en mm/hr con _FillValue."""
    ds = xr.Dataset({"precipitation": (("time", "lon", "lat"), rate.T[None].astype("float32"), {"units": "mm/hr"})},
                    coords={"time": [0], "lon": LON, "lat": LAT[::-1][::-1]})
    ds.to_netcdf(path, group="Grid", engine="h5netcdf", encoding={"precipitation": {"_FillValue": -9999.9}})


def test_extract_lee_estructura_imerg_y_quita_relleno(tmp_path):
    dl = load_script("01_download_imerg.py")
    rate = np.full((len(LAT), len(LON)), 0.3)
    rate[0, 0] = -9999.9
    f = tmp_path / "g.HDF5"
    fake_imerg_file(f, rate)
    da, fills, units, desc = dl._extract(f)
    assert da.dims == ("lat", "lon") and units == "mm/hr"
    assert desc["precipitation"]["dims"] == ["time", "lon", "lat"]
    clean = imerg.clean_rate(da.values, [x for x in fills if x is not None])
    assert math.isnan(clean[0, 0]) and clean[1, 1] == pytest.approx(0.3)


@pytest.fixture
def raw_dir(tmp_path, monkeypatch):
    """Meses recortados como los deja 01_download_imerg.py (2001–2024, con un mes faltante y una celda sin dato)."""
    dl = load_script("01_download_imerg.py")
    raw = tmp_path / "raw"
    raw.mkdir()
    monkeypatch.setattr(dl, "OUT", raw)
    rng = np.random.default_rng(0)
    y0, y1 = CFG["period"]
    for y in range(y0, y1 + 1):
        for m in range(1, 13):
            if (y, m) == (2010, 7):
                continue                                   # mes faltante: no se rellena
            rate = rng.uniform(0.05, 0.6, (len(LAT), len(LON)))
            rate[0, 0] = np.nan if (y, m) == (2005, 3) else rate[0, 0]
            da = xr.DataArray(rate, dims=("lat", "lon"), coords={"lat": LAT, "lon": LON})
            dl.save_month(da, [], "mm/hr", y, m, "test", "test")
    return raw


def test_cubo_mm_por_mes_con_faltantes(raw_dir):
    bc = load_script("02_build_cube.py")
    months, lat, lon, cube, present = bc.build_cube(raw_dir, tuple(CFG["period"]))
    assert cube.shape == (288, len(LAT), len(LON)) and present == 287
    assert np.all(np.diff(lat) > 0)                                    # latitud ascendente
    t = months.index((2010, 7))
    assert np.isnan(cube[t]).all()                                     # mes faltante = NaN, no 0
    t = months.index((2004, 2))
    with xr.open_dataset(raw_dir / "200402.nc", engine="h5netcdf") as ds:
        assert cube[t, 2, 2] == pytest.approx(float(ds["precipitation_rate"][2, 2]) * 24 * 29, rel=1e-5)


def test_entregables_en_formato_del_motor_y_validez(raw_dir, tmp_path):
    bc = load_script("02_build_cube.py")
    months, lat, lon, cube, _ = bc.build_cube(raw_dir, tuple(CFG["period"]))
    cells = [{"cell_id": imerg.cell_id(lat[i], lon[j]), "lat": lat[i], "lon": lon[j], "country": "HND"}
             for i in range(len(lat)) for j in range(len(lon))]
    monthly = {c["cell_id"]: cube[:, i, j] for c, (i, j) in
               zip(cells, [(i, j) for i in range(len(lat)) for j in range(len(lon))])}
    out = tmp_path / "rol1"
    deliver.write_deliverables(out, cells, monthly, months, CFG)

    # Los lee el lector del motor de Joshua sin cambios
    rc = aio.read_cells(out / "cells.csv")
    rs = aio.read_series_long(out / "series.csv")
    rm = aio.read_monthly(out / "monthly.csv")
    assert len(rc) == 30 and set(rs) == {c["cell_id"] for c in cells}
    years, vals = rs[cells[5]["cell_id"]]["jul_aug_mm"]
    assert years == list(range(2001, 2025))
    assert vals[years.index(2010)] is None                             # falta julio 2010 → año no válido
    assert rs[cells[5]["cell_id"]]["may_oct_mm"][1][years.index(2010)] is None
    assert rs[cells[5]["cell_id"]]["annual_mm"][1][years.index(2009)] is not None
    corner = rs[cells[0]["cell_id"]]["annual_mm"][1]
    assert corner[years.index(2005)] is None                           # celda sin dato en marzo 2005
    assert len(rm[cells[0]["cell_id"]]) == 288
    # el valor de jul–ago es la suma de julio y agosto
    mm = {(y, m): v for y, m, v in rm[cells[5]["cell_id"]]}
    assert vals[years.index(2003)] == pytest.approx(mm[(2003, 7)] + mm[(2003, 8)], abs=0.02)
    qc = deliver.quality_report(monthly, months, CFG)
    assert qc["negative_values"] == 0 and qc["feb_2004_days"] == 29
    assert qc["annual_valid_years"]["max"] == 23                       # 2010 cae en todas las celdas


def test_motor_de_joshua_acepta_el_piloto(raw_dir, tmp_path):
    """De punta a punta: piloto de Rol 1 → export del Rol 2 → JSON del contrato."""
    from altaris import export

    bc = load_script("02_build_cube.py")
    months, lat, lon, cube, _ = bc.build_cube(raw_dir, tuple(CFG["period"]))
    cid, plat, plon = imerg.pilot_cell()
    i, j = int(np.argmin(abs(lat - plat))), int(np.argmin(abs(lon - plon)))
    out = tmp_path / "piloto"
    deliver.write_deliverables(out, [{"cell_id": cid, "lat": plat, "lon": plon, "country": "HND"}],
                               {cid: cube[:, i, j]}, months, CFG)
    web = tmp_path / "web"
    export.run(aio.read_cells(out / "cells.csv"), aio.read_series_long(out / "series.csv"), CFG, str(web),
               monthly=aio.read_monthly(out / "monthly.csv"), data_kind="mock", commit="TEST")
    assert (web / "cells" / f"{cid}.json").exists() and (web / "grid.json").exists()


# ------------------------------------------------------------------ máscara de países
def test_mascara_por_centro_de_celda():
    from shapely.geometry import box

    shapes = {"HND": box(-87.3, 13.2, -87.0, 13.5), "SLV": box(-87.5, 13.0, -87.3, 13.2)}
    owner = imerg.assign_countries(LAT, LON, shapes)
    assert owner[(13.35, -87.15)] == "HND" and owner[(13.05, -87.45)] == "SLV"
    assert (13.55, -87.15) not in owner                                # centro fuera de todo país
    gj = imerg.borders_geojson({"HND": shapes["HND"]})
    assert gj["features"][0]["properties"]["iso3"] == "HND"


# ------------------------------------------------------------------ NASA POWER (04_power.py), sin red
def test_power_convierte_mm_dia_a_mm_mes_e_ignora_relleno_y_anual():
    pw = load_script("04_power.py")
    resp = {"properties": {"parameter": {"PRECTOTCORR": {"200402": 2.0, "200403": -999.0, "200413": 99.0},
                                         "T2M": {"200402": 25.0, "200403": 26.0}}}}
    p = pw.monthly_values(resp, "PRECTOTCORR", 2004, 2004)
    assert p[(2004, 2)] == pytest.approx(2.0 * 29)          # mm/día × 29 días (bisiesto)
    assert p[(2004, 3)] is None                              # relleno -999 → sin dato, nunca 0
    assert p[(2004, 1)] is None and len(p) == 12             # el anual (AAAA13) no se cuela como mes
    t = pw.monthly_values(resp, "T2M", 2004, 2004)
    assert t[(2004, 2)] == 25.0                              # temperatura: sin conversión


def test_power_media_estacional_no_rellena():
    pw = load_script("04_power.py")
    vals = {(2001, m): float(m) for m in range(1, 13)} | {(2002, m): float(m) for m in range(1, 13)}
    vals[(2002, 7)] = None
    assert pw.seasonal_mean(vals, [2001, 2002], range(5, 11)) == [pytest.approx(7.5), None]


def test_paises_activos_por_config():
    # sin `countries` se conserva el Triangulo Norte: las corridas anteriores no cambian
    assert imerg.active_countries({}) == ["GTM", "SLV", "HND"]
    ca = ["GTM", "SLV", "HND", "BLZ", "NIC", "CRI", "PAN"]
    assert imerg.active_countries({"countries": ca}) == ca
    assert imerg.COUNTRY_NAMES["PAN"] == "Panamá" and set(imerg.COUNTRIES) <= set(imerg.COUNTRY_NAMES)
    import pytest
    with pytest.raises(ValueError):
        imerg.active_countries({"countries": ["HND", "XXX"]})
    with pytest.raises(ValueError):
        imerg.active_countries({"countries": ["HND", "HND"]})
