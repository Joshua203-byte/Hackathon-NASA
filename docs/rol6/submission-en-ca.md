# ALTARIS — Earth Trend Intelligence

Working copy for seven countries, prepared 15 November 2026 with Codex assistance. This is a conditional submission draft, not a statement that the expansion has shipped. Numerical content uses Joshua's observed export (engine `7e93e46`) and integration records at `09ebae1`. Scientific sign-off and release approval remain open; see the internal release gate below. The three-country fallback is [submission-en.md](submission-en.md).

## Project Name

ALTARIS — Earth Trend Intelligence

## High-Level Project Summary

A farmer and a municipal planner can see the same downward rainfall line and ask different questions. ALTARIS helps them judge how much confidence that line deserves. Explore NASA satellite rainfall in Honduras, Guatemala, El Salvador, Belize, Nicaragua, Costa Rica and Panama, change the years and inspect whether the apparent trend holds. An evidence verdict explains the uncertainty, while an exportable passport records the data, methods and limits. The tool investigates historical rainfall; it makes no forecasts or causal claims.

Across the expanded region, 196 locations meet the consistent-evidence rule for May–October rainfall; none do in Honduras or El Salvador. Positive as well as negative associations with ENSO occur. These results require regional scientific sign-off before release.

## Link to Project Demo

`[PENDING: video]` Public final video URL, 30 seconds or less, recorded against the frozen observed release. The simulated prototype is a rehearsal and must not be submitted. See [production script](guion-video-30s.md).

## Link to Final Project

