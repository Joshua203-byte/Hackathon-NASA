# ALTARIS — Earth Trend Intelligence

Working English copy for the project form. Andrés owns the submission. Updated Sunday 15 November, about 06:00, with the observed results (exported JSON `pipeline_commit a7a5b18`, thresholds frozen). Every number below comes from the exported JSON, `data/rol1/` or `pipeline/calibration.json`; 45 of them were checked automatically against those files (see `docs/rol6/cotejo-formulario.md`).

**Still open before sending:**

- Done: Camila's scientific sign-off and case choice (`docs/09-casos-y-textos-camila.md`); the public app serves the final data and was checked on a phone.
- `[PENDING: repo]` **The code repository is private**: both GitHub links return 404 without logging in. The guide asks for links that need no password or permission. Joshua must make the repository public, or the team must link a public copy.
- `[PENDING: video]` The demo video does not exist yet.
- `[PENDING: guide]` \* Items that depend on the official 2026 guide. A summary is in `docs/rol6/guias-2026-resumen.md`; the AI-use wording is on hold until the app is tested.
- `[PENDING: testing]` No user-testing result exists yet. Do not claim one.

## Project summary

A farmer and a municipal planner can look at the same downward rainfall line and ask different questions. ALTARIS helps them decide how much confidence that line deserves. Pick a place on the map of Honduras, Guatemala and El Salvador, read 24 years of NASA satellite rainfall, change the years and see whether the trend holds up. Each place gets an evidence verdict with its reasons, and an exportable evidence passport records the data, method and limits so another person can check it.

Our main finding is a careful one: across Honduras, seasonal rainfall slopes point downward almost everywhere, yet not a single location supports a confirmed trend once uncertainty, multiple testing and sensitivity to the chosen years are taken into account.

## Challenge and audience

We address *Be An Earth System Trend Detective!* with a rainfall investigation for Honduras and its neighbours Guatemala and El Salvador. FAO reports that more than ten million people live across Central America's Dry Corridor. For communities that depend on rain-fed agriculture, the period and uncertainty behind a rainfall claim matter. The population figure describes the whole corridor. [FAO regional brief](https://www.fao.org/fileadmin/user_upload/rlc/docs/DryCorridor.pdf)

## What the project does

- **Map.** 2,025 land cells of 0.1° (about 11 km), coloured by evidence verdict, slope, sign stability or relationship with ENSO.
- **Cell panel.** The annual series with its Sen slope and 95 % confidence interval, the number of valid years, and the verdict with plain-language reasons.
- **Stability footprint.** A triangular chart of every window of 10 years or more. Selecting a window compares it side by side with the full period.
- **ENSO view.** Each year labelled El Niño, La Niña or neutral, with the option to remove strong ENSO years.
- **Questions for decisions.** For agriculture, communities or energy, the panel lists what the data cannot tell and which local information is missing.
- **Evidence passport.** JSON or Markdown export with dataset, DOI, engine version, thresholds, calibration and limitations. A shareable link restores the exact view.

Three indicators: rainy-season rainfall (May–October), midsummer rainfall (July–August) and annual rainfall.

## Earth science data and method

**Data.** NASA GPM IMERG Final Run, monthly, 0.1°, V07 ([doi:10.5067/GPM/IMERG/3B-MONTH/07](https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07)), 2001–2024, 288 monthly files accessed through NASA Earthdata. Every cell has 24 of 24 valid years. NOAA CPC Oceanic Niño Index for ENSO. NASA POWER as a second source at three comparison sites and at the three case cells, with 2 m air temperature and solar radiation as a secondary variable. Natural Earth for borders.

**Method.** For each cell and indicator:

1. Theil–Sen slope per decade with a 95 % confidence interval.
2. Mann–Kendall test, with the Hamed–Rao correction where lag-1 autocorrelation is positive and significant.
3. Benjamini–Hochberg false-discovery-rate adjustment across all cells, per indicator.
4. Stability footprint: the same test on every window of at least 10 years.
5. ENSO check: the slope recomputed without strong ENSO years and on residuals after removing the ONI relationship.
6. Pettitt change-point test, flagging a break in 2013–2015, when the record moves from the TRMM to the GPM satellite era.

**Verdict.** A deterministic rule assigns one of four labels. *Consistent* requires FDR-adjusted p < 0.05, an interval that excludes zero, the same sign in at least 90 % of windows of 15 years or more, survival of the ENSO check and no break flag around 2014. *Limited* means a weak, unconfirmed signal. *No evidence* and *incomplete* cover the rest. A single window can never be rated above *limited*.

**Thresholds were frozen before the regional run.** One change was made afterwards and is recorded in the passport: an independent recalculation of nine cells exposed a flaw in how the autocorrelation correction was applied, and fixing it only made verdicts more conservative.

No machine learning and no prediction. Generative AI does not compute any figure or decide any verdict.

## Results

| Indicator | Country | Consistent | Limited | No evidence | Cells |
|---|---|---|---|---|---|
| Rainy season (May–Oct) | Honduras | 0 | 295 | 644 | 939 |
| Rainy season (May–Oct) | El Salvador | 0 | 70 | 99 | 169 |
| Rainy season (May–Oct) | Guatemala | 44 | 556 | 317 | 917 |
| Annual | Honduras | 0 | 89 | 850 | 939 |
| Annual | El Salvador | 0 | 30 | 139 | 169 |
| Annual | Guatemala | 56 | 496 | 365 | 917 |
| Midsummer (Jul–Aug) | all three | 0 | 956 | 1,069 | 2,025 |

