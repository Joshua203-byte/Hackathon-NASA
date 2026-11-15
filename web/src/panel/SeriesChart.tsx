import { useMemo, useState } from 'react';
import type { Lang, SeriesPoint, Statistics } from '../types';
import { fmt, t } from '../i18n';
import { ChartTooltip } from './ChartTooltip';
import { niceTicks, senLineValue, windowSen } from './chartUtils';

interface Props {
  series: SeriesPoint[];
  stats: Statistics;
  units: string;
  lang: Lang;
  win: [number, number] | null;
  mode?: 'line' | 'enso';
  hideStrong?: boolean;
  yMax?: number; // escala compartida (vista espejo)
  title?: string;
  markYear?: number;
}

const W = 640;
const H = 240;
const M = { top: 16, right: 16, bottom: 30, left: 52 };

export function SeriesChart({ series, stats, units, lang, win, mode = 'line', hideStrong = false, yMax, title, markYear = 2014 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const years = series.map((d) => d.year);
  const x0 = years[0];
  const x1 = years[years.length - 1];
  const valid = series.filter((d) => d.value !== null) as (SeriesPoint & { value: number })[];
  const maxV = yMax ?? Math.max(1, ...valid.map((d) => d.value)) * 1.08;
  const ticks = niceTicks(0, maxV, 4);
  const yTop = Math.max(maxV, ticks[ticks.length - 1]);

  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const band = iw / series.length;
  const sx = (yr: number) => M.left + ((yr - x0 + 0.5) / (x1 - x0 + 1)) * iw;
  const sy = (v: number) => M.top + ih - (v / yTop) * ih;

  const sen = useMemo(() => {
    const s = stats.slope_per_decade;
    if (s === null || stats.intercept === null) return null;
    const iy = stats.intercept_year ?? x0;
    const f = (yr: number) => senLineValue(stats.intercept as number, s, iy, yr);
    // banda del IC: rectas con las pendientes extremas que pivotan en (año mediano, recta de Sen)
    const vy = valid.map((d) => d.year).sort((a, b) => a - b);
    const medYear = vy.length ? (vy[Math.floor((vy.length - 1) / 2)] + vy[Math.ceil((vy.length - 1) / 2)]) / 2 : x0;
    const pivot = f(medYear);
    const [lo, hi] = stats.ci_95;
    const band =
      lo !== null && hi !== null
        ? [x0, x1].map((yr) => [pivot + (lo / 10) * (yr - medYear), pivot + (hi / 10) * (yr - medYear)])
        : null;
    return { f, band };
  }, [stats, valid, x0, x1]);

  const winLine = useMemo(() => (win ? windowSen(series, win) : null), [series, win]);

  const linePath = valid
    .filter((d) => !(hideStrong && d.enso_strong))
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${sx(d.year)},${sy(d.value)}`)
    .join(' ');

  const hovered = hover !== null ? series.find((d) => d.year === hover) : null;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    const yr = Math.round(x0 + ((p.x - M.left) / iw) * (x1 - x0 + 1) - 0.5);
    setHover(Math.min(x1, Math.max(x0, yr)));
  };

  const phaseClass = (d: SeriesPoint) => (d.enso ? `phase-${d.enso}` : 'phase-none');

  return (
    <figure className="chart">
      {title && <figcaption className="chart-title">{title}</figcaption>}
      <div className="chart-box">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title ?? t('series', lang)} (${units})`}>
          {/* rejilla y eje Y */}
          {ticks.map((v) => (
            <g key={v}>
              <line className="grid" x1={M.left} x2={W - M.right} y1={sy(v)} y2={sy(v)} />
              <text className="axis-label" x={M.left - 8} y={sy(v)} dy="0.32em" textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          <text className="axis-label" x={12} y={M.top + ih / 2} transform={`rotate(-90 12 ${M.top + ih / 2})`} textAnchor="middle">
            {units}
          </text>
          {/* eje X */}
          {years
            .filter((yr) => yr % 5 === 0 || yr === x0 || yr === x1)
            .map((yr) => (
              <text key={yr} className="axis-label" x={sx(yr)} y={H - 10} textAnchor="middle">
                {yr}
              </text>
            ))}

          {/* ventana elegida */}
          {win && (
            <rect
              className="win-shade"
              x={sx(win[0]) - band / 2}
              width={sx(win[1]) - sx(win[0]) + band}
              y={M.top}
              height={ih}
            />
          )}

          {/* 2014: cambio de era de satélites */}
          {markYear >= x0 && markYear <= x1 && (
            <g>
              <line className="mark-2014" x1={sx(markYear) - band / 2} x2={sx(markYear) - band / 2} y1={M.top} y2={M.top + ih}>
                <title>{t('satellite_era', lang)}</title>
              </line>
              <text className="axis-label mark-label" x={sx(markYear) - band / 2 + 4} y={M.top + 10}>
                2014
              </text>
            </g>
          )}

          {mode === 'enso' ? (
            valid.map((d) => (
              <rect
                key={d.year}
                className={`enso-bar ${phaseClass(d)} ${hideStrong && d.enso_strong ? 'faded' : ''}`}
                x={sx(d.year) - band * 0.35}
                width={band * 0.7}
                y={sy(d.value)}
                height={sy(0) - sy(d.value)}
                rx={2}
              />
            ))
          ) : (
            <>
              {sen?.band && (
                <polygon
                  className="ci-band"
                  points={`${sx(x0)},${sy(sen.band[0][0])} ${sx(x1)},${sy(sen.band[1][0])} ${sx(x1)},${sy(sen.band[1][1])} ${sx(x0)},${sy(sen.band[0][1])}`}
                />
              )}
              <path className="series-line" d={linePath} />
              {valid.map((d) => (
                <circle
                  key={d.year}
                  className={`series-dot ${hideStrong && d.enso_strong ? 'faded' : ''}`}
                  cx={sx(d.year)}
                  cy={sy(d.value)}
                  r={hover === d.year ? 5.5 : 4}
                />
              ))}
            </>
          )}

          {sen && (
            <line className="sen-line" x1={sx(x0)} x2={sx(x1)} y1={sy(sen.f(x0))} y2={sy(sen.f(x1))} />
          )}
          {winLine && (
            <line className="win-line" x1={sx(win![0])} x2={sx(win![1])} y1={sy(winLine.f(win![0]))} y2={sy(winLine.f(win![1]))} />
          )}

          {/* años sin dato: marca sobre el eje, nunca un cero */}
          {series
            .filter((d) => d.value === null)
            .map((d) => (
              <text key={d.year} className="missing-mark" x={sx(d.year)} y={M.top + ih - 4} textAnchor="middle">
                ×<title>{t('no_data', lang)}</title>
              </text>
            ))}

          {hovered && <line className="crosshair" x1={sx(hovered.year)} x2={sx(hovered.year)} y1={M.top} y2={M.top + ih} />}
          <rect
            x={M.left}
            y={M.top}
            width={iw}
            height={ih}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
        {hovered && (
          <ChartTooltip x={((sx(hovered.year) / W) * 100)} y={10}>
            <strong>{hovered.year}</strong>
            <div>
              {t('value', lang)}: {fmt(hovered.value)} {units}
            </div>
            <div>
              {t('anomaly', lang)}: {fmt(hovered.anomaly, 1, true)}
            </div>
            {hovered.enso && (
              <div>
                {t('phase', lang)}: {t(hovered.enso, lang)}
                {hovered.enso_strong ? ` (${t('strong', lang)})` : ''}
              </div>
            )}
            {hovered.year === markYear && <div className="muted">{t('satellite_era', lang)}</div>}
          </ChartTooltip>
        )}
      </div>
      <ul className="legend">
        {mode === 'line' ? (
          <>
            <li><span className="key key-dot" />{t('value', lang)}</li>
            <li><span className="key key-sen" />{t('sen', lang)}</li>
            <li><span className="key key-ci" />{t('ci', lang)}</li>
            {win && <li><span className="key key-win" />{t('chosen_window', lang)} {win[0]}–{win[1]}</li>}
          </>
        ) : (
          <>
            <li><span className="key key-swatch phase-nino" />{t('nino', lang)}</li>
            <li><span className="key key-swatch phase-nina" />{t('nina', lang)}</li>
            <li><span className="key key-swatch phase-neutral" />{t('neutral', lang)}</li>
            <li><span className="key key-sen" />{t('sen', lang)}</li>
          </>
        )}
        <li><span className="key key-2014" />2014: {t('satellite_era', lang)}</li>
      </ul>
      <details className="table-view">
        <summary>{t('table_view', lang)}</summary>
        <table>
          <thead>
            <tr><th>{t('year', lang)}</th><th>{t('value', lang)} ({units})</th><th>{t('anomaly', lang)}</th><th>{t('phase', lang)}</th></tr>
          </thead>
          <tbody>
            {series.map((d) => (
              <tr key={d.year}>
                <td>{d.year}</td><td>{fmt(d.value)}</td><td>{fmt(d.anomaly, 1, true)}</td>
                <td>{d.enso ? `${t(d.enso, lang)}${d.enso_strong ? ` (${t('strong', lang)})` : ''}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
