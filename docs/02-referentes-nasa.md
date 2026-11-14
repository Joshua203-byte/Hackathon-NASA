# Referentes directos de datos NASA y tendencias

Análisis de herramientas existentes y en qué se diferencia ALTARIS. (Captura original: [`img/referentes-nasa-dave-appeears.png`](img/referentes-nasa-dave-appeears.png))

## 1. NASA POWER Data Access Viewer enhanced (DAVe)

**Qué hace:** herramienta oficial de la NASA (ya citada en la documentación del equipo) para explorar series temporales de radiación solar y meteorología. Permite filtrar por comunidades específicas como *Agroclimatología* o *Energía Renovable*, ver ciclos anuales, mapas de calor mensuales y descargar reportes.

**En qué falla frente a ALTARIS:** es una herramienta de descarga para expertos. Entrega números crudos, pero no evalúa automáticamente si una tendencia es estadísticamente robusta ni le dice al usuario qué decisiones *no* debería tomar con esos datos.

## 2. NASA AppEEARS (Application for Extracting and Exploring Analysis Ready Samples)

**Qué hace:** extrae series temporales de puntos o polígonos específicos (parcelas, municipios) cruzando múltiples satélites de la NASA, mostrando estadísticas resumidas y valores de calidad del dato.

**Idea robable para ALTARIS:** AppEEARS incluye siempre, junto al dato ambiental, una etiqueta de **"calidad de la observación"**. ALTARIS ya tiene algo parecido con el *Evidence Verdict*; mostrar un pequeño indicador de *"Completitud de datos: 24/24 años válidos"* le da ese mismo sello institucional de la NASA.

## Conclusión

| | POWER DAVe | AppEEARS | ALTARIS |
|---|---|---|---|
| Datos NASA reales | ✅ | ✅ | ✅ |
| Público objetivo | Expertos | Expertos | Decisores y comunidades |
| Evalúa robustez de la tendencia | ❌ | ❌ | ✅ (Evidence Verdict) |
| Indica qué decisiones evitar | ❌ | ❌ | ✅ |
| Etiqueta de calidad del dato | Parcial | ✅ | ✅ (a incorporar: completitud X/Y años) |
