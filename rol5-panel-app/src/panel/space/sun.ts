// Dónde está el Sol sobre la Tierra en un instante, y cuánta noche hay en cada punto. Con eso se pinta el día y la noche reales.
import * as Astronomy from 'astronomy-engine';

export type SubSolar = { lat: number; lon: number };

/** Punto de la Tierra que tiene el Sol en el cenit (latitud = declinación; longitud = ascensión recta − hora sidérea de Greenwich). */
export function subsolarPoint(date: Date): SubSolar {
  const t = new Astronomy.AstroTime(date);
  const eq = Astronomy.Equator(Astronomy.Body.Sun, t, new Astronomy.Observer(0, 0, 0), true, true);
  const lon = ((((eq.ra - Astronomy.SiderealTime(t)) * 15 + 540) % 360) + 360) % 360 - 180;
  return { lat: eq.dec, lon };
}

const RAD = Math.PI / 180;
/** Coseno del ángulo cenital del Sol en (lat, lon): 1 = Sol en el cenit, 0 = en el horizonte, negativo = de noche. */
export function sunCos(lat: number, lon: number, s: SubSolar): number {
  return Math.sin(lat * RAD) * Math.sin(s.lat * RAD) + Math.cos(lat * RAD) * Math.cos(s.lat * RAD) * Math.cos((lon - s.lon) * RAD);
}

/** 0 = pleno día, 1 = noche cerrada. Transición suave entre el Sol 3° sobre el horizonte y 12° debajo (crepúsculo náutico). */
export function nightness(cosZenith: number): number {
  const hi = Math.sin(3 * RAD); const lo = -Math.sin(12 * RAD);
  const k = Math.max(0, Math.min(1, (hi - cosZenith) / (hi - lo)));
  return k * k * (3 - 2 * k);
}
