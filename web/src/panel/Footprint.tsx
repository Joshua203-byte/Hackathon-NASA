import { useState } from 'react';
import type { FootprintWindow, Lang } from '../types';
import { fmt, fmtP, t } from '../i18n';
import { ChartTooltip } from './ChartTooltip';

interface Props {
  footprint: FootprintWindow[];
  period: [number, number];
  units: string;
  lang: Lang;
  win: [number, number] | null;
  onPick: (w: [number, number] | null) => void;
  verdictMinLen?: number;
  markYear?: number;
  alpha?: number;
}

const C = 22; // tamaño de casilla
const GAP = 2; // separación de superficie entre casillas
const M = { top: 12, right: 12, bottom: 40, left: 48 };

export function Footprint({ footprint, period, units, lang, win, onPick, verdictMinLen = 15, markYear = 2014, alpha = 0.05 }: Props) {
  const [hover, setHover] = useState<FootprintWindow | null>(null);
  const [a, b] = period;
  const minLen = footprint.length ? Math.min(...footprint.map((w) => w[1] - w[0] + 1)) : 10;
  const starts = Array.from({ length: b - a - minLen + 2 }, (_, i) => a + i); // eje X
  const ends = Array.from({ length: b - a - minLen + 2 }, (_, i) => a + minLen - 1 + i); // eje Y
  const W = M.left + starts.length * C + M.right;
  const H = M.top + ends.length * C + M.bottom;
  const cx = (s: number) => M.left + (s - a) * C;
  const cy = (e: number) => M.top + (b - e) * C; // fin más reciente arriba

  const cls = (w: FootprintWindow) => {
    if (w[2] === null || w[3] === null) return 'fp-none';
    const sig = w[3] < alpha;
    if (w[2] < 0) return sig ? 'fp-neg-sig' : 'fp-neg';
    if (w[2] > 0) return sig ? 'fp-pos-sig' : 'fp-pos';
    return 'fp-zero';
  };

  const isBase = (w: FootprintWindow) => w[0] === a && w[1] === b;
  const isSel = (w: FootprintWindow) => !!win && w[0] === win[0] && w[1] === win[1];
  const pick = (w: FootprintWindow) => onPick(isSel(w) ? null : [w[0], w[1]]);

  // línea que separa las ventanas de ≥ verdictMinLen años: fin − inicio + 1 = verdictMinLen
  const diag = starts
    .filter((s) => s + verdictMinLen - 1 <= b)
    .map((s) => [cx(s), cy(s + verdictMinLen - 1) + C] as const);

  return (
    <figure className="chart footprint">
      <figcaption className="chart-title">{t('footprint', lang)}</figcaption>
      <p className="chart-help">{t('footprint_help', lang)}</p>
      <div className="chart-box">
        <svg viewBox={`0 0 ${W} ${H}`} role="grid" aria-label={t('footprint', lang)} style={{ maxWidth: W * 1.4 }}>
          {footprint.map((w) => (
            <rect
              key={`${w[0]}-${w[1]}`}
              className={`fp-cell ${cls(w)} ${isSel(w) ? 'fp-selected' : ''}`}
              x={cx(w[0]) + GAP / 2}
              y={cy(w[1]) + GAP / 2}
              width={C - GAP}
              height={C - GAP}
              rx={3}
              tabIndex={0}
              role="gridcell"
              aria-label={`${w[0]}–${w[1]}: ${fmt(w[2], 1, true)} ${units}/${t('per_decade', lang)}, p ${fmtP(w[3])}`}
              aria-selected={isSel(w)}
              onPointerEnter={() => setHover(w)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(w)}
              onBlur={() => setHover(null)}
              onClick={() => pick(w)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pick(w);
                }
              }}
            />
          ))}
          {/* periodo base: anillo */}
          {footprint.filter(isBase).map((w) => (
            <circle key="base" className="fp-base" cx={cx(w[0]) + C / 2} cy={cy(w[1]) + C / 2} r={4} pointerEvents="none" />
          ))}
          {/* separación de ventanas cortas */}
          {diag.length > 1 && (
            <polyline
              className="fp-diag"
              points={diag.map(([x, y]) => `${x},${y} ${x + C},${y}`).join(' ')}
              pointerEvents="none"
            />
          )}
          {/* 2014: las ventanas arriba a la izquierda de estas líneas (inicio ≤ 2014 ≤ fin) cruzan el cambio de satélites */}
          {markYear >= a && markYear <= b && (
            <g pointerEvents="none">
              {markYear + 1 <= starts[starts.length - 1] && (
                <line className="mark-2014" x1={cx(markYear + 1)} x2={cx(markYear + 1)} y1={M.top} y2={M.top + ends.length * C} />
              )}
              {markYear - 1 >= ends[0] && (
                <line className="mark-2014" x1={M.left} x2={M.left + starts.length * C} y1={cy(markYear - 1)} y2={cy(markYear - 1)} />
              )}
            </g>
          )}
          {/* ejes */}
          {starts.filter((s) => (s - a) % 2 === 0).map((s) => (
            <text key={s} className="axis-label" x={cx(s) + C / 2} y={M.top + ends.length * C + 14} textAnchor="middle">
              {`'${String(s).slice(2)}`}
            </text>
          ))}
          {ends.filter((e) => (b - e) % 2 === 0).map((e) => (
            <text key={e} className="axis-label" x={M.left - 6} y={cy(e) + C / 2} dy="0.32em" textAnchor="end">
              {e}
            </text>
          ))}
          <text className="axis-label" x={M.left + (starts.length * C) / 2} y={H - 6} textAnchor="middle">
            {t('start_year', lang)} →
          </text>
          <text className="axis-label" x={10} y={M.top + (ends.length * C) / 2} transform={`rotate(-90 10 ${M.top + (ends.length * C) / 2})`} textAnchor="middle">
            {t('end_year', lang)} →
          </text>
        </svg>
        {hover && (
          <ChartTooltip x={((cx(hover[0]) + C) / W) * 100} y={((cy(hover[1])) / H) * 100}>
            <strong>
              {t('window', lang)} {hover[0]}–{hover[1]} ({hover[1] - hover[0] + 1} {lang === 'es' ? 'años' : 'years'})
            </strong>
            {hover[2] === null ? (
              <div>{t('no_data', lang)}</div>
            ) : (
              <>
                <div>
                  {t('slope', lang)}: {fmt(hover[2], 1, true)} {units} {t('per_decade', lang)}
                </div>
                <div>p: {fmtP(hover[3])}</div>
              </>
            )}
            {isBase(hover) && <div className="muted">{t('base_period', lang)}</div>}
            {hover[0] <= markYear && hover[1] >= markYear && (
              <div className="muted">{lang === 'es' ? 'Cruza 2014 (cambio de satélites)' : 'Crosses 2014 (satellite change)'}</div>
            )}
          </ChartTooltip>
        )}
      </div>
      <ul className="legend">
        <li><span className="key key-swatch fp-neg-sig" />{t('drier', lang)}</li>
        <li><span className="key key-swatch fp-neg" />{t('drier_ns', lang)}</li>
        <li><span className="key key-swatch fp-pos-sig" />{t('wetter', lang)}</li>
        <li><span className="key key-swatch fp-pos" />{t('wetter_ns', lang)}</li>
        <li><span className="key key-swatch fp-none" />{t('no_data', lang)}</li>
        <li><span className="key key-base" />{t('base_period', lang)}</li>
        <li><span className="key key-2014" />2014</li>
      </ul>
      <p className="chart-help">{t('min15', lang)}</p>
      <p className="warning-note" role="note">⚠ {t('overlap_warning', lang)}</p>
    </figure>
  );
}
