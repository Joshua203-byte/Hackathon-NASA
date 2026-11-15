# Elena · Rol 4 · Mapa y despliegue · Centroamérica

**Rama:** `ca/elena-mapa-despliegue`  ·  **Hora meta:** 12:15  ·  Plan completo: [docs/10-centroamerica.md](../10-centroamerica.md)

```bash
git fetch origin
git checkout ca/elena-mapa-despliegue
```

## Reglas

- Subes **solo a `ca/elena-mapa-despliegue`**. No hagas `push` a `main` ni a la rama de otra persona.
- Tocas **solo tus archivos**: `rol5-panel-app/src/panel/components/RegionMap.tsx`, `src/panel/mapLayers.ts`; `wrangler.ca.jsonc`, `public/_headers`, script `deploy:ca` de `package.json`; `docs/ca/elena.md`.
- No subas el JSON grande (~300 MB): se entrega como `.zip` por el chat.
- Datos simulados para trabajar ya: `cd pipeline && python make_ca_mock.py --out /tmp/ca-mock --stride 12`.
- Commits pequeños, uno por cambio, con el porqué en el mensaje.

## Mi lista

- [x] Cargar `make_ca_mock.py` en el mapa y revisar la cámara (encuadre lat 7–18,5 y lon −92,5 a −77, límites, zoom con el panel abierto). **Hecha, con un arreglo** (ver reporte).
- [x] Medir la carga de `grid.json` y la fluidez con ~4 300 celdas. Meta: menos de 3 s. **Medida con 4 784 celdas: cumple en conexión normal (1,3 s), no en 4G lenta (6,3 s).**
- [x] Crear `wrangler.ca.jsonc` (Worker `altaris-ca`, no producción) y `npm run deploy:ca`; probar con 4 400 archivos. **Hecho: 4 814 archivos aceptados.**
- [x] Con el JSON real: compilar y probar la vista previa. **Hecho con el `.zip` oficial de Joshua (C2): compila y pasa la prueba de humo en local (ver «JSON oficial»).**
- [ ] Publicar en `altaris-ca`, medir la carga en la URL, probar en teléfono real y pasar la URL a Andrés y Camila (C4). **Pasa a Izel:** solo su cuenta tiene acceso a Cloudflare. Pasos en «Para Izel: publicar la vista previa».

## Para Izel: publicar la vista previa

Desde `rol5-panel-app`, en la rama `ca/elena-mapa-despliegue` (o en `ca/integracion`), con la carpeta descomprimida de `altaris_ca_json.zip`:

```bash
npm ci                                                   # si falta alguna dependencia (p. ej. @fontsource-variable/inter)
npx wrangler whoami                                      # tu sesión de Cloudflare
CA_DATA_DIR=<carpeta del zip>/data npm run deploy:ca     # compila dist-ca y publica en el Worker altaris-ca (no toca producción)
BASE_URL=https://altaris-ca.altaris-panel-rol5.workers.dev node scripts/smoke-ca.mjs
```

- `deploy:ca` debe decir `4364 archivos`, `4332 celdas`, 7 países y `data_kind: observed`. Si dice `mock` o cuenta otra cifra, la carpeta no es la del zip oficial.
- La subida tardó ~200 s con 4 814 archivos simulados.
- `smoke-ca.mjs` sale con 0 si todo pasa. Los tiempos de `loads[].ms` son la medida de la condición 5 del GO (meta: menos de 3 s). En local dieron 0,6 a 1,9 s.
- Después: abrir la URL en un teléfono real, anotar el resultado aquí y pasar la URL a Andrés y Camila.
- Producción (`npm run deploy`) **no** se toca hasta el GO.

