import type { FootprintTuple, Num, Period, Win } from './types';

export const MIN_LEN_DRAW = 10; // ventanas que trae el JSON (4.4)
export const MIN_LEN_VERDICT = 15; // ventanas que cuentan para el veredicto (4.4)
export const GPM_FIRST_YEAR = 2014; // primer año de la era GPM (4.10)
export const ALPHA = 0.05;

export type Era = 'trmm' | 'gpm' | 'cruza';

export interface FpWindow {
  key: string;
  start: number;
  end: number;
  len: number;
  slope: Num;
  p: Num;
  ciLo: Num;
  ciHi: Num;
  sign: -1 | 0 | 1 | null;
  /** p < 0.05 sin corregir: las ventanas se solapan, no es una prueba formal. */
  significant: boolean;
  countsForVerdict: boolean;
  era: Era;
}

export const winKey = (start: number, end: number) => `${start}-${end}`;
const num = (v: unknown): Num => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function eraOf(start: number, end: number): Era {
  if (end < GPM_FIRST_YEAR) return 'trmm';
  if (start >= GPM_FIRST_YEAR) return 'gpm';
  return 'cruza';
}

export function toWindow(t: FootprintTuple): FpWindow {
  const [start, end] = t;
  const slope = num(t[2]);
  const p = num(t[3]);
  const len = end - start + 1;
  return {
    key: winKey(start, end),
    start,
    end,
    len,
    slope,
    p,
    ciLo: num(t[4]),
    ciHi: num(t[5]),
    sign: slope === null ? null : (Math.sign(slope) as -1 | 0 | 1),
    significant: p !== null && p < ALPHA,
    countsForVerdict: len >= MIN_LEN_VERDICT,
    era: eraOf(start, end),
  };
}

/** Se construye una vez por celda e indicador (useMemo). Tuplas mal formadas se descartan. */
export function indexFootprint(fp: readonly FootprintTuple[] | null | undefined): Map<string, FpWindow> {
  const map = new Map<string, FpWindow>();
  for (const t of fp ?? []) {
    if (!Array.isArray(t) || !Number.isInteger(t[0]) || !Number.isInteger(t[1]) || t[1] <= t[0]) continue;
    const w = toWindow(t);
    map.set(w.key, w);
  }
  return map;
}

/** 120 con 2001–2024 y minLen 10; 55 con minLen 15; 136 y 66 con 2001–2025. */
export function expectedWindowCount(period: Period, minLen: number): number {
  const n = period[1] - period[0] + 1 - minLen + 1;
  return n > 0 ? (n * (n + 1)) / 2 : 0;
}

export interface ResolvedWindow {
  window: FpWindow | null;
  isBase: boolean;
  /** La URL pedía una ventana que no existe en la huella: se cae al periodo base y se avisa. */
  requestedMissing: boolean;
}

export function resolveWindow(index: Map<string, FpWindow>, win: Win | null, period: Period): ResolvedWindow {
  const base = index.get(winKey(period[0], period[1])) ?? null;
  if (!win || (win[0] === period[0] && win[1] === period[1])) {
    return { window: base, isBase: true, requestedMissing: false };
  }
  const w = index.get(winKey(win[0], win[1]));
  return w
    ? { window: w, isBase: false, requestedMissing: false }
    : { window: base, isBase: true, requestedMissing: true };
}

/** Columnas = año de inicio; filas = año de fin (la más reciente arriba). */
export function footprintLayout(period: Period, minLen = MIN_LEN_DRAW) {
  const starts: number[] = [];
  const ends: number[] = [];
  for (let y = period[0]; y <= period[1] - minLen + 1; y++) starts.push(y);
  for (let y = period[1]; y >= period[0] + minLen - 1; y--) ends.push(y);
  return { starts, ends };
}

/** Solo para la prueba de coherencia contra grid.json. Los valores oficiales son los del pipeline. */
export function summarize(index: Map<string, FpWindow>, baseSign: -1 | 0 | 1 | null) {
  let n = 0;
  let same = 0;
  let sig = 0;
  for (const w of index.values()) {
    if (!w.countsForVerdict || w.sign === null) continue;
    n++;
    if (baseSign !== null && w.sign === baseSign) {
      same++;
      if (w.significant) sig++;
    }
  }
  return { n, signAgreement: n ? same / n : null, sigFraction: n ? sig / n : null };
}

export function eraCounts(index: Map<string, FpWindow>) {
  const c = { trmm: 0, gpm: 0, cruza: 0 };
  for (const w of index.values()) c[w.era]++;
  return c;
}
