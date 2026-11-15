// Contenedor mínimo para desarrollar el panel (Rol 5).
// Rol 4 reemplaza la lista de la izquierda por el mapa de celdas (MapLibre) y la barra superior completa.
import { useDecisionRules, useGlossary, useGrid, useMeta, useTour } from './data';
import { t, VERDICT_TEXT } from './i18n';
import { CellPanel } from './panel/CellPanel';
import { GlossaryContext } from './panel/GlossaryTip';
import type { IndicatorKey, Lens } from './types';
import { useUrlState } from './urlState';

export default function App() {
  const [state, update] = useUrlState();
  const meta = useMeta();
  const grid = useGrid();
  const glossary = useGlossary();
  const rules = useDecisionRules();
  const tour = useTour();
  const { lang } = state;

  if (!meta || meta.status === 'loading') return <p className="panel-empty">{t('loading', lang)}</p>;
  if (meta.status === 'error') return <p className="panel-empty error-note">meta.json: {meta.error}</p>;
  const m = meta.data;
  const g = grid?.status === 'ok' ? grid.data : null;

  return (
    <GlossaryContext.Provider value={glossary?.status === 'ok' ? glossary.data : null}>
      {m.synthetic && <div className="synthetic-banner" role="alert">⚠ {t('synthetic', lang)}</div>}
      <header className="topbar no-print">
        <strong className="brand">ALTARIS</strong>
        <label className="field">
          {lang === 'es' ? 'Indicador' : 'Indicator'}{' '}
          <select value={state.ind} onChange={(e) => update({ ind: e.target.value as IndicatorKey, win: null })}>
            {m.indicators.map((k) => (
              <option key={k} value={k}>
                {m.indicator_info ? (lang === 'es' ? m.indicator_info[k].label_es : m.indicator_info[k].label_en) : k}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          {lang === 'es' ? 'Lente' : 'Lens'}{' '}
          <select value={state.lens} onChange={(e) => update({ lens: e.target.value as Lens })}>
            <option value="agri">{lang === 'es' ? 'Agricultura' : 'Agriculture'}</option>
            <option value="com">{lang === 'es' ? 'Comunidades' : 'Communities'}</option>
            <option value="ene">{lang === 'es' ? 'Energía' : 'Energy'}</option>
          </select>
        </label>
        <button type="button" onClick={() => update({ tour: '1' })} disabled={!state.cell || tour?.status !== 'ok'}>
          {t('tour_start', lang)}
        </button>
        <span className="spacer" />
        <button type="button" className="link-btn" onClick={() => update({ lang: lang === 'es' ? 'en' : 'es' })} aria-label="Language">
          {lang === 'es' ? 'EN' : 'ES'}
        </button>
      </header>
      <main className="layout">
        <nav className="cell-list no-print" aria-label={lang === 'es' ? 'Celdas' : 'Cells'}>
          <p className="muted small">{lang === 'es' ? 'Lista provisional (el mapa es de Rol 4)' : 'Temporary list (the map belongs to Rol 4)'}</p>
          {g?.cells.map((c) => {
            const v = c.ind[state.ind]?.verdict;
            return (
              <button
                key={c.id}
                type="button"
                className={`cell-item ${state.cell === c.id ? 'active' : ''}`}
                onClick={() => update({ cell: c.id, win: null })}
                aria-current={state.cell === c.id}
              >
                <span>{c.id}</span>
                <span className="muted small">{c.country}</span>
                {v && <span className={`chip verdict-${v}`}>{VERDICT_TEXT[v].icon} {VERDICT_TEXT[v][lang]}</span>}
              </button>
            );
          })}
        </nav>
        <CellPanel
          meta={m}
          grid={g}
          rules={rules?.status === 'ok' ? rules.data : null}
          tour={tour?.status === 'ok' ? tour.data : null}
          state={state}
          update={update}
        />
      </main>
    </GlossaryContext.Provider>
  );
}