`[PENDING: deployment]` Final public URL approved after Joshua's GO decision and Elena's production verification. The existing [three-country app](https://altaris.altaris-panel-rol5.workers.dev/?lang=en) remains the fallback; do not label it as seven-country coverage before deployment.

## Detailed Project Description

### Challenge and audience

We address *Be An Earth System Trend Detective!* by investigating rainfall change and the evidence supporting it. Farmers, municipal planners and students can compare historical rainfall claims with their period, uncertainty and sensitivity. Sector questions encourage comparison with local observations rather than prescribe actions.

### What users do

- Select a land cell on a map coloured by evidence, slope, stability or ENSO relationship. Coverage: 4,332 observed cells across seven countries, at 0.1° resolution (about 11 km).
- Read a yearly series, Sen slope per decade, 95% confidence interval, valid years and reasons for the verdict.
- Change the start and end years. A triangular footprint compares windows of at least 10 years; each window verdict is capped at *limited*.
- Inspect the ENSO check and the temperature and solar-radiation series at the original three case cells. These secondary variables do not cover every cell in the expanded region.
- Export a JSON or Markdown evidence passport and copy a link restoring the selected view.

Indicators are May–October rainfall, July–August rainfall and annual rainfall. The two seasonal sums use fixed months; they are not assumed to describe the local rainy season everywhere.

### Method and reproducibility

The pipeline uses Theil–Sen slope and interval, Mann–Kendall with the Hamed–Rao correction where positive lag-1 autocorrelation is significant, and Benjamini–Hochberg FDR across cells for each indicator. It checks overlapping time windows, recomputes trends after removing strong ENSO years and after removing the ONI relationship, and flags Pettitt change points in 2013–2015 around the satellite-era transition.

The frozen decision rules combine significance, interval, window stability, ENSO survival and the break flag into *consistent*, *limited*, *no evidence* or *incomplete*. Limited means a weak, unconfirmed signal. A change correcting autocorrelation handling after the original freeze is recorded in the exported metadata.

The expansion changes the geographic bounds and country list in `pipeline/config_centroamerica.yaml`, keeping the existing thresholds. For shared cells, the per-cell slopes, intervals and unadjusted p-values must match the original run. Adjusted p-values and verdicts can change because the FDR calculation now includes a different set of cells. A new verdict does not by itself mean that the local rainfall series changed.

The observed export identifies engine `7e93e46`, generated on 15 November 2026 at 11:33:46 in El Salvador (17:33:46 UTC). It contains 4,332 cells with 24 of 24 valid years for every cell-indicator pair. Joshua's [comparison](https://github.com/Joshua203-byte/Hackathon-NASA/blob/09ebae1/docs/ca/COMPARACION.md) reports identical per-cell results for the 2,025 shared locations and 29 verdict changes, all from limited to consistent in Guatemala (14 seasonal and 15 annual), each explained by the FDR threshold crossing. All three case verdicts are unchanged. A signed-zero normalization for the ENSO check preserves the published results and is recorded in `threshold_changes`; it does not change a statistical threshold. [Camila's review](https://github.com/Joshua203-byte/Hackathon-NASA/blob/09ebae1/docs/ca/camila.md) still requires its final observed-data checklist and signature.

### Results

| Indicator | Country | Consistent | Limited | No evidence | Cells |
|---|---|---|---|---|---|
| Rainy season (May–Oct) | Nicaragua | 15 | 600 | 461 | 1,076 |
| Rainy season (May–Oct) | Honduras | 0 | 295 | 644 | 939 |
| Rainy season (May–Oct) | Guatemala | 58 | 542 | 317 | 917 |
| Rainy season (May–Oct) | Panama | 42 | 340 | 232 | 614 |
| Rainy season (May–Oct) | Costa Rica | 80 | 129 | 216 | 425 |
| Rainy season (May–Oct) | Belize | 1 | 125 | 66 | 192 |
| Rainy season (May–Oct) | El Salvador | 0 | 70 | 99 | 169 |
| Rainy season (May–Oct) | All countries | 196 | 2,101 | 2,035 | 4,332 |
| Midsummer (Jul–Aug) | Nicaragua | 0 | 569 | 507 | 1,076 |
| Midsummer (Jul–Aug) | Honduras | 0 | 219 | 720 | 939 |
| Midsummer (Jul–Aug) | Guatemala | 0 | 660 | 257 | 917 |
| Midsummer (Jul–Aug) | Panama | 0 | 395 | 219 | 614 |
| Midsummer (Jul–Aug) | Costa Rica | 0 | 152 | 273 | 425 |
| Midsummer (Jul–Aug) | Belize | 0 | 76 | 116 | 192 |
| Midsummer (Jul–Aug) | El Salvador | 0 | 77 | 92 | 169 |
| Midsummer (Jul–Aug) | All countries | 0 | 2,148 | 2,184 | 4,332 |
| Annual | Nicaragua | 1 | 380 | 695 | 1,076 |
| Annual | Honduras | 0 | 89 | 850 | 939 |
| Annual | Guatemala | 71 | 481 | 365 | 917 |
| Annual | Panama | 48 | 302 | 264 | 614 |
| Annual | Costa Rica | 106 | 124 | 195 | 425 |
| Annual | Belize | 5 | 30 | 157 | 192 |
| Annual | El Salvador | 0 | 30 | 139 | 169 |
| Annual | All countries | 231 | 1,436 | 2,665 | 4,332 |

Incomplete: 0.

The seasonal total is 196 consistent, 2,101 limited and 2,035 no-evidence locations. Annual rainfall has 231 consistent locations. No July–August location is rated consistent. Consistent seasonal evidence is distributed across Costa Rica, Guatemala, Panama, Nicaragua and Belize; it is not restricted to Guatemala. Neighbouring cells are correlated, so these counts are not independent discoveries.

In Honduras, seasonal slopes are negative in 924 of 939 cells (median −4.5 % per decade), yet none is rated consistent. The original western-Guatemala case remains an open question because of change points, sparse gauges and disagreement with NASA POWER. Joshua also reports negative slopes and 2010–2012 change points among consistent locations in Costa Rica and Panama; no climatic or instrumental cause is inferred without scientific review.

ENSO association is not negative everywhere. For May–October, 154 of 4,332 locations have positive correlation with ONI (52 in Nicaragua, 81 in Costa Rica and 21 in Panama); the regional range is −0.74 to +0.45. After FDR, 1,767 associations are significant. For July–August there are 161 positive correlations and 2,112 significant associations; for annual rainfall, 52 positive correlations and one significant association. These geographic differences do not establish a Pacific–Caribbean mirror effect or causation.

**Calibration: 1,000 simulated series.** In pure noise, *consistent* appeared 0.0 % of the time and *limited* 33.1 %. An injected decline of 10 % per decade was rated consistent in 15.2 % of series; a 20 % decline in 54.4 %. These are simulation outcomes under the calibration setup, not measured regional error rates or usability results.

**Break flags, with country denominators:**

| Indicator | Country | flagged | Cells | % |
|---|---|---|---|---|
| Rainy season (May–Oct) | Nicaragua | 9 | 1,076 | 0.8 |
| Rainy season (May–Oct) | Honduras | 1 | 939 | 0.1 |
| Rainy season (May–Oct) | Guatemala | 111 | 917 | 12.1 |
| Rainy season (May–Oct) | Panama | 42 | 614 | 6.8 |
| Rainy season (May–Oct) | Costa Rica | 0 | 425 | 0.0 |
| Rainy season (May–Oct) | Belize | 26 | 192 | 13.5 |
| Rainy season (May–Oct) | El Salvador | 1 | 169 | 0.6 |
| Rainy season (May–Oct) | All countries | 190 | 4,332 | 4.4 |
| Midsummer (Jul–Aug) | Nicaragua | 14 | 1,076 | 1.3 |
| Midsummer (Jul–Aug) | Honduras | 21 | 939 | 2.2 |
| Midsummer (Jul–Aug) | Guatemala | 320 | 917 | 34.9 |
| Midsummer (Jul–Aug) | Panama | 135 | 614 | 22.0 |
| Midsummer (Jul–Aug) | Costa Rica | 5 | 425 | 1.2 |
| Midsummer (Jul–Aug) | Belize | 5 | 192 | 2.6 |
| Midsummer (Jul–Aug) | El Salvador | 15 | 169 | 8.9 |
| Midsummer (Jul–Aug) | All countries | 515 | 4,332 | 11.9 |
| Annual | Nicaragua | 2 | 1,076 | 0.2 |
| Annual | Honduras | 0 | 939 | 0.0 |
| Annual | Guatemala | 104 | 917 | 11.3 |
| Annual | Panama | 35 | 614 | 5.7 |
| Annual | Costa Rica | 0 | 425 | 0.0 |
| Annual | Belize | 6 | 192 | 3.1 |
| Annual | El Salvador | 0 | 169 | 0.0 |
| Annual | All countries | 147 | 4,332 | 3.4 |

### Three auditable cases

The original case locations remain fixed. The comparison confirms unchanged per-cell results and verdicts; adjusted p-values below come from the expanded observed export.

1. **Dry Corridor, Honduras — `N1335W08715`.** May–October rainfall slope −48 mm per decade, 95 % interval −257 to +171, adjusted p 0.8735, no evidence. ONI correlation −0.64. NASA POWER gives the opposite slope sign (+171 mm per decade, not significant); no decline is confirmed here.
2. **Same place, different years — `N1475W08765`.** Full period 2001–2024: −48 mm per decade, adjusted p 0.7374, no evidence. The 2008–2023 window gives −345 mm per decade, while 2001–2010 gives +382; both window verdicts are limited. The years selected can reverse the apparent direction. Overlapping windows are sensitivity checks, not independent discoveries.
3. **Two sites, evidence to inspect — `N1495W09125` against `N1335W08715`.** The Guatemala case has seasonal slope −452 mm per decade, 95 % interval −641 to −282, mean 1,478 mm, adjusted p 0.02424, consistent; Choluteca has no evidence. The Guatemala decline concentrates around 2009 and remains an open question: gauges are sparse and NASA POWER shows +40 mm per decade rather than a decline, with interannual correlation 0.18 between products.

### Impact and limitations

The intended benefit is a more careful reading of noisy historical records, supported by evidence a user can inspect and export. Intended audiences are not evidence of measured impact.

- Satellite cells cannot resolve hillside microclimates; narrow coastal cells may mix land and sea, and the mask uses cell centres.
- Fixed May–October and July–August totals may not represent each local rainy season. The exported seasonal check identifies a late start (July or later) at 119 of 939 Honduran locations, one of 192 in Belize and eight of 425 in Costa Rica; none in Guatemala, El Salvador, Nicaragua or Panama. The distribution is shown below. It does not itself establish the month of peak rainfall.
- ENSO associations can vary by coast and location. Positive seasonal ONI correlations occur in Nicaragua, Costa Rica and Panama as quantified above. A coast-specific mechanism has not been established.
- Monthly totals do not measure daily extremes or dry spells. A 24-year record cannot separate a trend from decadal variability.
- Sparse rain gauges and the TRMM/GPM transition can affect interpretation. The country table above reports flags in 2013–2015. Earlier shifts such as those around 2009–2012 need separate interpretation; a flag-free verdict does not exclude an instrument effect.
- Windows overlap and their p-values are not corrected. Neighbouring cells are correlated.
- NASA POWER is coarser and is not a fully independent confirmation of IMERG. Source disagreement remains visible.
- No forecast, risk index, causal conclusion or farming prescription is produced.

Seasonal diagnostic from `TEMPORADAS.csv` (start-month classification, not peak month):

| Country | Locations | Before May | May | June | July or later | Without midsummer dry spell |
|---|---|---|---|---|---|---|
| Belize | 192 | 0 | 0 | 191 | 1 | 23 |
| Costa Rica | 425 | 0 | 250 | 167 | 8 | 165 |
| Guatemala | 917 | 0 | 815 | 102 | 0 | 78 |
| Honduras | 939 | 0 | 393 | 427 | 119 | 262 |
| Nicaragua | 1,076 | 0 | 602 | 474 | 0 | 688 |
| Panama | 614 | 0 | 93 | 521 | 0 | 285 |
| El Salvador | 169 | 0 | 169 | 0 | 0 | 0 |

These diagnostic classifications need Camila's final interpretation; in particular the July–August sum must not be assumed to represent a midsummer dry spell throughout the region.

### User testing

No participant results are available in this working copy. Five sessions are planned on the existing three-country production app. `[PENDING: testing]` No sessions have been reported; retain that disclosure unless actual sample size, device/version, task completion, first-attempt comprehension, intersection and difficulties are supplied. Identify the tested coverage explicitly; tests of three-country production do not validate seven-country usability. If none are completed before submission, use: “User testing was planned but not carried out before the deadline.”

### Team and tools

Camila, Joshua, Elena, Izel, David and Andrés work across science, data, web and product. React, TypeScript, Recharts and MapLibre power the interface; Python, NumPy, SciPy and pymannkendall support the analysis. See [English resource record](references-en.md) for tools and data credits.

## Use of Super Intelligence (SI)

Claude and OpenAI Codex assisted with code, tests, documentation and bilingual copy. Codex also assisted with the simulated prototype video and the conditional expansion materials. Cell narratives are produced offline with deterministic templates; no generative model computes statistics or assigns verdicts. The project idea, scientific decisions and case selection are the team's own, as recorded in the team's existing attribution. Code and data assistance is documented in text and metadata. For the materials currently prepared, this assistance is recorded in the [English resource inventory](references-en.md). `[PENDING: final media inventory]` Reconcile that inventory with the frozen release and any generated audio/visual material. Generated images or video require visible marks; generated audio requires text and metadata disclosure. No claim is made that a final video already exists.

## NASA Data

NASA GPM IMERG Final Run monthly V07, 0.1°, 2001–2024: [DOI 10.5067/GPM/IMERG/3B-MONTH/07](https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07). Monthly files are obtained through Earthdata from GES DISC. The [challenge resources](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources) link GES DISC's Hydrology Time Series tool, but do not explicitly name IMERG. ALTARIS uses IMERG observations from that archive; it does not claim to use the linked time-series tool. `[PENDING: NASA resource eligibility]` Confirm any challenge-specific eligibility interpretation with the organizers before submission; no organizer approval is claimed.

NASA POWER supplies rainfall comparisons and temperature/solar radiation at the original case sites. Expanded-run provenance is in `data/ca/rol1/provenance.json`; the input comparison reports identical original locations. POWER provenance remains in `data/rol1/power_casos/provenance.json`. Do not imply POWER coverage throughout all seven countries.

## Space Agency Partner Data and Other References

NOAA CPC ONI supports ENSO checks; Natural Earth supplies borders. They are auxiliary sources. The complete English resource and SI-use list is [references-en.md](references-en.md). `[PENDING: release audit]` Verify final assets, libraries, licenses, English materials and public links against the frozen build.

## Internal release gate — remove before pasting

Joshua owns GO/NO-GO. No change to the official form, root README or production URL is implied by this draft. Resolve all markers, compare numbers with the observed JSON using Joshua's adapted checker, obtain Camila's signature and verify Elena's deployed URL before switching. Use `pipeline/check_form_ca.py` from integration for this expanded form; `check_form_numbers.py` remains the fixed-expectation three-country check. The CA checker covers supported tables and phrases, not every numeric statement. See [cotejo-formulario-ca.md](cotejo-formulario-ca.md) for evidence and remaining release gates. Keep the original form and [alternative README](README-en-ca.md) available for the decision.
