// Captura determinista del video de 30 s de ALTARIS. Cada cuadro es el estado de la interfaz REAL en el instante t:
// la cámara, el deslizador y el desplazamiento se calculan a partir de t (no se graba en tiempo real, porque el WebGL por software
// iría a tirones). Los rótulos son una capa HTML encima de la misma página.
//   node capture.cjs --probe     -> un cuadro por escena en probe/
//   node capture.cjs             -> todos los cuadros en frames/ (30 fps)
const { chromium } = require('playwright');
const fs = require('fs');

const PROBE = process.argv.includes('--probe');
const ONLY = process.argv.includes('--only-ui') ? 'ui' : process.argv.includes('--only-map') ? 'map' : null;
const argv = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1];
const OUT = argv('out') || (PROBE ? 'probe' : 'frames');
const FPS = 30, W = 1920, H = 1080, TOTAL = 28.6;
const BASE = 'http://127.0.0.1:5300/?intro=0&guide=0&live=1&lang=en';
const CELL = 'N1475W08765';
const URL_SHOWN = 'altaris.altaris-panel-rol5.workers.dev';
const TEAM = ['Joshua', 'Camila', 'Elena', 'Izel', 'David', 'Andrés'];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const fin = (t, t0, d = 0.45) => clamp((t - t0) / d);
const vis = (t, a, b, d = 0.45) => Math.min(fin(t, a, d), 1 - fin(t, b - d, d));

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
let n = Number(argv('start') || 0); // índice del primer cuadro (para repetir solo la escena B sin tocar la A)
const name = i => `${OUT}/f_${String(i).padStart(5, '0')}.png`;

// ---------- capa de rótulos ----------
const OVERLAY_CSS = `
#vo-vig{position:fixed;inset:0;pointer-events:none;z-index:99990;opacity:0;background:linear-gradient(90deg,rgba(3,9,20,.82) 0%,rgba(3,9,20,.35) 38%,rgba(3,9,20,0) 62%),linear-gradient(0deg,rgba(3,9,20,.7) 0%,rgba(3,9,20,0) 36%)}
#vo-cap{position:fixed;z-index:99995;color:#fff;font-family:'Space Grotesk Variable','Inter Variable',sans-serif;pointer-events:none;opacity:0}
#vo-cap .k{font:600 22px/1 'Inter Variable',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#f2b705;margin-bottom:14px}
#vo-cap .t{font:700 64px/1.08 'Space Grotesk Variable',sans-serif;letter-spacing:-.01em;text-shadow:0 4px 30px rgba(0,0,0,.65)}
#vo-cap.ui{background:rgba(8,22,44,.94);border:2px solid #f2b705;border-radius:18px;padding:24px 32px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
#vo-cap.ui .t{font-size:46px;text-shadow:none}
#vo-title{position:fixed;z-index:99995;left:110px;top:50%;width:760px;color:#fff;font-family:'Space Grotesk Variable',sans-serif;pointer-events:none;opacity:0}
#vo-title .a{font:700 118px/1 'Space Grotesk Variable',sans-serif;letter-spacing:.2em;margin-left:-6px;text-shadow:0 6px 40px rgba(0,0,0,.7)}
#vo-title .b{font:600 40px/1.2 'Space Grotesk Variable',sans-serif;margin-top:22px;color:#e8f1ff;text-shadow:0 3px 24px rgba(0,0,0,.7)}
#vo-title .c{font:500 22px/1.4 'Inter Variable',sans-serif;white-space:nowrap;margin-top:30px;color:#bcd2f2;letter-spacing:.04em;text-shadow:0 2px 14px rgba(0,0,0,.8);opacity:0}
#vo-end{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;pointer-events:none;opacity:0;
 background:radial-gradient(120% 90% at 50% 40%,#0c2547 0%,#050d1c 62%,#02050c 100%);font-family:'Space Grotesk Variable',sans-serif}
#vo-end .a{font:700 112px/1 'Space Grotesk Variable',sans-serif;letter-spacing:.24em;margin-left:.24em}
#vo-end .b{font:600 44px/1.25 'Space Grotesk Variable',sans-serif;margin-top:26px;max-width:1300px;color:#e8f1ff}
#vo-end .s{font:500 30px/1.3 'Inter Variable',sans-serif;margin-top:18px;color:#bcd2f2}
#vo-end .u{font:600 38px/1 'Inter Variable',sans-serif;margin-top:46px;padding:20px 38px;border:3px solid #f2b705;border-radius:16px;color:#fff;letter-spacing:.01em}
#vo-end .n{font:500 28px/1.3 'Inter Variable',sans-serif;margin-top:46px;color:#d7e6fb;letter-spacing:.03em}
#vo-end .n b{color:#f2b705;font-weight:700;letter-spacing:.24em;text-transform:uppercase;font-size:20px;display:block;margin-bottom:10px}
#vo-end .f{position:absolute;left:0;right:0;bottom:36px;font:500 20px/1.4 'Inter Variable',sans-serif;color:#8fa9cc;padding:0 90px}
body.vid-clean .topbar,body.vid-clean .overlay-left,body.vid-clean .region-map-layers,body.vid-clean .map-legend,body.vid-clean .maplibregl-ctrl,body.vid-clean .space-tools,body.vid-clean .help-layer{display:none!important}
body.vid-clean .stage{height:100vh!important;min-height:0!important}
body.vid-nomark .case-marker{opacity:0!important}
body.vid-nolabels .country-label{opacity:0!important}
#vo-cap,#vo-title{zoom:var(--vz,1)}
#vo-end>*{zoom:var(--vz,1)}
.help-layer{display:none!important}
.vid-hi{outline:5px solid #f2b705!important;outline-offset:6px!important;border-radius:12px}
`;

