# ALTARIS web (Vite + React + TypeScript)

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/ (estático, sin servidor)
```

Los datos están en `public/data/` y los genera `python pipeline/run_all.py` (o `--synthetic` para los de prueba). La app solo lee JSON: no hace llamadas en vivo.

## Quién es dueño de qué

| Pieza | Archivos | Rol |
|---|---|---|
| Panel de celda, huella, comparador, ENSO, espejo, tarjetas, recorrido, pasaporte | `src/panel/*` | Rol 5 |
| Tipos del contrato | `src/types.ts` | Rol 4 (borrador de Rol 5, sigue `pipeline/README.md`) |
| Estado en la URL | `src/urlState.ts` | Rol 4 (versión mínima de Rol 5) |
| Mapa, globo, barra superior, despliegue | `src/App.tsx` es un **contenedor provisional**: la lista de celdas ocupa el lugar del mapa | Rol 4 |
| `glossary.json`, `decision_rules.json`, `tour.json` | `public/data/` (**borradores**, marcados como tales) | Rol 6 |

## Cómo montar el panel (para Rol 4)

```tsx
<GlossaryContext.Provider value={glossary}>
  <CellPanel meta={meta} grid={grid} rules={decisionRules} tour={tour} state={urlState} update={setUrlState} />
</GlossaryContext.Provider>
```

El panel lee `state.cell`, `ind`, `win`, `enso`, `lang`, `lens`, `tour`, `case` y `cmp`, y escribe `win` (clic en la huella), `enso` (interruptor), `cmp` (vista espejo) y `tour`.
**Parámetro añadido:** `cmp=<id>` es la segunda celda de la vista espejo.

## Decisiones de Rol 5

- **Gráficas en SVG propio, sin Recharts ni Plotly.** La huella triangular no existe en esas librerías y así el paquete pesa menos (unos 87 kB gzip en total). Si Rol 4 adopta una librería para el mapa, no hay conflicto.
- **Colores validados** con un validador de paleta (separación para daltonismo y contraste): azul/naranja para las fases ENSO; rampa azul ordinal más gris para los veredictos; divergente azul (alza) ↔ rojo (baja) en la huella. El veredicto **nunca** depende solo del color: siempre lleva icono (● ◐ ○ ⊘) y texto.
- Cada gráfica tiene tooltip al pasar el cursor y una vista de tabla ("Ver tabla").
- Modo oscuro con `prefers-color-scheme`, vista móvil por debajo de 760 px y hoja de estilo para imprimir el pasaporte.
- **Micro-validación:** las 2 respuestas se guardan **anónimas en `localStorage`** del navegador (`altaris_microvalidation`) hasta que Rol 6 indique dónde guardarlas.
