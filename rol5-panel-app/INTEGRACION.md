# Integración del panel — Rol 5

El panel está implementado y probado con datos simulados; el mapa MapLibre del Rol 4 está integrado (ver «Integración con Rol 4»). No se afirma validación científica ni comprensión con usuarios reales.

## Datos del pipeline

Por defecto se lee `public/data/`. Para conectar una carpeta publicada por el pipeline, crear `.env.local`:

```dotenv
VITE_DATA_BASE_URL=https://servidor-del-equipo.example/data
```

La URL debe ser accesible al navegador, permitir CORS si es otro origen y servir `meta.json`, `grid.json`, `cells/{id}.json` y las referencias de la sección 3.2. Reiniciar Vite después de cambiar la variable. También se pueden sustituir los archivos locales por los resultados del pipeline, conservando el contrato. No ejecutar el generador de mocks sobre resultados reales.

`meta.json` admite `data_kind: "mock" | "observed"`. Para `observed` se requiere DOI y commit de pipeline, además de los campos originales. El estado no especificado se anuncia como procedencia sin validar. Declarar `observed` es responsabilidad del productor: el cliente no certifica que esos datos sean reales.

## Resultados por ventana

Se conservan las tuplas originales de cuatro valores y las de seis con IC. Para completar el comparador, cada indicador puede añadir resultados oficiales precalculados:

```json
{
  "window_results": {
    "2001-2016": {
      "ci_95": [-10.2, 1.3],
      "verdict": "limitada",
      "verdict_reasons": ["fdr_no_significativo"]
    }
  }
}
```

Ejemplo estructural, no resultado científico. El IC de `window_results` prevalece sobre la tupla para el comparador y las exportaciones. El navegador no aplica los umbrales del periodo base a una ventana ni deduce un veredicto a partir de p. Si falta el resultado, informa que no fue proporcionado. Rol 2 debe definir y calcular las reglas apropiadas antes de publicar veredictos por ventana.

## Segunda variable y matriz P2

En `cells/{id}.json`, `secondary_variables` es una lista opcional:

```json
{
  "secondary_variables": [{
    "key": "T2M",
    "label": {"es": "Temperatura", "en": "Temperature"},
    "source": "NASA POWER — citar producto exacto",
    "doi": "DOI confirmado por Rol 1",
    "period": [2001, 2024],
    "data": "SUSTITUIR por un objeto CellIndicator completo"
  }]
}
```

`data` usa el mismo tipo que los indicadores de lluvia: unidades, serie anual, estadísticas, veredicto, etc. El ejemplo anterior es un esquema explicativo. La matriz cruza por año solo observaciones válidas de ambas series. No estima causalidad ni rellena ausencias. El fixture de temperatura está marcado como simulado; no es una descarga de POWER.

## Integración con Rol 4

Importar `CellPanel` y pasar `cell`, `gridRow`, `meta`, `status`, `refs` y opcionalmente `mirror`.

**Mapa (Rol 4).** `src/panel/components/RegionMap.tsx` pinta `grid.json` con MapLibre GL (carga diferida). Sin mapa base externo: fondo liso, bordes de país de `public/geo/borders.geojson` (copia de `data/rol1/borders.geojson`, Natural Earth) y una celda de 0,1° por registro. Clic en una celda escribe `?cell=` y el panel carga solo `cells/{id}.json`; no se descargan los 143 MB de detalle. Capas en `?layer=`: `verdict` (por defecto), `slope` (mm/década, escala saturada en el percentil 95), `stability` (`sign_agreement`) y `enso` (`enso_r`, se desactiva si no hay datos). La leyenda de veredicto muestra el conteo por indicador para cotejar con `verdict_summary.csv`. Faltantes en gris, nunca como cero. Si el navegador no crea WebGL se usa la rejilla SVG de `CellMap.tsx`. Con teclado, la celda se elige en el selector de la barra superior. Las funciones puras están en `src/panel/mapLayers.ts` con pruebas en `__tests__/mapLayers.test.ts`.

**Casos (Rol 4).** Los 3 casos de Camila (`docs/08`) están en `src/panel/cases.ts`: tarjetas sobre el mapa y marcadores numerados (botones, alcanzables con teclado). Cada uno abre celda, indicador, ventana y espejo: 1 `N1335W08715`; 2 `N1475W08765` con `win=2001-2010`; 3 `N1495W09125` con `mirror=N1335W08715`. El enlace corto `?case=N` (para formulario y video) se expande a esos parámetros. Los títulos son neutros; el texto de cada caso es de Camila. Pruebas en `__tests__/cases.test.ts`, que además confirma los veredictos en el JSON real si está en `public/data`.

**Datos reales.** `public/data/` contiene el JSON final del motor (2 025 celdas) con el `enso.json` real de `data/rol3/`. Para actualizarlo se sigue la receta de `docs/06-estado-y-reparto.md` §6 y se vuelve a publicar con `npm run deploy`. Los ejemplos simulados que usan `integration.test.ts` y `panel.test.ts` están en `src/panel/__tests__/fixtures/data/`; `make-mock.mjs` escribe ahí por defecto. `npm run test:e2e` espera los ejemplos simulados: correrlo con `VITE_DATA_BASE_URL` apuntando a una copia servida de esa carpeta, nunca contra los datos reales.

El estado vive en la URL. La lente Comunidades selecciona lluvia anual según `meta.lenses`; Agricultura respeta sus indicadores y descarta canícula donde no aplica. Energía conserva el indicador de lluvia y muestra el bloque de segunda variable cuando existe. `?mirror=ID` selecciona la segunda celda; la compatibilidad con `case=3` usa otra celda disponible, no afirma que exista un efecto espejo científico.

## Comprensión con personas

La microvalidación guarda respuestas anónimas en `localStorage`, clave `altaris.comprehension.v1`, y permite descargar cada resultado JSON. No envía datos a ningún servidor. Si el almacenamiento falla, mantiene la descarga. Rol 6 debe recopilar los archivos o definir otro destino antes de una prueba colectiva. El contador local no identifica participantes únicos.

Protocolo pendiente de ejecutar con cinco personas nuevas:

1. Abrir un caso sin recorrido y medir un minuto.
2. Pedir identificar tendencia, seleccionar otra ventana y explicar el veredicto, sin ayuda.
3. Completar las dos preguntas y descargar el resultado.
4. Registrar de forma anónima tiempo, tareas completadas y puntuación; reportar los resultados reales. La meta del documento es cuatro de cinco personas con ambas respuestas correctas.

Las pruebas automatizadas no sustituyen esta evaluación.

## Comprobaciones

```powershell
npm ci
npm test
npm run typecheck
npm run build
# En otra terminal dejar Vite ejecutándose:
npm run dev -- --host 127.0.0.1 --port 4173
# Después:
npm run test:e2e
```

El script busca Chrome en Windows/Linux; `CHROME_PATH` permite otra instalación y `BASE_URL` otro servidor. Artefactos de navegador en `node_modules/.cache/acceptance`. Cualquier aserción fallida devuelve código de error. No ejecutar las pruebas de fixtures contra un servidor con datos reales.
