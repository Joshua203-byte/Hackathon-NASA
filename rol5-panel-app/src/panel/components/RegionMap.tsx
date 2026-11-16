// Rol 4 · Mapa MapLibre de la región. Sin mapa base externo: fondo liso + bordes de país
// (data/rol1/borders.geojson, Natural Earth) + celdas de grid.json. El detalle de cada celda
// lo sigue cargando el panel desde cells/{id}.json al hacer clic.
import maplibregl, { type GeoJSONSource, type Map as MlMap, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ENSO_RAMP, MAP_LAYERS, NO_DATA, SLOPE_RAMP, STABILITY_RAMP, fillColor, gridToGeoJSON, hasEnso, parseLayer, slopeLimit, verdictCounts, type MapLayer } from '../mapLayers';
import { VERDICTS, type GridCell, type IndicatorKey, type Lang, type Meta, type Verdict } from '../types';
import { VERDICT_UI } from '../verdict';
import { countryName, regionNames } from '../labels';
import { SpaceSky } from '../space/SpaceSky';
import { warmEarthTiles } from '../space/warmTiles';
import { addHdLayer, addNightLayer, addViirsLayer, buildNightCanvas, buildViirsCanvas, imageryDate, introStartLon, liveAllowed } from '../space/liveEarth';
import { subsolarPoint } from '../space/sun';

const EARTH_TILES = 'earth/{z}/{x}/{y}.jpg';
/** Vista inicial de la intro: el planeta entero, visto desde el lado del Atlántico y África. */
const INTRO_START = { center: [18, 14] as [number, number], zoom: 1.5 };
/** cameraForBounds ya compensa los márgenes en el centro que devuelve: al volar hacia él, el margen del mapa vuelve a cero. */
const NO_PADDING = { top: 0, bottom: 0, left: 0, right: 0 };
/** Con el título arriba, el planeta se asienta en la parte baja del encuadre. */
const introPadding = () => ({ top: Math.round(window.innerHeight * 0.34), bottom: 0, left: 0, right: 0 });
const INTRO_HOLD_MS = 1100;
const INTRO_FLIGHT_MS = 8200;

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

/** Globo con la Tierra de la NASA (Blue Marble, teselas propias) sobre un azul de océano por si falla la carga. */
function globeStyle(): StyleSpecification {
  // La base se resuelve aparte: new URL() codificaría las llaves de {z}/{x}/{y} y MapLibre no las sustituiría.
  const tiles = [new URL(import.meta.env.BASE_URL, window.location.href).href + EARTH_TILES];
  return {
    version: 8,
    projection: { type: 'globe' },
    sky: {
      'sky-color': '#0b3a78', 'horizon-color': '#7fb4ff', 'fog-color': '#a9cfff',
      'sky-horizon-blend': 0.7, 'horizon-fog-blend': 0.6, 'fog-ground-blend': 0.2,
      'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 0.9, 8, 0],
    },
    sources: { earth: { type: 'raster', tiles, tileSize: 256, minzoom: 0, maxzoom: 4, attribution: 'NASA Blue Marble' } },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#0a2b4d' } },
      { id: 'earth', type: 'raster', source: 'earth', paint: { 'raster-fade-duration': 400, 'raster-resampling': 'linear', 'raster-saturation': 0.05, 'raster-contrast': 0.04 } },
    ],
  } as StyleSpecification;
}

