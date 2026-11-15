# Izel · Rol 5 · Panel · Centroamérica

**Rama:** `ca/izel-panel`  ·  **Hora meta:** 11:30 con simulados · 12:30 con reales  ·  Plan completo: [docs/10-centroamerica.md](../10-centroamerica.md)

```bash
git fetch origin
git checkout ca/izel-panel
```

## Reglas

- Subes **solo a `ca/izel-panel`**. No hagas `push` a `main` ni a la rama de otra persona.
- Tocas **solo tus archivos**: `rol5-panel-app/src/**` (excepto `RegionMap.tsx` y `mapLayers.ts`, que son de Elena); `rol5-panel-app/e2e/**`; `rol5-panel-app/public/data/{tour,glossary,decision_rules}.json`; `docs/ca/izel.md`.
- No subas el JSON grande (~300 MB): se entrega como `.zip` por el chat.
- Datos simulados para trabajar ya: `cd pipeline && python make_ca_mock.py --out /tmp/ca-mock --stride 12`.
- Commits pequeños, uno por cambio, con el porqué en el mensaje.

## Mi lista

- [x] Recorrer todas las pantallas con celdas de Belice, Nicaragua, Costa Rica y Panamá (datos simulados): panel, comparador, ENSO, pasaporte, recorrido, `?case=1..3` y teléfono. **Hecha, con un arreglo.**
- [x] Corregir textos que supongan «solo Honduras» o «3 países» (tarjetas, recorrido, glosario). **Revisados: solo había un fallo (el nombre del país), ya corregido.**
- [x] Escribir `e2e/ca-mock.mjs` (carga, clic en una celda de cada país, pasaporte con el país correcto, sin errores de consola). **Hecho: 17 comprobaciones.**
- [x] Con el JSON real (zip de Joshua, 4 332 celdas, commit del motor `7e93e46`): repetir `real-cases.mjs` y `ca-mock.mjs`. **Hecho en local con esos mismos datos: 17 + 9 comprobaciones.**
- [x] Repetir las dos con `BASE_URL` contra la vista previa. **Hecho: Izel la publicó desde su cuenta de Cloudflare; 17 + 9 comprobaciones pasan contra la URL.**
- [ ] Probar la URL en un teléfono real y pasarla a Andrés y Camila. **Falta: lo hace Izel con el teléfono.**
- [x] Opcional: resumen de veredictos por país. **Hecho como tabla (abajo), no como pantalla nueva.**

## Reporte

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| **Arreglo:** el panel de celda mostraba el código ISO en vez del nombre del país (`BLZ · 18.15°N…` en lugar de `Belice · …`) para Belice, Nicaragua, Costa Rica y Panamá. `CellPanel.tsx` buscaba en `COUNTRY` (solo 3 países) en vez de `countryName`, que ya conoce los 7. Prueba unitaria nueva en `panel.test.ts` | Lo encontró `ca-mock.mjs` antes del arreglo: falló en la primera celda de Belice. Después del arreglo pasa en los 7 países, en español e inglés (Belize, Panama). 47 pruebas unitarias; `real-cases.mjs` con los datos de producción sigue pasando | — |
| **`e2e/ca-mock.mjs`.** Sirve `dist` en un servidor local y toma `/data` de la carpeta de `make_ca_mock.py` (`CA_MOCK_DIR`), o corre contra una URL (`BASE_URL`). Pasa el ratón por el mapa leyendo el tooltip hasta encontrar una celda de cada país, hace clic, y revisa el panel, el veredicto contra `grid.json`, la serie, el pasaporte JSON y Markdown, el comparador entre Panamá y Belice, ENSO en los 4 países nuevos, el recorrido, `?case=1..3` y el teléfono | **17 comprobaciones** con el simulado completo (4 784 celdas, `--stride 1`). Sin errores de consola ni de página (se ignora el 404 de `favicon.ico`). Teléfono 390×844 sin desbordamiento. Los casos 1–3 se omiten con aviso si el simulado no trae sus celdas (ocurre con `--stride 12`) | Repetirla con `BASE_URL` apuntando a la vista previa real |
| **Revisión de textos.** Busqué en `src/**`, `tour.json`, `glossary.json`, `decision_rules.json` y `index.html` menciones a Honduras, Guatemala, El Salvador, «tres países», Pacífico, Caribe, etc. | No hay otro texto que suponga una región. «Un caso real de Honduras» (recorrido) es correcto: el caso 2 es una celda de Honduras. «Uno de los tres ejemplos» son los 3 casos, que siguen siendo 3. El glosario habla del Pacífico tropical por ENSO, que es correcto | **Para Camila:** el panel dice «mayo–octubre» para la temporada de lluvia en los 7 países. En Costa Rica, Panamá y Belice la temporada lluviosa cambia por vertiente; su texto de limitaciones ya lo cubre, pero no el rótulo del indicador |

