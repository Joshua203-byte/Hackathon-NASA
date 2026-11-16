import type { L10n, Lang } from './types';

/** Razones en llano para estudiantes (docs/12, T2.1). Las técnicas siguen en reasons.json y se ven en «Ver detalle estadístico». */
export const PLAIN_REASON: Record<string, L10n> = {
  criterios_cumplidos: {
    es: 'Pasa todas las pruebas de este análisis: la señal es estadísticamente significativa, el margen de error no incluye el cero y se mantiene al cambiar los años.',
    en: 'It passes every test in this analysis: the signal is statistically significant, the margin of error excludes zero and it holds when the years change.',
  },
  pocos_anios: {
    es: 'Faltan años con datos: no hay base para evaluar una tendencia.',
    en: 'Too many years are missing: there is not enough to assess a trend.',
  },
  fdr_no_significativo: {
    es: 'Al mirar miles de lugares a la vez, una señal así puede salir por azar. Tras ese ajuste (FDR), deja de ser significativa.',
    en: 'When thousands of places are checked at once, a signal like this can appear by chance. After that adjustment (FDR), it is no longer significant.',
  },
  ic_incluye_cero: {
    es: 'El margen de error incluye el cero: con estos datos la lluvia podría estar bajando, subiendo o sin cambio.',
    en: 'The margin of error includes zero: with these data rainfall could be falling, rising or not changing.',
  },
  huella_inestable: {
    es: 'La lectura cambia al mover los años: con otro periodo la tendencia cambia de dirección o deja de ser clara.',
    en: 'The reading changes when the years move: with another period the trend changes direction or stops being clear.',
  },
  enso_no_sobrevive: {
    es: 'Al descontar El Niño y La Niña, la tendencia cambia de dirección o sale de su margen de error: parte de lo que se ve podría deberse a ellos.',
    en: 'When El Niño and La Niña are removed, the trend changes direction or leaves its margin of error: part of what you see could be due to them.',
  },
  posible_salto_2014: {
    es: 'Hay un posible salto entre 2013 y 2015, cuando cambió el satélite que mide la lluvia: no se puede descartar que sea un efecto del instrumento.',
    en: 'There is a possible jump between 2013 and 2015, when the satellite measuring rainfall changed: an instrument effect cannot be ruled out.',
  },
  p_no_significativo: {
    es: 'La prueba estadística (Mann–Kendall) no distingue esta tendencia del vaivén natural de la lluvia.',
    en: 'The statistical test (Mann–Kendall) cannot tell this trend apart from the natural ups and downs of rainfall.',
  },
  fdr_pendiente: {
    es: 'Falta el ajuste por mirar muchos lugares a la vez: el resultado puede cambiar al procesar toda la región.',
    en: 'The adjustment for checking many places at once is missing: the result may change when the whole region is processed.',
  },
  enso_pendiente: {
    es: 'Falta comprobar el efecto de El Niño y La Niña: el resultado puede cambiar.',
    en: 'The El Niño / La Niña check is missing: the result may change.',
  },
  chequeo_2014_pendiente: {
    es: 'Falta comprobar el posible salto de 2014: el resultado puede cambiar.',
    en: 'The check for a possible 2014 jump is missing: the result may change.',
  },
  ventana_pocos_anios: {
    es: 'Estos años no bastan: hay muy pocos años con datos en este periodo.',
    en: 'These years are not enough: this period has too few years with data.',
  },
  ventana_sin_correccion: {
    es: 'En este periodo hay señal, pero no pasó los ajustes ni controles: sirve para probar qué tan sensible es el resultado, no para confirmarlo.',
    en: 'In this period there is a signal, but it did not go through the adjustments or checks: it tests how sensitive the result is, it does not confirm it.',
  },
  ventana_signo_opuesto: {
    es: 'En este periodo la tendencia va en sentido contrario a la del periodo completo.',
    en: 'In this period the trend goes the opposite way to the full period.',
  },
  ventana_p_no_significativo: {
    es: 'En este periodo no se distingue una tendencia del vaivén natural de la lluvia.',
    en: 'In this period a trend cannot be told apart from the natural ups and downs of rainfall.',
  },
};

/** Si un código no tiene versión llana, se muestra la técnica: nunca se inventa texto. */
export const reasonPlain = (code: string, lang: Lang, fallback: (c: string, l: Lang) => string): string => PLAIN_REASON[code]?.[lang] ?? fallback(code, lang);
