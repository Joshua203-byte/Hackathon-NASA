import { memo, useMemo } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtNum } from '../format';
import { GPM_FIRST_YEAR, type FpWindow } from '../footprint';
import { buildChartRows, senGeometry } from '../sen';
import type { CellIndicator, Lang, Period } from '../types';
import { unitLabel } from '../labels';

interface Props {
  data: Omit<CellIndicator, 'verdict'>;
  period: Period;
  /** Ventana elegida en la huella; null = periodo base. */
  selected: FpWindow | null;
  lang: Lang;
  /** Dominio Y compartido (vista espejo). */
  yDomain?: [number, number];
  satelliteEra?: boolean;
  /** Ancla del recorrido; null en gráficos secundarios para que el recorrido y las pruebas apunten a la lluvia. */
  tourAnchor?: string | null;
}

export const SeriesChart = memo(function SeriesChart({ data, period, selected, lang, yDomain, satelliteEra = true, tourAnchor = 'series' }: Props) {
  const es = lang === 'es';
  const rows = useMemo(() => {
    const s = data.statistics;
    const base = senGeometry(data.series, s?.slope_per_decade ?? null, s?.ci_95 ?? null, period);
    const sel = selected ? senGeometry(data.series, selected.slope, [selected.ciLo, selected.ciHi], [selected.start, selected.end]) : null;
    return buildChartRows(data.series, period, base, sel);
  }, [data, period, selected]);

  const slope = data.statistics?.slope_per_decade;
  const trendColor = typeof slope === 'number' && slope < 0 ? '#8c510a' : typeof slope === 'number' && slope > 0 ? '#01665e' : '#555';

  return (
    <figure data-tour={tourAnchor ?? undefined} style={{ margin: 0 }}>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
          <CartesianGrid strokeOpacity={0.2} />
          <XAxis dataKey="year" type="number" domain={[period[0], period[1]]} tickCount={7} allowDecimals={false} />
          <YAxis width={56} domain={yDomain ?? ['auto', 'auto']} label={{ value: unitLabel(data.units, lang), angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, fontSize: 12 }} />
          <Tooltip
            isAnimationActive={false}
            formatter={(v, name) => [Array.isArray(v) ? v.map((x) => fmtNum(Number(x))).join(' – ') : fmtNum(typeof v === 'number' ? v : null), name]}
          />
          {selected && <ReferenceArea x1={selected.start} x2={selected.end} fillOpacity={0.08} />}
          {satelliteEra && <ReferenceLine x={GPM_FIRST_YEAR} strokeDasharray="4 3" label={{ value: 'TRMM → GPM', position: 'insideTopRight', fontSize: 10 }} />}
          {/* IC 95 % de la pendiente (abanico), no de los valores */}
          <Area dataKey="band" name={es ? 'Margen de error de la tendencia' : 'Margin of error of the trend'} stroke="none" fill={trendColor} fillOpacity={0.16} isAnimationActive animationDuration={700} connectNulls={false} />
          <Line dataKey="sen" name={es ? 'Tendencia estimada (periodo completo)' : 'Estimated trend (full period)'} stroke={trendColor} dot={false} strokeWidth={1.5} isAnimationActive={false} />
          <Line dataKey="winSen" name={es ? 'Tendencia estimada (años elegidos)' : 'Estimated trend (chosen years)'} stroke="#111" dot={false} strokeWidth={2.5} isAnimationActive={false} connectNulls={false} />
          {/* connectNulls={false}: un año sin dato corta la línea; nunca se dibuja como 0 */}
          <Line dataKey="value" name={unitLabel(data.units, lang)} stroke="#44586a" strokeWidth={2} dot={{ r: 3.5, strokeWidth: 0, fill: '#44586a' }} activeDot={{ r: 6 }} isAnimationActive animationDuration={900} connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <ul className="chart-legend" aria-label={es ? 'Leyenda' : 'Legend'} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', listStyle: 'none', padding: 0, margin: '4px 0', fontSize: 12 }}>
        <li><span aria-hidden="true" style={{ color: '#44586a' }}>●</span> {es ? 'lluvia de cada año' : 'rainfall each year'}</li>
        <li><span aria-hidden="true" style={{ color: trendColor, fontWeight: 700 }}>—</span> {es ? 'tendencia estimada' : 'estimated trend'}</li>
        <li><span aria-hidden="true" style={{ color: trendColor, opacity: 0.5 }}>▒</span> {es ? 'margen de error de la tendencia' : 'margin of error of the trend'}</li>
      </ul>
      <figcaption>
        {!data.statistics?.ci_95 ? (es ? 'Sin intervalo de confianza proporcionado por el pipeline. Los años sin dato quedan en blanco.' : 'No confidence interval supplied by the pipeline. Missing years are left blank.') : es
          ? 'Cada punto es la lluvia de un año. La banda sombreada muestra hasta dónde podría llegar la recta con estos datos: si es ancha o cruza la horizontal, la tendencia es incierta. Los años sin dato quedan en blanco.'
          : 'Each dot is the rainfall of one year. The shaded band shows how far the line could go with these data: if it is wide or crosses the horizontal, the trend is uncertain. Years without data are left blank.'}
      </figcaption>
    </figure>
  );
});
