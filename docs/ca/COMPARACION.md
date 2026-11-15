# Comparación de regiones

- Celdas en la versión anterior: **2025**; en la nueva: **4332** (comunes: **2025**, solo en la nueva: 2307).
- Mismo periodo: **sí**. Umbrales idénticos en `meta.json`: **sí**.
- Nivel de FDR usado para explicar cambios: 0.05.

## Condición 1: lo que es por celda debe ser idéntico

**CUMPLE.** En las 2025 celdas comunes coinciden serie, media, pendiente, intervalo, p, huella, ventanas, ENSO y salto de 2014.

## Condición 2: cambios de veredicto y su causa

Celdas-indicador que cambiaron de veredicto: **29**; explicadas por el FDR (cruzan el umbral): **29**; **no explicadas: 0**.

Matriz de transición (anterior → nueva), por indicador:

| Indicador | Anterior | Nueva | Celdas |
|---|---|---|---|
| annual_mm | sin_evidencia | sin_evidencia | 1354 |
| annual_mm | limitada | limitada | 600 |
| annual_mm | consistente | consistente | 56 |
| annual_mm | limitada | consistente | 15 (cambió) |
| jul_aug_mm | sin_evidencia | sin_evidencia | 1069 |
| jul_aug_mm | limitada | limitada | 956 |
| may_oct_mm | sin_evidencia | sin_evidencia | 1060 |
| may_oct_mm | limitada | limitada | 907 |
| may_oct_mm | consistente | consistente | 44 |
| may_oct_mm | limitada | consistente | 14 (cambió) |

Cambios (primero los no explicados):

| Celda | País | Indicador | Antes | Ahora | p FDR antes → ahora | ¿Por FDR? |
|---|---|---|---|---|---|---|
| N1465W09115 | GTM | annual_mm | limitada | consistente | 0.05076 → 0.03937 | sí |
| N1475W09145 | GTM | annual_mm | limitada | consistente | 0.06094 → 0.04704 | sí |
| N1485W09005 | GTM | annual_mm | limitada | consistente | 0.06094 → 0.04704 | sí |
| N1485W09035 | GTM | annual_mm | limitada | consistente | 0.0567 → 0.04361 | sí |
| N1485W09065 | GTM | annual_mm | limitada | consistente | 0.0567 → 0.04361 | sí |
| N1485W09095 | GTM | annual_mm | limitada | consistente | 0.05076 → 0.03937 | sí |
| N1495W09005 | GTM | may_oct_mm | limitada | consistente | 0.05634 → 0.03937 | sí |
| N1495W09015 | GTM | may_oct_mm | limitada | consistente | 0.05634 → 0.03937 | sí |
| N1495W09035 | GTM | may_oct_mm | limitada | consistente | 0.05215 → 0.03576 | sí |
| N1495W09045 | GTM | may_oct_mm | limitada | consistente | 0.05853 → 0.04189 | sí |
| N1495W09055 | GTM | may_oct_mm | limitada | consistente | 0.06736 → 0.04704 | sí |
| N1495W09065 | GTM | may_oct_mm | limitada | consistente | 0.05634 → 0.03937 | sí |
| N1495W09075 | GTM | annual_mm | limitada | consistente | 0.05076 → 0.03937 | sí |
| N1495W09075 | GTM | may_oct_mm | limitada | consistente | 0.05853 → 0.04189 | sí |
| N1495W09085 | GTM | may_oct_mm | limitada | consistente | 0.05853 → 0.04189 | sí |
| N1495W09095 | GTM | may_oct_mm | limitada | consistente | 0.05853 → 0.04189 | sí |
| N1495W09155 | GTM | annual_mm | limitada | consistente | 0.05076 → 0.03937 | sí |
| N1495W09185 | GTM | annual_mm | limitada | consistente | 0.06094 → 0.04704 | sí |
| N1515W09155 | GTM | may_oct_mm | limitada | consistente | 0.05853 → 0.04189 | sí |
| N1515W09165 | GTM | may_oct_mm | limitada | consistente | 0.05853 → 0.04189 | sí |
| N1525W09175 | GTM | may_oct_mm | limitada | consistente | 0.05634 → 0.03937 | sí |
| N1535W09065 | GTM | may_oct_mm | limitada | consistente | 0.05634 → 0.03937 | sí |
| N1535W09105 | GTM | annual_mm | limitada | consistente | 0.05076 → 0.03937 | sí |
| N1535W09165 | GTM | annual_mm | limitada | consistente | 0.06094 → 0.04704 | sí |
| N1535W09165 | GTM | may_oct_mm | limitada | consistente | 0.05634 → 0.03937 | sí |
| N1535W09175 | GTM | annual_mm | limitada | consistente | 0.0567 → 0.04361 | sí |
| N1635W09035 | GTM | annual_mm | limitada | consistente | 0.06094 → 0.04704 | sí |
| N1645W09015 | GTM | annual_mm | limitada | consistente | 0.06094 → 0.04704 | sí |
| N1665W09025 | GTM | annual_mm | limitada | consistente | 0.06094 → 0.04704 | sí |

## Los 3 casos

| Celda | Indicador | Veredicto antes | ahora | p FDR antes → ahora |
|---|---|---|---|---|
| N1335W08715 | may_oct_mm | sin_evidencia | sin_evidencia | 0.8787 → 0.8735 |
| N1335W08715 | jul_aug_mm | sin_evidencia | sin_evidencia | 0.9819 → 0.9994 |
| N1335W08715 | annual_mm | sin_evidencia | sin_evidencia | 1 → 1 |
| N1475W08765 | may_oct_mm | sin_evidencia | sin_evidencia | 0.7814 → 0.7374 |
| N1475W08765 | jul_aug_mm | sin_evidencia | sin_evidencia | 1 → 1 |
| N1475W08765 | annual_mm | sin_evidencia | sin_evidencia | 1 → 0.9783 |
| N1495W09125 | may_oct_mm | consistente | consistente | 0.03179 → 0.02424 |
| N1495W09125 | jul_aug_mm | limitada | limitada | 0.07965 → 0.0915 |
| N1495W09125 | annual_mm | consistente | consistente | 0.01972 → 0.01337 |

## Resultado para el GO/NO-GO

- Condición 1 (idéntico por celda): **OK**
- Condición 2 (cambios explicados por el FDR y casos sin cambio): **OK**
