import { countryName, regionNames } from '../labels';
import { describe, expect, it } from 'vitest';
import { deriveScenario, lintRules, lookupCard, type DecisionRules } from '../decision';
import { eraCounts, expectedWindowCount, footprintLayout, indexFootprint, resolveWindow, summarize } from '../footprint';
import { fmtNum, fmtP } from '../format';
import { buildPassport, passportToMarkdown } from '../passport';
import { buildChartRows, countValid, median, senGeometry } from '../sen';
import { parsePanelUrl, patchSearch } from '../urlState';
import { VERDICT_UI, verdictNotices } from '../verdict';
import { VERDICTS, type CellDetail, type Meta } from '../types';
// @ts-expect-error módulo .mjs sin tipos (solo mocks)
import { MOCK_CELLS, makeCell } from '../mock/make-mock.mjs';

const cells: CellDetail[] = MOCK_CELLS.map((s: unknown) => makeCell(s));
const [limitada, salto, incompleta, variable] = cells;
const meta = {
  generated_at: '2026-11-15T05:40:00-06:00', pipeline_commit: 'abc1234', dataset: 'GPM IMERG Final Run, mensual, 0.1°, V07',
  dataset_doi: 'POR CONFIRMAR', period: [2001, 2024], bbox: { lat: [12.5, 18.5], lon: [-92.5, -83] }, n_cells: 4,
  indicators: ['may_oct_mm', 'jul_aug_mm', 'annual_mm'], thresholds: {}, calibration: null, aux_data: ['NOAA CPC ONI'],
  lenses: { agri: ['may_oct_mm', 'jul_aug_mm'], com: ['annual_mm'], ene: [] },
} as Meta;

describe('huella', () => {
  it('cuenta de ventanas del plan (4.4)', () => {
    expect(expectedWindowCount([2001, 2024], 10)).toBe(120);
    expect(expectedWindowCount([2001, 2024], 15)).toBe(55);
    expect(expectedWindowCount([2001, 2025], 10)).toBe(136);
    expect(expectedWindowCount([2001, 2025], 15)).toBe(66);
  });
  it('indexa 120 ventanas y 55 cuentan para el veredicto', () => {
    const idx = indexFootprint(limitada.indicators.jul_aug_mm!.footprint);
    expect(idx.size).toBe(120);
    expect([...idx.values()].filter((w) => w.countsForVerdict)).toHaveLength(55);
  });
  it('todas las ventanas de 15+ años cruzan 2014; solo 13 quedan en una era', () => {
    const idx = indexFootprint(limitada.indicators.jul_aug_mm!.footprint);
    expect(eraCounts(idx)).toEqual({ trmm: 10, gpm: 3, cruza: 107 });
    expect([...idx.values()].filter((w) => w.countsForVerdict && w.era !== 'cruza')).toHaveLength(0);
  });
  it('geometría triangular 15 × 15', () => {
    const { starts, ends } = footprintLayout([2001, 2024]);
    expect([starts[0], starts.at(-1), starts.length]).toEqual([2001, 2015, 15]);
    expect([ends[0], ends.at(-1), ends.length]).toEqual([2024, 2010, 15]);
  });
  it('ventana inexistente cae al periodo base y avisa', () => {
    const idx = indexFootprint(limitada.indicators.jul_aug_mm!.footprint);
    expect(resolveWindow(idx, [2001, 2016], [2001, 2024])).toMatchObject({ isBase: false, requestedMissing: false });
    expect(resolveWindow(idx, [2001, 2005], [2001, 2024])).toMatchObject({ isBase: true, requestedMissing: true });
    expect(resolveWindow(idx, null, [2001, 2024]).window?.key).toBe('2001-2024');
  });
  it('acepta tuplas de 4 y de 6 valores, y descarta las rotas', () => {
    const idx = indexFootprint([[2001, 2010, -5.1, 0.72], [2001, 2011, -8, 0.04, -15, -1], [2005, 2001, 1, 1], null as never]);
    expect(idx.size).toBe(2);
    expect(idx.get('2001-2010')).toMatchObject({ ciLo: null, significant: false, sign: -1 });
    expect(idx.get('2001-2011')).toMatchObject({ ciLo: -15, ciHi: -1, significant: true });
  });
  it('celda incompleta: huella vacía sin lanzar', () => {
    expect(indexFootprint(incompleta.indicators.jul_aug_mm!.footprint).size).toBe(0);
    expect(indexFootprint(undefined).size).toBe(0);
    expect(summarize(new Map(), -1).signAgreement).toBeNull();
  });
});

