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

- [ ] Cargar `make_ca_mock.py` en el mapa y revisar la cámara (encuadre lat 7–18,5 y lon −92,5 a −77, límites, zoom con el panel abierto).
- [ ] Medir la carga de `grid.json` (~3,5 MB) y la fluidez con ~4 300 celdas. Meta: menos de 3 s.
- [ ] Crear `wrangler.ca.jsonc` (Worker `altaris-ca`, no producción) y `npm run deploy:ca`; probar con 4 400 archivos (límite gratis: 20 000 archivos y 25 MiB por archivo).
- [ ] Con el JSON real: desplegar la vista previa, probar en teléfono y pasar la URL a Izel, Andrés y Camila.

## Reporte (lo llenas tú)

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| | | |
