# Sprint 11 - Case Runner & Methodology Orchestrator Test Plan

## Objetivo

Validar que el Methodology Orchestrator coordine la secuencia oficial de consultoria sin ejecutar analisis ni IA.

## Casos de prueba

1. Construccion de Project Transformation Status
   - Dado el estado de los modulos existentes.
   - Cuando se carga el Orchestrator.
   - Entonces se calcula etapa actual, avance, completadas, pendientes, bloqueos, informacion faltante, Health Score y responsable.

2. Bloqueo secuencial
   - Dada una etapa obligatoria anterior sin aprobar.
   - Cuando el usuario intenta aprobar una etapa posterior.
   - Entonces el sistema bloquea la aprobacion.

3. Aprobacion de etapa lista
   - Dada una etapa sin bloqueos y lista para aprobacion.
   - Cuando el usuario aprueba.
   - Entonces se registra aprobador, fecha y comentarios.

4. Etapas futuras
   - Dada una etapa futura como Lean, TOC, To-Be o Business Case.
   - Cuando se muestra en el dashboard.
   - Entonces aparece como FUTURE y no se permite aprobarla.

5. No duplicacion de logica
   - Dado que los Studios existentes ya calculan validaciones.
   - Cuando el Orchestrator evalua una etapa.
   - Entonces solo consume estados existentes y no ejecuta analisis de negocio.

## Pruebas ejecutadas

- Validacion de sintaxis JavaScript con `node --check`.
- Prueba funcional local del servicio:
  - `Project Transformation Status` generado.
  - 15 etapas metodologicas registradas.
  - etapa actual calculada.
  - bloqueos secuenciales calculados.
  - aprobacion de etapa bloqueada rechazada correctamente.

## Riesgos pendientes

- Persistencia actual en `localStorage`.
- Project Transformation Status no se guarda todavia en Google Sheets.
- No existe navegacion global entre experiencias; el Orchestrator coordina estado, no rutas.
