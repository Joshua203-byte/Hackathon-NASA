import { useState } from 'react';
import type { IndicatorKey, Lang } from '../types';
import { fmt, t } from '../i18n';
import { ChartTooltip } from './ChartTooltip';

const IND_MONTHS: Record<IndicatorKey, number[]> = {
  may_oct_mm: [4, 5, 6, 7, 8, 9],
  jul_aug_mm: [6, 7],
  annual_mm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

const W = 300;
const H = 110;
const M = { top: 8, bottom: 18, left: 4, right: 4 };

/** Mini gráfica del ciclo mensual (12 barras). Resalta los meses del indicador elegido. */
export function Climatology({ values, ind, lang }: { values: number[]; ind: IndicatorKey; lang: Lang }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...values);
  const labels = t('months', lang).split(',');
  const bw = (W - M.left - M.right) / 12;
  const ih = H - M.top - M.bottom;
  const months = new Set(IND_MONTHS[ind]);
  return (
    <figure className="chart climatology">
      <figcaption className="chart-title">{t('climatology', lang)}</figcaption>
      <div className="chart-box">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('climatology', lang)}>
          {values.map((v, i) => {
            const h = (v / max) * ih;
            const x = M.left + i * bw + 1;
            return (
              <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <rect x={M.left + i * bw} y={M.top} width={bw} height={ih} fill="transparent" />
                <path
                  className={`clim-bar ${months.has(i) ? 'clim-on' : ''}`}
                  d={roundedTopBar(x, M.top + ih - h, bw - 2, h, Math.min(4, h))}
                />
                <text className="axis-label" x={x + (bw - 2) / 2} y={H - 4} textAnchor="middle">
                  {labels[i]}
                </text>
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <ChartTooltip x={((M.left + hover * bw + bw) / W) * 100} y={5}>
            <strong>{labels[hover]}</strong> {fmt(values[hover], 0)} mm
          </ChartTooltip>
        )}
      </div>
    </figure>
  );
}

function roundedTopBar(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0) return '';
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}
