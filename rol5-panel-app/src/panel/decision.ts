import type { L10n, Lens, Num, Verdict } from './types';

export type Scenario = 'baja' | 'alza' | 'alta_variabilidad';

/** El tipo no tiene ningún campo para recomendaciones: una tarjeta no puede prescribir por construcción. */
export interface DecisionCard {
  questions: L10n<string[]>;
  missing_local_data: L10n<string[]>;
}

type ByVerdict = Partial<Record<Verdict | 'default', DecisionCard>>;
/** Esquema propuesto a Rol 6: lente → escenario → veredicto (o "default"). */
export type DecisionRules = Partial<Record<Lens, { pending?: boolean } & Partial<Record<Scenario, ByVerdict>>>>;

/** "Qué observamos" sale solo de datos ya calculados. Por confirmar con Rol 3 la prioridad de alta_variabilidad. */
export function deriveScenario(slopeDec: Num, verdict: Verdict, tags: readonly string[] = []): Scenario | null {
  if (verdict === 'incompleta') return null;
  if (tags.includes('alta_variabilidad') && verdict === 'sin_evidencia') return 'alta_variabilidad';
  if (slopeDec === null || slopeDec === 0) return null;
  return slopeDec < 0 ? 'baja' : 'alza';
}

export type CardLookup =
  | { kind: 'card'; card: DecisionCard }
  | { kind: 'pending' } // lente Energía sin segunda variable: "Análisis cuantitativo pendiente"
  | { kind: 'none' };

export function lookupCard(rules: DecisionRules, lens: Lens, scenario: Scenario | null, verdict: Verdict): CardLookup {
  const l = rules[lens];
  if (!l || l.pending) return { kind: 'pending' };
  if (!scenario) return { kind: 'none' };
  const card = l[scenario]?.[verdict] ?? l[scenario]?.default;
  return card ? { kind: 'card', card } : { kind: 'none' };
}

const BANNED =
  /\b(recomi?end\w*|deber[íi]a[ns]?|debe[ns]?|hay que|se aconseja|va a llover|predice|95 ?% de probabilidad|causa[ns]?|should|must|recommend\w*|we advise|will rain|predicts?|causes?)\b/i;

/** Prueba de contenido sobre decision_rules.json: todo es pregunta y nada prescribe. Devuelve los fallos. */
export function lintRules(rules: DecisionRules): string[] {
  const out: string[] = [];
  for (const [lens, scenarios] of Object.entries(rules)) {
    for (const [scenario, byVerdict] of Object.entries(scenarios ?? {})) {
      if (scenario === 'pending' || typeof byVerdict !== 'object' || !byVerdict) continue;
      for (const [verdict, card] of Object.entries(byVerdict as ByVerdict)) {
        const at = `${lens}.${scenario}.${verdict}`;
        for (const lang of ['es', 'en'] as const) {
          const qs = card?.questions?.[lang] ?? [];
          if (qs.length === 0) out.push(`${at}.${lang}: sin preguntas`);
          for (const q of qs) {
            if (!q.trim().endsWith('?')) out.push(`${at}.${lang}: no es pregunta → "${q}"`);
            if (BANNED.test(q)) out.push(`${at}.${lang}: frase prohibida → "${q}"`);
          }
          for (const d of card?.missing_local_data?.[lang] ?? []) {
            if (BANNED.test(d)) out.push(`${at}.${lang}: frase prohibida → "${d}"`);
          }
        }
      }
    }
  }
  return out;
}
