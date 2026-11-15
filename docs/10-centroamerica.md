# Centroamérica: reparto del trabajo en 6 frentes independientes

Corte: domingo 15 de noviembre, 10:30 (El Salvador). Entrega del proyecto: 23:59. Congelación: 15:00.

## 1. Qué se hace

Extender el análisis de **3 países** (Guatemala, El Salvador, Honduras) a **7** (más **Belice, Nicaragua, Costa Rica y Panamá**), con IMERG 2001–2024 y el mismo motor. Son unas **4 300 celdas** en lugar de 2 025.

Reglas que no se negocian:

1. **No se toca ningún umbral.** `pipeline/config_centroamerica.yaml` es `config.yaml` con otro recuadro y otra lista de países; nada más. Si un veredicto cambia es porque la corrección por comparaciones múltiples (FDR) ahora se calcula entre más celdas, no porque se haya ajustado una regla.
2. **La versión de 3 países sigue siendo la oficial hasta que se decida GO** (sección 6). Nada de lo que se haga aquí toca `main` ni la URL pública antes de esa decisión.
3. **Todo número que llegue al formulario sale del JSON**, igual que hasta ahora.

## 2. Cómo se trabaja sin esperar a nadie

Cada persona tiene **su rama**, **sus archivos** y un **contrato de entrega** con formato fijo. Mientras llegan los datos reales, todos trabajan con el mismo conjunto de **datos simulados** de 7 países.

### Ramas

| Persona | Rol | Rama donde sube **todo** su trabajo |
|---|---|---|
| David | 1 · Datos | `ca/david-datos` |
| Joshua | 2 · Motor | `ca/joshua-motor` |
| Camila | 3 · Ciencia | `ca/camila-ciencia` |
| Elena | 4 · Mapa y despliegue | `ca/elena-mapa-despliegue` |
| Izel | 5 · Panel | `ca/izel-panel` |
| Andrés | 6 · Producto | `ca/andres-producto` |
| (integración) | Joshua, solo si hay GO | `ca/integracion` |

Para empezar:

```bash
git fetch origin
git checkout ca/<tu-rama>
```

Reglas de trabajo:

- **Subes solo a tu rama.** No hagas `push` a `main` ni a la rama de otra persona.
- **Toca solo tus archivos** (tabla de cada sección). Así no hay conflictos al juntar.
- **Tu reporte va en `docs/ca/<tu-nombre>.md`** (ya existe un borrador en tu rama). Ahí anotas qué hiciste, qué comprobaste y qué falta. Nadie más lo edita.
- **No subas el JSON grande** (~300 MB). Se entrega como `.zip` por el chat; en las ramas solo van los archivos livianos que se indican.
- **Commits pequeños, uno por cambio, con el porqué** en el mensaje.

### Datos simulados para todos (no esperan a David ni a Joshua)

```bash
cd pipeline
python make_ca_mock.py --out /tmp/ca-mock --stride 12    # ~400 celdas, menos de 1 minuto: para ver la interfaz
python make_ca_mock.py --out /tmp/ca-mock --stride 4     # ~1 100 celdas, unos 3 minutos
```

Genera `/tmp/ca-mock/data/` con el mismo contrato de archivos que el motor real. Celdas de GTM, SLV y HND reales (solo la posición); las de BLZ, NIC, CRI y PAN salen de rectángulos aproximados; **todas las series son inventadas** y `meta.json` dice `data_kind: "mock"`, así que el panel muestra el aviso de DEMOSTRACIÓN. Para verlo:

```bash
cd rol5-panel-app
VITE_DATA_BASE_URL=http://127.0.0.1:8765/data npm run dev      # y servir /tmp/ca-mock con CORS en el puerto 8765
```

(o copiar `/tmp/ca-mock/data/` sobre `rol5-panel-app/public/data/` **en tu copia local, sin commitear**).

### Contratos de entrega

