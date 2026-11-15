# ALTARIS — Propuesta final y plan de trabajo por integrante

**Reto:** NASA Space Apps Challenge 2026 — *Be An Earth System Trend Detective!*
**Equipo:** Camila, Joshua, Elena, Izel, David y Andrés
**Versión 3.1:** sábado 14 nov 2026, 21:15 (hora de El Salvador). Incorpora la revisión del grupo y las evidencias verificables por criterio de evaluación. La 3.1 corrige tres puntos sobre la v3 (ver abajo).
**Cierre de entrega:** domingo 15 nov 2026, 23:59 hora local. **Meta interna de entrega: domingo 21:00.**

> Este documento describe el **alcance máximo**. Cada pieza lleva una prioridad (P0, P1, P2) para poder recortar sin rediseñar. Es **autosuficiente**: reemplaza al contexto maestro anterior y no depende de ningún otro archivo del repo.

### Correcciones de la versión 3.1 (sobre la v3)

| Punto | En la v3 | En la v3.1 |
|---|---|---|
| Globo 3D | Se avanzaba la primera noche, en los huecos de B1 y B2 | Empieza solo cuando Rol 4 terminó su P0 de la noche. La primera noche es del mapa por celdas |
| Enlace de criterios de `docs/03` | Sin nota | La página enlazada muestra fechas de 2024; ninguna guía leída es la de 2026 |
| Calendario | Kickoff a las 19:30 | El kickoff se atrasó: los hitos H1 a H6 no se mueven, se comprime B1 |

### Cambios de la versión 3 (sobre la v2)

| Cambio | Antes (v2) | Ahora (v3) |
|---|---|---|
| Criterios de evaluación | Una tabla de cobertura | Evidencias y pruebas de aceptación por criterio, con dueño y compuerta a las 18:00 (sección 1.5) |
| Idea del grupo: clasificación por sector | Solo tarjetas de preguntas | Selector de lente que recolorea el mapa con los veredictos ya calculados (P1, sección 4.12) |
| Idea del grupo: aprender | Glosario y narrador | Recorrido guiado de 4 pasos para no expertos (P1, sección 4.13) |
| Globo 3D | Textura estática | Textura satelital de NASA con licencia por confirmar |
| Impact | No se declaraba replicabilidad | Replicable cambiando `config.yaml`, con prueba y README (P1) |
| Creativity | Sin posicionamiento | Sección 1.6, comparada con otras herramientas de NASA y por verificar |
| Demo en láminas | Sin lámina de equipo | La lámina 1 lleva equipo, integrantes y reto |
| Uso de IA | Registro de uso | Campo `generated_by` en los textos del narrador y comentario en el código asistido |
| Formulario con cinco personas | Lo absorbe Rol 3 | Lo redacta Rol 2 |
| Canícula | Regla ambigua | Promedio de jul–ago contra promedio de jun–sep |

### Cambios de la versión 2 (histórico)

| Cambio | Antes | Ahora |
|---|---|---|
| País foco | Triángulo Norte sin foco | Honduras como foco de los casos; la región de cálculo sigue siendo el Triángulo completo |
| Entrada de la app | Mapa 2D | Globo 3D con acercamiento a la región (P1), solo como presentación |
| Periodo | 2001–2024 fijo | Parámetro: hasta 2025 si IMERG Final lo tiene |
| Lluvia anual y ciclo mensual por celda | P2 | P0 |
| Chequeo del salto TRMM→GPM (2014) | P2 | P1, y limita el veredicto |
| Calibración | Solo falsos positivos | Falsos positivos y potencia |
| Segunda variable NASA | P2 | P1, solo en los sitios de los 3 casos |
| Tarjetas de decisión | Acciones sugeridas | Preguntas que conviene hacerse |
| Demo | Solo video | Video de 30 s o 7 láminas, según la guía 2026 |
| Formulario | Se redacta a las 15:00 | Se redacta desde la mañana |

---

## 0. Cosas sin verificar (leer primero)

| Tema | Estado | Quién lo cierra |
|---|---|---|
| Texto oficial completo del reto | Solo se leyó el resumen publicado por sedes locales; el sitio oficial bloquea lectura automática | Rol 6, antes de las 20:30 |
| Guía de evaluación 2026 | Se leyó la guía de jueces de 2025 (los 5 criterios y sus preguntas guía, sección 1.5). La de 2026 no | Rol 6 |
| Requisitos del formulario de entrega y del video (30 s) | No leídos para 2026. Confirmar duración, formato, idioma y si hay que declarar uso de IA | Rol 6 |
| Nombres exactos de variables dentro de los archivos IMERG | Indicados de memoria; confirmar con `ds.data_vars` al abrir el primer archivo | Rol 1 |
| DOI y cita exacta de IMERG y NASA POWER | Confirmar en la página del dataset | Rol 1 |
| Parámetros de la API de NASA POWER | Confirmar en la documentación de la API | Rol 1 |
| Referencia Wilks (2016) sobre FDR en campos espaciales | Confirmar antes de citarla | Rol 3 |
| Que el "efecto espejo" de ENSO aparezca en IMERG para esta región | Es una **hipótesis a comprobar con los datos**, no un resultado garantizado | Rol 3 |
| Que IMERG Final mensual de 2025 esté completo | Probable por la latencia de unos 3.5 meses, sin confirmar | Rol 1, al hacer la búsqueda |
| Ciclo de lluvias de la vertiente Caribe de Honduras | Se cree que su máximo cae hacia fin de año y que la canícula no aplica; comprobar con el ciclo mensual calculado | Rol 3 |
| Qué es exactamente `PRECTOTCORR` de NASA POWER y qué tan independiente es de IMERG | Sin confirmar | Rol 1 |
| Que la versión de MapLibre elegida traiga proyección de globo | Sin confirmar | Rol 4, en el kickoff |
| Reglas de entrega citadas en la revisión del grupo (30 s o 7 láminas, marca de agua en contenido generado con IA, sin datos de menores, todo en inglés, enlace público) | Vienen de las guías 2025 | Rol 6 |
| Campos obligatorios de las láminas (equipo, integrantes, reto, imagen, experiencia de usuario, uso de datos) | De la guía de entrega 2025 | Rol 6 |
| Licencia y cita de la textura satelital de NASA para el globo | Sin confirmar | Rol 6 |
| Cobertura de IMERG fuera del Triángulo, para sostener la afirmación de replicabilidad | Sin confirmar | Rol 1 |
| Afirmaciones sobre Climate Engine, DAVe y AppEEARS (sección 1.6) | Vienen del contexto maestro anterior, sin verificar | Rol 3 |

