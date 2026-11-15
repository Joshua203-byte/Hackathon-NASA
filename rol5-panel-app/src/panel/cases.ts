// Rol 4 · Enlaces de los 3 casos elegidos por Camila (docs/08, resolución del domingo 15 a las 04:15).
// Los títulos son neutros a propósito: el texto de cada caso lo escribe Camila (tarea 8 de docs/06).
import type { IndicatorKey, Lang } from './types';

export interface CaseLink {
  n: 1 | 2 | 3;
  cell: string;
  ind: IndicatorKey;
  /** Ventana que abre el enlace ("2001-2010"). Sin ventana = periodo base. */
  win?: string;
  /** Celda de comparación para la vista espejo. */
  mirror?: string;
  title: Record<Lang, string>;
  note?: Record<Lang, string>;
  /** Qué enseña el caso. Texto de Camila (docs/09, sección 1), abreviado sin cambiar cifras ni salvedades. */
  story?: Record<Lang, string[]>;
}

export const CASES: readonly CaseLink[] = [
  {
    n: 1, cell: 'N1335W08715', ind: 'may_oct_mm',
    title: { es: 'Choluteca, Corredor Seco', en: 'Choluteca, Dry Corridor' },
    story: {
      es: ['No encontrar una tendencia también es un hallazgo: con 24 años de datos no se puede afirmar que la lluvia esté bajando aquí.', 'Lo que sí se ve es El Niño: los años El Niño son más secos.'],
      en: ['Not finding a trend is a finding too: 24 years of data cannot support the claim that rainfall is falling here.', 'What the record does show is El Niño: El Niño years are drier.'],
    },
  },
  {
    n: 2, cell: 'N1475W08765', ind: 'may_oct_mm', win: '2001-2010',
    title: { es: 'Centro de Honduras: según los años', en: 'Central Honduras: it depends on the years' },
    note: { es: 'Abre la ventana 2001–2010, de solo 10 años', en: 'Opens the 2001–2010 window, only 10 years' },
    story: {
      es: ['Una sola celda, tres respuestas según los años que se miren: con el periodo completo no hay evidencia; de 2008 a 2023 la lluvia parece bajar; de 2001 a 2010 parece subir.', 'El cambio no viene de la lluvia sino de los años elegidos. Pruébalo moviendo los años con el control de abajo.', 'Aviso: 2001–2010 es una ventana corta, de solo 10 años.'],
      en: ['One cell, three answers depending on the years you look at: the full period shows no evidence; from 2008 to 2023 rainfall seems to fall; from 2001 to 2010 it seems to rise.', 'The change comes from the years chosen, not from the rain. Try it by moving the years with the control below.', 'Note: 2001–2010 is a short window, only 10 years.'],
    },
  },
  {
    n: 3, cell: 'N1495W09125', ind: 'may_oct_mm', mirror: 'N1335W08715',
    title: { es: 'Altiplano de Guatemala frente a Choluteca', en: 'Guatemalan highlands vs Choluteca' },
    note: { es: 'Lluvia más baja desde alrededor de 2009. Leer la salvedad', en: 'Lower rainfall since around 2009. Read the caveat' },
    story: {
      es: ['Este es el único tipo de lugar donde el análisis dice «tendencia consistente». En Choluteca, con el mismo producto y los mismos años: sin evidencia.', 'Pero es una pregunta abierta, no un hallazgo climático: la caída se concentra alrededor de 2009 y con 24 años no se distingue un escalón de una tendencia gradual; es una zona montañosa con pocos pluviómetros para ajustar el satélite; y NASA POWER no ve ninguna caída en esta misma celda.', 'Puede ser una señal real o un artefacto del producto. Con este registro no se puede separar.'],
      en: ['This is the only kind of place where the analysis returns a “consistent trend”. In Choluteca, with the same product and the same years: no evidence.', 'But it is an open question, not a climate finding: the drop is concentrated around 2009 and 24 years cannot tell a step from a gradual trend; it is mountainous terrain with few rain gauges to adjust the satellite; and NASA POWER sees no decline at this same cell.', 'It may be a real signal or a product artefact. This record cannot separate them.'],
    },
  },
];

export function findCase(raw: string | null): CaseLink | undefined {
  return CASES.find(c => String(c.n) === raw);
}

/** Conserva idioma y capa; fija la lente de lluvia estacional para reproducir el caso. */
export function caseSearch(search: string, c: CaseLink): string {
  const q = new URLSearchParams(search);
  q.set('cell', c.cell);
  q.set('ind', c.ind);
  q.set('lens', 'agri');
  if (c.win) q.set('win', c.win); else q.delete('win');
  if (c.mirror) q.set('mirror', c.mirror); else q.delete('mirror');
  q.delete('case');
  q.delete('tour');
  return `?${q}`;
}
