import { afterEach, describe, expect, it, vi } from 'vitest';
import { shouldPlayIntro } from '../space/introPlan';

function env({ search = '', reduced = false, webdriver = false, seen = false } = {}) {
  // `seen` simula una sesión con almacenamiento previo: ya no influye, la intro se reproduce en cada carga
  const store = new Map<string, string>(seen ? [['altaris-intro-seen', '1']] : []);
  vi.stubGlobal('window', {
    location: { search },
    matchMedia: () => ({ matches: reduced }),
    sessionStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
  });
  vi.stubGlobal('navigator', { webdriver });
}

afterEach(() => vi.unstubAllGlobals());

describe('entrada espacial: cuándo se reproduce', () => {
  it('se reproduce en la primera visita normal', () => { env(); expect(shouldPlayIntro()).toBe(true); });
  it('se reproduce en cada carga, también en la misma sesión (recargar con F5)', () => { env({ seen: true }); expect(shouldPlayIntro()).toBe(true); });
  it('no se reproduce con movimiento reducido', () => { env({ reduced: true }); expect(shouldPlayIntro()).toBe(false); });
  it('no hace esperar a quien llega por un enlace a algo concreto', () => {
    for (const q of ['?cell=N1335W08715', '?case=3', '?layer=slope', '?ind=annual_mm', '?tour=1', '?dataset=pilot', '?lens=com']) {
      env({ search: q }); expect(shouldPlayIntro(), q).toBe(false);
    }
  });
  it('las pruebas automáticas no la ven salvo que la pidan', () => {
    env({ webdriver: true }); expect(shouldPlayIntro()).toBe(false);
    env({ webdriver: true, search: '?intro=1' }); expect(shouldPlayIntro()).toBe(true);
  });
  it('?intro=0 la apaga y ?intro=1 la fuerza', () => {
    env({ search: '?intro=0' }); expect(shouldPlayIntro()).toBe(false);
    env({ search: '?intro=1', seen: true }); expect(shouldPlayIntro()).toBe(true);
  });
  it('sin sessionStorage sigue funcionando', () => {
    vi.stubGlobal('window', { location: { search: '' }, matchMedia: () => ({ matches: false }), get sessionStorage() { throw new Error('bloqueado'); } });
    vi.stubGlobal('navigator', { webdriver: false });
    expect(shouldPlayIntro()).toBe(true);
  });
});

import { tilesToWarm } from '../space/warmTiles';

describe('precarga de teselas de la Tierra', () => {
  const region = { lat: [7, 18.5] as [number, number], lon: [-92.5, -77] as [number, number] };
  it('incluye el planeta entero hasta el nivel 3 (1+4+16+64 = 85 teselas)', () => {
    expect(tilesToWarm(region).filter(t => t.z <= 3)).toHaveLength(85);
  });
  it('en el nivel 4 solo pide la región y su borde, dentro del rango válido', () => {
    const z4 = tilesToWarm(region).filter(t => t.z === 4);
    expect(z4.length).toBeGreaterThan(0); expect(z4.length).toBeLessThan(30);
    expect(z4.every(t => t.x >= 0 && t.x < 16 && t.y >= 0 && t.y < 16)).toBe(true);
    // El centro de la región (-88°, 12°) cae en la tesela x=4, y=7 del nivel 4: x = (−88+180)/360·16 = 4,09 ; y = 7,46
    expect(z4.some(t => t.x === 4 && t.y === 7)).toBe(true);
  });
});