async function installOverlay(page) {
  await page.addStyleTag({ content: OVERLAY_CSS });
  await page.evaluate(({ team, url }) => {
    const mk = (id, html, cls = '') => { const d = document.createElement('div'); d.id = id; d.className = cls; d.innerHTML = html; document.body.appendChild(d); return d; };
    mk('vo-vig', '');
    mk('vo-cap', '<div class="k"></div><div class="t"></div>');
    mk('vo-title', '<div class="a">ALTARIS</div><div class="b">How much confidence does a rainfall trend deserve?</div><div class="c">NASA GPM IMERG V07 · 4,332 places · 7 countries · 2001–2024</div>');
    mk('vo-end', `<div class="a">ALTARIS</div><div class="b">Turn any rainfall line into a question you can test.</div><div class="s">Next: more places, more variables, and every student a data detective.</div><div class="u">${url}</div><div class="n"><b>Team ALTARIS</b>${team.join(' · ')}</div><div class="f">Data: NASA GPM IMERG V07 (GES DISC) · NASA GIBS · NOAA CPC ONI · Natural Earth. Historical analysis, not a forecast. All images are real captures of the app; built with AI-assisted code.</div>`);
    window.__vo = s => {
      const set = (id, a, extra) => { const e = document.getElementById(id); e.style.opacity = String(a); if (extra) extra(e); };
      set('vo-vig', s.vig ?? 0);
      set('vo-cap', s.cap ? s.cap.a : 0, e => {
        if (!s.cap) return;
        e.className = s.cap.ui ? 'ui' : '';
        e.querySelector('.k').textContent = s.cap.k; e.querySelector('.t').textContent = s.cap.t;
        Object.assign(e.style, { left: s.cap.x + 'px', top: s.cap.y != null ? s.cap.y + 'px' : 'auto', bottom: s.cap.b != null ? s.cap.b + 'px' : 'auto', maxWidth: (s.cap.w || 1100) + 'px', transform: `translateY(${(1 - s.cap.a) * 22}px)` });
      });
      set('vo-title', s.title ? s.title.a : 0, e => { if (s.title) { e.style.transform = `translateY(calc(-50% + ${(1 - s.title.a) * 24}px))`; e.querySelector('.c').style.opacity = String(s.title.c ?? 0); } });
      set('vo-end', s.end ?? 0);
    };
  }, { team: TEAM, url: URL_SHOWN });
}

const setOv = (page, s) => page.evaluate(x => window.__vo(x), s);
const settleMap = page => page.evaluate(() => new Promise(res => {
  const m = window.__map; let k = 0; const to = setTimeout(res, 3500);
  const step = () => { if (++k < 3) return requestAnimationFrame(step); if (m.areTilesLoaded()) { clearTimeout(to); res(); } else m.once('idle', () => { clearTimeout(to); res(); }); };
  requestAnimationFrame(step);
}));

async function shot(page, hold = 1) {
  const i = n++;
  await page.screenshot({ path: name(i) });
  for (let k = 1; k < hold; k++) fs.copyFileSync(name(i), name(n++));
}

