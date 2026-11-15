// Rol 4 · Mapa: funciones puras para pintar grid.json en MapLibre. Sin dependencias de MapLibre
// para poder probarlas en Node. Las expresiones siguen la especificación de estilos de MapLibre.
import { INDICATORS, VERDICTS, type GridCell, type IndicatorKey, type Verdict } from './types';

export const MAP_LAYERS = ['verdict', 'slope', 'stability', 'enso'] as const;
export type MapLayer = (typeof MAP_LAYERS)[number];

/** `?layer=` de la sección 3.3. Valor desconocido o ausente = veredicto. */
export function parseLayer(raw: string | null): MapLayer {
  return MAP_LAYERS.includes(raw as MapLayer) ? (raw as MapLayer) : 'verdict';
}

/** Lado de la celda IMERG en grados. Los centros vienen en x.x5. */
export const CELL_DEG = 0.1;

/** Color sin dato: nunca se pinta un faltante como si fuera cero. */
export const NO_DATA = '#c8c8c8';

/** Propiedad de la feature para un indicador y un campo de grid.json. */
export const prop = (ind: IndicatorKey, field: 'v' | 's' | 'a' | 'r') => `${ind}_${field}`;

type Props = Record<string, string | number | null>;
export interface CellFeature { type: 'Feature'; id: number; properties: Props; geometry: { type: 'Polygon'; coordinates: number[][][] } }

/** Cada celda pasa a un cuadrado de 0,1° con veredicto, pendiente, acuerdo de signo y r ENSO por indicador. */
export function gridToGeoJSON(cells: GridCell[]): { type: 'FeatureCollection'; features: CellFeature[] } {
  const h = CELL_DEG / 2;
  const r = (x: number) => Math.round(x * 1e4) / 1e4;
  return {
    type: 'FeatureCollection',
    features: cells.map((c, i) => {
      const properties: Props = { id: c.id, country: c.country };
      for (const ind of INDICATORS) {
        const g = c.ind[ind];
        properties[prop(ind, 'v')] = g?.verdict ?? null;
        properties[prop(ind, 's')] = g?.slope_dec ?? null;
        properties[prop(ind, 'a')] = g?.sign_agreement ?? null;
        properties[prop(ind, 'r')] = g?.enso_r ?? null;
      }
      const [w, e, s, n] = [r(c.lon - h), r(c.lon + h), r(c.lat - h), r(c.lat + h)];
      return { type: 'Feature', id: i, properties, geometry: { type: 'Polygon', coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] } };
    }),
  };
}

/** Límite simétrico para la pendiente: percentil 95 de |pendiente|, redondeado a un número legible. */
export function slopeLimit(cells: GridCell[], ind: IndicatorKey): number {
  const abs = cells.map(c => c.ind[ind]?.slope_dec).filter((v): v is number => typeof v === 'number' && Number.isFinite(v)).map(Math.abs).sort((a, b) => a - b);
  if (!abs.length) return 1;
  const p95 = abs[Math.min(abs.length - 1, Math.floor(abs.length * 0.95))];
  if (p95 <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(p95));
  return Math.ceil(p95 / mag) * mag;
}

export function hasEnso(cells: GridCell[], ind: IndicatorKey): boolean {
  return cells.some(c => typeof c.ind[ind]?.enso_r === 'number');
}

export function verdictCounts(cells: GridCell[], ind: IndicatorKey): Record<Verdict | 'none', number> {
  const out = { consistente: 0, limitada: 0, sin_evidencia: 0, incompleta: 0, none: 0 } as Record<Verdict | 'none', number>;
  for (const c of cells) out[c.ind[ind]?.verdict ?? 'none']++;
  return out;
}

// Paletas divergentes con punto medio claro; legibles con daltonismo (BrBG y PuOr de ColorBrewer).
export const SLOPE_RAMP = ['#8c510a', '#d8b365', '#f5f5f5', '#5ab4ac', '#01665e'] as const; // seco → húmedo
export const STABILITY_RAMP = ['#f7fbff', '#9ecae1', '#08519c'] as const; // 0 → 1
export const ENSO_RAMP = ['#b35806', '#f1a340', '#f7f7f7', '#998ec3', '#542788'] as const; // r −1 → +1

type Expr = unknown[];
const num = (key: string, then: Expr): Expr => ['case', ['==', ['typeof', ['get', key]], 'number'], then, NO_DATA];

/** Expresión de `fill-color` para la capa e indicador activos. */
export function fillColor(layer: MapLayer, ind: IndicatorKey, opts: { verdictColors: Record<Verdict, string>; slopeLimit: number }): Expr {
  if (layer === 'verdict') {
    return ['match', ['get', prop(ind, 'v')], ...VERDICTS.flatMap(v => [v, opts.verdictColors[v]]), NO_DATA];
  }
  if (layer === 'slope') {
    const L = opts.slopeLimit;
    return num(prop(ind, 's'), ['interpolate', ['linear'], ['get', prop(ind, 's')], -L, SLOPE_RAMP[0], -L / 2, SLOPE_RAMP[1], 0, SLOPE_RAMP[2], L / 2, SLOPE_RAMP[3], L, SLOPE_RAMP[4]]);
  }
  if (layer === 'stability') {
    return num(prop(ind, 'a'), ['interpolate', ['linear'], ['get', prop(ind, 'a')], 0, STABILITY_RAMP[0], 0.5, STABILITY_RAMP[1], 1, STABILITY_RAMP[2]]);
  }
  return num(prop(ind, 'r'), ['interpolate', ['linear'], ['get', prop(ind, 'r')], -1, ENSO_RAMP[0], -0.5, ENSO_RAMP[1], 0, ENSO_RAMP[2], 0.5, ENSO_RAMP[3], 1, ENSO_RAMP[4]]);
}
