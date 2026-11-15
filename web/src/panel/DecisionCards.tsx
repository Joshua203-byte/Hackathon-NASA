import type { CellIndicator, DecisionRules, Lang, Lens } from '../types';
import { fmt, t, VERDICT_TEXT } from '../i18n';

interface Props {
  ind: CellIndicator;
  rules: DecisionRules | null;
  lens: Lens;
  lang: Lang;
  indicatorLabel: string;
}

/** Escenario observado a partir de los datos (sección 4.11). */
export function scenarioOf(ind: CellIndicator): 'baja' | 'alza' | 'variabilidad' {
  const s = ind.statistics.slope_per_decade ?? 0;
  if (ind.tags?.includes('alta_variabilidad') && ind.verdict !== 'consistente') return 'variabilidad';
  return s < 0 ? 'baja' : 'alza';
}

/** Tarjetas: Qué observamos / Preguntas para decidir / Datos locales que faltan. Ninguna recomienda una acción. */
export function DecisionCards({ ind, rules, lens, lang, indicatorLabel }: Props) {
  const lensRules = rules?.lenses[lens];
  const sc = scenarioOf(ind);
  const s = ind.statistics;
  const valid = ind.valid_years ?? ind.series.filter((d) => d.value !== null).length;
  const n = ind.n_years ?? ind.series.length;

  const observed =
    lang === 'es'
      ? `${indicatorLabel}: ${fmt(s.slope_per_decade, 1, true)} ${ind.units} por década (IC 95 %: ${fmt(s.ci_95[0])} a ${fmt(s.ci_95[1])}). ${VERDICT_TEXT[ind.verdict].es}. Datos: ${valid}/${n} años válidos.`
      : `${indicatorLabel}: ${fmt(s.slope_per_decade, 1, true)} ${ind.units} per decade (95% CI: ${fmt(s.ci_95[0])} to ${fmt(s.ci_95[1])}). ${VERDICT_TEXT[ind.verdict].en}. Data: ${valid}/${n} valid years.`;

  let body;
  if (!rules) body = <p className="muted">{t('rules_missing', lang)}</p>;
  else if (ind.verdict === 'incompleta') body = <p className="muted">{t('incomplete_cards', lang)}</p>;
  else if (!lensRules?.scenarios) body = <p className="info-note">{lensRules?.pending?.[lang] ?? t('pending_quant', lang)}</p>;
  else {
    const scen = lensRules.scenarios[sc];
    const qs = scen?.questions[ind.verdict] ?? scen?.questions.default;
    body = (
      <>
        <div className="card">
          <h4>{t('questions', lang)}</h4>
          {rules.scenarios[sc] && <p className="eyebrow">{rules.scenarios[sc][lang]}</p>}
          <ul>{qs?.[lang].map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
        <div className="card">
          <h4>{t('missing', lang)}</h4>
          <ul>{scen?.missing[lang].map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
      </>
    );
  }

  return (
    <section className="decision" data-tour="decide">
      <h3>
        {t('decide', lang)}
        {lensRules && <span className="chip lens-chip">{lensRules.label[lang]}</span>}
      </h3>
      <div className="cards">
        <div className="card">
          <h4>{t('what_we_know', lang)}</h4>
          <p>{observed}</p>
        </div>
        {body}
      </div>
      <p className="muted small">{t('no_action', lang)}</p>
      {rules?.next_steps && rules.next_steps.length > 0 && (
        <p className="small">
          {t('next_step', lang)}:{' '}
          {rules.next_steps.map((l, i) => (
            <span key={l.url}>
              {i > 0 && ' · '}
              <a href={l.url} target="_blank" rel="noreferrer">{l.label[lang]}</a>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
