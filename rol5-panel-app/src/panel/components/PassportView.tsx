import { useState } from 'react';
import { buildPassport, copyLink, downloadText, passportToMarkdown, type PassportInput } from '../passport';

/** Todo local, sin red: funciona en incógnito. */
export function PassportView(props: Omit<PassportInput, 'deepLink' | 'now'>) {
  const [fallback, setFallback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const es = props.lang === 'es';
  const link = () => window.location.href;
  const make = () => buildPassport({ ...props, deepLink: link() });
  const base = `altaris_${props.cell.id}_${props.ind}`;

  return (
    <section data-tour="passport" className="passport no-print">
      <h3>{es ? 'Pasaporte de evidencia' : 'Evidence Passport'}</h3>
      <div className="buttons">
        <button onClick={() => { const p = make(); if (p) downloadText(`${base}.json`, JSON.stringify(p, null, 2), 'application/json'); }}>{es ? 'Descargar JSON' : 'Download JSON'}</button>
        <button onClick={() => { const p = make(); if (p) downloadText(`${base}.md`, passportToMarkdown(p, props.lang), 'text/markdown'); }}>{es ? 'Descargar Markdown' : 'Download Markdown'}</button>
        <button onClick={() => window.print()}>{es ? 'Imprimir' : 'Print'}</button>
        <button onClick={async () => { const ok = await copyLink(link()); setCopied(ok); setFallback(ok ? null : link()); }}>{copied ? (es ? 'Enlace copiado' : 'Link copied') : es ? 'Copiar enlace' : 'Copy link'}</button>
      </div>
      {fallback && <input readOnly value={fallback} onFocus={(e) => e.currentTarget.select()} aria-label="link" style={{ width: '100%' }} />}
    </section>
  );
}