**Los criterios de evaluación no están copiados en el repo.** `docs/03-recursos-y-links.md` solo enlaza la guía de jueces. Al abrir ese enlace el 14 de noviembre, la página mostraba fechas de 2024 y llamaba "Influence" al criterio de impacto, así que parece una edición anterior. El resumen de la sección 1.5 viene de la guía de 2025. **Ninguna de las dos es la de 2026:** Rol 6 la busca, la copia a `docs/` y avisa si algo cambia.

Requisitos para llegar al juicio global según la edición enlazada: reto oficial; de 1 a 6 integrantes, todos registrados y con evento local asignado; formulario completo y enviado antes del cierre; todo en inglés (el video puede ir en otro idioma con subtítulos en inglés); trabajo original y todos los recursos externos listados.

---

## 1. La propuesta

### 1.1 En una línea
**ALTARIS es el detective que duda de su propia pista:** toma 24 años de lluvia medida por la NASA sobre el Triángulo Norte y muestra dónde hay una tendencia real, dónde no la hay y dónde nadie debería afirmar nada todavía.

**País foco: Honduras.** El cálculo cubre Guatemala, El Salvador y Honduras, pero los casos guiados y la historia se cuentan desde Honduras. Tiene costa Pacífica (el sur, dentro del Corredor Seco) y costa Caribe, así que el efecto espejo se puede buscar dentro de un solo país.

**De lo global a lo local.** La app abre con un globo 3D, se acerca a Centroamérica y entrega al usuario el mapa por celdas. El globo usa una textura satelital de NASA y no lleva datos globales: es la puerta de entrada.

**Replicable.** Cambiando el recuadro y el periodo en `config.yaml`, el pipeline regenera todo para otra región dentro de la cobertura de IMERG (se demuestra con un recorte, sección 5.2). En esta entrega solo se publica el Triángulo Norte. Elegir cualquier región desde el globo se declara como trabajo futuro.

### 1.2 Qué pide el reto y cómo se responde

| Pregunta del reto | Respuesta de ALTARIS |
|---|---|
| ¿Qué está cambiando? | Lluvia de temporada (may–oct), lluvia de canícula (jul–ago) y lluvia anual |
| ¿Dónde? | Mapa de celdas de 0.1° sobre Guatemala, El Salvador y Honduras |
| ¿Cuánto? | Pendiente de Sen en mm por década, con intervalo de confianza del 95 % |
| ¿Es significativo? | Mann-Kendall con corrección por autocorrelación y por comparaciones múltiples, **más** la prueba de estabilidad por ventanas y la prueba ENSO |
| Pista del enunciado: una variable puede subir en una región y bajar en otra por el mismo proceso | Módulo "Efecto espejo": respuesta de Pacífico y Caribe a El Niño |
| Sistemas interconectados | Segunda variable NASA (radiación solar o temperatura de NASA POWER) junto a la lluvia en los sitios de los 3 casos |
| ¿Por qué cambia? | Solo como **asociación** (ENSO, estacionalidad). Nunca se afirma causa |
| ¿Qué significa para mi sector? | Selector de lente (Agricultura, Comunidades, Energía) que muestra qué tan sólida es la evidencia del indicador relevante para cada sector. Nunca un índice de riesgo |

### 1.3 Los tres diferenciadores

1. **Mapa de veredictos.** El mapa no se pinta por cuánto cambia la lluvia, sino por qué tan sólida es la evidencia de ese cambio.
2. **Huella de estabilidad.** Para cada celda se calcula la tendencia en todas las ventanas de años posibles y se dibuja como un triángulo de colores. Un triángulo uniforme es evidencia firme; uno manchado, evidencia frágil.
3. **Efecto espejo y prueba ENSO.** Se muestra cómo responde cada vertiente a El Niño y se comprueba si la tendencia sobrevive al descontar ENSO.

**Plus de validez:** se mide con series barajadas cuántas veces el veredicto se equivoca (falsos positivos) y cuántas veces detecta una tendencia que se sabe que está (potencia). Ambos números se publican en el pasaporte.

**Cómo contarlo:** el análisis de sensibilidad a la ventana de años ya existe en la literatura climática. Se presenta como una aplicación original y accesible, no como un método inventado. Las tres piezas que se cuentan son la huella, el veredicto honesto y el espejo.

### 1.4 Regla de oro (no cambia)
ALTARIS analiza el pasado. No predice, no da recetas agronómicas y no afirma causas. La IA generativa solo redacta a partir de cifras ya calculadas. Los lentes por sector muestran qué tan sólida es la evidencia del indicador relevante; no miden riesgo ni vulnerabilidad.

### 1.5 Cómo se llega a 10 en cada criterio

**Aviso honesto:** 10 es la meta, no una garantía. El jurado puntúa lo que se entrega, y los resultados del análisis no se conocen hasta correrlo. Lo que este plan hace es convertir cada criterio en evidencias que se pueden comprobar antes de las 21:00. Las preguntas de cada criterio vienen de la guía de jueces de 2025 (confirmar con la de 2026).

| Criterio | Qué pregunta la guía | Evidencia que debe existir al entregar | Prueba de aceptación | Dueño en la compuerta |
|---|---|---|---|---|
| **Impact** | ¿Cuánta influencia puede tener, en calidad y en cantidad? ¿Ayuda a muchos o a pocos? | Problema real con un dato verificable sobre el Corredor Seco (fuente leída). Tres países y unas 2 000 celdas. Tres lentes de sector. Replicable a otra región cambiando `config.yaml`, con repo abierto y README. Recorrido guiado para no expertos. Prueba con 5 usuarios y resultados reales | La regeneración con otro recuadro funciona (Rol 1, 15:00). Resultados de usuarios en `docs/` con números reales. El formulario dice en tres frases quién lo usa y para qué | Rol 6 |
| **Creativity** | ¿Es novedoso o una mejora modesta de algo existente? | Huella de estabilidad; mapa por solidez de la evidencia; "sin evidencia" como hallazgo; efecto espejo; del globo a las celdas; posicionamiento comprobado (1.6) | El formulario nombra en una frase lo que, hasta donde pudimos comprobar, no hace otra herramienta. Una persona ajena identifica en 10 segundos qué es distinto en el mapa | Rol 3 |
| **Validity** | ¿Es científicamente válida? ¿Logrará su meta? ¿Funciona en condiciones reales? | Métodos estándar; umbrales congelados a las 20:15; pruebas unitarias; falsos positivos y potencia; chequeo de 2014; contraste de signo con una segunda fuente; límites visibles; referencias leídas; revisión manual de 10 celdas | Pruebas en verde; todo se regenera con un comando; cada cifra de la entrega existe en los JSON (auditoría de Rol 3); el validador del narrador sin fallos | Rol 2 |
| **Relevance** | ¿Responde al reto? ¿Está completo, es factible y es fácil de usar? | La tabla 1.2 respondida en la primera pantalla; efecto espejo o su resultado honesto; cada caso muestra la cadena lluvia ↔ ENSO ↔ segunda variable; P0 completo y desplegado; la URL abre en menos de 3 s; vista móvil | Lista P0 marcada a las 12:00; prueba de humo del enlace público cada 3 horas; un usuario completa las 3 tareas sin ayuda | Rol 4 |
| **Presentation** | ¿Contaron la historia con claridad: reto, solución y por qué importa? | Una frase central; demo en formato válido con los campos obligatorios; formulario redactado desde la mañana; subtítulos en inglés; enlaces públicos; glosario e interfaz ES/EN | Dos ensayos con cronómetro; una persona ajena entiende la idea en 30 segundos; checklist de la sección 9; enlaces probados en incógnito | Rol 5 |

