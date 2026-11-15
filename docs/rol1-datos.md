# Rol 1 · Datos e ingesta (David): estado y relevo

**Estado:** el Rol 1 del plan (sección 5.2) está completo, salvo la segunda variable en los sitios definitivos: depende de los casos que elija Camila, y el script ya está listo (`04_power.py --cells ...`).

**⚠ Hallazgo para Camila y Joshua:** en el contraste con NASA POWER, el signo de la tendencia de lluvia no coincide en 7 de 9 comparaciones, y en La Ceiba POWER da un alza significativa que IMERG no muestra. Ver la sección 4.

## 1. Verificado en el catálogo de NASA (CMR, 14 nov 2026)

| Pendiente (plan, sección 0) | Resultado |
|---|---|
| Colección y versión | `GPM_3IMERGM` V07, concept-id `C2723754851-GES_DISC`, archivos `*.V07B.HDF5` |
| DOI y cita | **10.5067/GPM/IMERG/3B-MONTH/07**. Huffman, G.J., E.F. Stocker, D.T. Bolvin, E.J. Nelkin, J. Tan (2023), *GPM IMERG Final Precipitation L3 1 month 0.1 degree x 0.1 degree V07*, GES DISC. Ya está en `pipeline/config.yaml` |
| ¿2025 completo? | **No.** IMERG Final mensual llega hasta 2025-09. **Periodo: 2001–2024** |
| 2001–2024 | 288 gránulos, sin huecos |
| Nombre de la variable (B0) | `/Grid/precipitation`, en **mm/hr**, dimensiones `(time, lon, lat)`, relleno −9999.9 (comprobado al abrir el primer archivo) |
| Cobertura de IMERG (replicabilidad) | **Global** (de −90° a 90° de latitud, de −180° a 180° de longitud). Probado con otro recorte: sección 5 |
| Parámetros de la API de NASA POWER | Verificados en la propia API (Monthly API v2.10.0): sección 4 |
| ¿Qué es `PRECTOTCORR` y qué tan independiente es de IMERG? | Definición oficial: *"The average MERRA-2 bias corrected total precipitation"*. Es reanálisis, no el algoritmo satelital de IMERG. No se verificó con qué observaciones se corrige el sesgo: tratarlo como contraste **parcialmente** independiente |
| Celdas de tierra (Natural Earth 10m) | **2 025**: Guatemala 917, El Salvador 169, Honduras 939. Rejilla de 60 × 95 |
| Celda piloto Choluteca | **`N1335W08715`** (13.35 N, 87.15 O): la celda de 0.1° que contiene la ciudad (13.30 N, 87.19 O). Los datos de prueba del panel usaban `N1335W08725` |

## 2. Entregado en `data/rol1/` (IMERG real, descargado el 15 nov 2026 a las 00:31)

| Archivo | Para | Contenido |
|---|---|---|
| `piloto_choluteca/` | **Joshua (H1)**, Camila | `cells.csv`, `series.csv`, `monthly.csv` de `N1335W08715`: 24/24 años válidos |
| `cells.csv` | Joshua, Camila | 2 025 celdas: `cell_id,lat,lon,country` |
| `series.csv` | Joshua, Camila | 2 025 celdas × 3 indicadores × 24 años = 145 800 valores, sin vacíos |
| `monthly.csv` | Joshua, Camila | 2 025 celdas × 288 meses = 583 200 valores en mm/mes. La climatología y la canícula las calcula el motor a partir de aquí (README de `pipeline/`) |
| `borders.geojson` | Elena | Bordes simplificados de GTM, SLV y HND |
| `provenance.json` | Joshua, Andrés | Dataset, DOI, búsqueda, método, variables observadas y controles |
| `power/` | Camila, Joshua | Contraste con NASA POWER y segunda variable (sección 4) |

**Controles de calidad de la región:**
- 0 valores negativos.
- 24/24 años válidos en todas las celdas.
- Mayo–octubre: p1 590 mm, mediana 1 367 mm, p99 2 530 mm.
- Canícula en 1 685 celdas; no aplica en 340.

**Piloto Choluteca:**
- Lluvia anual media de 1 665 mm (rango 1 136–2 395).
- Ciclo mensual (mm): 17, 14, 18, 51, 231, 270, **147**, 207, 311, 298, 79, 22. Se ve la canícula de julio.