Neighbouring cells are strongly correlated, so these are not thousands of independent findings.

- **Honduras: no confirmed trend.** Rainy-season slopes are negative in 924 of 939 cells (median −4.5 % per decade), but the intervals include zero. With 24 years, a trend cannot be affirmed.
- **Guatemala: one band stands out, with a caveat.** All *consistent* cells lie in a strip of the western highlands. The decline there is very large (median −19 % per decade), a change-point test places a shift in 2012 or 2009 in most of those cells, and 24 years cannot tell a step from a gradual trend. Rain gauges that anchor IMERG are sparse in the highlands, and at the strongest cell NASA POWER shows no decline (+40 mm per decade against −452). We report it as an open question, not as a confirmed climate signal.
- **ENSO.** Rainfall is lower in El Niño years across the whole region: the correlation with ONI is negative in every cell for rainy-season and midsummer rainfall. We looked for a Pacific–Caribbean contrast and did not find one in this record.
- **Two sources, two answers.** At three sites, IMERG and NASA POWER disagree on the sign of the trend in 7 of 9 comparisons, while agreeing on which years were wet or dry. The trend can depend on the data source.

**Calibration (1,000 simulated series).** In pure noise, *consistent* appeared 0.0 % of the time and *limited* 33.1 %. With an injected decline of 10 % per decade, *consistent* was reached in 15.2 % of series; with 20 % per decade, in 54.4 %. So *consistent* is rarely wrong but only detects strong trends, and *limited* alone is not evidence.

## Three cases

1. **Dry Corridor, Honduras** (Choluteca, cell `N1335W08715`). Rainy-season rainfall: −48 mm per decade, 95 % interval from −257 to +171, adjusted p 0.88. Verdict: no evidence. Not finding a trend is a finding too. El Niño years are drier here (correlation with ONI −0.64).
2. **Same place, three stories** (cell `N1475W08765`, Honduras). Full period 2001–2024: −48 mm per decade, no evidence. 2008–2023: −345 mm per decade, a weak, unconfirmed signal. 2001–2010, a short 10-year window: +382 mm per decade, also a weak signal, with the opposite sign. The wettest year (2008) and the wet years 2010 and 2011 fall at the start or at the end depending on the window. Windows overlap and are not corrected, so none goes beyond *limited*.
3. **Two sites, two verdicts** (cell `N1495W09125`, Guatemala's western highlands, against Choluteca). Rainy-season rainfall −452 mm per decade on a mean of 1,478 mm, adjusted p 0.032: *consistent*, next to *no evidence* in Choluteca, with the same product, years and ENSO phases. It stays an open question: the drop concentrates around 2009, gauges are sparse, and NASA POWER sees no decline at this cell (r 0.18 between the two sources year to year).

## Impact and limitations

ALTARIS makes uncertainty visible even when a trend line slopes downward. It is meant to slow down a common mistake: reading a short, noisy record as a confirmed change. The local questions invite users to compare what they see with rain gauges, soil conditions or records of water shortages.

Limitations, also shown in every passport:

- A satellite cell of about 11 km does not capture hillside microclimates.
- Monthly totals do not measure dry spells or daily extremes.
- A 24-year record cannot separate a trend from decadal variability.
- The record joins the TRMM and GPM eras around 2014; an instrument effect cannot be ruled out. A possible 2013–2015 break is flagged mostly in Guatemala: 12.1 % of its cells for rainy-season rainfall and 34.9 % for midsummer rainfall, against 0.1 % and 2.2 % in Honduras and 0.6 % and 8.9 % in El Salvador.
- IMERG Final is adjusted with rain gauges; where gauges are few, the adjustment is weaker.
- Footprint windows overlap and their p-values are not corrected.
- The project describes the past. It makes no forecast and no causal claim.

`[PENDING: testing]` User testing: five sessions are planned. Add the actual sample size, task completion and comprehension results, or state that none were collected.

## Team and tools

Camila, Joshua, Elena, Izel, David and Andrés worked across science, data, web and product roles. The web app uses React, TypeScript, Recharts and MapLibre. The analysis uses Python with NumPy, SciPy and pymannkendall.

**Use of AI.** Claude and OpenAI Codex assisted with code, tests, documentation and bilingual copy; Codex also assisted with the prototype video. Cell narratives are produced offline from deterministic templates and are labelled as such. No AI model computes statistics or assigns verdicts. [Resource and AI-use record](fuentes.md) `[PENDING: guide]` confirm the required AI-disclosure wording and any watermark rule for the video.

## Submission links

- [Code repository](https://github.com/Joshua203-byte/Hackathon-NASA) `[PENDING: repo]` private today; make it public before sending
- Public app: <https://altaris.altaris-panel-rol5.workers.dev> (checked: final data, 2,025 cells; opens on a phone). Direct links to the cases: [case 1](https://altaris.altaris-panel-rol5.workers.dev/?case=1), [case 2](https://altaris.altaris-panel-rol5.workers.dev/?case=2), [case 3](https://altaris.altaris-panel-rol5.workers.dev/?case=3). The case links already open on the public app; the guided tour with the real case (merged into `main`) appears once Izel redeploys.
- Demo video, 30 seconds or less: `[PENDING: video]`. The current file ([altaris-prototype.webm](altaris-prototype.webm)) is a rehearsal made with simulated data and must not be submitted.
