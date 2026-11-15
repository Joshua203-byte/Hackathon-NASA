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

- [ ] Recorrer todas las pantallas con celdas de Belice, Nicaragua, Costa Rica y Panamá (datos simulados): panel, comparador, ENSO, pasaporte, recorrido, `?case=1..3` y teléfono.
- [ ] Corregir textos que supongan «solo Honduras» o «3 países» (tarjetas, recorrido, glosario).
- [ ] Escribir `e2e/ca-mock.mjs` (carga, clic en una celda de cada país, pasaporte con el país correcto, sin errores de consola).
- [ ] Con JSON real y vista previa de Elena: repetir `real-cases.mjs` y `ca-mock.mjs` con `BASE_URL`.

## Reporte (lo llenas tú)

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| | | |
