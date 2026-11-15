# Cotejo de casos reales · Izel · 15 de noviembre de 2026

Comprobación local sobre `main` `5f864a2`, con datos regionales observados del motor `a7a5b18`, generados el 15 de noviembre a las 02:44:37 de El Salvador. DOI `10.5067/GPM/IMERG/3B-MONTH/07`. No se regeneraron estadísticas ni veredictos.

## Recorrido actualizado

`public/data/tour.json` utiliza el caso 2 aprobado por Camila, `N1475W08765`, lluvia de mayo–octubre. Los pasos 1 y 2 muestran 2001–2024: pendiente −48,290 mm/década, IC 95 % [−163,706; 108,033], `sin_evidencia`, 24/24 años. El paso 3 selecciona **2001–2010**: pendiente +381,940 mm/década, p sin corregir 0,02004, IC [199,550; 854,800], `limitada`. Es un recorte de solo 10 años que invierte el signo respecto al periodo completo. Las ventanas se solapan y sus pruebas no tienen corrección múltiple; no confirman una tendencia regional.

La corrección alinea la ventana con el enlace del caso 2 de Elena y la indicación de Camila; sustituye la elección anterior 2008–2023. Una prueba de regresión exige que ambos usen la misma celda, indicador y ventana.

El paso 4 enfoca el pasaporte y conserva esa selección. Abrir el recorrido desde otra celda o indicador restablece el caso, indicador, lente, periodo base y estado ENSO adecuados. Se conserva el idioma. Se comprobó la recarga del enlace en el paso 3 en ES/EN. El piloto de una celda conserva su recorrido anterior, separado del recorrido regional.

## CSV → JSON → pantalla → descargas

Prueba ejecutada en Chrome con un contexto nuevo y el bundle de producción servido desde disco, sin cambiar las respuestas de datos. Casos aprobados: Choluteca `N1335W08715`, sensibilidad `N1475W08765` y contraste `N1495W09125`. Cada uno se comprobó para `may_oct_mm`, `jul_aug_mm` y `annual_mm`, en ES y EN.

| Caso | Indicador | Pendiente base, mm/década | Veredicto base | Veredicto 2001–2010 |
|---|---|---:|---|---|
| N1335W08715 | may_oct_mm | −48,113 | sin_evidencia | sin_evidencia |
| N1335W08715 | jul_aug_mm | −4,260 | sin_evidencia | limitada |
| N1335W08715 | annual_mm | +10,727 | sin_evidencia | limitada |
| N1475W08765 | may_oct_mm | −48,290 | sin_evidencia | limitada |
| N1475W08765 | jul_aug_mm | −1,715 | sin_evidencia | limitada |
| N1475W08765 | annual_mm | +16,402 | sin_evidencia | limitada |
| N1495W09125 | may_oct_mm | −452,382 | consistente | sin_evidencia |
| N1495W09125 | jul_aug_mm | −171,333 | limitada | sin_evidencia |
| N1495W09125 | annual_mm | −469,171 | consistente | sin_evidencia |

Comprobaciones superadas:

