import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const root = resolve('dist');
const output = 'node_modules/.cache/pilot';
mkdirSync(output, { recursive: true });
const expected = JSON.parse(readFileSync('public/data/pilot/cells/N1335W08715.json', 'utf8'));
const meta = JSON.parse(readFileSync('public/data/pilot/meta.json', 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1100, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // Serve the production bundle from disk without depending on a separate dev server.
  await page.route('http://pilot.local/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    assert.ok(file.startsWith(root + '/') || file.startsWith(root + '\\'));
    const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json' };
    try {
      await route.fulfill({ body: readFileSync(file), contentType: mime[extname(file)] || 'application/octet-stream' });
    } catch {
      await route.fulfill({ status: 404, body: '' });
    }
  });
  await page.goto('http://pilot.local/');
  await page.getByRole('link', { name: 'Piloto real · Choluteca' }).click();
  await page.waitForSelector('.verdict');
  assert.match(page.url(), /dataset=pilot/);
  assert.match(await page.locator('.pilot-status').innerText(), /FDR.*solo esta celda/);
  assert.match(await page.locator('.verdict').innerText(), /24\/24/);
  assert.match(await page.locator('.verdict').textContent(), /Control ENSO pendiente/);
  assert.match(await page.locator('.verdict').textContent(), /Chequeo del salto de 2014 pendiente/);
  assert.ok(await page.getByLabel('Quitar años ENSO fuertes').isDisabled());
  for (const ind of ['may_oct_mm', 'jul_aug_mm', 'annual_mm']) {
    const lens = ind === 'annual_mm' ? 'com' : 'agri';
    await page.goto(`http://pilot.local/?dataset=pilot&cell=N1335W08715&ind=${ind}&lens=${lens}`);
    await page.waitForSelector('.verdict');
    await page.locator('rect[data-k="2001-2016"]').dispatchEvent('pointerup');
    assert.match(page.url(), /win=2001-2016/);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar JSON', exact: true }).click()]);
    const passport = JSON.parse(readFileSync(await download.path(), 'utf8'));
    const data = expected.indicators[ind];
    assert.deepEqual(passport.statistics, data.statistics);
    assert.deepEqual(passport.series, data.series);
    assert.equal(passport.data_kind, 'observed');
    assert.equal(passport.cell.id, expected.id);
    assert.equal(passport.verdict, data.verdict);
    assert.equal(passport.provenance.pipeline_commit, meta.pipeline_commit);
    assert.equal(passport.provenance.dataset_doi, meta.dataset_doi);
    assert.equal(passport.analysis_scope.kind, 'single_cell_pilot');
    assert.equal(passport.selected_window.start, 2001);
    assert.equal(passport.selected_window.end, 2016);
    assert.deepEqual(passport.selected_window.ci_95, data.window_results['2001-2016'].ci_95);
    assert.equal(passport.selected_window.verdict, data.window_results['2001-2016'].verdict);
    assert.deepEqual(passport.enso_test, data.enso_test);
    assert.deepEqual(passport.break_2014, data.break_2014);
    const [markdown] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar Markdown', exact: true }).click()]);
    const text = readFileSync(await markdown.path(), 'utf8');
    assert.match(text, /Piloto observado de Choluteca/);
    assert.match(text, /ENSO pendiente/);
    assert.match(text, /2001–2016/);
    assert.ok(text.includes(meta.dataset_doi));
    assert.ok(!/NaN|undefined/.test(text));
    await download.saveAs(`${output}/${ind}.json`);
    console.log(`PASS ${ind}: screen → window → passport statistics, series, CI, verdict and provenance`);
  }
  await page.screenshot({ path: `${output}/observed-pilot.png`, fullPage: true });
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
