import { describe, expect, it } from 'vitest';
import { HELP_ZONES } from '../help';

describe('ayuda «¿No entiendes algo?» (docs/12, T4)', () => {
  it('cubre las 8 zonas del plan, cada una con pregunta y explicación en ES y EN', () => {
    expect(HELP_ZONES.map(z => z.key)).toEqual(['map', 'verdict', 'series', 'years', 'footprint', 'compare', 'enso', 'passport']);
    for (const z of HELP_ZONES) for (const l of ['es', 'en'] as const) {
      expect(z.question[l], `${z.key} pregunta ${l}`).toBeTruthy();
      expect(z.body[l], `${z.key} texto ${l}`).toBeTruthy();
    }
  });
  it('cada explicación es corta y respeta la sección 2', () => {
    for (const z of HELP_ZONES) for (const l of ['es', 'en'] as const) {
      const t = z.body[l];
      expect(t.length, `${z.key} ${l}`).toBeLessThanOrEqual(260);
      expect(t).not.toMatch(/\bnormal\b|\bes real\b|\bbajó\b|\bsubió\b/i);
    }
  });
  it('las zonas del panel usan los mismos anclajes del recorrido', () => {
    for (const z of HELP_ZONES.filter(z => z.selector.startsWith('[data-tour'))) expect(z.selector).toMatch(/^\[data-tour="(verdict|series|years|footprint|compare|enso|passport)"\]$/);
  });
});
