import React, { useCallback, useEffect, useMemo } from 'react';
import { fmtNum, fmtP, fmtSlope } from '../format';
import { indexFootprint, resolveWindow } from '../footprint';
import { parseWin, usePanelUrl } from '../urlState';
import { verdictNotices } from '../verdict';
import type { RefData } from '../refs';
import type { CellDetail, GridCell, Meta, Win } from '../types';
import { DecisionCards } from './DecisionCards';
import { EnsoView } from './EnsoView';
import { Footprint } from './Footprint';
import { MirrorView } from './MirrorView';
import { MonthlyCycle } from './MonthlyCycle';
import { Narrative } from './Narrative';
import { PassportView } from './PassportView';
import { TourOverlay } from './TourOverlay';
import { SectionBoundary } from './SectionBoundary';
import { SeriesChart } from './SeriesChart';
import { selectIndicator } from '../lenses';
import { SecondaryVariables } from './SecondaryVariables';
import { Glossary } from './Glossary';
import { VERDICT_UI, reasonText } from '../verdict';
import { VerdictBadge } from './VerdictBadge';
import { COUNTRY, IND_LABEL, unitLabel } from '../labels';
import { CASES } from '../cases';

/** Tarjeta de sección: título en lenguaje simple y una línea de cómo leerla. */
function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return <section className="card"><h3>{title}</h3>{hint && <p className="card-hint">{hint}</p>}{children}</section>;
}

export type CellStatus = 'idle' | 'loading' | 'ready' | 'error';

interface Props {
  /** Rol 4 descarga cells/{id}.json y lo entrega aquí junto con su fila de grid.json. */
  cell: CellDetail | null;
  gridRow: GridCell | null;
  meta: Meta;
  status: CellStatus;
  refs: RefData;
  /** Segunda celda para la vista espejo (case=3), ya descargada por Rol 4. */
  mirror?: CellDetail | null;
}

