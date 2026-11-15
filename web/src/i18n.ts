// Textos del panel (ES/EN). Las claves de razones y limitaciones vienen fijas del pipeline
// (pipeline/altaris/verdict.py → REASONS, steps.py → GENERAL_LIMITATIONS).
// Rol 3 audita estos textos contra la regla de oro: nada de predicción ni causa.
import type { Lang, Verdict } from './types';

type Dict = Record<string, { es: string; en: string }>;

export const VERDICT_TEXT: Record<Verdict, { es: string; en: string; icon: string }> = {
  consistente: { es: 'Evidencia consistente', en: 'Consistent evidence', icon: '●' },
  limitada: { es: 'Evidencia limitada', en: 'Limited evidence', icon: '◐' },
  sin_evidencia: { es: 'Sin evidencia suficiente', en: 'Insufficient evidence', icon: '○' },
  incompleta: { es: 'Evaluación incompleta', en: 'Incomplete assessment', icon: '⊘' },
};

export const VERDICT_SUB: Record<Verdict, { es: string; en: string }> = {
  consistente: {
    es: 'La tendencia pasa todas las pruebas y resiste el cambio de ventana de años.',
    en: 'The trend passes every test and holds when the window of years changes.',
  },
  limitada: { es: 'Señal débil, no confirmada.', en: 'Weak signal, not confirmed.' },
  sin_evidencia: {
    es: 'El análisis no muestra sustento estadístico de una tendencia. Es un hallazgo, no un error.',
    en: 'The analysis shows no statistical support for a trend. That is a finding, not an error.',
  },
  incompleta: { es: 'Faltan datos o validaciones para evaluar.', en: 'Data or checks are missing for an assessment.' },
};

export const REASON_TEXT: Dict = {
  datos_incompletos: { es: 'Faltan más de 2 años válidos', en: 'More than 2 valid years are missing' },
  fdr_significativo: { es: 'Significativa tras corregir por muchas celdas (FDR)', en: 'Significant after correcting for many cells (FDR)' },
  fdr_no_significativo: { es: 'No significativa tras corregir por muchas celdas (FDR)', en: 'Not significant after correcting for many cells (FDR)' },
  ic_excluye_cero: { es: 'El intervalo de confianza no incluye 0', en: 'The confidence interval excludes 0' },
  ic_incluye_cero: { es: 'El intervalo de confianza incluye 0', en: 'The confidence interval includes 0' },
  huella_estable: { es: 'El signo se mantiene en ≥ 90 % de las ventanas', en: 'The sign holds in ≥ 90% of windows' },
  huella_inestable: { es: 'El signo cambia al mover la ventana de años', en: 'The sign changes when the window of years moves' },
  ventanas_significativas: { es: 'Significativa en al menos la mitad de las ventanas', en: 'Significant in at least half of the windows' },
  pocas_ventanas_significativas: { es: 'Significativa en menos de la mitad de las ventanas', en: 'Significant in fewer than half of the windows' },
  sobrevive_enso: { es: 'Se mantiene al descontar ENSO', en: 'Holds after accounting for ENSO' },
  no_sobrevive_enso: { es: 'No se mantiene al descontar ENSO', en: 'Does not hold after accounting for ENSO' },
  enso_pendiente: { es: 'Prueba ENSO pendiente', en: 'ENSO test pending' },
  sin_salto_2014: { es: 'Sin salto en 2014 (cambio de satélites)', en: 'No 2014 break (satellite change)' },
  posible_salto_2014: { es: 'Posible salto en 2014: no se descarta un efecto del cambio de satélites', en: 'Possible 2014 break: a satellite-change effect cannot be ruled out' },
  salto_2014_pendiente: { es: 'Chequeo de 2014 pendiente', en: '2014 check pending' },
  p_sin_ajustar_bajo: { es: 'p sin ajustar < 0.10', en: 'Unadjusted p < 0.10' },
  signo_estable_magnitud_relevante: { es: 'Signo estable y magnitud ≥ 5 % de la media por década', en: 'Stable sign and magnitude ≥ 5% of the mean per decade' },
  sin_senal: { es: 'Sin señal estadística', en: 'No statistical signal' },
};