### Con los datos reales de Centroamérica (zip de Joshua)

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| Guardé el zip en `data/ca/json-full/` y lo descomprimí en `extraido/`. **No se versiona**: está en `.git/info/exclude` de mi copia. Los CSV de CA salen de `ca/integracion` con `git archive` (a `csv/`), sin cambiar de rama | El zip tiene 4 340 entradas (4 332 celdas + 8 archivos), solo `.json` y un `.csv`, sin rutas raras. `meta.json`: `data_kind observed`, DOI `10.5067/GPM/IMERG/3B-MONTH/07`, `pipeline_commit 7e93e46`. `grid.json` y `cells/` tienen los mismos 4 332 ids. `tour`, `glossary`, `decision_rules`, `reasons` y `enso` son idénticos a los del repo | — |
| **`ca-mock.mjs` con datos reales:** `CA_MOCK_DIR=data/ca/json-full/extraido node e2e/ca-mock.mjs` | **17 comprobaciones pasan**: los 7 países, clic en el mapa en una celda de cada uno, panel con el nombre del país, pasaporte, comparador, ENSO, recorrido, `?case=1..3`, teléfono, sin errores de consola | Con `BASE_URL` cuando Elena publique |
| **`real-cases.mjs` parametrizado** (`DATA_DIR`, `ROL1_DIR`, `ROL3_DIR`; sin variables hace lo mismo que antes). Lo corrí con `DATA_DIR=…/extraido/data ROL1_DIR=…/csv/data/ca/rol1 ROL3_DIR=…/csv/data/ca/rol3` | **9 combinaciones pasan** (3 casos × 3 indicadores): CSV → JSON → pantalla → pasaportes ES/EN, más el recorrido y el móvil. La corrida por defecto con los datos de producción también pasa (commit `a7a5b18`) | — |
| **Cotejo con producción** (2 025 celdas de GTM, SLV, HND) | Las pendientes son idénticas en las 2 025. Los 3 casos conservan su veredicto; cambia el p ajustado (caso 1: 0,879→0,874; caso 2: 0,781→0,737; caso 3: 0,032→0,024). **Pero 27 celdas de Guatemala cambian de `limitada` a `consistente`** (14 en temporada, 15 en anual): el FDR ahora se calcula entre más celdas. Guatemala pasa de 44 a 58 celdas consistentes en temporada. Honduras y El Salvador siguen en 0 | **Para Joshua y Camila:** «lo ya publicado no cambió» es cierto para pendientes, los 3 casos, Honduras y El Salvador, pero no para esas 27 celdas de Guatemala |
| **Textos con la versión de 7 países** | Ningún texto del panel trae cifras ni p-valores escritos a mano, así que nada queda desactualizado (el p del caso 3 sale del JSON). El titular de «consistente» distingue el signo («subiendo» en Panamá) | **Para Camila:** hay bloques grandes de celdas consistentes fuera de Guatemala (Costa Rica 80, Panamá 42, Nicaragua 15). La salvedad de la franja (pocos pluviómetros, posible artefacto del satélite) solo está en el texto del caso 3. **Y no todas bajan:** en temporada, Panamá tiene 34 que bajan y 8 que suben, y Nicaragua 13 y 2 |

### Publicación de la vista previa (desde la cuenta de Cloudflare de Izel)