describe('serie y nulos', () => {
  it('la recta pasa por las medianas y tiene la pendiente del JSON', () => {
    const d = limitada.indicators.jul_aug_mm!;
    const g = senGeometry(d.series, d.statistics!.slope_per_decade, d.statistics!.ci_95, [2001, 2024])!;
    expect(g.at(2012.5)).toBeCloseTo(median(d.series.map((p) => p.value as number))!, 6);
    expect(g.at(2022.5) - g.at(2012.5)).toBeCloseTo(d.statistics!.slope_per_decade!, 6);
    const [lo, hi] = g.band!(2024);
    expect(lo).toBeLessThanOrEqual(g.at(2024));
    expect(hi).toBeGreaterThanOrEqual(g.at(2024));
    expect(g.band!(2012.5)[1] - g.band!(2012.5)[0]).toBeCloseTo(0, 6); // el abanico se cierra en el pivote
  });
  it('un año faltante queda null, nunca 0, venga como null o ausente', () => {
    const d = salto.indicators.jul_aug_mm!;
    const rows = buildChartRows(d.series, [2001, 2024], null, null);
    expect(rows).toHaveLength(24);
    expect(rows.find((r) => r.year === 2007)!.value).toBeNull();
    expect(countValid(rows)).toBe(23);
    const sinFila = buildChartRows(d.series.filter((p) => p.year !== 2010), [2001, 2024], null, null);
    expect(sinFila.find((r) => r.year === 2010)!.value).toBeNull();
    expect(sinFila.some((r) => r.value === 0)).toBe(false);
  });
  it('sin estadísticas no hay recta', () => {
    expect(senGeometry(incompleta.indicators.jul_aug_mm!.series, null, null, [2001, 2024])).toBeNull();
    expect(senGeometry([], -5, null, [2001, 2024])).toBeNull();
  });
  it('formato: null es raya, no 0', () => {
    expect(fmtNum(null)).toBe('—');
    expect(fmtNum(Number.NaN)).toBe('—');
    expect(fmtP(0.0004)).toBe('< 0.001');
  });
});

describe('URL', () => {
  const deep = '?cell=N1345W08815&ind=jul_aug_mm&win=2001-2016&tour=1';
  it('enlace profundo del criterio de aceptación', () => {
    expect(parsePanelUrl(deep)).toEqual({ cell: 'N1345W08815', ind: 'jul_aug_mm', win: [2001, 2016], enso: false, lang: 'es', lens: 'agri', tour: 1 });
  });
  it('entradas basura no rompen', () => {
    expect(parsePanelUrl('?cell=<script>&ind=x&win=2020-2001&tour=99&lens=zzz')).toEqual({ cell: null, ind: 'may_oct_mm', win: null, enso: false, lang: 'es', lens: 'agri', tour: 0 });
  });
  it('escribir conserva los parámetros de otros roles', () => {
    const next = patchSearch(`${deep}&layer=verdict&case=2`, { win: [2004, 2024] });
    expect(next).toContain('win=2004-2024');
    expect(next).toContain('layer=verdict');
    expect(next).toContain('case=2');
    expect(patchSearch(next, { win: null })).not.toContain('win=');
    expect(parsePanelUrl(patchSearch(deep, { enso: true, tour: 0 }))).toMatchObject({ enso: true, tour: 0, win: [2001, 2016] });
  });
});

