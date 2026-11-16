import type { L10n } from './types';

/** Zonas de la ayuda «¿No entiendes algo?» (docs/12, T4). BORRADOR: textos pendientes de aprobación de Camila. Máximo 3 frases cada uno. */
export interface HelpZone {
  key: string;
  /** Selector del elemento al que se pega el «?». Los de data-tour son los mismos del recorrido. */
  selector: string;
  /** Dónde se pega el «?»: por defecto en la esquina superior derecha de la zona; «left» a su izquierda (zonas pequeñas). */
  side?: 'left';
  question: L10n;
  body: L10n;
}

export const HELP_ZONES: readonly HelpZone[] = [
  {
    key: 'intro', selector: '[data-tour="intro"]',
    question: { es: '¿Qué es ALTARIS?', en: 'What is ALTARIS?' },
    body: {
      es: 'Compara años de lluvia medida por satélites de la NASA y te dice cuánta confianza merece cada tendencia. Una línea que baja unos años no prueba, por sí sola, que la lluvia esté cambiando.',
      en: 'It compares years of rainfall measured by NASA satellites and tells you how much confidence each trend deserves. A line that falls for a few years does not prove, by itself, that rainfall is changing.',
    },
  },
  {
    key: 'cases', selector: '[data-tour="cases"]',
    question: { es: '¿Qué son estos ejemplos?', en: 'What are these examples?' },
    body: {
      es: 'Tres lugares ya elegidos para ver cómo funciona: uno sin evidencia, uno que cambia según los años que mires y otro con evidencia consistente. Toca uno para abrirlo.',
      en: 'Three places already chosen to show how it works: one with no evidence, one that changes with the years you look at, and one with consistent evidence. Tap one to open it.',
    },
  },
  {
    key: 'controls', selector: '[data-tour="controls"]',
    question: { es: '¿Qué cambia cada selector?', en: 'What does each selector change?' },
    body: {
      es: 'Eliges qué lluvia ver (de temporada, de julio y agosto o de todo el año) y para qué la necesitas. También puedes ir a un lugar por su código o compararlo con otro.',
      en: 'You choose which rainfall to see (rainy season, July–August or the whole year) and what you need it for. You can also go to a place by its code or compare it with another.',
    },
  },
  {
    key: 'layers', selector: '.region-map-layers',
    question: { es: '¿Qué muestra cada capa?', en: 'What does each layer show?' },
    body: {
      es: 'Veredicto es la respuesta del análisis. Pendiente, hacia dónde va la lluvia. Estabilidad, si esa dirección se mantiene al cambiar los años. ENSO, cuánto sigue el patrón de El Niño y La Niña (asociación, no causa).',
      en: 'Verdict is the analysis’s answer. Slope, where rainfall is heading. Stability, whether that direction holds when the years change. ENSO, how closely it follows El Niño / La Niña (an association, not a cause).',
    },
  },
  {
    key: 'mapctl', selector: '.space-tools', side: 'left',
    question: { es: '¿Cómo me muevo por el mapa?', en: 'How do I move around the map?' },
    body: {
      es: 'Arrastra para moverte y usa + y − o la rueda del ratón para acercarte o alejarte. «Centrar región» te devuelve al encuadre inicial si te pierdes.',
      en: 'Drag to move and use + and − or the mouse wheel to zoom in or out. “Frame region” takes you back to the starting view if you get lost.',
    },
  },
  {
    key: 'legend', selector: '.map-legend',
    question: { es: '¿Qué es cada cuadro y qué significan los colores?', en: 'What is each square and what do the colours mean?' },
    body: {
      es: 'Cada cuadro es un lugar de unos 11 × 11 km. En la capa «Veredicto», el color dice cuánta confianza merece la tendencia de lluvia de ese lugar, no cuánto llueve.',
      en: 'Each square is a place of about 11 × 11 km. In the “Verdict” layer, the colour tells how much confidence the rainfall trend of that place deserves, not how much rain falls.',
    },
  },
  {
    key: 'verdict', selector: '[data-tour="verdict"]',
    question: { es: '¿Qué quiere decir este veredicto?', en: 'What does this verdict mean?' },
    body: {
      es: 'Es la respuesta del análisis a «¿se puede afirmar que la lluvia está cambiando?». «Sin evidencia» no significa que no cambie nada: significa que estos datos no alcanzan para afirmarlo.',
      en: 'It is the analysis’s answer to “can we say that rainfall is changing?”. “No evidence” does not mean nothing changes: it means these data are not enough to say so.',
    },
  },
  {
    key: 'series', selector: '[data-tour="series"]',
    question: { es: '¿Cómo leo esta gráfica?', en: 'How do I read this chart?' },
    body: {
      es: 'Cada punto es un año. La recta resume hacia dónde apunta la lluvia en estos años y la banda muestra cuánta incertidumbre tiene esa recta.',
      en: 'Each dot is a year. The line summarises where rainfall points over these years and the band shows how uncertain that line is.',
    },
  },
  {
    key: 'years', selector: '[data-tour="years"]',
    question: { es: '¿Para qué sirve elegir los años?', en: 'Why choose the years?' },
    body: {
      es: 'Prueba si la historia se sostiene: si al acortar o alargar el periodo la tendencia cambia mucho, hay que tomarla con cautela.',
      en: 'It tests whether the story holds up: if the trend changes a lot when the period is shortened or lengthened, treat it with caution.',
    },
  },
  {
    key: 'footprint', selector: '[data-tour="footprint"]',
    question: { es: '¿Qué es este triángulo?', en: 'What is this triangle?' },
    body: {
      es: 'Cada casilla es un periodo distinto. Muestra de un vistazo en cuáles se distingue una tendencia y en cuáles no.',
      en: 'Each box is a different period. It shows at a glance in which periods a trend can be distinguished and in which it cannot.',
    },
  },
  {
    key: 'compare', selector: '[data-tour="compare"]',
    question: { es: '¿Qué comparo aquí?', en: 'What am I comparing here?' },
    body: {
      es: 'El periodo completo frente al periodo que elegiste.',
      en: 'The full period against the period you chose.',
    },
  },
  {
    key: 'enso', selector: '[data-tour="enso"]',
    question: { es: '¿Qué es ENSO?', en: 'What is ENSO?' },
    body: {
      es: 'El Niño y La Niña son cambios del océano Pacífico que alteran la lluvia de un año a otro. Aquí se ve si la lluvia de este lugar sigue ese patrón.',
      en: 'El Niño and La Niña are changes in the Pacific Ocean that alter rainfall from one year to the next. Here you can see whether the rainfall of this place follows that pattern.',
    },
  },
  {
    key: 'passport', selector: '[data-tour="passport"]',
    question: { es: '¿Qué es el pasaporte de evidencia?', en: 'What is the evidence passport?' },
    body: {
      es: 'Un resumen descargable con los datos, el método y las limitaciones, para que cualquiera pueda comprobar el resultado.',
      en: 'A downloadable summary with the data, the method and the limitations, so anyone can check the result.',
    },
  },
];
