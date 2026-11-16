import { useEffect, useRef, useState } from 'react';
import { IND_OPTION, countryName } from '../labels';
import { INDICATORS, type IndicatorKey, type L10n, type Lang } from '../types';

/** Pasos cortos de la guía. BORRADOR: textos pendientes de aprobación de Camila (docs/12, T3.4). */
export const WELCOME_STEPS: { anchor: string; body: L10n }[] = [
  {
    anchor: '.map-legend',
    body: {
      es: 'Cada cuadro del mapa es un lugar de unos 11 × 11 km. El color dice cuánta confianza merece su tendencia de lluvia, no cuánto llueve.',
      en: 'Each square on the map is a place of about 11 × 11 km. Its colour tells how much confidence the rainfall trend deserves, not how much rain falls.',
    },
  },
  {
    anchor: '.region-map',
    body: {
      es: 'Toca un lugar del mapa para abrir su gráfica año por año y su veredicto.',
      en: 'Tap a place on the map to open its year-by-year chart and its verdict.',
    },
  },
  {
    anchor: '.case-links',
    body: {
      es: 'Estos tres ejemplos muestran casos distintos: uno sin evidencia, uno que depende de los años elegidos y uno que pasa las pruebas pero deja una pregunta abierta.',
      en: 'These three examples show different cases: one with no evidence, one that depends on the years chosen and one that passes the tests but leaves an open question.',
    },
  },
];

const Q1: L10n = { es: '¿Qué parte del año quieres investigar?', en: 'Which part of the year do you want to investigate?' };
const Q2: L10n = { es: '¿Dónde?', en: 'Where?' };

interface Props {
  lang: Lang;
  /** Códigos ISO3 de los países de los datos cargados. */
  countries: string[];
  hasExample: boolean;
  onPickInd: (ind: IndicatorKey) => void;
  onPickCountry: (code: string) => void;
  onExample: () => void;
  onTour: () => void;
  onClose: () => void;
}

/** Guía de primera visita: dos preguntas (variable y lugar), tres pasos cortos y la invitación al recorrido que ya existe. */
export function Welcome({ lang, countries, hasExample, onPickInd, onPickCountry, onExample, onTour, onClose }: Props) {
  const es = lang === 'es';
  // 0 = pregunta 1, 1 = pregunta 2, 2..4 = pasos 1/4..3/4, 5 = cierre 4/4
  const [step, setStep] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(typeof document !== 'undefined' ? document.activeElement : null);

  useEffect(() => { box.current?.focus(); }, [step]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  useEffect(() => () => { (opener.current as HTMLElement | null)?.focus?.(); }, []);

  const short = step >= 2 && step <= 4 ? WELCOME_STEPS[step - 2] : null;
  useEffect(() => {
    if (!short) return;
    const el = document.querySelector<HTMLElement>(short.anchor);
    el?.classList.add('tour-focus');
    return () => el?.classList.remove('tour-focus');
  }, [short]);

  const next = () => setStep(s => s + 1);
  const title = step === 0 ? Q1[lang] : step === 1 ? Q2[lang] : step === 5 ? (es ? '¿Vemos un ejemplo guiado?' : 'Shall we try a guided example?') : `${step - 1}/4`;

  return (
    <div role="dialog" aria-label={es ? 'Guía de primera visita' : 'First-visit guide'} className="welcome no-print">
      <div className="welcome-box" ref={box} tabIndex={-1}>
        <div className="welcome-head">
          <strong>{step <= 1 ? `${step + 1}/2 · ${title}` : step === 5 ? `4/4 · ${title}` : title}</strong>
          <button type="button" className="welcome-skip" onClick={onClose}>{es ? 'Omitir' : 'Skip'}</button>
        </div>

        {step === 0 && (
          <div className="welcome-options">
            {INDICATORS.map(i => <button key={i} type="button" onClick={() => { onPickInd(i); next(); }}>{IND_OPTION[i][lang]}</button>)}
          </div>
        )}
        {step === 1 && (
          <div className="welcome-options">
            {countries.map(c => <button key={c} type="button" onClick={() => { onPickCountry(c); next(); }}>{countryName(c, lang)}</button>)}
            {hasExample && <button type="button" className="welcome-example" onClick={onExample}>{es ? 'Muéstrame un ejemplo' : 'Show me an example'}</button>}
          </div>
        )}
        {short && (
          <>
            <p>{short.body[lang]}</p>
            <div className="welcome-nav"><button type="button" onClick={() => setStep(s => s - 1)}>{es ? 'Atrás' : 'Back'}</button><button type="button" className="welcome-primary" onClick={next}>{es ? 'Siguiente' : 'Next'}</button></div>
          </>
        )}
        {step === 5 && (
          <div className="welcome-nav">
            <button type="button" onClick={onClose}>{es ? 'No, explorar por mi cuenta' : 'No, explore on my own'}</button>
            <button type="button" className="welcome-primary" onClick={onTour}>{es ? 'Sí, empezar el recorrido' : 'Yes, start the tour'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