/** Márgenes del encuadre final: la tarjeta de la izquierda y la leyenda de abajo no deben tapar la región. */
function finalPadding() {
  const wide = window.innerWidth >= 980;
  return { top: 16, bottom: wide ? 86 : 72, left: wide ? 436 : 16, right: 16 };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function readLayer() { return parseLayer(new URLSearchParams(window.location.search).get('layer')); }

function writeLayer(layer: MapLayer) {
  const q = new URLSearchParams(window.location.search);
  if (layer === 'verdict') q.delete('layer'); else q.set('layer', layer);
  const s = q.toString();
  window.history.replaceState(null, '', window.location.pathname + (s ? `?${s}` : '') + window.location.hash);
}

const fmt = (v: number | null | undefined, digits = 1) => (typeof v === 'number' ? v.toFixed(digits) : '—');

export function RegionMap({ cells, meta, ind, selected, onSelect, lang, fallback, cases = [], onCase, intro, onIntroEnd }: {
  cells: GridCell[]; meta: Meta; ind: IndicatorKey; selected: string | null; onSelect: (id: string) => void; lang: Lang;
  /** Casos de estudio: se marcan con su número sobre la celda. */
  cases?: { n: number; id: string }[]; onCase?: (n: number) => void;
  /** Se muestra si el navegador no puede crear el contexto WebGL. */
  fallback: ReactNode;
  /** Reproduce la entrada espacial (planeta, estrellas, vuelo a la región) al cargar. */
  intro?: boolean; onIntroEnd?: () => void;
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
  const [mapObj, setMapObj] = useState<MlMap | null>(null);
  const [phase, setPhase] = useState<'idle' | 'hold' | 'flight'>(intro ? 'hold' : 'idle');
  const introRef = useRef(!!intro);
  const onIntroEndRef = useRef(onIntroEnd);
  onIntroEndRef.current = onIntroEnd;
  const runRef = useRef(0);
  const startRef = useRef(INTRO_START);
  /** Fecha de la imagen de GIBS si respondió; null = solo el Blue Marble propio. */
  const [liveDate, setLiveDate] = useState<string | null>(null);
  const flightRef = useRef<{ timers: number[] } | null>(null);
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
    const now = new Date(); const sun = subsolarPoint(now);
    startRef.current = { center: [introStartLon(sun, (west + east) / 2), 12], zoom: INTRO_START.zoom };
    let map: MlMap;
    try {
      map = new maplibregl.Map({
        container: box.current,
        style: globeStyle(),
        ...(introRef.current ? startRef.current : { bounds: [[west, south], [east, north]] as [[number, number], [number, number]], fitBoundsOptions: { padding: finalPadding() } }),
        minZoom: 0.4,
        maxZoom: 11,
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
      const lit = introRef.current ? 0 : 1; // en la intro las celdas se encienden al llegar
      map.addLayer({ id: 'cells-fill', type: 'fill', source: 'cells', paint: { 'fill-color': NO_DATA, 'fill-opacity': 0.86 * lit, 'fill-opacity-transition': { duration: 1400, delay: 0 }, 'fill-outline-color': 'rgba(255,255,255,0.3)' } });
      map.addLayer({ id: 'borders-line', type: 'line', source: 'borders', paint: { 'line-color': 'rgba(255,255,255,0.92)', 'line-opacity': lit, 'line-opacity-transition': { duration: 1400, delay: 0 }, 'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.6, 5, 1, 9, 2.2] } });
      map.addLayer({ id: 'cell-selected', type: 'line', source: 'cells', filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#fff', 'line-width': 3 } });
      // Día y noche reales (local, sin red) y, si GIBS responde, la Tierra del último día completo con sus nubes.
      const date = imageryDate(now);
      const alive = () => mapRef.current === map;
      const night = buildNightCanvas(new URL(import.meta.env.BASE_URL, window.location.href).href + 'earth-night/{z}/{x}/{y}.jpg', sun)
        .then(c => { if (c && alive()) addNightLayer(map, c, 'cells-fill'); }).catch(() => { /* sin noche: queda el planeta iluminado */ });
      let clouds: Promise<void> = Promise.resolve();
      if (liveAllowed()) {
        addHdLayer(map, 'cells-fill');
        clouds = buildViirsCanvas(date).then(async c => { await night; if (c && alive()) { addViirsLayer(map, c, map.getLayer('noche') ? 'noche' : 'cells-fill', date); setLiveDate(date); } }).catch(() => { /* sin nubes: Blue Marble */ });
      }
      // La intro espera a la noche (local y rápida) y, un momento, a las nubes: así no cambian a mitad del vuelo. Con plazo:
      // si la red va lenta se arranca igual y las nubes entran con un fundido cuando lleguen.
      void Promise.race([Promise.all([night, clouds]), new Promise(r => window.setTimeout(r, introRef.current ? 2500 : 0))]).then(() => { if (alive()) setReady(true); });
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
    if (introRef.current) map.jumpTo({ padding: introPadding() });
    setMapObj(map);
    return () => { flightRef.current?.timers.forEach(window.clearTimeout); map.remove(); mapRef.current = null; setMapObj(null); setReady(false); };
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


  // Entrada espacial: el planeta entero con su cielo, una pausa, y el vuelo hasta la región. runRef invalida vuelos anteriores.
  const regionCamera = useCallback((map: MlMap) => {
    const [south, north] = meta.bbox.lat; const [west, east] = meta.bbox.lon;
    // cameraForBounds también descuenta el margen que el mapa tenga puesto (el de la intro): se calcula con margen cero
    // y se restituye en el mismo instante, sin que llegue a dibujarse un cuadro intermedio.
    const keep = map.getPadding();
    map.setPadding(NO_PADDING);
    try { return map.cameraForBounds([[west, south], [east, north]], { padding: finalPadding() }); } finally { map.setPadding(keep); }
  }, [meta]);

  const finishIntro = useCallback((map: MlMap) => {
    introRef.current = false;
    setPhase('idle');
    if (map.getLayer('cells-fill')) {
      map.setPaintProperty('cells-fill', 'fill-opacity', 0.86);
      map.setPaintProperty('borders-line', 'line-opacity', 1);
    }
    onIntroEndRef.current?.();
  }, []);

  const playIntro = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const run = ++runRef.current;
    flightRef.current?.timers.forEach(window.clearTimeout);
    const timers: number[] = []; flightRef.current = { timers };
    introRef.current = true; setPhase('hold');
    warmEarthTiles(new URL(import.meta.env.BASE_URL, window.location.href).href + EARTH_TILES, meta.bbox);
    if (map.getLayer('cells-fill')) { map.setPaintProperty('cells-fill', 'fill-opacity', 0); map.setPaintProperty('borders-line', 'line-opacity', 0); }
    const fly = () => {
      if (run !== runRef.current) return;
      setPhase('flight');
      const cam = regionCamera(map);
      if (!cam) return finishIntro(map);
      map.flyTo({ center: cam.center, zoom: cam.zoom, padding: NO_PADDING, bearing: 0, pitch: 0, duration: INTRO_FLIGHT_MS, curve: 1.3, easing: easeInOut, essential: true });
      map.once('moveend', () => { if (run === runRef.current) finishIntro(map); });
    };
    let begun = false; // `idle` y el plazo de seguridad pueden llegar los dos: el vuelo empieza una sola vez
    const begin = () => { if (begun || run !== runRef.current) return; begun = true; timers.push(window.setTimeout(fly, INTRO_HOLD_MS)); };
    if (map.loaded()) begin();
    else { map.once('idle', begin); timers.push(window.setTimeout(begin, 3500)); }
  }, [regionCamera, finishIntro, meta]);

  const skipIntro = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    runRef.current++;
    flightRef.current?.timers.forEach(window.clearTimeout);
    map.stop();
    const cam = regionCamera(map);
    if (cam) map.jumpTo({ center: cam.center, zoom: cam.zoom, padding: NO_PADDING, bearing: 0, pitch: 0 });
    finishIntro(map);
  }, [regionCamera, finishIntro]);

  useEffect(() => { if (ready && introRef.current && runRef.current === 0) playIntro(); }, [ready, playIntro]);

  // Nombres de país como marcadores HTML (no hay servidor de fuentes para etiquetas de MapLibre). Solo se ven con la región a la vista.
  const labelKey = useMemo(() => [...new Set(cells.map(c => c.country))].sort().join(','), [cells]);
  useEffect(() => {
    const map = mapObj;
    if (!ready || !map) return;
    const groups = new Map<string, GridCell[]>();
    for (const c of cells) groups.set(c.country, [...(groups.get(c.country) ?? []), c]);
    const med = (v: number[]) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)];
    const items = [...groups].map(([code, cs]) => {
      const el = document.createElement('div');
      el.className = 'country-label';
      el.textContent = countryName(code, lang);
      return { el, marker: new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([med(cs.map(c => c.lon)), med(cs.map(c => c.lat))]).addTo(map) };
    });
    const fade = () => { const z = map.getZoom(); const o = Math.max(0, Math.min(1, (z - 3.6) / 0.9, (8.6 - z) / 0.9)); for (const i of items) i.el.style.opacity = String(o); };
    fade(); map.on('zoom', fade);
    return () => { map.off('zoom', fade); items.forEach(i => i.marker.remove()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- labelKey resume `cells`
  }, [ready, mapObj, labelKey, lang]);

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
    if (introRef.current) return; // la intro ya lleva la cámara a la región
    const c = selected ? byId.get(selected) : null;
    // El panel tapa parte del mapa en pantallas anchas: el margen deja la celda en la zona visible.
    const wide = window.innerWidth >= 980;
    const padding = { top: 0, bottom: wide ? 70 : 56, left: wide ? (c ? 262 : 420) : 0, right: wide && c ? Math.min(640, window.innerWidth * 0.46) : 0 };
    if (c) map.flyTo({ center: [c.lon, c.lat], zoom: Math.max(map.getZoom(), wide ? 6.9 : 6.4), padding, duration: 1400 });
    else { const [s, n] = meta.bbox.lat; const [w, e] = meta.bbox.lon; map.fitBounds([[w, s], [e, n]], { padding: { top: 16, bottom: padding.bottom + 16, left: padding.left + 16, right: 16 }, duration: 900 }); }
  }, [ready, selected, byId]);

  if (failed) return <>{fallback}</>;

  const nCountries = new Set(cells.map(c => c.country)).size;
  const arrival = `${nCountries >= 7 ? (es ? 'Centroamérica' : 'Central America') : regionNames(cells, lang)} · ${nCountries} ${es ? 'países' : 'countries'} · ${cells.length.toLocaleString(es ? 'es' : 'en')} ${es ? 'celdas de lluvia' : 'rainfall cells'}`;
  const liveDay = liveDate ? new Date(`${liveDate}T12:00:00Z`).toLocaleDateString(es ? 'es' : 'en', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : null;
  const liveNote = liveDay
    ? (es ? `La Tierra el ${liveDay}, con sus nubes (NASA VIIRS) · día y noche de este momento` : `Earth on ${liveDay}, with its clouds (NASA VIIRS) · day and night as of now`)
    : (es ? 'Día y noche de este momento · cielo real' : 'Day and night as of now · real sky');
  const recenter = () => { const map = mapRef.current; const cam = map && regionCamera(map); if (map && cam) map.flyTo({ center: cam.center, zoom: cam.zoom, padding: NO_PADDING, bearing: 0, pitch: 0, duration: 1600, easing: easeInOut }); };

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
      <div className={`region-map-frame${phase !== 'idle' ? ' intro-on' : ''}`}>
        <SpaceSky map={mapObj} es={es} detail={phase === 'idle' ? 0 : phase === 'hold' ? 1 : 0.55} />
        <div ref={box} className="region-map-canvas" role="region" aria-label={es ? 'Mapa interactivo de celdas' : 'Interactive cell map'} />
        {phase !== 'idle' && (
          <div className={`intro-stage ${phase}`} onClick={skipIntro}>
            <div className="intro-title">
              <p className="intro-kicker">NASA GPM IMERG · {meta.period[0]}–{meta.period[1]}</p>
              <p className="intro-word" aria-hidden="true">ALTARIS</p>
              <p className="intro-sub">{es ? '¿Cuánta confianza merece una tendencia de lluvia?' : 'How much confidence does a rainfall trend deserve?'}</p>
            </div>
            <p className="intro-arrive" aria-live="polite">{arrival}</p>
            <p className="intro-live">{liveNote}</p>
            <button type="button" className="intro-skip" onClick={e => { e.stopPropagation(); skipIntro(); }}>{es ? 'Saltar' : 'Skip'}</button>
          </div>
        )}
        {phase === 'idle' && ready && (
          <div className="space-tools">
            <button type="button" onClick={recenter} title={es ? 'Volver a encuadrar la región' : 'Frame the region again'}>{es ? 'Centrar región' : 'Frame region'}</button>
          </div>
        )}
        {!ready && <p className="region-map-loading">{es ? 'Cargando mapa…' : 'Loading map…'}</p>}
        {hover && h && (
          <div className="region-map-tip" style={{ left: hover.x + 12, top: hover.y + 12 }} role="tooltip">
            <strong>{h.id}</strong> · {countryName(h.country, lang)}<br />
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
