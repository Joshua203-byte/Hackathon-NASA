import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const tour = JSON.parse(readFileSync(`${root}public/data/tour.json`, 'utf8'));
const glossary = JSON.parse(readFileSync(`${root}public/data/glossary.json`, 'utf8'));
type Step = { anchor: string; title: { es: string; en: string }; body: { es: string; en: string }; glossary?: string; set: { cell: string | null; win: unknown } };
const steps: Step[] = tour.steps;

function sources(dir: string): string {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() && e.name !== '__tests__' ? [sources(`${dir}/${e.name}`)] : /\.tsx?$/.test(e.name) ? [readFileSync(`${dir}/${e.name}`, 'utf8')] : [])).join('\n');
}
const code = sources(`${root}src`);

describe('recorrido guiado: cubre toda la página', () => {
  it('empieza por la zona de la izquierda y recorre mapa, panel y preguntas', () => {
    expect(steps.map(s => s.anchor)).toEqual(['intro', 'cases', 'controls', 'map', 'layers', 'mapctl', 'topbar', 'verdict', 'series', 'years', 'footprint', 'passport', 'cards']);
  });
  it('los pasos de la izquierda no necesitan celda y los del panel abren la misma', () => {
    for (const s of steps.slice(0, 7)) expect(s.set.cell, s.anchor).toBeNull();
    const cells = new Set(steps.slice(7).map(s => s.set.cell));
    expect(cells.size).toBe(1);
    expect([...cells][0]).toBe(tour.context.cell);
  });
  it('cada ancla existe en el código (si no, el paso explicaría un hueco)', () => {
    for (const s of steps) expect(code, s.anchor).toContain(`data-tour="${s.anchor}"`);
  });
  it('cada paso tiene título y texto en ES y EN, y los términos del glosario existen', () => {
    for (const s of steps) {
      for (const l of ['es', 'en'] as const) { expect(s.title[l], `${s.anchor} título ${l}`).toBeTruthy(); expect(s.body[l], `${s.anchor} texto ${l}`).toBeTruthy(); }
      if (s.glossary) expect(glossary[s.glossary], s.glossary).toBeTruthy();
    }
  });
  it('respeta las reglas de redacción (nada de «normal», «es real», «bajó», «subió»)', () => {
    for (const s of steps) for (const l of ['es', 'en'] as const) expect(`${s.title[l]} ${s.body[l]}`, `${s.anchor} ${l}`).not.toMatch(/\bnormal\b|\bes real\b|\bbajó\b|\bsubió\b|\bis real\b/i);
  });
});
