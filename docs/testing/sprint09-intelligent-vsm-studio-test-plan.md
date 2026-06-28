# Sprint 9 - Intelligent VSM Studio Test Plan

## Objetivo

Validar que el Intelligent VSM Studio represente el Process Model enriquecido como un VSM vivo, con metricas operativas, visualizacion interactiva y sincronizacion de cambios.

## Casos de prueba

1. Generacion automatica desde Process Model
   - Dado un Process Model con `operationalData`.
   - Cuando se carga el Studio.
   - Entonces se generan bloques VSM por actividad con secuencia, responsable, area, sistema, documentos y clasificacion.

2. Calculo de metricas
   - Dadas actividades con tiempos min/probable/max y espera.
   - Cuando se carga el VSM.
   - Entonces se calcula Lead Time, Process Time, Touch Time, Waiting Time, tiempo VA, NNVA, NVA y porcentajes.

3. Validaciones automaticas
   - Dada una actividad sin tiempos, clasificacion, frecuencia o responsable.
   - Cuando se carga el Studio.
   - Entonces se muestra una validacion abierta.

4. Edicion desde VSM
   - Dada una actividad seleccionada.
   - Cuando el usuario actualiza tiempos, espera, frecuencia o clasificacion.
   - Entonces se actualiza `vsmData`, `operationalData`, Process Model, Knowledge Package y Context Graph.

5. Visualizacion interactiva
   - Dado el canvas VSM.
   - Cuando el usuario usa zoom, pan, drag & drop, toggles o colapsa un subprocess.
   - Entonces el canvas conserva layout y actualiza la visualizacion sin crear un modelo separado.

## Pruebas ejecutadas

- Validacion de sintaxis JavaScript con `node --check`.
- Prueba funcional local del servicio con Process Model enriquecido:
  - Validaciones: 0.
  - Lead Time recalculado.
  - Process Time recalculado.
  - VA/NVA recalculado.
  - Context Graph sincronizado con nodos VSM.

## Riesgos pendientes

- Persistencia real en Google Sheets pendiente.
- No existe renderizacion BPMN/VSM avanzada con lanes formales.
- No se implementan Lean Analyzer, TOC Analyzer, Automatizacion, IA Opportunity ni Business Case en este Sprint.