**Avisos al pasar los datos:**
1. Joshua debe congelar los umbrales (`frozen: true`) **antes** de correr la región, como dice el doc 06.
2. El motor de Joshua acepta las 2 025 celdas sin errores, pero tarda unos 12 minutos. Conviene tenerlo en cuenta para el hito de las 06:00.

## 3. Cómo se garantiza que los números sean correctos

- **Contraste con los archivos originales de NASA:** se bajaron dos archivos globales completos (2004-02 y 2020-09), sin pasar por OPeNDAP ni por el código del pipeline. En 50 comparaciones (25 celdas de los 3 países × 2 meses), la diferencia máxima fue de 0.004 mm, solo por el redondeo del CSV. Esto confirma la orientación, el recorte y la conversión con 29 días en febrero de 2004.
- **Consistencia interna:** los 145 800 valores de `series.csv` son exactamente la suma de sus meses en `monthly.csv`. Los 42 meses con 0 mm son ceros reales del archivo (marzo, abril y diciembre), no huecos rellenados.
- **Formato:** coincide exactamente con `pipeline/README.md` (cabeceras, UTF-8 sin BOM, sin duplicados, IDs coherentes con lat/lon, todo dentro del recuadro).
- **Conversión:** `mm/mes = tasa (mm/h) × 24 × días reales`. Los valores de relleno y los negativos se vuelven NaN, **nunca 0**. Un año solo es válido si existen todos los meses del indicador.
- **Misma regla que el motor:** los indicadores salen de `altaris/indicators.py` de Joshua, y las tendencias de POWER, de `altaris/stats.py`.
- **Reproducible:** `run_rol1.py` regenera archivos idénticos byte a byte.
- **Pruebas:** 13 en `pipeline/tests/test_ingest.py`; con las del motor pasan las 73. Una de ellas lleva el piloto de punta a punta hasta el JSON del contrato.

## 4. NASA POWER: contraste de signo y segunda variable (`04_power.py` → `data/rol1/power/`)

Son tres sitios de contraste, elegidos por ser diversos: Pacífico, Caribe y altiplano. Se usan los mismos indicadores y las mismas funciones de Sen y Mann-Kendall que el motor. `PRECTOTCORR` viene en mm/día y se multiplica por los días reales del mes.

**Lluvia: pendiente de Sen (mm por década), con IC 95 % y p**

| Sitio | Indicador | IMERG | POWER | ¿Mismo signo? | r interanual |
|---|---|---|---|---|---|
| Choluteca (Pacífico) | may–oct | −48 [−257, 171] p 0.79 | +171 [−33, 384] p 0.14 | no | 0.80 |
| | jul–ago | −4 [−109, 79] p 0.86 | +49 [−28, 156] p 0.26 | no | 0.83 |
| | anual | +11 [−169, 240] p 0.98 | **+219 [35, 426] p 0.027** | sí | 0.83 |
| La Ceiba (Caribe) | may–oct | −81 [−205, 107] p 0.50 | **+200 [40, 340] p 0.012** | no | 0.62 |
| | jul–ago | −14 [−53, 38] p 0.71 | **+91 [24, 159] p 0.008** | no | 0.49 |
| | anual | −27 [−273, 197] p 0.79 | **+477 [187, 727] p 0.004** | no | 0.56 |
| Ciudad de Guatemala | may–oct | −86 [−248, 49] p 0.29 | +75 [−138, 238] p 0.50 | no | 0.41 |
| | jul–ago | −43 [−119, 15] p 0.16 | +4 [−71, 73] p 0.90 | no | 0.33 |
| | anual | +37 [−152, 208] p 0.79 | +82 [−120, 331] p 0.29 | sí | 0.35 |

**Lectura (para que la revise Camila):**
- Las dos fuentes coinciden en **qué años son húmedos o secos**, sobre todo en Choluteca (r ≈ 0.8). No coinciden en la **tendencia**.
- En IMERG ninguna de las 9 tendencias es significativa.
- POWER da alzas significativas en La Ceiba y en la lluvia anual de Choluteca. En La Ceiba, los intervalos de las dos fuentes casi no se tocan.
- **Conclusión:** en al menos un sitio, el resultado depende del producto de datos. Esto debe declararse como limitación y no puede ocultarse.
- No se verificó la causa. Posibles explicaciones: diferencias de método (reanálisis frente a satélite), de resolución (MERRA-2 ~0.5° frente a IMERG 0.1°) o de correcciones; habría que comprobarlas en la literatura.

