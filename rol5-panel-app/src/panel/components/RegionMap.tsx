// Rol 4 · Mapa MapLibre de la región. Sin mapa base externo: fondo liso + bordes de país
// (data/rol1/borders.geojson, Natural Earth) + celdas de grid.json. El detalle de cada celda
// lo sigue cargando el panel desde cells/{id}.json al hacer clic.
import maplibregl, { type GeoJSONSource, type Map as MlMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ENSO_RAMP, MAP_LAYERS, NO_DATA, SLOPE_RAMP, STABILITY_RAMP, fillColor, gridToGeoJSON, hasEnso, parseLayer, slopeLimit, verdictCounts, type MapLayer } from '../mapLayers';
import { VERDICTS, type GridCell, type IndicatorKey, type Lang, type Meta, type Verdict } from '../types';
import { VERDICT_UI } from '../verdict';
import { regionNames } from '../labels';

const FALLBACK_COLORS: Record<Verdict, string> = { consistente: '#1b7837', limitada: '#e08214', sin_evidencia: '#7f7f7f', incompleta: '#b2182b' };

/** La paleta vive en styles.css (:root); MapLibre necesita el valor, no la variable. */
function verdictColors(): Record<Verdict, string> {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(VERDICTS.map(v => [v, css.getPropertyValue(VERDICT_UI[v].cssVar).trim() || FALLBACK_COLORS[v]])) as Record<Verdict, string>;
}

const LAYER_LABEL: Record<MapLayer, Record<Lang, string>> = {
  verdict: { es: 'Veredicto', en: 'Verdict' },
  slope: { es: 'Pendiente (mm/década)', en: 'Slope (mm/decade)' },
  stability: { es: 'Estabilidad del signo', en: 'Sign stability' },
  enso: { es: 'Relación con ENSO (r)', en: 'ENSO relation (r)' },
};

function readLayer() { return parseLayer(new URLSearchParams(window.location.search).get('layer')); }

function writeLayer(layer: MapLayer) {
  const q = new URLSearchParams(window.location.search);
  if (layer === 'verdict') q.delete('layer'); else q.set('layer', layer);
  const s = q.toString();
  window.history.replaceState(null, '', window.location.pathname + (s ? `?${s}` : '') + window.location.hash);
}

const fmt = (v: number | null | undefined, digits = 1) => (typeof v === 'number' ? v.toFixed(digits) : '—');

