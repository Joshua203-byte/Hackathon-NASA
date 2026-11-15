// Host del panel con el mapa MapLibre de Rol 4 (RegionMap) y la rejilla SVG como respaldo.
import { CellMap } from './panel/components/CellMap';
import { CASES, caseSearch, findCase, type CaseLink } from './panel/cases';
import { VERDICT_UI } from './panel/verdict';
import { IND_LABEL, LENS_LABEL } from './panel/labels';
import { selectIndicator } from './panel/lenses';
import { useEffect } from 'react';
import { lazy, Suspense } from 'react';
const RegionMap = lazy(() => import('./panel/components/RegionMap').then(m => ({ default: m.RegionMap })));
const CellPanel = lazy(() => import('./panel/components/CellPanel').then(m => ({ default: m.CellPanel })));
import { useBoot, useCell } from './panel/data';
import { INDICATORS } from './panel/types';
import { parseWin, patchSearch, usePanelUrl } from './panel/urlState';

export function Shell() {
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
      {(boot.meta.data_kind !== 'observed' || boot.meta.pipeline_commit === 'MOCK') && <p role="note" className="notice">{es ? 'DEMOSTRACIÓN: datos simulados o sin validación de procedencia. No usar para decisiones.' : 'DEMO: simulated data or unverified provenance. Do not use for decisions.'}</p>}

      {!url.cell && (
        <section className="intro no-print">
          <h1>{es ? 'Una línea que baja no siempre es una tendencia' : 'A falling line is not always a trend'}</h1>
          <p>{es
            ? `ALTARIS revisa ${boot.meta.period[1] - boot.meta.period[0] + 1} años de lluvia medida por satélites de la NASA en Honduras, Guatemala y El Salvador, y te dice cuánta evidencia hay de que la lluvia esté cambiando en cada lugar.`
            : `ALTARIS reviews ${boot.meta.period[1] - boot.meta.period[0] + 1} years of rainfall measured by NASA satellites over Honduras, Guatemala and El Salvador, and tells you how much evidence there is that rainfall is changing at each place.`}</p>
          <ol className="steps">
            <li><b>{es ? 'Elige un lugar' : 'Pick a place'}</b>{es ? 'Toca el mapa o abre un ejemplo.' : 'Tap the map or open an example.'}</li>
            <li><b>{es ? 'Lee el veredicto' : 'Read the verdict'}</b>{es ? 'Consistente, limitada o sin evidencia.' : 'Consistent, limited or no evidence.'}</li>
            <li><b>{es ? 'Cambia los años' : 'Change the years'}</b>{es ? 'Mira si la historia se sostiene.' : 'See whether the story holds.'}</li>
          </ol>
        </section>
      )}

      {cases.length > 0 && (
        <nav className="case-links no-print" aria-label={es ? 'Casos de estudio' : 'Case studies'}>
          <strong>{es ? 'Tres ejemplos para empezar' : 'Three examples to start with'}</strong>
          {cases.map(c => {
            const v = boot.grid.find(g => g.id === c.cell)?.ind[c.ind]?.verdict;
            const current = url.cell === c.cell;
            return (
              <a key={c.n} href={caseSearch(location.search, c)} aria-current={current ? 'true' : undefined} className={current ? 'case-link active' : 'case-link'}
                onClick={e => { if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); openCase(c); } }}>
                <span className="case-num" aria-hidden="true">{c.n}</span>
                <span><b>{c.title[url.lang]}</b><br />{v && <span className="chip" style={{ borderColor: `var(${VERDICT_UI[v].cssVar})` }}>{VERDICT_UI[v].icon} {VERDICT_UI[v].label[url.lang]}</span>}{c.note ? <small> {c.note[url.lang]}</small> : null}</span>
              </a>
            );
          })}
        </nav>
      )}

      <div className="controls no-print">
        <label className="control control-cell">{es ? 'Ir a una celda por su código' : 'Go to a cell by its code'}
          <select value={url.cell ?? ''} onChange={(e) => setUrl({ cell: e.target.value || null, win: null }, 'push')}>
            <option value="">—</option>
            {boot.grid.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.country}</option>)}
          </select>
        </label>
        <label className="control">{es ? '¿Qué lluvia quieres ver?' : 'Which rainfall?'}
          <select value={url.ind} onChange={(e) => setUrl({ ind: e.target.value as typeof url.ind, win: null })}>
            {INDICATORS.map((i) => <option key={i} value={i}>{IND_LABEL[i][url.lang]}</option>)}
          </select>
        </label>
        <label className="control">{es ? '¿Para qué la necesitas?' : 'What do you need it for?'}
          <select value={url.lens} onChange={(e) => { const lens = e.target.value as typeof url.lens; setUrl({ lens, ind: cell ? selectIndicator(lens, url.ind, boot.meta, cell) : lens === "com" ? "annual_mm" : "may_oct_mm", win: null }); }}>
            {(['agri', 'com', 'ene'] as const).map(l => <option key={l} value={l}>{LENS_LABEL[l][url.lang]}</option>)}
          </select>
        </label>
      </div>

      <div className={url.cell ? 'workspace has-cell' : 'workspace'}>
        <div className="workspace-map">
          {/* Rol 4: MapLibre; si no hay WebGL se usa la rejilla SVG sin mapa base. */}
          <Suspense fallback={<p className="region-map-loading">{es ? 'Cargando mapa…' : 'Loading map…'}</p>}>
            <RegionMap cells={boot.grid} meta={boot.meta} ind={url.ind} selected={url.cell} onSelect={selectCell} lang={url.lang}
              cases={cases.map(c => ({ n: c.n, id: c.cell }))} onCase={n => { const c = CASES.find(k => k.n === n); if (c) openCase(c); }}
              fallback={<CellMap cells={boot.grid} meta={boot.meta} ind={url.ind} selected={url.cell} onSelect={selectCell} lang={url.lang} />} />
          </Suspense>
          <label className="mirror-picker no-print">{es ? 'Comparar con otra celda' : 'Compare another cell'} <select aria-label={es ? 'Celda espejo' : 'Mirror cell'} value={mirrorId ?? ''} onChange={e => { const q = new URLSearchParams(location.search); q.delete('case'); if (e.target.value) q.set('mirror', e.target.value); else q.delete('mirror'); history.replaceState(null, '', `?${q}`); dispatchEvent(new PopStateEvent('popstate')); }}><option value="">—</option>{boot.grid.filter(c => c.id !== url.cell).map(c => <option key={c.id}>{c.id}</option>)}</select></label>
        </div>
        <div className="workspace-panel">
          <Suspense fallback={<p>{es ? "Cargando panel…" : "Loading panel…"}</p>}><CellPanel cell={cell} gridRow={gridRow} meta={boot.meta} status={status} refs={boot.refs} mirror={mirror.cell} /></Suspense>
        </div>
      </div>

      <footer className="site-footer no-print">
        <p>{es ? 'Datos' : 'Data'}: NASA GPM IMERG Final V07 (GES DISC) · NOAA CPC ONI · NASA POWER · Natural Earth. {es ? 'Describe el pasado: no es un pronóstico.' : 'It describes the past: it is not a forecast.'}</p>
        <p><a href="https://github.com/Joshua203-byte/Hackathon-NASA" target="_blank" rel="noreferrer">{es ? 'Código y método' : 'Code and method'}</a> · <a href="?dataset=pilot&cell=N1335W08715&ind=may_oct_mm&lang=es">Piloto real · Choluteca</a></p>
      </footer>
    </div>
  );
}
