// Rol 4 · Compila la vista previa de Centroamérica en ./dist-ca (nunca toca ./dist, que es producción).
//
//   CA_DATA_DIR=<carpeta con meta.json, grid.json y cells/>  npm run deploy:ca
//
// - Los datos de producción (public/data, ~145 MB) NO se copian: se usa solo CA_DATA_DIR (por defecto ./ca-data).
// - Bordes: CA_BORDERS, o ../data/ca/rol1/borders.geojson (David, C1) si existe; si no, los de 3 países con un aviso.
// - tour/glossary/decision_rules: los de CA_DATA_DIR si vienen; si no, los de public/data.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { build } from 'vite';

const root = process.cwd();
const out = resolve(root, 'dist-ca');
const dataDir = resolve(root, process.env.CA_DATA_DIR || 'ca-data');
const fail = msg => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

for (const f of ['meta.json', 'grid.json']) if (!existsSync(join(dataDir, f))) fail(`Falta ${join(dataDir, f)}. Define CA_DATA_DIR con la carpeta del .zip de Joshua (meta.json, grid.json, cells/).`);
if (!existsSync(join(dataDir, 'cells'))) fail(`Falta ${join(dataDir, 'cells')}.`);
const meta = JSON.parse(readFileSync(join(dataDir, 'meta.json'), 'utf8'));
const cells = JSON.parse(readFileSync(join(dataDir, 'grid.json'), 'utf8')).cells ?? fail('grid.json no trae "cells".');
const files = readdirSync(join(dataDir, 'cells')).filter(f => f.endsWith('.json'));
if (files.length !== cells.length) fail(`grid.json tiene ${cells.length} celdas pero cells/ trae ${files.length} archivos.`);
const countries = [...new Set(cells.map(c => c.country))].sort();
const lat = meta.bbox?.lat, lon = meta.bbox?.lon;
if (!lat || !lon) fail('meta.json no trae bbox.');

await build({ publicDir: false, logLevel: 'warn', build: { outDir: out, emptyOutDir: true } });

cpSync(join(root, 'public', '_headers'), join(out, '_headers'));
cpSync(dataDir, join(out, 'data'), { recursive: true });
for (const f of ['tour.json', 'glossary.json', 'decision_rules.json']) {
  if (!existsSync(join(out, 'data', f))) { cpSync(join(root, 'public', 'data', f), join(out, 'data', f)); console.warn(`! ${f} no venía en CA_DATA_DIR: se usó el de public/data`); }
}
cpSync(join(root, 'public', 'data', 'pilot'), join(out, 'data', 'pilot'), { recursive: true }); // enlace «Piloto real · Choluteca»
mkdirSync(join(out, 'geo'), { recursive: true });
const borders = process.env.CA_BORDERS ? resolve(root, process.env.CA_BORDERS) : resolve(root, '..', 'data', 'ca', 'rol1', 'borders.geojson');
if (existsSync(borders)) cpSync(borders, join(out, 'geo', 'borders.geojson'));
else { cpSync(join(root, 'public', 'geo', 'borders.geojson'), join(out, 'geo', 'borders.geojson')); console.warn('! Sin borders.geojson de 7 países: se usó el de 3. Los países nuevos saldrán sin borde.'); }

const count = dir => readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(join(dir, e.name)) : 1), 0);
const biggest = dir => readdirSync(dir, { withFileTypes: true }).reduce((m, e) => Math.max(m, e.isDirectory() ? biggest(join(dir, e.name)) : statSync(join(dir, e.name)).size), 0);
console.log(`\n✓ dist-ca listo: ${count(out)} archivos (límite gratis 20 000), el más grande ${(biggest(out) / 2 ** 20).toFixed(1)} MiB (límite 25).`);
console.log(`  ${cells.length} celdas · países: ${countries.join(', ')} · bbox lat ${lat.join('…')} lon ${lon.join('…')}`);
console.log(`  data_kind: ${meta.data_kind} · pipeline_commit: ${meta.pipeline_commit}`);
if (meta.data_kind !== 'observed') console.warn('  ⚠ DATOS SIMULADOS: la vista previa mostrará el aviso de DEMOSTRACIÓN. No es para pruebas con personas.');
