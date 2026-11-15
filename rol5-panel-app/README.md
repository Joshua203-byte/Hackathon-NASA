# ALTARIS — panel de celda (Rol 5), app ejecutable

```bash
npm install
node src/panel/mock/make-mock.mjs public/data   # regenera las celdas de prueba (opcional)
npm run dev        # http://localhost:5173/?cell=N1345W08815&ind=jul_aug_mm&win=2001-2016&tour=1
npx vitest run     # 27 pruebas de lógica
npx tsc -p .       # tipos estrictos
```

- `src/panel/` es lo que se integra en `web/src/panel/` del repo. `src/Shell.tsx` es una carcasa temporal que hace de mapa y barra superior de Rol 4: se descarta.
- `public/data/` trae datos de PRUEBA (4 celdas + 1 JSON roto + 1 id inexistente) y los archivos de Rol 6 (`tour`, `glossary`, `decision_rules`) y Rol 3 (`enso`) en forma provisional.
- Recorrido de aceptación en navegador: ver `e2e/accept.mjs` (Playwright + Chrome), 35 comprobaciones.
- Parte de este código fue asistido por IA (Claude): anotarlo en el registro de uso de IA.
