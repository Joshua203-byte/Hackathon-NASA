// Nombres legibles para la interfaz. Los códigos (may_oct_mm, agri…) siguen en la URL y en los datos.
import type { IndicatorKey, L10n, Lang, Lens, Verdict } from './types';

export const IND_LABEL: Record<IndicatorKey, L10n> = {
  may_oct_mm: { es: 'Lluvia de temporada (mayo–octubre)', en: 'Rainy-season rainfall (May–Oct)' },
  jul_aug_mm: { es: 'Lluvia de canícula (julio–agosto)', en: 'Midsummer rainfall (Jul–Aug)' },
  annual_mm: { es: 'Lluvia de todo el año', en: 'Annual rainfall' },
};

export const LENS_LABEL: Record<Lens, L10n> = {
  agri: { es: 'Agricultura', en: 'Agriculture' },
  com: { es: 'Comunidades y agua', en: 'Communities and water' },
  ene: { es: 'Energía', en: 'Energy' },
};

export const COUNTRY: Record<string, L10n> = {
  HND: { es: 'Honduras', en: 'Honduras' },
  GTM: { es: 'Guatemala', en: 'Guatemala' },
  SLV: { es: 'El Salvador', en: 'El Salvador' },
};

/** Qué significa cada veredicto, sin jerga. No añade cifras ni afirmaciones nuevas. */
export const VERDICT_PLAIN: Record<Verdict, L10n> = {
  consistente: {
    es: 'La tendencia pasa todas las pruebas de este análisis: no se explica por azar, se mantiene al cambiar los años y al descontar los años de El Niño y La Niña. No prueba la causa ni descarta un efecto del instrumento: lee las limitaciones.',
    en: 'The trend passes every check in this analysis: it is not explained by chance, it holds when the years change and when El Niño and La Niña years are discounted. It does not prove the cause or rule out an instrument effect: read the limitations.',
  },
  limitada: {
    es: 'Hay una señal, pero no pasa todas las pruebas. Podría ser una tendencia real o simple variación de un año a otro. No alcanza para afirmar un cambio.',
    en: 'There is a signal, but it does not pass every check. It could be a real trend or ordinary year-to-year variation. It is not enough to claim a change.',
  },
  sin_evidencia: {
    es: 'Con estos 24 años no se distingue una tendencia del vaivén normal de la lluvia. No significa que nada cambie: significa que estos datos no permiten afirmarlo.',
    en: 'With these 24 years, a trend cannot be told apart from normal rainfall ups and downs. It does not mean nothing is changing: it means these data cannot confirm it.',
  },
  incompleta: {
    es: 'Faltan demasiados años con datos para evaluar una tendencia.',
    en: 'Too many years are missing to assess a trend.',
  },
};

const UNIT_EN: Record<string, string> = { 'mm/temporada': 'mm/season', 'mm/2 meses': 'mm/2 months', 'mm/año': 'mm/year', 'mm/mes': 'mm/month' };
export const unitLabel = (units: string, lang: Lang): string => (lang === 'en' ? UNIT_EN[units] ?? units : units);
