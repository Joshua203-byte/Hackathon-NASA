# Estado y reparto (corte sábado 14 de noviembre, 23:50, El Salvador)

**Actualización del 15 de noviembre.** La ingesta IMERG ya está en `main` y el [piloto real de Choluteca](07-piloto-real-choluteca.md) quedó conectado al panel. El resto de este documento conserva el corte histórico de las 23:50. Para procedencia y tareas restantes de datos, consultar [Rol 1](rol1-datos.md).

Entrega: domingo 15 de noviembre 23:59. Meta interna de envío: 21:00. Este documento resume qué hay en `main`, qué falta y quién hace qué desde ahora. Reemplaza el reparto por defecto de [05-cronograma-y-relevos.md](05-cronograma-y-relevos.md) solo donde lo contradice; los horarios H1 a H3 de ese documento siguen.

## 1. Qué hay en `main`

| Pieza | Dónde | Estado |
|---|---|---|
| Plan v3.1 | `PROPUESTA_ALTARIS_PLAN_EQUIPO.md` | Vigente (Rol 6 = Andrés) |
| Panel de celda (Rol 5) | `rol5-panel-app/` | Funciona con 4 celdas simuladas; falta cargar JSON real |
| Motor estadístico (Rol 2) | `pipeline/` | Listo y probado: 63 pruebas pasan (Python 3.10 y 3.13). Sen, Mann-Kendall (Hamed-Rao si hay autocorrelación), huella de estabilidad, FDR, veredicto base y por ventana, razones, calibración, exportador al contrato del panel, resumen por veredicto, receta reproducible |
| Contenido y entrega (Rol 6) | `docs/rol6/` | Formulario en inglés (borrador), fuentes y uso de IA, guion de pruebas, video de ensayo de 28 s con datos simulados, narrador `pipeline/10_narrate.py` |
| Datos reales de IMERG | — | **No hay.** Es la ruta crítica |
| ENSO y chequeo 2014 | — | No hay |
| Mapa MapLibre y URL pública | — | No hay |

Ramas abiertas que no están en `main`: `david-y-elena` (un Rol 2 y una web paralelos, ver sección 4). No se mezcla.

## 2. Ruta crítica

`datos reales (David) → piloto Choluteca → región completa → ENSO + 2014 → JSON final → URL pública → video y envío`.

Hasta que David entregue una serie real, nadie más puede validar números. Todo lo demás se adelanta en paralelo con datos simulados (`python pipeline/run_pilot.py --synthetic --out <carpeta>`).

## 3. Reparto

| Persona | Rol | Ahora (sábado noche) | Domingo | Entrega a |
|---|---|---|---|---|
| **David** | 1 · Datos | Descargar IMERG mensual (V07) 2001–2024 con earthaccess; serie de Choluteca primero. Confirmar DOI y si 2025 está completo | Región completa; segunda extracción de los sitios que elija Camila | `cells.csv`, `series.csv`, `monthly.csv` a Joshua y Camila |
| **Elena** | 4 · Mapa y despliegue | Con David: partir la descarga por años para ir el doble de rápido. Mapa MapLibre sobre el panel de Izel (4 celdas simuladas) | Despliegue y **URL pública** (P0 a las 12:00). Globo solo si P0 y P1 ya están | URL a Andrés |
| **Joshua** | 2 · Motor | Fijar umbrales (sección 5) y poner `frozen: true` en un commit **antes** de correr la región | Piloto Choluteca (H1 00:00 si llega la serie), región completa (H2 06:00), calibración de 1000, cifras para el formulario | JSON a Izel y Elena; cifras a Andrés y Camila |
| **Camila** | 3 · ENSO y QA | ONI de NOAA CPC; `enso.json`. Prueba de salto 2014 (Pettitt) en serie simulada para tener el script listo | `enso_results.csv` y `break2014.csv` con los mismos IDs; elegir 3 casos; revisar 10 celdas y los textos | CSV a Joshua; casos a Andrés |
| **Izel** | 5 · Panel | Conectar `rol5-panel-app/public/data/` al exportador de Joshua (hay JSON sintético de 40 celdas); confirmar la regla de ventanas y los códigos de razón (sección 5) | Cargar JSON real; recorrido y pasaporte con el caso real | URL final a Andrés junto con Elena |
| **Andrés** | 6 · Producto | Verificar acceso de envío al portal y que el equipo ve su pestaña Project; leer la guía íntegra vigente | 5 sesiones con personas (12:00–15:00); video final sobre versión congelada; formulario con cifras reales; **envío 21:00** | Confirmación de envío |

Regla de relevo (de [05](05-cronograma-y-relevos.md)): cada entrega indica archivo o enlace, versión, comprobación superada, limitación pendiente y quién continúa.

## 4. Un solo motor, una sola web

Elena y Joshua escribieron un Rol 2 cada uno. Se queda el de `pipeline/` de `main`, porque cumple el contrato del panel (incluye resultados por ventana) y tiene 60 pruebas. De la rama `david-y-elena` ya se adoptó: narrativa de plantilla, tabla resumen por veredicto para Rol 6, receta reproducible en `meta.json`, opción `p_max_sign_rule` y la calibración con varios coeficientes de variación. Sus notas de decisión están en la rama (`docs/rol2-motor-estadistico.md`).

La rama también trae su propia `web/`. Para no duplicar, la web oficial es `rol5-panel-app/`, a menos que el grupo decida lo contrario (decisión 4 abajo).

Narrador: el de Andrés (`10_narrate.py`) corre **después** de exportar y valida que no haya cifras ni frases predictivas inventadas. La plantilla de `pipeline/altaris/narrative.py` queda de respaldo.

## 5. Decisiones abiertas (resolver antes de ver el mapa real)

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| 1 | Nivel FDR | 0,05 (plan) o 0,10 (propuesta de Elena, cita sin verificar) | 0,05 hasta que Camila verifique la referencia |
| 2 | `p_max_sign_rule` | `null` (regla del plan) o 0,20 | Decidir con la calibración de 1000. Sin tope, entre ~20 % y ~32 % de las series sin tendencia salen `limitada`; con 0,20 baja a ~17 % a costa de potencia |
| 3 | Veredicto por ventana | Techo `limitada` (propuesto) | Izel confirma que el panel lo muestra así |
| 4 | Qué web se queda | `rol5-panel-app/` o `web/` | `rol5-panel-app/` |
| 5 | Códigos de razón | Los del motor (`pipeline/altaris/reasons.py`, exporta `reasons.json`) | Izel los toma de ahí |
| 6 | Periodo | 2001–2024 o 2001–2025 | 2024, salvo que David confirme 2025 completo |

Cualquier cambio de umbral **después** de ver el mapa se anota en `threshold_changes` de `pipeline/config.yaml`.

## 6. Contratos de entrada del motor

Formatos exactos en [pipeline/README.md](../pipeline/README.md): `cells.csv`, `series.csv` (largo: `cell_id,indicator,year,value`), `monthly.csv`, `enso_results.csv`, `break2014.csv`, `enso.json`. Si falta ENSO o 2014, el veredicto lo marca como pendiente y no bloquea. Sin FDR no hay `consistente`.

## 7. Qué no se puede afirmar todavía

Nada con datos reales. El video, el formulario y el panel usan hoy cifras **simuladas**; deben decirlo mientras sea así. No hay resultado de pruebas con personas. La calibración publicada en el pasaporte debe ser la de 1000 simulaciones con la configuración congelada, no las cifras de ensayo de este documento.