export const LIMITATION_TEXT: Dict = {
  celda_11km: { es: 'Celda de unos 11 km: no ve microclimas de ladera.', en: 'Cells of about 11 km: hillside microclimates are not resolved.' },
  agregado_mensual: { es: 'Agregados mensuales: no miden rachas de días secos ni extremos diarios.', en: 'Monthly totals: dry spells and daily extremes are not measured.' },
  registro_corto: { es: '24 años es un registro corto: variabilidad decenal y tendencia pueden confundirse.', en: '24 years is a short record: decadal variability and trend can be confused.' },
  union_trmm_gpm: { es: 'El registro une las eras TRMM y GPM (~2014): puede haber una discontinuidad instrumental.', en: 'The record joins the TRMM and GPM eras (~2014): there may be an instrumental discontinuity.' },
  pluviometros_escasos: { es: 'IMERG Final se ajusta con pluviómetros; donde hay pocos, el ajuste es más débil.', en: 'IMERG Final is gauge-adjusted; where gauges are scarce the adjustment is weaker.' },
  oni_no_nasa: { es: 'El índice ONI (ENSO) es de NOAA, no de la NASA.', en: 'The ONI (ENSO) index comes from NOAA, not NASA.' },
  huella_no_es_prueba: { es: 'Las ventanas de la huella se solapan: es una prueba de sensibilidad, no una prueba formal.', en: 'Footprint windows overlap: it is a sensitivity check, not a formal test.' },
  canicula_no_aplica: { es: 'En esta zona el indicador de canícula no aplica.', en: 'The midsummer-drought indicator does not apply in this area.' },
  anos_faltantes: { es: 'Hay años sin dato; nunca se rellenan con ceros.', en: 'Some years have no data; they are never filled with zeros.' },
  posible_salto_2014: { es: 'Posible salto en 2014 en esta serie.', en: 'Possible 2014 break in this series.' },
};

