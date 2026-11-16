import type { CellIndicator, Lang } from '../types';
import type { RefData } from '../refs';
import { fmtNum, fmtP } from '../format';
import { reasonText } from '../verdict';

const gdef = (g: RefData['glossary'], key: string, lang: Lang) => g?.[key]?.definition[lang];

interface Props {
  d: CellIndicator;
  lang: Lang;
  glossary: RefData['glossary'];
  open: boolean;
}

/** Segundo nivel (docs/12, T2.2): las razones técnicas de siempre y las cifras del método, cada término con su definición. */
export function StatDetail({ d, lang, glossary, open }: Props) {
  const es = lang === 'es';
  const st = d.statistics;
  const rows: { term: string; value: string; def?: string; extra?: string }[] = st ? [
    { term: es ? 'Método' : 'Method', value: st.method },
    { term: es ? 'Variante de Mann–Kendall' : 'Mann–Kendall variant', value: st.mk_variant },
    { term: es ? 'Pendiente de Theil–Sen (por década)' : 'Theil–Sen slope (per decade)', value: `${fmtNum(st.slope_per_decade)} ${d.units}`, def: gdef(glossary, 'pendiente_sen', lang), extra: gdef(glossary, 'decada', lang) },
    { term: es ? 'Intervalo de confianza 95 %' : '95% confidence interval', value: st.ci_95 ? `[${fmtNum(st.ci_95[0])}, ${fmtNum(st.ci_95[1])}]` : '—', def: gdef(glossary, 'intervalo_confianza', lang) },
    { term: 'p (Mann–Kendall)', value: fmtP(st.p_value), def: gdef(glossary, 'valor_p', lang), extra: gdef(glossary, 'significativo', lang) },
    { term: es ? 'p ajustado (FDR)' : 'adjusted p (FDR)', value: fmtP(st.adjusted_p_fdr), def: gdef(glossary, 'fdr', lang) },
    { term: es ? 'Autocorrelación lag-1' : 'Lag-1 autocorrelation', value: fmtNum(st.lag1_autocorr, 2) },
  ] : [];
  const trend = gdef(glossary, 'tendencia', lang);
  return (
    <details className="stat-detail" open={open} key={String(open)}>
      <summary>{es ? 'Ver detalle estadístico' : 'Show statistical detail'}</summary>
      <ul className="verdict-reasons">
        {d.verdict_reasons.map((r) => <li key={r}>{reasonText(r, lang)} <code>{r}</code></li>)}
      </ul>
      {trend && <p className="stat-def"><b>{es ? 'Tendencia' : 'Trend'}:</b> {trend}</p>}
      {rows.length > 0 && (
        <dl className="stat-list">
          {rows.map((r) => (
            <div key={r.term}>
              <dt>{r.term}</dt>
              <dd><b>{r.value}</b>{r.def && <span className="stat-def">{r.def}</span>}{r.extra && <span className="stat-def">{r.extra}</span>}</dd>
            </div>
          ))}
        </dl>
      )}
    </details>
  );
}
