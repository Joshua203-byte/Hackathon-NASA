import type { RefData } from '../refs';
import type { Lang } from '../types';

export function Glossary({ glossary, lang }: { glossary: RefData['glossary']; lang: Lang }) {
  if (!glossary) return null;
  return <details data-glossary><summary>{lang === 'es' ? 'Glosario' : 'Glossary'}</summary><dl>
    {Object.entries(glossary).map(([key, g]) => <div key={key}><dt><abbr title={g.definition[lang]}>{g.term[lang]}</abbr></dt><dd>{g.definition[lang]}</dd></div>)}
  </dl></details>;
}
