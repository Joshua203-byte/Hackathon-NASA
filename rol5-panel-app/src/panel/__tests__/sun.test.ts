import { describe, expect, it } from 'vitest';
import { nightness, subsolarPoint, sunCos } from '../space/sun';

describe('día y noche reales', () => {
  it('a mediados de noviembre, a las 20:00 UTC, el Sol está sobre el Pacífico a unos −18,6° de latitud', () => {
    const s = subsolarPoint(new Date('2026-11-15T20:00:00Z'));
    // 8 h después del mediodía de Greenwich son 120° al oeste; la ecuación del tiempo (+15,4 min) suma unos 3,9° más.
    expect(s.lat).toBeGreaterThan(-19.2); expect(s.lat).toBeLessThan(-18.0);
    expect(s.lon).toBeGreaterThan(-124.6); expect(s.lon).toBeLessThan(-123.2);
  });
  it('en el equinoccio el Sol está sobre el ecuador', () => {
    expect(Math.abs(subsolarPoint(new Date('2026-03-20T14:46:00Z')).lat)).toBeLessThan(0.1);
  });
  it('a esa hora es de día en Centroamérica y de noche en la India', () => {
    const s = subsolarPoint(new Date('2026-11-15T20:00:00Z'));
    expect(nightness(sunCos(13.5, -88, s))).toBe(0);
    expect(nightness(sunCos(20, 78, s))).toBe(1);
  });
  it('la noche crece de forma monótona al bajar el Sol y vale 0 y 1 en los extremos', () => {
    const v = [0.5, 0.05, 0, -0.1, -0.2, -0.5].map(nightness);
    expect(v[0]).toBe(0); expect(v.at(-1)).toBe(1);
    for (let i = 1; i < v.length; i++) expect(v[i]).toBeGreaterThanOrEqual(v[i - 1]);
  });
  it('en el punto subsolar el Sol está en el cenit', () => {
    const s = subsolarPoint(new Date('2026-06-21T12:00:00Z'));
    expect(sunCos(s.lat, s.lon, s)).toBeCloseTo(1, 9);
    expect(s.lat).toBeGreaterThan(23.3); // solsticio
  });
});

import { imageryDate, introStartLon, nightAlpha, viirsUrl } from '../space/liveEarth';

describe('teselas en vivo', () => {
  it('la fecha de la imagen es el último día completo (30 h atrás, en UTC)', () => {
    expect(imageryDate(new Date('2026-11-15T20:10:00Z'))).toBe('2026-11-14');
    expect(imageryDate(new Date('2026-11-15T03:00:00Z'))).toBe('2026-11-13'); // ayer aún puede estar incompleto de madrugada
  });
  it('la URL de GIBS lleva fila antes que columna', () => {
    expect(viirsUrl('2026-11-14', 3, 2, 5)).toBe('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/2026-11-14/GoogleMapsCompatible_Level9/3/5/2.jpg');
  });
  it('la tesela del mundo entero tiene día sobre el Pacífico y noche sobre la India a las 20:00 UTC', () => {
    const a = nightAlpha(0, 0, 0, 64, { lat: -18.6, lon: -123.9 });
    const at = (lon: number, lat: number) => {
      const i = Math.floor(((lon + 180) / 360) * 64);
      const r = (lat * Math.PI) / 180;
      const j = Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 64);
      return a[j * 64 + i];
    };
    expect(at(-124, -18)).toBe(0);
    expect(at(-88, 13)).toBe(0);   // Centroamérica, primera tarde
    expect(at(78, 20)).toBe(1);    // India, madrugada
    expect(at(0, 80)).toBe(1);     // noche polar del norte en noviembre
  });
  it('la intro arranca a 62° del Sol, evitando el Pacífico central', () => {
    // Sol sobre −124° (tarde en América): candidatos −62° y 174°. 174° es Pacífico central: se elige −62° (Sudamérica y el Atlántico)
    expect(introStartLon({ lat: -18.6, lon: -124 }, -85)).toBeCloseTo(-62, 6);
    // Sol sobre −30° (mañana en América): candidatos 32° y −92°; ninguno es Pacífico: el más lejano a −85° es 32° (África)
    expect(introStartLon({ lat: 0, lon: -30 }, -85)).toBeCloseTo(32, 6);
    // Sol sobre 60°: candidatos 122° y −2°; el más lejano a −85° es 122°
    expect(introStartLon({ lat: 0, lon: 60 }, -85)).toBeCloseTo(122, 6);
    // Siempre a 62° del punto subsolar: del lado iluminado, con el filo de la noche a la vista
    for (const lon of [-170, -90, 0, 45, 179]) expect(Math.abs((((introStartLon({ lat: 0, lon }, -85) - lon + 540) % 360) - 180))).toBeCloseTo(62, 6);
  });
});
