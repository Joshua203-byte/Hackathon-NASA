import { createContext, useContext, useId, useState } from 'react';
import type { Glossary, Lang } from '../types';

export const GlossaryContext = createContext<Glossary | null>(null);

/** Botón "?" con la definición "en 20 segundos" de glossary.json (Rol 6). */
export function GlossaryTip({ k, lang }: { k: string; lang: Lang }) {
  const glossary = useContext(GlossaryContext);
  const [open, setOpen] = useState(false);
  const id = useId();
  const entry = glossary?.[k];
  if (!entry) return null;
  return (
    <span className="gloss" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="gloss-btn"
        aria-label={`${entry.term[lang]}: ${lang === 'es' ? 'qué es' : 'what is it'}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open && (
        <span role="tooltip" id={id} className="gloss-pop">
          <strong>{entry.term[lang]}</strong> {entry.short[lang]}
        </span>
      )}
    </span>
  );
}
