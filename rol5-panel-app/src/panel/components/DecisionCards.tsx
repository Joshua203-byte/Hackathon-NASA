import { deriveScenario, lookupCard, type Scenario } from '../decision';
import { fmtSlope } from '../format';
import type { RefData } from '../refs';
import type { CellIndicator, Lang, Lens } from '../types';

const SCEN: Record<Scenario, { es: string; en: string }> = {
  baja: { es: 'Baja de lluvia en el periodo', en: 'Rainfall decrease over the period' },
  alza: { es: 'Alza de lluvia en el periodo', en: 'Rainfall increase over the period' },
  alta_variabilidad: { es: 'Alta variabilidad sin tendencia', en: 'High variability, no trend' },
};

/** Muestra preguntas y datos locales que faltan. No existe campo para recomendaciones. */
export function DecisionCards({ data, lens, rules, lang }: { data: CellIndicator; lens: Lens; rules: RefData['rules']; lang: Lang }) {
  const es = lang === 'es';
  const scenario = deriveScenario(data.statistics?.slope_per_decade ?? null, data.verdict, data.tags);
  const look = rules ? lookupCard(rules, lens, scenario, data.verdict) : ({ kind: 'none' } as const);
  return (
    <section data-tour="cards" className="cards">
      <h3>{es ? 'Preguntas para decidir' : 'Questions to ask before deciding'} <small>({es ? 'evidencia para este sector' : 'evidence for this sector'})</small></h3>
      {look.kind === 'pending' && <p role="note" className="notice">{es ? 'Análisis cuantitativo pendiente.' : 'Quantitative analysis pending.'}</p>}
      {look.kind === 'none' && <p role="note" className="notice">{!rules ? (es ? 'Tarjetas no disponibles.' : 'Cards not available.') : es ? 'No hay datos suficientes para plantear preguntas con esta celda.' : 'Not enough data to pose questions for this cell.'}</p>}
      {look.kind === 'card' && scenario && (
        <>
          <h4>{es ? 'Qué observamos' : 'What we observe'}</h4>
          <p>{SCEN[scenario][lang]} · {fmtSlope(data.statistics?.slope_per_decade, lang)} · <code>{data.verdict}</code></p>
          <h4>{es ? 'Preguntas para decidir' : 'Questions to ask'}</h4>
          <ul>{look.card.questions[lang].map((q) => <li key={q}>{q}</li>)}</ul>
          <h4>{es ? 'Datos locales que faltan' : 'Missing local data'}</h4>
          <ul>{look.card.missing_local_data[lang].map((q) => <li key={q}>{q}</li>)}</ul>
        </>
      )}
      <p className="next-step">{es ? 'Monitoreo operativo: ' : 'Operational monitoring: '}<a href="https://www.servirglobal.net" target="_blank" rel="noreferrer">SERVIR</a> · <a href="https://nasaharvest.org" target="_blank" rel="noreferrer">NASA Harvest</a> <small>({es ? 'enlaces por verificar con Rol 6' : 'links to be verified by Role 6'})</small></p>
    </section>
  );
}
