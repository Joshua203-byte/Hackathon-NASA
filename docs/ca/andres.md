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
- [x] Rellenar cifras CA con las tablas de Joshua y ejecutar el cotejo: 41/41. La revisión/firma científica de Camila permanece pendiente de aprobación.

## Reporte (lo llenas tú)

**Actualización con resultados reales de integración `09ebae1`:** se recibió el ZIP oficial de Joshua, SHA256 `77e7978646f518e4bdbbabbf4694fbbe6f70a53b462b8c0e2bdd4229e475e9b6`, motor `7e93e46`, 4 332 celdas observadas. El formulario ya incorpora las tablas, los p ajustados nuevos, ENSO y temporadas. Pasó **41/41** comprobaciones de `check_form_ca.py`, sin marcas de cifras CA pendientes. Evidencia y alcance en [cotejo-formulario-ca.md](../rol6/cotejo-formulario-ca.md).

Los pendientes externos conservan marcas específicas: video, publicación, personas, elegibilidad del recurso NASA y auditoría final. No se eliminaron para simular que existe una entrega lista. El reporte científico de Camila en el commit consultado sigue sin firma; que existan las tablas de Joshua no sustituye esa firma ni el GO de las 12:45.

| Qué hice | Qué comprobé y cómo | Qué falta |
|---|---|---|
| [Formulario de siete países](../rol6/submission-en-ca.md), por campos oficiales | Cifras de integración y ZIP oficial. 41/41 cotejos; casos con p ajustados 0,8735, 0,7374 y 0,02424. ENSO positivo en países nuevos y veredictos consistentes fuera de Guatemala expresados correctamente | Firma de Camila, GO y pendientes externos de entrega |
| [README alternativo en inglés](../rol6/README-en-ca.md) y [referencias](../rol6/references-en.md) | Cobertura, procedencia y hash actualizados. README raíz y formulario de tres países intactos. Enlaces del README alternativo preparados para su promoción a la raíz | GO, URL, licencias, inglés final y promoción posterior |
| [Guion de 28 s para ambas versiones](../rol6/guion-video-30s.md) | Mismos textos/caso; cambia plano inicial. Sin prometer contraste ENSO o cifras regionales. Ventanas del caso 2 cotejadas con export actual | Captura congelada, dos ensayos cronometrados, revisión y reproducción pública |
| [Guías 2026 verificadas directamente](../rol6/guias-2026-resumen.md) | Lectura completa en navegador de envío/evaluación (13 nov); pestaña Resources. Rúbrica 1–5; marca SI confirmada; IMERG no figura por nombre | Interpretación de fuente NASA listada si lo requiere el organizador; no se contactó a terceros |
| Respaldo de tres países comprobado | `python pipeline/check_form_numbers.py .`: 45/45 expectativas coinciden con los datos locales. El script usa cifras fijas; no analiza automáticamente el texto del formulario | No acredita cifras de CA ni una nueva publicación |
| Pruebas y acceso al portal | Andrés confirmó que no tiene resultados. El navegador integrado muestra Login. El control de Chrome se detuvo al no poder verificar su URL | Sesiones y registro anónimo; seis inscripciones, evento/zona y Project pendientes |

## Relevo y cierre pendiente

La nota anterior sobre ausencia de resultados de Joshua quedó superada por integración `09ebae1`: ya están `TABLAS.md`, `COMPARACION.md` y `TEMPORADAS.csv`, y se recibió el ZIP. Se completaron las cifras de producto con esos resultados. El checklist de Camila consultado sigue sin completar y sin firma. No se usó el mock como observación ni se completaron resultados de personas inexistentes.

1. **Hecho:** recibir export, tablas y comparación; completar cifras CA, casos, calibración y alcance de POWER. **Pendiente:** revisión y limitaciones definitivas firmadas por Camila.
2. **Hecho:** ejecutar `check_form_ca.py` de integración sobre el ZIP oficial: 41/41. El cotejador no valida toda la prosa; la evidencia complementaria está en el reporte enlazado. `check_form_numbers.py` se conserva para tres países.
3. Joshua decide GO/NO-GO. Con NO-GO conservar los materiales oficiales. Con GO, integrar según docs/10, verificar URL y promover el README alternativo a la raíz para resolver sus enlaces.
4. Grabar sobre la versión congelada y recoger resultados de personas. Si no hubo sesiones, declararlo. Las sesiones previstas son sobre producción de tres países: no validan por sí solas CA.
5. Revisar inglés en materiales enlazados, licencias y enlaces públicos. Comprobar portal y guardar confirmación del envío. Este reporte no acredita envío, aceptación de términos ni acceso a la cuenta.
