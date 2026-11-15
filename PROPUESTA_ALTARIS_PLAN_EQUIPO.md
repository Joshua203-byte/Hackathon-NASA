# ALTARIS — Propuesta final y plan de trabajo por integrante

**Reto:** NASA Space Apps Challenge 2026 — *Be An Earth System Trend Detective!*
**Equipo:** Camila, Elena, Joshua, David, Marro, Arlie
**Documento generado:** sábado 14 nov 2026, 19:15 (hora de El Salvador)
**Cierre de entrega:** domingo 15 nov 2026, 23:59 hora local. **Meta interna de entrega: domingo 21:00.**

> Este documento describe el **alcance máximo**. Cada pieza lleva una prioridad (P0, P1, P2) para poder recortar sin rediseñar. Complementa al `contexto_maestro_y_especificaci_n_t_cnica_altaris.md`; donde se contradigan, manda este.

---

## 0. Cosas sin verificar (leer primero)

| Tema | Estado | Quién lo cierra |
|---|---|---|
| Texto oficial completo del reto | Solo se leyó el resumen publicado por sedes locales; el sitio oficial bloquea lectura automática | Rol 6, antes de las 20:30 |
| Guía de evaluación 2026 | No leída. Se asumen los 5 criterios de 2025: Impact, Creativity, Validity, Relevance, Presentation | Rol 6 |
| Requisitos del formulario de entrega y del video (30 s) | No leídos para 2026. Confirmar duración, formato, idioma y si hay que declarar uso de IA | Rol 6 |
| Nombres exactos de variables dentro de los archivos IMERG | Indicados de memoria; confirmar con `ds.data_vars` al abrir el primer archivo | Rol 1 |
| DOI y cita exacta de IMERG y NASA POWER | Confirmar en la página del dataset | Rol 1 |
| Parámetros de la API de NASA POWER | Confirmar en la documentación de la API | Rol 1 |
| Referencia Wilks (2016) sobre FDR en campos espaciales | Confirmar antes de citarla | Rol 3 |
| Que el "efecto espejo" de ENSO aparezca en IMERG para esta región | Es una **hipótesis a comprobar con los datos**, no un resultado garantizado | Rol 3 |

**Los criterios de evaluación no están en el repo.** Hay que añadirlos a `docs/` cuando Rol 6 los tenga.

---

## 1. La propuesta

### 1.1 En una línea
**ALTARIS es el detective que duda de su propia pista:** toma 24 años de lluvia medida por la NASA sobre el Triángulo Norte y muestra dónde hay una tendencia real, dónde no la hay y dónde nadie debería afirmar nada todavía.

### 1.2 Qué pide el reto y cómo se responde

| Pregunta del reto | Respuesta de ALTARIS |
|---|---|
| ¿Qué está cambiando? | Lluvia de temporada (may–oct), lluvia de canícula (jul–ago) y lluvia anual |
| ¿Dónde? | Mapa de celdas de 0.1° sobre Guatemala, El Salvador y Honduras |
| ¿Cuánto? | Pendiente de Sen en mm por década, con intervalo de confianza del 95 % |
| ¿Es significativo? | Mann-Kendall con corrección por autocorrelación y por comparaciones múltiples, **más** la prueba de estabilidad por ventanas y la prueba ENSO |
| Pista del enunciado: una variable puede subir en una región y bajar en otra por el mismo proceso | Módulo "Efecto espejo": respuesta de Pacífico y Caribe a El Niño |

### 1.3 Los tres diferenciadores

1. **Mapa de veredictos.** El mapa no se pinta por cuánto cambia la lluvia, sino por qué tan sólida es la evidencia de ese cambio.
2. **Huella de estabilidad.** Para cada celda se calcula la tendencia en todas las ventanas de años posibles y se dibuja como un triángulo de colores. Un triángulo uniforme es evidencia firme; uno manchado, evidencia frágil.
3. **Efecto espejo y prueba ENSO.** Se muestra cómo responde cada vertiente a El Niño y se comprueba si la tendencia sobrevive al descontar ENSO.

**Plus de validez:** se mide la tasa de falsos positivos del propio veredicto con series barajadas, y se publica en el pasaporte.

### 1.4 Regla de oro (no cambia)
ALTARIS analiza el pasado. No predice, no da recetas agronómicas y no afirma causas. La IA generativa solo redacta a partir de cifras ya calculadas.

### 1.5 Cómo se cubre cada criterio

| Criterio | Evidencia concreta en la entrega |
|---|---|
| Relevance | Las cuatro preguntas del reto respondidas en la primera pantalla; módulo espejo ligado a la pista del enunciado |
| Validity | Métodos estándar; umbrales fijados antes de ver resultados; pruebas unitarias; tasa de falsos positivos medida; contraste contra una segunda fuente; límites declarados |
| Creativity | Huella de estabilidad; mapa de solidez; "sin evidencia" tratado como hallazgo |
| Impact | Corredor Seco; tarjetas de planificación condicionadas al veredicto; prueba con 5 usuarios reales y sus resultados |
| Presentation | Una sola historia en 30 s; enlace que abre la vista exacta; interfaz bilingüe |

---

## 2. Alcance por prioridad

