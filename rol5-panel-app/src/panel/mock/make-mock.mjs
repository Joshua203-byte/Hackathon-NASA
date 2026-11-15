// SOLO PARA MOCKS. Genera celdas de prueba con la forma del contrato para trabajar sin esperar al pipeline.
// Los números reales salen de pipeline/ (scipy + pymannkendall); aquí la estadística es aproximada a propósito.
// Uso: node mock/make-mock.mjs <carpeta de salida, p. ej. web/public/data>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const phi = (z) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };
const r = (x, d = 3) => (x === null ? null : Number(x.toFixed(d)));

function trend(pts) {
  const n = pts.length;
  if (n < 8) return null;
  const slopes = []; let S = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    slopes.push((pts[j][1] - pts[i][1]) / (pts[j][0] - pts[i][0]));
    S += Math.sign(pts[j][1] - pts[i][1]);
  }
  slopes.sort((a, b) => a - b);
  const v = (n * (n - 1) * (2 * n + 5)) / 18;
  const z = S === 0 ? 0 : (S - Math.sign(S)) / Math.sqrt(v);
  const c = 1.96 * Math.sqrt(v);
  const lo = slopes[Math.max(0, Math.round((slopes.length - c) / 2) - 1)];
  const hi = slopes[Math.min(slopes.length - 1, Math.round((slopes.length + c) / 2))];
  return { slope: median(slopes) * 10, lo: lo * 10, hi: hi * 10, p: 2 * (1 - phi(Math.abs(z))) };
}

export function makeCell({ id, seed, mean, slopeDec, noise, missing = [], period = [2001, 2024], verdict, reasons = [], breakFlag = false, tags = [], sixTuple = true }) {
  const rand = rng(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
  const phases = ['neutral', 'nino', 'nina'];
  const series = [];
  for (let y = period[0]; y <= period[1]; y++) {
    const value = missing.includes(y) ? null : r(Math.max(0, mean + (slopeDec / 10) * (y - 2012.5) + noise * gauss()), 1);
    series.push({ year: y, value, anomaly: null, enso: phases[Math.floor(rand() * 3)] });
  }
  const valid = series.filter((p) => p.value !== null);
  const m = valid.reduce((a, p) => a + p.value, 0) / valid.length;
  for (const p of series) p.anomaly = p.value === null ? null : r(p.value - m, 1);
  const pts = (a, b) => valid.filter((p) => p.year >= a && p.year <= b).map((p) => [p.year, p.value]);
  const incomplete = verdict === 'incompleta';
  const base = incomplete ? null : trend(pts(...period));
  const footprint = [];
  if (!incomplete) for (let a = period[0]; a <= period[1]; a++) for (let b = a + 9; b <= period[1]; b++) {
    const t = trend(pts(a, b));
    const row = [a, b, t ? r(t.slope, 2) : null, t ? r(t.p) : null];
    footprint.push(sixTuple ? [...row, t ? r(t.lo, 2) : null, t ? r(t.hi, 2) : null] : row);
  }
  const indicator = {
    units: 'mm/2 meses',
    series,
    statistics: base && { method: 'Theil-Sen + Mann-Kendall', mk_variant: 'original', lag1_autocorr: 0.08, slope_per_decade: r(base.slope, 2), intercept: null, ci_95: [r(base.lo, 2), r(base.hi, 2)], p_value: r(base.p), adjusted_p_fdr: r(Math.min(1, base.p * 5)) },
    window_results: Object.fromEntries(footprint.map(t => [`${t[0]}-${t[1]}`, { ci_95: [t[4] ?? null, t[5] ?? null], verdict: 'limitada', verdict_reasons: ['mock_window_result'] }])),
    footprint,
    enso_test: base && { slope_without_strong_enso: r(base.slope * 0.8, 2), p_without_strong_enso: r(Math.min(1, base.p * 2)), slope_oni_removed: r(base.slope * 0.9, 2), p_oni_removed: r(Math.min(1, base.p * 1.5)), survives: true },
    break_2014: { pettitt_year: breakFlag ? 2014 : 2009, p: breakFlag ? 0.03 : 0.41, flag: breakFlag },
    verdict,
    verdict_reasons: reasons,
    narrative: { es: 'Texto de prueba (mock).', en: 'Mock narrative.', generated_by: 'template' },
    limitations: ['Celda de unos 11 km: no ve microclimas de ladera.'],
    tags,
  };
  const secondary_variables = id === 'N1345W08815' ? [{ key: 'T2M', label: { es: 'Temperatura (simulada)', en: 'Temperature (simulated)' }, source: 'NASA POWER — estructura de ejemplo, NO observaciones', doi: 'MOCK', period, data: { ...indicator, units: '°C', window_results: {}, footprint: [], series: series.map(p => ({ ...p, value: p.value === null ? null : r(25 + (p.value - mean) / 100, 2), anomaly: null })), statistics: null, verdict: 'sin_evidencia', verdict_reasons: [], narrative: null } }] : [];
  return { secondary_variables, id, name: null, monthly_climatology_mm: [8, 5, 12, 45, 190, 290, 205, 215, 330, 250, 60, 15], has_canicula: true, indicators: { jul_aug_mm: indicator, may_oct_mm: indicator, annual_mm: indicator } };
}

export const MOCK_CELLS = [
  { id: 'N1345W08815', seed: 7, mean: 412, slopeDec: -18, noise: 55, verdict: 'limitada', reasons: ['fdr_no_significativo', 'huella_inestable'] },
  { id: 'N1335W08725', seed: 21, mean: 380, slopeDec: -45, noise: 30, verdict: 'limitada', reasons: ['posible_salto_2014'], breakFlag: true, missing: [2007] },
  { id: 'N1575W08795', seed: 3, mean: 520, slopeDec: 0, noise: 80, verdict: 'incompleta', missing: [2003, 2004, 2011, 2019] },
  { id: 'N1425W08905', seed: 11, mean: 450, slopeDec: 2, noise: 90, verdict: 'sin_evidencia', tags: ['alta_variabilidad'], sixTuple: false },
];

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = process.argv[2] ?? 'src/panel/__tests__/fixtures/data'; // public/data tiene los datos reales
  mkdirSync(join(out, 'cells'), { recursive: true });
  for (const spec of MOCK_CELLS) writeFileSync(join(out, 'cells', `${spec.id}.json`), JSON.stringify(makeCell(spec)));
  // Celda rota a propósito: Python escribe NaN si no se usa allow_nan=False, y JSON.parse lo rechaza.
  writeFileSync(join(out, 'cells', 'N0000W00000.json'), '{"id":"N0000W00000","indicators":{"jul_aug_mm":{"series":[{"year":2001,"value":NaN}]}}}');
  console.log(`Mocks escritos en ${out}/cells: ${MOCK_CELLS.map((c) => c.id).join(', ')} + N0000W00000 (rota)`);
}
