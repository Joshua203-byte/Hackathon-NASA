# Cifras provisionales y candidatos a casos (corte domingo 15 de noviembre, 01:55)

Resultados del motor (`pipeline/`, umbrales congelados en el commit `f931354`) sobre las 2 025 celdas reales de IMERG, periodo 2001–2024, con ONI de NOAA y prueba de Pettitt. Todavía **no los revisó Camila**: son provisionales hasta que lo haga. Las celdas vecinas están muy correlacionadas, así que no son miles de hallazgos independientes.

## 1. Veredictos por país e indicador (celdas)

| Indicador | País | consistente | limitada | sin_evidencia | Total |
|---|---|---|---|---|---|
| may_oct_mm | Guatemala | 58 | 548 | 311 | 917 |
| may_oct_mm | Honduras | 0 | 295 | 644 | 939 |
| may_oct_mm | El Salvador | 0 | 70 | 99 | 169 |
| jul_aug_mm | Guatemala | 0 | 660 | 257 | 917 |
| jul_aug_mm | Honduras | 0 | 219 | 720 | 939 |
| jul_aug_mm | El Salvador | 0 | 77 | 92 | 169 |
| annual_mm | Guatemala | 88 | 472 | 357 | 917 |
| annual_mm | Honduras | 0 | 90 | 849 | 939 |
| annual_mm | El Salvador | 0 | 30 | 139 | 169 |

Sin celdas `incompleta`: todas tienen 24 de 24 años válidos.

## 2. Lo que dicen los datos (sin adornar)

1. **En Honduras ninguna celda sale `consistente` en ningún indicador.** Es el país del enfoque del proyecto. El hallazgo honesto es "no se puede sostener una tendencia con 24 años": 644 de 939 celdas sin evidencia en lluvia de temporada, 849 en lluvia anual. El signo es casi siempre negativo (98 % de las celdas en lluvia de temporada, mediana de −4,5 % por década), pero los intervalos incluyen el cero.
2. **Todas las celdas `consistente` están en Guatemala**, en una franja de las tierras altas del oeste (lat 14,85 a 15,35, lon −91,75 a −90,05). Son 58 en lluvia de temporada (todas con pendiente negativa) y 88 en lluvia anual (82 negativas, 6 positivas). El más fuerte, `N1495W09125`, baja unos 450 mm por década sobre una media de ~1 480 mm, o sea cerca de −30 % por década, con p ajustado de 0,009 y 100 % de ventanas con el mismo signo. **Es una caída muy grande y hay que examinarla antes de contarla como hallazgo climático**: IMERG Final se ajusta con pluviómetros y donde hay pocos el ajuste es débil. David además encontró que IMERG y NASA POWER discrepan en el signo en 7 de 9 comparaciones. La bandera de 2014 no se activó ahí, pero eso no descarta un efecto instrumental.
3. **No aparece el "efecto espejo" de ENSO.** La correlación de Spearman con ONI es negativa en todas las celdas en lluvia de temporada y canícula (de −0,04 a −0,68 y de −0,06 a −0,86), y solo una celda de las 2 025 tiene signo positivo en lluvia anual. Más El Niño, menos lluvia en toda la región; no hay un par con signo opuesto. El plan prevé reportarlo así: "en este registro no se distingue".
4. **ENSO explica parte de la señal:** la tendencia no sobrevive al control en 515 celdas (lluvia de temporada), 431 (canícula) y 336 (anual), con un criterio conservador (las dos variantes deben conservar el signo y quedar dentro del intervalo del periodo base).
5. **Salto 2014:** bandera en 5,6 % de las celdas (lluvia de temporada), 5,1 % (anual) y **17,6 % (canícula)**. Hay que decirlo en la primera pantalla.
6. **Sin consistentes en canícula (jul–ago) en ningún país.** Esa lluvia es más variable de un año a otro.

## 3. Calibración (1 000 simulaciones, series con coeficientes de variación 0,12 / 0,20 / 0,35)

| | Resultado |
|---|---|
| Falsos positivos `consistente` en ruido sin tendencia | 0,0 % |
| Falsos positivos `limitada` en ruido | 33,3 % |
| Potencia con −10 % por década | `consistente` 15,2 %, `limitada` o más 72,4 % |
| Potencia con −5 % por década | `consistente` 0,8 %, `limitada` o más 47,6 % |
| Potencia con −20 % por década | `consistente` 54,4 %, `limitada` o más 91,6 % |

Lectura: `consistente` casi nunca se equivoca, pero solo detecta tendencias fuertes. `limitada` es "señal débil, no confirmada": en ruido puro aparece en un tercio de las series, así que no es evidencia. El 43–47 % de `limitada` en lluvia de temporada y canícula está poco por encima de ese nivel. Esta calibración supone que ENSO y 2014 no restan, así que describe solo la parte estadística.

## 4. Candidatos a casos (los decide Camila)

Criterios, no veredictos. Cualquier elección debe poder justificarse con estos datos, no con el aspecto de la figura.

| Caso (de `docs/rol6/README.md`) | Candidato | Por qué | Cifras |
|---|---|---|---|
| 1. Corredor Seco hondureño | `N1335W08715` (Choluteca, celda piloto) | Es el sitio del plan; muestra "no encontrar tendencia también es un hallazgo" | lluvia de temporada: −48 mm por década, IC 95 % de −257 a +171, p ajustado 0,88, `sin_evidencia`; correlación con ONI −0,64 |
| 2. Sensibilidad al periodo | por elegir | Buscar una celda donde la ventana cambie el veredicto o el signo; hay que consultar `window_results` | Joshua lo extrae cuando Camila nombre la celda |
| 3. Contraste entre sitios | `N1495W09125` (Guatemala) frente a `N1335W08715` (Choluteca) | No hay par con ENSO de signo opuesto; el plan prevé comparar dos veredictos y decir esa limitación | caso 3 = dos veredictos bajo la misma fase ENSO |

Advertencia para quien elija: si el Caso 3 usa la celda de Guatemala, hay que presentarla con la salvedad del punto 2 de la sección 2, no como "la lluvia cae 30 % por década".

## 5. Qué sigue con estas cifras

- **Camila:** revisar el criterio de `survives`, el 17,6 % de banderas de 2014 en canícula y la celda `N1495W09125` frente a la discrepancia IMERG–POWER; elegir los 3 casos y pasar los IDs a David (`04_power.py --cells ...`).
- **Andrés:** estas cifras sirven para el formulario. Decir que el resultado para Honduras es "sin evidencia sostenida", no una tendencia a la baja.
- **Joshua:** extraer las cifras exactas de cada caso (pendiente, intervalo, ventanas, razones) cuando haya IDs, y revisar 10 celdas con Camila.
