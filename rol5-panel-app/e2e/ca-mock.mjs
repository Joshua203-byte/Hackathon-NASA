// Rol 5 · Prueba de Centroamérica (7 países). Sirve con datos SIMULADOS (pipeline/make_ca_mock.py) o con la vista previa real.
//
//   python pipeline/make_ca_mock.py --out <carpeta> --stride 1      # el simulado completo incluye las celdas de los 3 casos
//   npm run build
//   CA_MOCK_DIR=<carpeta> node e2e/ca-mock.mjs                     # <carpeta>/data/{meta,grid,cells/…}
//   BASE_URL=https://altaris-ca.<cuenta>.workers.dev/ node e2e/ca-mock.mjs   # contra la vista previa (datos reales o simulados)
//
// Con CA_MOCK_DIR se sirve ./dist en un servidor local y /data sale de la carpeta simulada (no se toca public/data).
// Comprueba: carga sin errores, intro con los 7 países, clic en el mapa en una celda de CADA país, panel con el nombre del país
// (no el código ISO) en ES/EN, pasaporte con el país correcto, comparador, ENSO, recorrido, ?case=1..3 y teléfono.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { chromium } from 'playwright-core';

const NAME = {
  BLZ: { es: 'Belice', en: 'Belize' }, GTM: { es: 'Guatemala', en: 'Guatemala' }, SLV: { es: 'El Salvador', en: 'El Salvador' },
  HND: { es: 'Honduras', en: 'Honduras' }, NIC: { es: 'Nicaragua', en: 'Nicaragua' }, CRI: { es: 'Costa Rica', en: 'Costa Rica' }, PAN: { es: 'Panamá', en: 'Panama' },
};
const CASE_CELLS = ['N1335W08715', 'N1475W08765', 'N1495W09125'];
const NEW = ['BLZ', 'NIC', 'CRI', 'PAN'];
const output = 'node_modules/.cache/ca-mock';
mkdirSync(output, { recursive: true });

