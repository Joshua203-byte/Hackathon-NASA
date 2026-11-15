import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CASES, caseSearch, findCase } from '../cases';
import type { GridCell } from '../types';

describe('enlaces de casos (Rol 4)', () => {
  it('?case=N encuentra el caso; otro valor no', () => {
    expect(findCase('3')?.cell).toBe('N1495W09125');
    expect(findCase('9')).toBeUndefined();
    expect(findCase(null)).toBeUndefined();
  });

  it('conserva idioma, lente y capa; fija celda, indicador, ventana y espejo; quita case y tour', () => {
    const q = new URLSearchParams(caseSearch('?lang=en&lens=com&layer=slope&case=3&tour=2&win=2004-2024', findCase('2')!));
    expect(q.get('lang')).toBe('en');
    expect(q.get('lens')).toBe('com');
    expect(q.get('layer')).toBe('slope');
    expect(q.get('cell')).toBe('N1475W08765');
    expect(q.get('ind')).toBe('may_oct_mm');
    expect(q.get('win')).toBe('2001-2010');
    expect(q.has('mirror')).toBe(false);
    expect(q.has('case')).toBe(false);
    expect(q.has('tour')).toBe(false);
  });

  it('el caso 3 abre la espejo y quita una ventana anterior', () => {
    const q = new URLSearchParams(caseSearch('?win=2001-2010', findCase('3')!));
    expect(q.get('mirror')).toBe('N1335W08715');
    expect(q.has('win')).toBe(false);
  });

  // Solo corre si public/data tiene el JSON real (no en un clon con ejemplos simulados).
  const gridPath = fileURLToPath(new URL('../../../public/data/grid.json', import.meta.url));
  const real = existsSync(gridPath) ? (JSON.parse(readFileSync(gridPath, 'utf8')) as { cells: GridCell[] }).cells : null;
  it.skipIf(!real || real.length < 2000)('las celdas de los casos existen en el JSON real, con los veredictos de docs/08', () => {
    const byId = new Map(real!.map(c => [c.id, c]));
    for (const c of CASES) {
      expect(byId.has(c.cell), c.cell).toBe(true);
      if (c.mirror) expect(byId.has(c.mirror), c.mirror).toBe(true);
    }
    expect(byId.get('N1335W08715')!.ind.may_oct_mm?.verdict).toBe('sin_evidencia');
    expect(byId.get('N1475W08765')!.ind.may_oct_mm?.verdict).toBe('sin_evidencia');
    expect(byId.get('N1495W09125')!.ind.may_oct_mm?.verdict).toBe('consistente');
  });
});
