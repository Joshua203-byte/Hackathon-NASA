// La Tierra «de verdad»: día y noche calculados con la posición real del Sol, y la imagen del último día completo con sus
// nubes (NASA GIBS, VIIRS de NOAA-20). Todo es opcional: si GIBS no responde queda el Blue Marble propio, que no depende de la red.
//
// Cada capa es UN lienzo del planeta entero (64 teselas del nivel 3 = 2048 px) que se muestra de una vez con un fundido.
// Con teselas sueltas las nubes iban apareciendo por cuadros a mitad del vuelo, con bordes rectos contra el Blue Marble.
import type { Map as MlMap } from 'maplibre-gl';
import { nightness, type SubSolar } from './sun';

const GIBS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';
const VIIRS = 'VIIRS_NOAA20_CorrectedReflectance_TrueColor';
const RAD = Math.PI / 180;
const Z = 3; const N = 2 ** Z; const TILE = 256; const SIZE = N * TILE;
const EDGE = 85.051129;
const WORLD: [[number, number], [number, number], [number, number], [number, number]] = [[-180, EDGE], [180, EDGE], [180, -EDGE], [-180, -EDGE]];

/** Día completo más reciente: la imagen de «hoy» se va llenando por órbitas y a medio día está a medias (se ve en negro). */
export function imageryDate(now: Date): string {
  return new Date(now.getTime() - 30 * 3600 * 1000).toISOString().slice(0, 10);
}

export function viirsUrl(date: string, z: number, x: number, y: number) {
  return `${GIBS}/${VIIRS}/default/${date}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.jpg`;
}
export const blueMarbleHdTiles = `${GIBS}/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg`;

/** Las capas en vivo piden datos a un servidor externo: las pruebas automáticas no las usan salvo que se pida con ?live=1. */
export function liveAllowed(): boolean {
  const v = new URLSearchParams(window.location.search).get('live');
  if (v === '0') return false;
  if (v === '1') return true;
  return !navigator.webdriver;
}

/** Alfa de la noche en una tesela (o en el mundo entero con z = 0): una fila por latitud, una columna por longitud. */
export function nightAlpha(z: number, x: number, y: number, size: number, sun: SubSolar): Float32Array {
  const n = 2 ** z; const out = new Float32Array(size * size);
  const sinD = Math.sin(sun.lat * RAD); const cosD = Math.cos(sun.lat * RAD);
  const cosH = new Float32Array(size);
  for (let i = 0; i < size; i++) cosH[i] = Math.cos((((x + (i + 0.5) / size) / n) * 360 - 180 - sun.lon) * RAD);
  for (let j = 0; j < size; j++) {
    const lat = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + (j + 0.5) / size)) / n)));
    const a = Math.sin(lat) * sinD; const b = Math.cos(lat) * cosD;
    for (let i = 0; i < size; i++) out[j * size + i] = nightness(a + b * cosH[i]);
  }
  return out;
}

/** Junta las 64 teselas del nivel 3 en un lienzo. Devuelve cuántas fallaron. */
async function mosaic(urlOf: (x: number, y: number) => string, signal?: AbortSignal) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  let failed = 0;
  const jobs: Promise<void>[] = [];
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    jobs.push(fetch(urlOf(x, y), { signal, mode: 'cors' })
      .then(r => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then(b => createImageBitmap(b))
      .then(bmp => { ctx.drawImage(bmp, x * TILE, y * TILE, TILE, TILE); })
      .catch(() => { failed++; }));
  }
  await Promise.all(jobs);
  return { canvas, ctx, failed };
}

