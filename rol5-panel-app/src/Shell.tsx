// CARCASA TEMPORAL: hace el papel del mapa y de la barra superior de Rol 4. Se descarta al integrar.
import { useEffect } from 'react';
import { CellPanel } from './panel/components/CellPanel';
import { useBoot, useCell } from './panel/data';
import { INDICATORS } from './panel/types';
import { usePanelUrl } from './panel/urlState';

export function Shell() {
  const { boot, error } = useBoot();
  const [url, setUrl] = usePanelUrl();
  const { cell, status } = useCell(url.cell);
  const caseParam = new URLSearchParams(window.location.search).get('case');
  const mirrorId = caseParam === '3' ? 'N1335W08725' : null;
  const mirror = useCell(mirrorId !== url.cell ? mirrorId : null);

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

  return (
    <div className="shell">
      <header className="topbar no-print">
        <strong>ALTARIS</strong>
        <label>{es ? 'Celda' : 'Cell'}{' '}
          <select value={url.cell ?? ''} onChange={(e) => setUrl({ cell: e.target.value || null, win: null }, 'push')}>
            <option value="">—</option>
            {boot.grid.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.country}</option>)}
            <option value="N0000W00000">N0000W00000 (JSON roto)</option>
            <option value="N9999W09999">N9999W09999 (no existe)</option>
          </select>
        </label>
        <label>{es ? 'Indicador' : 'Indicator'}{' '}
          <select value={url.ind} onChange={(e) => setUrl({ ind: e.target.value as typeof url.ind, win: null })}>
            {INDICATORS.map((i) => <option key={i}>{i}</option>)}
          </select>
        </label>
        <label>{es ? 'Lente' : 'Lens'}{' '}
          <select value={url.lens} onChange={(e) => setUrl({ lens: e.target.value as typeof url.lens })}>
            <option value="agri">agri</option><option value="com">com</option><option value="ene">ene</option>
          </select>
        </label>
        <button onClick={() => setUrl({ lang: es ? 'en' : 'es' })}>{es ? 'EN' : 'ES'}</button>
        <button onClick={() => setUrl({ tour: 1 })}>{es ? 'Recorrido' : 'Tour'}</button>
      </header>
      <CellPanel cell={cell} gridRow={gridRow} meta={boot.meta} status={status} refs={boot.refs} mirror={mirror.cell} />
    </div>
  );
}
