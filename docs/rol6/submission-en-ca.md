# ALTARIS — Earth Trend Intelligence

Working copy for seven countries, prepared 15 November 2026 with Codex assistance. This is a conditional submission draft, not a statement that the expansion has shipped. Replace every `[PENDING-CA]` using Joshua's observed export and Camila's review. The three-country fallback is [submission-en.md](submission-en.md).

## Project Name

ALTARIS — Earth Trend Intelligence

## High-Level Project Summary

A farmer and a municipal planner can see the same downward rainfall line and ask different questions. ALTARIS helps them judge how much confidence that line deserves. Explore NASA satellite rainfall in Honduras, Guatemala, El Salvador, Belize, Nicaragua, Costa Rica and Panama, change the years and inspect whether the apparent trend holds. An evidence verdict explains the uncertainty, while an exportable passport records the data, methods and limits. The tool investigates historical rainfall; it makes no forecasts or causal claims.

`[PENDING-CA]` Add one principal finding only after the observed seven-country export and scientific review are available.

## Link to Project Demo

`[PENDING-CA]` Public final video URL, 30 seconds or less, recorded against the frozen observed release. The simulated prototype is a rehearsal and must not be submitted. See [production script](guion-video-30s.md).

## Link to Final Project

`[PENDING-CA]` Final public URL approved after Joshua's GO decision and Elena's production verification. The existing [three-country app](https://altaris.altaris-panel-rol5.workers.dev/?lang=en) remains the fallback; do not label it as seven-country coverage before deployment.

## Detailed Project Description

### Challenge and audience

We address *Be An Earth System Trend Detective!* by investigating rainfall change and the evidence supporting it. Farmers, municipal planners and students can compare historical rainfall claims with their period, uncertainty and sensitivity. Sector questions encourage comparison with local observations rather than prescribe actions.

### What users do

- Select a land cell on a map coloured by evidence, slope, stability or ENSO relationship. Coverage: `[PENDING-CA]` observed cells across seven countries, at 0.1° resolution (about 11 km).
- Read a yearly series, Sen slope per decade, 95% confidence interval, valid years and reasons for the verdict.
- Change the start and end years. A triangular footprint compares windows of at least 10 years; each window verdict is capped at *limited*.
- Inspect the ENSO check and the temperature and solar-radiation series at the original three case cells. These secondary variables do not cover every cell in the expanded region.
- Export a JSON or Markdown evidence passport and copy a link restoring the selected view.

Indicators are May–October rainfall, July–August rainfall and annual rainfall. The two seasonal sums use fixed months; they are not assumed to describe the local rainy season everywhere.

### Method and reproducibility

The pipeline uses Theil–Sen slope and interval, Mann–Kendall with the Hamed–Rao correction where positive lag-1 autocorrelation is significant, and Benjamini–Hochberg FDR across cells for each indicator. It checks overlapping time windows, recomputes trends after removing strong ENSO years and after removing the ONI relationship, and flags Pettitt change points in 2013–2015 around the satellite-era transition.

The frozen decision rules combine significance, interval, window stability, ENSO survival and the break flag into *consistent*, *limited*, *no evidence* or *incomplete*. Limited means a weak, unconfirmed signal. A change correcting autocorrelation handling after the original freeze is recorded in the exported metadata.

The expansion changes the geographic bounds and country list in `pipeline/config_centroamerica.yaml`, keeping the existing thresholds. For shared cells, the per-cell slopes, intervals and unadjusted p-values must match the original run. Adjusted p-values and verdicts can change because the FDR calculation now includes a different set of cells. A new verdict does not by itself mean that the local rainfall series changed.

`[PENDING-CA]` Insert the export's pipeline commit, generation date, exact coverage and valid-year report. Link Joshua's comparison of common cells and Camila's signed review. No seven-country reproducibility claim is final until the observed run is checked.

### Results

`[PENDING-CA]` Insert Joshua's `ca_tables.py` tables: counts of all four verdicts and total cells by country and indicator, plus 2013–2015 break-flag percentages by country. Include the denominator for every percentage. Check totals against `meta.json`, `grid.json` and `verdict_summary.csv`.

`[PENDING-CA]` Summarize regional slope signs, ENSO results and source disagreements from the observed export. Three-country statements such as “all consistent cells are in Guatemala” and “every cell has negative ENSO correlation” must not be carried over without recalculation.

`[PENDING-CA]` Report calibration from the supplied calibration file with its simulation count and limitations. Do not describe series simulations as validation of regional FDR, spatial performance or usability.

### Three auditable cases

The original case locations remain fixed. Their slopes, intervals and unadjusted p-values must match the original observed run; the adjusted p-values and final verdicts require the new export.

1. **Dry Corridor, Honduras — `N1335W08715`.** Inspect the full-period slope and interval before interpreting a downward line. `[PENDING-CA]` Insert slope, interval, adjusted p-value, verdict, ENSO association and second-source caveat from the reviewed export.
2. **Same place, different years — `N1475W08765`.** Compare 2001–2024, 2008–2023 and 2001–2010. `[PENDING-CA]` Confirm slopes and window verdicts, then describe the effect of year selection. Overlapping windows are sensitivity checks, not independent discoveries.
3. **Two sites, evidence to inspect — `N1495W09125` against `N1335W08715`.** `[PENDING-CA]` Insert the new verdicts and adjusted p-values, retain the NASA POWER disagreement and change-point caveats after review. If the verdicts converge, describe that result rather than promise a contrast.

### Impact and limitations

The intended benefit is a more careful reading of noisy historical records, supported by evidence a user can inspect and export. Intended audiences are not evidence of measured impact.

- Satellite cells cannot resolve hillside microclimates; narrow coastal cells may mix land and sea, and the mask uses cell centres.
- Fixed May–October and July–August totals may not represent each local rainy season. `[PENDING-CA]` Add Camila's country-level seasonal check, without assuming results for Nicaragua, Costa Rica or Panama.
- ENSO associations can vary by coast and location. `[PENDING-CA]` Add the measured regional pattern and Camila's interpretation.
- Monthly totals do not measure daily extremes or dry spells. A 24-year record cannot separate a trend from decadal variability.
- Sparse rain gauges and the TRMM/GPM transition can affect interpretation. `[PENDING-CA]` Insert the measured break-flag rates, not the three-country rates.
- Windows overlap and their p-values are not corrected. Neighbouring cells are correlated.
- NASA POWER is coarser and is not a fully independent confirmation of IMERG. Source disagreement remains visible.
- No forecast, risk index, causal conclusion or farming prescription is produced.

`[PENDING-CA]` Replace provisional geographic limitations with Camila's final bilingual wording and signed checklist.

### User testing

No participant results are available in this working copy. Five sessions are planned on the existing three-country production app. `[PENDING-CA]` Insert the actual sample size, device/version, task completion, first-attempt comprehension, intersection of both criteria and difficulties. Identify the tested coverage explicitly; tests of three-country production do not validate seven-country usability. If none are completed before submission, use: “User testing was planned but not carried out before the deadline.”

### Team and tools

Camila, Joshua, Elena, Izel, David and Andrés work across science, data, web and product. React, TypeScript, Recharts and MapLibre power the interface; Python, NumPy, SciPy and pymannkendall support the analysis. See [English resource record](references-en.md) for tools and data credits.

## Use of Super Intelligence (SI)

Claude and OpenAI Codex assisted with code, tests, documentation and bilingual copy. Codex also assisted with the simulated prototype video and the conditional expansion materials. Cell narratives are produced offline with deterministic templates; no generative model computes statistics or assigns verdicts. The team's recorded attribution identifies the project idea, scientific decisions and case selection as its own. Code and data assistance is documented in text and metadata. `[PENDING-CA]` Reconcile the final artifact list with the actual frozen release and record any generated visual/audio material and required marks. No claim is made that a final video already exists.

## NASA Data

NASA GPM IMERG Final Run monthly V07, 0.1°, 2001–2024: [DOI 10.5067/GPM/IMERG/3B-MONTH/07](https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07). Monthly files are obtained through Earthdata from GES DISC. The [challenge resources](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources) link GES DISC's Hydrology Time Series tool, but do not explicitly name IMERG. ALTARIS uses IMERG observations from that archive; it does not claim to use the linked time-series tool. `[PENDING-CA]` Confirm any challenge-specific eligibility interpretation with the organizers before submission.

NASA POWER supplies rainfall comparisons and temperature/solar radiation at the original case sites. `[PENDING-CA]` Link the final expanded-run provenance and verify exact acquisition metadata. Do not imply POWER coverage throughout all seven countries.

## Space Agency Partner Data and Other References

NOAA CPC ONI supports ENSO checks; Natural Earth supplies borders. They are auxiliary sources. The complete English resource and SI-use list is [references-en.md](references-en.md). `[PENDING-CA]` Verify final assets, libraries, licenses and links against the frozen build.

## Internal release gate — remove before pasting

Joshua owns GO/NO-GO. No change to the official form, root README or production URL is implied by this draft. Resolve all markers, compare numbers with the observed JSON using Joshua's adapted checker, obtain Camila's signature and verify Elena's deployed URL before switching. The current checker has hard-coded three-country expectations; its success does not certify this draft. Keep the original form and [alternative README](README-en-ca.md) available for the decision.
