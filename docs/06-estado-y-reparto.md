# Estado del proyecto (corte domingo 15 de noviembre, 03:00, El Salvador)

Entrega: domingo 15 de noviembre 23:59. Meta interna de envío: 21:00. Congelación: 15:00.
Repositorio oficial: `Joshua203-byte/Hackathon-NASA`. Todo lo descrito aquí está en `main`.

**Avance estimado: 65 %.** La parte técnica (datos, motor, panel, mapa, despliegue) está casi cerrada. Lo que falta es revisión científica, pruebas con personas, video y envío. Es una estimación por bloques, no una medida.

## 1. Hecho

| Bloque | Dónde | Comprobación |
|---|---|---|
| Datos reales de IMERG | `data/rol1/` | 2 025 celdas, 2001–2024, 24 de 24 años válidos. DOI `10.5067/GPM/IMERG/3B-MONTH/07` |
| Contraste con NASA POWER en 3 sitios | `data/rol1/power/`, `docs/rol1-datos.md` | Signo distinto en 7 de 9 comparaciones: va como limitación |
| ENSO y salto 2014 | `data/rol3/`, `pipeline/06_enso.py` | Calculado en las 2 025 celdas. Sin revisar por Camila |
| Motor estadístico | `pipeline/` | 70 pruebas pasan. Umbrales congelados (`frozen: true`). Un cambio anotado en `threshold_changes` |
| Calibración | `pipeline/calibration.json` | 1 000 simulaciones con la configuración congelada |
| JSON final | `rol5-panel-app/public/data/` (en `main` desde el PR #3) | Regenerado desde cero con la receta de la sección 6 sobre el motor de `main` (`pipeline_commit` `a7a5b18`; código del motor igual a `802a9b0`). Mismos veredictos y cifras que el zip v2 y que `docs/07`. Incluye el `enso.json` real de `data/rol3/`. Los ejemplos simulados de las pruebas están en `src/panel/__tests__/fixtures/data/` |
| Revisión independiente | `docs/07`, sección 6 | 9 celdas recalculadas con `scipy`; coinciden |
| Panel de celda | `rol5-panel-app/` | Carga el JSON real y traduce las razones con `reasons.json`. 38 pruebas, compila |
| Mapa MapLibre | `rol5-panel-app/` | 2 025 celdas, bordes, capas de veredicto, pendiente, estabilidad y ENSO |
| Despliegue en Cloudflare | `rol5-panel-app/wrangler.jsonc`, `npm run deploy` | <https://altaris.altaris-panel-rol5.workers.dev> sirve el mismo `public/data/` de `main` (comprobado archivo por archivo, salvo saltos de línea) y el panel carga sin errores. Probado en escritorio y en vista móvil emulada |
| Paquete de revisión para Camila | [08-revision-camila.md](08-revision-camila.md), [casos-candidatos.md](casos-candidatos.md) | Decisiones, evidencia y candidatos a los 3 casos |
| Formulario en inglés | [rol6/submission-en.md](rol6/submission-en.md) | Con cifras reales. Lo que falta va marcado `[PENDING]` |
| Cifras regionales | [07-cifras-y-candidatos.md](07-cifras-y-candidatos.md) | Provisionales hasta la revisión de Camila |

## 2. Falta

En orden de riesgo. Lo de arriba bloquea a lo de abajo.

| # | Qué | Quién | Depende de | Hora meta |
|---|---|---|---|---|
| 1 | Probar la URL pública en incógnito y en un teléfono real (ya está confirmado que sirve el JSON final) | Izel, Elena | Nada | 06:00 |
| 2 | Revisión científica: regla de 2014, salto de 2012 en Guatemala, texto de `enso_no_sobrevive`, elección de los 3 casos | Camila | `docs/08` | 06:00 |
| 3 | Leer completas las guías 2026 de envío y evaluación: campos, límites, idioma, rúbrica, redacción de la declaración de IA. Confirmar que IMERG figura en los recursos del reto | Andrés | Nada | 06:00 |
| 4 | Verificar acceso al portal y que los seis ven la pestaña Project | Andrés | Nada | 06:00 |
| 5 | Segunda variable (temperatura y radiación) en los 3 casos: `python 04_power.py --cells ID1 ID2 ID3` | David | Los IDs de Camila | 09:00 |
| 6 | Cifras finales de los casos: `python pipeline/case_figures.py --data <carpeta> --cells ID1 ID2 ID3` | Joshua | Los IDs de Camila | 09:00 |
| 7 | Regenerar el JSON **solo si** Camila cambia la regla de 2014 (unos 15 minutos) y volver a publicar | Joshua, Izel | Decisión de Camila | 09:00 |
| 8 | Textos de los 3 casos y de las limitaciones | Camila | Los casos | 12:00 |
| 9 | Recorrido guiado y pasaporte con el caso real; adaptar la ventana del paso 3 | Izel | Los casos | 12:00 |
| 10 | `10_narrate.py` sobre el JSON final; revisar una celda por categoría | Andrés, Camila | JSON definitivo | 12:00 |
| 11 | 5 sesiones con personas sobre la URL pública | Andrés | URL y un caso revisado | 12:00–15:00 |
| 12 | Corregir lo que salga de las pruebas | Izel, Elena | Las sesiones | 15:00 |
| 13 | Congelación: `git tag congelada-1500` y `git push origin congelada-1500`; despliegue final sobre la etiqueta | Joshua, Izel | Todo lo anterior | 15:00 |
| 14 | Video definitivo de 30 s o menos, con datos reales, producto NASA y procedencia visibles | Andrés | Versión congelada | 18:00 |
| 15 | Completar los `[PENDING]` del formulario y probar los enlaces | Andrés, Joshua | Casos, URL, video, guía | 18:00 |
| 16 | Revisión del equipo: todo número del formulario sale del JSON | Todos | Formulario | 18:00 |
| 17 | Envío desde la cuenta del equipo; guardar confirmación, URL y hora | Andrés | Todo | 21:00 |

Pendiente menor de Joshua: copiar este documento al Project de Claude, que sigue en la versión 2 del plan.

## 3. Decisiones abiertas

| # | Decisión | Quién | Efecto |
|---|---|---|---|
| 1 | Regla de la bandera de 2014 (dejarla o ampliarla a 2012–2015) | Camila | La única que cambia veredictos: hasta 36 celdas `consistente` de temporada y 29 anuales pasarían a `limitada` |
| 2 | Criterio de `survives` (dos variantes o una) | Camila | Ningún veredicto cambia. Solo el texto y el conteo |
| 3 | Texto de `enso_no_sobrevive` en celdas `sin_evidencia` | Camila | Solo texto |
| 4 | Los 3 casos | Camila | Bloquea las tareas 5, 6, 8 y 9 |

Resueltas: FDR 0,05; `p_max_sign_rule: null`; techo `limitada` por ventana; periodo 2001–2024; web oficial `rol5-panel-app/`; hosting en Cloudflare; demo en video de 30 s. La rama `david-y-elena` no se mezcla.

## 4. Qué se puede afirmar y qué no

- **Sí:** con 24 años de IMERG no se puede sostener una tendencia de lluvia en Honduras ni en El Salvador. El signo es casi siempre negativo, pero los intervalos incluyen el cero.
- **Con salvedad:** la franja `consistente` de Guatemala. Caída muy grande, cambio hacia 2012 en la mayoría de sus celdas, zona con pocos pluviómetros.
- **No:** "la lluvia baja" en Honduras; un efecto espejo de ENSO; "ENSO explica la señal"; cualquier resultado de pruebas con personas.
- El video de ensayo (`docs/rol6/altaris-prototype.webm`) usa datos simulados y no debe enviarse.

## 5. Riesgos

- **Nadie ha leído las guías 2026 completas.** Solo está confirmada, por una respuesta en el foro oficial, la regla de la demo (30 s o 7 láminas), la declaración de IA y el requisito de una fuente NASA de los recursos del reto.
- **Cada regeneración del JSON exige tres pasos.** Commit de `rol5-panel-app/public/data/`, `npm run deploy` y comprobar la URL. Si se omite uno, el repositorio y la URL quedan distintos.
- **La revisión de Camila no ha empezado** y bloquea cuatro tareas.

## 6. Cómo regenerar el JSON

```bash
cd pipeline
python run_pilot.py --cells ../data/rol1/cells.csv --series ../data/rol1/series.csv \
  --monthly ../data/rol1/monthly.csv --enso-results ../data/rol3/enso_results.csv \
  --break2014 ../data/rol3/break2014.csv --enso-json ../data/rol3/enso.json \
  --calibration calibration.json --commit $(git rev-parse --short HEAD) --out <carpeta>/data
```

Después, copiar a `<carpeta>/data/`:

- `data/rol3/enso.json` (el real);
- `tour.json`, `glossary.json` y `decision_rules.json` desde `rol5-panel-app/public/data/`.

Para publicar: `<carpeta>/data/` sobre `rol5-panel-app/public/data/`, commit y, desde `rol5-panel-app/`, `npm run deploy` (requiere `npx wrangler login` y la variable `CLOUDFLARE_ACCOUNT_ID`).

El panel no arranca si `meta.json` trae `dataset_doi: "POR CONFIRMAR"`; el DOI sale de `pipeline/config.yaml`.

## 7. Ramas

| Rama | Estado |
|---|---|
| `main` | Todo lo vigente |
| `izel/panel-celda` | Mezclada (mapa, despliegue en Cloudflare y JSON final, PR #3) |
| `andres/piloto-choluteca` | Mezclada (piloto y lectura de `reasons.json`) |
| `claude/sleepy-carson-nhvqxs` | Igual a `main` |
| `Joshua`, `andres/producto-entrega`, `david-Elena2` | Ya contenidas en `main` |
| `david-y-elena` | No se mezcla |
