import { memo, useMemo } from 'react';
import { Bar, BarChart, Cell, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtP, fmtSlope } from '../format';
import type { RefData } from '../refs';
import type { CellIndicator, EnsoPhase, Lang, Period } from '../types';
import { unitLabel } from '../labels';

const COLOR: Record<EnsoPhase, string> = { nino: '#d95f02', nina: '#1f6fb2', neutral: '#9a9a9a' };
// Letra bajo cada barra: la fase no depende solo del color.
const LETTER: Record<EnsoPhase, string> = { nino: 'N', nina: 'Ñ', neutral: '·' };

interface Props {
  data: CellIndicator;
  period: Period;
  enso: RefData['enso'];
  /** enso=on en la URL. */
  strongOff: boolean;
  onToggle: (on: boolean) => void;
  lang: Lang;
}

export const EnsoView = memo(function EnsoView({ data, period, enso, strongOff, onToggle, lang }: Props) {
  const es = lang === 'es';
  const rows = useMemo(() => {
    const by = new Map(data.series.map((p) => [p.year, p]));
    const out = [];
    for (let year = period[0]; year <= period[1]; year++) {
      const p = by.get(year);
      out.push({ year, anomaly: typeof p?.anomaly === 'number' ? p.anomaly : null, phase: (p?.enso ?? null) as EnsoPhase | null, strong: enso?.years?.[String(year)]?.strong === true });
    }
    return out;
  }, [data, period, enso]);

  const e = data.enso_test;
  const s = data.statistics;
  const toggleOk = e !== null && enso !== null;
  const shown = strongOff && e
    ? { label: es ? 'Sin años ENSO fuertes' : 'Without strong ENSO years', slope: e.slope_without_strong_enso, p: e.p_without_strong_enso }
    : { label: es ? 'Periodo base completo' : 'Full base period', slope: s?.slope_per_decade ?? null, p: s?.p_value ?? null };

  return (
    <section data-tour="enso">
      <h3>{es ? 'El Niño y La Niña (ENSO)' : 'El Niño and La Niña (ENSO)'}</h3>
      <p className="card-hint">{es ? 'Cada barra es un año: cuánto llovió por encima o por debajo de lo normal. El color indica si fue año de El Niño o de La Niña.' : 'Each bar is one year: how far rainfall was above or below normal. Colour shows whether it was an El Niño or La Niña year.'}</p>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 14, left: 4 }}>
          <CartesianGrid strokeOpacity={0.2} vertical={false} />
          <XAxis dataKey="year" interval={1} height={34}
            tick={({ x, y, payload }) => {
              const r = rows.find((q) => q.year === payload.value);
              return <g transform={`translate(${x},${y})`}><text dy={12} fontSize={9} textAnchor="middle">{String(payload.value).slice(2)}</text><text dy={24} fontSize={10} textAnchor="middle">{r?.phase ? LETTER[r.phase] : ''}</text></g>;
            }} />
          <YAxis width={48} label={{ value: unitLabel(data.units, lang), angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <ReferenceLine y={0} stroke="#666" />
          <Tooltip isAnimationActive={false} formatter={(v) => [typeof v === 'number' ? v.toFixed(1) : '—', es ? 'Anomalía' : 'Anomaly']} labelFormatter={(y) => { const r = rows.find((q) => q.year === y); return `${y} · ${r?.phase ?? '—'}${r?.strong ? (es ? ' (fuerte)' : ' (strong)') : ''}`; }} />
          <Bar dataKey="anomaly" isAnimationActive={false}>
            {rows.map((r) => <Cell key={r.year} fill={r.phase ? COLOR[r.phase] : '#ccc'} fillOpacity={strongOff && r.strong ? 0.2 : 1} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="legend enso-legend">
        <span><i style={{ background: COLOR.nino }} /> N = El Niño</span> · <span><i style={{ background: COLOR.nina }} /> Ñ = La Niña</span> · <span><i style={{ background: COLOR.neutral }} /> · = {es ? 'neutral' : 'neutral'}</span>
      </p>
      <label className="toggle">
        <input type="checkbox" checked={strongOff && toggleOk} disabled={!toggleOk} onChange={(ev) => onToggle(ev.target.checked)} />
        {es ? ' Quitar años ENSO fuertes' : ' Remove strong ENSO years'}
      </label>
      {!toggleOk && <p role="note" className="notice">{es ? 'Prueba ENSO no disponible para esta celda.' : 'ENSO test not available for this cell.'}</p>}
      <p><strong>{shown.label}:</strong> {fmtSlope(shown.slope, lang)} · p {fmtP(shown.p)}</p>
      {strongOff && e && <p>{es ? 'Descontando ONI:' : 'ONI removed:'} {fmtSlope(e.slope_oni_removed, lang)} · p {fmtP(e.p_oni_removed)}</p>}
      {e && <p>{es ? 'La tendencia se mantiene al descontar ENSO:' : 'The trend holds after removing ENSO:'} <strong>{e.survives === null ? '—' : e.survives ? (es ? 'sí' : 'yes') : 'no'}</strong></p>}
      <p className="notice">{es ? 'Asociación, no causa. Hay pocos años El Niño en el registro.' : 'Association, not cause. There are few El Niño years in the record.'}</p>
    </section>
  );
});
