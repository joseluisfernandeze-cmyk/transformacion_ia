# Sprint 12 - Casos de prueba Lean Transformation Consultant

## TC-LC-001 - Carga del modulo

Pasos:

1. Abrir `frontend/index.html`.
2. Navegar a `Lean Consultant`.

Resultado esperado:

- La pantalla abre dentro del Workspace.
- Se muestra el titulo `Lean Transformation Consultant`.
- No aparece como `Proximamente`.

## TC-LC-002 - Process Model requerido

Condicion inicial: no existe Process Model.

Pasos:

1. Abrir `Lean Consultant`.

Resultado esperado:

- El sistema informa que se requiere Process Model.
- No genera diagnostico sin datos.

## TC-LC-003 - Generar Lean Assessment Package

Condicion inicial: existe Process Model con actividades.

Pasos:

1. Abrir `Lean Consultant`.
2. Presionar `Ejecutar diagnostico Lean`.

Resultado esperado:

- Se crea `Lean Assessment Package`.
- Se genera un assessment por actividad.
- Se muestra resumen con actividades, desperdicios, quick wins y oportunidades.

## TC-LC-004 - Clasificacion VA/NNVA/NVA

Condicion inicial: actividades con `vsmData.valueClassification` o `operationalData.classification.valueClassification`.

Pasos:

1. Ejecutar diagnostico Lean.
2. Seleccionar una actividad clasificada.

Resultado esperado:

- Se muestra VA, NNVA o NVA.
- Se muestra justificacion y evidencia.
- No se asume clasificacion cuando el dato no existe.

## TC-LC-005 - Evaluacion de desperdicios

Condicion inicial: actividad con espera, retrabajo u observaciones del taller.

Pasos:

1. Ejecutar diagnostico Lean.
2. Revisar desperdicios de la actividad.

Resultado esperado:

- Solo se marcan desperdicios con senales de evidencia.
- Cada desperdicio muestra severidad, impacto, evidencia y confianza.

## TC-LC-006 - Preguntas por informacion insuficiente

Condicion inicial: actividad sin clasificacion de valor o sin evidencia.

Pasos:

1. Ejecutar diagnostico Lean.
2. Revisar panel de preguntas.

Resultado esperado:

- El sistema formula preguntas.
- Las preguntas bloqueantes se identifican con prioridad alta.
- El paquete queda en estado `NEEDS_MORE_INFORMATION`.

## TC-LC-007 - Quick Wins

Condicion inicial: actividad con espera, sobreproceso o retrabajo detectado.

Pasos:

1. Ejecutar diagnostico Lean.
2. Revisar seccion Quick Wins.

Resultado esperado:

- Se proponen solo quick wins de baja inversion y sin desarrollo.
- Cada quick win incluye justificacion y evidencia.

## TC-LC-008 - Integracion con Methodology Orchestrator

Pasos:

1. Ejecutar diagnostico Lean.
2. Abrir Methodology Orchestrator.
3. Seleccionar Lean Consultant.

Resultado esperado:

- Lean Consultant aparece como etapa implementada.
- La etapa muestra avance, Health Score, bloqueos e informacion faltante segun el paquete.

## TC-LC-009 - Persistencia local

Pasos:

1. Ejecutar diagnostico Lean.
2. Recargar el navegador.
3. Abrir `Lean Consultant`.

Resultado esperado:

- El Lean Assessment Package permanece disponible desde `localStorage`.
