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
- [ ] Con JSON real y vista previa de Elena: repetir `real-cases.mjs` y `ca-mock.mjs` con `BASE_URL`. **Falta: espera el `.zip` de Joshua y la URL de Elena.**

## Reporte

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| **Arreglo:** el panel de celda mostraba el código ISO en vez del nombre del país (`BLZ · 18.15°N…` en lugar de `Belice · …`) para Belice, Nicaragua, Costa Rica y Panamá. `CellPanel.tsx` buscaba en `COUNTRY` (solo 3 países) en vez de `countryName`, que ya conoce los 7. Prueba unitaria nueva en `panel.test.ts` | Lo encontró `ca-mock.mjs` antes del arreglo: falló en la primera celda de Belice. Después del arreglo pasa en los 7 países, en español e inglés (Belize, Panama). 47 pruebas unitarias; `real-cases.mjs` con los datos de producción sigue pasando | — |
| **`e2e/ca-mock.mjs`.** Sirve `dist` en un servidor local y toma `/data` de la carpeta de `make_ca_mock.py` (`CA_MOCK_DIR`), o corre contra una URL (`BASE_URL`). Pasa el ratón por el mapa leyendo el tooltip hasta encontrar una celda de cada país, hace clic, y revisa el panel, el veredicto contra `grid.json`, la serie, el pasaporte JSON y Markdown, el comparador entre Panamá y Belice, ENSO en los 4 países nuevos, el recorrido, `?case=1..3` y el teléfono | **17 comprobaciones** con el simulado completo (4 784 celdas, `--stride 1`). Sin errores de consola ni de página (se ignora el 404 de `favicon.ico`). Teléfono 390×844 sin desbordamiento. Los casos 1–3 se omiten con aviso si el simulado no trae sus celdas (ocurre con `--stride 12`) | Repetirla con `BASE_URL` apuntando a la vista previa real |
| **Revisión de textos.** Busqué en `src/**`, `tour.json`, `glossary.json`, `decision_rules.json` y `index.html` menciones a Honduras, Guatemala, El Salvador, «tres países», Pacífico, Caribe, etc. | No hay otro texto que suponga una región. «Un caso real de Honduras» (recorrido) es correcto: el caso 2 es una celda de Honduras. «Uno de los tres ejemplos» son los 3 casos, que siguen siendo 3. El glosario habla del Pacífico tropical por ENSO, que es correcto | **Para Camila:** el panel dice «mayo–octubre» para la temporada de lluvia en los 7 países. En Costa Rica, Panamá y Belice la temporada lluviosa cambia por vertiente; su texto de limitaciones ya lo cubre, pero no el rótulo del indicador |

**Avisos a otros frentes (no los toco):** el tooltip del mapa muestra el código ISO (`h.country` en `RegionMap.tsx`, de Elena). Las celdas fuera de los 3 casos dicen «Análisis cuantitativo pendiente» en la segunda variable: es lo esperado hasta que Joshua corra `add_secondary.py` (solo cubre los 3 casos).
