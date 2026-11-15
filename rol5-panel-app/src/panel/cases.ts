// Rol 4 · Enlaces de los 3 casos elegidos por Camila (docs/08, resolución del domingo 15 a las 04:15).
// Los títulos son neutros a propósito: el texto de cada caso lo escribe Camila (tarea 8 de docs/06).
import type { IndicatorKey, Lang } from './types';

export interface CaseLink {
  n: 1 | 2 | 3;
  cell: string;
  ind: IndicatorKey;
  /** Ventana que abre el enlace ("2001-2010"). Sin ventana = periodo base. */
  win?: string;
  /** Celda de comparación para la vista espejo. */
  mirror?: string;
  title: Record<Lang, string>;
  note?: Record<Lang, string>;
}

export const CASES: readonly CaseLink[] = [
  {
    n: 1, cell: 'N1335W08715', ind: 'may_oct_mm',
    title: { es: 'Choluteca, Corredor Seco', en: 'Choluteca, Dry Corridor' },
  },
  {
    n: 2, cell: 'N1475W08765', ind: 'may_oct_mm', win: '2001-2010',
    title: { es: 'Centro de Honduras: según los años', en: 'Central Honduras: it depends on the years' },
    note: { es: 'Abre la ventana 2001–2010, de solo 10 años', en: 'Opens the 2001–2010 window, only 10 years' },
  },
  {
    n: 3, cell: 'N1495W09125', ind: 'may_oct_mm', mirror: 'N1335W08715',
    title: { es: 'Altiplano de Guatemala frente a Choluteca', en: 'Guatemalan highlands vs Choluteca' },
    note: { es: 'Lluvia más baja desde alrededor de 2009. Leer la salvedad', en: 'Lower rainfall since around 2009. Read the caveat' },
  },
];

export function findCase(raw: string | null): CaseLink | undefined {
  return CASES.find(c => String(c.n) === raw);
}

/** Query del caso sobre el actual: conserva idioma, lente y capa; quita `case` porque ya queda explícito. */
export function caseSearch(search: string, c: CaseLink): string {
  const q = new URLSearchParams(search);
  q.set('cell', c.cell);
  q.set('ind', c.ind);
  if (c.win) q.set('win', c.win); else q.delete('win');
  if (c.mirror) q.set('mirror', c.mirror); else q.delete('mirror');
  q.delete('case');
  q.delete('tour');
  return `?${q}`;
}
