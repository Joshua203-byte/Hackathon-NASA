import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { INDICATORS, type IndicatorKey, type Lang, type Lens, type Win } from './types';

/** Parámetros de la sección 3.3 que usa el panel. Los demás (layer, case) se conservan intactos. */
export interface PanelUrlState {
  cell: string | null;
  ind: IndicatorKey;
  /** null = periodo base completo. */
  win: Win | null;
  /** true = mostrar la tendencia sin años ENSO fuertes (enso=on). */
  enso: boolean;
  lang: Lang;
  lens: Lens;
  /** 0 = cerrado; 1..4 = paso del recorrido (tour=1 abre en el paso 1). */
  tour: number;
}

const CELL_RE = /^[NS]\d{4}[EW]\d{5}$/;
const WIN_RE = /^(\d{4})-(\d{4})$/;
export const TOUR_STEPS = 4;

export function parseWin(raw: string | null): Win | null {
  const m = raw ? WIN_RE.exec(raw) : null;
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return a < b ? [a, b] : null;
}

/** Función pura y síncrona: se puede llamar antes del primer render. Nunca lanza. */
export function parsePanelUrl(search: string): PanelUrlState {
  const q = new URLSearchParams(search);
  const cell = q.get('cell');
  const ind = q.get('ind') as IndicatorKey | null;
  const lens = q.get('lens');
  const tour = Number(q.get('tour') ?? 0);
  return {
    cell: cell && CELL_RE.test(cell) ? cell : null,
    ind: ind && INDICATORS.includes(ind) ? ind : 'may_oct_mm',
    win: parseWin(q.get('win')),
    enso: q.get('enso') === 'on',
    lang: q.get('lang') === 'en' ? 'en' : 'es',
    lens: lens === 'com' || lens === 'ene' ? lens : 'agri',
    tour: Number.isInteger(tour) && tour >= 1 && tour <= TOUR_STEPS ? tour : 0,
  };
}

/** Aplica un cambio sobre el query actual sin tocar los parámetros de otros roles. */
export function patchSearch(search: string, patch: Partial<PanelUrlState>): string {
  const q = new URLSearchParams(search);
  const put = (k: string, v: string | null) => (v === null ? q.delete(k) : q.set(k, v));
  if ('cell' in patch) put('cell', patch.cell ?? null);
  if ('ind' in patch && patch.ind) put('ind', patch.ind);
  if ('win' in patch) put('win', patch.win ? `${patch.win[0]}-${patch.win[1]}` : null);
  if ('enso' in patch) put('enso', patch.enso ? 'on' : 'off');
  if ('lang' in patch && patch.lang) put('lang', patch.lang);
  if ('lens' in patch && patch.lens) put('lens', patch.lens);
  if ('tour' in patch) put('tour', String(patch.tour ?? 0));
  const s = q.toString();
  return s ? `?${s}` : '';
}

// --- Hook. Si Rol 4 ya tiene el suyo, se usa el suyo y este archivo queda solo con las funciones puras.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('popstate', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('popstate', cb);
  };
}
const getSearch = () => window.location.search;

export function usePanelUrl() {
  const search = useSyncExternalStore(subscribe, getSearch);
  const state = useMemo(() => parsePanelUrl(search), [search]);
  /** 'replace' para ventana, ENSO y recorrido; 'push' solo al cambiar de celda. */
  const set = useCallback((patch: Partial<PanelUrlState>, mode: 'replace' | 'push' = 'replace') => {
    const next = patchSearch(window.location.search, patch);
    if (next === window.location.search) return;
    const url = window.location.pathname + next + window.location.hash;
    if (mode === 'push') window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
    listeners.forEach((l) => l());
  }, []);
  return [state, set] as const;
}
