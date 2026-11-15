# Joshua · Rol 2 · Motor · Centroamérica

**Rama:** `ca/joshua-motor`  ·  **Hora meta:** 12:00  ·  Plan completo: [docs/10-centroamerica.md](../10-centroamerica.md)

```bash
git fetch origin
git checkout ca/joshua-motor
```

## Reglas

- Subes **solo a `ca/joshua-motor`**. No hagas `push` a `main` ni a la rama de otra persona.
- Tocas **solo tus archivos**: `pipeline/**`; `data/ca/rol3/**`, `data/ca/json-light/**`; `docs/ca/joshua.md`, `docs/06-*`, `docs/07-*`; `pipeline/config_centroamerica.yaml` (solo tú).
- No subas el JSON grande (~300 MB): se entrega como `.zip` por el chat.
- Datos simulados para trabajar ya: `cd pipeline && python make_ca_mock.py --out /tmp/ca-mock --stride 12`.
- Commits pequeños, uno por cambio, con el porqué en el mensaje.

## Mi lista

- [ ] Escribir `pipeline/compare_regions.py` (celdas comunes: pendiente, IC y p deben ser idénticos; listar cambios de `p_fdr` y de veredicto).
- [ ] Escribir `pipeline/ca_tables.py` (tablas para el formulario) y adaptar `check_form_numbers.py` a Centroamérica.
- [ ] Ensayar todo con `make_ca_mock.py` y medir tiempos.
- [ ] Al llegar los CSV de David: `06_enso.py`, `run_pilot.py --config config_centroamerica.yaml`, enso real, archivos de referencia y `add_secondary.py` (comandos en docs/10).
- [ ] Entregar `altaris_ca_json.zip` por el chat y, en esta rama, `data/ca/rol3/`, `data/ca/json-light/` y la comparación.

## Reporte (lo llenas tú)

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| | | |