export const UI: Dict = {
  completeness: { es: 'años válidos', en: 'valid years' },
  series: { es: 'Serie anual y tendencia', en: 'Annual series and trend' },
  sen: { es: 'Recta de Sen', en: 'Sen line' },
  ci: { es: 'IC 95 % de la pendiente', en: '95% CI of the slope' },
  per_decade: { es: 'por década', en: 'per decade' },
  satellite_era: { es: 'Cambio de era de satélites (TRMM→GPM)', en: 'Satellite era change (TRMM→GPM)' },
  footprint: { es: 'Huella de estabilidad', en: 'Stability footprint' },
  footprint_help: {
    es: 'Cada casilla es una ventana de años (inicio → fin). Color: signo de la pendiente. Tono fuerte: p < 0.05. Toca una casilla para compararla.',
    en: 'Each square is a window of years (start → end). Color: sign of the slope. Strong tone: p < 0.05. Tap a square to compare it.',
  },
  overlap_warning: {
    es: 'Las ventanas se solapan: esto es una prueba de sensibilidad, no una prueba formal. Sus p no se corrigen.',
    en: 'Windows overlap: this is a sensitivity check, not a formal test. Their p-values are not corrected.',
  },
  start_year: { es: 'Año de inicio', en: 'Start year' },
  end_year: { es: 'Año de fin', en: 'End year' },
  drier: { es: 'Baja (p < 0.05)', en: 'Decrease (p < 0.05)' },
  drier_ns: { es: 'Baja (no signif.)', en: 'Decrease (not signif.)' },
  wetter: { es: 'Alza (p < 0.05)', en: 'Increase (p < 0.05)' },
  wetter_ns: { es: 'Alza (no signif.)', en: 'Increase (not signif.)' },
  no_data: { es: 'Sin datos suficientes', en: 'Not enough data' },
  min15: { es: 'Debajo de la línea: ventanas de < 15 años, no cuentan para el veredicto', en: 'Below the line: windows < 15 years, not used in the verdict' },
  base_period: { es: 'Periodo base', en: 'Base period' },
  window: { es: 'Ventana', en: 'Window' },
  chosen_window: { es: 'Ventana elegida', en: 'Chosen window' },
  compare: { es: 'Periodo base vs. ventana elegida', en: 'Base period vs. chosen window' },
  compare_hint: { es: 'Elige una casilla de la huella para comparar.', en: 'Pick a footprint square to compare.' },
  slope: { es: 'Pendiente', en: 'Slope' },
  p: { es: 'p', en: 'p' },
  p_fdr: { es: 'p ajustado (FDR)', en: 'Adjusted p (FDR)' },
  ci95: { es: 'IC 95 %', en: '95% CI' },
  verdict: { es: 'Veredicto', en: 'Verdict' },
  window_sig: { es: 'Significativa en esta ventana (p < 0.05, sin corregir)', en: 'Significant in this window (p < 0.05, uncorrected)' },
  window_ns: { es: 'No significativa en esta ventana', en: 'Not significant in this window' },
  sign_flip: { es: 'El signo se invierte respecto al periodo base', en: 'The sign flips relative to the base period' },
  window_note: {
    es: 'El veredicto completo solo existe para el periodo base; en una ventana se muestran pendiente y p sin corregir.',
    en: 'The full verdict only exists for the base period; a window shows slope and uncorrected p.',
  },
  clear: { es: 'Quitar', en: 'Clear' },
  climatology: { es: 'Cuándo llueve en esta celda (media mensual)', en: 'When it rains in this cell (monthly mean)' },
  months: { es: 'E,F,M,A,M,J,J,A,S,O,N,D', en: 'J,F,M,A,M,J,J,A,S,O,N,D' },
  enso_view: { es: 'Años por fase ENSO', en: 'Years by ENSO phase' },
  nino: { es: 'El Niño', en: 'El Niño' },
  nina: { es: 'La Niña', en: 'La Niña' },
  neutral: { es: 'Neutral', en: 'Neutral' },
  strong: { es: 'fuerte', en: 'strong' },
  remove_strong: { es: 'Quitar años ENSO fuertes', en: 'Remove strong ENSO years' },
  without_strong: { es: 'Sin años ENSO fuertes', en: 'Without strong ENSO years' },
  oni_removed: { es: 'Descontando ONI (residuos)', en: 'ONI removed (residuals)' },
  survives: { es: 'La tendencia se mantiene al descontar ENSO', en: 'The trend holds after accounting for ENSO' },
  not_survives: { es: 'La tendencia no se mantiene al descontar ENSO', en: 'The trend does not hold after accounting for ENSO' },
  enso_pending: { es: 'Prueba ENSO pendiente (Rol 3).', en: 'ENSO test pending.' },
  enso_no_phases: { es: 'Fases ENSO aún no disponibles.', en: 'ENSO phases not yet available.' },
  enso_assoc: { es: 'Asociación con ENSO (correlación de Spearman con ONI)', en: 'Association with ENSO (Spearman correlation with ONI)' },
  association_not_cause: { es: 'Asociación, no causa.', en: 'Association, not cause.' },
  mirror: { es: 'Vista espejo', en: 'Mirror view' },
  mirror_pick: { es: 'Comparar con otra celda', en: 'Compare with another cell' },
  mirror_none: { es: '— ninguna —', en: '— none —' },
  mirror_scale: { es: 'Las dos gráficas usan la misma escala.', en: 'Both charts share the same scale.' },
  narrative: { es: 'En pocas palabras', en: 'In short' },
  ai_text: { es: 'Texto generado con IA a partir de las cifras del JSON', en: 'AI-generated text from the JSON figures' },
  template_text: { es: 'Texto de plantilla a partir de las cifras del JSON', en: 'Template text from the JSON figures' },
  decide: { es: 'Preguntas para decidir', en: 'Questions to decide' },
  what_we_know: { es: 'Qué observamos', en: 'What we observe' },
  questions: { es: 'Preguntas para decidir', en: 'Questions to decide' },
  missing: { es: 'Datos locales que faltan', en: 'Local data still needed' },
  no_action: {
    es: 'ALTARIS no recomienda acciones: muestra qué preguntas conviene responder con datos locales antes de decidir.',
    en: 'ALTARIS does not recommend actions: it shows which questions to answer with local data before deciding.',
  },
  next_step: { es: 'Siguiente paso operativo', en: 'Operational next step' },
  rules_missing: { es: 'Las tarjetas de decisión aún no están cargadas (decision_rules.json).', en: 'Decision cards not loaded yet (decision_rules.json).' },
  incomplete_cards: { es: 'Con la evaluación incompleta no se muestran preguntas de decisión.', en: 'No decision questions are shown for an incomplete assessment.' },
  second_var: { es: 'Segunda variable NASA', en: 'Second NASA variable' },
  pending_quant: { es: 'Análisis cuantitativo pendiente', en: 'Quantitative analysis pending' },
  limitations: { es: 'Límites de este análisis', en: 'Limits of this analysis' },
  passport: { es: 'Evidence Passport', en: 'Evidence Passport' },
  passport_help: { es: 'Descarga o comparte esta investigación exacta.', en: 'Download or share this exact investigation.' },
  dl_json: { es: 'Descargar JSON', en: 'Download JSON' },
  dl_md: { es: 'Descargar Markdown', en: 'Download Markdown' },
  print: { es: 'Imprimir', en: 'Print' },
  copy_link: { es: 'Copiar enlace', en: 'Copy link' },
  copied: { es: 'Enlace copiado', en: 'Link copied' },
  copy_failed: { es: 'No se pudo copiar; el enlace está abajo', en: 'Could not copy; the link is below' },
  quiz_title: { es: 'Dos preguntas rápidas (anónimas)', en: 'Two quick questions (anonymous)' },
  quiz_send: { es: 'Enviar', en: 'Submit' },
  quiz_thanks: { es: 'Gracias. Tus respuestas se guardaron de forma anónima.', en: 'Thank you. Your answers were saved anonymously.' },
  synthetic: {
    es: 'DATOS SINTÉTICOS: cifras inventadas para desarrollo. No usar en la entrega.',
    en: 'SYNTHETIC DATA: made-up figures for development. Do not use in the submission.',
  },
  loading: { es: 'Cargando…', en: 'Loading…' },
  load_error: { es: 'No se pudieron cargar los datos de esta celda.', en: 'Could not load this cell’s data.' },
  no_indicator: { es: 'Esta celda no tiene datos para este indicador.', en: 'This cell has no data for this indicator.' },
  pick_cell: { es: 'Elige una celda para ver su evidencia.', en: 'Pick a cell to see its evidence.' },
  tour_start: { es: 'Recorrido guiado', en: 'Guided tour' },
  tour_skip: { es: 'Saltar', en: 'Skip' },
  tour_next: { es: 'Siguiente', en: 'Next' },
  tour_prev: { es: 'Anterior', en: 'Back' },
  tour_done: { es: 'Terminar', en: 'Finish' },
  table_view: { es: 'Ver tabla', en: 'Show table' },
  year: { es: 'Año', en: 'Year' },
  value: { es: 'Valor', en: 'Value' },
  anomaly: { es: 'Anomalía', en: 'Anomaly' },
  phase: { es: 'Fase ENSO', en: 'ENSO phase' },
  variant: { es: 'Variante de Mann-Kendall', en: 'Mann-Kendall variant' },
};

export function t(key: string, lang: Lang): string {
  return UI[key]?.[lang] ?? key;
}

export function reasonText(key: string, lang: Lang): string {
  return REASON_TEXT[key]?.[lang] ?? key;
}

export function limitationText(key: string, lang: Lang): string {
  return LIMITATION_TEXT[key]?.[lang] ?? key;
}

export function fmt(x: number | null | undefined, digits = 1, signed = false): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return '—';
  const s = x.toFixed(digits);
  return signed && x > 0 ? `+${s}` : s;
}

export function fmtP(p: number | null | undefined): string {
  if (p === null || p === undefined || !Number.isFinite(p)) return '—';
  return p < 0.001 ? '< 0.001' : p.toFixed(3);
}
