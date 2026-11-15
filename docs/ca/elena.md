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
- [ ] Con el JSON real: desplegar la vista previa, probar en teléfono y pasar la URL a Izel, Andrés y Camila. **Falta: espera el `.zip` de Joshua (C2).**

## Reporte

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| **Cámara.** Generé el simulado (399 celdas con `--stride 12` y 4 784 con `--stride 1`) y lo serví con CORS para el panel (`VITE_DATA_BASE_URL`). Medí con Chrome real (`playwright-core`) en 1440×900, 1366×768, 1920×1080 y teléfono 390×844. Cambié los márgenes de `maxBounds` en `RegionMap.tsx` | **Problema:** con 7 países el tope de arrastre (6° fijo) impedía dejar el margen de la tarjeta de la izquierda y **9 de las 80 celdas de Guatemala quedaban tapadas** en la vista inicial. **Arreglo:** margen = el mayor entre el anterior (6° y 4°) y uno proporcional al encuadre (10,8° y 4° en CA; producción queda igual o más holgada). **Después:** 399/399 celdas visibles en los 3 tamaños. Al elegir una celda, las 14 probadas (extremos de cada país, incl. Panamá este y Belice norte) quedan centradas en la zona libre de tarjeta y panel. Teléfono: 7 países, sin scroll horizontal | Teléfono **real**. La forma de BLZ, NIC, CRI y PAN en el simulado son rectángulos aproximados: la cámara se vuelve a mirar con el JSON real |
| **Rendimiento.** Medí la vista previa publicada (`altaris-ca`, 4 784 celdas) y producción (2 025) con Chrome, 3 corridas, caché apagada, desde el navegador hasta que desaparece «Cargando mapa…» | **Conexión normal:** CA 1,3 s (0,9–2,0) frente a 0,94 s en producción: **cumple <3 s**. **4G lenta simulada** (1,6 Mbps, 170 ms): CA 6,3 s frente a 5,0 s en producción: **no cumple, pero producción tampoco**. **3G** (400 kbps): CA 22,8 s. `grid.json`: 3,7 MiB → 451 KB comprimido (producción 218 KB). Fluidez al arrastrar y acercar con 4 784 celdas: cuadros de ~7 ms, máximo 7,2 ms (Chrome sin GPU, indicativo) | Reducir bytes si se quiere cumplir <3 s en 4G lenta: lo que pesa es ~0,8 MB comprimidos (datos `grid.json` + código del mapa). Cargar el código del mapa en paralelo con los datos está en `Shell.tsx` (de Izel); ahorraría latencias, no ancho de banda |
| **Worker aparte.** `wrangler.ca.jsonc` (nombre `altaris-ca`), `npm run deploy:ca`, `scripts/build-ca.mjs`, y `dist-ca`, `ca-data`, `.env.local` en `.gitignore`. El script compila a `dist-ca` (no toca `dist`), **no copia los 145 MB de `public/data` de producción**, valida que `cells/` coincida con `grid.json` y avisa si los datos son simulados o si faltan los bordes de 7 países | Publiqué con las 4 784 celdas simuladas: **4 814 archivos aceptados (límite gratis 20 000; el mayor, 3,7 MiB de 25), 192 s de subida, 201 s en total**. URL: <https://altaris-ca.altaris-panel-rol5.workers.dev> (**datos SIMULADOS, con el aviso de DEMOSTRACIÓN: no usar con personas**). Producción intacta: sigue sirviendo `index-CCGoe2lk.js` y 2 025 celdas. Compilé sin `.env.local` y sin direcciones locales en el JS | Con el JSON real: `CA_DATA_DIR=<carpeta del zip> npm run deploy:ca` (necesita `wrangler login` y `CLOUDFLARE_ACCOUNT_ID`; solo la cuenta de Izel tiene sesión). Los **bordes de BLZ, NIC, CRI y PAN** salen de `data/ca/rol1/borders.geojson` (David, C1): el script los toma de esa ruta o de `CA_BORDERS`; hoy cae a los 3 países y lo avisa |

**Para quien integre (Joshua):** `scripts/build-ca.mjs`, `wrangler.ca.jsonc` y el cambio de `maxBounds` entran con `ca/elena-mapa-despliegue`. Al pasar a producción solo se usa `npm run deploy` (no `deploy:ca`) con los datos de 7 países en `public/data/` y `public/geo/borders.geojson` de David. No se commitea ningún JSON grande.

**Aparte, sin urgencia:** el navegador pide `/favicon.ico` y da 404 (`index.html` no declara icono). Ya pasaba antes; no afecta nada.
