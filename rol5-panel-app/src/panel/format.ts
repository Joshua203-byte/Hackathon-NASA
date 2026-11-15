import type { Lang, Num } from './types';

const DASH = '—';

/** Un solo lugar para redondear. Los JSON exportados nunca pasan por aquí. */
export function fmtNum(n: Num | undefined, digits = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return DASH;
  return n.toFixed(digits).replace('-', '−');
}

export function fmtSigned(n: Num | undefined, digits = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return DASH;
  return (n > 0 ? '+' : '') + fmtNum(n, digits);
}

export function fmtP(p: Num | undefined): string {
  if (p === null || p === undefined || !Number.isFinite(p)) return DASH;
  return p < 0.001 ? '< 0.001' : p.toFixed(3);
}

export const slopeUnit = (lang: Lang) => (lang === 'es' ? 'mm/década' : 'mm/decade');

export function fmtSlope(n: Num | undefined, lang: Lang): string {
  const s = fmtSigned(n);
  return s === DASH ? s : `${s} ${slopeUnit(lang)}`;
}
