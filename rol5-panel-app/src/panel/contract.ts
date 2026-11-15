import { INDICATORS, VERDICTS, type CellDetail, type Meta } from './types';

const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const finite = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const pair = (v: unknown): v is [number, number] => Array.isArray(v) && v.length === 2 && v.every(finite) && v[0] <= v[1];
export function validateMeta(v: unknown): asserts v is Meta {
  if (!object(v) || !pair(v.period) || !v.period.every(Number.isInteger) || !object(v.bbox) || !pair(v.bbox.lat) || !pair(v.bbox.lon) || !object(v.lenses) || !['agri', 'com', 'ene'].every(k => Array.isArray((v.lenses as Record<string, unknown>)[k])) || typeof v.dataset !== 'string') throw new Error('Invalid meta.json contract');
  if (v.data_kind === 'observed' && (!v.pipeline_commit || v.pipeline_commit === 'MOCK' || typeof v.dataset_doi !== 'string' || !v.dataset_doi || /CONFIRMAR|MOCK/i.test(v.dataset_doi))) throw new Error('Observed data require dataset DOI and pipeline commit');
}
export function validateCell(v: unknown, expectedId: string): asserts v is CellDetail {
  if (!object(v) || v.id !== expectedId || !object(v.indicators) || !Array.isArray(v.monthly_climatology_mm) || v.monthly_climatology_mm.length !== 12) throw new Error('Invalid cell identity or monthly climatology');
  for (const key of INDICATORS) {
    const d = v.indicators[key]; if (d === undefined) continue;
    if (!object(d) || !VERDICTS.includes(d.verdict as never) || !Array.isArray(d.series) || !Array.isArray(d.footprint) || !Array.isArray(d.verdict_reasons) || !Array.isArray(d.limitations)) throw new Error(`Invalid indicator: ${key}`);
    const years = new Set();
    for (const point of d.series) {
      if (!object(point) || !Number.isInteger(point.year) || years.has(point.year) || !(point.value === null || finite(point.value))) throw new Error(`Invalid or repeated year: ${key}`);
      years.add(point.year);
    }
    if (d.window_results !== undefined) {
      if (!object(d.window_results)) throw new Error(`Invalid window results: ${key}`);
      for (const [window, result] of Object.entries(d.window_results)) {
        if (!/^\d{4}-\d{4}$/.test(window) || !object(result) || !VERDICTS.includes(result.verdict as never) || !Array.isArray(result.ci_95) || result.ci_95.length !== 2 || !result.ci_95.every(x => x === null || finite(x)) || !Array.isArray(result.verdict_reasons)) throw new Error(`Invalid window result: ${window}`);
      }
    }
  }
  if (v.secondary_variables !== undefined) {
    if (!Array.isArray(v.secondary_variables)) throw new Error('Invalid secondary variables');
    for (const secondary of v.secondary_variables) {
      if (!object(secondary) || typeof secondary.key !== 'string' || !object(secondary.label) || typeof secondary.label.es !== 'string' || typeof secondary.label.en !== 'string' || typeof secondary.source !== 'string' || typeof secondary.doi !== 'string' || !pair(secondary.period)) throw new Error('Invalid secondary variable metadata');
      const data = secondary.data;
      if (!object(data) || !(data.verdict === null || VERDICTS.includes(data.verdict as never))) throw new Error('Invalid secondary variable verdict');
      // verdict null = sin veredicto del motor; el resto del indicador se valida igual que la lluvia.
      validateCell({ id: expectedId, monthly_climatology_mm: v.monthly_climatology_mm, indicators: { annual_mm: { ...data, verdict: data.verdict ?? 'sin_evidencia' } } }, expectedId);
    }
  }
}
