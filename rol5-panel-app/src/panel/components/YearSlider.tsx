// Control de años: mueve inicio y fin del periodo y muestra, en vivo, el resultado que el motor ya calculó
// para esa ventana (footprint + window_results). No calcula nada: solo elige qué ventana mostrar.
import { useEffect, useRef, useState } from 'react';
import { fmtP, fmtSlope } from '../format';
import { MIN_LEN_DRAW, winKey, type FpWindow } from '../footprint';
import type { Lang, Period, Win } from '../types';
import { VERDICT_UI } from '../verdict';

interface Props {
  period: Period;
  /** Ventana elegida; null = periodo completo. */
  value: Win | null;
  index: Map<string, FpWindow>;
  onChange: (win: Win | null) => void;
  lang: Lang;
}

const PLAY_LEN = 15; // ventana que recorre "Reproducir": la mínima que cuenta para el veredicto
const PLAY_MS = 850;

export function YearSlider({ period, value, index, onChange, lang }: Props) {
  const es = lang === 'es';
  const [a, b] = value ?? period;
  const full = a === period[0] && b === period[1];
  const w = index.get(winKey(a, b));
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const set = (s: number, e: number) => onChange(s === period[0] && e === period[1] ? null : [s, e]);
  const stop = () => { if (timer.current !== null) window.clearInterval(timer.current); timer.current = null; setPlaying(false); };
  useEffect(() => stop, []);

  const play = () => {
    if (playing) return stop();
    let s = period[0];
    const last = period[1] - PLAY_LEN + 1;
    setPlaying(true);
    onChange([s, s + PLAY_LEN - 1]);
    timer.current = window.setInterval(() => {
      s += 1;
      if (s > last) return stop();
      onChange([s, s + PLAY_LEN - 1]);
    }, PLAY_MS);
  };

  if (index.size === 0) return null;
  const span = period[1] - period[0];
  const pct = (y: number) => ((y - period[0]) / span) * 100;
  const v = w?.result?.verdict;

  return (
    <div className="year-slider no-print" data-tour="years">
      <div className="ys-head">
        <span className="ys-label">{es ? 'Elige los años' : 'Choose the years'}</span>
        <span className="ys-range"><b>{a}–{b}</b> · {b - a + 1} {es ? 'años' : 'years'}{full ? (es ? ' (completo)' : ' (full)') : ''}</span>
      </div>
      <div className="ys-track">
        <div className="ys-fill" style={{ left: `${pct(a)}%`, right: `${100 - pct(b)}%` }} />
        <input type="range" aria-label={es ? 'Año de inicio' : 'Start year'} min={period[0]} max={period[1]} step={1} value={a}
          onChange={(e) => { stop(); const s = Math.min(Number(e.target.value), b - MIN_LEN_DRAW + 1); set(s, b); }} />
        <input type="range" aria-label={es ? 'Año de fin' : 'End year'} min={period[0]} max={period[1]} step={1} value={b}
          onChange={(e) => { stop(); const en = Math.max(Number(e.target.value), a + MIN_LEN_DRAW - 1); set(a, en); }} />
      </div>
      <div className="ys-ticks" aria-hidden="true"><span>{period[0]}</span><span>{Math.round((period[0] + period[1]) / 2)}</span><span>{period[1]}</span></div>
      <div className="ys-actions">
        <button type="button" className="ys-play" onClick={play} aria-pressed={playing}>{playing ? (es ? '❚❚ Pausar' : '❚❚ Pause') : es ? '▶ Recorrer los años' : '▶ Step through the years'}</button>
        <button type="button" className="ys-reset" onClick={() => { stop(); onChange(null); }} disabled={full}>{es ? 'Periodo completo' : 'Full period'}</button>
      </div>
      <p className="ys-note">{es ? 'Cada periodo se compara consigo mismo, no con una norma climática.' : 'Each period is compared with itself, not with a climate norm.'}</p>
      <p className="ys-result" role="status" aria-live="polite">
        {w ? (
          <>
            <span className="ys-result-label">{es ? `Con ${a}–${b}` : `With ${a}–${b}`}</span>
            <b className={w.sign === null || w.sign === 0 ? '' : w.sign < 0 ? 'neg' : 'pos'}>{fmtSlope(w.slope, lang)}</b>
            {v && <span className="chip"><i style={{ background: `var(${VERDICT_UI[v].cssVar})` }} />{VERDICT_UI[v].label[lang]}</span>}
            <small>p {fmtP(w.p)}{full ? '' : es ? ' (sin corregir)' : ' (uncorrected)'}</small>
          </>
        ) : (es ? 'Este periodo no tiene resultado calculado.' : 'This period has no calculated result.')}
      </p>
      {!full && b - a + 1 < 15 && <p className="ys-note">{es ? 'Menos de 15 años: un periodo tan corto no cuenta para el veredicto.' : 'Under 15 years: a period this short does not count towards the verdict.'}</p>}
    </div>
  );
}
