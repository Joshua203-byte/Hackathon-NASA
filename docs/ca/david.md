# David · Rol 1 · Datos · Centroamérica

**Rama:** `ca/david-datos`  ·  **Hora meta:** 11:15  ·  Plan completo: [docs/10-centroamerica.md](../10-centroamerica.md)

```bash
git fetch origin
git checkout ca/david-datos
```

## Reglas

- Subes **solo a `ca/david-datos`**. No hagas `push` a `main` ni a la rama de otra persona.
- Tocas **solo tus archivos**: `data/ca/rol1/**`; `docs/ca/david.md`; `docs/rol1-datos.md` (sección «Centroamérica»).
- No subas el JSON grande (~300 MB): se entrega como `.zip` por el chat.
- Datos simulados para trabajar ya: `cd pipeline && python make_ca_mock.py --out /tmp/ca-mock --stride 12`.
- Commits pequeños, uno por cambio, con el porqué en el mensaje.

## Mi lista

- [ ] Correr `python run_rol1.py --config config_centroamerica.yaml --data-dir ../data/ca` (desde `pipeline/`).
- [ ] Comprobar que `cells.csv` tiene los 7 países y anotar cuántas celdas hay de cada uno.
- [ ] Comprobar que las celdas de GTM, SLV y HND dan los mismos valores que `data/rol1/series.csv` (0 diferencias).
- [ ] Comprobar los años válidos (24 de 24) y anotar cuánto tardó la descarga.
- [ ] Subir **solo** `data/ca/rol1/` (`cells.csv`, `series.csv`, `monthly.csv`, `borders.geojson`, `provenance.json`) y avisar a Joshua. No subir `data/ca/raw` ni `data/ca/interim`.

## Reporte (lo llenas tú)

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| | | |
