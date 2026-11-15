// Lienzo con el cielo real, colocado detrás del mapa (el mapa es transparente fuera del globo).
// Se redibuja con cada movimiento de la cámara: la orientación depende del punto de la Tierra que se mira.
import type { Map as MlMap } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { BODY_NAME, bodiesAt, project, raDecToVec, skyFrame, starColor, toHorizon, type Body, type SkyData, type Vec3 } from './sky';

type Props = { map: MlMap | null; es: boolean; /** 0 a 1: nitidez de constelaciones y nombres (la intro los muestra y luego se apagan) */ detail: number };

export function SpaceSky({ map, es, detail }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const detailRef = useRef(detail);
  detailRef.current = detail;
  const [data, setData] = useState<SkyData | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch(new URL(`${import.meta.env.BASE_URL}sky/stars.json`, window.location.href).href)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: SkyData) => { if (alive) setData(d); })
      .catch(() => { /* sin estrellas: queda el fondo liso */ });
    return () => { alive = false; };
  }, []);

  useEffect(() => { setTick(t => t + 1); }, [detail]);

  useEffect(() => {
    const canvas = ref.current;
    if (!map || !data || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const date = new Date();
    const bodies = bodiesAt(date);
    const starVecs: Vec3[] = data.stars.map(s => raDecToVec(s[0], s[1]));
    const colors = data.stars.map(s => starColor(s[3]));
    const lineVecs: Vec3[][] = data.lines.map(seg => seg.map(p => raDecToVec(p[0], p[1])));
    let raf = 0;

    const draw = () => {
      raf = 0;
      const box = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(box.width)); const h = Math.max(1, Math.round(box.height));
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const c = map.getCenter();
      const frame = skyFrame(date, Math.max(-89.9, Math.min(89.9, c.lat)), c.lng);
      const d = detailRef.current;

      if (d > 0.02) {
        ctx.lineWidth = 0.8; ctx.strokeStyle = `rgba(150,180,235,${0.2 * d})`;
        ctx.beginPath();
        for (const seg of lineVecs) {
          let pen = false;
          for (const v of seg) {
            const p = project(toHorizon(frame, v), w, h);
            if (!p) { pen = false; continue; }
            if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
            pen = true;
          }
        }
        ctx.stroke();
      }

      for (let i = 0; i < starVecs.length; i++) {
        const p = project(toHorizon(frame, starVecs[i]), w, h);
        if (!p || p[0] < -4 || p[0] > w + 4 || p[1] < -4 || p[1] > h + 4) continue;
        const mag = data.stars[i][2];
        const r = Math.max(0.35, 1.7 - mag * 0.26);
        ctx.globalAlpha = Math.min(1, 0.32 + (6.2 - mag) * 0.14);
        ctx.fillStyle = colors[i];
        if (r < 0.9) ctx.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
        else { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.2832); ctx.fill(); }
      }
      ctx.globalAlpha = 1;

      for (const b of bodies) drawBody(ctx, b, frame, w, h, es, d);
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(draw); };
    map.on('move', schedule); map.on('resize', schedule);
    const ro = new ResizeObserver(schedule); ro.observe(canvas.parentElement!);
    schedule();
    return () => { map.off('move', schedule); map.off('resize', schedule); ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [map, data, es, tick]);

  return <canvas ref={ref} className="space-sky" aria-hidden="true" />;
}

function drawBody(ctx: CanvasRenderingContext2D, b: Body, frame: ReturnType<typeof skyFrame>, w: number, h: number, es: boolean, detail: number) {
  const p = project(toHorizon(frame, b.vec), w, h);
  const m = b.kind === 'sun' ? 260 : 60;
  if (!p || p[0] < -m || p[0] > w + m || p[1] < -m || p[1] > h + m) return;
  const [x, y] = p;
  if (b.kind === 'sun') {
    // Halo amplio y núcleo blanco, sumados a lo que haya debajo (como un destello, no como un disco opaco).
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 260);
    halo.addColorStop(0, 'rgba(255,236,190,0.55)'); halo.addColorStop(0.18, 'rgba(255,214,140,0.2)'); halo.addColorStop(0.5, 'rgba(255,190,110,0.06)'); halo.addColorStop(1, 'rgba(255,180,90,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, 260, 0, 6.2832); ctx.fill();
    const core = ctx.createRadialGradient(x, y, 0, x, y, 26);
    core.addColorStop(0, 'rgba(255,255,250,1)'); core.addColorStop(0.35, 'rgba(255,248,225,0.95)'); core.addColorStop(1, 'rgba(255,230,170,0)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(x, y, 26, 0, 6.2832); ctx.fill();
    ctx.restore();
  } else {
    const r = b.kind === 'moon' ? 4.2 : Math.max(1.9, Math.min(4.2, 2.6 + (-b.mag) * 0.55));
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4.5);
    g.addColorStop(0, b.color + 'cc'); g.addColorStop(1, b.color + '00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4.5, 0, 6.2832); ctx.fill();
    ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  }
  if (detail > 0.05) {
    ctx.font = '600 11px "Inter Variable", system-ui, sans-serif';
    ctx.fillStyle = `rgba(214,226,248,${0.78 * detail})`;
    ctx.textBaseline = 'middle';
    ctx.fillText(BODY_NAME[b.id][es ? 'es' : 'en'], x + 11, y);
  }
}
