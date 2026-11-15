# ALTARIS — panel de celda (Rol 5)

```powershell
npm ci
npm run dev
npm test
npm run typecheck
npm run build
```

Abrir `http://localhost:5173/?cell=N1345W08815&ind=jul_aug_mm&win=2001-2016&tour=1`.

Implementa panel, huella, comparación por ventana, ENSO, comparación de celdas, segunda variable, matriz territorial, glosario, recorrido, tarjetas, pasaporte y microvalidación local. Incluye selector geográfico sin mapa base para integración.

**Los datos incluidos son simulados.** No hay datos científicos reales ni resultados de pruebas con personas. El aviso aparece en pantalla y en el pasaporte. La segunda variable de ejemplo y los veredictos de ventana son fixtures para probar la interfaz.

Ver [INTEGRACION.md](INTEGRACION.md) para el contrato de ventanas y segunda variable, conexión al pipeline, almacenamiento de respuestas y protocolo con cinco usuarios.

Para regenerar únicamente los fixtures: `node src/panel/mock/make-mock.mjs public/data`.

Para las pruebas en navegador, iniciar Vite en el puerto 4173 y ejecutar `npm run test:e2e`. Las pruebas usan Chrome; se puede definir `CHROME_PATH`. Capturas y PDF se guardan en `node_modules/.cache/acceptance`.

Parte del código original fue asistido por Claude; las ampliaciones y pruebas de esta revisión fueron asistidas por Codex. Registrar ambos usos en la entrega.
