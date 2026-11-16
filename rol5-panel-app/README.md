# ALTARIS — web application

```powershell
npm ci
npm run dev
npm test
npm run typecheck
npm run build
```

Open `http://localhost:5173/?cell=N1345W08815&ind=jul_aug_mm&win=2001-2016&tour=1`.

The app is a React + TypeScript + Vite single-page application with a MapLibre globe and Recharts charts. It implements the cell panel, the stability footprint, window comparison, ENSO, cell comparison, a second variable, the territorial matrix, a glossary, a guided tour, cards, the evidence passport and local micro-validation, plus an opening animation (globe, sky and NASA imagery).

**Data.** `public/data/` holds the real, observed dataset: NASA GPM IMERG Final Run V07, 4,332 cells in 7 countries, 2001–2024, produced by the engine in `../pipeline` (see `meta.json`: `data_kind`, `pipeline_commit`). A few files under `src/panel/mock/` are fixtures used only by unit tests.

See [INTEGRACION.md](INTEGRACION.md) (Spanish, internal) for the window / second-variable contract, the connection to the pipeline, answer storage and the five-user test protocol.

To regenerate the test fixtures and their narratives, write them to a scratch folder (never over `public/data`):

```powershell
node src/panel/mock/make-mock.mjs ../scratch-mock
python ../pipeline/10_narrate.py ../scratch-mock
python ../pipeline/10_narrate.py ../scratch-mock --check
```

For the browser tests, start Vite on port 4173 and run `npm run test:e2e`. The tests use Chrome; `CHROME_PATH` can be set. Screenshots and PDFs are saved under `node_modules/.cache/acceptance`.

**Use of AI.** Parts of the original code were written with assistance from Claude; the extensions and tests of the review phase were assisted by OpenAI Codex. Cell narratives are produced with deterministic templates: no generative model computes statistics or assigns verdicts.