**Compuerta de las 18:00.** Cada dueño revisa la columna de evidencia de su criterio. Lo que falte se corrige; si no hay tiempo, se declara como limitación en la entrega y no se oculta.

### 1.6 Posicionamiento frente a otras herramientas de NASA

Estas comparaciones vienen del contexto maestro anterior y **no están verificadas**. Rol 3 las comprueba abriendo la documentación de cada herramienta antes de usarlas en el formulario. Lo que no se pueda comprobar se quita o se escribe como "hasta donde pudimos comprobar".

| Herramienta | Para qué sirve | Lo que ALTARIS añade |
|---|---|---|
| NASA POWER DAVe y AppEEARS | Entregan datos y series para usuarios con experiencia | Evalúa si una tendencia se sostiene al cambiar la ventana de años y guía a quien no es técnico. De AppEEARS se adopta la etiqueta de completitud del dato |
| Climate Engine | Calcula tendencias sobre datos satelitales | Pruebas de sensibilidad interactivas, veredicto de solidez y preguntas para decidir |
| NASA SERVIR (índice de estrés evaporativo) y NASA Harvest | Monitoreo operativo de sequía y cultivos | ALTARIS es la puerta de entrada educativa y enlaza a ellas como siguiente paso; no las sustituye |

---

## 2. Alcance por prioridad

| Prioridad | Pieza | Si se recorta |
|---|---|---|
| **P0** | Cubo IMERG mensual 2001–2024 (o hasta 2025 si está completo) recortado a la región | Plan B: NASA POWER por puntos |
| **P0** | Indicadores may–oct, jul–ago y anual por celda y año, más el ciclo mensual medio por celda | — |
| **P0** | Sen + Mann-Kendall + FDR por celda | — |
| **P0** | Huella de estabilidad (todas las ventanas) | Reducir a 3 ventanas fijas |
| **P0** | Veredicto determinista | — |
| **P0** | Mapa de veredictos + panel de celda con serie y huella | Lista de 20–30 sitios en vez de mapa |
| **P0** | Enlace profundo (URL con estado) | — |
| **P0** | Demo (video de 30 s o 7 láminas) + formulario en inglés | — |
| **P1** | Chequeo del salto TRMM→GPM (2014) y marca de 2014 en la huella | Se declara como limitación |
| **P1** | Segunda variable NASA POWER en los sitios de los 3 casos | La lente de Energía muestra "Análisis cuantitativo pendiente" |
| **P1** | Globo 3D de entrada con textura satelital de NASA y acercamiento a la región | La app abre directo en el mapa |
| **P1** | Selector de lente por sector (Agricultura, Comunidades, Energía) que recolorea el mapa con los veredictos ya calculados | Se queda solo la lente de Agricultura |
| **P1** | Recorrido guiado de 4 pasos dentro del Caso 1, para aprender qué es una tendencia y por qué importa la ventana | Se deja el glosario con tooltips |
| **P1** | Prueba de replicabilidad: regenerar con otro recuadro (solo El Salvador) y README para otra región | Se quita la frase de replicabilidad del formulario |
| **P1** | ENSO: clasificación de años, mapa de correlación, vista espejo, prueba ENSO | Queda solo el Caso 3 con dos sitios |
| **P1** | Tarjetas de preguntas para decidir (Agricultura, Comunidades) | Una sola tarjeta genérica |
| **P1** | Evidence Passport (JSON + Markdown + imprimir) | Solo descarga JSON |
| **P1** | 3 casos guiados | 1 caso |
| **P1** | Narrador con IA generativa, pregenerado | Plantillas de texto sin IA |
| **P1** | Glosario con tooltips, interfaz ES/EN | Solo inglés |
| **P1** | Prueba con 5 usuarios + micro-validación | Solo la pregunta en la app |
| **P1** | Calibración del veredicto: falsos positivos y potencia | Se omite del pasaporte |
| **P2** | Agrupamiento de celdas (ML no supervisado) | — |
| **P2** | Matriz territorial y lente de Energía completa | — |

**Fuera del alcance (trabajo futuro en el formulario):** capa global de tendencias, elegir cualquier región del mundo, índice de vulnerabilidad social.

