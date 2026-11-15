import type { CellDetail, IndicatorKey, Lang, Period } from '../types';
import { SeriesChart } from './SeriesChart';
import { VERDICT_UI } from '../verdict';

const domain = (cells: CellDetail[], ind: IndicatorKey): [number, number] | undefined => {
  const v = cells.flatMap((c) => c.indicators[ind]?.series ?? []).map((p) => p.value).filter((x): x is number => typeof x === 'number');
  return v.length ? [Math.floor(Math.min(...v) / 10) * 10, Math.ceil(Math.max(...v) / 10) * 10] : undefined;
};

/** Dos celdas con la misma escala en Y: la comparación visual es honesta. Si no hay espejo, sirve como "dos sitios, dos veredictos". */
export function MirrorView({ a, b, ind, period, lang }: { a: CellDetail; b: CellDetail; ind: IndicatorKey; period: Period; lang: Lang }) {
  const es = lang === 'es';
  const yDomain = domain([a, b], ind);
  return (
    <section data-tour="mirror">
      <h3>{es ? 'Dos lugares, lado a lado' : 'Two places, side by side'}</h3>
      <div className="mirror">
        {[a, b].map((c) => {
          const d = c.indicators[ind];
          return (
            <div key={c.id}>
              <h4>{c.id}{d ? ` · ${VERDICT_UI[d.verdict]?.label[lang] ?? d.verdict}` : ''}</h4>
              {d ? <SeriesChart data={d} period={period} selected={null} lang={lang} yDomain={yDomain} /> : <p className="notice">{es ? 'Sin este indicador.' : 'No such indicator.'}</p>}
            </div>
          );
        })}
      </div>
      <p className="notice">{es ? 'Misma escala vertical en ambos paneles. Asociación, no causa.' : 'Same vertical scale in both panels. Association, not cause.'}</p>
    </section>
  );
}
