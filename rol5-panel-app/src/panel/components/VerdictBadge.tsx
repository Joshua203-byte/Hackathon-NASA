import { VERDICT_UI, reasonText, verdictNotices } from '../verdict';
import type { CellDetail, IndicatorKey, Lang } from '../types';

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
      <h2>
        <span aria-hidden="true">{ui.icon}</span> {ui.label[lang]}
      </h2>
      {ui.caveat && <p className="verdict-caveat"><strong>{ui.caveat[lang]}</strong></p>}
      <p className="verdict-completeness">
        {validYears}/{totalYears} {lang === 'es' ? 'años válidos' : 'valid years'}
      </p>
      {d.verdict_reasons.length > 0 && (
        <ul className="verdict-reasons">
          {d.verdict_reasons.map((r) => <li key={r}>{reasonText(r, lang)}</li>)}
        </ul>
      )}
      {notices.filter((n) => n.kind !== 'caveat' && n.kind !== 'overlap').map((n) => (
        <p key={n.kind} role="note" className={`notice notice-${n.kind}`}>{n.text}</p>
      ))}
    </header>
  );
}