## Reporte

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| **Cámara.** Generé el simulado (399 celdas con `--stride 12` y 4 784 con `--stride 1`) y lo serví con CORS para el panel (`VITE_DATA_BASE_URL`). Medí con Chrome real (`playwright-core`) en 1440×900, 1366×768, 1920×1080 y teléfono 390×844. Cambié los márgenes de `maxBounds` en `RegionMap.tsx` | **Problema:** con 7 países el tope de arrastre (6° fijo) impedía dejar el margen de la tarjeta de la izquierda y **9 de las 80 celdas de Guatemala quedaban tapadas** en la vista inicial. **Arreglo:** margen = el mayor entre el anterior (6° y 4°) y uno proporcional al encuadre (10,8° y 4° en CA; producción queda igual o más holgada). **Después:** 399/399 celdas visibles en los 3 tamaños. Al elegir una celda, las 14 probadas (extremos de cada país, incl. Panamá este y Belice norte) quedan centradas en la zona libre de tarjeta y panel. Teléfono: 7 países, sin scroll horizontal | Teléfono **real**. La forma de BLZ, NIC, CRI y PAN en el simulado son rectángulos aproximados: la cámara se vuelve a mirar con el JSON real |
| **Rendimiento.** Medí la vista previa publicada (`altaris-ca`, 4 784 celdas) y producción (2 025) con Chrome, 3 corridas, caché apagada, desde el navegador hasta que desaparece «Cargando mapa…» | **Conexión normal:** CA 1,3 s (0,9–2,0) frente a 0,94 s en producción: **cumple <3 s**. **4G lenta simulada** (1,6 Mbps, 170 ms): CA 6,3 s frente a 5,0 s en producción: **no cumple, pero producción tampoco**. **3G** (400 kbps): CA 22,8 s. `grid.json`: 3,7 MiB → 451 KB comprimido (producción 218 KB). Fluidez al arrastrar y acercar con 4 784 celdas: cuadros de ~7 ms, máximo 7,2 ms (Chrome sin GPU, indicativo) | Reducir bytes si se quiere cumplir <3 s en 4G lenta: lo que pesa es ~0,8 MB comprimidos (datos `grid.json` + código del mapa). Cargar el código del mapa en paralelo con los datos está en `Shell.tsx` (de Izel); ahorraría latencias, no ancho de banda |
| **Worker aparte.** `wrangler.ca.jsonc` (nombre `altaris-ca`), `npm run deploy:ca`, `scripts/build-ca.mjs`, y `dist-ca`, `ca-data`, `.env.local` en `.gitignore`. El script compila a `dist-ca` (no toca `dist`), **no copia los 145 MB de `public/data` de producción**, valida que `cells/` coincida con `grid.json` y avisa si los datos son simulados o si faltan los bordes de 7 países | Publiqué con las 4 784 celdas simuladas: **4 814 archivos aceptados (límite gratis 20 000; el mayor, 3,7 MiB de 25), 192 s de subida, 201 s en total**. URL: <https://altaris-ca.altaris-panel-rol5.workers.dev> (**datos SIMULADOS, con el aviso de DEMOSTRACIÓN: no usar con personas**). Producción intacta: sigue sirviendo `index-CCGoe2lk.js` y 2 025 celdas. Compilé sin `.env.local` y sin direcciones locales en el JS | Con el JSON real: `CA_DATA_DIR=<carpeta del zip> npm run deploy:ca` (necesita `wrangler login` y `CLOUDFLARE_ACCOUNT_ID`; solo la cuenta de Izel tiene sesión). Los **bordes de BLZ, NIC, CRI y PAN** salen de `data/ca/rol1/borders.geojson` (David, C1): el script los toma de esa ruta o de `CA_BORDERS`; hoy cae a los 3 países y lo avisa |
| **Ensayo con datos reales (local, 11:15).** Con los CSV reales de David (C1) corrí en local los comandos de Joshua (`06_enso.py`, `run_pilot.py`, referencias y `add_secondary.py`): **5 min 32 s** con 16 núcleos, 4 332 celdas. Compilé `dist-ca` con `scripts/build-ca.mjs` y los **bordes reales de 7 países** (`data/ca/rol1/borders.geojson`). **No se publicó nada**: el JSON oficial es el de Joshua | `build-ca.mjs`: 4 364 archivos (límite 20 000), mayor 3,4 MiB; `data_kind: observed`, sin aviso de DEMOSTRACIÓN. `grid.json` 3,4 MiB → 474 KB comprimido. Chrome sin caché, servido en local: **0 errores y 0 scroll horizontal** en 1366, 1440, 1920 y teléfono 390×844; el texto de entrada nombra los 7 países; **las 7 fronteras se dibujan** y el encuadre inicial muestra toda la región sin quedar celdas bajo la tarjeta. Abrí **28 celdas** (extremo norte, sur, este y oeste de cada país, p. ej. Panamá este N0795W07725 y Belice norte N1845W08835): 28/28 abren su panel y quedan a la vista. Casos 1, 2 y 3 en escritorio y teléfono: sin errores | Publicar: `CA_DATA_DIR=<carpeta del zip de Joshua> npm run deploy:ca` desde la sesión de Izel. Prueba en teléfono real |
| **Aviso para Joshua (GO/NO-GO).** Con ese resultado local corrí `compare_regions.py` contra producción | **Condición 2: OK.** 29 cambios de veredicto (todos `limitada` → `consistente`, en GTM), los 29 explicados por el FDR; los 3 casos conservan su veredicto. **Condición 1: FALLA en 8 celdas**, todas por `jul_aug_mm.enso_test.survives` (de `false` a `true`). **No es por la región:** en esas celdas la pendiente sin años de ENSO fuerte es exactamente 0 (p = 1,0) y sale como `0.0` en producción y `-0.0` aquí. `altaris/enso.py` (línea ~109) usa `math.copysign(1, a)`, que da +1 para `0.0` y −1 para `-0.0`, así que un cero «conserva el signo» o no según el ruido de redondeo de cada máquina. Ningún veredicto cambia por esto | Decisión de Joshua (`pipeline/` es suyo): tratar una pendiente 0 como sin signo (`sg_a = 0 if a == 0 else copysign(1, a)`), que deja `survives = false` como ya está publicado, y volver a comparar. Con el JSON oficial puede salir igual o no, según la máquina. **Resuelto por Joshua** (`597dc8d`, `slope + 0.0`): lo volví a correr yo con `compare_regions.py` de su rama, JSON oficial contra producción: **condición 1 OK y condición 2 OK** (2 025 celdas comunes idénticas, código de salida 0) |
| **JSON oficial de Joshua (C2).** Descomprimí `altaris_ca_json.zip` y compilé `dist-ca` con `CA_DATA_DIR=<carpeta del zip>/data node scripts/build-ca.mjs` y los bordes de 7 países de David | **Es el oficial:** `meta.json`, `grid.json`, `reasons.json`, `verdict_summary.csv` idénticos byte a byte a `data/ca/json-light/` de `ca/joshua-motor`, y `enso.json` idéntico a `data/ca/rol3/enso.json`. 4 332 celdas (NIC 1 076, HND 939, GTM 917, PAN 614, CRI 425, BLZ 192, SLV 169), 4 332 archivos en `cells/` sin faltantes ni sobrantes, 0 `NaN`, `data_kind: observed`, commit `7e93e46`. **Compilado:** 4 364 archivos (límite 20 000), el mayor 3,4 MiB. **Chrome, sin caché, en local:** 0 errores de consola; sin scroll horizontal en 1440, 1366 y teléfono 390×844; sin aviso de DEMOSTRACIÓN; la entrada nombra los países nuevos. **28 celdas** (extremos N, S, E y O de cada país): 28/28 abren su panel con veredicto. **Casos 1, 2 y 3** en escritorio y teléfono: 6/6. Todo con `scripts/smoke-ca.mjs`, nuevo y reutilizable contra la URL (`BASE_URL`) | Publicar, medir en la URL y probar en teléfono real: **Izel** (ver «Para Izel»). Yo no tengo acceso a Cloudflare |

**Para quien integre (Joshua):** `scripts/build-ca.mjs`, `wrangler.ca.jsonc` y el cambio de `maxBounds` entran con `ca/elena-mapa-despliegue`. Al pasar a producción solo se usa `npm run deploy` (no `deploy:ca`) con los datos de 7 países en `public/data/` y `public/geo/borders.geojson` de David. No se commitea ningún JSON grande.

**Aparte, sin urgencia:** el navegador pide `/favicon.ico` y da 404 (`index.html` no declara icono). Ya pasaba antes; no afecta nada.
