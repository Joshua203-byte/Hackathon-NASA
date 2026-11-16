# Independent validation with NASA Giovanni — Choluteca case

**Date:** 2026-11-15  
**Project:** ALTARIS — Earth Trend Intelligence (NASA Space Apps Challenge 2026, "Be An Earth System Trend Detective")  
**Case checked:** Example 1 · Choluteca, Dry Corridor (Honduras) · cell `N1335W08715` · 13.35°N, 87.15°W  
**Indicator:** rainy-season rainfall, May–October sum (mm/season), 2001–2024  

---

## 1. What we did and why

The ALTARIS analysis is computed with our own scripts, which download IMERG from the GES DISC archive. None of the tools on the challenge's resource list (Giovanni, Hydrology Time Series, AppEEARS, Climate Data Online) is part of that computation.

To cross-check the result, we extracted **an independent series for the same cell** with **NASA Giovanni**, one of the tools listed by the challenge, and compared it with the pipeline output.

**Scope:** this is a **one-case check**. It does not replace our pipeline and does not by itself validate the other cells. It must not be described as "we used Giovanni" for the analysis.

---

## 2. Giovanni parameters (v 4.40)

| Parameter | Value |
|---|---|
| Plot type | Time Series, Area-Averaged |
| Variable | Merged satellite-gauge precipitation estimate – Final Run (recommended for general use), `GPM_3IMERGM v07`, monthly, 0.1°, mm/hr |
| Period | 2001-01-01 a 2024-12-31 |
| Region | `-87.15,13.35,-87.15,13.35` (a single point; Giovanni confirms that the analysable region is that point) |
| Downloaded data | CSV `docs/validacion_giovanni/g4.areaAvgTimeSeries.GPM_3IMERGM_07_precipitation.20010101-20241231.87W_13N_87W_13N.csv` |

**Link to reproduce the result in Giovanni** (requires an Earthdata account):

```
https://giovanni.gsfc.nasa.gov/giovanni/#service=ArAvTs&starttime=2001-01-01T00:00:00Z&endtime=2024-12-31T23:59:59Z&bbox=-87.15,13.35,-87.15,13.35&data=GPM_3IMERGM_07_precipitation&variableFacets=dataFieldMeasurement%3APrecipitation%3B&dataKeyword=IMERG&portal=GIOVANNI&format=json
```

---

## 3. Plot generated directly in NASA Giovanni

![Time series in Giovanni](img/giovanni_time_series_choluteca.jpg)

---

## 4. Computation applied to the Giovanni series

1. Giovanni returns the monthly mean rate in **mm/hour**. It was converted to mm per month by multiplying by `24 × real days of the month` (leap years included).
2. May to October of each year were summed (24 complete years, 2001–2024).
3. The **Sen slope** (Theil–Sen) was computed with its **95 % CI**, expressed per decade, together with a Kendall trend test (scipy `kendalltau`), equivalent to Mann–Kendall without tie correction.

### May–October totals obtained (mm/season)

| Year | mm | Year | mm | Year | mm |
|---|---|---|---|---|---|
| 2001 | 1061.0 | 2009 | 1179.4 | 2017 | 1572.6 |
| 2002 | 1404.0 | 2010 | 2103.6 | 2018 | 1418.9 |
| 2003 | 1546.0 | 2011 | 2069.8 | 2019 | 1131.2 |
| 2004 | 1346.3 | 2012 | 1470.4 | 2020 | 1669.2 |
| 2005 | 1527.0 | 2013 | 1256.9 | 2021 | 1225.1 |
| 2006 | 1318.5 | 2014 | 1450.4 | 2022 | 1684.1 |
| 2007 | 1873.3 | 2015 | 900.2 | 2023 | 1152.3 |
| 2008 | 1996.0 | 2016 | 1352.9 | 2024 | 1435.8 |

---

## 5. Result of the comparison

| Metric | ALTARIS (pipeline) | Giovanni (separate computation) | Match? |
|---|---|---|---|
| Sen slope | −48.1 mm/decade | −48.1 mm/decade | Yes |
| 95 % CI of the slope | [−257.4, 170.9] | [−257.4, 170.9] | Yes |
| Mean May–Oct rainfall | 1464 mm/season | 1464.4 mm/season | Yes |
| Relative change | −3.3 % | −3.3 % | Yes |
| p-value | 0.785 (Mann–Kendall) | 0.787 (Kendall tau) | Difference of 0.002 |
| Valid years | 24/24 | 24/24 | Yes |

**ALTARIS verdict for this cell:** *No evidence of a trend* (the CI includes zero, high p, not significant after FDR).

**Reading:** the series that Giovanni returns for the same point, product, version and period reproduces the pipeline's slope and interval to the first decimal. This indicates that:
- (a) The pipeline's IMERG V07 download matches Giovanni's exactly.
- (b) The conversion from mm/hr to mm/season and the trend estimation are correctly implemented.

---

## 6. Limitations of this validation

- It covers **a single case** (Choluteca). The other cells were not checked with Giovanni.
- Giovanni and the pipeline read the same product (IMERG V07 Final), so this **confirms the implementation, not the accuracy of the satellite product** against ground measurements.
- The ENSO tests, the year window and the pipeline's FDR correction were not cross-checked here; the check was limited to slope, interval and mean.
- The p-value of the check was computed with an equivalent, not identical, test to the pipeline's.

---

## 7. How to reproduce it

1. Log in to Giovanni with a NASA Earthdata account and open the link in section 2, or set the parameters in the table manually.
2. Press *Plot Data* and download the CSV.
3. Convert mm/hr to mm/month (`× 24 × days in the month`), sum May–October per year and compute the Sen slope with a 95 % CI per decade.
4. Compare with the panel of cell `N1335W08715` in ALTARIS (indicator `may_oct_mm`).
