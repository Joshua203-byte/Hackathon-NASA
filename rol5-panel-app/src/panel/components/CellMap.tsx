import type { GridCell, IndicatorKey, Lang, Meta } from '../types';
import { VERDICT_UI } from '../verdict';

/** Geographic grid: no external basemap or live service required. */
export function CellMap({ cells, meta, ind, selected, onSelect, lang }: { cells: GridCell[]; meta: Meta; ind: IndicatorKey; selected: string | null; onSelect: (id: string) => void; lang: Lang }) {
  const [west, east] = meta.bbox.lon; const [south, north] = meta.bbox.lat;
  if (east <= west || north <= south) return null;
  return <section className="cell-map no-print"><h2>{lang === 'es' ? 'Mapa de evidencia por celda' : 'Evidence grid map'}</h2>
    <p>{lang === 'es' ? 'Selecciona una celda para ver su evidencia. Posiciones en longitud y latitud; sin mapa base.' : 'Select a cell to inspect its evidence. Longitude and latitude positions; no basemap.'}</p>
    <svg viewBox="0 0 700 420" role="group" aria-label={lang === 'es' ? 'Celdas geográficas' : 'Geographic cells'} style={{ width: '100%', background: '#eef5f8' }}>
      <text x="5" y="15">{north}°N</text><text x="5" y="410">{south}°N · {west}°</text><text x="625" y="410">{east}°</text>
      {cells.map(c => { const verdict = c.ind[ind]?.verdict; return <g key={c.id} role="button" tabIndex={0} aria-label={`${c.id}: ${verdict ? VERDICT_UI[verdict].label[lang] : '—'}`} onClick={() => onSelect(c.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c.id); } }} style={{ cursor: 'pointer' }}><title>{c.id} · {c.country} · {c.lat}, {c.lon}</title><rect x={35 + (c.lon - west) / (east - west) * 630 - 5} y={25 + (north - c.lat) / (north - south) * 350 - 5} width="10" height="10" fill={verdict ? `var(${VERDICT_UI[verdict].cssVar})` : '#aaa'} stroke={selected === c.id ? '#000' : '#fff'} strokeWidth={selected === c.id ? 3 : 1} /></g>; })}
    </svg><p>{Object.values(VERDICT_UI).map(v => <span key={v.icon} style={{ marginRight: 12 }}>{v.icon} {v.label[lang]}</span>)}</p>
  </section>;
}