| Prioridad | Pieza | Si se recorta |
|---|---|---|
| **P0** | Cubo IMERG mensual 2001–2024 recortado a la región | Plan B: NASA POWER por puntos |
| **P0** | Indicadores may–oct y jul–ago por celda y año | — |
| **P0** | Sen + Mann-Kendall + FDR por celda | — |
| **P0** | Huella de estabilidad (todas las ventanas) | Reducir a 3 ventanas fijas |
| **P0** | Veredicto determinista | — |
| **P0** | Mapa de veredictos + panel de celda con serie y huella | Lista de 20–30 sitios en vez de mapa |
| **P0** | Enlace profundo (URL con estado) | — |
| **P0** | Video de 30 s + formulario en inglés | — |
| **P1** | ENSO: clasificación de años, mapa de correlación, vista espejo, prueba ENSO | Queda solo el Caso 3 con dos sitios |
| **P1** | Tarjetas Decision Readiness (Agricultura, Comunidades) | Una sola tarjeta genérica |
| **P1** | Evidence Passport (JSON + Markdown + imprimir) | Solo descarga JSON |
| **P1** | 3 casos guiados | 1 caso |
| **P1** | Narrador con IA generativa, pregenerado | Plantillas de texto sin IA |
| **P1** | Glosario con tooltips, interfaz ES/EN | Solo inglés |
| **P1** | Prueba con 5 usuarios + micro-validación | Solo la pregunta en la app |
| **P1** | Calibración de falsos positivos del veredicto | Se omite del pasaporte |
| **P2** | Indicador de lluvia anual | — |
| **P2** | Agrupamiento de celdas (ML no supervisado) | — |
| **P2** | Radiación solar NASA POWER + lente de Energía + Matriz territorial | La lente de Energía muestra "Análisis cuantitativo pendiente" |
| **P2** | Chequeo de homogeneidad TRMM→GPM (antes y después de 2014) | Se declara como limitación |

**Orden de recorte si hay retraso:** P2 completo → narrador con IA → interfaz en español → casos 2 y 3 → mapa completo (pasar a puntos).

---

## 3. Arquitectura

```
IMERG mensual (GES DISC)  ─┐
ONI (NOAA, auxiliar)      ─┼─► pipeline Python ─► JSON estáticos ─► web React (sin backend)
Límites de países         ─┘        (offline)        (en /web/public/data)
```

- Todo el cálculo ocurre **antes** de la demo. El navegador solo lee JSON. Sin servidor, sin llamadas en vivo.
- Mover el selector de ventana no recalcula nada: busca el resultado precalculado en la huella.

### 3.1 Estructura del repo

```
Hackathon-NASA/
├── pipeline/
│   ├── config.yaml              # bbox, periodo, umbrales del veredicto (se congela a las 20:15)
│   ├── 01_download_imerg.py
│   ├── 02_build_cube.py
│   ├── 03_indicators.py
│   ├── 04_trends.py
│   ├── 05_footprint.py
│   ├── 06_enso.py
│   ├── 07_clusters.py           # P2
│   ├── 08_verdict.py
│   ├── 09_calibration.py
│   ├── 10_narrate.py
│   ├── 11_export_json.py
│   ├── altaris/                 # funciones compartidas (stats.py, verdict.py, io.py)
│   └── tests/
├── data/                        # raw/ e interim/ van en .gitignore
├── web/                         # Vite + React + TypeScript
│   ├── public/data/             # salida del pipeline
│   └── src/
├── docs/
└── README.md
```

### 3.2 Contrato de datos (se congela en el kickoff)

**`meta.json`**
```json
{
  "generated_at": "2026-11-15T05:40:00-06:00",
  "pipeline_commit": "abc1234",
  "dataset": "GPM IMERG Final Run, mensual, 0.1°, V07",
  "dataset_doi": "POR CONFIRMAR",
  "period": [2001, 2024],
  "bbox": {"lat": [12.5, 18.5], "lon": [-92.5, -83.0]},
  "n_cells": 0,
  "indicators": ["may_oct_mm", "jul_aug_mm", "annual_mm"],
  "thresholds": { "ver config.yaml": true },
  "false_positive_rate": {"consistente": null, "limitada": null, "n_sim": 1000},
  "aux_data": ["NOAA CPC ONI"]
}
```

**`grid.json`** — una fila por celda, ligera, para pintar el mapa
```json
{
  "cells": [
    {
      "id": "N1345W08815",
      "lat": 13.45, "lon": -88.15,
      "country": "SLV",
      "cluster": null,
      "ind": {
        "jul_aug_mm": {
          "mean": 412.3, "slope_dec": -18.4, "ci95": [-34.2, -2.1],
          "p": 0.038, "p_fdr": 0.21,
          "sign_agreement": 0.71, "sig_fraction": 0.33,
          "enso_r": -0.52, "enso_p_fdr": 0.04,
          "valid_years": 24, "verdict": "limitada"
        }
      }
    }
  ]
}
```

