import { useState } from 'react';
import type { CellDetail, CellIndicator, IndicatorKey, Lang, Meta } from '../types';
import { fmt, fmtP, limitationText, reasonText, t, VERDICT_TEXT } from '../i18n';
import { findWindow } from './chartUtils';

interface Props {
  meta: Meta;
  cell: CellDetail;
  indKey: IndicatorKey;
  ind: CellIndicator;
  win: [number, number] | null;
  url: string;
  lang: Lang;
  indicatorLabel: string;
}

function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function passportJson(p: Props) {
  const { meta, cell, indKey, ind, win, url } = p;
  return {
    altaris_evidence_passport: '1.0',
    url,
    generated_from: { generated_at: meta.generated_at, pipeline_commit: meta.pipeline_commit, synthetic: !!meta.synthetic },
    dataset: { name: meta.dataset, doi: meta.dataset_doi, period: meta.period, aux_data: meta.aux_data },
    location: { id: cell.id, name: cell.name, lat: cell.lat, lon: cell.lon, country: cell.country },
    indicator: { key: indKey, units: ind.units },
    completeness: `${ind.valid_years ?? '?'}/${ind.n_years ?? ind.series.length}`,
    statistics: ind.statistics,
    verdict: ind.verdict,
    verdict_reasons: ind.verdict_reasons,
    tags: ind.tags ?? [],
    window_evaluated: win ? { window: win, footprint_entry: findWindow(ind.footprint, win) } : null,
    enso_test: ind.enso_test,
    break_2014: ind.break_2014,
    calibration: meta.calibration,
    thresholds: meta.thresholds,
    threshold_changes: meta.threshold_changes ?? [],
    limitations: ind.limitations,
    narrative: ind.narrative,
    recipe: meta.recipe ?? null,
    series: ind.series,
  };
}

