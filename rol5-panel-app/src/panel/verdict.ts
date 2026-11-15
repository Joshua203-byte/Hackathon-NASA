import type { CellDetail, CellIndicator, IndicatorKey, L10n, Lang, Verdict } from './types';

interface VerdictUi {
  /** Forma distinta por veredicto: no depende solo del color. */
  icon: string;
  label: L10n;
  /** Texto obligatorio junto al veredicto. */
  caveat: L10n | null;
  cssVar: string; // la paleta es de Rol 4; aquí solo el nombre de la variable
}

/** Record exhaustivo: si se añade un veredicto al contrato, TypeScript no compila hasta definirlo aquí. */
export const VERDICT_UI: Record<Verdict, VerdictUi> = {
  consistente: {
    icon: '●',
    label: { es: 'Evidencia consistente', en: 'Consistent evidence' },
    caveat: null,
    cssVar: '--verdict-consistente',
  },
  limitada: {
    icon: '◐',
    label: { es: 'Evidencia limitada', en: 'Limited evidence' },
    caveat: { es: 'Señal débil, no confirmada', en: 'Weak signal, not confirmed' },
    cssVar: '--verdict-limitada',
  },
  sin_evidencia: {
    icon: '○',
    label: { es: 'Sin evidencia de tendencia', en: 'No evidence of a trend' },
    caveat: null,
    cssVar: '--verdict-sin-evidencia',
  },
  incompleta: {
    icon: '▨',
    label: { es: 'Datos incompletos', en: 'Incomplete data' },
    caveat: { es: 'Faltan años válidos: no se evalúa la tendencia', en: 'Too few valid years: trend not assessed' },
    cssVar: '--verdict-incompleta',
  },
};

/** Claves conocidas hoy. Rol 2 publica la lista completa; una clave desconocida se muestra tal cual. */
const REASONS: Record<string, L10n> = {
  mock_window_result: { es: 'Resultado simulado para probar el comparador; no es evidencia científica', en: 'Simulated comparator result; not scientific evidence' },
  fdr_no_significativo: {
    es: 'No es significativa tras corregir por comparaciones múltiples (FDR)',
    en: 'Not significant after multiple-comparison correction (FDR)',
  },
  huella_inestable: {
    es: 'El signo o la significancia cambian al mover la ventana de años',
    en: 'Sign or significance changes when the year window moves',
  },
  posible_salto_2014: {
    es: 'Posible salto entre 2013 y 2015: no se puede descartar un efecto del cambio de satélites',
    en: 'Possible break between 2013 and 2015: an instrument-change effect cannot be ruled out',
  },
};

let pipelineReasons: Record<string, L10n> = {};
export function setReasonCatalog(catalog: Record<string, L10n>) {
  pipelineReasons = catalog;
}
export const reasonText = (key: string, lang: Lang): string => pipelineReasons[key]?.[lang] ?? REASONS[key]?.[lang] ?? key;

export type NoticeKind = 'caveat' | 'break_2014' | 'canicula' | 'overlap';
export interface Notice {
  kind: NoticeKind;
  text: string;
}

/** Regla 4.2: hay canícula si la media de jul–ago es menor que la de jun–sep. Solo si falta has_canicula. */
export function hasCanicula(cell: CellDetail): boolean | null {
  if (typeof cell.has_canicula === 'boolean') return cell.has_canicula;
  const m = cell.monthly_climatology_mm;
  const v = [m?.[5], m?.[6], m?.[7], m?.[8]];
  if (v.some((x) => typeof x !== 'number')) return null;
  const [jun, jul, aug, sep] = v as number[];
  return (jul + aug) / 2 < (jun + sep) / 2;
}

const T = {
  break_2014: {
    es: 'Precaución: el registro cambia de satélites en 2014 (TRMM → GPM) y aquí se detecta un posible salto. No se puede descartar un efecto instrumental; no significa que el dato sea un error.',
    en: 'Caution: the record switches satellites in 2014 (TRMM → GPM) and a possible break is detected here. An instrument effect cannot be ruled out; it does not mean the data are wrong.',
  },
  canicula: {
    es: 'En esta zona el indicador de canícula no aplica.',
    en: 'The mid-summer drought indicator does not apply in this area.',
  },
  overlap: {
    es: 'Las ventanas se solapan y no son pruebas independientes: la huella es una prueba de sensibilidad y sus p no se corrigen.',
    en: 'Windows overlap and are not independent tests: the footprint is a sensitivity check and its p-values are uncorrected.',
  },
} satisfies Record<string, L10n>;

/** Único punto donde se decide qué avisos acompañan a un veredicto. La UI y el pasaporte lo comparten. */
export function verdictNotices(cell: CellDetail, key: IndicatorKey, ind: CellIndicator, lang: Lang): Notice[] {
  const out: Notice[] = [];
  const caveat = VERDICT_UI[ind.verdict]?.caveat;
  if (caveat) out.push({ kind: 'caveat', text: caveat[lang] });
  if (ind.break_2014?.flag === true) out.push({ kind: 'break_2014', text: T.break_2014[lang] });
  if (key === 'jul_aug_mm' && hasCanicula(cell) === false) out.push({ kind: 'canicula', text: T.canicula[lang] });
  if ((ind.footprint?.length ?? 0) > 0) out.push({ kind: 'overlap', text: T.overlap[lang] });
  return out;
}