- Los **216 valores anuales** de `data/rol1/series.csv` coinciden con las series de `public/data/cells/*.json`. Son tres celdas completas, con 24/24 años en cada indicador.
- Pendiente de Sen recalculada independientemente como mediana de las pendientes entre pares del CSV: coincide con el JSON dentro de 0,00051 mm/década, por su redondeo a tres decimales.
- `data/rol1/cells.csv` coincide con coordenadas y país exportados. La rejilla coincide con el detalle en pendiente, veredicto y completitud.
- `data/rol3/enso_results.csv` y `break2014.csv` coinciden con el detalle y la rejilla. Se admite únicamente el redondeo del exportador: 0,00051 para pendientes y 0,000051 para probabilidades. Banderas, años y `survives` coinciden exactamente.
- Pantalla: 24 puntos de serie y el primer valor en su tooltip; completitud y veredicto base; pendiente, IC y p/FDR del periodo base; pendiente, IC y p de la ventana seleccionada. Las ventanas limitadas muestran su etiqueta de señal débil.
- **18 pasaportes JSON y 18 Markdown** descargados desde los botones reales. El JSON conserva exactamente serie, estadísticas, veredicto base, completitud, ubicación, DOI, commit, controles ENSO/2014 y pendiente, p, IC y veredicto de la ventana. Markdown conserva identidad, cifras redondeadas, ventana, completitud y procedencia, sin `NaN` ni `undefined`.
- Recorrido de cuatro pasos en ES/EN, inicio desde otro indicador, recarga del paso 3 y foco final en pasaporte. Sin errores JavaScript.
- Regresión del piloto observado: los tres indicadores conservan pasaportes y avisos de controles pendientes y FDR de una sola celda. Tras integrar los enlaces de Elena pasan las 43 pruebas unitarias, tipos y compilación.
- Los tres enlaces `?case=N` abren su celda, ventana y espejo correctos. Se corrigió la lente del enlace: desde `lens=com` ahora se fija `agri` para impedir que el panel sustituya la lluvia estacional del caso por lluvia anual.
- Contexto privado nuevo de Chrome, viewport móvil 390 × 844: tarjetas y recorrido operables, sin desbordamiento horizontal; descarga del pasaporte de `N1475W08765` con 2001–2010 correcta. Es emulación de tamaño móvil, no una prueba en teléfono físico.

El cotejo del CSV no recalcula Mann–Kendall, FDR, IC ni los controles científicos; verifica su transferencia entre los productos entregados. La prueba independiente del motor sigue documentada en `07-cifras-y-candidatos.md`. No equivale a pruebas con participantes o en un teléfono físico.

## Reproducción y evidencia

Desde `rol5-panel-app/`:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e:real
node e2e/pilot.mjs
```

Requiere Chrome; otra instalación puede indicarse mediante `CHROME_PATH`. La prueba guarda los 36 pasaportes, dos capturas del recorrido y `report.json` en `node_modules/.cache/real-cases/`. El [reporte de esta ejecución](qa/cotejo-casos-reales-2026-11-15.json) queda versionable con este documento. Los datos regionales no se modificaron.

## Publicación y relevo

Consulta HTTP de la URL pública durante esta tarea: `meta.json` devuelve 200, 2 025 celdas, motor `a7a5b18` y la misma fecha de generación local. `reasons.json` ya sirve el texto ENSO corregido de Camila. `tour.json` público todavía selecciona 2001–2016 y contiene los textos de ejemplo. **El recorrido nuevo está verificado localmente; no se ha publicado en esta tarea.**

La consulta de `origin/main` no encontró una regeneración posterior de Joshua. El trabajo de Elena en `origin/izel/panel-celda` (`1d585f2`, enlaces de casos) ya está integrado en `andres/recorrido-casos-reales` mediante `613d43b`. El conjunto pasó de nuevo el cotejo, recorrido, enlaces y piloto. La publicación está pendiente de iniciar sesión en Cloudflare: `wrangler whoami` devuelve `You are not authenticated`. No se ha sustituido la versión pública.

La misma prueba puede ejecutarse contra la versión publicada mediante `BASE_URL=https://altaris.altaris-panel-rol5.workers.dev/ npm run test:e2e:real` (en PowerShell, definir `$env:BASE_URL` antes del comando). En ese modo usa respuestas HTTP reales en un contexto privado nuevo, sin interceptar peticiones. Los CSV y JSON locales siguen siendo la referencia del cotejo.

Si Joshua regenera: traer la exportación y su procedencia, repetir este cotejo contra los CSV de la misma versión, actualizar este reporte y las cifras del recorrido, registrar los archivos aprobados y publicar con `npm run deploy`. Después verificar por HTTP y navegador que la URL pública sirve el nuevo `meta.json`, `reasons.json`, recorrido y los tres casos. No marcar el despliegue como comprobado solo porque compile o porque coincidan los conteos del mapa.
