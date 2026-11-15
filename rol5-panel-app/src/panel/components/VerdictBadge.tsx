import { VERDICT_UI, reasonText, verdictNotices } from '../verdict';
import type { CellDetail, IndicatorKey, Lang } from '../types';
import { NEXT_STEP, VERDICT_PLAIN, answerLine } from '../labels';

/** Los tres niveles del motor, de menos a más evidencia. Es una escala ordinal, no una probabilidad. */
const SCALE = ['sin_evidencia', 'limitada', 'consistente'] as const;
const SCALE_LABEL = { sin_evidencia: { es: 'Sin evidencia', en: 'No evidence' }, limitada: { es: 'Limitada', en: 'Limited' }, consistente: { es: 'Consistente', en: 'Consistent' } } as const;

interface Props {
  cell: CellDetail;
  ind: IndicatorKey;
  lang: Lang;
  validYears: number;
  totalYears: number;
}

/** Único componente autorizado a pintar un veredicto. Nadie más lee `verdict` para mostrar texto. */
export function VerdictBadge({ cell, ind, lang, validYears, totalYears }: Props) {
  const d = cell.indicators[ind];
  if (!d) return null;
  const ui = VERDICT_UI[d.verdict];
  if (!ui) return <div role="alert" className="panel-warning">Veredicto desconocido: {String(d.verdict)}</div>;
  const notices = verdictNotices(cell, ind, d, lang);
  return (
    <header className="verdict" data-verdict={d.verdict} data-tour="verdict" style={{ borderColor: `var(${ui.cssVar})` }}>
      <p className="verdict-kicker">{lang === 'es' ? 'Veredicto de evidencia' : 'Evidence verdict'}</p>
      <h2>
        <span aria-hidden="true" style={{ color: `var(${ui.cssVar})` }}>{ui.icon}</span> {ui.label[lang]}
      </h2>
      {ui.caveat && <p className="verdict-caveat"><strong>{ui.caveat[lang]}</strong></p>}
      {d.verdict !== 'incompleta' && (
        <ol className="verdict-scale" aria-label={lang === 'es' ? 'Escala de evidencia' : 'Evidence scale'}>
          {SCALE.map((v) => <li key={v} className={v === d.verdict ? 'on' : ''} aria-current={v === d.verdict ? 'true' : undefined} style={v === d.verdict ? { ['--c' as string]: `var(${VERDICT_UI[v].cssVar})` } : undefined}>{SCALE_LABEL[v][lang]}</li>)}
        </ol>
      )}
      <p className="verdict-answer">{answerLine(d.verdict, d.statistics?.slope_per_decade, lang)}</p>
      <p className="verdict-plain">{VERDICT_PLAIN[d.verdict][lang]}</p>
      <div className="verdict-next"><strong>{lang === 'es' ? 'Qué puedes hacer' : 'What you can do'}:</strong> {NEXT_STEP[d.verdict][lang]}</div>
      <p className="verdict-completeness">
        {validYears}/{totalYears} {lang === 'es' ? 'años válidos' : 'valid years'}
      </p>
      {d.verdict_reasons.length > 0 && (
        <details className="verdict-why" open>
          <summary>{lang === 'es' ? 'Por qué este veredicto' : 'Why this verdict'}</summary>
          <ul className="verdict-reasons">
            {d.verdict_reasons.map((r) => <li key={r}>{reasonText(r, lang)}</li>)}
          </ul>
        </details>
      )}
      {notices.filter((n) => n.kind !== 'caveat' && n.kind !== 'overlap').map((n) => (
        <p key={n.kind} role="note" className={`notice notice-${n.kind}`}>{n.text}</p>
      ))}
    </header>
  );
}
