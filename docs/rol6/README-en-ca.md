# ALTARIS — Earth Trend Intelligence

Conditional README for the seven-country release. Prepared with Codex assistance. Promote to the repository root only after Joshua's GO decision; resolve every `[PENDING-CA]` first. Relative links below assume this file has been copied to the root.

ALTARIS investigates historical rainfall trends and how the evidence changes with the years selected. It addresses NASA Space Apps 2026's **Be An Earth System Trend Detective!** challenge using NASA GPM IMERG Final Run V07, 2001–2024, at 0.1° resolution.

Coverage: Honduras, Guatemala, El Salvador, Belize, Nicaragua, Costa Rica and Panama. `[PENDING-CA]` Insert the exact observed cell count and valid-year coverage from the verified export. The expansion retains the frozen statistical thresholds. Adjusted p-values and verdicts may change because the multiple-testing correction includes a different set of cells.

**Public app:** `[PENDING-CA]` Verified final URL with English selected.

**Demo:** `[PENDING-CA]` Public video of 30 seconds or less, captured from the frozen observed build.

Select a cell, read its evidence verdict, change the years in its stability footprint and export a JSON or Markdown passport. Agriculture, community and energy questions help identify missing local information. ALTARIS describes the past; it makes no forecast, causal claim or action prescription.

## Run the app

From `rol5-panel-app/`:

```sh
npm ci
npm run dev
```

`[PENDING-CA]` State which observed export is bundled in the final release and its commit. During expansion development the root app still contains the three-country observed dataset. Synthetic seven-country data generated with `pipeline/make_ca_mock.py` is for development only and must retain its demonstration label.

## Reproduce the analysis

Install `pipeline/requirements.txt` and `pipeline/requirements-rol1.txt` in a Python environment. Ingestion requires authorized NASA Earthdata access. Use `pipeline/config_centroamerica.yaml` for the seven-country bounds and country list. The configuration retains the established methods and thresholds.

```sh
cd pipeline
python run_rol1.py --config config_centroamerica.yaml --data-dir ../data/ca
```

Follow the engine and ENSO sequence in [the expansion plan](docs/10-centroamerica.md), including the real `enso.json`, reference files and secondary-variable enrichment. `[PENDING-CA]` Link the final English run instructions, export provenance and comparison of common cells. The large export is distributed separately during integration; do not commit raw downloads or treat mock data as observations.

Checks from `rol5-panel-app/`: `npm test`, `npm run typecheck`, `npm run build`. Engine checks from `pipeline/`: `python -m pytest tests -q`. `[PENDING-CA]` Add actual release-check results and the seven-country browser checks; these commands are instructions, not a claim that they have passed on the final export.

## Data and limitations

- [NASA IMERG V07](https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07): monthly rainfall.
- [NASA POWER](https://power.larc.nasa.gov/): comparisons and temperature/solar radiation at the original case sites.
- [NOAA CPC ONI](https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt): ENSO index.
- [Natural Earth](https://www.naturalearthdata.com/): borders.

Monthly satellite cells cannot resolve local microclimates, daily extremes or dry spells. Coastal cells can mix land and sea. Fixed seasonal months may differ from local rainy seasons. Sparse gauges, satellite-era changes, a short record and overlapping windows limit interpretation. NASA POWER may disagree and is not a fully independent confirmation. `[PENDING-CA]` Incorporate Camila's final regional limitations and seasonal check.

## Team and credits

Camila (science), Joshua (engine), David (data), Elena (map and deployment), Izel (panel), Andrés (product and delivery). See [English references and SI-use record](docs/rol6/references-en.md) and [English submission](docs/rol6/submission-en-ca.md). Claude and Codex assisted development and documentation. Statistical calculations and verdicts are deterministic; cell narratives use offline templates.

`[PENDING-CA]` Confirm the repository license and licenses of the actual final assets. Do not imply a license grant absent from the repository. User-testing outcomes must identify the version tested; no outcomes are asserted here.