// ---------- A: globo y mapa (0–10 s), sin interfaz ----------
async function sceneMap(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('pageerror', e.message.slice(0, 120)));
  await page.goto(BASE);
  await page.waitForFunction(() => window.__map && window.__map.loaded(), null, { timeout: 60000 });
  await page.evaluate(() => document.body.classList.add('vid-clean', 'vid-nomark'));
  await installOverlay(page);
  await page.evaluate(() => { const m = window.__map; m.resize(); m.setPadding({ top: 0, bottom: 0, left: 0, right: 0 }); m.setPaintProperty('cells-fill', 'fill-opacity-transition', { duration: 0, delay: 0 }); m.setPaintProperty('borders-line', 'line-opacity-transition', { duration: 0, delay: 0 }); });
  // esperar a que lleguen las nubes de GIBS y termine su fundido
  await page.waitForFunction(() => !!window.__map.getLayer('viirs'), null, { timeout: 40000 }).catch(() => console.log('AVISO: sin capa de nubes (GIBS)'));
  await page.waitForTimeout(3500);
  const cam1 = await page.evaluate(() => window.__map.cameraForBounds([[-92.5, 7], [-77, 18.5]], { padding: { top: 150, bottom: 190, left: 760, right: 110 } }));
  const z0 = 1.9, c0 = [25, 12];
  const times = PROBE ? [0.2, 2.0, 3.6, 4.9, 6.2, 9.0] : Array.from({ length: Math.round(10 * FPS) }, (_, i) => i / FPS);
  for (const t of times) {
    let center, zoom, padTop = 0, q = 1;
    if (t <= 5) { const e = ease(t / 5); center = [lerp(c0[0], cam1.center.lng, e), lerp(c0[1], cam1.center.lat, e)]; zoom = lerp(z0, cam1.zoom, e); padTop = 0.34 * H * (1 - e); q = 0; }
    else { center = [cam1.center.lng, cam1.center.lat]; zoom = cam1.zoom + 0.16 * easeOut((t - 5) / 5); q = ease(clamp((t - 5.3) / 1.9)); }
    await page.evaluate(({ center, zoom, padTop, q, t }) => {
      const m = window.__map;
      m.jumpTo({ center, zoom, padding: { top: padTop, bottom: 0, left: 0, right: 0 } });
      m.setPaintProperty('cells-fill', 'fill-opacity', 0.86 * q); m.setPaintProperty('borders-line', 'line-opacity', q);
      document.body.classList.toggle('vid-nomark', t < 6.2); document.body.classList.toggle('vid-nolabels', t < 3.7);
    }, { center, zoom, padTop, q, t });
    await settleMap(page);
    const ov = { vig: vis(t, -1, 9.6, 0.1) * 1 };
    if (t < 5) {
      ov.vig = 1;
      const a1 = vis(t, 0.0, 2.5, 0.35), a2 = vis(t, 2.5, 5.0, 0.4);
      ov.cap = a1 > 0.001 && t < 2.5 ? { a: Math.max(a1, 0.001), k: 'NASA Space Apps Challenge 2026', t: 'Team ALTARIS', x: 110, b: 150 } : { a: Math.max(a2, 0.001), k: 'The challenge', t: 'Be An Earth System Trend Detective!', x: 110, b: 150, w: 1250 };
    } else {
      ov.vig = 1 - 0.15 * fin(t, 8, 1);
      ov.title = { a: fin(t, 5.0, 0.7), c: fin(t, 7.4, 0.6) };
    }
    await setOv(page, ov);
    await page.waitForTimeout(30);
    await shot(page);
  }
  await page.close();
}

