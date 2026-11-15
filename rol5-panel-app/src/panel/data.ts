import { validateCell, validateMeta } from './contract';
import { useEffect, useState } from 'react';
import type { CellDetail, GridCell, Meta } from './types';
import type { RefData } from './refs';
import type { CellStatus } from './components/CellPanel';

/** BASE_URL: en GitHub Pages la app vive bajo /Hackathon-NASA/ y una ruta absoluta /data/ daría 404. */
const url = (path: string) => `${(import.meta.env.VITE_DATA_BASE_URL || `${import.meta.env.BASE_URL}data`).replace(/\/$/, "")}/${path}`;

/** Se lee como texto y se parsea aparte: un NaN en el JSON lanza aquí y se traduce en status 'error'. */
export async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url(path), { signal });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return JSON.parse(await res.text()) as T;
}

const optional = <T,>(path: string) => fetchJson<T>(path).catch(() => null);

export interface Boot {
  meta: Meta;
  grid: GridCell[];
  refs: RefData;
}

export function useBoot() {
  const [state, setState] = useState<{ boot: Boot | null; error: string | null }>({ boot: null, error: null });
  useEffect(() => {
    (async () => {
      try {
        const [meta, grid, enso, rules, tour, glossary] = await Promise.all([
          fetchJson<Meta>('meta.json'),
          fetchJson<{ cells: GridCell[] }>('grid.json'),
          optional<RefData['enso']>('enso.json'),
          optional<RefData['rules']>('decision_rules.json'),
          optional<RefData['tour']>('tour.json'),
          optional<RefData['glossary']>('glossary.json'),
        ]);
        validateMeta(meta);
        if (!Array.isArray(grid.cells)) throw new Error("Invalid grid.json");
        setState({ boot: { meta, grid: grid.cells, refs: { enso, rules, tour, glossary } }, error: null });
      } catch (e) {
        setState({ boot: null, error: String(e) });
      }
    })();
  }, []);
  return state;
}

/** Una petición por celda; al cambiar de id se cancela la anterior para que una respuesta lenta no pise a la nueva. */
export function useCell(id: string | null): { cell: CellDetail | null; status: CellStatus } {
  const [s, setS] = useState<{ id: string | null; cell: CellDetail | null; status: CellStatus }>({ id: null, cell: null, status: 'idle' });
  useEffect(() => {
    if (!id) return setS({ id: null, cell: null, status: 'idle' });
    const ac = new AbortController();
    setS({ id, cell: null, status: 'loading' });
    performance.mark('cell-fetch');
    fetchJson<CellDetail>(`cells/${id}.json`, ac.signal)
      .then((cell) => {
        validateCell(cell, id);
        performance.mark('cell-json');
        setS({ id, cell, status: 'ready' });
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') setS({ id, cell: null, status: 'error' });
      });
    return () => ac.abort();
  }, [id]);
  // Mientras el id pedido no coincide con el cargado, no se muestra la celda anterior.
  return s.id === id ? { cell: s.cell, status: s.status } : { cell: null, status: id ? 'loading' : 'idle' };
}
