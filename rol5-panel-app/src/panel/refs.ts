import type { DecisionRules } from './decision';
import type { L10n } from './types';

export interface TourStep {
  anchor: string;
  glossary?: string;
  title: L10n;
  body: L10n;
  /** Ventana que el paso escribe en la URL al entrar (p. ej. "2001-2016"). */
  set?: { win?: string };
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
  tour: { steps: TourStep[] } | null;
  glossary: Record<string, { term: L10n; definition: L10n }> | null;
}