**`cells/{id}.json`** — detalle, se carga al tocar la celda
```json
{
  "id": "N1345W08815",
  "name": null,
  "indicators": {
    "jul_aug_mm": {
      "units": "mm/2 meses",
      "series": [{"year": 2001, "value": 310.5, "anomaly": -12.4, "enso": "neutral"}],
      "statistics": {
        "method": "Theil-Sen + Mann-Kendall",
        "mk_variant": "original | hamed_rao",
        "lag1_autocorr": 0.08,
        "slope_per_decade": -18.4, "intercept": 0.0,
        "ci_95": [-34.2, -2.1], "p_value": 0.038, "adjusted_p_fdr": 0.21
      },
      "footprint": [[2001, 2010, -5.1, 0.72], [2001, 2011, -8.0, 0.44]],
      "enso_test": {
        "slope_without_strong_enso": -15.0, "p_without_strong_enso": 0.09,
        "slope_oni_removed": -16.2, "p_oni_removed": 0.06,
        "survives": true
      },
      "verdict": "limitada",
      "verdict_reasons": ["fdr_no_significativo", "huella_inestable"],
      "narrative": {"es": "...", "en": "..."},
      "limitations": ["..."]
    }
  }
}
```
`footprint` es una lista de `[año_inicio, año_fin, pendiente_por_década, p]`.

**Otros archivos:** `enso.json` (ONI por año y fase), `cases.json` (3 casos con su enlace profundo), `glossary.json`, `decision_rules.json`, `borders.geojson`.

**Identificador de celda:** centro de la celda, 2 decimales sin punto: `N1345W08815` = 13.45° N, 88.15° O.

**Valores de veredicto (claves fijas):** `consistente`, `limitada`, `sin_evidencia`, `incompleta`.

### 3.3 Parámetros de URL

`?cell=N1345W08815&ind=jul_aug_mm&win=2004-2024&layer=verdict&enso=off&lang=es&case=2`

---

## 4. Especificación científica

### 4.1 Datos

| Dato | Fuente | Uso |
|---|---|---|
| Lluvia mensual | GPM IMERG Final Run mensual, 0.1°. Colección `GPM_3IMERGM` versión 07 en GES DISC. Requiere cuenta Earthdata | Principal |
| Índice ENSO | ONI de NOAA CPC | Auxiliar, declarado como no-NASA |
| Límites de países | Natural Earth (admin 0) | Máscara de celdas |
| Radiación solar (P2) | NASA POWER, `ALLSKY_SFC_SW_DWN` | Lente de Energía |
| Lluvia de contraste | NASA POWER `PRECTOTCORR` o serie de Giovanni | Verificación cruzada y Plan B |

**Sobre la versión:** la colección se llama V07 y los archivos mensuales llevan `V07B` en el nombre. En el pasaporte se cita lo que diga la página del dataset.

**Región:** latitud 12.5 a 18.5 N, longitud 92.5 a 83.0 O. Son unas 60 × 95 celdas; tras la máscara de países quedan aproximadamente 2 000 celdas de tierra.

**Conversión obligatoria:** IMERG mensual viene como tasa en mm/h.
`mm_mes = tasa × 24 × días_del_mes` (días reales, con bisiestos).

### 4.2 Indicadores (por celda y año)

| Clave | Definición | Año válido si |
|---|---|---|
| `may_oct_mm` | Suma de mayo a octubre | Los 6 meses existen |
| `jul_aug_mm` | Suma de julio y agosto | Los 2 meses existen |
| `annual_mm` (P2) | Suma de enero a diciembre | Los 12 meses existen |

Nunca se rellena con ceros. La anomalía es el valor menos la media 2001–2024 de la celda.

### 4.3 Tendencia y significancia

1. **Pendiente de Sen** con `scipy.stats.theilslopes(y, x, alpha=0.95)`. Se multiplica por 10 para mm por década.
2. **Mann-Kendall** con `pymannkendall`.
   - Se calcula la autocorrelación de retardo 1 de la serie sin tendencia.
   - Si es significativa, se usa la variante de Hamed y Rao; si no, la prueba original. Se guarda cuál se usó.
3. **Comparaciones múltiples:** Benjamini-Hochberg sobre todas las celdas de tierra, por indicador, con `statsmodels.stats.multitest.multipletests(method="fdr_bh")`.
   - Los campos de lluvia tienen correlación espacial. Wilks (2016) propone usar un nivel FDR de aproximadamente el doble del nivel global. Decidir 0.05 o 0.10 en el kickoff y dejarlo en `config.yaml`.

### 4.4 Huella de estabilidad

- Ventanas: todo par (inicio, fin) dentro de 2001–2024 con longitud mínima de 10 años. Son **120 ventanas** por serie.
- Para el veredicto solo cuentan las de 15 años o más: **55 ventanas**.
- Por ventana: pendiente de Sen y p de Mann-Kendall.
- Métricas resumen:
  - `sign_agreement`: fracción de ventanas (≥15 años) con el mismo signo que el periodo base.
  - `sig_fraction`: fracción de ventanas (≥15 años) con p < 0.05 y el mismo signo.
- **Aviso que debe aparecer en la interfaz y en el pasaporte:** las ventanas se solapan y no son pruebas independientes. La huella es una exploración de sensibilidad, no una prueba formal, y sus p no se corrigen.

### 4.5 ENSO

