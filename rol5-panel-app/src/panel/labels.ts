// Nombres legibles para la interfaz. Los códigos (may_oct_mm, agri…) siguen en la URL y en los datos.
import type { IndicatorKey, L10n, Lang, Lens, Verdict } from './types';

export const IND_LABEL: Record<IndicatorKey, L10n> = {
  may_oct_mm: { es: 'Lluvia de temporada (mayo–octubre)', en: 'Rainy-season rainfall (May–Oct)' },
  jul_aug_mm: { es: 'Lluvia de canícula (julio–agosto)', en: 'Midsummer rainfall (Jul–Aug)' },
  annual_mm: { es: 'Lluvia de todo el año', en: 'Annual rainfall' },
};

/** Texto del selector: dice qué meses se suman. Que es un total por año y el periodo (2001–2024) van en la nota bajo el selector. */
export const IND_OPTION: Record<IndicatorKey, L10n> = {
  may_oct_mm: { es: 'Lluvia de temporada (mayo a octubre)', en: 'Rainy season (May to October)' },
  jul_aug_mm: { es: 'Lluvia de canícula (julio y agosto)', en: 'Midsummer (July and August)' },
  annual_mm: { es: 'Lluvia de todo el año (enero a diciembre)', en: 'Whole year (January to December)' },
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

/** Respuesta directa a la pregunta de la persona, antes del método. Solo usa el signo de la pendiente ya calculada. */
export function answerLine(verdict: Verdict, slope: number | null | undefined, lang: Lang): string {
  const es = lang === 'es';
  const down = typeof slope === 'number' && slope < 0;
  const dirEs = down ? 'bajando' : 'subiendo';
  const dirEn = down ? 'falling' : 'rising';
  const hasDir = typeof slope === 'number' && slope !== 0;
  if (verdict === 'incompleta' || !hasDir) {
    return es ? 'No hay suficientes años con datos para evaluar este lugar.' : 'There are too few years with data to assess this place.';
  }
  if (verdict === 'consistente') {
    return es ? `La evidencia respalda que la lluvia está ${dirEs}, con las limitaciones que se indican abajo.` : `The evidence supports rainfall ${dirEn}, with the limitations noted below.`;
  }
  if (verdict === 'limitada') {
    return es ? `Hay señal de que la lluvia podría estar ${dirEs}, pero no alcanza para afirmarlo.` : `There is a sign that rainfall may be ${dirEn}, but not enough to claim it.`;
  }
  return es ? 'Aquí no podemos afirmar que la lluvia esté cambiando.' : 'Here we cannot say that rainfall is changing.';
}

/** Qué puede hacer la persona con este resultado. Recomendación de uso, no de decisión. */
export const NEXT_STEP: Record<Verdict, L10n> = {
  consistente: {
    es: 'Lee las limitaciones y compara con un pluviómetro cercano antes de usar este dato para decidir.',
    en: 'Read the limitations and compare with a nearby rain gauge before using this to decide.',
  },
  limitada: {
    es: 'Cambia los años en el gráfico de abajo. Si la historia cambia mucho, tómala con cautela.',
    en: 'Change the years in the chart below. If the story changes a lot, treat it with caution.',
  },
  sin_evidencia: {
    es: 'Si necesitas planificar, revisa también la lluvia que mide tu municipalidad o un pluviómetro cercano.',
    en: 'If you need to plan, also check the rainfall your municipality or a nearby rain gauge measures.',
  },
  incompleta: {
    es: 'Prueba con otra celda del mapa.',
    en: 'Try another cell on the map.',
  },
};
