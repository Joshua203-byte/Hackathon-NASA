// Host del panel con el mapa MapLibre de Rol 4 (RegionMap) y la rejilla SVG como respaldo.
import { CellMap } from './panel/components/CellMap';
import { CASES, caseSearch, findCase, type CaseLink } from './panel/cases';
import { VERDICT_UI } from './panel/verdict';
import { IND_OPTION, LENS_LABEL, regionNames } from './panel/labels';
import { selectIndicator } from './panel/lenses';
import { useEffect, useSyncExternalStore } from 'react';
import { lazy, Suspense } from 'react';
const RegionMap = lazy(() => import('./panel/components/RegionMap').then(m => ({ default: m.RegionMap })));
const CellPanel = lazy(() => import('./panel/components/CellPanel').then(m => ({ default: m.CellPanel })));
import { useBoot, useCell } from './panel/data';
import { INDICATORS } from './panel/types';
import { parseWin, patchSearch, usePanelUrl } from './panel/urlState';

const NARROW = '(max-width: 1023px)';
/** Pantalla angosta: el mapa va arriba y el panel debajo, no lado a lado. */
function useNarrow() {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(NARROW); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => window.matchMedia(NARROW).matches,
  );
}

export function Shell() {
  const narrow = useNarrow();
  const { boot, error } = useBoot();
  const [url, setUrl] = usePanelUrl();
  const { cell, status } = useCell(url.cell);
  const caseParam = new URLSearchParams(window.location.search).get('case');
  const requestedMirror = new URLSearchParams(window.location.search).get('mirror');
  const kase = findCase(caseParam);
  // ?case=3 sin ?mirror: la espejo del caso 3 si existe en estos datos; si no (ejemplos simulados), la primera otra celda.
  const caseMirror = kase?.mirror && boot?.grid.some(c => c.id === kase.mirror) ? kase.mirror : caseParam === '3' ? boot?.grid.find(c => c.id !== url.cell)?.id ?? null : null;
  const mirrorId = requestedMirror && /^[NS]\d{4}[EW]\d{5}$/.test(requestedMirror) ? requestedMirror : caseMirror;
  const mirror = useCell(mirrorId !== url.cell ? mirrorId : null);

  // Enlace corto ?case=N (formulario, video): se expande a celda, indicador, ventana y espejo.
  useEffect(() => {
    if (!boot || !kase || url.cell || !boot.grid.some(c => c.id === kase.cell)) return;
    history.replaceState(null, '', caseSearch(location.search, kase) + location.hash);
    dispatchEvent(new PopStateEvent('popstate'));
  }, [boot, kase, url.cell]);

  useEffect(() => {
    const step = url.tour > 0 ? boot?.refs.tour?.steps[url.tour - 1] : null;
    const patch = step?.set;
    if (!patch || (patch.cell && !boot?.grid.some(c => c.id === patch.cell))) return;
    const { win, ...rest } = patch;
    setUrl({ ...rest, ...('win' in patch ? { win: typeof win === 'string' ? parseWin(win) : win } : {}) });
  }, [boot, url.tour, setUrl]);

  useEffect(() => {
    if (status !== 'ready') return;
    requestAnimationFrame(() => {
      try {
        performance.measure('panel-paint', 'cell-json');
        const m = performance.getEntriesByName('panel-paint').at(-1);
        (window as unknown as { __panelPaintMs?: number }).__panelPaintMs = m?.duration;
      } catch { /* sin marca previa */ }
    });
  }, [status, url.cell, url.ind]);

  if (error) return <div role="alert" className="panel-warning">No se pudieron cargar los datos: {error}</div>;
  if (!boot) return <p>Cargando…</p>;
  const gridRow = boot.grid.find((c) => c.id === url.cell) ?? null;
  const es = url.lang === 'es';
  const selectCell = (id: string) => setUrl({ cell: id, win: null }, 'push');
  const cases = CASES.filter(c => boot.grid.some(g => g.id === c.cell));
  const openCase = (c: CaseLink) => { history.pushState(null, '', caseSearch(location.search, c) + location.hash); dispatchEvent(new PopStateEvent('popstate')); };

  const startTour = () => {
    if (!boot.refs.tour?.context) return setUrl({ tour: 1 });
    const q = new URLSearchParams(window.location.search);
    for (const key of ['dataset', 'case', 'mirror']) q.delete(key);
    window.location.assign(patchSearch(`?${q}`, { ...boot.refs.tour.context, tour: 1, lang: url.lang }));
  };

  const yearsN = boot.meta.period[1] - boot.meta.period[0] + 1;
  const closeCell = () => { const q = new URLSearchParams(location.search); for (const k of ['cell', 'win', 'mirror', 'case', 'tour']) q.delete(k); history.pushState(null, '', `?${q}` + location.hash); dispatchEvent(new PopStateEvent('popstate')); };

  return (
    <div className="shell">
      <header className="topbar no-print">
        <div className="brand">
          <strong>ALTARIS</strong>
          <span className="tagline">{es ? '¿Cuánta confianza merece una tendencia de lluvia?' : 'How much confidence does a rainfall trend deserve?'}</span>
        </div>
        <div className="topbar-actions">
          <button className="btn-primary" onClick={startTour}>{es ? 'Recorrido' : 'Tour'}</button>
          <button className="btn-ghost" aria-label={es ? 'Switch to English' : 'Cambiar a español'} onClick={() => setUrl({ lang: es ? 'en' : 'es' })}>{es ? 'EN' : 'ES'}</button>
        </div>
      </header>
      {(boot.meta.data_kind !== 'observed' || boot.meta.pipeline_commit === 'MOCK') && <p role="note" className="notice demo-notice">{es ? 'DEMOSTRACIÓN: datos simulados o sin validación de procedencia. No usar para decisiones.' : 'DEMO: simulated data or unverified provenance. Do not use for decisions.'}</p>}

      <div className={url.cell ? 'stage has-cell' : 'stage'}>
        <div className="workspace-map">
          {/* Rol 4: MapLibre; si no hay WebGL se usa la rejilla SVG sin mapa base. */}
          <Suspense fallback={<p className="region-map-loading">{es ? 'Cargando mapa…' : 'Loading map…'}</p>}>
            <RegionMap cells={boot.grid} meta={boot.meta} ind={url.ind} selected={url.cell} onSelect={selectCell} lang={url.lang}
              cases={cases.map(c => ({ n: c.n, id: c.cell }))} onCase={n => { const c = CASES.find(k => k.n === n); if (c) openCase(c); }}
              fallback={<CellMap cells={boot.grid} meta={boot.meta} ind={url.ind} selected={url.cell} onSelect={selectCell} lang={url.lang} />} />
          </Suspense>
        </div>

        <div className="overlay-left no-print">
          {!url.cell && (
            <section className="intro">
              <h1>{es ? 'Una línea que baja no siempre es una tendencia' : 'A falling line is not always a trend'}</h1>
              <p>{es
                ? `${yearsN} años de lluvia medida por satélites de la NASA en ${regionNames(boot.grid, 'es')}. Toca cualquier lugar del mapa y mira cuánta evidencia hay de que la lluvia esté cambiando.`
                : `${yearsN} years of rainfall measured by NASA satellites over ${regionNames(boot.grid, 'en')}. Tap any place on the map and see how much evidence there is that rainfall is changing.`}</p>
              <p className="intro-links"><a href="https://github.com/Joshua203-byte/Hackathon-NASA" target="_blank" rel="noreferrer">{es ? 'Código y método' : 'Code and method'}</a> · <a href="?dataset=pilot&cell=N1335W08715&ind=may_oct_mm&lang=es">Piloto real · Choluteca</a></p>
            </section>
          )}
          {cases.length > 0 && (
            <nav className="case-links" aria-label={es ? 'Casos de estudio' : 'Case studies'}>
              <strong>{es ? (url.cell ? 'Ejemplos' : 'O empieza con un ejemplo') : url.cell ? 'Examples' : 'Or start with an example'}</strong>
              {cases.map(c => {
                const v = boot.grid.find(g => g.id === c.cell)?.ind[c.ind]?.verdict;
                const current = url.cell === c.cell;
                return (
                  <a key={c.n} href={caseSearch(location.search, c)} aria-current={current ? 'true' : undefined} className={current ? 'case-link active' : 'case-link'} title={c.title[url.lang]}
                    onClick={e => { if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); openCase(c); } }}>
                    <span className="case-num" aria-hidden="true">{c.n}</span>
                    <span className="case-text"><b>{c.title[url.lang]}</b>{v && <span className="chip"><i style={{ background: `var(${VERDICT_UI[v].cssVar})` }} />{VERDICT_UI[v].label[url.lang]}</span>}</span>
                  </a>
                );
              })}
            </nav>
          )}
          {narrow && url.cell
            ? <details className="controls-fold"><summary>{es ? 'Cambiar lluvia, lugar o comparar' : 'Change rainfall, place or compare'}</summary>          <div className="controls">
            <label className="control control-cell">{es ? 'Ir a una celda por su código' : 'Go to a cell by its code'}
              <select value={url.cell ?? ''} onChange={(e) => setUrl({ cell: e.target.value || null, win: null }, 'push')}>
                <option value="">—</option>
                {boot.grid.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.country}</option>)}
              </select>
            </label>
            <label className="control control-ind">{es ? '¿Qué lluvia quieres ver?' : 'Which rainfall?'}
              <select value={url.ind} onChange={(e) => setUrl({ ind: e.target.value as typeof url.ind, win: null })}>
                {INDICATORS.map((i) => <option key={i} value={i}>{IND_OPTION[i][url.lang]}</option>)}
              </select>
              <small className="control-hint">{es ? `Se suma la lluvia de esos meses en cada año: un total por año, de ${boot.meta.period[0]} a ${boot.meta.period[1]} (${yearsN} años).` : `The rain of those months is added up in each year: one total per year, from ${boot.meta.period[0]} to ${boot.meta.period[1]} (${yearsN} years).`}</small>
            </label>
            <label className="control">{es ? '¿Para qué la necesitas?' : 'What do you need it for?'}
              <select value={url.lens} onChange={(e) => { const lens = e.target.value as typeof url.lens; setUrl({ lens, ind: cell ? selectIndicator(lens, url.ind, boot.meta, cell) : lens === "com" ? "annual_mm" : "may_oct_mm", win: null }); }}>
                {(['agri', 'com', 'ene'] as const).map(l => <option key={l} value={l}>{LENS_LABEL[l][url.lang]}</option>)}
              </select>
            </label>
            <label className="control mirror-picker">{es ? 'Comparar con otra celda' : 'Compare another cell'} <select aria-label={es ? 'Celda espejo' : 'Mirror cell'} value={mirrorId ?? ''} onChange={e => { const q = new URLSearchParams(location.search); q.delete('case'); if (e.target.value) q.set('mirror', e.target.value); else q.delete('mirror'); history.replaceState(null, '', `?${q}`); dispatchEvent(new PopStateEvent('popstate')); }}><option value="">—</option>{boot.grid.filter(c => c.id !== url.cell).map(c => <option key={c.id}>{c.id}</option>)}</select></label>
          </div></details>
            :           <div className="controls">
            <label className="control control-cell">{es ? 'Ir a una celda por su código' : 'Go to a cell by its code'}
              <select value={url.cell ?? ''} onChange={(e) => setUrl({ cell: e.target.value || null, win: null }, 'push')}>
                <option value="">—</option>
                {boot.grid.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.country}</option>)}
              </select>
            </label>
            <label className="control control-ind">{es ? '¿Qué lluvia quieres ver?' : 'Which rainfall?'}
              <select value={url.ind} onChange={(e) => setUrl({ ind: e.target.value as typeof url.ind, win: null })}>
                {INDICATORS.map((i) => <option key={i} value={i}>{IND_OPTION[i][url.lang]}</option>)}
              </select>
              <small className="control-hint">{es ? `Se suma la lluvia de esos meses en cada año: un total por año, de ${boot.meta.period[0]} a ${boot.meta.period[1]} (${yearsN} años).` : `The rain of those months is added up in each year: one total per year, from ${boot.meta.period[0]} to ${boot.meta.period[1]} (${yearsN} years).`}</small>
            </label>
            <label className="control">{es ? '¿Para qué la necesitas?' : 'What do you need it for?'}
              <select value={url.lens} onChange={(e) => { const lens = e.target.value as typeof url.lens; setUrl({ lens, ind: cell ? selectIndicator(lens, url.ind, boot.meta, cell) : lens === "com" ? "annual_mm" : "may_oct_mm", win: null }); }}>
                {(['agri', 'com', 'ene'] as const).map(l => <option key={l} value={l}>{LENS_LABEL[l][url.lang]}</option>)}
              </select>
            </label>
            <label className="control mirror-picker">{es ? 'Comparar con otra celda' : 'Compare another cell'} <select aria-label={es ? 'Celda espejo' : 'Mirror cell'} value={mirrorId ?? ''} onChange={e => { const q = new URLSearchParams(location.search); q.delete('case'); if (e.target.value) q.set('mirror', e.target.value); else q.delete('mirror'); history.replaceState(null, '', `?${q}`); dispatchEvent(new PopStateEvent('popstate')); }}><option value="">—</option>{boot.grid.filter(c => c.id !== url.cell).map(c => <option key={c.id}>{c.id}</option>)}</select></label>
          </div>}
        </div>

        <div className="workspace-panel" key={url.cell ?? 'none'}>
          {url.cell && <button className="panel-close no-print" onClick={closeCell} aria-label={es ? 'Cerrar y volver al mapa' : 'Close and return to the map'}>×</button>}
          <Suspense fallback={<p>{es ? "Cargando panel…" : "Loading panel…"}</p>}><CellPanel cell={cell} gridRow={gridRow} meta={boot.meta} status={status} refs={boot.refs} mirror={mirror.cell} /></Suspense>
          <footer className="site-footer no-print">
            <p>{es ? 'Datos' : 'Data'}: NASA GPM IMERG Final V07 (GES DISC) · NOAA CPC ONI · NASA POWER · Natural Earth. {es ? 'Describe el pasado: no es un pronóstico.' : 'It describes the past: it is not a forecast.'}</p>
            <p><a href="https://github.com/Joshua203-byte/Hackathon-NASA" target="_blank" rel="noreferrer">{es ? 'Código y método' : 'Code and method'}</a> · <a href="?dataset=pilot&cell=N1335W08715&ind=may_oct_mm&lang=es">Piloto real · Choluteca</a></p>
          </footer>
        </div>
      </div>
    </div>
  );
}