/** Luces nocturnas locales con transparencia = cuánta noche hay en cada píxel en este instante. */
export async function buildNightCanvas(nightTiles: string, sun: SubSolar): Promise<HTMLCanvasElement | null> {
  const { canvas, ctx, failed } = await mosaic((x, y) => nightTiles.replace('{z}', String(Z)).replace('{x}', String(x)).replace('{y}', String(y)));
  if (failed > 0) return null;
  const img = ctx.getImageData(0, 0, SIZE, SIZE);
  const alpha = nightAlpha(0, 0, 0, SIZE, sun);
  const d = img.data;
  for (let p = 0; p < alpha.length; p++) {
    // Las luces se realzan un poco; la base azul oscuro de la imagen nocturna hace de sombra.
    const k = p * 4; const lum = Math.max(d[k], d[k + 1], d[k + 2]) / 255;
    d[k] = Math.min(255, d[k] * 1.25); d[k + 1] = Math.min(255, d[k + 1] * 1.2); d[k + 2] = Math.min(255, d[k + 2] * 1.1);
    d[k + 3] = Math.round(255 * alpha[p] * (0.9 + 0.1 * lum));
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Imagen de VIIRS de la fecha dada; las zonas sin dato (negro puro: noche polar, franjas sin órbita) quedan transparentes. */
export async function buildViirsCanvas(date: string, timeoutMs = 12000): Promise<HTMLCanvasElement | null> {
  const ctl = new AbortController();
  const timer = window.setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const { canvas, ctx, failed } = await mosaic((x, y) => viirsUrl(date, Z, x, y), ctl.signal);
    if (failed > 0) return null; // todo o nada: un planeta con huecos se ve peor que el Blue Marble
    const img = ctx.getImageData(0, 0, SIZE, SIZE);
    const d = img.data;
    for (let k = 0; k < d.length; k += 4) {
      const m = Math.max(d[k], d[k + 1], d[k + 2]);
      if (m < 22) d[k + 3] = m < 8 ? 0 : Math.round((255 * (m - 8)) / 14);
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  } catch { return null; } finally { window.clearTimeout(timer); }
}

/** Añade un lienzo del planeta entero como capa, visible solo con el globo lejos, y lo funde desde cero. */
function addWorldCanvas(map: MlMap, id: string, canvas: HTMLCanvasElement, before: string, fadeFrom: number, fadeTo: number, attribution?: string) {
  if (map.getSource(id)) return;
  map.addSource(id, { type: 'canvas', canvas, coordinates: WORLD, animate: false, ...(attribution ? { attribution } : {}) } as never);
  map.addLayer({ id, type: 'raster', source: id, maxzoom: fadeTo + 0.1, paint: { 'raster-fade-duration': 0, 'raster-resampling': 'linear', 'raster-opacity': 0, 'raster-opacity-transition': { duration: 1600, delay: 0 } } }, before);
  // Al acercarse a la región la capa se apaga: de cerca manda el Blue Marble limpio y la región nunca queda a oscuras.
  requestAnimationFrame(() => { if (map.getLayer(id)) map.setPaintProperty(id, 'raster-opacity', ['interpolate', ['linear'], ['zoom'], fadeFrom, 1, fadeTo, 0]); });
}

export function addNightLayer(map: MlMap, canvas: HTMLCanvasElement, before: string) { addWorldCanvas(map, 'noche', canvas, before, 3.2, 4.6); }

export function addViirsLayer(map: MlMap, canvas: HTMLCanvasElement, before: string, date: string) { addWorldCanvas(map, 'viirs', canvas, before, 3.4, 4.8, `VIIRS NOAA-20 ${date}`); }

/** Blue Marble nítido de GIBS para la vista de cerca, sobre el Blue Marble propio. */
export function addHdLayer(map: MlMap, before: string) {
  if (map.getSource('earth-hd')) return;
  map.addSource('earth-hd', { type: 'raster', tiles: [blueMarbleHdTiles], tileSize: 256, minzoom: 5, maxzoom: 8, attribution: 'NASA GIBS' });
  map.addLayer({ id: 'earth-hd', type: 'raster', source: 'earth-hd', minzoom: 4.5, paint: { 'raster-fade-duration': 500, 'raster-saturation': 0.05 } }, before);
}

/**
 * Longitud inicial de la intro: a 62° del punto subsolar, donde se ve el planeta iluminado con el filo de la noche y sus luces.
 * De los dos lados posibles se evita el Pacífico central (un hemisferio casi sin tierra) y, si se puede elegir, se toma el
 * más lejano a la región para que el vuelo tenga recorrido.
 */
export function introStartLon(sun: SubSolar, regionLon: number): number {
  const wrap = (v: number) => ((((v + 180) % 360) + 360) % 360) - 180;
  const dist = (a: number, b: number) => Math.abs(wrap(a - b));
  const pacific = (lon: number) => lon >= 150 || lon <= -125;
  const east = wrap(sun.lon + 62); const west = wrap(sun.lon - 62);
  if (pacific(east) !== pacific(west)) return pacific(east) ? west : east;
  return dist(east, regionLon) >= dist(west, regionLon) ? east : west;
}