export function RegionMap({ cells, meta, ind, selected, onSelect, lang, fallback, cases = [], onCase }: {
  cells: GridCell[]; meta: Meta; ind: IndicatorKey; selected: string | null; onSelect: (id: string) => void; lang: Lang;
  /** Casos de estudio: se marcan con su número sobre la celda. */
  cases?: { n: number; id: string }[]; onCase?: (n: number) => void;
  /** Se muestra si el navegador no puede crear el contexto WebGL. */
  fallback: ReactNode;
}) {
  const es = lang === 'es';
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onCaseRef = useRef(onCase);
  onCaseRef.current = onCase;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [layer, setLayer] = useState<MapLayer>(readLayer);
  const [hover, setHover] = useState<{ x: number; y: number; id: string } | null>(null);

  const data = useMemo(() => gridToGeoJSON(cells), [cells]);
  const byId = useMemo(() => new Map(cells.map(c => [c.id, c])), [cells]);
  const limit = useMemo(() => slopeLimit(cells, ind), [cells, ind]);
  const ensoOk = useMemo(() => hasEnso(cells, ind), [cells, ind]);
  const counts = useMemo(() => verdictCounts(cells, ind), [cells, ind]);
  const colors = useMemo(verdictColors, []);
  const active: MapLayer = layer === 'enso' && !ensoOk ? 'verdict' : layer;

  useEffect(() => {
    const onPop = () => setLayer(readLayer());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Se crea una sola vez; los cambios de indicador, capa o selección se aplican sobre el mismo mapa.
  useEffect(() => {
    if (!box.current) return;
    const [south, north] = meta.bbox.lat; const [west, east] = meta.bbox.lon;
    let map: MlMap;
    try {
      map = new maplibregl.Map({
        container: box.current,
        style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#dce8ef' } }] },
        bounds: [[west, south], [east, north]],
        fitBoundsOptions: { padding: 16 },
        maxBounds: [[west - 6, south - 4], [east + 6, north + 4]],
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
    } catch {
      setFailed(true);
      return;
    }
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Natural Earth · NASA GPM IMERG V07' }));
    map.on('load', () => {
      const bordersUrl = new URL(`${import.meta.env.BASE_URL}geo/borders.geojson`, window.location.href).href;
      map.addSource('borders', { type: 'geojson', data: bordersUrl });
      map.addSource('cells', { type: 'geojson', data: data as never });
      map.addLayer({ id: 'land', type: 'fill', source: 'borders', paint: { 'fill-color': '#f3f0e8' } });
      map.addLayer({ id: 'cells-fill', type: 'fill', source: 'cells', paint: { 'fill-color': NO_DATA, 'fill-opacity': 0.9, 'fill-outline-color': 'rgba(255,255,255,0.35)' } });
      map.addLayer({ id: 'borders-line', type: 'line', source: 'borders', paint: { 'line-color': '#2b2b2b', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 9, 2] } });
      map.addLayer({ id: 'cell-selected', type: 'line', source: 'cells', filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#000', 'line-width': 3 } });
      setReady(true);
    });
    map.on('click', 'cells-fill', e => {
      const id = e.features?.[0]?.properties?.id;
      if (typeof id === 'string') onSelectRef.current(id);
    });
    map.on('mousemove', 'cells-fill', e => {
      const id = e.features?.[0]?.properties?.id;
      map.getCanvas().style.cursor = 'pointer';
      if (typeof id === 'string') setHover({ x: e.point.x, y: e.point.y, id });
    });
    map.on('mouseleave', 'cells-fill', () => { map.getCanvas().style.cursor = ''; setHover(null); });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; setReady(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bbox y datos iniciales; los cambios van por los efectos de abajo
  }, []);

  // Marcadores HTML (no hay servidor de fuentes para etiquetas de MapLibre). Son botones: se alcanzan con teclado.
  const caseKey = cases.map(c => `${c.n}:${c.id}`).join(',');
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const markers = cases.flatMap(({ n, id }) => {
      const c = byId.get(id);
      if (!c) return [];
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'case-marker';
      el.textContent = String(n);
      el.setAttribute('aria-label', `${es ? 'Caso' : 'Case'} ${n} · ${id}`);
      el.addEventListener('click', ev => { ev.stopPropagation(); onCaseRef.current?.(n); });
      return [new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -4] }).setLngLat([c.lon, c.lat]).addTo(map)];
    });
    return () => markers.forEach(m => m.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseKey resume `cases`
  }, [ready, caseKey, byId, es]);

  useEffect(() => {
    if (ready) (mapRef.current?.getSource('cells') as GeoJSONSource | undefined)?.setData(data as never);
  }, [ready, data]);

  useEffect(() => {
    if (ready) mapRef.current?.setPaintProperty('cells-fill', 'fill-color', fillColor(active, ind, { verdictColors: colors, slopeLimit: limit }) as never);
  }, [ready, active, ind, limit, colors]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setFilter('cell-selected', ['==', ['get', 'id'], selected ?? '']);
    const c = selected ? byId.get(selected) : null;
    // El panel tapa parte del mapa en pantallas anchas: el margen deja la celda en la zona visible.
    const wide = window.innerWidth >= 980;
    const padding = { top: 0, bottom: wide ? 70 : 56, left: wide ? (c ? 262 : 420) : 0, right: wide && c ? Math.min(640, window.innerWidth * 0.46) : 0 };
    if (c) map.flyTo({ center: [c.lon, c.lat], zoom: Math.max(map.getZoom(), wide ? 6.9 : 6.4), padding, duration: 1400 });
    else { const [s, n] = meta.bbox.lat; const [w, e] = meta.bbox.lon; map.fitBounds([[w, s], [e, n]], { padding: { top: 16, bottom: padding.bottom + 16, left: padding.left + 16, right: 16 }, duration: 900 }); }
  }, [ready, selected, byId]);

  if (failed) return <>{fallback}</>;

  const pick = (l: MapLayer) => { writeLayer(l); setLayer(l); };
  const h = hover ? byId.get(hover.id) : null;
  const g = h?.ind[ind];

  return (
    <section className="region-map no-print" aria-labelledby="region-map-title">
      <h2 id="region-map-title">{es ? 'Mapa de evidencia por celda' : 'Evidence map by cell'}</h2>
      <p className="region-map-help">
        {es ? `${cells.length} celdas de 0,1° en ${regionNames(cells, 'es')}. Haz clic en una celda para ver su evidencia. También puedes ir a una celda por su código.`
          : `${cells.length} cells of 0.1° across ${regionNames(cells, 'en')}. Click a cell to inspect its evidence. You can also go to a cell by its code.`}
      </p>
      <fieldset className="region-map-layers">
        <legend>{es ? 'Capa' : 'Layer'}</legend>
        {MAP_LAYERS.map(l => (
          <label key={l} title={l === 'enso' && !ensoOk ? (es ? 'Sin resultados ENSO en estos datos' : 'No ENSO results in this data') : undefined}>
            <input type="radio" name="map-layer" value={l} checked={active === l} disabled={l === 'enso' && !ensoOk} onChange={() => pick(l)} /> {LAYER_LABEL[l][lang]}
          </label>
        ))}
      </fieldset>
      <div className="region-map-frame">
        <div ref={box} className="region-map-canvas" role="region" aria-label={es ? 'Mapa interactivo de celdas' : 'Interactive cell map'} />
        {!ready && <p className="region-map-loading">{es ? 'Cargando mapa…' : 'Loading map…'}</p>}
        {hover && h && (
          <div className="region-map-tip" style={{ left: hover.x + 12, top: hover.y + 12 }} role="tooltip">
            <strong>{h.id}</strong> · {h.country}<br />
            {g?.verdict ? `${VERDICT_UI[g.verdict].icon} ${VERDICT_UI[g.verdict].label[lang]}` : '—'}<br />
            {es ? 'Pendiente' : 'Slope'}: {fmt(g?.slope_dec)} mm/{es ? 'década' : 'decade'} · {es ? 'Signo estable' : 'Sign stable'}: {typeof g?.sign_agreement === 'number' ? `${Math.round(g.sign_agreement * 100)} %` : '—'}
          </div>
        )}
      </div>
      <MapLegend layer={active} lang={lang} counts={counts} colors={colors} limit={limit} />
    </section>
  );
}

function Ramp({ stops, labels, caption }: { stops: readonly string[]; labels: string[]; caption: string }) {
  return (
    <div className="ramp">
      <div className="ramp-bar" style={{ background: `linear-gradient(to right, ${stops.join(', ')})` }} />
      <div className="ramp-labels">{labels.map(l => <span key={l}>{l}</span>)}</div>
      <p className="legend">{caption}</p>
    </div>
  );
}

function MapLegend({ layer, lang, counts, colors, limit }: { layer: MapLayer; lang: Lang; counts: Record<Verdict | 'none', number>; colors: Record<Verdict, string>; limit: number }) {
  const es = lang === 'es';
  const noData = <span className="legend-item"><i style={{ background: NO_DATA }} /> {es ? 'Sin dato' : 'No data'}</span>;
  if (layer === 'verdict') {
    return (
      <p className="map-legend" aria-label={es ? 'Leyenda' : 'Legend'}>
        {VERDICTS.map(v => <span key={v} className="legend-item"><i style={{ background: colors[v] }} /> {VERDICT_UI[v].icon} {VERDICT_UI[v].label[lang]} ({counts[v]})</span>)}
        {counts.none > 0 && <span className="legend-item"><i style={{ background: NO_DATA }} /> {es ? 'Sin dato' : 'No data'} ({counts.none})</span>}
      </p>
    );
  }
  if (layer === 'slope') {
    return <div className="map-legend"><Ramp stops={SLOPE_RAMP} labels={[`−${limit}`, '0', `+${limit}`]} caption={es ? `mm por década (Theil-Sen). Marrón = menos lluvia, verde azulado = más. Escala saturada en ±${limit}. La pendiente sola no es evidencia: ver veredicto.` : `mm per decade (Theil-Sen). Brown = less rain, teal = more. Scale saturates at ±${limit}. Slope alone is not evidence: see verdict.`} />{noData}</div>;
  }
  if (layer === 'stability') {
    return <div className="map-legend"><Ramp stops={STABILITY_RAMP} labels={['0 %', '50 %', '100 %']} caption={es ? 'Fracción de ventanas de ≥15 años con el mismo signo que el periodo completo.' : 'Share of ≥15-year windows with the same sign as the full period.'} />{noData}</div>;
  }
  return <div className="map-legend"><Ramp stops={ENSO_RAMP} labels={['−1', '0', '+1']} caption={es ? 'Correlación de Spearman entre la lluvia del indicador y el ONI (NOAA CPC). Asociación, no causa.' : 'Spearman correlation between indicator rainfall and ONI (NOAA CPC). Association, not cause.'} />{noData}</div>;
}
