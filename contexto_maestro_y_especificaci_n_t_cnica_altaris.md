# ALTARIS — Earth Trend Intelligence
**Contexto Maestro de Producto, Reglas Científicas y Arquitectura para Desarrollo**
*Desafío: NASA Space Apps Challenge 2026 — "Be An Earth System Trend Detective!"*
*Enfoque Geográfico Piloto: Triángulo Norte de Centroamérica (El Salvador, Guatemala y Honduras)*

---

## 1. Propósito del Sistema (Para asistentes de IA y desarrolladores)
ALTARIS es una plataforma web interactiva que transforma datos históricos de observación terrestre de la NASA en investigaciones ambientales auditables. A diferencia de los visores tradicionales que solo grafican series temporales, ALTARIS **pone a prueba la solidez estadística de sus propios hallazgos** y traduce los resultados a líneas de planificación preventiva para agricultura, comunidades y energía, explicitando siempre la incertidumbre y los datos locales faltantes.

### Regla de Oro (Guardrail Principal)
**ALTARIS analiza tendencias históricas y variabilidad pasada; NO realiza predicciones climáticas futuras ni emite recetas agronómicas o diagnósticos de vulnerabilidad social sin datos de campo.** Cualquier texto, interfaz o componente generado debe respetar estrictamente esta frontera entre *evidencia satelital* y *decisión operativa*.

---

## 2. Flujo de Usuario Unificado (5 Módulos Core)
Para mantener coherencia total entre el diseño de interfaz, el código y el pitch, toda la aplicación debe seguir exactamente esta arquitectura de 5 pasos:

1. **Claim Investigator (Explorar e Investigar)**
   * **Función:** Punto de entrada guiado por preguntas ambientales concretas y un mapa 2D mundial con acceso rápido a los sitios piloto del Triángulo Norte.
   * **Extras incluidos:** *Detective Case Files* (3 casos pre-cargados de un clic para demostración inmediata, incluyendo contraste entre vertiente del Pacífico y Caribe/interior).
2. **Evidence Stress Test (Comprobar y Desafiar)**
   * **Función:** Muestra la serie histórica (2001–2024), pendiente por década, intervalo de confianza del 95 % y el **Evidence Verdict**.
   * **Interactividad clave (*Time Window Challenge*):** Permite al usuario modificar la ventana de años (ej. comparar `2001-2024` vs. `2001-2021` o `2004-2024`) lado a lado contra el período base fijo para comprobar si la tendencia resiste el escrutinio o pierde significancia.
3. **Territorial Evidence Matrix (Conectar)**
   * **Función:** Cruza señales ambientales dentro del mismo territorio sin asumir causalidad directa.
   * **Regla de contingencia:** Si la radiación solar (`NASA POWER`) está validada, cruza precipitación vs. irradiación solar. Si radiación aún no está lista, cruza dos indicadores hídricos del mismo sitio (acumulado temporada mayo–octubre vs. canícula julio–agosto) o compara dos sitios vecinos con regímenes opuestos.
4. **Decision Readiness (Interpretar y Planificar)**
   * **Función:** Traduce el hallazgo a tres lentes sectoriales diferenciados (**Agricultura**, **Comunidades y Presión Ambiental**, **Energía**).
   * **Estructura obligatoria por lente:**
     * *What We Know (Qué observamos):* Magnitud, tendencia y calidad del dato.
     * *Planning & Mitigation Lines (Líneas de planificación preventiva):* Estrategias de preparación en campo condicionadas al *Evidence Verdict*.
     * *What We Still Need (Condiciones de campo faltantes):* Variables locales indispensables antes de invertir (ej. tipo de suelo, acceso a riego, exposición socioeconómica).
5. **Evidence Passport (Auditar y Compartir)**
   * **Función:** Exportación de la investigación en formato legible (Markdown/Imprimible) y estructurado (`JSON`).
   * **Contenido:** Metadatos exactos de la NASA, ventana evaluada, veredicto, límites, fragmento de "Receta Reproducible" (parámetros API y método estadístico) y enlace con estado congelado (*URL Deep-Linking*).

---

## 3. Estándares Científicos y Estadísticos
El motor de cálculo es **100 % determinista** (Python). La IA generativa **nunca** calcula cifras, modifica p-valores ni inventa veredictos.

