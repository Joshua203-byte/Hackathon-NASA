# ALTARIS — Earth Trend Intelligence (NASA Space Apps Challenge 2026)

Project for the challenge **"Be An Earth System Trend Detective!"** of the NASA Space Apps Challenge 2026.

ALTARIS lets you explore how the evidence for a rainfall trend changes when you choose a different window of years. It analyses 24 years (2001–2024) of NASA GPM IMERG precipitation over 4,332 grid cells in 7 Central American countries (Belize, Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua and Panama), controlling for ENSO and for the 2014 satellite change. It describes the past; it makes no forecasts.

**Live web app:** <https://altaris.altaris-panel-rol5.workers.dev/?lang=en>

**Run locally:** from `rol5-panel-app/`, run `npm ci` and `npm run dev`. The JSON in `rol5-panel-app/public/data/` is the real, observed dataset produced by the statistical engine (`data_kind: observed`, see `meta.json`). Checks: `npm test`, `npm run typecheck`, `npm run build`; for the engine, `python -m pytest tests -q` from `pipeline/`.

> **Language note.** The application, the submission texts and the technical READMEs are in English. The folder `docs/` also holds the team's internal working notes (status, schedule, hand-offs between roles), which are written in Spanish and are not part of the product. English files for evaluators are listed below.

## Where to start (English)

- [Statistical engine: usage and formats](pipeline/README.md)
- [Web application: setup and tests](rol5-panel-app/README.md)
- [Independent cross-check with NASA Giovanni (one case)](docs/validacion_giovanni/README.md)
- [Demo video: how it was produced](docs/video/README.md)
- [Submission form text](docs/rol6/submission-en.md) and [Central America version](docs/rol6/submission-en-ca.md)
- [References and sources](docs/rol6/references-en.md)
- [Tables of results for the 7 countries](docs/ca/TABLAS.md)

## Internal team notes (Spanish)

- [Status and who does what](docs/06-estado-y-reparto.md)
- [Challenge and context](docs/01-reto-y-contexto.md) · [NASA references](docs/02-referentes-nasa.md) · [Resources and official links](docs/03-recursos-y-links.md)
- [Regional figures and independent review](docs/07-cifras-y-candidatos.md)
- [Data, provenance and comparison with NASA POWER](docs/rol1-datos.md)
- [Panel contract, data and limitations](rol5-panel-app/INTEGRACION.md)
- [Credits, external sources and AI log](docs/rol6/fuentes.md)
- [Technical specification and master context](contexto_maestro_y_especificaci_n_t_cnica_altaris.md)

## Official challenge links

- **Judging criteria:** [Judging & Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/#judging-criteria)
- **Awards:** [NASA Space Apps Awards](https://www.spaceappschallenge.org/awards/)
- **Official challenge (resources):** [Earth System Trend Detective Resources](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources)

### Official resources listed by the challenge

| Resource | Type | Link | Use / description |
| :--- | :--- | :--- | :--- |
| **NASA Giovanni** | NASA data | [giovanni.gsfc.nasa.gov](https://giovanni.gsfc.nasa.gov/) | Interactive online visualisation and analysis of geophysical time series. Used here only as an independent cross-check of one case. |
| **GES DISC – Hydrology Time Series** | NASA data | [disc.gsfc.nasa.gov](https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series) | Extraction of hydrological time series (precipitation, soil moisture). |
| **NASA AppEEARS** | NASA tool | [appeears.earthdatacloud.nasa.gov](https://appeears.earthdatacloud.nasa.gov/) | Spatial and temporal subsetting of satellite data. |
| **NOAA NCEI Climate Data Online** | Climate data | [ncei.noaa.gov/cdo-web](https://www.ncei.noaa.gov/cdo-web/) | Ground-station data and historical climate records. |
| **KNMI Climate Explorer** | Climate analysis | [climexp.knmi.nl](https://climexp.knmi.nl/) | Statistical analysis of climate correlations and ENSO variability. |
| **Statistical Test Methods for Trends** | Methodology | [medium.com/…](https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b) | Statistical tests for trend detection (Mann–Kendall, Sen's slope). |
| **Statistical Significance Guide** | Methodology | [statsig.com/…](https://www.statsig.com/perspectives/a-comprehensive-guide-to-statistical-significance) | Guide to statistical significance and confidence intervals. |
| **RCM Dataset (CSA)** | Open data | [donnees-data.asc-csa.gc.ca/…](https://donnees-data.asc-csa.gc.ca/en/dataset/rcm) | SAR data from the RADARSAT Constellation of the Canadian Space Agency. |
| **Geo.ca** | Geospatial portal | [geo.ca](http://geo.ca/) | Canada's open geospatial data platform. |
| **SWOT satellite mission** | Satellite mission | [asc-csa.gc.ca/…/swot](https://www.asc-csa.gc.ca/eng/satellites/swot/) | Surface water and ocean monitoring (SWOT). |
| **Ecosystem Monitoring from Space** | CSA outreach | [asc-csa.gc.ca/…](https://www.asc-csa.gc.ca/eng/satellites/everyday-lives/monitoring-and-protecting-our-ecosystems-from-space.asp) | Monitoring and protecting ecosystems from space. |
| **SAR Tutorial (CSA)** | Code / tutorial | [github.com/asc-csa/…](https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial) | Python tutorials and notebooks for SAR data processing. |
