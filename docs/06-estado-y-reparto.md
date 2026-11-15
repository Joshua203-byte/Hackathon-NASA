# Estado y reparto (corte domingo 15 de noviembre, 03:00, El Salvador)

Entrega: domingo 15 de noviembre 23:59. Meta interna de envío: 21:00. Congelación: 15:00. Este documento resume qué hay en `main`, qué falta y quién hace qué desde ahora. Reemplaza el corte del sábado 23:50. El repositorio oficial es `Joshua203-byte/Hackathon-NASA`.

## 1. Qué hay

| Pieza | Dónde | Estado |
|---|---|---|
| Plan v3.1 | `PROPUESTA_ALTARIS_PLAN_EQUIPO.md` | Vigente |
| Datos reales de IMERG (Rol 1) | `data/rol1/` | Listo: 2 025 celdas, 2001–2024, DOI `10.5067/GPM/IMERG/3B-MONTH/07`. Contraste con NASA POWER en 3 sitios |
| ENSO y salto 2014 (Rol 3) | `data/rol3/`, `pipeline/06_enso.py` | Calculado sobre las 2 025 celdas. **Falta la revisión de Camila** |
| Motor estadístico (Rol 2) | `pipeline/` | Listo: 70 pruebas pasan. Umbrales congelados (`frozen: true`), un cambio anotado en `threshold_changes` (Hamed-Rao). Calibración de 1 000 simulaciones |
| JSON final | fuera del repositorio (zip, ~22 MB; 143 MB sin comprimir) | Generado y comprobado contra el panel. Una segunda corrida desde cero da los mismos veredictos y cifras |
| Cifras y candidatos a casos | [07-cifras-y-candidatos.md](07-cifras-y-candidatos.md) | Provisionales hasta la revisión de Camila |
| Panel de celda (Rol 5) | `rol5-panel-app/` | Carga el JSON real y traduce los códigos de razón con `reasons.json` |
| Mapa MapLibre (Rol 4) | `rol5-panel-app/` (mezclado a `main` el 15 nov, 03:30) | Hecho. Pinta `grid.json` con bordes y capas de veredicto, pendiente, estabilidad y ENSO |
| Lectura de `reasons.json` y piloto de Choluteca | `rol5-panel-app/`, [07-piloto-real-choluteca.md](07-piloto-real-choluteca.md) (mezclado a `main` el 15 nov, 03:30) | Hecho. El piloto se abre con `?dataset=pilot` |
| Contenido y entrega (Rol 6) | `docs/rol6/` | Formulario en inglés (borrador con datos simulados), fuentes, guion de pruebas, video de ensayo |
| URL pública | — | No hay |

Las ramas `izel/panel-celda` y `andres/piloto-choluteca` ya están en `main`: compila, pasan las pruebas y el mapa funciona con el JSON real.

La rama `david-y-elena` (un motor y una web paralelos) no se mezcla; de ella ya se adoptó lo útil.

## 2. Requisitos del JSON que lee el panel

- `meta.json` con `data_kind: "observed"` exige DOI real y commit del motor. Con `dataset_doi: "POR CONFIRMAR"` el panel no arranca.
- `enso.json` debe ser el de `data/rol3/` (años fuertes de may–oct: 2010, 2015, 2023). El de `rol5-panel-app/public/data/` es simulado.
- `tour.json`, `glossary.json` y `decision_rules.json` salen de `rol5-panel-app/public/data/`.
- Comando: ver [pipeline/README.md](../pipeline/README.md). Pasar `--commit $(git rev-parse --short HEAD)`.

## 3. Lo que queda, en orden

### 02:00 a 06:00

| Quién | Qué | Depende de |
|---|---|---|
| **Joshua** | Pasar el zip final a Izel y Elena, avisar al grupo y pedir a Camila la revisión | Nada |
| **Camila** | Revisar: la bandera de 2014 (única causa de que 29 celdas de Guatemala en lluvia de temporada y 30 en anual no sean `consistente`), el salto de 2012 en la franja de Guatemala, el 17,6 % de banderas en canícula y el criterio de `survives`. Elegir los 3 casos | `docs/07` y `data/rol3/` |
| **Izel** | Cargar el JSON real. Confirmar resultados por ventana (techo `limitada`) | El zip |
| **Elena** | Desplegar `main` con URL pública. Elegir hosting y resolver dónde viven los 2 025 archivos de `cells/` (~72 KB cada uno) | El zip |
| **David** | Cuando Camila pase los IDs: `python 04_power.py --cells ID1 ID2 ID3` | Los casos |
| **Andrés** | Verificar acceso al portal y pestaña Project. Leer completas las guías de envío y de evaluación 2026: campos, límites, idioma, rúbrica. El formato de demo ya está registrado en `docs/rol6/fuentes.md` (30 s de video o 7 láminas; se eligió video) | Nada |

