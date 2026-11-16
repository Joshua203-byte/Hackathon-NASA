// Guía de primera visita (docs/12, T3.1): cuándo aparece y qué lugares ofrece. Todo sale de los datos.
const SEEN = 'altaris-guia-vista';
/** Mismos enlaces profundos que la intro: quien llega a algo concreto no espera una guía. */
const DEEP = ['cell', 'case', 'mirror', 'layer', 'ind', 'lens', 'win', 'tour', 'dataset'];

export function shouldShowGuide(): boolean {
  const q = new URLSearchParams(window.location.search);
  const force = q.get('guide');
  if (force === '0') return false;
  if (force === '1') return true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  if (DEEP.some(k => q.has(k))) return false;
  if (navigator.webdriver) return false; // pruebas automáticas: sin guía salvo ?guide=1
  try { if (window.localStorage.getItem(SEEN) === '1') return false; } catch { /* sin almacenamiento: se muestra */ }
  return true;
}

export function markGuideSeen(): void {
  try { window.localStorage.setItem(SEEN, '1'); } catch { /* sin almacenamiento */ }
}

type Cell = { country: string; lat: number; lon: number };

/** Países que realmente trae grid.json, del más al menos numeroso (el mismo orden que regionNames). */
export function countryCodes(cells: ReadonlyArray<{ country: string }>): string[] {
  const n = new Map<string, number>();
  for (const c of cells) n.set(c.country, (n.get(c.country) ?? 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([code]) => code);
}

/** Límites [[oeste, sur], [este, norte]] de las celdas de un país; las celdas miden 0,1°. */
export function countryBounds(cells: ReadonlyArray<Cell>, code: string): [[number, number], [number, number]] | null {
  const own = cells.filter(c => c.country === code);
  if (own.length === 0) return null;
  const lats = own.map(c => c.lat), lons = own.map(c => c.lon);
  return [[Math.min(...lons) - 0.05, Math.min(...lats) - 0.05], [Math.max(...lons) + 0.05, Math.max(...lats) + 0.05]];
}
