import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

// Cotejo de datos observados sin modificar las cifras ni recalcular veredictos.
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const csv = path => {
  const [head, ...lines] = readFileSync(path, 'utf8').trim().split(/\r?\n/).map(l => l.split(','));
  return lines.map(values => Object.fromEntries(head.map((k, i) => [k, values[i]])));
};
const ids = ['N1335W08715', 'N1475W08765', 'N1495W09125'];
const series = csv('../data/rol1/series.csv');
const coords = csv('../data/rol1/cells.csv');
const enso = csv('../data/rol3/enso_results.csv');
const breaks = csv('../data/rol3/break2014.csv');
const meta = read('public/data/meta.json');
const grid = read('public/data/grid.json').cells;
const tour = read('public/data/tour.json');
const output = 'node_modules/.cache/real-cases';
mkdirSync(output, { recursive: true });
const report = { generated_at: new Date().toISOString(), pipeline_commit: meta.pipeline_commit, dataset_doi: meta.dataset_doi, checks: [] };
const fmt = n => n.toFixed(1).replace('-', '−');
const signed = n => (n > 0 ? '+' : '') + fmt(n);
const pFmt = n => n < .001 ? '< 0.001' : n.toFixed(3);
const root = resolve('dist');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1100, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('http://cases.local/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    assert.ok(file.startsWith(root + '/') || file.startsWith(root + '\\'));
    try {
      await route.fulfill({ body: readFileSync(file), contentType: ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.geojson': 'application/json' })[extname(file)] || 'application/octet-stream' });
    } catch { await route.fulfill({ status: 404, body: '' }); }
  });
  const download = async (name, file) => {
    const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name, exact: true }).click()]);
    const text = readFileSync(await d.path(), 'utf8');
    await d.saveAs(`${output}/${file}`);
    return text;
  };
  for (const id of ids) {
    const cell = read(`public/data/cells/${id}.json`);
    const row = grid.find(c => c.id === id);
    const coordinate = coords.find(c => c.cell_id === id);
    for (const ind of meta.indicators) {
      const d = cell.indicators[ind];
      const raw = series.filter(r => r.cell_id === id && r.indicator === ind);
      assert.equal(raw.length, 24);
      assert.deepEqual(d.series.map(p => [p.year, p.value]), raw.map(r => [+r.year, +r.value]));
      assert.equal(row.ind[ind].valid_years, 24);
      assert.equal(row.ind[ind].verdict, d.verdict);
      assert.equal(row.ind[ind].slope_dec, d.statistics.slope_per_decade);
      const e = enso.find(r => r.cell_id === id && r.indicator === ind);
      for (const key of ['slope_without_strong_enso', 'p_without_strong_enso', 'slope_oni_removed', 'p_oni_removed']) assert.ok(Math.abs(d.enso_test[key] - +e[key]) <= (key.startsWith('p_') ? .000051 : .00051), `${id}/${ind}/${key}: redondeo del exportador`);
      assert.equal(d.enso_test.survives, e.survives === 'true');
      assert.equal(row.ind[ind].enso_r, +e.enso_r);
      const b = breaks.find(r => r.cell_id === id && r.indicator === ind);
      assert.equal(d.break_2014.pettitt_year, +b.pettitt_year);
      assert.ok(Math.abs(d.break_2014.p - +b.p) <= .000051);
      assert.equal(d.break_2014.flag, b.flag === 'true');
      const slopes = [];
      for (let i = 0; i < raw.length; i++) for (let j = i + 1; j < raw.length; j++) slopes.push((+raw[j].value - +raw[i].value) / (+raw[j].year - +raw[i].year) * 10);
      slopes.sort((a, b) => a - b);
      const median = (slopes[slopes.length / 2 - 1] + slopes[slopes.length / 2]) / 2;
      assert.ok(Math.abs(median - d.statistics.slope_per_decade) <= .00051, `${id}/${ind}: Sen desde CSV`);
      for (const lang of ['es', 'en']) {
        await page.goto(`http://cases.local/?cell=${id}&ind=${ind}&lens=${ind === 'annual_mm' ? 'com' : 'agri'}&lang=${lang}`);
        await page.waitForSelector('.compare');
        assert.equal(await page.locator('.verdict').getAttribute('data-verdict'), d.verdict);
        assert.match(await page.locator('.verdict-completeness').innerText(), /24\/24/);
        const rows = page.locator('.compare tbody tr');
        assert.ok((await rows.nth(0).innerText()).includes(signed(d.statistics.slope_per_decade)));
        assert.ok((await rows.nth(1).innerText()).includes(`[${fmt(d.statistics.ci_95[0])}, ${fmt(d.statistics.ci_95[1])}]`));
        assert.ok((await rows.nth(2).innerText()).includes(pFmt(d.statistics.adjusted_p_fdr)));
        const dots = page.locator('[data-tour="series"] .recharts-line-dots circle');
        assert.equal(await dots.count(), 24);
        await dots.first().hover({ force: true });
        await page.waitForFunction(value => document.querySelector('[data-tour="series"] .recharts-tooltip-wrapper')?.textContent.includes(value), fmt(d.series[0].value));
        await page.locator('rect[data-k="2008-2023"]').dispatchEvent('pointerup');
        const window = d.footprint.find(w => w[0] === 2008 && w[1] === 2023);
        assert.ok((await rows.nth(0).innerText()).includes(signed(window[2])));
        assert.ok((await rows.nth(1).innerText()).includes(`[${fmt(window[4])}, ${fmt(window[5])}]`));
        assert.ok((await rows.nth(2).innerText()).includes(pFmt(window[3])));
        const windowLabel = d.window_results['2008-2023'].verdict === 'limitada'
          ? (lang === 'es' ? 'Señal débil' : 'Weak signal') : null;
        if (windowLabel) assert.ok((await rows.nth(4).innerText()).includes(windowLabel));
        const p = JSON.parse(await download(lang === 'es' ? 'Descargar JSON' : 'Download JSON', `${id}-${ind}-${lang}.json`));
        assert.deepEqual(p.series, d.series);
        assert.deepEqual(p.statistics, d.statistics);
        assert.equal(p.verdict, d.verdict);
        assert.deepEqual(p.completeness, { valid_years: 24, total_years: 24 });
        assert.equal(p.cell.lat, +coordinate.lat);
        assert.equal(p.cell.lon, +coordinate.lon);
        assert.equal(p.cell.country, coordinate.country);
        assert.equal(p.provenance.pipeline_commit, meta.pipeline_commit);
        assert.equal(p.provenance.dataset_doi, meta.dataset_doi);
        assert.deepEqual(p.enso_test, d.enso_test);
        assert.deepEqual(p.break_2014, d.break_2014);
        assert.deepEqual(p.selected_window.ci_95, d.window_results['2008-2023'].ci_95);
        assert.equal(p.selected_window.slope_per_decade, window[2]);
        assert.equal(p.selected_window.p_uncorrected, window[3]);
        assert.equal(p.selected_window.verdict, d.window_results['2008-2023'].verdict);
        const md = await download(lang === 'es' ? 'Descargar Markdown' : 'Download Markdown', `${id}-${ind}-${lang}.md`);
        for (const text of [id, meta.dataset_doi, meta.pipeline_commit, '2008–2023', '24/24', signed(d.statistics.slope_per_decade), signed(window[2])]) assert.ok(md.includes(text), text);
        assert.ok(!/NaN|undefined/.test(md));
      }
      report.checks.push({ cell: id, indicator: ind, csv_years: raw.length, verdict: d.verdict, slope: d.statistics.slope_per_decade, csv_sen: median, window: d.window_results['2008-2023'].verdict, languages: ['es', 'en'] });
      console.log(`PASS ${id}/${ind}: CSV → JSON → pantalla → pasaportes ES/EN`);
    }
  }
  // Abrir desde otra celda y otro indicador también debe arrancar el caso correcto.
  for (const lang of ['es', 'en']) {
    await page.goto(`http://cases.local/?cell=N1495W09125&ind=annual_mm&lens=com&lang=${lang}`);
    await page.waitForSelector('.compare');
    await page.getByRole('button', { name: lang === 'es' ? 'Recorrido' : 'Tour', exact: true }).click();
    await page.waitForSelector('.tour');
    assert.equal(new URL(page.url()).searchParams.get('cell'), tour.context.cell);
    for (let step = 1; step <= 4; step++) {
      await page.waitForFunction(n => document.querySelector('.tour-head')?.textContent.includes(`${n}/4`), step);
      assert.ok((await page.locator('.tour').innerText()).includes(tour.steps[step - 1].title[lang]));
      if (step === 3) {
        await page.waitForFunction(() => new URLSearchParams(location.search).get('win') === '2008-2023');
        assert.ok((await page.locator('.compare').innerText()).includes('−344.5'));
        await page.reload();
        await page.waitForSelector('.tour');
        assert.equal(new URL(page.url()).searchParams.get('tour'), '3');
      }
      if (step < 4) await page.getByRole('button', { name: lang === 'es' ? 'Siguiente' : 'Next', exact: true }).click();
    }
    assert.equal(await page.locator('[data-tour="passport"]').evaluate(el => el.classList.contains('tour-focus')), true);
    await page.screenshot({ path: `${output}/tour-passport-${lang}.png`, fullPage: true });
    await page.getByRole('button', { name: lang === 'es' ? 'Terminar' : 'Done', exact: true }).click();
    assert.equal(await page.locator('.tour').count(), 0);
  }
  assert.deepEqual(errors, []);
  report.tour = '4 pasos ES/EN, inicio desde otro indicador, recarga del paso 3 y foco en pasaporte';
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log('PASS recorrido real ES/EN; report.json y descargas guardadas en ' + output);
} finally { await browser.close(); }
