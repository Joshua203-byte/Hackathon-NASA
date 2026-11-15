# ALTARIS — Earth Trend Intelligence (NASA Space Apps Challenge 2026)

Proyecto para el reto **"Be An Earth System Trend Detective!"** del NASA Space Apps Challenge 2026.

ALTARIS permite explorar cómo cambia la evidencia de una tendencia de lluvia al elegir otra ventana de años. La versión incluida demuestra el recorrido con datos simulados. La integración prevista utiliza precipitación IMERG y análisis ENSO para Honduras, Guatemala y El Salvador.

**Ejecutar el prototipo:** desde `rol5-panel-app/`, ejecutar `npm ci` y `npm run dev`. Seleccionar una celda, cambiar la ventana en la huella y exportar su pasaporte. Para reproducir las verificaciones ejecutar `npm test`, `npm run typecheck` y `npm run build`.

- [Materiales de entrega, demo y estudio de comprensión — Andrés](docs/rol6/README.md)
- [Contrato del panel, datos y limitaciones](rol5-panel-app/INTEGRACION.md)
- [Créditos, fuentes externas y registro de IA](docs/rol6/fuentes.md)

---

## 📌 Documentación y Enlaces Clave

- [01 - Reto y Contexto](docs/01-reto-y-contexto.md)
- [02 - Referentes NASA](docs/02-referentes-nasa.md)
- [03 - Recursos, Criterios y Enlaces Oficiales](docs/03-recursos-y-links.md)
- [Especificación Técnica y Contexto Maestro](contexto_maestro_y_especificaci_n_t_cnica_altaris.md)

### Enlaces Rápidos del Reto
- **Criterios de Evaluación:** [Judging & Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/#judging-criteria)
- **Premios:** [NASA Space Apps Awards](https://www.spaceappschallenge.org/awards/)
- **Reto Oficial (Recursos):** [Earth System Trend Detective Resources](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources)

### Tabla de Recursos y Fuentes Oficiales

| Recurso | Tipo | Enlace | Utilidad / Descripción |
| :--- | :--- | :--- | :--- |
| **NASA Giovanni** | Datos NASA | [giovanni.gsfc.nasa.gov](https://giovanni.gsfc.nasa.gov/) | Visualización y análisis interactivo de series temporales geofísicas en la nube. |
| **GES DISC - Hydrology Time Series** | Datos NASA | [disc.gsfc.nasa.gov](https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series) | Extracción de series temporales hidrológicas (precipitación, humedad de suelo). |
| **NASA AppEEARS** | Herramienta NASA | [appeears.earthdatacloud.nasa.gov](https://appeears.earthdatacloud.nasa.gov/) | Extracción y subconjuntos de datos satelitales espaciales/temporales. |
| **NOAA NCEI Climate Data Online** | Datos Climáticos | [ncei.noaa.gov/cdo-web](https://www.ncei.noaa.gov/cdo-web/) | Datos de estaciones terrestres y registros climáticos históricos. |
| **KNMI Climate Explorer** | Análisis Climático | [climexp.knmi.nl](https://climexp.knmi.nl/) | Análisis estadístico de correlaciones climáticas y variabilidad ENSO. |
| **Statistical Test Methods for Trends** | Metodología | [medium.com/...](https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b) | Pruebas estadísticas para detección de tendencias (Mann-Kendall, Sen's slope). |
| **Statistical Significance Guide** | Metodología | [statsig.com/...](https://www.statsig.com/perspectives/a-comprehensive-guide-to-statistical-significance) | Guía de cálculo de significancia estadística e intervalos de confianza. |
| **RCM Dataset (CSA)** | Datos Abiertos | [donnees-data.asc-csa.gc.ca/...](https://donnees-data.asc-csa.gc.ca/en/dataset/rcm) | Datos SAR de la Constelación RADARSAT de la Agencia Espacial Canadiense. |
| **Geo.ca** | Portal Geoespacial | [geo.ca](http://geo.ca/) | Plataforma geoespacial de datos abiertos de Canadá. |
| **Misión Satelital SWOT** | Misión Satelital | [asc-csa.gc.ca/.../swot](https://www.asc-csa.gc.ca/eng/satellites/swot/) | Datos y monitoreo de aguas superficiales y océanos (SWOT). |
| **Ecosystem Monitoring from Space** | Divulgación CSA | [asc-csa.gc.ca/...](https://www.asc-csa.gc.ca/eng/satellites/everyday-lives/monitoring-and-protecting-our-ecosystems-from-space.asp) | Monitoreo y protección de ecosistemas desde el espacio. |
| **SAR Tutorial (CSA)** | Código / Tutorial | [github.com/asc-csa/...](https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial) | Tutoriales y notebooks en Python para procesamiento de datos SAR. |
