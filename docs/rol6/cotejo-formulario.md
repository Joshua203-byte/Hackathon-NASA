# Cotejo de cifras del formulario (tarea 16)

Cada número de [submission-en.md](submission-en.md) recalculado desde los datos publicados (`rol5-panel-app/public/data/`, `data/rol1/`, `data/rol3/` y `pipeline/calibration.json`). Para repetirlo: `python pipeline/check_form_numbers.py .` desde la raíz.

**Corrección hecha:** en el caso 2, el formulario y `docs/09` decían que los años más húmedos eran 2008, 2010 y 2011. En lluvia de temporada son 2008 (1 616 mm), 2011 (1 508) y 2017 (1 504); 2010 es el cuarto (1 449). Se cambió a "2008 es el año más húmedo, y 2010 y 2011 también están entre los más húmedos". La explicación del caso no cambia.

**No se cotejó** (no sale de nuestros datos): la cifra de la FAO de más de diez millones de personas en el Corredor Seco (el enlace al PDF de la FAO abre).

**Enlaces:** la app pública y el DOI abren sin iniciar sesión. **Los dos enlaces del repositorio de GitHub dan 404 sin iniciar sesión: el repositorio es privado.**

45 de 45 cifras coinciden

| Estado | Cifra | Formulario | Datos |
|---|---|---|---|
| OK | Celdas | 2025 | 2025 |
| OK | Años válidos en todas las celdas | {24} | {24} |
| OK | DOI | 10.5067/GPM/IMERG/3B-MONTH/07 | 10.5067/GPM/IMERG/3B-MONTH/07 |
| OK | Periodo | [2001, 2024] | [2001, 2024] |
| OK | Tabla may_oct_mm HND | (0, 295, 644, 939) | (0, 295, 644, 939) |
| OK | Tabla may_oct_mm SLV | (0, 70, 99, 169) | (0, 70, 99, 169) |
| OK | Tabla may_oct_mm GTM | (44, 556, 317, 917) | (44, 556, 317, 917) |
| OK | Tabla annual_mm HND | (0, 89, 850, 939) | (0, 89, 850, 939) |
| OK | Tabla annual_mm SLV | (0, 30, 139, 169) | (0, 30, 139, 169) |
| OK | Tabla annual_mm GTM | (56, 496, 365, 917) | (56, 496, 365, 917) |
| OK | Tabla jul_aug_mm tres países | (0, 956, 1069, 2025) | (0, 956, 1069, 2025) |
| OK | Honduras: celdas con pendiente negativa (temporada) | 924 de 939 | 924 de 939 |
| OK | Honduras: mediana % por década | -4.5 | -4.5 |
| OK | Franja de Guatemala: mediana % por década (temporada, consistente) | -19 | -19 |
| OK | Todas las consistente están en Guatemala | GTM | GTM |
| OK | ENSO: correlación negativa en todas las celdas (may_oct_mm) | 2025 de 2025 | 2025 de 2025 |
| OK | ENSO: correlación negativa en todas las celdas (jul_aug_mm) | 2025 de 2025 | 2025 de 2025 |
| OK | POWER: signo distinto en 3 sitios | 7 de 9 | 7 de 9 |
| OK | Caso 3: POWER mm por década | +40 frente a -452 | +40 frente a -452 |
| OK | Caso 3: r IMERG-POWER año a año | 0.18 | 0.18 |
| OK | Calibración: simulaciones | 1000 | 1000 |
| OK | Calibración: consistente en ruido % | 0.0 | 0.0 |
| OK | Calibración: limitada en ruido % | 33.1 | 33.1 |
| OK | Calibración: -10 %/década -> consistente % | 15.2 | 15.2 |
| OK | Calibración: -20 %/década -> consistente % | 54.4 | 54.4 |
| OK | Caso 1: pendiente | -48 | -48 |
| OK | Caso 1: IC 95 % | [-257, 171] | [-257, 171] |
| OK | Caso 1: p ajustado | 0.88 | 0.88 |
| OK | Caso 1: veredicto | sin_evidencia | sin_evidencia |
| OK | Caso 1: r con ONI | -0.64 | -0.64 |
| OK | Caso 2: periodo completo | -48 | -48 |
| OK | Caso 2: veredicto completo | sin_evidencia | sin_evidencia |
| OK | Caso 2: 2008-2023 pendiente | -345 | -345 |
| OK | Caso 2: 2008-2023 veredicto | limitada | limitada |
| OK | Caso 2: 2001-2010 pendiente | 382 | 382 |
| OK | Caso 2: 2001-2010 veredicto | limitada | limitada |
| OK | Caso 2: año más húmedo (temporada) | 2008 | 2008 |
| OK | Caso 2: 2010 y 2011 entre los 4 más húmedos (temporada) | sí | sí |
| OK | Caso 3: pendiente | -452 | -452 |
| OK | Caso 3: media mm | 1478 | 1478 |
| OK | Caso 3: p ajustado | 0.032 | 0.032 |
| OK | Caso 3: veredicto | consistente | consistente |
| OK | Bandera 2013-2015 GTM (temporada, canícula) % | (12.1, 34.9) | (12.1, 34.9) |
| OK | Bandera 2013-2015 HND (temporada, canícula) % | (0.1, 2.2) | (0.1, 2.2) |
| OK | Bandera 2013-2015 SLV (temporada, canícula) % | (0.6, 8.9) | (0.6, 8.9) |
