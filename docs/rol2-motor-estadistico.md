# Rol 2: motor estadístico y veredicto (estado y decisiones pendientes)

*Rama `rol2-rol5`. Código en `pipeline/`. Instrucciones en `pipeline/README.md`.*

## Qué está hecho

| Tarea del plan (5.3) | Estado |
|---|---|
| B0: umbrales propuestos en `config.yaml` | Hecho. **Falta congelarlos con el equipo** (ver abajo) |
| B0: JSON de ejemplo para que la web arranque | Hecho: 5 celdas **sintéticas** en `web/public/data/` (`meta.synthetic = true`; la web muestra un aviso) |
| B1: `sen_slope`, `mann_kendall`, `footprint` | Hecho, en `altaris/stats.py` |
| B1: pruebas unitarias (pendiente conocida, 2 000 series de ruido ≈ 5 %, año extremo, faltantes) | Hecho, más 23 pruebas adicionales: 27 en verde con `python -m pytest` |
| B1: motor sobre la celda real de Rol 1 (H1) | **Pendiente: necesita los datos de Rol 1** |
| B2: `04_trends`, `05_footprint`, FDR, `08_verdict`, exportar JSON | Hecho y probado de punta a punta |
| B3: integrar la prueba ENSO (Rol 3) y la bandera de 2014 (Rol 1) | Hecho: se leen de `enso_test.csv` y `break_2014.csv`. Si faltan, el veredicto lleva `enso_pendiente` o `salto_2014_pendiente` |
| B3: `09_calibration` (falsos positivos y potencia) | Hecho |
| B3: tabla resumen por veredicto, país e indicador para Rol 6 | Hecho: `verdict_summary.csv` (también sale en consola) |
| B4–B5: receta reproducible | Hecho: `meta.json → recipe` (el pasaporte la incluye) |
| B4–B5: revisión manual de 10 celdas | **Pendiente: necesita datos reales** |

**Tiempos con 2 000 celdas × 3 indicadores** (datos de prueba del mismo tamaño): tendencias 47 s, huella 29 s (en paralelo; eran 476 s antes de optimizar), calibración con 1 000 series unos 90 s. Todo junto tarda menos de 3 minutos.

## Decisiones para el kickoff

### 1. Nivel FDR: 0.05 o 0.10
Propuesta: **0.10**, siguiendo la sugerencia de Wilks (2016) de usar alrededor del doble del nivel global. Esa referencia sigue sin verificar (es tarea de Rol 3).

### 2. El segundo disparador de `limitada` se activa con ruido
La regla 4.6 dice: `limitada` si p < 0.10 **o** (`sign_agreement` ≥ 0.80 **y** |pendiente| ≥ 5 % de la media por década).

Con lluvia de alta variabilidad interanual, una pendiente del 5 % por década queda dentro del ruido, y en ventanas muy solapadas el signo casi siempre coincide con el del periodo base. La calibración, con 1 000 series barajadas (sin tendencia) y datos de prueba con un coeficiente de variación entre 0.12 y 0.35, da:

| Opción | Falsos positivos `limitada` | `consistente` | Potencia, −10 %/déc (`limitada` o más) | −5 %/déc | −20 %/déc |
|---|---|---|---|---|---|
| Regla del plan (`p_max_sign_rule: null`) | **32 %** | 0 % | 72 % | 45 % | 94 % |
| Añadir p < 0.30 | 22 % | 0 % | 64 % | 36 % | 92 % |
| Añadir p < 0.20 | 17 % | 0 % | 57 % | 28 % | 89 % |

La potencia para `consistente` no cambia entre opciones: 9 % con −10 %/déc y 44 % con −20 %/déc.

**Lectura:**
- `consistente` es muy estricto: casi nunca da falsos positivos, pero solo detecta una tendencia fuerte (−20 %/déc) en algo menos de la mitad de los casos. Es coherente con el mensaje del plan ("en 24 años la mayoría de las tendencias que se afirman no se sostienen") y debe decirse en la explicación de `sin_evidencia`.
- Con la regla actual, **una de cada tres celdas sin tendencia saldría `limitada`**. La interfaz ya dice "señal débil, no confirmada", pero el mapa se vería más "lleno" de lo que los datos justifican.

**Propuesta:** decidir **antes de ver el mapa real** entre dejar la regla tal cual o activar `p_max_sign_rule: 0.20`. Es una línea en `config.yaml` y queda registrada en `meta.json`. Si se cambia después de ver el mapa, hay que anotarlo en `threshold_changes`.

*Estas cifras salen de datos de prueba. Se recalculan solas con los datos reales de IMERG (`09_calibration.py`), y esas son las que van en el pasaporte y el formulario.*

### 3. Umbral de `alta_variabilidad`
Propuesta: coeficiente de variación > 0.30. Mirar la distribución real en `trends.csv` (columna `cv`) antes de congelarlo.

## Cosas que conviene saber

- **Hamed-Rao puede fallar** en series cortas (da una varianza negativa). En ese caso se usa la variante TFPW (Yue et al., 2002) y se registra `mk_variant = "tfpw"`. Rol 3: confirmar que esta referencia se puede citar.
- La calibración da por superada la prueba ENSO y supone que no hay bandera de 2014 en las series barajadas. Ambos supuestos están en `meta.json → calibration.assumptions`.
- `limitations` y `verdict_reasons` son **claves fijas**; la web las traduce. Si Rol 3 cambia un texto, se cambia en `web/src/i18n.ts`, no en el pipeline.
- Los campos que se añadieron al contrato 3.2 están listados en `pipeline/README.md`. Son todos añadidos: no se quitó ni se renombró nada.

## Lo que necesito de otros roles

| De | Qué | Formato |
|---|---|---|
| Rol 1 | `cells.csv`, `indicators.csv` (o `.nc`), `climatology.csv`, `break_2014.csv` | `pipeline/README.md` |
| Rol 3 | `enso_test.csv`, `enso_phases.csv` | `pipeline/README.md` |
| Rol 6 | `narratives.json` (si no está, se usa la plantilla) | `{"<id>\|<indicador>": {"es", "en", "generated_by"}}` |
| Equipo | Congelar FDR, `p_max_sign_rule` y el umbral de coeficiente de variación | Kickoff |