export function passportMarkdown(p: Props): string {
  const { meta, cell, ind, win, url, lang, indicatorLabel } = p;
  const s = ind.statistics;
  const es = lang === 'es';
  const w = findWindow(ind.footprint, win);
  const L: string[] = [];
  L.push(`# ALTARIS — Evidence Passport`);
  if (meta.synthetic) L.push('', `> **${t('synthetic', lang)}**`);
  L.push('', `**${es ? 'Lugar' : 'Location'}:** ${cell.name ?? cell.id} (${cell.id}${cell.lat != null ? `, ${cell.lat}°, ${cell.lon}°` : ''}${cell.country ? `, ${cell.country}` : ''})`);
  L.push(`**${es ? 'Indicador' : 'Indicator'}:** ${indicatorLabel} (${ind.units})`);
  L.push(`**${es ? 'Datos' : 'Data'}:** ${meta.dataset} · DOI: ${meta.dataset_doi} · ${meta.period[0]}–${meta.period[1]}`);
  L.push(`**${es ? 'Datos auxiliares' : 'Auxiliary data'}:** ${meta.aux_data.join(', ')}`);
  L.push(`**${es ? 'Completitud' : 'Completeness'}:** ${ind.valid_years ?? '?'}/${ind.n_years ?? ind.series.length} ${t('completeness', lang)}`);
  L.push('', `## ${t('verdict', lang)}: ${VERDICT_TEXT[ind.verdict][lang]}`);
  for (const r of ind.verdict_reasons) L.push(`- ${reasonText(r, lang)}`);
  L.push('', `## ${es ? 'Estadística (periodo base)' : 'Statistics (base period)'}`);
  L.push(`| ${es ? 'Medida' : 'Measure'} | ${es ? 'Valor' : 'Value'} |`, '|---|---|');
  L.push(`| ${t('slope', lang)} (Sen) | ${fmt(s.slope_per_decade, 2, true)} ${ind.units} ${t('per_decade', lang)} |`);
  L.push(`| ${t('ci95', lang)} | ${fmt(s.ci_95[0], 2)} … ${fmt(s.ci_95[1], 2)} |`);
  L.push(`| p (Mann-Kendall) | ${fmtP(s.p_value)} |`);
  L.push(`| ${t('p_fdr', lang)} | ${fmtP(s.adjusted_p_fdr)} |`);
  L.push(`| ${t('variant', lang)} | ${s.mk_variant} (r1 = ${fmt(s.lag1_autocorr, 2)}) |`);
  L.push(`| sign_agreement / sig_fraction | ${fmt(s.sign_agreement ?? null, 2)} / ${fmt(s.sig_fraction ?? null, 2)} |`);
  if (win) {
    L.push('', `## ${es ? 'Ventana evaluada' : 'Window evaluated'}: ${win[0]}–${win[1]}`);
    L.push(w && w[2] !== null ? `${t('slope', lang)}: ${fmt(w[2], 2, true)} ${ind.units} ${t('per_decade', lang)} · p = ${fmtP(w[3])} (${es ? 'sin corregir' : 'uncorrected'})` : t('no_data', lang));
  }
  L.push('', `> ${t('overlap_warning', lang)}`);
  if (ind.enso_test) {
    const e = ind.enso_test;
    L.push('', '## ENSO');
    L.push(`- ${t('without_strong', lang)}: ${fmt(e.slope_without_strong_enso, 2, true)} · p = ${fmtP(e.p_without_strong_enso)}`);
    L.push(`- ${t('oni_removed', lang)}: ${fmt(e.slope_oni_removed, 2, true)} · p = ${fmtP(e.p_oni_removed)}`);
    if (e.survives !== null) L.push(`- ${e.survives ? t('survives', lang) : t('not_survives', lang)}`);
  }
  const c = meta.calibration;
  L.push('', `## ${es ? 'Qué tan fiable es el propio veredicto' : 'How reliable the verdict itself is'}`);
  L.push(
    es
      ? `Con ${c.n_sim} series sin tendencia (barajadas): ${pct(c.false_positive_rate.consistente)} salen "consistente" y ${pct(c.false_positive_rate.limitada)} "limitada". Con una tendencia inyectada de ${c.power.injected_trend_pct_per_decade} % de la media por década se detecta ${pct(c.power.detected_consistente)} como "consistente" y ${pct(c.power.detected_limitada_o_mas)} como "limitada" o más.`
      : `With ${c.n_sim} trendless (shuffled) series: ${pct(c.false_positive_rate.consistente)} come out "consistent" and ${pct(c.false_positive_rate.limitada)} "limited". With an injected trend of ${c.power.injected_trend_pct_per_decade}% of the mean per decade, ${pct(c.power.detected_consistente)} are detected as "consistent" and ${pct(c.power.detected_limitada_o_mas)} as "limited" or better.`,
  );
  if (meta.threshold_changes?.length) {
    L.push('', `**${es ? 'Cambios de umbrales' : 'Threshold changes'}:**`);
    meta.threshold_changes.forEach((x) => L.push(`- ${x}`));
  }
  L.push('', `## ${t('limitations', lang)}`);
  for (const l of ind.limitations) L.push(`- ${limitationText(l, lang)}`);
  if (ind.narrative) {
    L.push('', `## ${t('narrative', lang)}`, ind.narrative[lang], '', `_${ind.narrative.generated_by === 'AI' ? t('ai_text', lang) : t('template_text', lang)}_`);
  }
  if (meta.recipe) {
    L.push('', `## ${es ? 'Receta reproducible' : 'Reproducible recipe'}`, '```json', JSON.stringify(meta.recipe, null, 2), '```');
  }
  L.push('', `**${es ? 'Enlace con estado congelado' : 'Frozen-state link'}:** ${url}`);
  L.push(`_${es ? 'Generado' : 'Generated'}: ${meta.generated_at} · pipeline ${meta.pipeline_commit ?? '—'}_`);
  L.push('', es
    ? '_ALTARIS analiza tendencias pasadas. No predice el clima, no da recetas agronómicas y no afirma causas._'
    : '_ALTARIS analyzes past trends. It does not forecast climate, give agronomic prescriptions or claim causes._');
  return L.join('\n') + '\n';
}

