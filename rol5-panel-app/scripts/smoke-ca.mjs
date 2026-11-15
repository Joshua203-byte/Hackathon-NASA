// Rol 4 · Prueba de humo de la vista previa de Centroamérica.
//
//   node scripts/smoke-ca.mjs                                   → contra ./dist-ca (local, sin servidor)
//   BASE_URL=https://altaris-ca.<cuenta>.workers.dev node scripts/smoke-ca.mjs   → contra la URL publicada
//
// Comprueba: carga del mapa en 3 tamaños (tiempo, sin scroll horizontal, sin aviso de DEMOSTRACIÓN,
// países nuevos en el texto), los extremos N/S/E/O de cada país abren su panel con veredicto,
// los casos 1–3 en escritorio y teléfono, y 0 errores de consola. Sale con 1 si algo falla.
// Necesita ./dist-ca/data/grid.json (de `node scripts/build-ca.mjs`) para elegir las celdas.
import { readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const root = resolve('dist-ca');
const grid = JSON.parse(readFileSync(resolve(root, 'data/grid.json'), 'utf8')).cells;
const base = (process.env.BASE_URL || 'http://ca.local/').replace(/\/?$/, '/');
const picks = [];
for (const cc of [...new Set(grid.map(c => c.country))].sort()) {
  const g = grid.filter(c => c.country === cc);
  const by = (k, s) => g.reduce((a, c) => (s * c[k] > s * a[k] ? c : a));
  for (const c of [by('lat', 1), by('lat', -1), by('lon', 1), by('lon', -1)]) if (!picks.includes(c.id)) picks.push(c.id);
}
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.geojson': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = { errors: [], cells_ok: 0, cells_fail: [], cases: [], loads: [] };

async function newPage(viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on('pageerror', e => results.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) results.errors.push('console: ' + m.text()); });
  if (!process.env.BASE_URL) await page.route('http://ca.local/**', async route => {
    const p = new URL(route.request().url()).pathname;
    const file = resolve(root, '.' + (p === '/' ? '/index.html' : decodeURIComponent(p)));
    try { await route.fulfill({ body: readFileSync(file), contentType: types[extname(file)] || 'application/octet-stream' }); }
    catch { await route.fulfill({ status: 404, body: '' }); }
  });
  return page;
}

try {
  for (const vp of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    const page = await newPage(vp);
    const t0 = Date.now();
    await page.goto(base);
    await page.waitForSelector('.maplibregl-canvas', { timeout: 30000 });
    await page.waitForFunction(() => !document.querySelector('.region-map-loading'), null, { timeout: 30000 });
    const ms = Date.now() - t0;
    const info = await page.evaluate(() => ({
      hscroll: document.documentElement.scrollWidth > innerWidth,
      demo: /DEMOSTRACI|DEMO DATA/i.test(document.body.innerText),
      new_countries: ['Belice', 'Nicaragua', 'Costa Rica', 'Panamá'].every(n => document.body.innerText.includes(n)),
    }));
    results.loads.push({ vp: `${vp.width}x${vp.height}`, ms, ...info });
    await page.context().close();
  }
  const page = await newPage({ width: 1440, height: 900 });
  for (const id of picks) {
    try {
      await page.goto(`${base}?cell=${id}&lang=es`);
      await page.waitForSelector('.compare', { timeout: 15000 });
      if (await page.$('.verdict')) results.cells_ok++; else results.cells_fail.push(id + ' sin veredicto');
    } catch { results.cells_fail.push(id); }
  }
  for (const n of [1, 2, 3]) for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const p = await newPage(vp);
    try { await p.goto(`${base}?case=${n}&lang=es`); await p.waitForSelector('.compare', { timeout: 15000 }); results.cases.push(`caso ${n} ${vp.width}: ok`); }
    catch { results.cases.push(`caso ${n} ${vp.width}: FALLA`); }
    await p.context().close();
  }
} finally { await browser.close(); }

console.log(JSON.stringify({ base, celdas_probadas: picks.length, ...results }, null, 1));
const bad = results.errors.length || results.cells_fail.length || results.cases.some(c => c.includes('FALLA'))
  || results.loads.some(l => l.hscroll || l.demo || !l.new_countries);
process.exit(bad ? 1 : 0);