// ---------- B: interfaz real (10–28.6 s) ----------
async function sceneUI(browser) {
  const page = await browser.newPage({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 });
  page.on('pageerror', e => console.log('pageerror', e.message.slice(0, 120)));
  await page.goto(`${BASE}&cell=${CELL}&ind=may_oct_mm&lens=agri&layer=verdict`);
  await page.waitForSelector('.verdict', { timeout: 60000 });
  await page.waitForSelector('.year-slider', { timeout: 30000 });
  await installOverlay(page);
  await page.addStyleTag({ content: '.topbar-actions .btn-ghost{display:none!important}' }); // el botón de idioma muestra «ES»: el video es solo en inglés
  await page.evaluate(() => document.documentElement.style.setProperty('--vz', '0.8'));
  await page.waitForTimeout(4500);
  const info = await page.evaluate(() => {
    const p = document.querySelector('.workspace-panel'); const top = el => el ? p.scrollTop + el.getBoundingClientRect().top - p.getBoundingClientRect().top : 0;
    const q = s => document.querySelector(s);
    return { series: top(q('[data-tour="series"]')), compare: top(q('[data-tour="compare"]')), passport: top(q('[data-tour="passport"]')), max: p.scrollHeight - p.clientHeight };
  });
  console.log('desplazamientos del panel', JSON.stringify(info));
  const setScroll = y => page.evaluate(v => { document.querySelector('.workspace-panel').scrollTop = v; }, y);
  const setEnd = v => page.evaluate(val => {
    const el = document.querySelector('.year-slider input[type=range][aria-label="End year"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(Math.round(val))); el.dispatchEvent(new Event('input', { bubbles: true }));
  }, v);
  const hi = (sel, on) => page.evaluate(([s, o]) => { const e = document.querySelector(s); (e?.closest('.table-scroll') || e?.closest('.card') || e)?.classList.toggle('vid-hi', o); }, [sel, on]);
  const capUi = (t, a, b, k, txt, w = 720) => { const a_ = vis(t, a, b, 0.4); return a_ > 0.001 ? { a: a_, ui: true, k, t: txt, x: 345, y: 92, w } : null; };

  const seg = (t0, t1) => { const out = []; for (let t = t0; t < t1 - 1e-9; t += 1 / FPS) out.push(t); return out; };
  const marks = PROBE ? [10.5, 15.0, 17.8, 21.0, 24.0] : null;
  async function renderAt(t) {
    let y = info.series, end = 2024, h1 = false, h2 = false;
    if (t < 11.5) y = 0;
    else if (t < 12.7) y = lerp(0, info.series, ease((t - 11.5) / 1.2));
    else if (t < 18.0) y = info.series;
    else if (t < 19.2) y = lerp(info.series, info.compare - 95, ease((t - 18) / 1.2));
    else if (t < 23.0) y = info.compare - 95;
    else y = lerp(info.compare - 95, Math.min(info.passport, info.max), ease(clamp((t - 23) / 1.2)));
    if (t >= 13.3 && t < 16.8) end = lerp(2024, 2010, ease((t - 13.3) / 3.5)); else if (t >= 16.8) end = 2010;
    h1 = t >= 19.2 && t < 22.8; h2 = t >= 24.2;
    await setScroll(y); await setEnd(end); await hi('[data-tour="compare"]', h1); await hi('[data-tour="passport"]', h2);
    let cap = capUi(t, 10.2, 13.2, 'Open any place', '24 years of NASA satellite rainfall, one square at a time.') || capUi(t, 13.2, 18.0, 'Change the years', 'The same place tells a different story.') || capUi(t, 18.3, 23.0, 'Read the evidence', 'A weak signal is not a confirmed change.') || capUi(t, 23.0, 25.5, 'Audit it', 'Every result ships with an evidence passport.');
    await setOv(page, { cap: cap || undefined, end: fin(t, 25.4, 0.6) });
    await page.waitForTimeout(t >= 13.3 && t < 17 ? 260 : 120);
  }
  if (PROBE) { for (const t of marks) { await renderAt(t); await shot(page); } }
  else {
    // tramos quietos: un solo cuadro repetido; tramos con movimiento: un cuadro por instante
    const still = (a, b) => renderAt(a).then(() => shot(page, Math.round((b - a) * FPS)));
    await still(10.0, 11.5);
    for (const t of seg(11.5, 12.7)) { await renderAt(t); await shot(page); }
    await still(12.7, 13.3);
    for (const t of seg(13.3, 16.8)) { await renderAt(t); await shot(page); }
    await still(16.8, 18.0);
    for (const t of seg(18.0, 19.2)) { await renderAt(t); await shot(page); }
    await still(19.2, 23.0);
    for (const t of seg(23.0, 24.2)) { await renderAt(t); await shot(page); }
    await still(24.2, 25.4);
    for (const t of seg(25.4, 26.0)) { await renderAt(t); await shot(page); }
    await still(26.0, TOTAL);
  }
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'], proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined });
  const t0 = Date.now();
  if (ONLY !== 'ui') { await sceneMap(browser); console.log('escena mapa lista:', n, 'cuadros,', Math.round((Date.now() - t0) / 1000), 's'); }
  if (ONLY !== 'map') await sceneUI(browser);
  console.log('listo:', n, 'cuadros,', Math.round((Date.now() - t0) / 1000), 's');
  await browser.close();
})();
