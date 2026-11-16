import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CASES, caseSearch, findCase } from '../cases';
import { validateCell } from '../contract';
import type { GridCell } from '../types';

describe('enlaces de casos (Rol 4)', () => {
  it('el paso 3 y el pasaporte del recorrido conservan la ventana del caso 2', () => {
    const tourPath = fileURLToPath(new URL('../../../public/data/tour.json', import.meta.url));
    const tour = JSON.parse(readFileSync(tourPath, 'utf8'));
    const kase = findCase('2')!;
    // los pasos que fijan una ventana de años (huella, pasaporte y preguntas finales) deben coincidir con el caso 2
    for (const step of tour.steps.filter((s: { set?: { win?: unknown } }) => s.set?.win)) {
      expect(step.set.cell).toBe(kase.cell);
      expect(step.set.ind).toBe(kase.ind);
      expect(step.set.win.join('-')).toBe(kase.win);
    }
  });
  it('?case=N encuentra el caso; otro valor no', () => {
    expect(findCase('3')?.cell).toBe('N1495W09125');
    expect(findCase('9')).toBeUndefined();
    expect(findCase(null)).toBeUndefined();
  });

  it('conserva idioma y capa; fija la lente compatible, celda, indicador, ventana y espejo; quita case y tour', () => {
    const q = new URLSearchParams(caseSearch('?lang=en&lens=com&layer=slope&case=3&tour=2&win=2004-2024', findCase('2')!));
    expect(q.get('lang')).toBe('en');
    expect(q.get('lens')).toBe('agri');
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

  // Segunda variable de David (data/rol1/power_casos), escrita por pipeline/add_secondary.py.
  it.skipIf(!real || real.length < 2000)('las 3 celdas de los casos traen temperatura y radiación de POWER, sin veredicto y con contrato válido', () => {
    for (const c of CASES) {
      const cell = JSON.parse(readFileSync(fileURLToPath(new URL(`../../../public/data/cells/${c.cell}.json`, import.meta.url)), 'utf8'));
      expect(() => validateCell(cell, c.cell)).not.toThrow();
      const keys = cell.secondary_variables.map((v: { key: string }) => v.key);
      expect(keys).toEqual(['T2M_MAY_OCT', 'ALLSKY_MAY_OCT']);
      for (const v of cell.secondary_variables) {
        expect(v.data.verdict).toBeNull();
        expect(v.data.series).toHaveLength(24);
        expect(v.source).toMatch(/NASA POWER/);
      }
    }
    const gt = JSON.parse(readFileSync(fileURLToPath(new URL('../../../public/data/cells/N1495W09125.json', import.meta.url)), 'utf8'));
    expect(gt.secondary_variables[0].data.statistics.slope_per_decade).toBeCloseTo(0.27, 2); // docs/rol1-datos.md, sección 8
  });
});
