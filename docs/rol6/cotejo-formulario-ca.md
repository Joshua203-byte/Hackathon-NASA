# Cotejo del formulario de Centroamérica — Andrés

15 de noviembre de 2026. Preparado con asistencia de Codex. Formulario: [submission-en-ca.md](submission-en-ca.md). README alternativo: [README-en-ca.md](README-en-ca.md).

## Fuentes exactas

- Integración consultada: `09ebae1`. [Tablas](https://github.com/Joshua203-byte/Hackathon-NASA/blob/09ebae1/docs/ca/TABLAS.md), [comparación](https://github.com/Joshua203-byte/Hackathon-NASA/blob/09ebae1/docs/ca/COMPARACION.md), [temporadas](https://github.com/Joshua203-byte/Hackathon-NASA/blob/09ebae1/docs/ca/TEMPORADAS.csv) y reporte de Joshua.
- ZIP oficial recibido del usuario: `altaris_ca_json.zip`, SHA256 `77e7978646f518e4bdbbabbf4694fbbe6f70a53b462b8c0e2bdd4229e475e9b6`. Coincide con el prefijo publicado por Joshua.
- `meta.json`: `data_kind: observed`, `pipeline_commit: 7e93e46`, 4 332 celdas, periodo 2001–2024, DOI `10.5067/GPM/IMERG/3B-MONTH/07`, `thresholds.frozen: true`, generación `2026-11-15T17:33:46+00:00` (11:33:46 en El Salvador).
- Los scripts de integración se ejecutaron desde una copia local aislada bajo `.pytest_cache/andres-ca/`; el ZIP y el JSON grande no se agregan a Git ni se copian a producción.

## Resultado y límites del cotejador

`check_form_ca.py --data <ZIP extraído>/data --form docs/rol6/submission-en-ca.md`: **41 de 41 comprobaciones coinciden, salida 0**. Lee las 24 filas de veredictos, países, DOI, menciones de cobertura, la frase de pendientes negativas de Honduras y tasas de ruido de calibración. No queda ninguna marca de cifras CA sin rellenar.

El script no valida toda la prosa libre, ni garantiza que se hayan hecho pruebas con usuarios, que exista un video o que el despliegue esté aprobado. Los pendientes de entrega permanecen con nombres específicos, visibles en el formulario. Un resultado numérico verde no significa que haya GO, firma científica o envío.

## Verificación adicional

`ca_tables.py` regeneró todas las tablas desde el ZIP y coincidieron íntegramente con `TABLAS.md`. `season_check.py` reprodujo todas las filas de `TEMPORADAS.csv`. `compare_regions.py` pasó sus dos condiciones al comparar el ZIP con el conjunto local de tres países. El `grid.json` coincide byte a byte con el liviano de integración; `meta.json` coincide como JSON estructurado (solo difiere el formato de archivo).

Se revisaron directamente las estadísticas estacionales de los tres casos y las dos ventanas del caso 2 en el ZIP:

| Caso | Pendiente mm/década redondeada | IC 95 % redondeado | p FDR | Veredicto |
|---|---|---|---|---|
| `N1335W08715` | −48 | −257 a +171 | 0,8735 | sin evidencia |
| `N1475W08765` | −48 | −164 a +108 | 0,7374 | sin evidencia |
| `N1495W09125` | −452 | −641 a −282 | 0,02424 | consistente |

Caso 2: 2008–2023, −344,544 → −345 mm/década; 2001–2010, +381,94 → +382; ambas ventanas `limitada`. Todas las series tienen 24 años válidos. Los conteos por país coinciden con la tabla de Joshua. En el ZIP hay 52 correlaciones estacionales positivas en Nicaragua, 81 en Costa Rica y 21 en Panamá (154 en total). POWER se limita a los sitios originales; no se amplió a toda Centroamérica.

La tabla de temporadas se interpreta como **inicio**, no como mes de máximo. No se transfiere a la versión CA una afirmación de señal consistente exclusiva de Guatemala, correlación ENSO negativa en todos los lugares ni un espejo Pacífico–Caribe demostrado. La firma de Camila sigue siendo necesaria para aprobar las interpretaciones.

## Pendientes de publicación y personas

Video real y URL final después del GO; acceso a Project y registro/evento de los seis; sesiones reales y resultados anónimos; revisión del inventario de IA y licencias de la versión congelada; inglés en materiales enlazados; interpretación del requisito de recurso NASA listado; firma científica y GO de Joshua. Se conserva la versión de tres países intacta como respaldo. No se ha enviado el formulario ni contactado al organizador desde esta tarea.

## Salida del cotejador

41 de 41 comprobaciones coinciden

| Estado | Comprobación | Formulario | Datos |
|---|---|---|---|
| OK | Datos observados (data_kind) | observed | observed |
| OK | Marcas [PENDING-CA] sin rellenar | 0 | 0 |
| OK | DOI en el formulario | 10.5067/GPM/IMERG/3B-MONTH/07 | 10.5067/GPM/IMERG/3B-MONTH/07 |
| OK | País mencionado: Belize | sí | sí |
| OK | País mencionado: Costa Rica | sí | sí |
| OK | País mencionado: Guatemala | sí | sí |
| OK | País mencionado: Honduras | sí | sí |
| OK | País mencionado: Nicaragua | sí | sí |
| OK | País mencionado: Panama | sí | sí |
| OK | País mencionado: El Salvador | sí | sí |
| OK | Mención «4,332 cells» | 4332 | total 4,332; por país [1076, 939, 917, 614, 425, 192, 169] |
| OK | Mención «939 cells» | 939 | total 4,332; por país [1076, 939, 917, 614, 425, 192, 169] |
| OK | Tabla Rainy season (May–Oct) / Nicaragua | (15, 600, 461, 1076) | (15, 600, 461, 1076) |
| OK | Tabla Rainy season (May–Oct) / Honduras | (0, 295, 644, 939) | (0, 295, 644, 939) |
| OK | Tabla Rainy season (May–Oct) / Guatemala | (58, 542, 317, 917) | (58, 542, 317, 917) |
| OK | Tabla Rainy season (May–Oct) / Panama | (42, 340, 232, 614) | (42, 340, 232, 614) |
| OK | Tabla Rainy season (May–Oct) / Costa Rica | (80, 129, 216, 425) | (80, 129, 216, 425) |
| OK | Tabla Rainy season (May–Oct) / Belize | (1, 125, 66, 192) | (1, 125, 66, 192) |
| OK | Tabla Rainy season (May–Oct) / El Salvador | (0, 70, 99, 169) | (0, 70, 99, 169) |
| OK | Tabla Rainy season (May–Oct) / All countries | (196, 2101, 2035, 4332) | (196, 2101, 2035, 4332) |
| OK | Tabla Midsummer (Jul–Aug) / Nicaragua | (0, 569, 507, 1076) | (0, 569, 507, 1076) |
| OK | Tabla Midsummer (Jul–Aug) / Honduras | (0, 219, 720, 939) | (0, 219, 720, 939) |
| OK | Tabla Midsummer (Jul–Aug) / Guatemala | (0, 660, 257, 917) | (0, 660, 257, 917) |
| OK | Tabla Midsummer (Jul–Aug) / Panama | (0, 395, 219, 614) | (0, 395, 219, 614) |
| OK | Tabla Midsummer (Jul–Aug) / Costa Rica | (0, 152, 273, 425) | (0, 152, 273, 425) |
| OK | Tabla Midsummer (Jul–Aug) / Belize | (0, 76, 116, 192) | (0, 76, 116, 192) |
| OK | Tabla Midsummer (Jul–Aug) / El Salvador | (0, 77, 92, 169) | (0, 77, 92, 169) |
| OK | Tabla Midsummer (Jul–Aug) / All countries | (0, 2148, 2184, 4332) | (0, 2148, 2184, 4332) |
| OK | Tabla Annual / Nicaragua | (1, 380, 695, 1076) | (1, 380, 695, 1076) |
| OK | Tabla Annual / Honduras | (0, 89, 850, 939) | (0, 89, 850, 939) |
| OK | Tabla Annual / Guatemala | (71, 481, 365, 917) | (71, 481, 365, 917) |
| OK | Tabla Annual / Panama | (48, 302, 264, 614) | (48, 302, 264, 614) |
| OK | Tabla Annual / Costa Rica | (106, 124, 195, 425) | (106, 124, 195, 425) |
| OK | Tabla Annual / Belize | (5, 30, 157, 192) | (5, 30, 157, 192) |
| OK | Tabla Annual / El Salvador | (0, 30, 139, 169) | (0, 30, 139, 169) |
| OK | Tabla Annual / All countries | (231, 1436, 2665, 4332) | (231, 1436, 2665, 4332) |
| OK | Filas de la tabla de resultados leídas | >= 1 | 24 |
| OK | Honduras: celdas con pendiente negativa | 924 de 939 | 924 de 939 |
| OK | Honduras: mediana % por década | -4.5 | -4.5 |
| OK | Calibración: consistente en ruido (%) | 0.0 | 0.0 |
| OK | Calibración: limitada en ruido (%) | 33.1 | 33.1 |