const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.geojson': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const dist = resolve('dist');
const mockData = process.env.CA_MOCK_DIR ? resolve(process.env.CA_MOCK_DIR, 'data') : null;
let server = null;
let base = process.env.BASE_URL?.replace(/\/?$/, '/');
if (!base) {
  mockData ?? assert.fail('Define CA_MOCK_DIR (carpeta de make_ca_mock.py) o BASE_URL (vista previa).');
  assert.ok(existsSync(join(dist, 'index.html')), 'Falta ./dist: corre `npm run build` antes.');
  assert.ok(existsSync(join(mockData, 'grid.json')), `Falta ${join(mockData, 'grid.json')}`);
  server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const root = path.startsWith('/data/') ? mockData : dist;
    const file = resolve(root, '.' + (path.startsWith('/data/') ? path.slice(5) : path === '/' ? '/index.html' : path));
    if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(readFileSync(file));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/`;
}
const loadJson = async path => mockData && !process.env.BASE_URL ? JSON.parse(readFileSync(join(mockData, path), 'utf8')) : (await fetch(new URL(`data/${path}`, base))).json();

const grid = (await loadJson('grid.json')).cells;
const meta = await loadJson('meta.json');
const codes = [...new Set(grid.map(c => c.country))].sort();
assert.deepEqual(codes, Object.keys(NAME).sort(), 'grid.json debe traer exactamente los 7 países');
const byCountry = Object.fromEntries(codes.map(c => [c, grid.filter(g => g.country === c).sort((a, b) => a.id.localeCompare(b.id))]));
const mid = code => byCountry[code][Math.floor(byCountry[code].length / 2)];
console.log(`Datos: ${grid.length} celdas (${codes.map(c => `${c} ${byCountry[c].length}`).join(', ')}) · data_kind ${meta.data_kind}`);

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync), args: ['--no-sandbox'] });
const errors = [];
const checks = [];
const pass = msg => { checks.push(msg); console.log('PASS ' + msg); };
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.location().url.endsWith('/favicon.ico')) errors.push('console: ' + m.text() + ' ' + m.location().url); });
  const download = async (name, file) => {
    const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name, exact: true }).click()]);
    const text = readFileSync(await d.path(), 'utf8');
    await d.saveAs(`${output}/${file}`);
    return text;
  };
  const ready = async () => { await page.waitForSelector('.region-map-canvas'); await page.waitForFunction(() => !document.querySelector('.region-map-loading')); await page.waitForTimeout(1600); };

  // 1. Carga, intro con los 7 países y sin errores
  await page.goto(base);
  await ready();
  const intro = await page.locator('.intro').innerText();
  for (const c of codes) assert.ok(intro.includes(NAME[c].es), `la intro no nombra ${NAME[c].es}`);
  assert.ok((await page.locator('.region-map-help').textContent()).includes(String(grid.length)), 'el texto del mapa no trae el número de celdas');
  await page.screenshot({ path: `${output}/01-inicial.png` });
  pass(`carga: ${grid.length} celdas, la intro nombra los 7 países`);

  // 2. Clic en el mapa en una celda de CADA país (se busca pasando el ratón y leyendo el tooltip)
  const box = await page.locator('.region-map-canvas').boundingBox();
  const found = {};
  const STEP = 16;
  scan: for (let y = box.y + 20; y < box.y + box.height - 110; y += STEP) {
    for (let x = box.x + 450; x < box.x + box.width - 70; x += STEP) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(18);
      const tip = await page.evaluate(() => { const t = document.querySelector('.region-map-tip'); return t ? { text: t.textContent, left: t.style.left } : null; });
      const id = tip && /N\d{4}[EW]\d{5}/.exec(tip.text)?.[0];
      const row = id && grid.find(c => c.id === id);
      if (row && tip.left === `${x - box.x + 12}px` && !found[row.country]) found[row.country] = { x, y, id };
      if (Object.keys(found).length === codes.length) break scan;
    }
  }
  assert.deepEqual(Object.keys(found).sort(), codes, `el mapa no dejó pasar el ratón sobre celdas de: ${codes.filter(c => !found[c]).join(', ')}`);
  for (const code of codes) {
    const { x, y, id } = found[code];
    await page.goto(base);
    await ready();
    await page.mouse.move(x, y);
    await page.waitForFunction(i => document.querySelector('.region-map-tip')?.textContent.includes(i), id);
    await page.mouse.click(x, y);
    await page.waitForFunction(() => new URLSearchParams(location.search).get('cell'));
    assert.equal(new URL(page.url()).searchParams.get('cell'), id, `clic en ${code}`);
    await page.waitForSelector('.compare');
    const kicker = await page.locator('.cell-kicker').textContent(); // textContent: el estilo la pone en mayúsculas
    assert.ok(kicker.includes(NAME[code].es), `${code}: el panel dice «${kicker}» y debería nombrar ${NAME[code].es}`);
    const row = grid.find(c => c.id === id);
    assert.equal(await page.locator('.verdict').first().getAttribute('data-verdict'), row.ind.may_oct_mm.verdict, `${code}: veredicto del panel distinto de grid.json`);
    const cell = await loadJson(`cells/${id}.json`);
    const valid = cell.indicators.may_oct_mm.series.filter(p => p.value !== null).length;
    assert.equal(await page.locator('[data-tour="series"] .recharts-line-dots circle').count(), valid, `${code}: puntos de la serie`);
    const p = JSON.parse(await download('Descargar JSON', `${id}-passport.json`));
    assert.equal(p.cell.id, id);
    assert.equal(p.cell.country, code, `${code}: el pasaporte trae otro país`);
    const md = await download('Descargar Markdown', `${id}-passport.md`);
    assert.ok(md.includes(id) && md.includes(code) && !/NaN|undefined/.test(md), `${code}: pasaporte en Markdown`);
    await page.screenshot({ path: `${output}/02-${code}-${id}.png`, fullPage: true });
    pass(`${code} ${id}: clic en el mapa, panel «${NAME[code].es}», veredicto, serie (${valid} años) y pasaporte`);
  }

  // 3. Inglés: el nombre del país va traducido (Belize, Panama)
  for (const code of codes) {
    const c = mid(code);
    await page.goto(`${base}?cell=${c.id}&ind=may_oct_mm&lang=en`);
    await page.waitForSelector('.compare');
    assert.ok((await page.locator('.cell-kicker').textContent()).includes(NAME[code].en), `${code} en inglés`);
  }
  pass('inglés: los 7 países con su nombre en inglés');

  // 4. Comparador (espejo) entre dos países nuevos, y ENSO
  const [a, b] = [mid('PAN'), mid('BLZ')];
  await page.goto(`${base}?cell=${a.id}&ind=may_oct_mm&mirror=${b.id}`);
  await page.waitForSelector('[data-tour="mirror"]');
  const mirrorText = await page.locator('[data-tour="mirror"]').innerText();
  assert.ok(mirrorText.includes(a.id) && mirrorText.includes(b.id), 'el espejo debe nombrar las dos celdas');
  pass(`comparador: ${a.id} (PAN) contra ${b.id} (BLZ)`);
  for (const code of NEW) {
    await page.goto(`${base}?cell=${mid(code).id}&ind=may_oct_mm&enso=on`);
    await page.waitForSelector('[data-tour="enso"]');
    assert.ok((await page.locator('[data-tour="enso"]').innerText()).length > 40, `${code}: vista ENSO vacía`);
  }
  pass('ENSO: la vista abre en una celda de cada país nuevo');

  // 5. Recorrido desde una celda de Costa Rica
  await page.goto(`${base}?cell=${mid('CRI').id}&ind=may_oct_mm`);
  await page.waitForSelector('.compare');
  await page.getByRole('button', { name: 'Recorrido', exact: true }).click();
  await page.waitForSelector('.tour');
  for (let step = 1; step <= 4; step++) {
    await page.waitForFunction(n => document.querySelector('.tour-head')?.textContent.includes(`${n}/4`), step);
    if (step < 4) await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Terminar', exact: true }).click();
  assert.equal(await page.locator('.tour').count(), 0);
  pass('recorrido: 4 pasos y cierre');

  // 6. Enlaces cortos de los 3 casos (solo si el simulado trae esas celdas)
  for (const [n, id] of CASE_CELLS.entries()) {
    if (!grid.some(c => c.id === id)) { console.log(`SKIP caso ${n + 1}: ${id} no está en estos datos (usa --stride 1)`); continue; }
    await page.goto(`${base}?case=${n + 1}&lang=es`);
    await page.waitForSelector('.compare');
    assert.equal(new URL(page.url()).searchParams.get('cell'), id);
    assert.equal(await page.locator('.case-link').count(), 3);
    pass(`?case=${n + 1} abre ${id}`);
  }

  // 7. Teléfono: sin desbordamiento y con el mapa de los 7 países
  await page.setViewportSize({ width: 390, height: 844 });
  for (const code of ['PAN', 'BLZ']) {
    await page.goto(`${base}?cell=${mid(code).id}&ind=may_oct_mm`);
    await page.waitForSelector('.compare');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${code}: desbordamiento horizontal en móvil`);
    await page.screenshot({ path: `${output}/03-movil-${code}.png` });
  }
  await page.goto(base);
  await ready();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'inicio: desbordamiento horizontal en móvil');
  await page.screenshot({ path: `${output}/03-movil-inicio.png` });
  pass('teléfono 390×844: sin desbordamiento');

  assert.deepEqual(errors, [], 'errores de consola o de página');
  pass('sin errores de consola ni de página');
  writeFileSync(`${output}/report.json`, JSON.stringify({ generated_at: new Date().toISOString(), base_url: process.env.BASE_URL || '(servidor local con CA_MOCK_DIR)', data_kind: meta.data_kind, cells: grid.length, countries: Object.fromEntries(codes.map(c => [c, byCountry[c].length])), checks }, null, 2));
  console.log(`\nOK: ${checks.length} comprobaciones. Capturas e informe en ${output}`);
} catch (e) {
  console.error('\nFALLÓ:', e.message);
  if (errors.length) console.error('Errores recogidos:', errors.slice(0, 5));
  process.exitCode = 1;
} finally { await browser.close(); server?.close(); }
