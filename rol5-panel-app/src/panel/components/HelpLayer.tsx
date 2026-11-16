import { useEffect, useRef, useState } from 'react';
import { HELP_ZONES } from '../help';
import type { Lang } from '../types';

interface Pos { key: string; x: number; y: number }

/** Parte visible de un elemento: la recorta cada ancestro con scroll, para que el «?» no flote fuera del panel. */
function visibleRect(el: HTMLElement): DOMRect | null {
  const r = el.getBoundingClientRect();
  let top = Math.max(r.top, 0), bottom = Math.min(r.bottom, window.innerHeight), left = Math.max(r.left, 0), right = Math.min(r.right, window.innerWidth);
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if (o === 'auto' || o === 'scroll' || o === 'hidden') {
      const pr = p.getBoundingClientRect();
      top = Math.max(top, pr.top); bottom = Math.min(bottom, pr.bottom); left = Math.max(left, pr.left); right = Math.min(right, pr.right);
    }
  }
  return bottom - top < 24 || right - left < 24 ? null : new DOMRect(left, top, right - left, bottom - top);
}

interface Props { lang: Lang; onClose: () => void }

/** Un «?» en la esquina de cada zona visible; al tocarlo, una explicación corta. Una sola abierta a la vez. */
export function HelpLayer({ lang, onClose }: Props) {
  const es = lang === 'es';
  const [pos, setPos] = useState<Pos[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const openRef = useRef<string | null>(null);
  openRef.current = open;

  useEffect(() => {
    let raf = 0, last = '';
    const tick = () => {
      const next: Pos[] = [];
      for (const z of HELP_ZONES) {
        // Un selector con coma ofrece alternativas (p. ej. la leyenda no existe en pantallas angostas): vale la primera visible.
        let r: DOMRect | null = null;
        for (const el of document.querySelectorAll<HTMLElement>(z.selector)) {
          const vr = visibleRect(el);
          // Si otra cosa tapa la zona (el panel sobre el mapa en celular), no se ofrece ayuda sobre algo que no se ve.
          const top = vr && document.elementFromPoint(vr.left + vr.width / 2, vr.top + vr.height / 2);
          if (vr && top && el.contains(top)) { r = vr; break; }
        }
        if (r) next.push({ key: z.key, x: Math.round(r.right - 34), y: Math.round(r.top + 6) });
      }
      const sig = JSON.stringify(next);
      if (sig !== last) { last = sig; setPos(next); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (openRef.current) setOpen(null); else onClose();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const toGlossary = () => {
    const g = document.querySelector<HTMLDetailsElement>('[data-glossary]');
    if (!g) return;
    g.open = true;
    g.scrollIntoView?.({ block: 'center', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setOpen(null);
  };
  const hasGlossary = typeof document !== 'undefined' && !!document.querySelector('[data-glossary]');

  return (
    <div className="help-layer no-print">
      {pos.map(p => {
        const z = HELP_ZONES.find(h => h.key === p.key)!;
        const isOpen = open === p.key;
        const flip = p.x > window.innerWidth - 300;
        const up = p.y > window.innerHeight - 260;
        return (
          <div key={p.key} className="help-spot" style={{ left: p.x, top: p.y }}>
            <button type="button" className="help-q" aria-expanded={isOpen} aria-label={z.question[lang]} onClick={() => setOpen(isOpen ? null : p.key)}>?</button>
            {isOpen && (
              <div className={`help-pop${flip ? ' flip' : ''}${up ? ' up' : ''}`} role="region" aria-label={z.question[lang]}>
                <strong>{z.question[lang]}</strong>
                <p>{z.body[lang]}</p>
                {hasGlossary && <button type="button" className="help-gloss" onClick={toGlossary}>{es ? 'Más en el glosario' : 'More in the glossary'}</button>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
