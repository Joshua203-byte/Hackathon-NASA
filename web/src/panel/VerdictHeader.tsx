import type { CellIndicator, Lang } from '../types';
import { fmt, fmtP, reasonText, t, VERDICT_SUB, VERDICT_TEXT } from '../i18n';
import { GlossaryTip } from './GlossaryTip';

interface Props {
  ind: CellIndicator;
  lang: Lang;
  title: string;
  canicula: boolean | null | undefined;
  isJulAug: boolean;
}

export function VerdictHeader({ ind, lang, title, canicula, isJulAug }: Props) {
  const v = ind.verdict;
  const s = ind.statistics;
  const n = ind.n_years ?? ind.series.length;
  const valid = ind.valid_years ?? ind.series.filter((d) => d.value !== null).length;
  const narrative = ind.narrative;
  return (
    <header className="verdict-header" data-tour="verdict">
      <p className="eyebrow">{title}</p>
      <div className={`verdict-badge verdict-${v}`}>
        <span className="verdict-icon" aria-hidden="true">{VERDICT_TEXT[v].icon}</span>
        <span>
          <span className="verdict-label">{VERDICT_TEXT[v][lang]}</span>
          <span className="verdict-sub">{VERDICT_SUB[v][lang]}</span>
        </span>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-label">
            {t('slope', lang)} <GlossaryTip k="sen_slope" lang={lang} />
          </span>
          <span className="stat-value">
            {fmt(s.slope_per_decade, 1, true)} <small>{ind.units} {t('per_decade', lang)}</small>
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">
            {t('ci95', lang)} <GlossaryTip k="ci" lang={lang} />
          </span>
          <span className="stat-value">
            {fmt(s.ci_95[0], 1)} … {fmt(s.ci_95[1], 1)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">
            p / {t('p_fdr', lang)} <GlossaryTip k="p_value" lang={lang} />
          </span>
          <span className="stat-value">
            {fmtP(s.p_value)} / {fmtP(s.adjusted_p_fdr)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">
            {lang === 'es' ? 'Completitud' : 'Completeness'} <GlossaryTip k="completeness" lang={lang} />
          </span>
          <span className="stat-value">
            {valid}/{n} <small>{t('completeness', lang)}</small>
          </span>
        </div>
      </div>

      {isJulAug && canicula === false && (
        <p className="warning-note" role="note">⚠ {lang === 'es' ? 'En esta zona el indicador de canícula no aplica; conviene mirar la lluvia anual.' : 'The midsummer-drought indicator does not apply in this area; look at annual rainfall instead.'}</p>
      )}
      {ind.tags?.includes('alta_variabilidad') && (
        <p className="info-note">
          {lang === 'es'
            ? 'Alta variabilidad entre años: las decisiones dependen más de pronósticos de corto plazo que de tendencias decenales.'
            : 'High year-to-year variability: decisions depend more on short-term forecasts than on decadal trends.'}
        </p>
      )}

      {ind.verdict_reasons.length > 0 && (
        <ul className="reasons" aria-label={lang === 'es' ? 'Razones del veredicto' : 'Verdict reasons'}>
          {ind.verdict_reasons.map((r) => (
            <li key={r} className={reasonTone(r)}>{reasonText(r, lang)}</li>
          ))}
        </ul>
      )}

      {narrative && (
        <div className="narrative">
          <p>{narrative[lang]}</p>
          <p className="muted small">{narrative.generated_by === 'AI' ? t('ai_text', lang) : t('template_text', lang)}</p>
        </div>
      )}
    </header>
  );
}

const POSITIVE = new Set(['fdr_significativo', 'ic_excluye_cero', 'huella_estable', 'ventanas_significativas', 'sobrevive_enso', 'sin_salto_2014']);
const PENDING = new Set(['enso_pendiente', 'salto_2014_pendiente']);
function reasonTone(r: string) {
  if (POSITIVE.has(r)) return 'reason-pos';
  if (PENDING.has(r)) return 'reason-pending';
  return 'reason-neg';
}