**Segunda variable (los mismos tres sitios), por si Camila los conserva:**
- Temperatura a 2 m: alza significativa del promedio anual en La Ceiba (+0.21 °C por década, p 0.024) y en Ciudad de Guatemala (+0.26 °C por década, p 0.018). Choluteca: sin tendencia.
- Radiación (`ALLSKY_SFC_SW_DWN`): ninguna tendencia significativa.
- Los archivos (`power_series.csv` y `power_trends.csv`) usan el mismo formato largo que `series.csv`.
- **Para los casos definitivos:** `python 04_power.py --cells <id1> <id2> <id3>` con los IDs de Camila.
- El panel de Izel espera `secondary_variables` dentro de `cells/{id}.json`. Joshua o Izel deben integrar estas series en el exportador.

## 5. Replicabilidad (plan 5.2, B4–B5): comprobada

Se copió `config.yaml` cambiando **solo** el recuadro (El Salvador: lat 13.1–14.5, lon −90.2 a −87.6) y se corrió con una carpeta de datos aparte:

```bash
python run_rol1.py --config config_slv.yaml --data-dir /tmp/slv/data                                  # 72 s
python run_pilot.py --config config_slv.yaml --cells /tmp/slv/data/rol1/cells.csv \
    --series /tmp/slv/data/rol1/series.csv --monthly /tmp/slv/data/rol1/monthly.csv --out /tmp/slv/web # 126 s
```

**Resultado:**
- 289 celdas: 169 de El Salvador, más celdas fronterizas de Guatemala y Honduras.
- Las 169 celdas salvadoreñas dan **valores idénticos** a los de la región completa: 20 808 valores comparados, 0 diferencias.

Para otra región del mundo, basta cambiar `bbox`, y si hace falta, la lista de países en `altaris/imerg.py → COUNTRIES`.

## 6. Fuentes para el formulario y el pasaporte (lo que pidió Andrés en `docs/rol6/fuentes.md`)

| Fuente | Colección y versión | DOI o cita | Acceso | Cobertura usada | Licencia | Transformación |
|---|---|---|---|---|---|---|
| **GPM IMERG Final, mensual** (NASA) | `GPM_3IMERGM` V07 (archivos V07B) | 10.5067/GPM/IMERG/3B-MONTH/07 (Huffman et al., 2023) | 15 nov 2026, OPeNDAP de NASA Earthdata | 2001-01 a 2024-12; lat 12.5–18.5, lon −92.5 a −83.0; 0.1° | Datos abiertos de NASA | mm/h → mm/mes con días reales; sumas may–oct, jul–ago y anual; un año solo es válido con todos sus meses |
| **NASA POWER** (contraste y segunda variable) | Monthly and Annual API v2.10.0; `PRECTOTCORR`, `T2M`, `ALLSKY_SFC_SW_DWN` (fuentes MERRA-2 y CERES SYN1deg) | Cita pedida por POWER: *"The data was obtained from NASA Langley Research Center's POWER project funded through the NASA Earth Science Division"*, más la versión y la fecha de acceso (en `power/provenance.json`) | 15 nov 2026 | 3 puntos, 2001–2024 | Datos abiertos de NASA | mm/día → mm/mes; medias estacionales de temperatura y radiación |
| **Natural Earth** 10m admin 0 (auxiliar, no NASA) | ne_10m_admin_0_countries | naturalearthdata.com | 15 nov 2026 | GTM, SLV, HND | Dominio público | Máscara por centro de celda; bordes simplificados (tolerancia 0.005°) |

**Software del Rol 1 (para la lista de recursos externos):** Python, numpy, pandas, xarray, h5netcdf, h5py, earthaccess, shapely, pyshp, requests y pytest. Además, scipy, statsmodels y pymannkendall a través del motor.