1. Descargar ONI. Para cada año, promediar las temporadas trimestrales que cubren el indicador (por ejemplo MJJ a ASO para may–oct; JJA para jul–ago).
2. Fase del año: El Niño si el promedio ≥ +0.5; La Niña si ≤ −0.5; neutral en otro caso. "Fuerte" si el valor absoluto ≥ 1.0. **Las fases se calculan del archivo, no se escriben de memoria.**
3. **Mapa de respuesta:** correlación de Spearman entre ONI y lluvia por celda, con FDR. Capa adicional: anomalía media en años El Niño menos años neutrales.
4. **Prueba ENSO de la tendencia** (dos variantes, se guardan ambas):
   - Quitar los años ENSO fuertes y recalcular Sen y Mann-Kendall.
   - Regresión lineal de la lluvia contra ONI y Mann-Kendall sobre los residuos.
   - `survives = true` si la pendiente conserva el signo y queda dentro del IC 95 % del periodo base.
5. **Efecto espejo:** elegir con los datos un par de celdas (o dos grupos) con correlación ONI de signo opuesto.

**Cautelas:** hay pocos años El Niño en 24 años, así que la potencia es baja. Si el espejo no aparece con claridad, se reporta tal cual; el hallazgo sería "en este registro no se distingue".

### 4.6 Veredicto (reglas deterministas, en `config.yaml`)

Se evalúan en este orden:

| Veredicto | Regla |
|---|---|
| `incompleta` | Menos de 22 años válidos de 24 |
| `consistente` | p FDR < nivel elegido **y** el IC 95 % no incluye 0 **y** `sign_agreement` ≥ 0.90 **y** `sig_fraction` ≥ 0.50 **y** la prueba ENSO sobrevive |
| `limitada` | No es consistente, y además: p sin ajustar < 0.10, **o** `sign_agreement` ≥ 0.80 con pendiente de al menos 5 % de la media por década |
| `sin_evidencia` | Todo lo demás |

- Etiqueta aparte `alta_variabilidad`: coeficiente de variación de la serie por encima del umbral de `config.yaml`. Activa el tercer escenario de la matriz de planificación.
- **Los umbrales se fijan en el kickoff y no se tocan después de ver el mapa.** Si se cambian, se anota en el pasaporte.
- Prohibido traducir p < 0.05 como "95 % de probabilidad de que el cambio sea real".

### 4.7 Calibración del veredicto

- Tomar 1 000 series reales al azar, barajar el orden de los años (eso destruye cualquier tendencia) y pasarlas por el motor completo.
- Reportar qué porcentaje sale `consistente` y `limitada`. Ese número va en `meta.json` y en el pasaporte.
- Nota: barajar también destruye la autocorrelación; se declara.

### 4.8 Agrupamiento de celdas (P2)

- Rasgos por celda: las 24 anomalías estandarizadas del indicador, más la correlación con ONI.
- K-means con k de 2 a 6; elegir k por coeficiente de silueta. Semilla fija.
- Uso: capa del mapa "regiones que se comportan parecido" y selección de los dos grupos del efecto espejo.

### 4.9 Limitaciones que deben mostrarse

- Celda de unos 11 km: no ve microclimas de ladera.
- Agregados mensuales: no miden rachas de días secos ni eventos extremos diarios.
- 24 años es un registro corto; variabilidad decenal y tendencia pueden confundirse.
- El registro une la era TRMM con la era GPM (alrededor de 2014); puede haber una discontinuidad instrumental.
- IMERG Final se ajusta con pluviómetros; donde hay pocos, el ajuste es más débil.
- ONI no es dato de la NASA.

---

## 5. Roles

La asignación de nombres es **tentativa**: no conozco las fortalezas de cada persona. Reasignen en el kickoff; lo que importa es que los seis roles queden cubiertos.

| Rol | Responsabilidad | Tentativo | Suplente |
|---|---|---|---|
| 1 | Datos e ingesta | David | Rol 2 |
| 2 | Motor estadístico y veredicto | Joshua | Rol 3 |
| 3 | ENSO, agrupamiento y control de calidad científico | Camila | Rol 1 |
| 4 | Web: arquitectura, mapa, despliegue | Elena | Rol 5 |
| 5 | Web: panel de celda, huella, pasaporte | Marro | Rol 4 |
| 6 | Producto, contenido, usuarios, video y entrega | Arlie | Rol 5 |

### 5.1 Calendario común

| Bloque | Hora | Hito de equipo |
|---|---|---|
| B0 | Sáb 19:30–20:15 | Kickoff: roles, `config.yaml` y contrato JSON congelados, cuentas Earthdata, ramas |
| B1 | Sáb 20:15–00:00 | **H1 (00:00):** un sitio de punta a punta con datos reales; web navegable con datos de prueba |
| B2 | Dom 00:00–06:00 | **H2 (06:00):** todas las celdas calculadas; JSON v1 en la web |
| B3 | Dom 06:00–12:00 | **H3 (12:00):** P0 completo y desplegado; ENSO integrado |
| B4 | Dom 12:00–15:00 | Pruebas con usuarios; **H4 (15:00): congelación de funciones** |
| B5 | Dom 15:00–18:00 | Solo arreglos; **H5 (18:00):** video grabado, formulario redactado |
| B6 | Dom 18:00–21:00 | Revisión final; **H6 (21:00): ENTREGA** |
| B7 | Dom 21:00–23:59 | Colchón. No se añaden funciones |

**Puntos de decisión:**
- **Sáb 23:00 — datos:** si IMERG no está descargado al menos en un 50 %, activar Plan B (sección 7).
- **Dom 06:00 — mapa:** si el cálculo de todas las celdas no terminó, bajar a rejilla de 0.2° o a 30 puntos.
- **Dom 12:00 — P2:** se hace P2 solo si P0 y P1 están desplegados y funcionando.