describe('veredictos', () => {
  it('los cuatro veredictos del contrato tienen UI', () => {
    for (const v of VERDICTS) expect(VERDICT_UI[v].label.es.length).toBeGreaterThan(0);
  });
  it('limitada lleva siempre "Señal débil, no confirmada"', () => {
    expect(VERDICT_UI.limitada.caveat!.es).toBe('Señal débil, no confirmada');
    expect(verdictNotices(limitada, 'jul_aug_mm', limitada.indicators.jul_aug_mm!, 'es')[0]).toEqual({ kind: 'caveat', text: 'Señal débil, no confirmada' });
  });
  it('break_2014.flag muestra el aviso instrumental', () => {
    const kinds = (c: CellDetail) => verdictNotices(c, 'jul_aug_mm', c.indicators.jul_aug_mm!, 'es').map((n) => n.kind);
    expect(kinds(salto)).toContain('break_2014');
    expect(kinds(limitada)).not.toContain('break_2014');
  });
  it('aviso de canícula solo en jul_aug_mm y solo donde no aplica', () => {
    const caribe = { ...limitada, has_canicula: false };
    expect(verdictNotices(caribe, 'jul_aug_mm', caribe.indicators.jul_aug_mm!, 'es').map((n) => n.kind)).toContain('canicula');
    expect(verdictNotices(caribe, 'annual_mm', caribe.indicators.annual_mm!, 'es').map((n) => n.kind)).not.toContain('canicula');
  });
});

describe('tarjetas', () => {
  const card = { questions: { es: ['¿Cuánta humedad retiene el suelo de la parcela?'], en: ['How much moisture does the plot soil retain?'] }, missing_local_data: { es: ['Textura del suelo'], en: ['Soil texture'] } };
  const rules: DecisionRules = { agri: { baja: { consistente: card, default: card } }, ene: { pending: true } };
  it('escenario sale de datos ya calculados', () => {
    expect(deriveScenario(-18.4, 'limitada')).toBe('baja');
    expect(deriveScenario(12, 'consistente')).toBe('alza');
    expect(deriveScenario(2, 'sin_evidencia', ['alta_variabilidad'])).toBe('alta_variabilidad');
    expect(deriveScenario(-3, 'incompleta')).toBeNull();
    expect(deriveScenario(null, 'sin_evidencia')).toBeNull();
    expect(deriveScenario(variable.indicators.jul_aug_mm!.statistics!.slope_per_decade, 'sin_evidencia', variable.indicators.jul_aug_mm!.tags)).toBe('alta_variabilidad');
  });
  it('busca con respaldo y Energía queda pendiente', () => {
    expect(lookupCard(rules, 'agri', 'baja', 'limitada').kind).toBe('card');
    expect(lookupCard(rules, 'agri', 'alza', 'limitada').kind).toBe('none');
    expect(lookupCard(rules, 'ene', 'baja', 'limitada').kind).toBe('pending');
    expect(lookupCard(rules, 'com', 'baja', 'limitada').kind).toBe('pending');
  });
  it('el lint detecta prescripciones y frases que no son pregunta', () => {
    expect(lintRules(rules)).toEqual([]);
    const mala: DecisionRules = { agri: { baja: { default: { questions: { es: ['Se recomienda adelantar la siembra.'], en: ['You should plant earlier?'] }, missing_local_data: { es: [], en: [] } } } } };
    expect(lintRules(mala)).toHaveLength(3);
  });
});

