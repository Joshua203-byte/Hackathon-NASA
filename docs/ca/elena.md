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
- [x] Publicar en `altaris-ca`. **Hecho por Izel** (versión `b15837db`, ver `docs/ca/izel.md`). Tras el GO, producción ya sirve los 7 países.
- [x] Medir en la URL de producción cuánto tarda hasta poder tocar una celda, sin contar la intro. **Hecho (ver «Carga hasta poder tocar una celda»): cumple <3 s en escritorio y celular con red normal; en 4G queda en 3,2 s.**
- [ ] Prueba en **celular real** (con Izel) y en otro dispositivo si hay. Pasos en «Prueba en celular real»: **falta anotar el resultado**.

## Carga hasta poder tocar una celda (producción, 15 nov, tarde)

URL: <https://altaris.altaris-panel-rol5.workers.dev> (7 países, 4 332 celdas, `observed`, con la entrada espacial). Chrome sin caché, **3 corridas por perfil, mediana**, con `?intro=0` para que la animación de entrada no cuente. El cronómetro arranca al pedir la página. El script toca una celda de Nicaragua cada 100 ms hasta que el mapa acepta el toque, y luego espera a que el panel muestre el veredicto.

| Perfil | Mapa visible | **Toque aceptado** | Panel con veredicto | ¿<3 s? |
|---|---:|---:|---:|---|
| Escritorio 1440×900, red normal | 1,5 s | **2,1 s** | 2,3 s | Sí |
| Celular (Pixel 7 emulado), red normal | 1,4 s | **2,3 s** | 2,5 s | Sí |
| Celular, 4G (9 Mbps, 85 ms) | 2,2 s | **3,2 s** | 3,4 s | No, por 0,2 s |
| Celular, 4G lenta (1,6 Mbps, 150 ms) y CPU ×4 | 9,7 s | **11,8 s** | 15,0 s | No |

- **Casi 1 s entre «mapa visible» y «toque aceptado» en todos los perfiles.** Es el encuadre animado que hace la cámara al quedar lista: `fitBounds(..., { duration: 900 })` en `RegionMap.tsx` (efecto de `selected`, cuando no hay celda elegida). Mientras se mueve, el mismo punto cae sobre celdas distintas. Si se quiere ganar ese segundo (y cumplir en 4G), basta con que el primer encuadre sea `duration: 0`. Las animaciones al elegir una celda o al pulsar «Centrar región» se quedan igual. **No lo cambié:** después del GO el código lo integra Joshua, y la decisión sobre la intro es suya.
- La 4G lenta con CPU ×4 simula un teléfono modesto en mala señal. Ahí pesa la descarga (el globo, las teselas de la Tierra y `grid.json`, de 474 KB comprimido). La versión de 3 países tampoco cumplía en 4G lenta (5,2 s según Izel).
- `scripts/smoke-ca.mjs` contra producción: 28/28 celdas, casos 1–3 en escritorio y teléfono, 0 errores, código 0. **Corregí el filtro del favicon** que señaló Izel: ahora mira la dirección del recurso, no solo el texto del mensaje.
- Simulado no es real: la GPU de un teléfono real puede ir más lenta o más rápida con el globo. Por eso falta la prueba de abajo.

### Cambio de una celda a otra

Ya con el mapa cargado: se toca una celda y luego otra vecina, y se cronometra desde el segundo toque hasta que el panel muestra el veredicto **de la celda nueva** (su código en pantalla). Son 4 cambios por perfil, sin caché, así que cada cambio descarga su `cells/{id}.json`.

| Perfil | Mediana | Máximo |
|---|---:|---:|
| Escritorio 1440×900, red normal | 0,34 s | 0,53 s |
| Celular (Pixel 7 emulado), red normal | 0,35 s | 0,35 s |
| Celular, 4G (9 Mbps, 85 ms) | 0,20 s | 0,29 s |

**En celular real (Elena):** al ubicarse en una zona del mapa y pasar a otra, los datos cambian muy rápido. Coincide con lo medido. El vuelo de la cámara hacia la celda nueva (1,4 s) es animación: el panel se actualiza antes de que termine.

## Prueba en celular real (Elena con Izel)

En cada dispositivo, con datos móviles (no wifi) si se puede:

1. Abre una pestaña **de incógnito** (así no hay caché y la intro sale como la verá un visitante nuevo).
2. Entra a <https://altaris.altaris-panel-rol5.workers.dev/?intro=0> y cronometra desde que pulsas «Ir» hasta que tocar una celda abre su panel. Repite 3 veces, cerrando la pestaña de incógnito entre corridas.
3. Abre la URL **sin** `?intro=0`. Comprueba que el vuelo se ve fluido, que «Saltar» funciona y que al terminar se puede tocar una celda sin esperar.
4. Revisa los casos 1, 2 y 3 desde la lista «O empieza con un ejemplo», el botón EN y que el texto se lea sin acercar la pantalla.
5. Anota aquí el modelo del teléfono, el navegador, la red y los 3 tiempos.

| Dispositivo | Navegador | Red | Tiempos hasta tocar (s) | Intro fluida | Casos y EN | Notas |
|---|---|---|---|---|---|---|
| _(celular de Izel)_ | | | | | | |
| _(celular de Elena)_ | | | | | | |
| _(otro: tableta o computadora)_ | | | | | | |

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