**Sincronizaciones de 10 minutos:** 00:00, 06:00, 12:00, 15:00, 18:00.

**Sueño escalonado sugerido:** Rol 6 de 00:00 a 05:30; Roles 4 y 5 de 01:00 a 06:00; Roles 1 y 3 de 02:00 a 07:00; Rol 2 de 04:30 a 09:00.

---

### 5.2 Rol 1 — Datos e ingesta

**Entrega:** `data/interim/cube_monthly_mm.nc`, `data/interim/indicators.nc`, `data/interim/cells.csv`, `borders.geojson`, y la procedencia para el pasaporte.

**B0 (19:30–20:15)**
- [ ] Crear o confirmar cuenta Earthdata y probar el inicio de sesión con `earthaccess.login()`.
- [ ] Descargar **un** archivo mensual, medir tamaño y tiempo, y estimar el total de 288 archivos.
- [ ] Abrirlo y anotar: nombre del grupo, nombres de variables, orden de dimensiones, valor de relleno, unidades.

**B1 (20:15–00:00)**
- [ ] `01_download_imerg.py`: búsqueda `short_name="GPM_3IMERGM"`, versión 07, de 2001-01 a 2024-12; descarga en paralelo; reintentos; lista de faltantes.
- [ ] Si la descarga completa es lenta, usar el recorte espacial de GES DISC u OPeNDAP para bajar solo la región.
- [ ] `02_build_cube.py`: recortar a la región, concatenar en el tiempo, convertir a mm por mes, guardar NetCDF. Verificar que la latitud quede ordenada y las dimensiones como `(time, lat, lon)`.
- [ ] **A las 22:00:** entregar a Rol 2 la serie de una celda (la del sitio SV-01, 13.48 N, 88.18 O) aunque el cubo no esté completo.
- [ ] Máscara de países con Natural Earth: celda incluida si su centro cae dentro de GTM, SLV o HND. Guardar `cells.csv` con id, lat, lon, país.

**B2 (00:00–02:00, luego sueño)**
- [ ] `03_indicators.py`: indicadores por celda y año, con bandera de año válido.
- [ ] Comprobaciones: sin valores negativos; totales de may–oct en un rango creíble para la región; febrero de 2004 con 29 días.
- [ ] Entregar `indicators.nc` a Rol 2 y Rol 3. **Este es el camino crítico del equipo.**

**B3 (07:00–12:00)**
- [ ] Verificación cruzada: comparar 3 celdas con una segunda fuente (serie de Giovanni o NASA POWER). Documentar la diferencia.
- [ ] Redactar el bloque de procedencia: dataset, versión, DOI, fecha de descarga, parámetros de búsqueda.
- [ ] `11_export_json.py` junto con Rol 2: generar `grid.json`, `cells/*.json`, `meta.json`.

**B4–B5 (12:00–18:00)**
- [ ] P2 si se aprueba: radiación solar de NASA POWER para los sitios de los 3 casos, con el mismo motor de tendencias.
- [ ] P2: chequeo TRMM→GPM (comparar media y varianza antes y después de 2014 en una muestra de celdas).
- [ ] Apoyo a Rol 2 en regeneración de JSON.

**Listo cuando:** el cubo tiene 288 meses, la conversión está probada, y otra persona puede regenerar todo con un comando.

---

### 5.3 Rol 2 — Motor estadístico y veredicto

**Entrega:** `pipeline/altaris/stats.py`, `verdict.py`, scripts 04, 05, 08, 09 y los JSON finales.

**B0**
- [ ] Proponer los umbrales de `config.yaml` (sección 4.6) y congelarlos con el equipo.
- [ ] Publicar un `cells/EJEMPLO.json` y un `grid.json` de 5 celdas con datos inventados para que la web arranque.

**B1 (20:15–00:00)**
- [ ] `sen_slope(years, values) -> pendiente_dec, intercepto, ic_bajo, ic_alto`
- [ ] `mann_kendall(values) -> p, variante_usada, autocorr_lag1`
- [ ] `footprint(years, values, min_len=10) -> lista de [inicio, fin, pendiente, p]`
- [ ] Pruebas unitarias:
  - Serie con pendiente conocida más ruido: la pendiente estimada cae cerca de la real.
  - 2 000 series de ruido puro: cerca del 5 % dan p < 0.05.
  - Serie con un año extremo: Sen cambia poco.
  - Serie con valores faltantes: no se rellenan.
- [ ] **A las 23:30:** correr el motor en la celda real de Rol 1 y generar su JSON completo. Es el H1.

**B2 (00:00–04:30)**
- [ ] `04_trends.py` sobre todas las celdas y los indicadores. Medir tiempo en 50 celdas antes de lanzar todo.
- [ ] Si es lento: paralelizar con `joblib` por celda.
- [ ] `05_footprint.py`: 120 ventanas por serie.
- [ ] FDR por indicador sobre las celdas de tierra.
- [ ] `08_verdict.py` (sin la condición ENSO si Rol 3 aún no entrega; se añade después).
- [ ] Exportar JSON v1 y avisar a Rol 4 y Rol 5. Es el H2.

