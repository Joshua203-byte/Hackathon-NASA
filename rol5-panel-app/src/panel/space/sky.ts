// Cielo real detrás del globo: estrellas (catálogo Hipparcos/Yale, J2000) y planetas, Luna y Sol (astronomy-engine).
// Todo es geometría: dada la fecha y el punto de la Tierra que mira la cámara, dice dónde cae cada astro en pantalla.
// La cámara de MapLibre en proyección de globo, sin inclinación ni giro, mira hacia el centro de la Tierra desde la vertical
// del punto central. Eso es exactamente un observador en (lat, lon) mirando al nadir, con el norte hacia arriba.
import * as Astronomy from 'astronomy-engine';

export type Vec3 = readonly [number, number, number];
export type SkyData = { stars: [number, number, number, number][]; lines: [number, number][][] };
export type Frame = { cols: readonly [Vec3, Vec3, Vec3] };
export type Body = { id: string; vec: Vec3; mag: number; color: string; kind: 'planet' | 'moon' | 'sun' };

/** Campo de visión vertical de la cámara de MapLibre (0,6435 rad). */
export const FOV = 0.6435011087932844;
const TAN_HALF = Math.tan(FOV / 2);

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function raDecToVec(raDeg: number, decDeg: number): Vec3 {
  const a = (raDeg * Math.PI) / 180; const d = (decDeg * Math.PI) / 180;
  return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
}

/** Rotación del cielo ecuatorial J2000 al horizonte del observador (x = norte, y = oeste, z = cenit). */
export function skyFrame(date: Date, latDeg: number, lonDeg: number): Frame {
  const rot = Astronomy.Rotation_EQJ_HOR(new Astronomy.AstroTime(date), new Astronomy.Observer(latDeg, lonDeg, 0));
  const t = new Astronomy.AstroTime(date);
  const col = (x: number, y: number, z: number): Vec3 => { const v = Astronomy.RotateVector(rot, new Astronomy.Vector(x, y, z, t)); return [v.x, v.y, v.z]; };
  return { cols: [col(1, 0, 0), col(0, 1, 0), col(0, 0, 1)] };
}

export function toHorizon(f: Frame, v: Vec3): Vec3 {
  const [c0, c1, c2] = f.cols;
  return [c0[0] * v[0] + c1[0] * v[1] + c2[0] * v[2], c0[1] * v[0] + c1[1] * v[1] + c2[1] * v[2], c0[2] * v[0] + c1[2] * v[1] + c2[2] * v[2]];
}

// Cámara mirando al nadir con el norte hacia arriba: arriba = norte, derecha = este, adelante = hacia el centro de la Tierra.
const UP: Vec3 = [1, 0, 0]; const RIGHT: Vec3 = [0, -1, 0]; const FWD: Vec3 = [0, 0, -1];

/** Posición en píxeles de una dirección ya en el horizonte; null si queda detrás de la cámara. */
export function project(h: Vec3, w: number, hgt: number): [number, number] | null {
  const depth = dot(h, FWD);
  if (depth <= 0.02) return null;
  const k = (hgt / 2) / TAN_HALF / depth;
  return [w / 2 + dot(h, RIGHT) * k, hgt / 2 - dot(h, UP) * k];
}

const BODIES: { id: string; body: Astronomy.Body; color: string; kind: Body['kind'] }[] = [
  { id: 'Mercury', body: Astronomy.Body.Mercury, color: '#d6cfc2', kind: 'planet' },
  { id: 'Venus', body: Astronomy.Body.Venus, color: '#fff1cf', kind: 'planet' },
  { id: 'Mars', body: Astronomy.Body.Mars, color: '#ff936a', kind: 'planet' },
  { id: 'Jupiter', body: Astronomy.Body.Jupiter, color: '#f3dcb8', kind: 'planet' },
  { id: 'Saturn', body: Astronomy.Body.Saturn, color: '#ead69c', kind: 'planet' },
  { id: 'Moon', body: Astronomy.Body.Moon, color: '#eef1f7', kind: 'moon' },
  { id: 'Sun', body: Astronomy.Body.Sun, color: '#ffe7a3', kind: 'sun' },
];

/** Dirección geocéntrica y magnitud visual de cada cuerpo en el instante dado. */
export function bodiesAt(date: Date): Body[] {
  const t = new Astronomy.AstroTime(date);
  return BODIES.map(b => {
    const g = Astronomy.GeoVector(b.body, t, true);
    const n = Math.hypot(g.x, g.y, g.z);
    return { id: b.id, vec: [g.x / n, g.y / n, g.z / n] as Vec3, mag: Astronomy.Illumination(b.body, t).mag, color: b.color, kind: b.kind };
  });
}

export const BODY_NAME: Record<string, { es: string; en: string }> = {
  Mercury: { es: 'Mercurio', en: 'Mercury' }, Venus: { es: 'Venus', en: 'Venus' }, Mars: { es: 'Marte', en: 'Mars' },
  Jupiter: { es: 'Júpiter', en: 'Jupiter' }, Saturn: { es: 'Saturno', en: 'Saturn' }, Moon: { es: 'Luna', en: 'Moon' }, Sun: { es: 'Sol', en: 'Sun' },
};

/** Color aproximado de una estrella a partir de su índice B−V (azul-blanco-amarillo-naranja), muy atenuado hacia el blanco. */
export function starColor(bv: number): string {
  const t = Math.max(-0.3, Math.min(1.8, bv));
  const k = (t + 0.3) / 2.1;
  const r = Math.round(200 + 55 * Math.min(1, k * 1.6));
  const g = Math.round(214 + 20 * (1 - Math.abs(k - 0.45)) - 28 * Math.max(0, k - 0.6));
  const b = Math.round(255 - 95 * Math.min(1, k * 1.5));
  return `rgb(${r},${g},${b})`;
}