**Orden de recorte si hay retraso:** P2 completo → globo 3D → narrador con IA → segunda variable → interfaz en español → casos 2 y 3 → recorrido guiado → selector de lente → mapa completo (pasar a puntos).

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
  "calibration": {
    "n_sim": 1000,
    "false_positive_rate": {"consistente": null, "limitada": null},
    "power": {"injected_trend_pct_per_decade": -10, "detected_consistente": null, "detected_limitada_o_mas": null}
  },
  "aux_data": ["NOAA CPC ONI", "Textura satelital de la Tierra (NASA)"],
  "lenses": {"agri": ["may_oct_mm", "jul_aug_mm"], "com": ["annual_mm"], "ene": []}
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
  "monthly_climatology_mm": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
      "break_2014": {"pettitt_year": 2014, "p": 0.21, "flag": false},
      "verdict": "limitada",
      "verdict_reasons": ["fdr_no_significativo", "huella_inestable"],
      "narrative": {"es": "...", "en": "...", "generated_by": "AI | template"},
      "limitations": ["..."]
    }
  }
}
```
`footprint` es una lista de `[año_inicio, año_fin, pendiente_por_década, p]`.

**Otros archivos:** `enso.json` (ONI por año y fase), `cases.json` (3 casos con su enlace profundo), `glossary.json`, `decision_rules.json`, `tour.json` (textos del recorrido guiado, ES/EN), `borders.geojson`.

**Identificador de celda:** centro de la celda, 2 decimales sin punto: `N1345W08815` = 13.45° N, 88.15° O.

**Valores de veredicto (claves fijas):** `consistente`, `limitada`, `sin_evidencia`, `incompleta`.

### 3.3 Parámetros de URL

`?cell=N1345W08815&ind=jul_aug_mm&win=2004-2024&layer=verdict&enso=off&lang=es&case=2&lens=agri&tour=0`

`lens` toma `agri`, `com` o `ene`. `tour=1` abre el recorrido guiado.

---

## 4. Especificación científica

### 4.1 Datos

| Dato | Fuente | Uso |
|---|---|---|
| Lluvia mensual | GPM IMERG Final Run mensual, 0.1°. Colección `GPM_3IMERGM` versión 07 en GES DISC. Requiere cuenta Earthdata | Principal |
| Índice ENSO | ONI de NOAA CPC | Auxiliar, declarado como no-NASA. NOAA y KNMI Climate Explorer figuran entre los recursos oficiales del reto (`docs/03-recursos-y-links.md`), así que su uso está previsto |
| Límites de países | Natural Earth (admin 0) | Máscara de celdas |
| Segunda variable NASA (P1) | NASA POWER: `ALLSKY_SFC_SW_DWN` (radiación solar) o `T2M` (temperatura), solo en los sitios de los 3 casos | Mostrar un segundo sistema junto a la lluvia; lente de Energía |
| Lluvia de contraste | NASA POWER `PRECTOTCORR` o serie de Giovanni | Verificación cruzada y Plan B |

**Sobre la versión:** la colección se llama V07 y los archivos mensuales llevan `V07B` en el nombre. En el pasaporte se cita lo que diga la página del dataset.

**Periodo:** es un parámetro de `config.yaml`. Se descarga de 2001-01 hasta el último diciembre completo. Si 2025 está completo, el periodo base es 2001–2025; si no, 2001–2024. Los ejemplos de este documento usan 2001–2024.

**Región:** latitud 12.5 a 18.5 N, longitud 92.5 a 83.0 O. Son unas 60 × 95 celdas; tras la máscara de países quedan aproximadamente 2 000 celdas de tierra.

**Conversión obligatoria:** IMERG mensual viene como tasa en mm/h.
`mm_mes = tasa × 24 × días_del_mes` (días reales, con bisiestos).

### 4.2 Indicadores (por celda y año)

| Clave | Definición | Año válido si |
|---|---|---|
| `may_oct_mm` | Suma de mayo a octubre | Los 6 meses existen |
| `jul_aug_mm` | Suma de julio y agosto | Los 2 meses existen |
| `annual_mm` | Suma de enero a diciembre | Los 12 meses existen |

Nunca se rellena con ceros. La anomalía es el valor menos la media del periodo base de la celda.

**Ciclo mensual por celda:** media de cada mes del año sobre todo el periodo (12 valores). Sirve para dos cosas:
- Mostrar en el panel cuándo llueve en esa celda.
- Marcar dónde el indicador `jul_aug_mm` tiene sentido. La canícula es un rasgo del lado Pacífico. Regla: la celda tiene canícula si el promedio de la lluvia media de julio y agosto es menor que el promedio de la de junio y septiembre. El umbral se confirma en el kickoff y queda en `config.yaml`. Donde no se cumple, la interfaz avisa "en esta zona el indicador de canícula no aplica" y usa el anual por defecto.

### 4.3 Tendencia y significancia

1. **Pendiente de Sen** con `scipy.stats.theilslopes(y, x, alpha=0.95)`. Se multiplica por 10 para mm por década.
2. **Mann-Kendall** con `pymannkendall`.
   - Se calcula la autocorrelación de retardo 1 de la serie sin tendencia.
   - Si es significativa, se usa la variante de Hamed y Rao; si no, la prueba original. Se guarda cuál se usó.
3. **Comparaciones múltiples:** Benjamini-Hochberg sobre todas las celdas de tierra, por indicador, con `statsmodels.stats.multitest.multipletests(method="fdr_bh")`.
   - Los campos de lluvia tienen correlación espacial. Wilks (2016) propone usar un nivel FDR de aproximadamente el doble del nivel global. Decidir 0.05 o 0.10 en el kickoff y dejarlo en `config.yaml`.

### 4.4 Huella de estabilidad

- Ventanas: todo par (inicio, fin) dentro del periodo base con longitud mínima de 10 años. Son **120 ventanas** por serie con 2001–2024, o **136** con 2001–2025.
- Para el veredicto solo cuentan las de 15 años o más: **55 ventanas** con 2001–2024, o **66** con 2001–2025.
- El año 2014 se marca en la huella con una línea, porque ahí cambia la era de satélites (sección 4.10).
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

**Cautelas:**
- Hay pocos años El Niño en el registro, así que la potencia es baja. Si el espejo no aparece con claridad, se reporta tal cual; el hallazgo sería "en este registro no se distingue".
- El espejo puede no verse en may–oct si la vertiente Caribe tiene su temporada en otros meses. Por eso la correlación con ONI se calcula también con el indicador anual y, si hay tiempo, con la temporada lluviosa propia de cada celda según su ciclo mensual.
- Primero se busca el par dentro de Honduras (sur contra costa norte). Si no aparece ahí, se busca en toda la región.

### 4.6 Veredicto (reglas deterministas, en `config.yaml`)

Se evalúan en este orden:

| Veredicto | Regla |
|---|---|
| `incompleta` | Faltan más de 2 años válidos (menos de 22 de 24, o de 23 de 25) |
| `consistente` | p FDR < nivel elegido **y** el IC 95 % no incluye 0 **y** `sign_agreement` ≥ 0.90 **y** `sig_fraction` ≥ 0.50 **y** la prueba ENSO sobrevive **y** no hay bandera de salto en 2014 |
| `limitada` | No es consistente, y además: p sin ajustar < 0.10, **o** `sign_agreement` ≥ 0.80 con pendiente de al menos 5 % de la media por década |
| `sin_evidencia` | Todo lo demás |

- **Texto de `limitada` en la interfaz: "señal débil, no confirmada".** Con p sin ajustar < 0.10 en unas 2 000 celdas correlacionadas, parte de esas celdas será ruido. La interfaz lo dice junto al veredicto.
- Una celda con bandera de salto en 2014 no puede pasar de `limitada`, y lleva la razón `posible_salto_2014`.
- Etiqueta aparte `alta_variabilidad`: coeficiente de variación de la serie por encima del umbral de `config.yaml`. Activa el tercer escenario de la matriz de planificación.
- **Los umbrales se fijan en el kickoff y no se tocan después de ver el mapa.** Si se cambian, se anota en el pasaporte.
- Prohibido traducir p < 0.05 como "95 % de probabilidad de que el cambio sea real".

### 4.7 Calibración del veredicto

- Tomar 1 000 series reales al azar, barajar el orden de los años (eso destruye cualquier tendencia) y pasarlas por el motor completo.
- **Falsos positivos:** reportar qué porcentaje sale `consistente` y `limitada`.
- **Potencia:** a esas mismas series barajadas se les suma una tendencia conocida (−10 % de la media por década; repetir con −5 % y −20 % si hay tiempo) y se reporta qué porcentaje se detecta.
- Los dos números van en `meta.json` y en el pasaporte.
- Por qué importa: con pocos años y lluvia muy variable, `consistente` se activará pocas veces. Sin medir la potencia no se distingue "no hay tendencia" de "no podríamos verla aunque estuviera". Si la potencia sale baja, la interfaz lo dice en la explicación de `sin_evidencia`.
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

### 4.10 Chequeo del salto TRMM→GPM (P1)

El registro une dos eras de satélites alrededor de 2014. Un cambio de instrumento puede parecer una tendencia.

1. Prueba de punto de cambio de Pettitt por celda e indicador (por ejemplo con la librería `pyhomogeneity`).
2. Bandera `break_2014.flag = true` si el punto de cambio cae entre 2013 y 2015 con p < 0.05.
3. Reportar qué porcentaje de celdas lleva la bandera. Si es alto, se dice en la primera pantalla.
4. En la huella se marca 2014, para que se vea si la señal depende de cruzar ese año.

Límite: un salto real del clima en esos años se vería igual. La bandera significa "no se puede descartar un efecto instrumental", no "es un error".

### 4.11 Preguntas para decidir (reemplaza a las recomendaciones de acción)

ALTARIS no dice qué hacer. Según el escenario y el veredicto, muestra las preguntas que conviene responder con datos locales antes de decidir.

**Lente Agricultura**

| Escenario observado | Con veredicto `consistente` | Con `limitada` o `sin_evidencia` | Datos locales que faltan |
|---|---|---|---|
| Baja en lluvia de temporada o de canícula | ¿Cuánta humedad retiene el suelo de la parcela? ¿Hay acceso a riego auxiliar o a captación de agua lluvia? ¿Qué dice la asistencia técnica local sobre el calendario de siembra? | ¿Hay registros locales de lluvia o de humedad que confirmen lo que se percibe? ¿Qué decisiones costosas se están tomando hoy solo por percepción de sequía? | Textura del suelo, pendiente, variedad de semilla, disponibilidad de riego |
| Alza en lluvia acumulada | ¿Cómo drena la parcela? ¿Hay laderas expuestas a erosión? ¿Hay historial de enfermedades por exceso de humedad? | ¿Qué muestran los registros de eventos extremos diarios, que este análisis mensual no ve? | Topografía, historial de anegamiento, capacidad de drenaje |
| Alta variabilidad sin tendencia | ¿Qué capacidad hay de absorber un año malo? ¿Hay acceso a pronósticos de corto plazo? | Las mismas | Capacidad financiera, acceso a información agrometeorológica semanal |

**Lente Comunidades**

| Escenario observado | Preguntas | Datos locales que faltan |
|---|---|---|
| Baja en lluvia | ¿De qué fuentes depende el agua de consumo? ¿Qué pasó en los años más secos del registro? | Fuentes de agua, población que depende de ellas, registros de escasez |
| Alza en lluvia | ¿Qué zonas se han inundado o deslizado antes? ¿Quién vive ahí? | Mapas de amenaza local, registros de eventos |
| Alta variabilidad | ¿Qué planes existen para un año extremo en cualquier sentido? | Planes de contingencia, sistemas de alerta |

**Lente Energía:** solo en los sitios de los casos y solo si la segunda variable está lista. Si no, muestra "Análisis cuantitativo pendiente".

**Vulnerabilidad:** no se calcula ningún índice. Se muestra como lista de datos socioeconómicos que harían falta.

**Siguiente paso operativo:** enlaces a SERVIR y a NASA Harvest para monitoreo actual de sequía y cultivos. Rol 6 verifica que los enlaces abran.

### 4.12 Selector de lente por sector (P1)

El selector cambia el indicador que pinta el mapa y las tarjetas del panel. No calcula nada nuevo: usa los veredictos que ya existen.

| Lente | Indicadores | Qué muestra el mapa | Límite |
|---|---|---|---|
| Agricultura | `may_oct_mm` y `jul_aug_mm` (este último solo donde aplica la canícula) | Veredicto de lluvia de temporada y de canícula | No mide humedad del suelo ni rendimiento de cultivos |
| Comunidades | `annual_mm` y la etiqueta `alta_variabilidad` | Veredicto de lluvia anual y celdas de alta variabilidad | No es un índice de vulnerabilidad: no incluye población ni infraestructura |
| Energía | Segunda variable de NASA POWER (P1) | Solo los sitios de los casos | Sin segunda variable: "Análisis cuantitativo pendiente" |

- La asignación de indicadores a lentes vive en `lenses` de `config.yaml` y se copia a `meta.json`.
- El texto de la interfaz dice "evidencia para este sector", nunca "riesgo".
- Donde no hay canícula, la lente de Agricultura usa `may_oct_mm`.

### 4.13 Recorrido guiado de 4 pasos (P1)

Es para quien no es experto. Va dentro del Caso 1, con botón "saltar". Cada paso tiene como máximo dos frases en lenguaje simple y un tooltip del glosario.

1. **¿Qué es una tendencia?** Se muestra la serie y la recta de Sen, con la lluvia en mm por década.
2. **¿Es de fiar?** Se explica el intervalo de confianza y el p-valor sin jerga, y qué quiere decir `limitada`.
3. **¿Y si cambio los años?** Se mueve la ventana en la huella y se señala 2014.
4. **¿Qué preguntas conviene hacerse?** Se abre la tarjeta del sector, con lo que falta saber.

Los textos están en `tour.json` (ES/EN), los escribe Rol 6 y usan solo cifras de la celda del caso. Meta de comprensión: 4 de 5 usuarios responden bien las 2 preguntas de comprensión. Se reportan los resultados reales, sean los que sean.

---

## 5. Roles

La asignación de nombres es **tentativa**: no conozco las fortalezas de cada persona. Reasignen en el kickoff; lo que importa es que los seis roles queden cubiertos.

| Rol | Responsabilidad | Tentativo | Suplente |
|---|---|---|---|
| 1 | Datos e ingesta | David | Rol 2 |
| 2 | Motor estadístico y veredicto | Joshua | Rol 3 |
| 3 | ENSO, agrupamiento y control de calidad científico | Camila | Rol 1 |
| 4 | Web: arquitectura, mapa, globo, despliegue | Elena | Rol 5 |
| 5 | Web: panel de celda, huella, pasaporte | Izel | Rol 4 |
| 6 | Producto, contenido, usuarios, demo y entrega | Andrés (confirmado) | Rol 5 |

Andrés asume el Rol 6. El registro en la plataforma se comprueba por separado. Si al final son cinco personas: Rol 3 mantiene la auditoría de textos; **Rol 2 redacta el formulario en B4–B5**, cuando tiene menos carga; Roles 4 y 5 se reparten los textos de la interfaz, las pruebas con usuarios y la demo; y Rol 1 se encarga de la lista de recursos externos y del registro de uso de IA.

### 5.1 Calendario común

| Bloque | Hora | Hito de equipo |
|---|---|---|
| B0 | Sáb 19:30–20:15 | Kickoff: roles, `config.yaml` y contrato JSON congelados, cuentas Earthdata, ramas |
| B1 | Sáb 20:15–00:00 | **H1 (00:00):** un sitio de punta a punta con datos reales; web navegable con datos de prueba |
| B2 | Dom 00:00–06:00 | **H2 (06:00):** todas las celdas calculadas; JSON v1 en la web |
| B3 | Dom 06:00–12:00 | **H3 (12:00):** P0 completo y desplegado; ENSO integrado |
| B4 | Dom 12:00–15:00 | Pruebas con usuarios; **H4 (15:00): congelación de funciones** |
| B5 | Dom 15:00–18:00 | Solo arreglos; **H5 (18:00):** demo lista (video o láminas), formulario completo |
| B6 | Dom 18:00–21:00 | **Compuerta por criterio (18:00–19:00)**, revisión final; **H6 (21:00): ENTREGA** |
| B7 | Dom 21:00–23:59 | Colchón. No se añaden funciones |

**Puntos de decisión:**
- **Sáb 23:00 — datos:** si IMERG no está descargado al menos en un 50 %, activar Plan B (sección 7).
- **Dom 06:00 — mapa:** si el cálculo de todas las celdas no terminó, bajar a rejilla de 0.2° o a 30 puntos.
- **Dom 12:00 — P2:** se hace P2 solo si P0 y P1 están desplegados y funcionando.
- **Dom 18:00 — compuerta por criterio:** cada dueño (sección 1.5) comprueba la evidencia de su criterio. Lo que falte se corrige o se declara como limitación.

**Si el kickoff empezó tarde:** los hitos H1 a H6 y la entrega de las 21:00 no se mueven. Se comprime B1, y lo primero que se lanza es la descarga de IMERG de Rol 1, antes de cerrar cualquier otra discusión.

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
- [ ] `01_download_imerg.py`: búsqueda `short_name="GPM_3IMERGM"`, versión 07, de 2001-01 al último mes disponible; descarga en paralelo; reintentos; lista de faltantes. Avisar al equipo si 2025 está completo.
- [ ] Si la descarga completa es lenta, usar el recorte espacial de GES DISC u OPeNDAP para bajar solo la región.
- [ ] `02_build_cube.py`: recortar a la región, concatenar en el tiempo, convertir a mm por mes, guardar NetCDF. Verificar que la latitud quede ordenada y las dimensiones como `(time, lat, lon)`.
- [ ] **A las 22:00:** entregar a Rol 2 la serie de una celda de Honduras (zona de Choluteca, cerca de 13.3 N, 87.2 O) aunque el cubo no esté completo.
- [ ] Máscara de países con Natural Earth: celda incluida si su centro cae dentro de GTM, SLV o HND. Guardar `cells.csv` con id, lat, lon, país.

**B2 (00:00–02:00, luego sueño)**
- [ ] `03_indicators.py`: los tres indicadores por celda y año, con bandera de año válido; ciclo mensual medio por celda y bandera de canícula (sección 4.2).
- [ ] Comprobaciones: sin valores negativos; totales de may–oct en un rango creíble para la región; febrero de 2004 con 29 días.
- [ ] Entregar `indicators.nc` a Rol 2 y Rol 3. **Este es el camino crítico del equipo.**

**B3 (07:00–12:00)**
- [ ] Verificación cruzada: comparar 3 celdas con una segunda fuente (serie de Giovanni o NASA POWER). Comparar el **signo de la tendencia**, no solo los valores. Anotar qué tan independiente es esa fuente de IMERG.
- [ ] P1: chequeo TRMM→GPM (sección 4.10) sobre todas las celdas; entregar `break_2014` a Rol 2 antes de las 10:30.
- [ ] P1: segunda variable de NASA POWER en los sitios de los 3 casos (cuando Rol 3 los elija), pasada por el mismo motor de tendencias.
- [ ] Redactar el bloque de procedencia: dataset, versión, DOI, fecha de descarga, parámetros de búsqueda.
- [ ] `11_export_json.py` junto con Rol 2: generar `grid.json`, `cells/*.json`, `meta.json`.

**B4–B5 (12:00–18:00)**
- [ ] Terminar lo que quede de la segunda variable y del chequeo de 2014.
- [ ] Lista de recursos externos del pipeline (datos y librerías) para el formulario.
- [ ] P1: prueba de replicabilidad. Regenerar indicadores y tendencias con un recuadro menor (solo El Salvador) cambiando únicamente `config.yaml`; anotar tiempo y comandos para la sección "Otra región" del README.
- [ ] Confirmar la cobertura de IMERG fuera del Triángulo antes de que el formulario afirme que es replicable.
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
- [ ] `05_footprint.py`: 120 ventanas por serie con 2001–2024 (136 con 2001–2025).
- [ ] FDR por indicador sobre las celdas de tierra.
- [ ] `08_verdict.py` (sin la condición ENSO si Rol 3 aún no entrega; se añade después).
- [ ] Exportar JSON v1 y avisar a Rol 4 y Rol 5. Es el H2.

**B3 (09:00–12:00)**
- [ ] Integrar en el veredicto la prueba ENSO de Rol 3 y la bandera de 2014 de Rol 1, y regenerar.
- [ ] `09_calibration.py`: 1 000 series barajadas; falsos positivos y potencia con tendencia inyectada (sección 4.7); escribir ambos en `meta.json`.
- [ ] Tabla resumen: cuántas celdas por veredicto, por país y por indicador. Pasarla a Rol 6.

**B4–B5**
- [ ] Revisar a mano 10 celdas al azar: ¿el veredicto coincide con lo que se ve en la serie y la huella?
- [ ] Escribir el fragmento de "receta reproducible" del pasaporte.
- [ ] Si son cinco personas: redactar el formulario en inglés (cifras de Rol 2, textos de Rol 3 y Rol 6).
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
- [ ] Revisar el ciclo mensual de la costa norte de Honduras: ¿cuándo llueve más?, ¿hay canícula? Decidir con qué indicador se busca el espejo.
- [ ] **Decidir si el efecto espejo existe en los datos.** Mirar el mapa de correlación: ¿hay zonas de signo opuesto que pasen FDR?
  - Si sí: elegir el par de celdas o grupos.
  - Si no: redactar el hallazgo como "no distinguible en este registro" y proponer el mejor contraste disponible.
- [ ] Elegir los 3 casos **desde los resultados**:
  - Los tres casos se eligen en Honduras siempre que los datos lo permitan.
  - Caso 1: celda del Corredor Seco hondureño con su veredicto real, sea cual sea.
  - Caso 2: celda donde el periodo base es significativo y la huella es inestable.
  - Caso 3: el par del efecto espejo.
- [ ] Escribir `cases.json` con los enlaces profundos.

**B4–B5 (12:00–18:00)**
- [ ] P2 si se aprueba: `07_clusters.py` y capa de grupos.
- [ ] Auditoría de textos: revisar cada frase de la web, el video y el formulario contra la regla de oro. Marcar toda frase que suene a predicción o a causa.
- [ ] Lista final de limitaciones (sección 4.9) para el pasaporte.
- [ ] Preparar respuestas a preguntas probables del jurado: por qué no ML, por qué 24 años, por qué ONI, qué pasa con 2014.
- [ ] Verificar cada afirmación sobre otras herramientas de NASA (sección 1.6) abriendo su documentación. Lo que no se pueda comprobar se quita o se escribe como "hasta donde pudimos comprobar".

**Listo cuando:** cada afirmación científica de la entrega tiene un número en los JSON o una referencia leída que la respalde.

---

### 5.5 Rol 4 — Web: arquitectura, mapa y despliegue

**Entrega:** aplicación desplegada con URL pública, mapa con capas, estado en la URL.

**B0**
- [ ] Crear `web/` con Vite + React + TypeScript. Definir los tipos TypeScript a partir del contrato de la sección 3.2.
- [ ] Librería de mapa: **MapLibre GL**, porque la misma librería sirve para el mapa por celdas y para el globo. Confirmar en su documentación que la versión instalada trae proyección de globo. Gráficas: Recharts o Plotly, a decidir con Rol 5 y no cambiar.
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
- [ ] Selector de lente (Agricultura, Comunidades, Energía) que cambia el indicador mostrado y recolorea el mapa según `lenses` de `meta.json` (sección 4.12).
- [ ] Leyenda por capa. Paleta distinguible para daltonismo; el veredicto no depende solo del color (añadir textura o icono).
- [ ] Bordes de países y nombres de referencia.
- [ ] Pantalla de entrada "Claim Investigator": tres preguntas que abren los 3 casos.
- [ ] **Globo 3D (P1).** No depende de datos, pero sí compite por las horas de Rol 4. Se empieza solo cuando su P0 de la noche esté hecho: mapa por celdas, estado en la URL, clic en celda y primer despliegue. Lo normal es el domingo por la mañana. Si Rol 4 no puede, lo toma Rol 5.
  - Proyección de globo con una textura satelital de NASA (por ejemplo Blue Marble). Confirmar licencia y cita con Rol 6. Sin llamadas en vivo.
  - La región del Triángulo resaltada; Honduras marcada como foco.
  - Animación de acercamiento hasta la región; al llegar, se pasa a la vista por celdas.
  - Botón "saltar" para ir directo al mapa, y los enlaces profundos abren sin pasar por el globo.
  - Primero la versión mínima (esfera, textura, acercamiento); los detalles después.
  - Tope de 3 a 4 horas en total. Si a las 12:00 no está, se recorta.

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
- [ ] Línea que marca 2014 en la huella y en la serie, con tooltip "cambio de era de satélites".
- [ ] Mini gráfica del ciclo mensual de la celda (12 barras).

**B2 (00:00–01:00, luego sueño)**
- [ ] Comparador lado a lado: periodo base contra ventana elegida (pendiente, IC, p, veredicto de la ventana).

**B3 (06:00–12:00)**
- [ ] Conectar datos reales.
- [ ] Vista ENSO: barras coloreadas por fase; interruptor "quitar años ENSO fuertes" que muestra la pendiente y el p de `enso_test`.
- [ ] Vista espejo: dos celdas lado a lado con la misma escala.
- [ ] Texto del narrador (`narrative`) bajo el veredicto.
- [ ] Aviso visible: "las ventanas se solapan; esto es una prueba de sensibilidad".

**B4–B5 (12:00–18:00)**
- [ ] Tarjetas leyendo `decision_rules.json`: Qué observamos / Preguntas para decidir / Datos locales que faltan. Ninguna tarjeta recomienda una acción.
- [ ] Recorrido guiado de 4 pasos (sección 4.13): superposición sencilla sobre el panel, con botón "saltar", leyendo `tour.json`.
- [ ] Junto al veredicto `limitada`, el texto "señal débil, no confirmada". Aviso de "indicador de canícula no aplica" donde corresponda.
- [ ] Bloque de la segunda variable en los sitios de los casos.
- [ ] Evidence Passport: descarga JSON, descarga Markdown, hoja de estilo para imprimir, botón de copiar enlace.
- [ ] Tooltips de glosario desde `glossary.json`.
- [ ] Micro-validación al final del pasaporte: 2 preguntas, resultado guardado donde indique Rol 6.
- [ ] P2: Matriz territorial (lluvia contra radiación solar en el mismo sitio).

**Listo cuando:** una persona sin contexto puede, en un minuto, ver la tendencia, mover la ventana y entender por qué el veredicto es el que es.

---

### 5.7 Rol 6 — Andrés: producto, contenido, usuarios, video y entrega

Avance del 14 de noviembre: [materiales, fuentes y pendientes de entrega](docs/rol6/README.md). La tabla inicial de verificaciones recoge el estado previo a esta revisión.

**Entrega:** textos de la app, resultados de usuarios, video, formulario enviado.

**B0 (antes de las 20:30) — lo más urgente del equipo**
- [ ] Leer el texto oficial del reto, la guía de entrega 2026 y la guía de evaluación 2026. Copiarlos a `docs/`.
- [ ] Avisar de inmediato si algo contradice este plan (variables obligatorias, formato del video, idioma, declaración de IA).
- [ ] Confirmar que los 6 están registrados y en el mismo equipo en la plataforma.

**B1 (20:15–00:00)**
- [x] `glossary.json` (ES/EN): mm por temporada, pendiente de Sen, p-valor, intervalo de confianza, FDR, ENSO/ONI, huella de estabilidad, completitud.
- [x] `decision_rules.json`: las tablas de la sección 4.11, con clave `escenario × veredicto × lente`, en ES y EN. Todo redactado como pregunta.
- [x] Enlaces de siguiente paso: SERVIR y NASA Harvest. Verificar que los enlaces abran.
- [x] Formato elegido: video en inglés. El ensayo dura 28 s. Ver fuentes y restricciones aún por confirmar en el registro del Rol 6.
- [x] Abrir el documento del formulario y dejar la estructura lista.
- [x] Anotar la fuente leída de al menos un dato que muestre por qué el Corredor Seco importa (para el formulario). Solo datos que alguien abrió y leyó.

**B3 (05:30–12:00)**
- [x] Narrador (`10_narrate.py`):
  - Entrada: el JSON de la celda. Salida: 2 o 3 frases en ES y EN.
  - Se genera **antes** y se guarda en el JSON. No hay llamadas a IA durante la demo.
  - Validador: todo número del texto debe existir en el JSON; lista de frases prohibidas ("va a llover", "predice", "95 % de probabilidad", "causa").
  - Con unas 2 000 celdas, generar con IA solo los 3 casos y las celdas de sitios con nombre; el resto usa plantilla.
  - Plan B: plantillas de texto para todo.
- [ ] Textos de los 3 casos a partir de lo que elija Rol 3.
- [x] `tour.json`: los 4 pasos del recorrido guiado, en ES y EN, en lenguaje simple (sección 4.13).
- [ ] **Formulario en inglés, desde las 06:00 y en paralelo con todo lo demás.** Según la revisión del grupo, los jueces evalúan sobre todo el texto de la entrega. Se redacta por secciones y se completan las cifras cuando Rol 2 las tenga.
- [x] **Registro de uso de IA**, desde ya: qué herramienta, para qué y en qué archivos (narrador, código asistido, textos, voz sintética si la hay). Si la guía 2026 lo pide, marca de agua visible en imágenes o video generados con IA.
  - El narrador escribe `generated_by` en cada texto de `narrative`; el código asistido lleva un comentario de cabecera; si hay voz sintética o imágenes generadas, se anotan y se marcan como pida la guía.
- [ ] **Lista de recursos externos:** datos, librerías del pipeline y de la web, textura del globo, límites de países.
- [x] Protocolo de prueba con usuarios: 3 tareas ("encontrá tu zona", "¿la lluvia está bajando ahí?", "¿qué harías con esto?") y 2 preguntas de comprensión. Meta: 4 de 5 completan las 3 tareas y responden bien las 2 preguntas. Es una meta; se reportan los resultados reales, sean los que sean.
- [ ] Reclutar 5 personas adultas (ideal: alguien de agricultura, un técnico municipal, un estudiante universitario, dos ajenos al tema). **Sin menores de 18, sin nombres, sin fotos ni grabación de rostros.** Los resultados se guardan anónimos.

**B4 (12:00–15:00)**
- [ ] Hacer las 5 pruebas. Anotar: tiempo por tarea, respuestas de comprensión, frases textuales.
- [ ] Pasar a Roles 4 y 5 solo los 3 problemas más graves.
- [ ] Resumen de resultados en `docs/` con números reales. No se inventan ni se redondean hacia arriba.

**B5 (15:00–18:00)**
- [ ] Producir la demo sobre la app congelada: video con dos tomas de respaldo, o las 7 láminas. Si el video lleva voz en español, subtítulos en inglés.
- [ ] Si la demo son láminas: la lámina 1 lleva nombre del equipo, integrantes y reto (campos de la guía; confirmar con la de 2026).
- [ ] Ensayar la demo con cronómetro dos veces y mostrarla a una persona ajena. Si no entiende la idea en 30 segundos, se ajusta la primera lámina o escena.
- [ ] Cerrar el formulario: completar cifras finales, datos NASA usados, datos auxiliares, uso de IA, recursos externos, trabajo futuro, enlaces al repo y a la demo.
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
| Acceso al formulario pendiente | El equipo no ve su pestaña Project | Andrés comprueba evento, equipo, registro y acceso antes de cerrar la entrega |
| La textura del globo no tiene licencia clara | Rol 6 no la confirma | Textura sencilla propia o quitar el globo |
| Una afirmación sobre otra herramienta de NASA no se puede comprobar | Rol 3 no la verifica | Se quita o se escribe "hasta donde pudimos comprobar" |

---

## 8. Demo: 7 láminas o video de 30 segundos

Rol 6 confirma en la guía 2026 qué formatos se aceptan. Si se aceptan los dos, se recomiendan las láminas, porque permiten explicar la huella y las limitaciones.

### Opción A — 7 láminas (borrador)

La guía 2025 pedía en las láminas: nombre del equipo, integrantes, reto elegido, una imagen del proyecto, la experiencia de usuario y cómo se usaron los datos de agencias espaciales. El máximo es 7 láminas, incluida la portada. Confirmar con la guía 2026.

| # | Contenido |
|---|---|
| 1 | Portada: nombre del equipo, integrantes, reto elegido y la pregunta "¿se sostiene lo que todos dicen de la lluvia?" |
| 2 | Qué hace ALTARIS en una frase; datos NASA usados (IMERG, POWER) y datos auxiliares |
| 3 | Experiencia de usuario: del globo a Honduras, el mapa de veredictos y el selector de lente |
| 4 | La huella de estabilidad con un caso real: la tendencia que aparece y desaparece |
| 5 | El efecto espejo (o lo que muestren los datos) y la segunda variable |
| 6 | Qué tan fiable es el propio veredicto: falsos positivos, potencia y límites |
| 7 | Para quién sirve: resultados de los 5 usuarios, replicable a otras regiones y enlace a la demo |

### Opción B — Video de 30 segundos (borrador)

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
- [ ] Demo dentro del límite (30 s o 7 láminas), en inglés o con subtítulos en inglés
- [ ] Formulario en inglés, y todo material enlazado también
- [ ] Enlace del proyecto público: sin contraseña, sin permiso, sin registro
- [ ] Todos los recursos externos listados, incluidas las librerías de código abierto
- [ ] Sin datos personales ni imágenes de menores
- [ ] Datos NASA listados con versión y enlace; ONI y Natural Earth declarados como auxiliares
- [ ] Uso de IA declarado (narrador, y cualquier asistencia de código o texto)
- [ ] Limitaciones visibles en la app y en el pasaporte
- [ ] Resultados de la prueba con usuarios incluidos
- [ ] Si la demo son láminas: la primera lleva nombre del equipo, integrantes y reto
- [ ] `generated_by` en los textos del narrador y registro de uso de IA completo
- [ ] Textura del globo con licencia y cita confirmadas
- [ ] Afirmación de replicabilidad comprobada con un recorte de otro recuadro
- [ ] Afirmaciones sobre otras herramientas de NASA verificadas
- [ ] Compuerta por criterio de las 18:00 hecha por cada dueño (sección 1.5)
- [ ] Botón "Submit for Judging" pulsado antes de las 21:00 y captura guardada

---

## 10. Preguntas abiertas para el equipo

0. Resuelto: Andrés es el sexto integrante y responsable del Rol 6.
1. ¿Quién tiene ya cuenta de Earthdata?
2. ¿Compiten en una sede local o en el evento virtual? ¿Hay premios locales con criterios propios?
3. ¿Quién tiene acceso a una API de IA generativa para el narrador, y con qué límite?
4. ¿Hay alguien con contactos en agricultura o alcaldías para las 5 pruebas del domingo?
5. ¿La asignación de roles de la sección 5 coincide con las fortalezas reales de cada uno?
6. ¿Se aceptan los dueños de criterio de la compuerta de las 18:00 (sección 1.5)?
7. ¿Quién puede construir el globo si Rol 4 no llega?
