# Andrés · Rol 6 · Producto · Centroamérica

**Rama:** `ca/andres-producto`  ·  **Hora meta:** 11:30 con marcas · 13:30 con números  ·  Plan completo: [docs/10-centroamerica.md](../10-centroamerica.md)

```bash
git fetch origin
git checkout ca/andres-producto
```

## Reglas

- Subes **solo a `ca/andres-producto`**. No hagas `push` a `main` ni a la rama de otra persona.
- Tocas **solo tus archivos**: `docs/rol6/**`; `docs/ca/andres.md`; `README.md` (solo si hay GO).
- No subas el JSON grande (~300 MB): se entrega como `.zip` por el chat.
- Datos simulados para trabajar ya: `cd pipeline && python make_ca_mock.py --out /tmp/ca-mock --stride 12`.
- Commits pequeños, uno por cambio, con el porqué en el mensaje.

## Mi lista

- [x] Crear `docs/rol6/submission-en-ca.md` (formulario para 7 países, con `[PENDING-CA]` donde van números nuevos). **No tocar `submission-en.md`**: es el respaldo.
- [x] Variante del README y de los textos de entrega para Centroamérica, con marcas `[PENDING-CA]`.
- [x] Guion del video de 30 s en dos versiones (3 países / Centroamérica).
- [ ] Seguir con lo pendiente: guías 2026, acceso al portal y las 5 sesiones con personas (sobre la URL de producción actual).
- [ ] Con las tablas de Joshua y las limitaciones de Camila: rellenar los `[PENDING-CA]` y correr el cotejo de cifras.

## Reporte (lo llenas tú)

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| [Formulario de siete países](../rol6/submission-en-ca.md), por campos oficiales | Siete países; marcadores en cifras y conclusiones que requieren nueva corrida. Explica FDR sin cambiar umbrales | Export observado, tablas y comparación de Joshua, revisión de Camila y cotejador adaptado |
| [README alternativo en inglés](../rol6/README-en-ca.md) y [referencias](../rol6/references-en.md) | El README raíz y `submission-en.md` se conservan intactos. Los enlaces del README alternativo están preparados para su ubicación final en la raíz | GO, cifras, procedencia, URL, licencias y promoción posterior |
| [Guion de 28 s para ambas versiones](../rol6/guion-video-30s.md) | Mismos textos/caso; cambia plano inicial. Sin prometer contraste ENSO o cifras regionales. Ventanas del caso 2 cotejadas con export actual | Captura congelada, dos ensayos cronometrados, revisión y reproducción pública |
| [Guías 2026 verificadas directamente](../rol6/guias-2026-resumen.md) | Lectura completa en navegador de envío/evaluación (13 nov); pestaña Resources. Rúbrica 1–5; marca SI confirmada; IMERG no figura por nombre | Interpretación de fuente NASA listada si lo requiere el organizador; no se contactó a terceros |
| Respaldo de tres países comprobado | `python pipeline/check_form_numbers.py .`: 45/45 expectativas coinciden con los datos locales. El script usa cifras fijas; no analiza automáticamente el texto del formulario | No acredita cifras de CA ni una nueva publicación |
| Pruebas y acceso al portal | Andrés confirmó que no tiene resultados. El navegador integrado muestra Login. El control de Chrome se detuvo al no poder verificar su URL | Sesiones y registro anónimo; seis inscripciones, evento/zona y Project pendientes |

## Relevo y cierre pendiente

Los materiales preparables sin datos están listos. Las referencias remotas consultadas de `docs/ca/joshua.md` y `docs/ca/camila.md` aún contenían listas sin resultados ni firma. No se usó el mock como observación ni se completaron resultados inexistentes.

1. Recibir export, tablas, comparación y limitaciones firmadas. Confirmar commits, completar `[PENDING-CA]` y cotejar casos, calibración y cobertura de POWER.
2. Usar el cotejador adaptado por Joshua. El actual `pipeline/check_form_numbers.py` tiene expectativas de tres países y no certifica CA.
3. Joshua decide GO/NO-GO. Con NO-GO conservar los materiales oficiales. Con GO, integrar según docs/10, verificar URL y promover el README alternativo a la raíz para resolver sus enlaces.
4. Grabar sobre la versión congelada y recoger resultados de personas. Si no hubo sesiones, declararlo. Las sesiones previstas son sobre producción de tres países: no validan por sí solas CA.
5. Revisar inglés en materiales enlazados, licencias y enlaces públicos. Comprobar portal y guardar confirmación del envío. Este reporte no acredita envío, aceptación de términos ni acceso a la cuenta.