**B3 (09:00–12:00)**
- [ ] Integrar la prueba ENSO de Rol 3 en el veredicto y regenerar.
- [ ] `09_calibration.py`: 1 000 series barajadas; escribir la tasa en `meta.json`.
- [ ] Tabla resumen: cuántas celdas por veredicto, por país y por indicador. Pasarla a Rol 6.

**B4–B5**
- [ ] Revisar a mano 10 celdas al azar: ¿el veredicto coincide con lo que se ve en la serie y la huella?
- [ ] Escribir el fragmento de "receta reproducible" del pasaporte.
- [ ] Regeneraciones finales. Después de las 15:00 solo se regenera si hay un error.

**Listo cuando:** las pruebas pasan, el mismo dato produce siempre el mismo JSON, y cada veredicto trae sus razones en `verdict_reasons`.

---

### 5.4 Rol 3 — ENSO, agrupamiento y control de calidad científico

**Entrega:** `06_enso.py`, `07_clusters.py`, `enso.json`, selección de los 3 casos, lista de limitaciones y referencias.

**B0**
- [ ] Descargar el archivo ONI de NOAA CPC y guardarlo con la fecha de descarga.

**B1 (20:15–00:00)**
- [ ] Función que da el ONI medio y la fase de cada año para cada indicador (sección 4.5).
- [ ] `enso.json` con año, valor y fase.
- [ ] Con la celda de Rol 1: correlación de Spearman lluvia–ONI y las dos variantes de la prueba ENSO.
- [ ] Reunir las referencias científicas de respaldo (método Theil-Sen, Mann-Kendall, FDR en campos, ENSO en Centroamérica, IMERG). **Solo se citan las que alguien abrió y leyó.**

**B2 (00:00–02:00, luego sueño)**
- [ ] `06_enso.py` listo para correr sobre `indicators.nc`: correlación por celda con FDR, compuesto El Niño menos neutral, prueba ENSO por celda.
- [ ] Dejar el script lanzado o entregado a Rol 2.

**B3 (07:00–12:00)**
- [ ] Entregar a Rol 2 los campos `enso_r`, `enso_p_fdr` y `enso_test`.
- [ ] **Decidir si el efecto espejo existe en los datos.** Mirar el mapa de correlación: ¿hay zonas de signo opuesto que pasen FDR?
  - Si sí: elegir el par de celdas o grupos.
  - Si no: redactar el hallazgo como "no distinguible en este registro" y proponer el mejor contraste disponible.
- [ ] Elegir los 3 casos **desde los resultados**:
  - Caso 1: celda del Corredor Seco con su veredicto real, sea cual sea.
  - Caso 2: celda donde el periodo base es significativo y la huella es inestable.
  - Caso 3: el par del efecto espejo.
- [ ] Escribir `cases.json` con los enlaces profundos.

**B4–B5 (12:00–18:00)**
- [ ] P2 si se aprueba: `07_clusters.py` y capa de grupos.
- [ ] Auditoría de textos: revisar cada frase de la web, el video y el formulario contra la regla de oro. Marcar toda frase que suene a predicción o a causa.
- [ ] Lista final de limitaciones (sección 4.9) para el pasaporte.
- [ ] Preparar respuestas a preguntas probables del jurado: por qué no ML, por qué 24 años, por qué ONI, qué pasa con 2014.

**Listo cuando:** cada afirmación científica de la entrega tiene un número en los JSON o una referencia leída que la respalde.

---

### 5.5 Rol 4 — Web: arquitectura, mapa y despliegue

**Entrega:** aplicación desplegada con URL pública, mapa con capas, estado en la URL.

**B0**
- [ ] Crear `web/` con Vite + React + TypeScript. Definir los tipos TypeScript a partir del contrato de la sección 3.2.
- [ ] Decidir librerías con Rol 5 y no cambiarlas: mapa (MapLibre GL o Leaflet), gráficas (Recharts o Plotly).
- [ ] Reglas de ramas: una rama por rol, `main` siempre desplegable.

**B1 (20:15–00:00)**
- [ ] Estructura de la página: mapa a la izquierda, panel de celda a la derecha, barra superior con indicador, capa e idioma.
- [ ] Capa de celdas a partir de `grid.json` (rectángulos de 0.1°), con los datos de prueba de Rol 2.
- [ ] Estado global sincronizado con la URL (sección 3.3). Cargar la app desde un enlace debe reproducir la vista exacta.
- [ ] Primer despliegue (Vercel, Netlify o GitHub Pages) esta misma noche, aunque sea con datos de prueba.

**B2 (00:00–01:00, luego sueño)**
- [ ] Clic en celda carga `cells/{id}.json` y lo pasa al panel de Rol 5.

**B3 (06:00–12:00)**
- [ ] Conectar los JSON reales. Medir rendimiento con unas 2 000 celdas; si va lento, pasar a canvas o a una capa ráster.
- [ ] Capas del mapa: veredicto (por defecto), pendiente, estabilidad (`sign_agreement`), respuesta a ENSO.
- [ ] Leyenda por capa. Paleta distinguible para daltonismo; el veredicto no depende solo del color (añadir textura o icono).
- [ ] Bordes de países y nombres de referencia.
- [ ] Pantalla de entrada "Claim Investigator": tres preguntas que abren los 3 casos.