### 06:00 a 12:00

- **Joshua:** `case_figures.py` con los IDs de Camila y pasar `casos.md` a Andrés. Revisar 10 celdas con Camila (9 ya recalculadas con `scipy`). Regenerar el JSON solo si Camila cambia la regla de 2014 o de ENSO.
- **Camila:** textos de los 3 casos y de las limitaciones.
- **Izel:** recorrido y pasaporte con el caso real; adaptar la ventana del paso 3 del recorrido.
- **Elena:** primera versión desplegada, P0 a las 12:00. Globo solo si P0 está completo.
- **Andrés:** `10_narrate.py` sobre el JSON final; revisar una celda por categoría con Camila. Lista de recursos y registro de uso de IA.

### 12:00 a 15:00

- **Andrés:** 5 sesiones con personas sobre la URL pública. Problemas de mapa a Elena, de interpretación a Izel.
- **Joshua y Camila:** dudas científicas. No tocar umbrales; cualquier cambio va a `threshold_changes`.

### 15:00, congelación

1. Todas las ramas útiles ya mezcladas en `main`.
2. **Joshua:** `git tag congelada-1500` y `git push origin congelada-1500`.
3. **Elena:** despliegue final sobre esa etiqueta.
4. **Camila:** revisión científica final del formulario y del video.

### 15:00 a 21:00

- **Andrés:** video definitivo con ID y veredicto reales, mostrando el producto NASA y su procedencia. Formulario en inglés con enlaces probados.
- **Joshua:** cifras finales al formulario.
- **18:00, revisión del equipo:** todo número del formulario sale del JSON; ninguna cifra es simulada.
- **21:00, envío por Andrés.** Guardar confirmación, URL y hora.

## 4. Decisiones abiertas

| # | Decisión | Estado |
|---|---|---|
| 1 | Dónde vive `cells/` | Elena lo prueba temprano. Si el hosting lo rechaza, servir solo las celdas necesarias o adelgazar campos |
| 2 | Criterio de `survives` (dos variantes o una) | Decide Camila. **No cambia ningún veredicto:** ninguna celda deja de ser `consistente` solo por ENSO. Solo cambia el texto de las razones y el conteo |
| 3 | Bandera de 2014 y salto de 2012 | Decide Camila. Esta sí mueve veredictos en Guatemala |
| 4 | Texto de `enso_no_sobrevive` en celdas `sin_evidencia` | Hoy se muestra "la tendencia no sobrevive" en celdas donde no había tendencia. Camila decide si se oculta o se reescribe |

Resueltas: FDR 0,05; `p_max_sign_rule: null`; techo `limitada` por ventana; periodo 2001–2024; web oficial `rol5-panel-app/`.

## 5. Qué se puede afirmar y qué no

- **Sí:** con 24 años de IMERG no se puede sostener una tendencia de lluvia en Honduras ni en El Salvador. El signo es casi siempre negativo, pero los intervalos incluyen el cero.
- **Con salvedad:** la franja `consistente` de Guatemala. Es una caída muy grande, con un cambio hacia 2012 que la regla de la bandera no cubre, en una zona donde IMERG y POWER discrepan.
- **No:** "la lluvia baja" en Honduras; un efecto espejo de ENSO (no aparece); "ENSO explica la señal" (casi todas las celdas que no sobreviven al control no tenían tendencia que explicar); cualquier resultado de pruebas con personas, que aún no se hicieron.
- IMERG y NASA POWER discrepan en el signo en 7 de 9 comparaciones: va como limitación.
- El formulario (`docs/rol6/submission-en.md`) y el video de ensayo todavía describen datos simulados; hay que reescribirlos con las cifras reales.