| # | De → a | Qué | Dónde |
|---|---|---|---|
| C1 | David → Joshua | Series de las ~4 300 celdas | `data/ca/rol1/` en `ca/david-datos`: `cells.csv`, `series.csv`, `monthly.csv`, `borders.geojson`, `provenance.json`. Formato: [pipeline/README.md](../pipeline/README.md) |
| C2 | Joshua → Izel, Elena, Andrés, Camila | JSON del motor | `.zip` por el chat con `meta.json`, `grid.json`, `cells/`, `reasons.json`, `verdict_summary.csv` y los archivos de referencia. En la rama solo los livianos, en `data/ca/json-light/` |
| C3 | Joshua → todos | Tablas y comparación | `docs/ca/joshua.md` con `COMPARACION` y las tablas para el formulario |
| C4 | Elena → Izel, Andrés, Camila | URL de vista previa de Centroamérica | Un Worker aparte (`altaris-ca`); **no** la URL de producción |
| C5 | Camila → Andrés | Limitaciones y textos definitivos | `docs/ca/camila.md`, en español e inglés |

## 3. Horario

| Hora | Hito | Quién |
|---|---|---|
| 10:45 | Todos en su rama, con datos simulados funcionando | Todos |
| **11:15** | **H1:** CSV de Centroamérica entregados (C1) | David |
| 11:15–12:00 | Motor sobre los datos reales: ENSO, 2014, JSON y comparación (C2, C3) | Joshua |
| 12:15 | **H2:** vista previa de Centroamérica con datos reales (C4) | Elena |
| 12:30 | QA con datos reales y firma científica | Izel, Camila |
| **12:45** | **GO / NO-GO** | Joshua decide (sección 6) |
| 12:45–14:30 | Integración, despliegue y cifras (solo si GO) | Joshua, Elena, Andrés |
| 15:00 | Congelación, como estaba previsto | Joshua |

**Plazo duro:** si a las 11:45 David no entregó los CSV, es **NO-GO automático**. Nadie pierde tiempo: todos los demás frentes ya trabajaron con los datos simulados.

Las 5 sesiones con personas (12:00–15:00) siguen sobre la **URL de producción de 3 países**, sin cambios.

---

## 4. Reparto por persona

### David · Rol 1 · rama `ca/david-datos`

**Arranca ya** (no depende de nadie):

```bash
git checkout ca/david-datos
cd pipeline
pip install -r requirements.txt -r requirements-rol1.txt
python run_rol1.py --config config_centroamerica.yaml --data-dir ../data/ca
```

Descarga reanudable (288 meses) y genera todo en `data/ca/`. Necesita tus credenciales de Earthdata, como la vez anterior.

**Comprueba y anota en `docs/ca/david.md`:**

1. Que `cells.csv` tenga los 7 países y cuántas celdas hay de cada uno.
2. Que las celdas de GTM, SLV y HND den **los mismos valores** que `data/rol1/series.csv` (como hiciste con El Salvador: 0 diferencias).
3. Que cada celda tenga 24 de 24 años válidos, o cuáles no (el `provenance.json` trae el informe de calidad).
4. Cuánto tardó la descarga.

**Entrega (C1):** commit de **solo** `data/ca/rol1/` (`cells.csv`, `series.csv`, `monthly.csv`, `borders.geojson`, `provenance.json`) y avisa a Joshua. **No subas** `data/ca/raw/` ni `data/ca/interim/` (están ignoradas).

**Tus archivos:** `data/ca/rol1/**`, `docs/ca/david.md`, `docs/rol1-datos.md` (añade una sección "Centroamérica").
**Listo cuando:** Joshua puede correr el motor sin editar nada. **Hora:** 11:15.
**Si falla:** si las credenciales o la descarga no funcionan a las 11:15, avisa a Joshua en ese momento.

### Joshua · Rol 2 · rama `ca/joshua-motor`

**Arranca ya** (con datos simulados y con los datos actuales):

