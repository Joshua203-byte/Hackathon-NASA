# ONI (Oceanic Nino Index), NOAA CPC

- Fuente: https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt
- Leido el 15 nov 2026 (columnas SEAS, YR, TOTAL, ANOM).
- `oni.csv` conserva solo la columna ANOM (anomalia, grados C) de 2001 a 2024: 24 anios x 12 trimestres moviles = 288 filas.
- `season` es el trimestre movil; DJF de un anio = dic del anio previo, ene, feb. Orden: DJF, JFM, FMA, MAM, AMJ, MJJ, JJA, JAS, ASO, SON, OND, NDJ.
- NOAA revisa el ONI de vez en cuando; los valores de aqui son los del archivo en la fecha indicada.
- ONI no es un dato de la NASA: se declara como auxiliar.
- Transcrito a mano desde la lectura del archivo; `tests/test_enso.py` comprueba el tamano y varios valores conocidos.
