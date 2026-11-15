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

- [x] Correr `python run_rol1.py --config config_centroamerica.yaml --data-dir ../data/ca` (desde `pipeline/`).
- [x] Comprobar que `cells.csv` tiene los 7 países y anotar cuántas celdas hay de cada uno.
- [x] Comprobar que las celdas de GTM, SLV y HND dan los mismos valores que `data/rol1/series.csv` (0 diferencias).
- [x] Comprobar los años válidos (24 de 24) y anotar cuánto tardó la descarga.
- [x] Subir **solo** `data/ca/rol1/` (`cells.csv`, `series.csv`, `monthly.csv`, `borders.geojson`, `provenance.json`) y avisar a Joshua. No subir `data/ca/raw` ni `data/ca/interim`.

## Reporte (lo llenas tú)

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| Corrí `python run_rol1.py --config config_centroamerica.yaml --data-dir ../data/ca` (15 nov, 10:56). Descarga IMERG V07 mensual de GES DISC: **288/288 meses, 0 fallidos, 58 s**; la corrida completa (descarga + cubo + indicadores) tardó **1 min 7 s**. Recorte: lat 7,05–18,45, lon −92,45 – −77,05 (rejilla 115 × 155). | **Países:** 4 332 celdas de tierra: NIC 1 076, HND 939, GTM 917, PAN 614, CRI 425, BLZ 192, SLV 169. | Joshua corre el motor (C2). |
| Subí **solo** `data/ca/rol1/`: `cells.csv` (128 KB), `series.csv` (11 MB), `monthly.csv` (32 MB), `borders.geojson`, `provenance.json`. `raw/` e `interim/` quedan fuera (ignorados). | **Igualdad con `data/rol1/`** (`python docs/ca/david_check_ca_rol1.py .`): las 2 025 celdas de GTM, SLV y HND están todas, con el mismo país; no aparece ninguna celda nueva de esos 3 países. `series.csv`: 145 800 filas comparadas, **0 diferencias** (máx. 0). `monthly.csv`: 583 200 filas, **0 diferencias**. | — |
| | **Años válidos:** 12 996 de 12 996 pares celda-indicador con **24/24 años** (2001–2024). `provenance.json`: 0 valores negativos, mayo–oct p1/p50/p99 = 641 / 1 551 / 2 927 mm, 2 831 celdas con canícula y 1 501 sin ella, 0 desconocidas. Piloto Choluteca idéntico (media mayo–oct 1 464 mm). | — |