1. **`pipeline/compare_regions.py`:** compara el JSON actual de `main` (3 países) con el nuevo, **sobre las celdas comunes**. Pendiente, intervalo y p de cada celda deben ser **idénticos** (son por celda); lo que puede cambiar es `p_fdr` y el veredicto. Lista las celdas que cambiaron.
2. **`pipeline/ca_tables.py`:** imprime en Markdown las tablas para el formulario: veredictos por país e indicador, y el % de banderas de 2014 por país.
3. Ensayo de punta a punta con `make_ca_mock.py` para medir tiempos y comprobar que `06_enso.py` y `run_pilot.py` aceptan 7 países.
4. Adaptar `pipeline/check_form_numbers.py` para que cote el formulario de Centroamérica.

**Cuando David entregue (11:15):**

```bash
git fetch origin && git checkout origin/ca/david-datos -- data/ca/rol1
cd pipeline
python 06_enso.py --cells ../data/ca/rol1/cells.csv --series ../data/ca/rol1/series.csv \
  --oni ../data/rol3/oni.csv --out ../data/ca/rol3
python run_pilot.py --config config_centroamerica.yaml \
  --cells ../data/ca/rol1/cells.csv --series ../data/ca/rol1/series.csv --monthly ../data/ca/rol1/monthly.csv \
  --enso-results ../data/ca/rol3/enso_results.csv --break2014 ../data/ca/rol3/break2014.csv \
  --enso-json ../data/ca/rol3/enso.json --calibration calibration.json \
  --commit $(git rev-parse --short HEAD) --out <carpeta>/data
```

Después, como en [docs/06 §6](06-estado-y-reparto.md): copiar a `<carpeta>/data/` el `enso.json` real (`data/ca/rol3/`) y `tour.json`, `glossary.json`, `decision_rules.json` de `rol5-panel-app/public/data/`, y volver a poner la segunda variable de los 3 casos con `python pipeline/add_secondary.py --data <carpeta>/data`. El motor tarda unos 26 minutos con 4 núcleos.

**Entrega (C2 y C3):**
- `altaris_ca_json.zip` por el chat.
- En tu rama: `data/ca/rol3/*.csv`, `data/ca/json-light/` (`meta.json`, `grid.json`, `reasons.json`, `verdict_summary.csv`) y **`docs/ca/joshua.md`** con la comparación: qué celdas cambiaron de veredicto y por qué, y las tablas de `ca_tables.py`.

**Tus archivos:** `pipeline/**`, `data/ca/rol3/**`, `data/ca/json-light/**`, `docs/ca/joshua.md`, `docs/06-estado-y-reparto.md` y `docs/07-*` (solo tú). Eres el único que edita `config_centroamerica.yaml`.
**Listo cuando:** el zip está entregado y la comparación escrita. **Hora:** 12:00.

### Camila · Rol 3 · rama `ca/camila-ciencia`

**Arranca ya** (no necesita datos):

1. En `docs/ca/camila.md`, define **cómo se explica que el veredicto de una celda de Guatemala, El Salvador u Honduras cambie solo por haber más celdas** ("más comparaciones, mismo umbral"), para que no parezca un cambio de criterio.
2. Redacta las **limitaciones nuevas**, en español e inglés, para el formulario y el panel. Puntos a evaluar:
   - La temporada lluviosa difiere por zona. Ya sabemos que 119 celdas de la costa Caribe de Honduras tienen su máximo de julio en adelante. Para Costa Rica, Panamá y Nicaragua hay que **verificarlo con los datos**, no suponerlo.
   - En el istmo angosto (Costa Rica, Panamá) una celda de ~11 km mezcla mar y tierra; la máscara usa el centro de la celda.
   - ENSO puede actuar distinto en la vertiente Caribe y la Pacífica.
3. Decide qué haces si un caso cambia (los 3 casos siguen siendo las mismas celdas; sus cifras por celda no deben cambiar).

