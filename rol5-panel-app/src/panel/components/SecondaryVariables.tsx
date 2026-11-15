import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { CellDetail, CellIndicator, Lang, Period } from '../types';
import { VERDICT_UI } from '../verdict';
import { SeriesChart } from './SeriesChart';
import { fmtNum, fmtP, fmtSigned } from '../format';

export function pairedSeries(rain: Pick<CellIndicator, 'series'>, other: Pick<CellIndicator, 'series'>) {
  const by = new Map(other.series.map(p => [p.year, p.value]));
  return rain.series.flatMap(p => { const y = by.get(p.year); return Number.isFinite(p.value) && typeof y === 'number' && Number.isFinite(y) ? [{ year: p.year, rain: p.value as number, other: y }] : []; });
}
export function SecondaryVariables({ cell, rain, lang }: { cell: CellDetail; rain: CellIndicator; period: Period; lang: Lang }) {
  const es = lang === 'es';
  return <section data-tour="secondary"><h3>{es ? 'Segunda variable NASA' : 'Second NASA variable'}</h3>
    {!cell.secondary_variables?.length && <p className="notice">{es ? 'Análisis cuantitativo pendiente: el pipeline no ha proporcionado una segunda variable para este sitio.' : 'Quantitative analysis pending: the pipeline has not supplied a second variable for this site.'}</p>}
    {cell.secondary_variables?.map(v => { const pairs = pairedSeries(rain, v.data); return <article key={v.key}>
      <h4>{v.label[lang]}</h4><p>{v.source}{v.doi ? ` · DOI: ${v.doi}` : ''} · {v.period.join('–')}</p>
      <p>{es ? 'Pendiente por década' : 'Slope per decade'}: {fmtSigned(v.data.statistics?.slope_per_decade, 2)} {v.data.units} · {es ? 'IC 95 %' : '95% CI'} [{fmtNum(v.data.statistics?.ci_95?.[0], 2)}, {fmtNum(v.data.statistics?.ci_95?.[1], 2)}] · p {fmtP(v.data.statistics?.p_value)}
        {v.data.verdict ? ` · ${VERDICT_UI[v.data.verdict].label[lang]}` : ''}</p>
      {!v.data.verdict && <p className="legend">{es ? 'Sin veredicto: prueba en un solo punto, sin corrección FDR, huella de ventanas ni control ENSO. Otra fuente y otra resolución (~0,5°) que la lluvia.' : 'No verdict: single-point test, without FDR correction, window footprint or ENSO control. Different source and resolution (~0.5°) from the rainfall.'}</p>}
      <SeriesChart data={v.data} period={v.period} selected={null} lang={lang} satelliteEra={false} tourAnchor={null} />
      <h4>{es ? 'Matriz territorial: lluvia y segunda variable' : 'Territorial matrix: rainfall and second variable'}</h4>
      <p>{es ? 'Solo años con ambas observaciones. Asociación, no causa.' : 'Only years with both observations. Association, not cause.'} n = {pairs.length}</p>
      {pairs.length > 0 && <ResponsiveContainer width="100%" height={260}><ScatterChart margin={{ bottom: 30, left: 25, right: 15 }}><CartesianGrid /><XAxis type="number" dataKey="rain" domain={['auto', 'auto']} name={es ? 'Lluvia' : 'Rainfall'} unit={rain.units} label={{ value: rain.units, position: 'bottom' }} /><YAxis type="number" dataKey="other" domain={['auto', 'auto']} name={v.label[lang]} unit={v.data.units} label={{ value: v.data.units, angle: -90, position: 'insideLeft' }} /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter data={pairs} fill="#01665e" isAnimationActive={false} /></ScatterChart></ResponsiveContainer>}
    </article>; })}
  </section>;
}
