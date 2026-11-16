# ALTARIS — references and assisted work

English companion to the resource record, prepared with OpenAI Codex assistance on 15 November 2026. Reconcile with the frozen build before submission. The seven-country observed export is now available and checked (engine `7e93e46`, 4,332 land cells); publication and scientific release approval are separate pending gates. See [numerical verification](cotejo-formulario-ca.md).

## Data

- **NASA GPM IMERG Final Run monthly V07**, 0.1°, 2001–2024, [DOI 10.5067/GPM/IMERG/3B-MONTH/07](https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07). Rainfall input, acquired through Earthdata from GES DISC; yearly and fixed-month totals feed the statistical engine. Exact acquisition metadata is recorded in the run's provenance.
- **NASA POWER**, [data service](https://power.larc.nasa.gov/). Rainfall comparison, 2 m air temperature and solar radiation at the original case sites. A coarser product with limitations; not a fully independent validation of IMERG. See the archived `data/rol1/power/` and `data/rol1/power_casos/` provenance.
- **NOAA CPC ONI**, [index](https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt), used for ENSO phases and sensitivity checks. An auxiliary source, not NASA rainfall data.
- **Natural Earth**, [public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/), country boundaries used for masking and mapping. Verify the exact boundary file in the final provenance.

## Software and method

The web app uses React/React DOM, TypeScript, Vite, Recharts, MapLibre GL JS and bundled Inter and Space Grotesk fonts. Vitest and Playwright support verification; Wrangler supports Cloudflare deployment. Exact versions and transitive packages are in `rol5-panel-app/package-lock.json`. The analysis uses Python, NumPy, SciPy and pymannkendall; ingestion dependencies are recorded in `pipeline/requirements*.txt`. Keep upstream license notices for the distributed libraries and fonts. This inventory does not establish the license of the team's own repository.

Methods include Theil–Sen slope, Mann–Kendall, Hamed–Rao correction, Benjamini–Hochberg FDR and Pettitt change-point testing. They are established methods, not claimed inventions. The [challenge resource page](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources) lists statistical reading and GES DISC's Hydrology Time Series tool. IMERG is not explicitly named there; ALTARIS uses the archive's observations, not that tool. Eligibility interpretation remains to be confirmed with organizers if required.

## SI / AI assistance and media

Claude and OpenAI Codex assisted code, tests, integration and documentation. Claude assistance in ingestion is recorded in source headers. Codex assisted the panel, passports, template narrator, bilingual content, testing protocol, simulated prototype video and the conditional seven-country form, README and scripts. Cell narratives execute offline as deterministic templates. Statistical calculations and verdict rules do not use a generative model. The team's existing attribution records the idea, scientific decisions and case selection as its own.

The prototype WebM is a rehearsal with synthetic data and must not be submitted. The final video has not been recorded in this work. Disclose actual tools and media in the final release; mark generated visuals as required by the [2026 submission guide](https://www.spaceappschallenge.org/resources/project-submission-guide/). Code/data and generated audio assistance must also be acknowledged in descriptive text and metadata. This proposed video uses software captures without music or external photographs. Do not claim a NASA texture or third-party media asset unless it is actually included and credited.

## Added on 15 November: opening globe, sky and demo video

- **NASA Blue Marble** (NASA Earth Observatory, public domain) and **NASA Black Marble** night lights, as packaged in the MIT-licensed `three-globe` npm package; reprojected to tiles by `rol5-panel-app/scripts/build_space_assets.py`.
- **NASA GIBS**, VIIRS NOAA-20 true-colour imagery of the last complete day, loaded at run time for the opening globe; GIBS Blue Marble for close zoom. If GIBS does not respond the page falls back to the local Blue Marble.
- **Star catalogue and constellation lines**: Hipparcos / Yale Bright Star via `d3-celestial` (BSD-3-Clause). **Planet, Moon and Sun positions**: `astronomy-engine` (MIT).
- **Fonts**: Inter and Space Grotesk (SIL Open Font License) through `@fontsource-variable`.
- **Demo video**: real screen captures of the app with observed data, rendered frame by frame with Playwright and encoded with ffmpeg (`docs/video/`). No generated imagery, voice or music. Claude assisted with the capture and editing scripts.
- Details, limits and what is real versus approximate: [docs/11-entrada-espacial.md](../11-entrada-espacial.md).

## Release items still to verify

Expanded-run provenance is in `data/ca/rol1/provenance.json` and `data/ca/json-light/meta.json` in integration. Still verify final media and map assets, dependency/license notices, repository license, English linked material, public links and the final SI inventory. The current materials do not report human testing results. Testing the three-country app, if completed, must be described with that scope.
