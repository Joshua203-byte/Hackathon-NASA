import { useCallback, useMemo } from 'react';
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
import { VerdictBadge } from './VerdictBadge';

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

  const index = useMemo(() => indexFootprint(d?.footprint), [d]);
  const sel = useMemo(() => resolveWindow(index, url.win, period), [index, url.win, period]);
  const onSelect = useCallback((win: Win | null) => setUrl({ win }), [setUrl]);

  if (status === 'idle' || !url.cell) return <aside className="panel">{es ? 'Elija una celda en el mapa.' : 'Pick a cell on the map.'}</aside>;
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

  return (
    <aside className="panel">
      <SectionBoundary key={`v/${resetKey}`} name={es ? 'Veredicto' : 'Verdict'}>
        <VerdictBadge cell={cell} ind={url.ind} lang={lang} validYears={valid} totalYears={total} />
        <Narrative data={d} lang={lang} />
      </SectionBoundary>

      <SectionBoundary key={`s/${resetKey}`} name={es ? 'Serie' : 'Series'}>
        <SeriesChart data={d} period={period} selected={selWin} lang={lang} />
      </SectionBoundary>

      <SectionBoundary key={`h/${resetKey}`} name={es ? 'Huella de estabilidad' : 'Stability footprint'}>
        {sel.requestedMissing && (
          <p role="note" className="notice">{es ? 'La ventana del enlace no existe para esta celda; se muestra el periodo base.' : 'The linked window does not exist for this cell; showing the base period.'}</p>
        )}
        <Footprint footprint={d.footprint} period={period} selected={sel.isBase ? null : url.win} onSelect={onSelect} lang={lang} />
        {overlap && <p role="note" className="notice">{overlap.text}</p>}
      </SectionBoundary>

      <SectionBoundary key={`c/${resetKey}`} name={es ? 'Comparador' : 'Comparison'}>
        <table className="compare" data-tour="compare">
          <thead>
            <tr>
              <th />
              <th>{period[0]}–{period[1]}</th>
              <th>{selWin ? `${selWin.start}–${selWin.end}` : '—'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{es ? 'Pendiente de Sen' : 'Sen slope'}</th>
              <td>{fmtSlope(s?.slope_per_decade, lang)}</td>
              <td>{selWin ? fmtSlope(selWin.slope, lang) : '—'}</td>
            </tr>
            <tr>
              <th>{es ? 'IC 95 % de la pendiente' : '95% CI of the slope'}</th>
              <td>[{fmtNum(s?.ci_95?.[0])}, {fmtNum(s?.ci_95?.[1])}]</td>
              <td>{selWin && selWin.ciLo !== null ? `[${fmtNum(selWin.ciLo)}, ${fmtNum(selWin.ciHi)}]` : '—'}</td>
            </tr>
            <tr>
              <th>p</th>
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
              <td>{d.verdict}</td>
              <td>{es ? 'Solo se calcula para el periodo completo' : 'Only computed for the full period'}</td>
            </tr>
          </tbody>
        </table>
      </SectionBoundary>

      <SectionBoundary key={`m/${resetKey}`} name={es ? 'Ciclo mensual' : 'Monthly cycle'}>
        <MonthlyCycle values={cell.monthly_climatology_mm} ind={url.ind} lang={lang} />
      </SectionBoundary>

      <SectionBoundary key={`e/${resetKey}`} name="ENSO">
        <EnsoView data={d} period={period} enso={refs.enso} strongOff={url.enso} onToggle={(on) => setUrl({ enso: on })} lang={lang} />
      </SectionBoundary>

      {mirror && (
        <SectionBoundary key={`x/${resetKey}`} name={es ? 'Vista espejo' : 'Mirror view'}>
          <MirrorView a={cell} b={mirror} ind={url.ind} period={period} lang={lang} />
        </SectionBoundary>
      )}

      <SectionBoundary key={`d/${resetKey}`} name={es ? 'Preguntas para decidir' : 'Questions to ask'}>
        <DecisionCards data={d} lens={url.lens} rules={refs.rules} lang={lang} />
      </SectionBoundary>

      <SectionBoundary key={`p/${resetKey}`} name={es ? 'Pasaporte' : 'Passport'}>
        <PassportView cell={cell} gridRow={gridRow} meta={meta} ind={url.ind} win={sel.isBase ? null : url.win} lang={lang} />
      </SectionBoundary>

      {url.tour > 0 && (
        <TourOverlay step={url.tour} tour={refs.tour} glossary={refs.glossary} lang={lang} onStep={(n) => setUrl({ tour: n })} onSetWin={(w) => setUrl({ win: parseWin(w) })} />
      )}
    </aside>
  );
}
