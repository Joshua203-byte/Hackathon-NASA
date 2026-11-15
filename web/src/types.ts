// Tipos del contrato de datos (sección 3.2 del plan + campos añadidos, ver pipeline/README.md).

export type Verdict = 'consistente' | 'limitada' | 'sin_evidencia' | 'incompleta';
export type IndicatorKey = 'may_oct_mm' | 'jul_aug_mm' | 'annual_mm';
export type Lang = 'es' | 'en';
export type Lens = 'agri' | 'com' | 'ene';
export type EnsoPhase = 'nino' | 'nina' | 'neutral';

/** [año_inicio, año_fin, pendiente_por_década | null, p | null] */
export type FootprintWindow = [number, number, number | null, number | null];

export interface GridIndicator {
  mean: number | null;
  slope_dec: number | null;
  ci95: [number | null, number | null];
  p: number | null;
  p_fdr: number | null;
  sign_agreement: number | null;
  sig_fraction: number | null;
  enso_r: number | null;
  enso_p_fdr: number | null;
  valid_years: number;
  verdict: Verdict;
  tags?: string[];
}

export interface GridCell {
  id: string;
  lat: number;
  lon: number;
  country: string;
  cluster: number | null;
  canicula?: boolean | null;
  ind: Partial<Record<IndicatorKey, GridIndicator>>;
}

export interface Grid {
  cells: GridCell[];
}

export interface SeriesPoint {
  year: number;
  value: number | null;
  anomaly: number | null;
  enso: EnsoPhase | null;
  enso_strong?: boolean | null;
}

export interface Statistics {
  method: string;
  mk_variant: 'original' | 'hamed_rao' | 'tfpw';
  lag1_autocorr: number | null;
  slope_per_decade: number | null;
  intercept: number | null;
  intercept_year?: number;
  ci_95: [number | null, number | null];
  p_value: number | null;
  adjusted_p_fdr: number | null;
  sign_agreement?: number | null;
  sig_fraction?: number | null;
  cv?: number | null;
}

export interface EnsoTest {
  slope_without_strong_enso: number | null;
  p_without_strong_enso: number | null;
  slope_oni_removed: number | null;
  p_oni_removed: number | null;
  survives: boolean | null;
}

export interface Narrative {
  es: string;
  en: string;
  generated_by: string;
}

export interface SecondVariable {
  // P1 (Rol 1): segunda variable de NASA POWER en los sitios de los casos. Formato provisional.
  parameter: string;
  units: string;
  slope_per_decade: number | null;
  p_value: number | null;
  verdict?: Verdict;
}

export interface CellIndicator {
  units: string;
  mean?: number | null;
  valid_years?: number;
  n_years?: number;
  series: SeriesPoint[];
  statistics: Statistics;
  footprint: FootprintWindow[];
  enso_test: EnsoTest | null;
  break_2014: { pettitt_year: number | null; p: number | null; flag: boolean | null } | null;
  verdict: Verdict;
  verdict_reasons: string[];
  tags?: string[];
  narrative: Narrative | null;
  limitations: string[];
  second_variable?: SecondVariable | null;
}

export interface CellDetail {
  id: string;
  name: string | null;
  lat?: number;
  lon?: number;
  country?: string;
  canicula?: boolean | null;
  monthly_climatology_mm: number[] | null;
  indicators: Partial<Record<IndicatorKey, CellIndicator>>;
}

export interface IndicatorInfo {
  units: string;
  label_es: string;
  label_en: string;
}

export interface Meta {
  generated_at: string;
  pipeline_commit: string | null;
  synthetic?: boolean;
  dataset: string;
  dataset_doi: string;
  period: [number, number];
  bbox: { lat: [number, number]; lon: [number, number] };
  n_cells: number;
  indicators: IndicatorKey[];
  indicator_info?: Record<IndicatorKey, IndicatorInfo>;
  thresholds: Record<string, unknown>;
  threshold_changes?: string[];
  calibration: {
    n_sim: number;
    false_positive_rate: { consistente: number | null; limitada: number | null };
    power: { injected_trend_pct_per_decade: number; detected_consistente: number | null; detected_limitada_o_mas: number | null };
  };
  aux_data: string[];
  lenses: Record<Lens, IndicatorKey[]>;
  recipe?: Record<string, unknown>;
}

export type Bilingual = { es: string; en: string };
export type BilingualList = { es: string[]; en: string[] };

/** decision_rules.json (Rol 6): lente → escenario → preguntas por veredicto + datos que faltan */
export interface DecisionRules {
  status?: string;
  scenarios: Record<string, Bilingual>;
  lenses: Partial<Record<Lens, {
    label: Bilingual;
    scenarios?: Record<string, { questions: Partial<Record<Verdict | 'default', BilingualList>>; missing: BilingualList }>;
    pending?: Bilingual;
  }>>;
  next_steps?: { label: Bilingual; url: string }[];
}

export interface GlossaryEntry {
  term: Bilingual;
  short: Bilingual;
}
export type Glossary = Record<string, GlossaryEntry>;

export interface TourStep {
  target: string;
  title: Bilingual;
  body: Bilingual;
  glossary?: string;
}
export interface Tour {
  status?: string;
  steps: TourStep[];
}
