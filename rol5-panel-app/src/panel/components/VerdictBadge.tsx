import { VERDICT_UI, reasonText, verdictNotices } from '../verdict';
import type { CellDetail, IndicatorKey, Lang } from '../types';
import { NEXT_STEP, VERDICT_PLAIN, answerLine } from '../labels';

/** Cuántos tramos del medidor se llenan por veredicto. Orden de la escala del motor, sin cifras nuevas. */
const LEVEL: Record<string, number> = { consistente: 4, limitada: 2, sin_evidencia: 1, incompleta: 0 };

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
      <div className="verdict-meter" role="img" aria-label={`${lang === 'es' ? 'Nivel de evidencia' : 'Evidence level'}: ${ui.label[lang]}`} style={{ ['--c' as string]: `var(${ui.cssVar})` }}>
        {[0, 1, 2, 3].map((i) => <i key={i} className={i < (LEVEL[d.verdict] ?? 0) ? 'on' : ''} style={{ animationDelay: `${0.15 + i * 0.12}s` }} />)}
      </div>
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
