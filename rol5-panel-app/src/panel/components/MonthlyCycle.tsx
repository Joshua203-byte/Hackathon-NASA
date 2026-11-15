import { memo } from 'react';
import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtNum } from '../format';
import type { IndicatorKey, Lang, Num } from '../types';
import { unitLabel } from '../labels';

const MONTHS = {
  es: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  en: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
};
const HIGHLIGHT: Record<IndicatorKey, number[]> = { may_oct_mm: [4, 5, 6, 7, 8, 9], jul_aug_mm: [6, 7], annual_mm: [] };

export const MonthlyCycle = memo(function MonthlyCycle({ values, ind, lang }: { values: Num[]; ind: IndicatorKey; lang: Lang }) {
  const es = lang === 'es';
  if (!Array.isArray(values) || values.length !== 12) return <p role="note" className="notice">{es ? 'Ciclo mensual no disponible.' : 'Monthly cycle not available.'}</p>;
  const hl = HIGHLIGHT[ind];
  const rows = values.map((v, i) => ({ m: MONTHS[lang][i], i, v: typeof v === 'number' && Number.isFinite(v) ? v : null }));
  return (
    <figure data-tour="cycle" style={{ margin: 0 }}>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
          <CartesianGrid strokeOpacity={0.2} vertical={false} />
          <XAxis dataKey="m" interval={0} />
          <YAxis width={44} label={{ value: unitLabel('mm/mes', lang), angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip isAnimationActive={false} formatter={(v) => [fmtNum(typeof v === 'number' ? v : null), unitLabel('mm/mes', lang)]} />
          <Bar dataKey="v" isAnimationActive={false}>
            {rows.map((r) => <Cell key={r.i} fill={hl.includes(r.i) ? '#1f6fb2' : '#9db7cf'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <figcaption>{es ? 'Lluvia media mensual de esta celda en el periodo. Resaltado: meses del indicador.' : 'Mean monthly rainfall of this cell over the period. Highlighted: indicator months.'}</figcaption>
    </figure>
  );
});
