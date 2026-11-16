import { afterEach, describe, expect, it, vi } from 'vitest';
import { countryBounds, countryCodes, markGuideSeen, shouldShowGuide } from '../guide';

function env(search: string, opts: { reduced?: boolean; webdriver?: boolean; seen?: boolean; blocked?: boolean } = {}) {
  const store = new Map<string, string>(opts.seen ? [['altaris-guia-vista', '1']] : []);
  vi.stubGlobal('window', {
    location: { search },
    matchMedia: () => ({ matches: !!opts.reduced }),
    get localStorage() {
      if (opts.blocked) throw new Error('bloqueado');
      return { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    },
  });
  vi.stubGlobal('navigator', { webdriver: !!opts.webdriver });
  return store;
}
afterEach(() => vi.unstubAllGlobals());

describe('guía de primera visita: cuándo aparece', () => {
  it('en la primera visita normal', () => { env(''); expect(shouldShowGuide()).toBe(true); });
  it('no aparece si ya se vio', () => { env('', { seen: true }); expect(shouldShowGuide()).toBe(false); });
  it('no aparece con enlaces profundos', () => {
    for (const k of ['cell', 'case', 'mirror', 'layer', 'ind', 'lens', 'win', 'tour', 'dataset']) { env(`?${k}=1`); expect(shouldShowGuide(), k).toBe(false); }
  });
  it('no aparece con movimiento reducido ni en pruebas automáticas', () => {
    env('', { reduced: true }); expect(shouldShowGuide()).toBe(false);
    env('', { webdriver: true }); expect(shouldShowGuide()).toBe(false);
  });
  it('?guide=1 la fuerza y ?guide=0 la apaga', () => {
    env('?guide=1&cell=X', { seen: true, webdriver: true, reduced: true }); expect(shouldShowGuide()).toBe(true);
    env('?guide=0'); expect(shouldShowGuide()).toBe(false);
  });
  it('sin localStorage se muestra y marcarla como vista no falla', () => {
    env('', { blocked: true });
    expect(shouldShowGuide()).toBe(true);
    expect(() => markGuideSeen()).not.toThrow();
  });
  it('marcarla como vista la apaga la próxima vez', () => { env(''); markGuideSeen(); expect(shouldShowGuide()).toBe(false); });
});

describe('países de la guía', () => {
  const cells = [
    { country: 'HND', lat: 14, lon: -87 }, { country: 'HND', lat: 15, lon: -86 }, { country: 'HND', lat: 14.5, lon: -88 },
    { country: 'SLV', lat: 13.5, lon: -89 },
  ];
  it('salen de los datos, del más al menos numeroso', () => { expect(countryCodes(cells)).toEqual(['HND', 'SLV']); });
  it('los límites envuelven las celdas del país', () => {
    expect(countryBounds(cells, 'HND')).toEqual([[-88.05, 13.95], [-85.95, 15.05]]);
    expect(countryBounds(cells, 'XXX')).toBeNull();
  });
});
