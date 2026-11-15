import { useState } from 'react';
import { downloadText } from '../passport';
import { saveValidation, validationResult } from '../validation';
import type { Lang } from '../types';

export function MicroValidation({ cell, ind, lang }: { cell: string; ind: string; lang: Lang }) {
  const es = lang === 'es';
  const [answers, setAnswers] = useState(['', '']);
  const [result, setResult] = useState<ReturnType<typeof validationResult> | null>(null);
  const [saved, setSaved] = useState(false);
  const questions = es ? ['¿Qué significa evidencia limitada?', '¿Para qué sirve cambiar la ventana?'] : ['What does limited evidence mean?', 'Why change the year window?'];
  const choices = es ? [['uncertain', 'Señal débil, no confirmada', 'confirmed', 'Cambio confirmado'], ['sensitivity', 'Explorar la sensibilidad a los años elegidos', 'forecast', 'Predecir la lluvia futura']] : [['uncertain', 'Weak, unconfirmed signal', 'confirmed', 'Confirmed change'], ['sensitivity', 'Explore sensitivity to the chosen years', 'forecast', 'Predict future rainfall']];
  return <form className="micro-validation no-print" onSubmit={e => {
    e.preventDefault(); const r = validationResult(cell, ind, answers); setResult(r);
    try { saveValidation(localStorage, r); setSaved(true); } catch { setSaved(false); }
  }}>
    <h3>{es ? 'Comprueba tu comprensión' : 'Check your understanding'}</h3>
    <p>{es ? 'Respuestas anónimas guardadas solo en este navegador. Descárgalas para compartirlas con el equipo.' : 'Anonymous answers stored only in this browser. Download them to share with the team.'}</p>
    {questions.map((q, i) => <fieldset key={q}><legend>{q}</legend>{[0, 2].map(j => <label key={j} style={{ display: 'block' }}><input required type="radio" name={`q${i}`} value={choices[i][j]} checked={answers[i] === choices[i][j]} onChange={e => { setResult(null); setAnswers(a => a.map((v, k) => k === i ? e.target.value : v)); }} />{choices[i][j + 1]}</label>)}</fieldset>)}
    <button disabled={answers.some(a => !a) || result !== null}>{es ? 'Comprobar' : 'Check'}</button>
    {result && <div role="status"><p>{result.score}/2 · {saved ? (es ? 'Guardado localmente.' : 'Saved locally.') : (es ? 'No se pudo guardar; descarga el resultado.' : 'Storage unavailable; download the result.')}</p><button type="button" onClick={() => downloadText('altaris-comprehension.json', JSON.stringify(result, null, 2), 'application/json')}>{es ? 'Descargar respuestas' : 'Download answers'}</button></div>}
  </form>;
}
