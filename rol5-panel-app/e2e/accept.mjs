import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:4173/';
const out = [];
const ok = (name, cond, extra = '') => { out.push(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1000, height: 1400 } });
const errors = [];
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

// 1. Enlace profundo
await page.goto(B + '?cell=N1345W08815&ind=jul_aug_mm&win=2001-2016&tour=1');
await page.waitForSelector('.verdict');
ok('1a veredicto limitada con aviso', (await page.textContent('.verdict')).includes('Señal débil, no confirmada'));
ok('1b ventana 2001-2016 en comparador', (await page.textContent('.compare thead')).includes('2001–2016'));
ok('1c rect seleccionado en huella', await page.locator('rect[data-k="2001-2016"]').getAttribute('stroke') === '#111');
ok('1d recorrido paso 1', (await page.textContent('.tour')).includes('1/4'));
ok('1e 120 casillas', await page.locator('.footprint rect').count() === 120);
const ms = await page.evaluate(() => window.__panelPaintMs);
ok('1f panel pintado < 300 ms tras JSON', typeof ms === 'number' && ms < 300, `(${ms?.toFixed(1)} ms)`);
await page.screenshot({ path: '/tmp/1-deeplink.png', fullPage: true });

// 2. Clic en huella escribe win, conserva otros parámetros, Esc cierra recorrido
await page.keyboard.press('Escape');
ok('2a Esc cierra recorrido y escribe tour=0', page.url().includes('tour=0') && await page.locator('.tour').count() === 0);
await page.locator('rect[data-k="2004-2024"]').dispatchEvent('pointerup');
ok('2b clic escribe win=2004-2024', page.url().includes('win=2004-2024'), page.url().split('?')[1]);
ok('2c conserva cell e ind', page.url().includes('cell=N1345W08815') && page.url().includes('ind=jul_aug_mm'));
await page.locator('.footprint svg').focus();
await page.keyboard.press('ArrowLeft'); // inicio 2003
ok('2d flecha izquierda mueve inicio', page.url().includes('win=2003-2024'), page.url().split('?')[1]);
await page.locator('rect[data-k="2001-2024"]').dispatchEvent('pointerup');
ok('2e clic en periodo base borra win', !page.url().includes('win='));
// recarga conserva
await page.locator('rect[data-k="2005-2020"]').dispatchEvent('pointerup');
await page.reload(); await page.waitForSelector('.verdict');
ok('2f recarga conserva ventana', await page.locator('rect[data-k="2005-2020"]').getAttribute('stroke') === '#111');
// ventana inexistente
await page.goto(B + '?cell=N1345W08815&ind=jul_aug_mm&win=2001-2005'); await page.waitForSelector('.verdict');
ok('2g ventana inexistente: nota y base', (await page.textContent('.panel')).includes('no existe para esta celda'));

// 3. Hover no repinta serie (cuenta nodos modificados)
await page.goto(B + '?cell=N1345W08815&ind=jul_aug_mm'); await page.waitForSelector('.footprint rect');
const muts = await page.evaluate(async () => {
  const fig = document.querySelector('[data-tour="series"]'); let n = 0;
  const mo = new MutationObserver((r) => { n += r.length; }); mo.observe(fig, { subtree: true, childList: true, attributes: true });
  const rects = [...document.querySelectorAll('.footprint rect')].slice(0, 40);
  for (const r of rects) { r.dispatchEvent(new PointerEvent('pointermove', { bubbles: true })); await new Promise((x) => setTimeout(x, 5)); }
  mo.disconnect(); return n;
});
ok('3 hover sobre 40 casillas no toca la serie', muts === 0, `(${muts} mutaciones)`);
await page.locator('rect[data-k="2001-2016"]').dispatchEvent('pointermove');
ok('3b tooltip visible', await page.locator('.footprint-tip').count() === 1);

// 4. Nulos
await page.goto(B + '?cell=N1575W08795&ind=jul_aug_mm'); await page.waitForSelector('.verdict');
const t4 = await page.textContent('.panel');
ok('4a incompleta: etiqueta y 20/24', t4.includes('Datos incompletos') && t4.includes('20/24'));
ok('4b incompleta: nota de huella vacía', t4.includes('No hay ventanas calculadas'));
await page.goto(B + '?cell=N1335W08725&ind=jul_aug_mm'); await page.waitForSelector('.verdict');
ok('4c salto 2014: aviso instrumental', (await page.textContent('.verdict')).includes('efecto instrumental'));
await page.goto(B + '?cell=N1425W08905&ind=jul_aug_mm'); await page.waitForSelector('.verdict');
await page.locator('rect[data-k="2001-2016"]').dispatchEvent('pointerup');
ok('4e comparador sin IC de ventana', (await page.locator('.compare tbody tr').nth(1).textContent()).includes('—'));
for (const id of ['N0000W00000', 'N9999W09999']) {
  await page.goto(B + `?cell=${id}`); await page.waitForSelector('[role=alert]');
  ok(`4f ${id}: tarjeta de error, no pantalla en blanco`, (await page.textContent('#root')).includes('No se pudieron leer'));
}