### Fuentes de Datos y Variables
* **Precipitación (Prioridad P0):** NASA GPM IMERG Final Run V07B (mensual). Indicadores: acumulado estacional mayo–octubre ($\text{mm/temporada}$) y ventana julio–agosto ($\text{mm/2 meses}$). *Nota: Conversión obligatoria de tasa ($\text{mm/h}$) a acumulado ($\text{mm}$) considerando días reales del mes y años bisiestos.*
* **Radiación Solar (Prioridad P0+):** NASA POWER `ALLSKY_SFC_SW_DWN` (irradiación solar en superficie, preservando unidades originales de la API). Si no supera validación de calidad, el módulo energético muestra explícitamente *"Análisis cuantitativo pendiente"*.

### Método Estadístico
* **Estimación de tendencia:** Pendiente de Sen (*Theil-Sen estimator*) expresada en unidades físicas por década + Intervalo de Confianza del 95 %.
* **Prueba de significancia:** Prueba de Mann-Kendall (con revisión de autocorrelación y corrección Benjamini-Hochberg/FDR cuando se evalúan múltiples sitios simultáneamente).
* **Manejo de faltantes:** Nunca rellenar años incompletos con ceros. Mostrar indicador de completitud (ej. `24/24 años válidos`).

### Taxonomía del Evidence Verdict
* **Evidencia consistente:** Serie válida, prueba primaria cumple umbral predefinido y el *Stress Test* temporal no contradice materialmente el signo ni la magnitud.
* **Evidencia limitada:** Señal visible, pero alta sensibilidad al cambio de años o incertidumbre amplia impiden una afirmación firme.
* **Sin evidencia suficiente:** El análisis no muestra sustento estadístico de tendencia. *(Se presenta como un hallazgo valioso, nunca como error).*
* **Evaluación incompleta:** Faltan datos o validaciones técnicas.
* *Prohibición:* Nunca traducir $p < 0.05$ como *"95 % de probabilidad de que el cambio sea real"*.

---

## 4. Lógica de Planificación Preventiva (Módulo Decision Readiness)
Para apoyar a las personas en sus campos sin caer en falsas predicciones, las estrategias sugeridas por el sistema deben obedecer la siguiente matriz lógica según el resultado de lluvia:

| Escenario Histórico Detectado | Si el veredicto es `Evidencia consistente` | Si el veredicto es `Evidencia limitada` o `Sin evidencia suficiente` | Condición de Campo (*What We Still Need*) |
| :--- | :--- | :--- | :--- |
| **Tendencia a la baja en lluvia estacional / canícula** | Evaluar prácticas de conservación de humedad del suelo, cobertura vegetal (mulch), reservorios de captación de agua lluvia y escalonamiento de fechas de siembra con asistencia técnica local. | Evitar inversiones de capital de alto riesgo basadas únicamente en percepción de sequía; priorizar monitoreo local de humedad antes de alterar ciclos habituales. | Textura y retención de humedad del suelo, pendiente del terreno, variedad de semilla y disponibilidad de riego auxiliar. |
| **Tendencia al alza en lluvia acumulada** | Revisar infraestructura de drenaje parcelario, obras de control de erosión en laderas y manejo preventivo de enfermedades fúngicas por exceso de humedad. | Mantener protocolos estándar de drenaje y revisar registros históricos de eventos extremos diarios (no visibles en agregados mensuales). | Topografía local, historial de anegamiento de la parcela y capacidad de drenaje del suelo. |
| **Alta variabilidad interanual sin tendencia lineal** | Enfocar la planificación en resiliencia ante extremos (diversificación de cultivos y seguros paramétricos o fondos de contingencia comunitarios). | Comunicar que el sistema opera bajo variabilidad natural histórica; las decisiones deben basarse en pronósticos meteorológicos de corto plazo, no en tendencias decenales. | Capacidad financiera de absorción de pérdidas y acceso a información agrometeorológica semanal. |

---

## 5. Posicionamiento en el Ecosistema NASA (Benchmark Competitivo)
ALTARIS no compite con visores científicos complejos, sino que actúa como **capa de auditoría y traducción** previa a herramientas especializadas:

* **Vs. NASA POWER DAVe / AppEEARS:** Estas herramientas entregan datos crudos y series para expertos, pero no evalúan si una tendencia se sostiene al cambiar la ventana de años ni guían al usuario no técnico. *(De AppEEARS adoptamos la etiqueta explícita de completitud/calidad de datos).*
* **Vs. Climate Engine:** Aunque calcula tendencias lineales sobre datos satelitales, no incorpora pruebas de sensibilidad interactivas (*Stress Test*) ni traduce el hallazgo a preguntas de planificación en campo.
* **Sinergia con NASA SERVIR Mesoamérica y NASA Harvest:** ALTARIS sirve como puerta de entrada educativa y diagnóstica en el Triángulo Norte. En el paso de *Decision Readiness*, el sistema enlaza hacia el **Índice de Estrés Evaporativo (ESI) de NASA SERVIR** y **NASA Harvest** como siguientes pasos operativos cuando se requiere monitoreo de vegetación o sequía en tiempo real.

---

## 6. Funcionalidades de Alto Impacto (Priorizadas para MVP)
1. **Detective Case Files (3 Casos Guiados):**
   * *Caso 1:* Intensificación de anomalías secas en el Corredor Seco.
   * *Caso 2:* Efecto de ventana temporal (cómo mover 4 años cambia la significancia aparente).
   * *Caso 3:* Efecto espejo regional (contraste entre dos sitios del Triángulo Norte con señales opuestas).
2. **Glosario Inline ("En 20 segundos"):** Tooltips (`?`) junto a métricas técnicas (`mm/temporada`, `ALLSKY_SFC_SW_DWN`, `Pendiente de Sen`, `p-valor`) dirigidos a estudiantes y técnicos.
3. **URL Deep-Linking:** Sincronización de parámetros en la URL (`?site=SV-01&var=precip&window=2004-2024`) para compartir investigaciones exactas con el jurado.
4. **Micro-validación integrada:** Pregunta rápida al final del *Evidence Passport* para capturar evidencia real de comprensión de usuarios durante las pruebas de la hackatón.

---

## 7. Arquitectura Técnica y Contrato de Datos
* **Pipeline:** Scripts en Python (`pandas`, `numpy`, `scipy`, `statsmodels`) ejecutan el preprocesamiento, cálculo de tendencias y validación cruzada, generando archivos `JSON` estáticos cacheados para garantizar velocidad y cero fallos en vivo.
* **Frontend:** React + TypeScript con visualización 2D ligera y gráficas interactivas.

### Esquema JSON Estándar por Sitio e Indicador
```json
{
  "location_id": "SV-01",
  "name": "Zona Piloto Oriente - El Salvador",
  "country": "El Salvador",
  "lat": 13.48,
  "lon": -88.18,
  "dataset": "NASA GPM IMERG Final Run V07B",
  "variable": "precipitation",
  "original_units": "mm/month",
  "indicator": "jul_aug_accumulated_mm",
  "baseline_period": "2001-2024",
  "completeness": "24/24 valid years",
  "series": [
    {"year": 2001, "value": 310.5, "anomaly": -12.4}
  ],
  "statistics": {
    "method": "Theil-Sen + Mann-Kendall",
    "slope_per_decade": -18.4,
    "ci_95": [-34.2, -2.1],
    "p_value": 0.038,
    "adjusted_p_fdr": 0.049
  },
  "stress_test_windows": {
    "2001-2021": {"slope_per_decade": -11.2, "p_value": 0.14, "verdict": "Sin evidencia suficiente"},
    "2004-2024": {"slope_per_decade": -21.0, "p_value": 0.029, "verdict": "Evidencia consistente"}
  },
  "verdict": "Evidencia limitada",
  "verdict_rationale": "Existe una tendencia negativa en el período base (2001-2024), pero pierde significancia estadística al excluir los últimos 3 años (2001-2021).",
  "limitations": [
    "Agregado bimensual (julio-agosto) no mide la duración de días secos consecutivos.",
    "Resolución espacial de celda satelital; no captura microclimas de ladera."
  ],
  "references": [
    "https://gpm.nasa.gov/data/directory",
    "https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-1/"
  ]
}
```