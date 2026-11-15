// Contrato de datos (plan v3.1, sección 3.2). Si Rol 4 ya publicó sus tipos, usar los suyos
// y dejar aquí solo lo que falte. Los campos marcados "PROPUESTO" aún no están en el contrato.

export const VERDICTS = ['consistente', 'limitada', 'sin_evidencia', 'incompleta'] as const;
export type Verdict = (typeof VERDICTS)[number];

export const INDICATORS = ['may_oct_mm', 'jul_aug_mm', 'annual_mm'] as const;
export type IndicatorKey = (typeof INDICATORS)[number];

export type Lang = 'es' | 'en';
export type Lens = 'agri' | 'com' | 'ene';
export type EnsoPhase = 'nino' | 'nina' | 'neutral'; // claves por confirmar con Rol 3

/** Todo número del pipeline puede faltar. Nunca se sustituye por 0. */
export type Num = number | null;
export type Period = readonly [number, number];
export type Win = readonly [number, number];

export interface SeriesPoint {
  year: number;
  value: Num;
  anomaly: Num;
  enso: EnsoPhase | null;
}

/** [inicio, fin, pendiente_por_década, p] y, PROPUESTO, [.., ic_bajo, ic_alto]. */
export type FootprintTuple =
  | [number, number, Num, Num]
  | [number, number, Num, Num, Num, Num];

export interface Statistics {
  method: string;
  mk_variant: string;
  lag1_autocorr: Num;
  slope_per_decade: Num;
  intercept: Num;
  ci_95: [Num, Num] | null;
  p_value: Num;
  adjusted_p_fdr: Num;
}

export interface EnsoTest {
  slope_without_strong_enso: Num;
  p_without_strong_enso: Num;
  slope_oni_removed: Num;
  p_oni_removed: Num;
  survives: boolean | null;
}

export interface Break2014 {
  pettitt_year: Num;
  p: Num;
  flag: boolean;
}

export interface Narrative {
  es: string;
  en: string;
  generated_by: 'AI' | 'template';
}

export interface CellIndicator {
  units: string;
  series: SeriesPoint[];
  statistics: Statistics | null;
  footprint: FootprintTuple[];
  enso_test: EnsoTest | null;
  break_2014: Break2014 | null;
  verdict: Verdict;
  verdict_reasons: string[];
  narrative: Narrative | null;
  limitations: string[];
  window_results?: Record<string, { ci_95: [Num, Num]; verdict: Verdict; verdict_reasons: string[] }>;
  tags?: string[]; // PROPUESTO: p. ej. ["alta_variabilidad"]
}

export interface CellDetail {
  id: string;
  name: string | null;
  monthly_climatology_mm: Num[];
  secondary_variables?: { key: string; label: L10n; source: string; doi: string; period: [number, number]; data: CellIndicator }[];
  has_canicula?: boolean; // PROPUESTO (Rol 1)
  indicators: Partial<Record<IndicatorKey, CellIndicator>>;
}

export interface GridIndicator {
  mean: Num;
  slope_dec: Num;
  ci95: [Num, Num] | null;
  p: Num;
  p_fdr: Num;
  sign_agreement: Num;
  sig_fraction: Num;
  enso_r: Num;
  enso_p_fdr: Num;
  valid_years: number;
  verdict: Verdict;
}

export interface GridCell {
  id: string;
  lat: number;
  lon: number;
  country: string;
  cluster: number | null;
  ind: Partial<Record<IndicatorKey, GridIndicator>>;
}

export interface Meta {
  data_kind?: "mock" | "observed";
  generated_at: string;
  pipeline_commit: string;
  dataset: string;
  dataset_doi: string;
  period: [number, number];
  bbox: { lat: [number, number]; lon: [number, number] };
  n_cells: number;
  indicators: IndicatorKey[];
  thresholds: Record<string, unknown>;
  calibration: {
    n_sim: number;
    false_positive_rate: { consistente: Num; limitada: Num };
    power: {
      injected_trend_pct_per_decade: number;
      detected_consistente: Num;
      detected_limitada_o_mas: Num;
    };
  } | null;
  aux_data: string[];
  lenses: Record<Lens, IndicatorKey[]>;
}

export type L10n<T = string> = Record<Lang, T>;
