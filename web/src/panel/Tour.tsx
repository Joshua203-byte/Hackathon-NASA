import { useEffect, useState } from 'react';
import type { CellIndicator, Lang, Tour as TourData } from '../types';
import { fmt, fmtP, t, VERDICT_TEXT } from '../i18n';
import { GlossaryTip } from './GlossaryTip';

interface Props {
  tour: TourData;
  ind: CellIndicator;
  period: [number, number];
  lang: Lang;
  onClose: () => void;
}

/** Sustituye {slope}, {ci_lo}, {ci_hi}, {p}, {verdict}, {units}, {period} con cifras de la celda: el texto no inventa números. */
function fill(text: string, ind: CellIndicator, period: [number, number], lang: Lang) {
  const s = ind.statistics;
  const map: Record<string, string> = {
    slope: fmt(s.slope_per_decade, 1, true),
    ci_lo: fmt(s.ci_95[0]),
    ci_hi: fmt(s.ci_95[1]),
    p: fmtP(s.p_value),
    verdict: VERDICT_TEXT[ind.verdict][lang],
    units: ind.units,
    period: `${period[0]}–${period[1]}`,
  };
  return text.replace(/\{(\w+)\}/g, (m, k) => map[k] ?? m);
}

/** Recorrido guiado de 4 pasos (sección 4.13): resalta la sección `data-tour=target` del panel. */
export function Tour({ tour, ind, period, lang, onClose }: Props) {
  const [i, setI] = useState(0);
  const step = tour.steps[i];

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${step?.target}"]`);
    el?.classList.add('tour-focus');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return () => el?.classList.remove('tour-focus');
  }, [step?.target]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!step) return null;
  const last = i === tour.steps.length - 1;
  return (
    <div className="tour-card no-print" role="dialog" aria-modal="false" aria-labelledby="tour-title">
      <p className="eyebrow">
        {t('tour_start', lang)} · {i + 1}/{tour.steps.length}
      </p>
      <h4 id="tour-title">
        {step.title[lang]} {step.glossary && <GlossaryTip k={step.glossary} lang={lang} />}
      </h4>
      <p>{fill(step.body[lang], ind, period, lang)}</p>
      <div className="btn-row">
        <button type="button" className="link-btn" onClick={onClose}>{t('tour_skip', lang)}</button>
        <span className="spacer" />
        {i > 0 && <button type="button" onClick={() => setI(i - 1)}>{t('tour_prev', lang)}</button>}
        <button type="button" className="primary" onClick={() => (last ? onClose() : setI(i + 1))}>
          {last ? t('tour_done', lang) : t('tour_next', lang)}
        </button>
      </div>
    </div>
  );
}