export function CellPanel({ cell, gridRow, meta, status, refs, mirror }: Props) {
  const [url, setUrl] = usePanelUrl();
  const { lang } = url;
  const es = lang === 'es';
  const d = cell?.indicators[url.ind] ?? null;
  const period = meta.period;
  useEffect(() => {
    if (!cell) return;
    const ind = selectIndicator(url.lens, url.ind, meta, cell);
    if (ind !== url.ind) setUrl({ ind, win: null });
  }, [cell, meta, url.lens, url.ind, setUrl]);

  const index = useMemo(() => indexFootprint(d?.footprint, d?.window_results), [d]);
  const sel = useMemo(() => resolveWindow(index, url.win, period), [index, url.win, period]);
  const onSelect = useCallback((win: Win | null) => setUrl({ win }), [setUrl]);

  if (status === 'idle' || !url.cell) return <aside className="panel panel-empty"><p className="empty-hint">{es ? '👆 Toca una celda del mapa o abre uno de los tres ejemplos para ver su evidencia.' : '👆 Tap a cell on the map or open one of the three examples to see its evidence.'}</p></aside>;
  if (status === 'loading') return <aside className="panel" aria-busy="true">{es ? 'Cargando celda…' : 'Loading cell…'}</aside>;
  if (status === 'error' || !cell) {
    return <aside className="panel"><div role="alert" className="panel-warning">{es ? `No se pudieron leer los datos de la celda ${url.cell}.` : `Could not read data for cell ${url.cell}.`}</div></aside>;
  }
  if (!d) {
    return <aside className="panel"><div role="alert" className="panel-warning">{es ? `Esta celda no tiene el indicador ${url.ind}.` : `This cell has no ${url.ind} indicator.`}</div></aside>;
  }

  const resetKey = `${cell.id}/${url.ind}`;
  const total = period[1] - period[0] + 1;
  const valid = gridRow?.ind[url.ind]?.valid_years ?? d.series.filter((p) => typeof p.value === 'number').length;
  const overlap = verdictNotices(cell, url.ind, d, lang).find((n) => n.kind === 'overlap');
  const s = d.statistics;
  const selWin = sel.isBase ? null : sel.window;
  const mean = gridRow?.ind[url.ind]?.mean ?? null;
  const slope = s?.slope_per_decade ?? null;
  const pct = typeof slope === 'number' && typeof mean === 'number' && mean > 0 ? (slope / mean) * 100 : null;
  const lo = s?.ci_95?.[0] ?? null, hi = s?.ci_95?.[1] ?? null;
  const ciZero = typeof lo === 'number' && typeof hi === 'number' ? lo <= 0 && hi >= 0 : null;
  const u = unitLabel(d.units, lang);
  const kase = CASES.find(c => c.cell === cell.id && c.ind === url.ind);

  return (
    <aside className="panel">
      {meta.analysis_scope && <p role="note" className="notice pilot-status">{meta.analysis_scope.note[lang]}</p>}
      <header className="cell-head">
        <p className="cell-kicker">{gridRow ? `${COUNTRY[gridRow.country]?.[lang] ?? gridRow.country} · ${Math.abs(gridRow.lat).toFixed(2)}°${gridRow.lat >= 0 ? 'N' : 'S'}, ${Math.abs(gridRow.lon).toFixed(2)}°${gridRow.lon >= 0 ? 'E' : 'W'} · ` : ''}{es ? 'celda' : 'cell'} {cell.id}</p>
        <h2 className="cell-title">{cell.name ?? IND_LABEL[url.ind][lang]}</h2>
        <p className="cell-sub">{cell.name ? `${IND_LABEL[url.ind][lang]} · ` : ''}{period[0]}–{period[1]} · {es ? 'área de unos 11 × 11 km' : 'area of about 11 × 11 km'}</p>
      </header>
      {kase?.story && (
        <section className="case-story">
          <p className="case-story-kicker">{es ? `Ejemplo ${kase.n}` : `Example ${kase.n}`} · {kase.title[lang]}</p>
          {kase.story[lang].map(t => <p key={t}>{t}</p>)}
        </section>
      )}
      <SectionBoundary key={`v/${resetKey}`} name={es ? 'Veredicto' : 'Verdict'}>
        <VerdictBadge cell={cell} ind={url.ind} lang={lang} validYears={valid} totalYears={total} />
        {s && (
          <dl className="keystats">
            <div><dt>{es ? 'Cambio por década' : 'Change per decade'}</dt><dd>{fmtSlope(slope, lang).replace(/ mm\/.*/, '')} <small>mm</small>{pct !== null && d.verdict !== 'consistente' && <span className="keystat-sub">{pct > 0 ? '+' : ''}{fmtNum(pct, 1)} % {es ? 'de la lluvia media' : 'of mean rainfall'}</span>}</dd></div>
            <div><dt>{es ? 'Margen de error (IC 95 %)' : 'Margin of error (95% CI)'}</dt><dd>{fmtNum(lo, 0)} {es ? 'a' : 'to'} {fmtNum(hi, 0)} <small>mm</small>{ciZero !== null && <span className="keystat-sub">{ciZero ? (es ? 'incluye el cero: podría no haber cambio' : 'includes zero: there may be no change') : es ? 'no incluye el cero' : 'excludes zero'}</span>}</dd></div>
            <div><dt>{es ? 'Lluvia media' : 'Mean rainfall'}</dt><dd>{fmtNum(mean, 0)} <small>{u}</small><span className="keystat-sub">{valid}/{total} {es ? 'años con datos' : 'years with data'}</span></dd></div>
          </dl>
        )}
        <Narrative data={d} lang={lang} />
      </SectionBoundary>

      <SectionBoundary key={`s/${resetKey}`} name={es ? 'Serie' : 'Series'}>
        <Card title={es ? 'La lluvia, año por año' : 'Rainfall, year by year'} hint={es ? 'Cada punto azul es un año. La recta gris es la tendencia estimada y la banda, su margen de error.' : 'Each blue dot is one year. The grey line is the estimated trend and the band is its margin of error.'}>
          <SeriesChart data={d} period={period} selected={selWin} lang={lang} />
        </Card>
      </SectionBoundary>

      <SectionBoundary key={`h/${resetKey}`} name={es ? 'Huella de estabilidad' : 'Stability footprint'}>
        <Card title={es ? '¿Cambia la historia si eliges otros años?' : 'Does the story change with other years?'} hint={es ? 'Cada casilla es un periodo distinto (año de inicio abajo, año de fin a la izquierda). Toca una para compararla con el periodo completo.' : 'Each square is a different period (start year below, end year on the left). Tap one to compare it with the full period.'}>
        {sel.requestedMissing && (
          <p role="note" className="notice">{es ? 'La ventana del enlace no existe para esta celda; se muestra el periodo base.' : 'The linked window does not exist for this cell; showing the base period.'}</p>
        )}
        <Footprint footprint={d.footprint} period={period} selected={sel.isBase ? null : url.win} onSelect={onSelect} lang={lang} />
        <p className="legend fp-legend"><span><i style={{ background: '#8c510a' }} /> {es ? 'baja, señal clara' : 'down, clear signal'}</span><span><i style={{ background: '#dfc27d' }} /> {es ? 'baja, señal débil' : 'down, weak signal'}</span><span><i style={{ background: '#80cdc1' }} /> {es ? 'sube, señal débil' : 'up, weak signal'}</span><span><i style={{ background: '#01665e' }} /> {es ? 'sube, señal clara' : 'up, clear signal'}</span></p>
        {overlap && <p role="note" className="notice">{overlap.text}</p>}
        </Card>
      </SectionBoundary>

      <SectionBoundary key={`c/${resetKey}`} name={es ? 'Comparador' : 'Comparison'}>
        <Card title={es ? 'Periodo completo frente al periodo elegido' : 'Full period versus the chosen period'} hint={selWin ? undefined : es ? 'Toca una casilla de arriba para llenar la segunda columna.' : 'Tap a square above to fill the second column.'}>
        <div className="table-scroll"><table className="compare" data-tour="compare">
          <thead>
            <tr>
              <th />
              <th>{period[0]}–{period[1]} <small>({es ? 'completo' : 'full'})</small></th>
              <th>{selWin ? `${selWin.start}–${selWin.end}` : '—'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{es ? 'Cambio por década' : 'Change per decade'} <small>({es ? 'pendiente de Sen' : 'Sen slope'})</small></th>
              <td>{fmtSlope(s?.slope_per_decade, lang)}</td>
              <td>{selWin ? fmtSlope(selWin.slope, lang) : '—'}</td>
            </tr>
            <tr>
              <th>{es ? 'Margen de error' : 'Margin of error'} <small>({es ? 'IC 95 %' : '95% CI'})</small></th>
              <td>[{fmtNum(s?.ci_95?.[0])}, {fmtNum(s?.ci_95?.[1])}]</td>
              <td>{selWin && selWin.ciLo !== null && selWin.ciHi !== null ? `[${fmtNum(selWin.ciLo)}, ${fmtNum(selWin.ciHi)}]` : '—'}</td>
            </tr>
            <tr>
              <th>{es ? 'Valor p' : 'p-value'} <small>({es ? 'bajo = difícil de explicar por azar' : 'low = hard to explain by chance'})</small></th>
              <td>{fmtP(s?.p_value)} · FDR {fmtP(s?.adjusted_p_fdr)}</td>
              <td>{selWin ? `${fmtP(selWin.p)} (${es ? 'sin corregir' : 'uncorrected'})` : '—'}</td>
            </tr>
            <tr>
              <th>{es ? 'Signo respecto al periodo base' : 'Sign vs. base period'}</th>
              <td>—</td>
              <td>{!selWin || selWin.slope === null || s?.slope_per_decade == null ? '—' : Math.sign(selWin.slope) === Math.sign(s.slope_per_decade) ? (es ? 'Mismo signo' : 'Same sign') : es ? 'Signo opuesto' : 'Opposite sign'}</td>
            </tr>
            <tr>
              <th>{es ? 'Veredicto' : 'Verdict'}</th>
              <td>{VERDICT_UI[d.verdict]?.label[lang] ?? d.verdict}</td>
              <td>{selWin?.result ? <>{VERDICT_UI[selWin.result.verdict].label[lang]}{VERDICT_UI[selWin.result.verdict].caveat && <p>{VERDICT_UI[selWin.result.verdict].caveat?.[lang]}</p>}<ul>{selWin.result.verdict_reasons.map(r => <li key={r}>{reasonText(r, lang)}</li>)}</ul></> : es ? 'Veredicto de ventana no proporcionado por el pipeline' : 'Window verdict not supplied by the pipeline'}</td>
            </tr>
          </tbody>
        </table></div>
        </Card>
      </SectionBoundary>

      <SectionBoundary key={`m/${resetKey}`} name={es ? 'Ciclo mensual' : 'Monthly cycle'}>
        <Card title={es ? '¿Cuándo llueve aquí?' : 'When does it rain here?'}>
          <MonthlyCycle values={cell.monthly_climatology_mm} ind={url.ind} lang={lang} />
        </Card>
      </SectionBoundary>

      <SectionBoundary key={`e/${resetKey}`} name="ENSO">
        <div className="card"><EnsoView data={d} period={period} enso={refs.enso} strongOff={url.enso} onToggle={(on) => setUrl({ enso: on })} lang={lang} /></div>
      </SectionBoundary>

      {mirror && (
        <SectionBoundary key={`x/${resetKey}`} name={es ? 'Vista espejo' : 'Mirror view'}>
          <div className="card"><MirrorView a={cell} b={mirror} ind={url.ind} period={period} lang={lang} /></div>
        </SectionBoundary>
      )}

      <SectionBoundary key={`d/${resetKey}`} name={es ? 'Preguntas para decidir' : 'Questions to ask'}>
        <div className="card"><DecisionCards data={d} lens={url.lens} rules={refs.rules} lang={lang} /></div>
      </SectionBoundary>

      <div className="card"><SecondaryVariables cell={cell} rain={d} period={period} lang={lang} /></div>
      <div className="card"><Glossary glossary={refs.glossary} lang={lang} /></div>
      <SectionBoundary key={`p/${resetKey}`} name={es ? 'Pasaporte' : 'Passport'}>
        <div className="card"><PassportView cell={cell} gridRow={gridRow} meta={meta} ind={url.ind} win={sel.isBase ? null : url.win} lang={lang} /></div>
      </SectionBoundary>

      {url.tour > 0 && (
        <TourOverlay step={url.tour} tour={refs.tour} glossary={refs.glossary} lang={lang} onStep={(n) => setUrl({ tour: n })} onSetWin={(w) => setUrl({ win: parseWin(w) })} />
      )}
    </aside>
  );
}
