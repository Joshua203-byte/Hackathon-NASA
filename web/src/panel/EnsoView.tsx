import type { CellIndicator, GridIndicator, Lang } from '../types';
import { fmt, fmtP, t } from '../i18n';
import { GlossaryTip } from './GlossaryTip';
import { SeriesChart } from './SeriesChart';

interface Props {
  ind: CellIndicator;
  gridInd: GridIndicator | undefined;
  lang: Lang;
  hideStrong: boolean;
  onToggle: (on: boolean) => void;
}

/** Barras coloreadas por fase ENSO + interruptor "quitar años ENSO fuertes" (lee `enso_test`). */
export function EnsoView({ ind, gridInd, lang, hideStrong, onToggle }: Props) {
  const hasPhases = ind.series.some((d) => d.enso);
  const et = ind.enso_test;
  return (
    <section className="enso-view" data-tour="enso">
      <h3>
        {t('enso_view', lang)} <GlossaryTip k="enso" lang={lang} />
      </h3>
      {gridInd?.enso_r != null && (
        <p className="small">
          {t('enso_assoc', lang)}: r = {fmt(gridInd.enso_r, 2, true)} (p FDR {fmtP(gridInd.enso_p_fdr)}). {t('association_not_cause', lang)}
        </p>
      )}
      {!hasPhases ? (
        <p className="muted">{t('enso_no_phases', lang)}</p>
      ) : (
        <SeriesChart series={ind.series} stats={ind.statistics} units={ind.units} lang={lang} win={null} mode="enso" hideStrong={hideStrong} />
      )}
      <label className="toggle">
        <input type="checkbox" checked={hideStrong} onChange={(e) => onToggle(e.target.checked)} disabled={!et} />
        {t('remove_strong', lang)}
      </label>
      {!et ? (
        <p className="muted">{t('enso_pending', lang)}</p>
      ) : (
        hideStrong && (
          <div className="enso-result">
            <dl>
              <dt>{t('base_period', lang)}</dt>
              <dd>{fmt(ind.statistics.slope_per_decade, 1, true)} {ind.units} {t('per_decade', lang)} · p {fmtP(ind.statistics.p_value)}</dd>
              <dt>{t('without_strong', lang)}</dt>
              <dd>{fmt(et.slope_without_strong_enso, 1, true)} {ind.units} {t('per_decade', lang)} · p {fmtP(et.p_without_strong_enso)}</dd>
              <dt>{t('oni_removed', lang)}</dt>
              <dd>{fmt(et.slope_oni_removed, 1, true)} {ind.units} {t('per_decade', lang)} · p {fmtP(et.p_oni_removed)}</dd>
            </dl>
            {et.survives !== null && (
              <p className={et.survives ? 'reason-pos' : 'reason-neg'}>{et.survives ? t('survives', lang) : t('not_survives', lang)}</p>
            )}
          </div>
        )
      )}
    </section>
  );
}
