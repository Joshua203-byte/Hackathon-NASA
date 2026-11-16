import { useEffect } from 'react';
import type { RefData } from '../refs';
import type { Lang } from '../types';

interface Props {
  step: number; // 1..4
  tour: RefData['tour'];
  glossary: RefData['glossary'];
  lang: Lang;
  /** 0 cierra. Cualquier otro valor va al paso indicado. */
  onStep: (n: number) => void;
  onSetWin: (win: string) => void;
}

/** Tarjeta fija al pie, no modal: el usuario puede seguir tocando la gráfica y la huella mientras lee. */
export function TourOverlay({ step, tour, glossary, lang, onStep, onSetWin }: Props) {
  const s = tour?.steps?.[step - 1];
  const total = tour?.steps?.length ?? 0;
  const es = lang === 'es';

  useEffect(() => {
    if (!s) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${s.anchor}"]`);
    el?.classList.add('tour-focus');
    // El primer paso siempre empieza arriba del todo, sin importar dónde estaba el panel o la página.
    if (step === 1) { window.scrollTo?.(0, 0); document.querySelectorAll<HTMLElement>('.workspace-panel, .overlay-left').forEach(c => c.scrollTo?.({ top: 0 })); }
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    if (typeof s.set?.win === 'string') onSetWin(s.set.win);
    return () => el?.classList.remove('tour-focus');
    // onSetWin es estable (setUrl); el efecto depende solo del paso
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, s?.anchor]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onStep(0);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onStep]);

  if (!tour) return <div role="dialog" className="tour no-print"><p>{es ? 'Recorrido no disponible.' : 'Tour not available.'}</p><button onClick={() => onStep(0)}>×</button></div>;
  if (!s) return null;
  const g = s.glossary ? glossary?.[s.glossary] : undefined;
  return (
    <div role="dialog" aria-label={es ? 'Recorrido guiado' : 'Guided tour'} className="tour no-print">
      <div className="tour-head"><strong>{step}/{total} · {s.title[lang]}</strong><button aria-label={es ? 'Cerrar recorrido' : 'Close tour'} onClick={() => onStep(0)}>×</button></div>
      <p>{s.body[lang]}</p>
      {g && <p className="gloss"><abbr title={g.definition[lang]}>{g.term[lang]}</abbr>: {g.definition[lang]}</p>}
      <div className="tour-nav">
        <button onClick={() => onStep(0)}>{es ? 'Saltar' : 'Skip'}</button>
        <button disabled={step <= 1} onClick={() => onStep(step - 1)}>{es ? 'Atrás' : 'Back'}</button>
        <button onClick={() => onStep(step >= total ? 0 : step + 1)}>{step >= total ? (es ? 'Terminar' : 'Done') : es ? 'Siguiente' : 'Next'}</button>
      </div>
    </div>
  );
}
