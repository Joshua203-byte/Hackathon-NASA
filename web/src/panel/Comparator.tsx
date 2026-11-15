import type { CellIndicator, Lang } from '../types';
import { fmt, fmtP, t, VERDICT_TEXT } from '../i18n';
import { findWindow } from './chartUtils';

interface Props {
  ind: CellIndicator;
  period: [number, number];
  win: [number, number] | null;
  lang: Lang;
  onClear: () => void;
  alpha?: number;
}

/** Time Window Challenge: periodo base fijo contra la ventana elegida en la huella. */
export function Comparator({ ind, period, win, lang, onClear, alpha = 0.05 }: Props) {
  const s = ind.statistics;
  const w = findWindow(ind.footprint, win);
  const flip =
    w && w[2] !== null && s.slope_per_decade !== null && Math.sign(w[2]) !== 0 && Math.sign(w[2]) !== Math.sign(s.slope_per_decade);
  return (
    <section className="comparator" data-tour="compare" aria-live="polite">
      <h3>{t('compare', lang)}</h3>
      <div className="compare-grid">
        <div className="compare-col">
          <p className="eyebrow">{t('base_period', lang)} {period[0]}–{period[1]}</p>
          <dl>
            <dt>{t('slope', lang)}</dt>
            <dd>{fmt(s.slope_per_decade, 1, true)} {ind.units} {t('per_decade', lang)}</dd>
            <dt>{t('ci95', lang)}</dt>
            <dd>{fmt(s.ci_95[0])} … {fmt(s.ci_95[1])}</dd>
            <dt>p</dt>
            <dd>{fmtP(s.p_value)}</dd>
            <dt>{t('verdict', lang)}</dt>
            <dd>
              <span className={`chip verdict-${ind.verdict}`}>{VERDICT_TEXT[ind.verdict].icon} {VERDICT_TEXT[ind.verdict][lang]}</span>
            </dd>
          </dl>
        </div>
        <div className="compare-col">
          {!win ? (
            <p className="muted">{t('compare_hint', lang)}</p>
          ) : (
            <>
              <p className="eyebrow">
                {t('chosen_window', lang)} {win[0]}–{win[1]}{' '}
                <button type="button" className="link-btn" onClick={onClear}>{t('clear', lang)}</button>
              </p>
              {!w || w[2] === null ? (
                <p className="muted">{t('no_data', lang)}</p>
              ) : (
                <dl>
                  <dt>{t('slope', lang)}</dt>
                  <dd>{fmt(w[2], 1, true)} {ind.units} {t('per_decade', lang)}</dd>
                  <dt>{t('ci95', lang)}</dt>
                  <dd>—</dd>
                  <dt>p</dt>
                  <dd>{fmtP(w[3])}</dd>
                  <dt>{lang === 'es' ? 'En esta ventana' : 'In this window'}</dt>
                  <dd>{w[3] !== null && w[3] < alpha ? t('window_sig', lang) : t('window_ns', lang)}</dd>
                </dl>
              )}
              {flip && <p className="warning-note">⚠ {t('sign_flip', lang)}</p>}
            </>
          )}
        </div>
      </div>
      <p className="muted small">{t('window_note', lang)}</p>
    </section>
  );
}