**Uso de IA:** el código del Rol 1 (`01`–`04`, `run_rol1.py`, `altaris/imerg.py`, `altaris/deliver.py`, `tests/test_ingest.py`) se escribió con asistencia de **Claude** y lleva un comentario de cabecera que lo indica. La verificación se hizo con datos reales y con los archivos originales de NASA (sección 3).

## 7. Cómo regenerar

```bash
pip install -r pipeline/requirements.txt -r pipeline/requirements-rol1.txt
cd pipeline
python 01_download_imerg.py --check   # opcional: prueba de un mes
python run_rol1.py                    # UN comando: descarga (reanudable) → cubo + piloto → entregables
python 04_power.py                    # contraste con POWER (no necesita cuenta)
```

Hace falta una cuenta de NASA Earthdata con la aplicación "NASA GESDISC DATA ARCHIVE" autorizada, y las credenciales en `~/.netrc` (en Windows, `%USERPROFILE%\_netrc`): `machine urs.earthdata.nasa.gov login … password …`. También sirven las variables `EARTHDATA_USERNAME` y `EARTHDATA_PASSWORD`. Plan B si falla OPeNDAP: `--method download` (archivos completos, ~5 GB).

## 8. Segunda variable en los 3 casos (tarea 5, `04_power.py` → `data/rol1/power_casos/`)

Casos elegidos por Camila ([08-revision-camila.md](08-revision-camila.md), Resolución, 04:13). Se corrió:

```bash
cd pipeline
python 04_power.py --cells N1335W08715 N1475W08765 N1495W09125 --out ../data/rol1/power_casos
```

POWER API v2.10.0, consultada el 15 nov 2026. `data/rol1/power/` (los 3 sitios de contraste de la sección 4) no se tocó. Las 22 filas de `power_trends.csv` coinciden exactamente con la corrida de revisión de Camila (`data/rol3/casos_power/`), así que sus cifras de los casos quedan confirmadas sin cambios.

**Lluvia, IMERG frente a POWER (pendiente de Sen, mm por década, temporada may–oct):**

| Celda | Caso | IMERG | POWER (p) | Mismo signo | r interanual |
|---|---|---|---|---|---|
| `N1335W08715` | 1, Choluteca | −48 | +171 (0,14) | no | 0,80 |
| `N1475W08765` | 2, sensibilidad al periodo | −48 | +124 (0,050) | no | 0,73 |
| `N1495W09125` | 3, Guatemala `consistente` | **−452** | +40 (0,60) | no | **0,18** |

- En `N1495W09125` POWER no ve la caída (p ≥ 0,60 en los tres indicadores) y la correlación año a año es 0,18 en temporada y 0,08 en lluvia anual. Respalda la lectura de "pregunta abierta" del caso 3.
- En Honduras, IMERG sin tendencia y POWER con alza en lluvia anual (significativa en `N1475W08765`, p 0,003), pero las dos fuentes coinciden en los años secos y húmedos (r 0,57–0,85).

**Segunda variable (media anual; entre paréntesis, p):**

| Celda | T2M, °C por década | Radiación, MJ/m²/día por década |
|---|---|---|
| `N1335W08715` | −0,05 (0,82) | −0,15 (0,41) |
| `N1475W08765` | +0,03 (0,84) | +0,02 (0,82) |
| `N1495W09125` | **+0,35 (0,0005)**; may–oct +0,27 (0,004) | −0,18 (0,24) |

Calentamiento significativo solo en la celda de Guatemala. Se puede mostrar junto a la lluvia, sin relación causal: es otra fuente y de resolución mucho más gruesa (~0,5°).

## 9. Pendiente y quién continúa

- **Segunda variable en los sitios definitivos:** hecha (sección 8, `data/rol1/power_casos/`). Coincide con la de Camila. Ya se muestra en el panel: `pipeline/add_secondary.py` escribe temperatura y radiación de mayo a octubre en `cells/{id}.json` de los 3 casos, sin veredicto.
- **Chequeo de 2014:** según el doc 06, lo hace Camila con Pettitt.
- **Joshua:** piloto H1 con `piloto_choluteca/`; después congelar umbrales y correr la región.
- **Camila:** usar la misma versión de `series.csv` y `monthly.csv`, y revisar el hallazgo de la sección 4.
- **Elena:** `borders.geojson`.
- **Andrés:** fuentes y uso de IA de la sección 6.