URL: <https://altaris-ca.altaris-panel-rol5.workers.dev> · versión de Cloudflare `b15837db-a1e0-441d-9c00-8281e6cd4e18`.

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| Publiqué con `CA_DATA_DIR=<zip>/data CA_BORDERS=<bordes de David> npm run deploy:ca`. Compilé en una copia temporal de `git worktree` con **la rama de Elena + `ca/izel-panel` unidas** (el arreglo del nombre del país es de Izel y los scripts de despliegue de Elena), sin empujar nada a ninguna rama; ya la borré. Los bordes de los 7 países son los de David (`ca/david-datos`, idénticos a los de `ca/integracion`) | 4 364 archivos (límite gratis 20 000), el mayor 3,4 MiB, `data_kind observed`, commit del motor `7e93e46`, 187 s de subida. **Producción intacta** antes y después: `index-CCGoe2lk.js` y 2 025 celdas. `wrangler whoami`: sesión abierta con permiso de Workers | La versión oficial para el GO sale de `ca/integracion`; esta vista previa es una combinación temporal |
| **`scripts/smoke-ca.mjs`** contra la URL | **28/28 celdas** (extremos de cada país) abren su panel con veredicto; casos 1–3 en escritorio y teléfono (6/6); sin scroll horizontal ni aviso de DEMOSTRACIÓN; los países nuevos salen en el texto. **Sale con código 1 solo por un 404 de `favicon.ico`**, que Elena no filtra bien (mira el texto del mensaje, que no trae la dirección; debería mirar `m.location().url`). Con ese filtro corregido en una copia: 0 errores, código 0. Comprobé que el 404 es el favicon y que producción hace lo mismo | **Para Elena:** corregir el filtro del favicon en `smoke-ca.mjs` (es suyo) para que el código de salida sea 0 |
| **Tiempos de carga en la URL publicada** (Chrome, caché apagada, hasta que desaparece «Cargando mapa…») | **Red normal: 1,1 s de mediana** (1,01–1,15 s en 5 corridas; la prueba de humo dio 1,2–2,1 s según el tamaño de pantalla): **cumple <3 s**. **4G lenta simulada** (1,6 Mbps, 170 ms): 6,6 s, y producción de 3 países en las mismas condiciones 5,2 s. `grid.json`: 474 KB comprimido (producción 218 KB) | Teléfono **real**: el 4G lento simulado no sustituye a un teléfono |
| **`ca-mock.mjs` y `real-cases.mjs` contra la URL** (`BASE_URL`; para `real-cases`, `DATA_DIR`, `ROL1_DIR` y `ROL3_DIR` con los datos del zip y los CSV de CA) | **17 y 9 comprobaciones pasan** contra la URL publicada: los 7 países, panel con el nombre del país, pasaporte, comparador, ENSO, recorrido, casos y teléfono; y CSV → JSON → pantalla → pasaportes ES/EN de los 3 casos | — |

**Veredictos por país** (de `grid.json` real; la canícula no tiene ninguna celda consistente en ningún país):

| País | Celdas | Temporada: consistente / limitada / sin evidencia | Anual: consistente / limitada / sin evidencia |
|---|---:|---|---|
| Guatemala | 917 | 58 / 542 / 317 | 71 / 481 / 365 |
| El Salvador | 169 | 0 / 70 / 99 | 0 / 30 / 139 |
| Honduras | 939 | 0 / 295 / 644 | 0 / 89 / 850 |
| Belice | 192 | 1 / 125 / 66 | 5 / 30 / 157 |
| Nicaragua | 1 076 | 15 / 600 / 461 | 1 / 380 / 695 |
| Costa Rica | 425 | 80 / 129 / 216 | 106 / 124 / 195 |
| Panamá | 614 | 42 / 340 / 232 | 48 / 302 / 264 |
| **Total** | **4 332** | **196 / 2 101 / 2 035** | **231 / 1 436 / 2 665** |

**Avisos a otros frentes (no los toco):** el tooltip del mapa muestra el código ISO (`h.country` en `RegionMap.tsx`, de Elena). Las celdas fuera de los 3 casos dicen «Análisis cuantitativo pendiente» en la segunda variable: es lo esperado hasta que Joshua corra `add_secondary.py` (solo cubre los 3 casos).
