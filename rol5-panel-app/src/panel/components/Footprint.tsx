import { memo, useCallback, useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { fmtP, fmtSlope } from '../format';
import { GPM_FIRST_YEAR, footprintLayout, indexFootprint, winKey, type FpWindow } from '../footprint';
import type { FootprintTuple, Lang, Period, Win } from '../types';

const S = 18; // lado de la casilla
const G = 2; // separación
const PAD = { left: 34, top: 8, right: 8, bottom: 30 };

// Marrón = menos lluvia, verde azulado = más lluvia (divergente apto para daltonismo).
// La significancia va en saturación y borde; el tamaño indica si la ventana cuenta para el veredicto.
function fill(w: FpWindow): string {
  if (w.sign === null) return '#d9d9d9';
  if (w.sign === 0) return '#f5f5f5';
  if (w.sign < 0) return w.significant ? '#8c510a' : '#dfc27d';
  return w.significant ? '#01665e' : '#80cdc1';
}

interface CellsProps {
  windows: FpWindow[];
  period: Period;
  selectedKey: string | null;
}

/** Las 120 casillas solo se vuelven a pintar si cambian los datos o la selección, nunca por el hover. */
const Cells = memo(function Cells({ windows, period, selectedKey }: CellsProps) {
  return (
    <g>
      {windows.map((w) => {
        const inset = w.countsForVerdict ? 0 : 4;
        const selected = w.key === selectedKey;
        return (
          <rect
            key={w.key}
            data-k={w.key}
            x={(w.start - period[0]) * (S + G) + inset}
            y={(period[1] - w.end) * (S + G) + inset}
            width={S - 2 * inset}
            height={S - 2 * inset}
            fill={fill(w)}
            stroke={selected ? '#111' : w.significant ? '#333' : 'none'}
            strokeWidth={selected ? 2.5 : 1}
            style={{ cursor: 'pointer' }}
          />
        );
      })}
    </g>
  );
});

interface Props {
  footprint: FootprintTuple[];
  period: Period;
  selected: Win | null;
  onSelect: (win: Win | null) => void;
  lang: Lang;
}

export const Footprint = memo(function Footprint({ footprint, period, selected, onSelect, lang }: Props) {
  const index = useMemo(() => indexFootprint(footprint), [footprint]);
  const windows = useMemo(() => [...index.values()], [index]);
  const { starts, ends } = useMemo(() => footprintLayout(period), [period]);
  const [hover, setHover] = useState<string | null>(null);
  const selectedKey = selected ? winKey(selected[0], selected[1]) : null;
  const es = lang === 'es';

  const keyAt = (e: { target: EventTarget }) => (e.target as Element).getAttribute?.('data-k') ?? null;
  const onMove = useCallback((e: PointerEvent<SVGSVGElement>) => setHover(keyAt(e)), []);
  const onClick = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      const w = index.get(keyAt(e) ?? '');
      if (!w) return;
      const isBase = w.start === period[0] && w.end === period[1];
      onSelect(isBase || w.key === selectedKey ? null : [w.start, w.end]);
    },
    [index, onSelect, period, selectedKey],
  );
  // Flechas: ←/→ mueven el año de inicio, ↑/↓ el año de fin. Solo se aceptan ventanas que existen.
  const onKey = useCallback(
    (e: KeyboardEvent<SVGSVGElement>) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!d) return;
      e.preventDefault();
      const [s, en] = selected ?? period;
      const next = index.get(winKey(s + d[0], en + d[1]));
      if (next) onSelect(next.start === period[0] && next.end === period[1] ? null : [next.start, next.end]);
    },
    [index, onSelect, period, selected],
  );

  if (windows.length === 0) {
    return <div role="note" className="panel-warning">{es ? 'No hay ventanas calculadas para esta celda.' : 'No windows computed for this cell.'}</div>;
  }

  const w = starts.length * (S + G);
  const h = ends.length * (S + G);
  // Línea de 2014: a su derecha, ventanas solo-GPM; por debajo, ventanas solo-TRMM.
  const x2014 = (GPM_FIRST_YEAR - period[0]) * (S + G) - G / 2;
  const y2014 = (period[1] - GPM_FIRST_YEAR + 1) * (S + G) - G / 2;
  const hw = hover ? index.get(hover) : undefined;

  return (
    <figure className="footprint" data-tour="footprint" style={{ position: 'relative', margin: 0 }}>
      <svg
        width={PAD.left + w + PAD.right}
        height={PAD.top + h + PAD.bottom}
        role="application"
        tabIndex={0}
        aria-label={es ? 'Huella de estabilidad: tendencia por ventana de años. Use las flechas para mover la ventana.' : 'Stability footprint: trend per year window. Use arrow keys to move the window.'}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onPointerUp={onClick}
        onKeyDown={onKey}
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          <Cells windows={windows} period={period} selectedKey={selectedKey} />
          {x2014 > 0 && x2014 < w && <line x1={x2014} x2={x2014} y1={0} y2={h} stroke="#111" strokeDasharray="4 3" pointerEvents="none" />}
          {y2014 > 0 && y2014 < h && <line x1={0} x2={w} y1={y2014} y2={y2014} stroke="#111" strokeDasharray="4 3" pointerEvents="none" />}
          {starts.filter((_, i) => i % 2 === 0).map((y) => (
            <text key={y} x={(y - period[0]) * (S + G) + S / 2} y={h + 12} fontSize={9} textAnchor="middle">{y}</text>
          ))}
          {ends.filter((_, i) => i % 2 === 0).map((y) => (
            <text key={y} x={-4} y={(period[1] - y) * (S + G) + S / 2 + 3} fontSize={9} textAnchor="end">{y}</text>
          ))}
          <text x={w / 2} y={h + 26} fontSize={10} textAnchor="middle">{es ? 'Año de inicio' : 'Start year'}</text>
        </g>
      </svg>
      {hw && (
        <div className="footprint-tip" role="status" style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none' }}>
          <strong>{hw.start}–{hw.end}</strong> ({hw.len} {es ? 'años' : 'years'})<br />
          {fmtSlope(hw.slope, lang)} · p {fmtP(hw.p)} <small>({es ? 'sin corregir' : 'uncorrected'})</small><br />
          {!hw.countsForVerdict && <small>{es ? 'Menos de 15 años: no cuenta para el veredicto. ' : 'Under 15 years: not counted in the verdict. '}</small>}
          <small>
            {hw.era === 'cruza'
              ? es ? 'Cruza el cambio de satélites de 2014.' : 'Spans the 2014 satellite change.'
              : es ? `Solo era ${hw.era.toUpperCase()}.` : `${hw.era.toUpperCase()} era only.`}
          </small>
        </div>
      )}
      <figcaption>
        {es
          ? 'Eje vertical: año de fin. Línea punteada: 2014, cambio de era de satélites (TRMM → GPM). Casillas pequeñas: ventanas de 10 a 14 años.'
          : 'Vertical axis: end year. Dashed line: 2014, satellite era change (TRMM → GPM). Small squares: 10–14-year windows.'}
      </figcaption>
    </figure>
  );
});
