// Host del panel con el mapa MapLibre de Rol 4 (RegionMap) y la rejilla SVG como respaldo.
import { CellMap } from './panel/components/CellMap';
import { CASES, caseSearch, findCase, type CaseLink } from './panel/cases';
import { VERDICT_UI } from './panel/verdict';
import { selectIndicator } from './panel/lenses';
import { useEffect } from 'react';
import { lazy, Suspense } from 'react';
const RegionMap = lazy(() => import('./panel/components/RegionMap').then(m => ({ default: m.RegionMap })));
const CellPanel = lazy(() => import('./panel/components/CellPanel').then(m => ({ default: m.CellPanel })));
import { useBoot, useCell } from './panel/data';
import { INDICATORS } from './panel/types';
import { usePanelUrl } from './panel/urlState';

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

  return (
    <div className="shell">
      <header className="topbar no-print">
        <strong>ALTARIS</strong>
        <a style={{ color: 'white' }} href="?dataset=pilot&cell=N1335W08715&ind=may_oct_mm&lang=es">Piloto real · Choluteca</a>
        <label>{es ? 'Celda' : 'Cell'}{' '}
          <select value={url.cell ?? ''} onChange={(e) => setUrl({ cell: e.target.value || null, win: null }, 'push')}>
            <option value="">—</option>
            {boot.grid.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.country}</option>)}
          </select>
        </label>
        <label>{es ? 'Indicador' : 'Indicator'}{' '}
          <select value={url.ind} onChange={(e) => setUrl({ ind: e.target.value as typeof url.ind, win: null })}>
            {INDICATORS.map((i) => <option key={i}>{i}</option>)}
          </select>
        </label>
        <label>{es ? 'Lente' : 'Lens'}{' '}
          <select value={url.lens} onChange={(e) => { const lens = e.target.value as typeof url.lens; setUrl({ lens, ind: cell ? selectIndicator(lens, url.ind, boot.meta, cell) : lens === "com" ? "annual_mm" : "may_oct_mm", win: null }); }}>
            <option value="agri">agri</option><option value="com">com</option><option value="ene">ene</option>
          </select>
        </label>
        <button onClick={() => setUrl({ lang: es ? 'en' : 'es' })}>{es ? 'EN' : 'ES'}</button>
        <button onClick={() => setUrl({ tour: 1 })}>{es ? 'Recorrido' : 'Tour'}</button>
      </header>
      {(boot.meta.data_kind !== 'observed' || boot.meta.pipeline_commit === 'MOCK') && <p role="note" className="notice">{es ? 'DEMOSTRACIÓN: datos simulados o sin validación de procedencia. No usar para decisiones.' : 'DEMO: simulated data or unverified provenance. Do not use for decisions.'}</p>}
      {/* Rol 4: MapLibre; si no hay WebGL se usa la rejilla SVG sin mapa base. */}
      {cases.length > 0 && (
        <nav className="case-links no-print" aria-label={es ? 'Casos de estudio' : 'Case studies'}>
          <strong>{es ? 'Casos' : 'Cases'}</strong>
          {cases.map(c => {
            const v = boot.grid.find(g => g.id === c.cell)?.ind[c.ind]?.verdict;
            const current = url.cell === c.cell;
            return (
              <a key={c.n} href={caseSearch(location.search, c)} aria-current={current ? 'true' : undefined} className={current ? 'case-link active' : 'case-link'}
                onClick={e => { if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); openCase(c); } }}>
                <span className="case-num" aria-hidden="true">{c.n}</span>
                <span><b>{c.title[url.lang]}</b><br /><small>{c.cell}{v ? ` · ${VERDICT_UI[v].icon} ${VERDICT_UI[v].label[url.lang]}` : ''}{c.note ? ` · ${c.note[url.lang]}` : ''}</small></span>
              </a>
            );
          })}
        </nav>
      )}
      <Suspense fallback={<p className="region-map-loading">{es ? 'Cargando mapa…' : 'Loading map…'}</p>}>
        <RegionMap cells={boot.grid} meta={boot.meta} ind={url.ind} selected={url.cell} onSelect={selectCell} lang={url.lang}
          cases={cases.map(c => ({ n: c.n, id: c.cell }))} onCase={n => { const c = CASES.find(k => k.n === n); if (c) openCase(c); }}
          fallback={<CellMap cells={boot.grid} meta={boot.meta} ind={url.ind} selected={url.cell} onSelect={selectCell} lang={url.lang} />} />
      </Suspense>
      <label className="mirror-picker no-print">{es ? 'Comparar con otra celda' : 'Compare another cell'} <select aria-label={es ? 'Celda espejo' : 'Mirror cell'} value={mirrorId ?? ''} onChange={e => { const q = new URLSearchParams(location.search); q.delete('case'); if (e.target.value) q.set('mirror', e.target.value); else q.delete('mirror'); history.replaceState(null, '', `?${q}`); dispatchEvent(new PopStateEvent('popstate')); }}><option value="">—</option>{boot.grid.filter(c => c.id !== url.cell).map(c => <option key={c.id}>{c.id}</option>)}</select></label>
      <Suspense fallback={<p>{es ? "Cargando panel…" : "Loading panel…"}</p>}><CellPanel cell={cell} gridRow={gridRow} meta={boot.meta} status={status} refs={boot.refs} mirror={mirror.cell} /></Suspense>
    </div>
  );
}