const pct = (x: number | null) => (x === null || x === undefined ? '—' : `${(x * 100).toFixed(1)} %`);

export function Passport(props: Props) {
  const { lang, cell, indKey, url } = props;
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const base = `altaris_${cell.id}_${indKey}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState('ok');
    } catch {
      setCopyState('fail');
    }
  };
  return (
    <section className="passport" data-tour="passport">
      <h3>{t('passport', lang)}</h3>
      <p className="small">{t('passport_help', lang)}</p>
      <div className="btn-row no-print">
        <button type="button" onClick={() => download(`${base}.json`, JSON.stringify(passportJson(props), null, 2), 'application/json')}>
          {t('dl_json', lang)}
        </button>
        <button type="button" onClick={() => download(`${base}.md`, passportMarkdown(props), 'text/markdown')}>{t('dl_md', lang)}</button>
        <button type="button" onClick={() => window.print()}>{t('print', lang)}</button>
        <button type="button" onClick={copy}>{t('copy_link', lang)}</button>
      </div>
      {copyState !== 'idle' && <p className="small" role="status">{copyState === 'ok' ? t('copied', lang) : t('copy_failed', lang)}</p>}
      <p className="url-box small"><code>{url}</code></p>
      <MicroValidation lang={lang} cellId={cell.id} />
    </section>
  );
}

// --- Micro-validación (sección 6 del contexto maestro) -------------------------------
// Dos preguntas de comprensión. Se guardan anónimas en el navegador (localStorage) hasta que
// Rol 6 indique dónde deben guardarse (p. ej. un formulario). No se piden datos personales.

const QUIZ = [
  {
    id: 'q1',
    q: { es: '¿Qué significa "Evidencia limitada"?', en: 'What does "Limited evidence" mean?' },
    options: [
      { id: 'a', es: 'Que la lluvia va a bajar con seguridad', en: 'That rainfall will surely decrease' },
      { id: 'b', es: 'Que hay una señal, pero no es firme', en: 'That there is a signal, but it is not firm' },
      { id: 'c', es: 'Que los datos están mal', en: 'That the data are wrong' },
    ],
    correct: 'b',
  },
  {
    id: 'q2',
    q: { es: '¿ALTARIS predice cuánto lloverá el próximo año?', en: 'Does ALTARIS forecast next year’s rainfall?' },
    options: [
      { id: 'a', es: 'Sí', en: 'Yes' },
      { id: 'b', es: 'No, analiza lo que ya pasó', en: 'No, it analyzes what already happened' },
    ],
    correct: 'b',
  },
];

function MicroValidation({ lang, cellId }: { lang: Lang; cellId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = () => {
    const record = {
      at: new Date().toISOString(),
      cell: cellId,
      answers,
      correct: QUIZ.filter((q) => answers[q.id] === q.correct).length,
    };
    try {
      const prev = JSON.parse(localStorage.getItem('altaris_microvalidation') ?? '[]');
      localStorage.setItem('altaris_microvalidation', JSON.stringify([...prev, record]));
    } catch {
      /* almacenamiento no disponible: no bloquea */
    }
    setSent(true);
  };
  return (
    <form className="quiz no-print" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <h4>{t('quiz_title', lang)}</h4>
      {sent ? (
        <p role="status">{t('quiz_thanks', lang)}</p>
      ) : (
        <>
          {QUIZ.map((q) => (
            <fieldset key={q.id}>
              <legend>{q.q[lang]}</legend>
              {q.options.map((o) => (
                <label key={o.id} className="radio">
                  <input type="radio" name={q.id} value={o.id} checked={answers[q.id] === o.id} onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))} />
                  {o[lang]}
                </label>
              ))}
            </fieldset>
          ))}
          <button type="submit" disabled={QUIZ.some((q) => !answers[q.id])}>{t('quiz_send', lang)}</button>
        </>
      )}
    </form>
  );
}
