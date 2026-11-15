# ALTARIS — Earth Trend Intelligence

Conditional README for the seven-country release. Prepared with Codex assistance using the observed export `7e93e46` and integration records at `09ebae1`. Promote to the repository root only after Joshua's GO decision and the release gates below. Relative links below assume this file has been copied to the root.

ALTARIS investigates historical rainfall trends and how the evidence changes with the years selected. It addresses NASA Space Apps 2026's **Be An Earth System Trend Detective!** challenge using NASA GPM IMERG Final Run V07, 2001–2024, at 0.1° resolution.

Coverage: 4,332 observed land cells across Honduras, Guatemala, El Salvador, Belize, Nicaragua, Costa Rica and Panama, with 24 of 24 valid years per cell and indicator. The expansion retains the frozen statistical thresholds. Adjusted p-values and verdicts may change because the multiple-testing correction includes a different set of cells.

**Public app:** `[PENDING: deployment]` Verify final URL with English selected after GO. Do not present the existing three-country production URL or an unverified preview as the final expanded release.

**Demo:** `[PENDING: video]` Public video of 30 seconds or less, captured from the frozen observed build.

Select a cell, read its evidence verdict, change the years in its stability footprint and export a JSON or Markdown passport. Agriculture, community and energy questions help identify missing local information. ALTARIS describes the past; it makes no forecast, causal claim or action prescription.

## Run the app

From `rol5-panel-app/`:

```sh
npm ci
npm run dev
```

The observed seven-country export supplied by Joshua identifies engine `7e93e46`, generated 15 November 2026 at 17:33:46 UTC. It is distributed as `altaris_ca_json.zip`, SHA256 `77e7978646f518e4bdbbabbf4694fbbe6f70a53b462b8c0e2bdd4229e475e9b6`. Its contents match the regional tables used in the English submission. `[PENDING: deployment]` Confirm which export is bundled in the frozen release. The root app in the product branch still contains the three-country observed dataset. Synthetic data generated with `pipeline/make_ca_mock.py` is for development only and must retain its demonstration label.

## Reproduce the analysis

Install `pipeline/requirements.txt` and `pipeline/requirements-rol1.txt` in a Python environment. Ingestion requires authorized NASA Earthdata access. Use `pipeline/config_centroamerica.yaml` for the seven-country bounds and country list. The configuration retains the established methods and thresholds.

```sh
cd pipeline
python run_rol1.py --config config_centroamerica.yaml --data-dir ../data/ca
```

Follow the engine and ENSO sequence in [the expansion plan](docs/10-centroamerica.md), including the real `enso.json`, reference files and secondary-variable enrichment. Input provenance is `data/ca/rol1/provenance.json`; export metadata is `data/ca/json-light/meta.json` in integration. The [regional comparison](https://github.com/Joshua203-byte/Hackathon-NASA/blob/09ebae1/docs/ca/COMPARACION.md) finds identical per-cell results at the 2,025 shared locations. Its 29 verdict changes are all explained by FDR; the three case verdicts are retained. A signed-zero normalization in the ENSO check preserves published outcomes without changing thresholds. The large export is distributed separately during integration; do not commit raw downloads or treat mock data as observations. `[PENDING: English release instructions]` Supply English run instructions for linked delivery material.

Checks from `rol5-panel-app/`: `npm test`, `npm run typecheck`, `npm run build`. Engine checks from `pipeline/`: `python -m pytest tests -q`. The completed English form passes 41/41 checks with `check_form_ca.py` against the official seven-country ZIP; its limits and additional checks are recorded in [the verification report](docs/rol6/cotejo-formulario-ca.md). `[PENDING: release QA]` Add the actual final build and browser-check results. Instructions alone do not establish that those release checks have passed.

## Data and limitations

- [NASA IMERG V07](https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07): monthly rainfall.
- [NASA POWER](https://power.larc.nasa.gov/): comparisons and temperature/solar radiation at the original case sites.
- [NOAA CPC ONI](https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt): ENSO index.
- [Natural Earth](https://www.naturalearthdata.com/): borders.

Monthly satellite cells cannot resolve local microclimates, daily extremes or dry spells. Coastal cells can mix land and sea. The seasonal diagnostic classifies July-or-later starts at 119 Honduran locations, one in Belize and eight in Costa Rica. It classifies 688 of 1,076 Nicaraguan locations as without a midsummer dry spell; a fixed July–August sum must not be read as a universal dry-spell indicator. ENSO associations include positive seasonal correlations in Nicaragua, Costa Rica and Panama. Sparse gauges, satellite-era changes, a short record and overlapping windows limit interpretation. NASA POWER may disagree and is not a fully independent confirmation. `[PENDING: scientific sign-off]` Camila must approve the final regional interpretation and checklist.

## Team and credits

Camila (science), Joshua (engine), David (data), Elena (map and deployment), Izel (panel), Andrés (product and delivery). See [English references and SI-use record](docs/rol6/references-en.md) and [English submission](docs/rol6/submission-en-ca.md). Claude and Codex assisted development and documentation. Statistical calculations and verdicts are deterministic; cell narratives use offline templates.

`[PENDING: release audit]` Confirm the repository license, actual final assets, English linked materials and public URLs. Do not imply a license grant absent from the repository. No participant results have been supplied; no usability outcomes are asserted here. The GO decision, final deployment and video remain open.