**Cuando haya datos:** corre `python pipeline/season_check.py --data <carpeta>/data` (ya existe) y pon la tabla por país en tu documento. Con la `COMPARACION` de Joshua, verifica que los 3 casos conservan sus cifras y firma el **checklist científico** de la sección 6.

**Entrega (C5):** `docs/ca/camila.md` con limitaciones definitivas, la tabla de temporadas y el checklist firmado.
**Tus archivos:** `docs/ca/camila.md`, `docs/09-casos-y-textos-camila.md`, `docs/08-revision-camila.md`.
**Hora:** criterios y limitaciones 11:30; firma con datos reales 12:30.

### Elena · Rol 4 · rama `ca/elena-mapa-despliegue`

**Arranca ya** (con datos simulados):

1. Cargar el mock en el mapa (`make_ca_mock.py --stride 4`) y revisar la **cámara**: encuadre inicial para lat 7 a 18,5 y lon −92,5 a −77, límites de arrastre, zoom al elegir una celda con el panel abierto, marcadores de los 3 casos.
2. **Rendimiento con ~4 300 celdas.** Mide el tiempo de carga de `grid.json` (~3,5 MB) y la fluidez al arrastrar y acercar. Meta del plan: menos de 3 segundos.
3. **Despliegue de prueba sin tocar producción.** Crea `wrangler.ca.jsonc` con otro nombre de Worker (`altaris-ca`) y un script `npm run deploy:ca`. Súbele 4 400 archivos de prueba y confirma que el plan gratis lo acepta (límites de Cloudflare: 20 000 archivos por versión y 25 MiB por archivo) y cuánto tarda.

**Cuando llegue el JSON (C2):** desplegar en `altaris-ca`, probar en teléfono y pasar la URL de vista previa a Izel, Andrés y Camila (**C4**).

**Tus archivos:** `rol5-panel-app/src/panel/components/RegionMap.tsx`, `rol5-panel-app/src/panel/mapLayers.ts`, `wrangler.ca.jsonc`, `public/_headers`, el script `deploy:ca` de `package.json`, `docs/ca/elena.md`.
**Listo cuando:** la vista previa carga con los datos reales en menos de 3 segundos. **Hora:** 12:15.

### Izel · Rol 5 · rama `ca/izel-panel`

**Arranca ya** (con datos simulados):

1. Recorre todas las pantallas con celdas de **Belice, Nicaragua, Costa Rica y Panamá**: panel de celda, comparador, ENSO, pasaporte JSON y Markdown, recorrido, los 3 casos (`?case=1..3`) y teléfono. Ya quedó resuelto que el texto de la entrada y del mapa toma los países del propio `grid.json`, y que los nombres de los 4 países nuevos existen.
2. Corrige cualquier texto que suponga "solo Honduras" o "3 países": tarjetas de decisión, recorrido, glosario.
3. **Prueba de navegador para 7 países:** `e2e/ca-mock.mjs` (carga, clic en una celda de cada país, pasaporte con el país correcto, sin errores de consola).
4. Opcional, si sobra tiempo: un resumen de veredictos por país.

**Cuando haya JSON real y vista previa:** repetir `e2e/real-cases.mjs` y `e2e/ca-mock.mjs` contra la URL de Elena (`BASE_URL`).

**Tus archivos:** `rol5-panel-app/src/**` **excepto** `RegionMap.tsx` y `mapLayers.ts` (de Elena), `rol5-panel-app/e2e/**`, `rol5-panel-app/public/data/{tour,glossary,decision_rules}.json`, `docs/ca/izel.md`.
**Hora:** QA con datos simulados 11:30; con datos reales 12:30.

### Andrés · Rol 6 · rama `ca/andres-producto`

**Arranca ya** (no necesita datos):