describe('pasaporte', () => {
  const input = { cell: limitada, gridRow: null, meta, ind: 'jul_aug_mm' as const, win: [2001, 2016] as const, lang: 'es' as const, deepLink: 'https://example.org/?cell=N1345W08815', now: new Date('2026-11-15T12:00:00Z') };
  it('copia las cifras del JSON sin tocarlas', () => {
    const p = buildPassport(input)!;
    expect(p.statistics).toBe(limitada.indicators.jul_aug_mm!.statistics);
    expect(p.selected_window).toMatchObject({ start: 2001, end: 2016 });
    expect(p.completeness).toEqual({ valid_years: 24, total_years: 24 });
    expect(JSON.parse(JSON.stringify(p)).verdict).toBe('limitada');
  });
  it('el Markdown lleva el aviso obligatorio, la ventana y la procedencia', () => {
    const md = passportToMarkdown(buildPassport(input)!, 'es');
    expect(md).toContain('Señal débil, no confirmada');
    expect(md).toContain('Ventana seleccionada: 2001–2016');
    expect(md).toContain('pipeline `abc1234`');
    expect(md).toContain('no disponible'); // calibración null
    expect(md).not.toMatch(/NaN|undefined|null/);
  });
  it('celda incompleta: pasaporte sin estadísticas y sin romper', () => {
    const md = passportToMarkdown(buildPassport({ ...input, cell: incompleta, win: null })!, 'en');
    expect(md).toContain('Incomplete data');
    expect(md).toContain('20/24 valid years');
    expect(md).not.toMatch(/NaN|undefined|null/);
  });
  it('indicador ausente devuelve null', () => {
    expect(buildPassport({ ...input, cell: { ...limitada, indicators: {} } })).toBeNull();
  });
});

import { readFileSync } from 'node:fs';
describe('archivos de referencia mock', () => {
  const rd = (f: string) => JSON.parse(readFileSync(`src/panel/__tests__/fixtures/data/${f}`, 'utf8'));
  it('decision_rules.json pasa el lint', () => expect(lintRules(rd('decision_rules.json'))).toEqual([]));
  it('tour.json tiene 4 pasos con anclas conocidas', () => {
    const t = rd('tour.json');
    expect(t.steps).toHaveLength(4);
    expect(t.steps.map((s: { anchor: string }) => s.anchor)).toEqual(['series', 'verdict', 'footprint', 'cards']);
  });
});


describe('regionNames', () => {
  const mk = (code: string, n: number) => Array.from({ length: n }, () => ({ country: code }));
  it('lista los países del grid, del más al menos numeroso', () => {
    const grid = [...mk('SLV', 169), ...mk('HND', 939), ...mk('GTM', 917)];
    expect(regionNames(grid, 'es')).toBe('Honduras, Guatemala y El Salvador');
    expect(regionNames(grid, 'en')).toBe('Honduras, Guatemala and El Salvador');
  });
  it('conoce los cuatro países de Centroamérica que se suman y no rompe con un código ajeno', () => {
    expect(regionNames([...mk('NIC', 5), ...mk('PAN', 4), ...mk('CRI', 3), ...mk('BLZ', 2)], 'es')).toBe('Nicaragua, Panamá, Costa Rica y Belice');
    expect(regionNames([...mk('XXX', 2), ...mk('HND', 3)], 'en')).toBe('Honduras and XXX');
    expect(regionNames(mk('HND', 1), 'es')).toBe('Honduras');
    expect(regionNames([], 'es')).toBe('');
  });
});

describe('countryName', () => {
  it('da el nombre de los 7 países en español e inglés (el panel de celda no debe mostrar el código ISO)', () => {
    const es = { BLZ: 'Belice', GTM: 'Guatemala', SLV: 'El Salvador', HND: 'Honduras', NIC: 'Nicaragua', CRI: 'Costa Rica', PAN: 'Panamá' };
    for (const [code, name] of Object.entries(es)) expect(countryName(code, 'es')).toBe(name);
    expect(countryName('BLZ', 'en')).toBe('Belize');
    expect(countryName('PAN', 'en')).toBe('Panama');
    expect(countryName('XXX', 'es')).toBe('XXX');
  });
});