// 5. Veredicto en inglés
await page.goto(B + '?cell=N1345W08815&ind=jul_aug_mm&lang=en'); await page.waitForSelector('.verdict');
ok('5 limitada en inglés', (await page.textContent('.verdict')).includes('Weak signal, not confirmed'));

// 6. ENSO
await page.goto(B + '?cell=N1345W08815&ind=jul_aug_mm'); await page.waitForSelector('.verdict');
await page.getByLabel('Quitar años ENSO fuertes').check();
ok('6a enso=on en URL', page.url().includes('enso=on'));
ok('6b muestra pendiente sin ENSO fuerte', (await page.textContent('[data-tour="enso"]')).includes('Sin años ENSO fuertes'));

// 7. Tarjetas y lentes
ok('7a tarjeta con preguntas', (await page.textContent('.cards')).includes('registros locales de lluvia'));
await page.selectOption('select >> nth=2', 'ene');
ok('7b lente Energía: análisis pendiente', (await page.textContent('.cards')).includes('Análisis cuantitativo pendiente'));

// 8. Recorrido paso 3 mueve la ventana
await page.goto(B + '?cell=N1345W08815&ind=jul_aug_mm&tour=3'); await page.waitForSelector('.tour');
await page.waitForFunction(() => location.search.includes('win=2001-2016'));
ok('8 paso 3 escribe win=2001-2016', true);

// 9. Espejo
await page.goto(B + '?cell=N1345W08815&ind=jul_aug_mm&case=3'); await page.waitForSelector('.mirror');
ok('9 vista espejo con 2 gráficas', await page.locator('.mirror svg.recharts-surface').count() >= 2);

// 10. Pasaporte (incógnito = contexto nuevo, 0 peticiones al exportar)
const inc = await browser.newContext({ acceptDownloads: true, viewport: { width: 1000, height: 1400 } });
const p2 = await inc.newPage();
await p2.goto(B + '?cell=N1345W08815&ind=jul_aug_mm&win=2001-2016'); await p2.waitForSelector('.passport');
let reqs = 0; p2.on('request', () => reqs++);
const [dj] = await Promise.all([p2.waitForEvent('download'), p2.getByText('Descargar JSON').click()]);
const [dm] = await Promise.all([p2.waitForEvent('download'), p2.getByText('Descargar Markdown').click()]);
const fs = await import('node:fs');
const jpath = await dj.path(); const mpath = await dm.path();
const j = JSON.parse(fs.readFileSync(jpath, 'utf8')); const md = fs.readFileSync(mpath, 'utf8');
ok('10a JSON válido con ventana', j.selected_window?.start === 2001 && j.verdict === 'limitada');
ok('10b Markdown con aviso y sin NaN/undefined/null', md.includes('Señal débil, no confirmada') && !/NaN|undefined|null/.test(md));
ok('10c exportar hace 0 peticiones', reqs === 0, `(${reqs})`);
ok('10d nombres de archivo', dj.suggestedFilename() === 'altaris_N1345W08815_jul_aug_mm.json' && dm.suggestedFilename().endsWith('.md'));
await p2.emulateMedia({ media: 'print' });
ok('10e impresión oculta barra y botones', !(await p2.locator('.topbar').isVisible()) && !(await p2.locator('.passport').isVisible()));
await p2.pdf({ path: '/tmp/print.pdf', format: 'A4' });

// 11. Móvil
const mob = await browser.newContext({ viewport: { width: 390, height: 800 } });
const p3 = await mob.newPage(); await p3.goto(B + '?cell=N1345W08815&ind=jul_aug_mm'); await p3.waitForSelector('.verdict');
ok('11 móvil sin desbordamiento horizontal', await p3.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `(${await p3.evaluate(() => document.documentElement.scrollWidth)} px)`);
await p3.screenshot({ path: '/tmp/11-mobile.png', fullPage: true });

ok('12 sin errores no capturados en consola', errors.filter((e) => !/Failed to load resource|NaN|N9999|N0000/.test(e)).length === 0, errors.length ? '\n   ' + errors.join('\n   ') : '');
console.log(out.join('\n'));
await browser.close();
