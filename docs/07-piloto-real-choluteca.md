# Piloto observado de Choluteca · 15 de noviembre de 2026

El panel puede abrir la celda IMERG **N1335W08715**, centro 13,35° N, 87,15° O, Honduras, durante 2001–2024. Desde la barra superior, seleccionar **Piloto real · Choluteca**. También se puede abrir `/?dataset=pilot&cell=N1335W08715&ind=may_oct_mm&lang=es`.

## Resultado del recorrido

| Indicador | Pendiente, mm/década | IC 95 %, mm/década | p | Veredicto provisional |
|---|---:|---|---:|---|
| Mayo–octubre | −48,113 | [−257,406; 170,913] | 0,785 | sin_evidencia |
| Julio–agosto | −4,260 | [−109,111; 79,360] | 0,8622 | sin_evidencia |
| Anual | 10,727 | [−169,320; 240,467] | 0,9802 | sin_evidencia |

Cada indicador contiene 24 años válidos. Los 72 valores anuales exportados se contrastaron con el CSV de David, admitiendo únicamente el redondeo del exportador. Las cifras de esta tabla corresponden a la salida del motor disponible en `main`, commit de origen `715ea10`.

El piloto procesa una sola celda. Su ajuste FDR se limita a esa celda y coincide con p. Faltan ajuste regional, controles ENSO, chequeo de 2014, calibración y congelación de umbrales. La interfaz y los pasaportes describen estos pendientes. La configuración científica se conserva como estaba en el repositorio. Los resultados regionales y las validaciones del Rol 3 siguen abiertos.

## Reproducción

Desde la raíz, con las dependencias de `pipeline/requirements.txt` instaladas:

```powershell
python pipeline/run_choluteca.py
cd rol5-panel-app
npm run dev
```

El script usa `data/rol1/piloto_choluteca/{cells,series,monthly}.csv`, ejecuta el motor y el narrador y escribe `rol5-panel-app/public/data/pilot/`. La página del piloto utiliza los textos comunes de preguntas, recorrido y glosario. El archivo ONI simulado de la demostración queda fuera de la carga del piloto.

## Prueba de navegador y descarga

```powershell
cd rol5-panel-app
npm run build
node e2e/pilot.mjs
```

La prueba abre el enlace desde la barra, cambia a la ventana 2001–2016 para cada indicador y descarga los pasaportes JSON y Markdown. Compara serie, estadísticas, IC de la ventana, veredicto, DOI, commit y alcance con los archivos exportados. Comprueba las razones traducidas de controles pendientes, que ENSO esté deshabilitado y que no aparezcan errores de ejecución. Los artefactos quedan en `node_modules/.cache/pilot/`.

Joshua puede continuar con el cálculo regional y sus controles. Izel y Elena ya tienen un enlace observado con el cual integrar y verificar el panel. Andrés puede ensayar el recorrido usando estas cifras y sus límites explícitos.
