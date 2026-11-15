import { useCell } from '../data';
import type { DecisionRules, Grid, IndicatorKey, Meta, Tour as TourData } from '../types';
import type { UrlState } from '../urlState';
import { shareUrl } from '../urlState';
import { fmt, fmtP, limitationText, t, VERDICT_TEXT } from '../i18n';
import { Climatology } from './Climatology';
import { Comparator } from './Comparator';
import { DecisionCards } from './DecisionCards';
import { EnsoView } from './EnsoView';
import { Footprint } from './Footprint';
import { MirrorView } from './MirrorView';
import { Passport } from './Passport';
import { SeriesChart } from './SeriesChart';
import { Tour } from './Tour';
import { VerdictHeader } from './VerdictHeader';

interface Props {
  meta: Meta;
  grid: Grid | null;
  rules: DecisionRules | null;
  tour: TourData | null;
  state: UrlState;
  update: (patch: Partial<UrlState>) => void;
}

/** Panel de evidencia de una celda (Rol 5). Rol 4 lo monta a la derecha del mapa y le pasa el estado de la URL. */
export function CellPanel({ meta, grid, rules, tour, state, update }: Props) {
  const { lang } = state;
  const cellLoad = useCell(state.cell);

  if (!state.cell) return <div className="panel-empty">{t('pick_cell', lang)}</div>;
  if (!cellLoad || cellLoad.status === 'loading') return <div className="panel-empty" aria-busy="true">{t('loading', lang)}</div>;
  if (cellLoad.status === 'error') return <div className="panel-empty error-note">{t('load_error', lang)} ({cellLoad.error})</div>;

  const cell = cellLoad.data;
  const indKey: IndicatorKey = state.ind;
  const ind = cell.indicators[indKey];
  const info = meta.indicator_info?.[indKey];
  const indicatorLabel = info ? (lang === 'es' ? info.label_es : info.label_en) : indKey;
  const gridInd = grid?.cells.find((c) => c.id === cell.id)?.ind[indKey];
  const title = `${cell.name ?? cell.id} · ${indicatorLabel}`;

  if (!ind) return <div className="panel-empty">{t('no_indicator', lang)}</div>;

  const url = shareUrl(state);
  const fcfg = (meta.thresholds?.footprint ?? {}) as { verdict_min_len?: number; mark_year?: number };
  const alpha = ((meta.thresholds?.stats ?? {}) as { alpha?: number }).alpha ?? 0.05;
  const isCaseSite = !!ind.second_variable || !!state.case;

  return (
    <article className="cell-panel">
      <VerdictHeader ind={ind} lang={lang} title={title} canicula={cell.canicula} isJulAug={indKey === 'jul_aug_mm'} />
      <div data-tour="series">
        <SeriesChart
          series={ind.series}
          stats={ind.statistics}
          units={ind.units}
          lang={lang}
          win={state.win}
          title={t('series', lang)}
          markYear={fcfg.mark_year ?? 2014}
        />
      </div>
      <div data-tour="footprint">
        <Footprint
          footprint={ind.footprint}
          period={meta.period}
          units={ind.units}
          lang={lang}
          win={state.win}
          onPick={(w) => update({ win: w })}
          verdictMinLen={fcfg.verdict_min_len ?? 15}
          markYear={fcfg.mark_year ?? 2014}
          alpha={alpha}
        />
      </div>
      <Comparator ind={ind} period={meta.period} win={state.win} lang={lang} onClear={() => update({ win: null })} alpha={alpha} />
      {cell.monthly_climatology_mm && <Climatology values={cell.monthly_climatology_mm} ind={indKey} lang={lang} />}
      <EnsoView ind={ind} gridInd={gridInd} lang={lang} hideStrong={state.enso === 'on'} onToggle={(on) => update({ enso: on ? 'on' : 'off' })} />
      <MirrorView cell={cell} ind={indKey} grid={grid} cmp={state.cmp} lang={lang} onPick={(id) => update({ cmp: id })} />
      <DecisionCards ind={ind} rules={rules} lens={state.lens} lang={lang} indicatorLabel={indicatorLabel} />

      {isCaseSite && (
        <section className="second-var">
          <h3>{t('second_var', lang)}</h3>
          {ind.second_variable ? (
            <p>
              {ind.second_variable.parameter}: {fmt(ind.second_variable.slope_per_decade, 2, true)} {ind.second_variable.units}{' '}
              {t('per_decade', lang)} · p {fmtP(ind.second_variable.p_value)}
              {ind.second_variable.verdict && <> · {VERDICT_TEXT[ind.second_variable.verdict][lang]}</>}
            </p>
          ) : (
            <p className="info-note">{t('pending_quant', lang)}</p>
          )}
        </section>
      )}

      <section className="limitations">
        <h3>{t('limitations', lang)}</h3>
        <ul>{ind.limitations.map((l) => <li key={l}>{limitationText(l, lang)}</li>)}</ul>
      </section>

      <Passport meta={meta} cell={cell} indKey={indKey} ind={ind} win={state.win} url={url} lang={lang} indicatorLabel={indicatorLabel} />

      {state.tour === '1' && tour && <Tour tour={tour} ind={ind} period={meta.period} lang={lang} onClose={() => update({ tour: '0' })} />}
    </article>
  );
}
