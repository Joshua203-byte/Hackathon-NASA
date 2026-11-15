// Precarga las teselas de la Tierra que el vuelo va a necesitar, para que no se vea un fondo liso a mitad de camino.
// Son ~85 archivos pequeños (niveles 0 a 3, el planeta entero) más las del nivel 4 alrededor de la región.
export type Bbox = { lat: [number, number]; lon: [number, number] };
export type Tile = { z: number; x: number; y: number };

const lon2x = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const lat2y = (lat: number, z: number) => {
  const r = (Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

export function tilesToWarm(region: Bbox, fullUpTo = 3, regionZoom = 4, margin = 1): Tile[] {
  const out: Tile[] = [];
  for (let z = 0; z <= fullUpTo; z++) for (let x = 0; x < 2 ** z; x++) for (let y = 0; y < 2 ** z; y++) out.push({ z, x, y });
  const n = 2 ** regionZoom;
  const x0 = Math.max(0, lon2x(region.lon[0], regionZoom) - margin); const x1 = Math.min(n - 1, lon2x(region.lon[1], regionZoom) + margin);
  const y0 = Math.max(0, lat2y(region.lat[1], regionZoom) - margin); const y1 = Math.min(n - 1, lat2y(region.lat[0], regionZoom) + margin);
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) out.push({ z: regionZoom, x, y });
  return out;
}

export function warmEarthTiles(template: string, region: Bbox) {
  for (const t of tilesToWarm(region)) {
    const img = new Image();
    img.decoding = 'async';
    img.src = template.replace('{z}', String(t.z)).replace('{x}', String(t.x)).replace('{y}', String(t.y));
  }
}
