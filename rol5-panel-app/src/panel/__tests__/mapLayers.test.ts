import { describe, expect, it } from 'vitest';
import { fillColor, gridToGeoJSON, hasEnso, parseLayer, prop, slopeLimit, verdictCounts, NO_DATA } from '../mapLayers';
import type { GridCell, GridIndicator } from '../types';

const gi = (o: Partial<GridIndicator>): GridIndicator => ({ mean: 1000, slope_dec: 0, ci95: null, p: null, p_fdr: null, sign_agreement: null, sig_fraction: null, enso_r: null, enso_p_fdr: null, valid_years: 24, verdict: 'sin_evidencia', ...o });
const cells: GridCell[] = [
  { id: 'N1345W08815', lat: 13.45, lon: -88.15, country: 'SLV', cluster: null, ind: { may_oct_mm: gi({ verdict: 'consistente', slope_dec: -42, sign_agreement: 0.95, enso_r: -0.6 }) } },
  { id: 'N1455W08905', lat: 14.55, lon: -89.05, country: 'GTM', cluster: null, ind: { may_oct_mm: gi({ verdict: 'limitada', slope_dec: 7.5 }) } },
  { id: 'N1555W08605', lat: 15.55, lon: -86.05, country: 'HND', cluster: null, ind: {} },
];

describe('mapa MapLibre (Rol 4)', () => {
  it('convierte cada celda en un cuadrado de 0,1° centrado en su punto', () => {
    const fc = gridToGeoJSON(cells);
    expect(fc.features).toHaveLength(3);
    const [ring] = fc.features[0].geometry.coordinates;
    expect(ring[0]).toEqual([-88.2, 13.4]);
    expect(ring[2]).toEqual([-88.1, 13.5]);
    expect(fc.features[0].properties[prop('may_oct_mm', 'v')]).toBe('consistente');
  });
  it('deja los faltantes como null, nunca como 0', () => {
    const p = gridToGeoJSON(cells).features[2].properties;
    expect(p[prop('may_oct_mm', 'v')]).toBeNull();
    expect(p[prop('may_oct_mm', 's')]).toBeNull();
    expect(verdictCounts(cells, 'may_oct_mm')).toMatchObject({ consistente: 1, limitada: 1, none: 1 });
  });
  it('acota la escala de pendiente con un número legible y detecta si hay ENSO', () => {
    expect(slopeLimit(cells, 'may_oct_mm')).toBe(50);
    expect(slopeLimit([], 'annual_mm')).toBe(1);
    expect(hasEnso(cells, 'may_oct_mm')).toBe(true);
    expect(hasEnso(cells, 'annual_mm')).toBe(false);
  });
  it('pinta veredicto con su color y sin dato en gris; capa desconocida = veredicto', () => {
    const colors = { consistente: '#1', limitada: '#2', sin_evidencia: '#3', incompleta: '#4' };
    const e = fillColor('verdict', 'jul_aug_mm', { verdictColors: colors, slopeLimit: 10 });
    expect(e).toEqual(['match', ['get', 'jul_aug_mm_v'], 'consistente', '#1', 'limitada', '#2', 'sin_evidencia', '#3', 'incompleta', '#4', NO_DATA]);
    expect(JSON.stringify(fillColor('slope', 'annual_mm', { verdictColors: colors, slopeLimit: 10 }))).toContain(NO_DATA);
    expect(parseLayer('slope')).toBe('slope');
    expect(parseLayer('globo')).toBe('verdict');
    expect(parseLayer(null)).toBe('verdict');
  });
});
