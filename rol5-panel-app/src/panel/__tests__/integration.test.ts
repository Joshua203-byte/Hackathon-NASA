import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateCell, validateMeta } from '../contract';
import { selectIndicator } from '../lenses';
import { indexFootprint } from '../footprint';
import { lookupCard } from '../decision';
import { buildPassport, passportToMarkdown } from '../passport';
import { pairedSeries } from '../components/SecondaryVariables';
import { saveValidation, validationResult } from '../validation';
import type { CellDetail, Meta } from '../types';

const read = (file: string) => JSON.parse(readFileSync(`public/data/${file}`, 'utf8'));
const cell: CellDetail = read('cells/N1345W08815.json');
const meta: Meta = read('meta.json');
const d = cell.indicators.jul_aug_mm!;
describe('integration contracts and scientific boundaries', () => {
  it('accepts shipped fixtures and rejects mismatched ids and duplicate years', () => {
    expect(() => validateMeta(meta)).not.toThrow();
    expect(() => validateCell(cell, cell.id)).not.toThrow();
    expect(() => validateCell(cell, 'N0000W00000')).toThrow();
    const copy = structuredClone(cell); copy.indicators.jul_aug_mm!.series.push(copy.indicators.jul_aug_mm!.series[0]);
    expect(() => validateCell(copy, cell.id)).toThrow();
    expect(() => validateMeta({ ...meta, data_kind: 'observed' })).toThrow();
  });
  it('communities uses annual rainfall; agriculture falls back when canicula does not apply', () => {
    expect(selectIndicator('com', 'jul_aug_mm', meta, cell)).toBe('annual_mm');
    expect(selectIndicator('agri', 'jul_aug_mm', meta, { ...cell, has_canicula: false })).toBe('may_oct_mm');
    expect(selectIndicator('ene', 'annual_mm', meta, cell)).toBe('annual_mm');
  });
  it('uses pipeline window verdict and CI, never infers evidence from p alone', () => {
    const index = indexFootprint([[2001, 2016, -5, 0.01]], { '2001-2016': { ci_95: [-10, -1], verdict: 'limitada', verdict_reasons: ['huella_inestable'] } });
    expect(index.get('2001-2016')).toMatchObject({ ciLo: -10, ciHi: -1, result: { verdict: 'limitada' } });
    expect(indexFootprint([[2001, 2016, -5, 0.01]]).get('2001-2016')?.result).toBeUndefined();
  });
  it('both weak verdicts use cautious agriculture questions for each sign', () => {
    const rules = read('decision_rules.json');
    for (const sign of ['baja', 'alza'] as const) {
      const limited = lookupCard(rules, 'agri', sign, 'limitada');
      const noEvidence = lookupCard(rules, 'agri', sign, 'sin_evidencia');
      expect(noEvidence).toEqual(limited);
      expect(noEvidence).not.toEqual(lookupCard(rules, 'agri', sign, 'consistente'));
    }
  });
  it('pairs secondary observations by year, excluding missing values', () => {
    const other = { ...d, series: [{ year: 2001, value: null, anomaly: null, enso: null }, { year: 2003, value: 4, anomaly: null, enso: null }] };
    expect(pairedSeries(d, other)).toEqual([{ year: 2003, rain: d.series.find(p => p.year === 2003)!.value, other: 4 }]);
  });
  it('exports a selected window verdict, CI and simulated provenance in both formats', () => {
    const passport = buildPassport({ cell, meta, gridRow: null, ind: 'jul_aug_mm', win: [2001, 2016], lang: 'es', deepLink: 'http://localhost' })!;
    expect(passport.data_kind).toBe('mock');
    expect(passport.selected_window?.verdict).toBe('limitada');
    const markdown = passportToMarkdown(passport, 'es');
    expect(markdown).toContain('DATOS SIMULADOS');
    expect(markdown).toContain('Resultado simulado');
  });
  it('scores and appends anonymous comprehension results without replacing earlier records', () => {
    let value: string | null = null;
    const storage = { getItem: () => value, setItem: (_: string, v: string) => { value = v; } };
    const result = validationResult(cell.id, 'annual_mm', ['uncertain', 'sensitivity']);
    expect(result.score).toBe(2);
    expect(validationResult(cell.id, 'annual_mm', ['confirmed', 'forecast']).score).toBe(0);
    saveValidation(storage, result); saveValidation(storage, result);
    expect(JSON.parse(value!)).toHaveLength(2);
  });
});
