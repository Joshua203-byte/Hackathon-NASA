# ALTARIS — Earth Trend Intelligence

Working English copy for the project form. Andrés owns the submission. Match the headings and length limits to the live form before sending.

## Project summary

A farmer and a municipal planner can look at the same downward rainfall line and ask different questions. ALTARIS helps them decide how much confidence that line deserves. Select a location, inspect the historical series, change the years and see whether the evidence holds up. An exportable evidence passport records the comparison so another person can check it.

## Challenge and audience

We address *Be An Earth System Trend Detective!* with a rainfall investigation designed for Honduras and its neighbours Guatemala and El Salvador. FAO reports that more than ten million people live across Central America’s Dry Corridor. For communities that depend on rain-fed agriculture, the period and uncertainty behind a rainfall claim matter. The population figure describes the whole corridor. [FAO regional brief](https://www.fao.org/fileadmin/user_upload/rlc/docs/DryCorridor.pdf)

## What the prototype does

The current build demonstrates the workflow using four simulated locations. Choose a cell and a rainfall indicator. Read the trend line, its slope interval and the number of valid years. Select another time window in the triangular stability chart to compare the two estimates. The panel explains its evidence verdict, displays questions relevant to the selected sector and exports the underlying evidence as JSON or Markdown. A shareable link restores the selected view.

## Earth science data and method

The planned primary input is monthly precipitation from NASA GPM IMERG. The analysis is designed to report seasonal and annual rainfall, a Sen slope per decade, a confidence interval and a Mann–Kendall trend test. Regional multiple-testing adjustment, window sensitivity and comparison with NOAA's ONI index are part of the scientific workflow. The prototype displays precomputed results. The bundled series and statistics are simulated. The regional scientific pipeline and its observed results remain pending.

## Impact and limitations

The panel makes uncertainty visible even when the trend line slopes downward. The local questions invite users to compare an apparent change with rain gauges, soil conditions or records of water shortages. The available prototype demonstrates an interaction. Estimates of regional climate change, causal effects, predictive accuracy or participant success would require additional evidence.

## Team and tools

Camila, Joshua, Elena, Izel, David and Andrés developed the project across science, data, web and product roles. The prototype uses React, TypeScript and Recharts. Claude and OpenAI Codex assisted with code and documentation. Codex also assisted with bilingual copy, testing and the prototype video. Rainfall narratives are generated offline from deterministic templates. [Resource and AI-use record](fuentes.md)

## Submission links and final evidence

- [Code repository](https://github.com/ElenaColorado/Hackathon-NASA) · [Prototype video, 28 seconds](altaris-prototype.webm)
- Andrés replaces the relative video link with the externally accessible final demo URL and adds Elena’s tested public app URL.
- David supplies the exact dataset citation and access details. Joshua supplies release ID, period, valid-cell count, magnitude, units, interval and verdict for the featured case. Camila approves its wording and any comparison with ENSO.
- After the five planned sessions, add actual sample size, task completion and comprehension results. Leave missing evidence explicitly pending if the team submits a prototype.
