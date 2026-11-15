import type { EnsoPhase, Num, Period, SeriesPoint, Win } from './types';

export function median(xs: readonly number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export interface SenGeometry {
  from: number;
  to: number;
  at: (year: number) => number;
  /** Abanico entre las rectas de pendiente ic_bajo e ic_alto. Es el IC de la pendiente, no de los valores. */
  band: ((year: number) => [number, number]) | null;
}

/**
 * Recta de Sen para dibujar. Pivota en (mediana de años, mediana de valores) de los años válidos,
 * que es como scipy.stats.theilslopes define su intercepto. Así no depende de la convención
 * del campo `intercept` del JSON. No estima nada: la pendiente y el IC vienen del pipeline.
 */
export function senGeometry(
  series: readonly SeriesPoint[],
  slopeDec: Num,
  ci: readonly [Num, Num] | null,
  win: Win,
): SenGeometry | null {
  if (slopeDec === null) return null;
  const pts = series.filter((p) => p.value !== null && p.year >= win[0] && p.year <= win[1]);
  const mx = median(pts.map((p) => p.year));
  const my = median(pts.map((p) => p.value as number));
  if (mx === null || my === null) return null;
  const line = (s: number) => (year: number) => my + (s / 10) * (year - mx);
  const at = line(slopeDec);
  let band: SenGeometry['band'] = null;
  if (ci && ci[0] !== null && ci[1] !== null) {
    const lo = line(ci[0]);
    const hi = line(ci[1]);
    band = (year) => {
      const a = lo(year);
      const b = hi(year);
      return a <= b ? [a, b] : [b, a];
    };
  }
  return { from: win[0], to: win[1], at, band };
}

export interface ChartRow {
  year: number;
  value: Num;
  anomaly: Num;
  enso: EnsoPhase | null;
  sen: Num;
  band: [number, number] | null;
  winSen: Num;
}

/** Eje completo desde meta.period: un año ausente o con value:null queda como hueco, nunca como 0. */
export function buildChartRows(
  series: readonly SeriesPoint[],
  period: Period,
  base: SenGeometry | null,
  selected: SenGeometry | null,
): ChartRow[] {
  const byYear = new Map(series.map((p) => [p.year, p]));
  const rows: ChartRow[] = [];
  for (let year = period[0]; year <= period[1]; year++) {
    const p = byYear.get(year);
    const value = p && typeof p.value === 'number' && Number.isFinite(p.value) ? p.value : null;
    const inSel = selected !== null && year >= selected.from && year <= selected.to;
    rows.push({
      year,
      value,
      anomaly: p?.anomaly ?? null,
      enso: p?.enso ?? null,
      sen: base ? base.at(year) : null,
      band: base?.band ? base.band(year) : null,
      winSen: inSel ? selected.at(year) : null,
    });
  }
  return rows;
}

export const countValid = (rows: readonly ChartRow[]) => rows.filter((r) => r.value !== null).length;
