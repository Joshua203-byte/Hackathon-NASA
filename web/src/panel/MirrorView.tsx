import { useCell } from '../data';
import type { CellDetail, Grid, IndicatorKey, Lang } from '../types';
import { fmt, t, VERDICT_TEXT } from '../i18n';
import { SeriesChart } from './SeriesChart';

interface Props {
  cell: CellDetail;
  ind: IndicatorKey;
  grid: Grid | null;
  cmp: string | null;
  lang: Lang;
  onPick: (id: string | null) => void;
}

/** Vista espejo: dos celdas lado a lado con la misma escala. */
export function MirrorView({ cell, ind, grid, cmp, lang, onPick }: Props) {
  const other = useCell(cmp);
  const a = cell.indicators[ind];
  const b = other?.status === 'ok' ? other.data.indicators[ind] : undefined;
  const maxOf = (x: typeof a) => Math.max(0, ...(x?.series.map((d) => d.value ?? 0) ?? [0]));
  const yMax = Math.max(maxOf(a), maxOf(b)) * 1.08;
  const name = (c: CellDetail) => c.name ?? c.id;

  return (
    <section className="mirror-view" data-tour="mirror">
      <h3>{t('mirror', lang)}</h3>
      <label className="field">
        {t('mirror_pick', lang)}{' '}
        <select value={cmp ?? ''} onChange={(e) => onPick(e.target.value || null)}>
          <option value="">{t('mirror_none', lang)}</option>
          {grid?.cells
            .filter((c) => c.id !== cell.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.country}
              </option>
            ))}
        </select>
      </label>
      {cmp && a && (
        <>
          <div className="mirror-grid">
            <MirrorCol title={name(cell)} ind={a} lang={lang} yMax={yMax} />
            {other?.status === 'loading' && <p className="muted">{t('loading', lang)}</p>}
            {other?.status === 'error' && <p className="error-note">{t('load_error', lang)}</p>}
            {other?.status === 'ok' && (b ? <MirrorCol title={name(other.data)} ind={b} lang={lang} yMax={yMax} /> : <p className="muted">{t('no_indicator', lang)}</p>)}
          </div>
          <p className="muted small">{t('mirror_scale', lang)} {t('association_not_cause', lang)}</p>
        </>
      )}
    </section>
  );
}

function MirrorCol({ title, ind, lang, yMax }: { title: string; ind: NonNullable<CellDetail['indicators'][IndicatorKey]>; lang: Lang; yMax: number }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <p className="small">
        <span className={`chip verdict-${ind.verdict}`}>{VERDICT_TEXT[ind.verdict].icon} {VERDICT_TEXT[ind.verdict][lang]}</span>{' '}
        {fmt(ind.statistics.slope_per_decade, 1, true)} {ind.units} {t('per_decade', lang)}
      </p>
      <SeriesChart series={ind.series} stats={ind.statistics} units={ind.units} lang={lang} win={null} yMax={yMax} />
    </div>
  );
}
