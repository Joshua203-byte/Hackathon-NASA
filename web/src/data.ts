import { useEffect, useState } from 'react';
import type { CellDetail, DecisionRules, Glossary, Grid, Meta, Tour } from './types';

const BASE = `${import.meta.env.BASE_URL}data/`;
const cache = new Map<string, Promise<unknown>>();

export function fetchJson<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    cache.set(
      path,
      fetch(BASE + path).then((r) => {
        if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
        return r.json();
      }),
    );
  }
  return cache.get(path) as Promise<T>;
}

export type Loadable<T> = { status: 'loading' } | { status: 'error'; error: string } | { status: 'ok'; data: T };

export function useJson<T>(path: string | null): Loadable<T> | null {
  const [state, setState] = useState<Loadable<T> | null>(path ? { status: 'loading' } : null);
  useEffect(() => {
    if (!path) {
      setState(null);
      return;
    }
    let alive = true;
    setState({ status: 'loading' });
    fetchJson<T>(path)
      .then((data) => alive && setState({ status: 'ok', data }))
      .catch((e: Error) => alive && setState({ status: 'error', error: e.message }));
    return () => {
      alive = false;
    };
  }, [path]);
  return state;
}

export const useMeta = () => useJson<Meta>('meta.json');
export const useGrid = () => useJson<Grid>('grid.json');
export const useCell = (id: string | null) => useJson<CellDetail>(id ? `cells/${id}.json` : null);
export const useGlossary = () => useJson<Glossary>('glossary.json');
export const useDecisionRules = () => useJson<DecisionRules>('decision_rules.json');
export const useTour = () => useJson<Tour>('tour.json');