**B4–B5 (12:00–18:00)**
- [ ] Interfaz ES/EN.
- [ ] Vista usable en móvil (los usuarios de prueba pueden abrirla desde el teléfono).
- [ ] Estados de carga y de error; mensaje claro si una celda no tiene datos.
- [ ] P2: capa de grupos.
- [ ] 15:00: congelar. Después solo arreglos.
- [ ] 17:30: probar la URL pública en otro navegador, en incógnito y en un teléfono.

**Listo cuando:** la URL pública abre en menos de 3 segundos, los enlaces de los 3 casos funcionan, y nada depende de un servidor.

---

### 5.6 Rol 5 — Web: panel de celda, huella y pasaporte

**Entrega:** panel de evidencia completo, vista espejo, pasaporte exportable.

**B1 (20:15–00:00)** — con el JSON de ejemplo
- [ ] Encabezado del panel: veredicto en grande, razones, completitud ("24/24 años válidos").
- [ ] Gráfica de la serie: valores por año, recta de Sen, banda del IC 95 %, unidades en el eje.
- [ ] **Huella de estabilidad:** matriz triangular, eje X año de inicio, eje Y año de fin. Color por signo de la pendiente; intensidad o borde por significancia. Tooltip con ventana, pendiente y p.
- [ ] Clic en una casilla de la huella fija esa ventana y actualiza la URL.

**B2 (00:00–01:00, luego sueño)**
- [ ] Comparador lado a lado: periodo base contra ventana elegida (pendiente, IC, p, veredicto de la ventana).

**B3 (06:00–12:00)**
- [ ] Conectar datos reales.
- [ ] Vista ENSO: barras coloreadas por fase; interruptor "quitar años ENSO fuertes" que muestra la pendiente y el p de `enso_test`.
- [ ] Vista espejo: dos celdas lado a lado con la misma escala.
- [ ] Texto del narrador (`narrative`) bajo el veredicto.
- [ ] Aviso visible: "las ventanas se solapan; esto es una prueba de sensibilidad".

**B4–B5 (12:00–18:00)**
- [ ] Tarjetas Decision Readiness leyendo `decision_rules.json`: Qué observamos / Líneas de planificación / Qué falta saber.
- [ ] Evidence Passport: descarga JSON, descarga Markdown, hoja de estilo para imprimir, botón de copiar enlace.
- [ ] Tooltips de glosario desde `glossary.json`.
- [ ] Micro-validación al final del pasaporte: 2 preguntas, resultado guardado donde indique Rol 6.
- [ ] P2: Matriz territorial (lluvia contra radiación solar en el mismo sitio).

**Listo cuando:** una persona sin contexto puede, en un minuto, ver la tendencia, mover la ventana y entender por qué el veredicto es el que es.

---

### 5.7 Rol 6 — Producto, contenido, usuarios, video y entrega

**Entrega:** textos de la app, resultados de usuarios, video, formulario enviado.

**B0 (antes de las 20:30) — lo más urgente del equipo**
- [ ] Leer el texto oficial del reto, la guía de entrega 2026 y la guía de evaluación 2026. Copiarlos a `docs/`.
- [ ] Avisar de inmediato si algo contradice este plan (variables obligatorias, formato del video, idioma, declaración de IA).
- [ ] Confirmar que los 6 están registrados y en el mismo equipo en la plataforma.

**B1 (20:15–00:00)**
- [ ] `glossary.json` (ES/EN): mm por temporada, pendiente de Sen, p-valor, intervalo de confianza, FDR, ENSO/ONI, huella de estabilidad, completitud.
- [ ] `decision_rules.json`: la matriz de la sección 4 del contexto maestro, con clave `escenario × veredicto × lente`. Lentes: Agricultura y Comunidades. Energía con "Análisis cuantitativo pendiente" salvo que se apruebe P2.
- [ ] Enlaces de siguiente paso: SERVIR (índice de estrés evaporativo) y NASA Harvest. Verificar que los enlaces abran.
- [ ] Primer borrador del guion del video (sección 8).

**B3 (05:30–12:00)**
- [ ] Narrador (`10_narrate.py`):
  - Entrada: el JSON de la celda. Salida: 2 o 3 frases en ES y EN.
  - Se genera **antes** y se guarda en el JSON. No hay llamadas a IA durante la demo.
  - Validador: todo número del texto debe existir en el JSON; lista de frases prohibidas ("va a llover", "predice", "95 % de probabilidad", "causa").
  - Con unas 2 000 celdas, generar con IA solo los 3 casos y las celdas de sitios con nombre; el resto usa plantilla.
  - Plan B: plantillas de texto para todo.
- [ ] Textos de los 3 casos a partir de lo que elija Rol 3.
- [ ] Protocolo de prueba con usuarios: 3 tareas ("encontrá tu zona", "¿la lluvia está bajando ahí?", "¿qué harías con esto?") y 2 preguntas de comprensión.
- [ ] Reclutar 5 personas (ideal: alguien de agricultura, un técnico municipal, un estudiante, dos ajenos al tema).

**B4 (12:00–15:00)**
- [ ] Hacer las 5 pruebas. Anotar: tiempo por tarea, respuestas de comprensión, frases textuales.
- [ ] Pasar a Roles 4 y 5 solo los 3 problemas más graves.
- [ ] Resumen de resultados en `docs/` con números reales. No se inventan ni se redondean hacia arriba.

