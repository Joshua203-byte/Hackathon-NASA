// Estado sincronizado con la URL (sección 3.3). Rol 4 es dueño del estado global;
// este hook es la versión mínima para que el panel funcione y se puede reemplazar.
import { useCallback, useEffect, useState } from 'react';
import type { IndicatorKey, Lang, Lens } from './types';

export interface UrlState {
  cell: string | null;
  ind: IndicatorKey;
  win: [number, number] | null; // ventana elegida en la huella
  layer: string;
  enso: 'on' | 'off';
  lang: Lang;
  case: string | null;
  lens: Lens;
  tour: '0' | '1';
  cmp: string | null; // segunda celda para la vista espejo (parámetro añadido por Rol 5)
}

const IND: IndicatorKey[] = ['may_oct_mm', 'jul_aug_mm', 'annual_mm'];

export function parseUrl(search: string): UrlState {
  const q = new URLSearchParams(search);
  const ind = q.get('ind') as IndicatorKey;
  const w = q.get('win')?.match(/^(\d{4})-(\d{4})$/);
  const lens = q.get('lens');
  return {
    cell: q.get('cell'),
    ind: IND.includes(ind) ? ind : 'may_oct_mm',
    win: w ? [Number(w[1]), Number(w[2])] : null,
    layer: q.get('layer') ?? 'verdict',
    enso: q.get('enso') === 'on' ? 'on' : 'off',
    lang: q.get('lang') === 'en' ? 'en' : 'es',
    case: q.get('case'),
    lens: lens === 'com' || lens === 'ene' ? lens : 'agri',
    tour: q.get('tour') === '1' ? '1' : '0',
    cmp: q.get('cmp'),
  };
}

export function toSearch(s: UrlState): string {
  const q = new URLSearchParams();
  if (s.cell) q.set('cell', s.cell);
  q.set('ind', s.ind);
  if (s.win) q.set('win', `${s.win[0]}-${s.win[1]}`);
  q.set('layer', s.layer);
  q.set('enso', s.enso);
  q.set('lang', s.lang);
  if (s.case) q.set('case', s.case);
  q.set('lens', s.lens);
  q.set('tour', s.tour);
  if (s.cmp) q.set('cmp', s.cmp);
  return `?${q.toString()}`;
}

export function useUrlState(): [UrlState, (patch: Partial<UrlState>) => void] {
  const [state, setState] = useState<UrlState>(() => parseUrl(window.location.search));

  useEffect(() => {
    const onPop = () => setState(parseUrl(window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const update = useCallback((patch: Partial<UrlState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      window.history.replaceState(null, '', toSearch(next));
      return next;
    });
  }, []);

  return [state, update];
}

export function shareUrl(s: UrlState): string {
  return `${window.location.origin}${window.location.pathname}${toSearch(s)}`;
}
