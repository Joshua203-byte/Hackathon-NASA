import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PLAIN_REASON, reasonPlain } from '../plain';
import { readDetailPref, writeDetailPref } from '../detailPref';
import { reasonText } from '../verdict';

const reasons = JSON.parse(readFileSync('public/data/reasons.json', 'utf-8')) as Record<string, unknown>;
const glossary = JSON.parse(readFileSync('public/data/glossary.json', 'utf-8')) as Record<string, { term: { es: string; en: string }; definition: { es: string; en: string } }>;

afterEach(() => vi.unstubAllGlobals());

describe('razones en llano (docs/12, T2.1)', () => {
  it('cada código de reasons.json tiene versión llana en español e inglés', () => {
    for (const code of Object.keys(reasons)) {
      expect(PLAIN_REASON[code]?.es, `${code} es`).toBeTruthy();
      expect(PLAIN_REASON[code]?.en, `${code} en`).toBeTruthy();
    }
  });
  it('un código desconocido cae al texto técnico, no inventa uno', () => {
    expect(reasonPlain('clave_nueva', 'es', reasonText)).toBe('clave_nueva');
  });
  it('ningún texto llano usa «normal» para el vaivén ni dice que algo «es real»', () => {
    for (const r of Object.values(PLAIN_REASON)) expect(r.es).not.toMatch(/\bnormal\b|\bes real\b/i);
  });
});

describe('glosario', () => {
  it('trae tendencia, significativo y década en ES y EN', () => {
    for (const k of ['tendencia', 'significativo', 'decada']) {
      expect(glossary[k]?.definition.es).toBeTruthy();
      expect(glossary[k]?.definition.en).toBeTruthy();
    }
  });
});

describe('preferencia «Mostrar siempre el detalle»', () => {
  it('se guarda y se lee', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', { localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) } });
    expect(readDetailPref()).toBe(false);
    writeDetailPref(true);
    expect(readDetailPref()).toBe(true);
  });
  it('sin localStorage no falla y queda cerrado', () => {
    vi.stubGlobal('window', { get localStorage(): never { throw new Error('bloqueado'); } });
    expect(readDetailPref()).toBe(false);
    expect(() => writeDetailPref(true)).not.toThrow();
  });
});