1. **`docs/rol6/submission-en-ca.md`:** copia del formulario para 7 países, con `[PENDING-CA]` donde van números nuevos y con el alcance corregido (Honduras, Guatemala, El Salvador, Belize, Nicaragua, Costa Rica and Panama). **Deja `submission-en.md` intacto**: es el respaldo si hay NO-GO.
2. Variante del README y de los textos de entrega para Centroamérica, igual con marcas `[PENDING-CA]`.
3. Guion del video de 30 s en dos versiones: es el mismo guion, cambia solo el plano del mapa.
4. Lo que ya tenías pendiente: guías 2026 completas, acceso al portal y las 5 sesiones con personas (12:00–15:00, sobre la URL de producción actual).

**Cuando lleguen las tablas de Joshua y las limitaciones de Camila:** rellenar los `[PENDING-CA]` y correr el cotejo de cifras. Tú **no decides** el GO/NO-GO: dejas las dos versiones listas para que el cambio sea copiar un archivo.

**Tus archivos:** `docs/rol6/**`, `docs/ca/andres.md`. El `README.md` solo se toca si hay GO.
**Hora:** textos con marcas listos a las 11:30; con números a las 13:30 (si hay GO).

---

## 5. Qué hay ya hecho (en `main`)

- `pipeline/config_centroamerica.yaml`: mismo contenido que `config.yaml` salvo `bbox` y `countries`.
- Lista de países configurable (`imerg.active_countries`) y nombres de los 4 países nuevos. Sin `countries:` en la configuración se conserva el Triángulo Norte, así que las corridas anteriores no cambian. Con prueba.
- `pipeline/make_ca_mock.py`: datos simulados de 7 países.
- `pipeline/season_check.py`: temporada de lluvias por país.
- Panel: nombres de los 4 países y texto de entrada y de mapa tomados de los datos.

## 6. GO / NO-GO (12:45)

Decide **Joshua**. Condiciones para GO, **todas**:

| # | Condición | Quién lo comprueba |
|---|---|---|
| 1 | Las celdas de GTM, SLV y HND tienen **pendiente, intervalo y p idénticos** a los de la versión actual | Joshua (`compare_regions.py`) |
| 2 | Todo cambio de veredicto en esas celdas está explicado por el FDR, y las **3 celdas de los casos** conservan sus cifras | Joshua y Camila |
| 3 | Camila firmó el checklist científico y las limitaciones nuevas están escritas | Camila |
| 4 | La vista previa carga con los datos reales y pasan `e2e/real-cases.mjs` y `e2e/ca-mock.mjs` | Izel y Elena |
| 5 | La carga es menor a 3 segundos | Elena |
| 6 | El formulario de Centroamérica tiene todas sus cifras cotejadas con el JSON | Andrés y Joshua |

**Si algo falla, es NO-GO.** Las ramas `ca/*` se quedan sin mezclar y `main` sigue como está. No se pierde nada.

**Si hay GO**, Joshua junta las ramas en `ca/integracion` en este orden: `ca/david-datos`, `ca/joshua-motor`, `ca/camila-ciencia`, `ca/izel-panel`, `ca/elena-mapa-despliegue`, `ca/andres-producto`. Luego se mezcla a `main`, se copia el JSON real a `rol5-panel-app/public/data/`, Elena publica en producción (`npm run deploy`) y Andrés pasa a la versión de Centroamérica del formulario y del README. La congelación de las 15:00 no se mueve.

## 7. Riesgos

| Riesgo | Qué hacer |
|---|---|
| Las credenciales de Earthdata fallan o la descarga tarda | Aviso a las 11:15. A las 11:45, NO-GO automático |
| Los veredictos de las 44 celdas `consistente` de Guatemala cambian | Es esperable en parte; se explica en `COMPARACION` y no se toca ningún umbral |
| En Costa Rica y Panamá los indicadores no calzan con la temporada | Camila lo mide con `season_check.py` y lo dice como limitación |
| El motor tarda más de lo previsto | Medido: ~26 minutos con 4 núcleos. Joshua lo ensaya con el mock a las 10:45 |
| Dos personas editan el mismo archivo | Cada archivo tiene un solo dueño (tablas de arriba) |
| El repositorio crece demasiado | El JSON grande no se sube a las ramas |
