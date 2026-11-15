import type { DecisionRules } from './decision';
import type { L10n } from './types';
import type { PanelUrlState } from './urlState';

export interface TourStep {
  anchor: string;
  glossary?: string;
  title: L10n;
  body: L10n;
  /** Selección reproducible del paso; acepta ventanas antiguas en texto. */
  set?: Omit<Partial<PanelUrlState>, 'tour' | 'lang' | 'win'> & { win?: string | PanelUrlState['win'] };
}
export interface EnsoYear {
  phase?: string;
  /** PROPUESTO a Rol 3: año con ENSO fuerte (|ONI| ≥ 1.0). */
  strong?: boolean;
}
/** Archivos de referencia que se cargan una vez. Todos opcionales: si falta uno, su sección degrada con aviso. */
export interface RefData {
  enso: { years: Record<string, EnsoYear> } | null;
  rules: DecisionRules | null;
  tour: { context?: Partial<PanelUrlState>; steps: TourStep[] } | null;
  glossary: Record<string, { term: L10n; definition: L10n }> | null;
}
