import type { FootprintWindow, SeriesPoint } from '../types';

export function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

/** y(año) = intercept + slope_per_decade/10 × (año − intercept_year) */
export function senLineValue(intercept: number, slopeDec: number, interceptYear: number, year: number): number {
  return intercept + (slopeDec / 10) * (year - interceptYear);
}

function median(a: number[]): number {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/** Recta de Sen de una ventana, calculada en el navegador solo para dibujar (la pendiente oficial viene de la huella). */
export function windowSen(series: SeriesPoint[], win: [number, number]) {
  const pts = series.filter((d) => d.value !== null && d.year >= win[0] && d.year <= win[1]) as { year: number; value: number }[];
  if (pts.length < 3) return null;
  const slopes: number[] = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) slopes.push((pts[j].value - pts[i].value) / (pts[j].year - pts[i].year));
  const slope = median(slopes);
  const intercept = median(pts.map((p) => p.value)) - slope * median(pts.map((p) => p.year));
  return { slopePerYear: slope, f: (yr: number) => intercept + slope * yr };
}

export function findWindow(fp: FootprintWindow[], win: [number, number] | null): FootprintWindow | null {
  if (!win) return null;
  return fp.find((w) => w[0] === win[0] && w[1] === win[1]) ?? null;
}