**B5 (15:00–18:00)**
- [ ] Grabar el video sobre la app congelada. Dos tomas de respaldo.
- [ ] Redactar el formulario en inglés: resumen, cómo responde al reto, datos NASA usados, datos auxiliares, uso de IA, enlaces al repo y a la demo.
- [ ] README del repo: qué es, cómo reproducir, estructura, créditos, limitaciones.

**B6 (18:00–21:00)**
- [ ] Revisión cruzada con Rol 3 de todos los textos.
- [ ] Comprobar repo público, demo abierta en incógnito, video reproducible.
- [ ] **Enviar a las 21:00.** Captura de pantalla de la confirmación.

**Listo cuando:** la entrega está enviada, y cada cifra del formulario y del video coincide con los JSON publicados.

---

## 6. Dependencias críticas

```
Rol 1: celda de prueba (22:00) ──► Rol 2: motor en 1 sitio (23:30) ──► H1
Rol 1: indicators.nc (02:00)   ──► Rol 2: todas las celdas (04:30) ──► JSON v1 ──► Roles 4 y 5 (06:00)
Rol 1: indicators.nc (02:00)   ──► Rol 3: ENSO (09:00) ──► Rol 2: veredicto final (11:00) ──► JSON v2
Rol 3: casos (11:30)           ──► Rol 6: textos y narrador ──► Roles 4 y 5
App congelada (15:00)          ──► Rol 6: video (17:00) ──► entrega (21:00)
```

- Los Roles 4, 5 y 6 **no esperan datos reales**: trabajan con el JSON de ejemplo desde las 20:15.
- Si Rol 1 se atrasa, todo se atrasa. A las 23:00 se decide el Plan B sin discutir.

---

## 7. Riesgos y planes B

| Riesgo | Señal | Plan B |
|---|---|---|
| Sin cuenta Earthdata o descarga lenta | A las 23:00 hay menos del 50 % | NASA POWER por puntos (sin cuenta): rejilla de 30 a 60 puntos. Se declara que la fuente es POWER y no IMERG, y su resolución más gruesa |
| Cálculo de todas las celdas tarda demasiado | A las 04:00 va por menos de la mitad | Rejilla de 0.2° o solo may–oct y jul–ago |
| El mapa va lento con 2 000 celdas | Menos de 30 fps al mover | Dibujar en canvas o imagen ráster con clic por coordenada |
| El efecto espejo no aparece | Nada pasa FDR con signos opuestos | Se reporta como hallazgo; el Caso 3 pasa a ser "dos sitios, dos veredictos distintos" |
| Casi todo sale `sin_evidencia` | Tabla resumen de Rol 2 | Es un resultado válido y es el mensaje: "en 24 años la mayoría de las tendencias que se afirman no se sostienen". No se aflojan los umbrales |
| El narrador con IA inventa cifras | Falla el validador | Plantillas |
| Falla el despliegue | Dom 12:00 sin URL pública | Segundo proveedor ya preparado; última opción: demo grabada |
| El reto exige algo no previsto | Lectura de Rol 6 en B0 | Reunión de 10 minutos y ajuste del alcance |
| Cansancio y errores de última hora | — | Congelación a las 15:00 y entrega a las 21:00 |

---

## 8. Video de 30 segundos (borrador)

| Tiempo | Imagen | Voz (en inglés en la entrega) |
|---|---|---|
| 0–5 s | Titular: "Llueve cada vez menos en el Corredor Seco" | "Everyone says the rain is disappearing. Is it?" |
| 5–12 s | Mapa de veredictos apareciendo | "ALTARIS tests 24 years of NASA rainfall data, cell by cell." |
| 12–20 s | Serie con tendencia; se mueve la ventana y la huella cambia de color | "This trend looks real. Move the window four years, and it's gone." |
| 20–26 s | Vista espejo Pacífico y Caribe | "Same El Niño, opposite signals." |
| 26–30 s | Veredicto y pasaporte | "ALTARIS: evidence you can audit before you decide." |

Las frases de los segundos 12–26 se ajustan a lo que muestren los datos reales. Si el caso no existe en los datos, no se dice.

---

## 9. Lista de entrega

- [ ] Los 6 integrantes registrados y en el equipo
- [ ] Reto correcto seleccionado
- [ ] Repo público con README, licencia y pasos para reproducir
- [ ] Demo pública, probada en incógnito y en móvil
- [ ] Video subido y reproducible
- [ ] Formulario en inglés
- [ ] Datos NASA listados con versión y enlace; ONI y Natural Earth declarados como auxiliares
- [ ] Uso de IA declarado (narrador, y cualquier asistencia de código o texto)
- [ ] Limitaciones visibles en la app y en el pasaporte
- [ ] Resultados de la prueba con usuarios incluidos
- [ ] Botón "Submit for Judging" pulsado antes de las 21:00 y captura guardada

---

## 10. Preguntas abiertas para el equipo

1. ¿Quién tiene ya cuenta de Earthdata?
2. ¿Compiten en una sede local o en el evento virtual? ¿Hay premios locales con criterios propios?
3. ¿Quién tiene acceso a una API de IA generativa para el narrador, y con qué límite?
4. ¿Hay alguien con contactos en agricultura o alcaldías para las 5 pruebas del domingo?
5. ¿La asignación de roles de la sección 5 coincide con las fortalezas reales de cada uno?
