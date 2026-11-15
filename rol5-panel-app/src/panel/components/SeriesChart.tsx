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

  return (
    <figure data-tour={tourAnchor ?? undefined} style={{ margin: 0 }}>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid strokeOpacity={0.2} />
          <XAxis dataKey="year" type="number" domain={[period[0], period[1]]} tickCount={7} allowDecimals={false} />
          <YAxis width={56} domain={yDomain ?? ['auto', 'auto']} label={{ value: unitLabel(data.units, lang), angle: -90, position: 'insideLeft' }} />
          <Tooltip
            isAnimationActive={false}
            formatter={(v, name) => [Array.isArray(v) ? v.map((x) => fmtNum(Number(x))).join(' – ') : fmtNum(typeof v === 'number' ? v : null), name]}
          />
          {selected && <ReferenceArea x1={selected.start} x2={selected.end} fillOpacity={0.08} />}
          {satelliteEra && <ReferenceLine x={GPM_FIRST_YEAR} strokeDasharray="4 3" label={{ value: 'TRMM → GPM', position: 'insideTopRight', fontSize: 10 }} />}
          {/* IC 95 % de la pendiente (abanico), no de los valores */}
          <Area dataKey="band" name={es ? 'IC 95 % de la pendiente' : '95% CI of the slope'} stroke="none" fill="#555" fillOpacity={0.15} isAnimationActive={false} connectNulls={false} />
          <Line dataKey="sen" name={es ? 'Recta de Sen (periodo base)' : 'Sen line (base period)'} stroke="#555" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          <Line dataKey="winSen" name={es ? 'Recta de Sen (ventana)' : 'Sen line (window)'} stroke="#111" dot={false} strokeWidth={2.5} isAnimationActive={false} connectNulls={false} />
          {/* connectNulls={false}: un año sin dato corta la línea; nunca se dibuja como 0 */}
          <Line dataKey="value" name={unitLabel(data.units, lang)} stroke="#1f6fb2" strokeWidth={1.5} dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <figcaption>
        {!data.statistics?.ci_95 ? (es ? 'Sin intervalo de confianza proporcionado por el pipeline. Los años sin dato quedan en blanco.' : 'No confidence interval supplied by the pipeline. Missing years are left blank.') : es
          ? 'La banda es el IC 95 % de la pendiente, no un rango de valores esperados. Los años sin dato quedan en blanco.'
          : 'The band is the 95% CI of the slope, not a range of expected values. Years without data are left blank.'}
      </figcaption>
    </figure>
  );
});
