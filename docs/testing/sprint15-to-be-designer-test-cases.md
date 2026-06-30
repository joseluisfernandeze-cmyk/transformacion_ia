# Sprint 15 - To-Be Designer - Casos de prueba

## TC-01 - Carga de pantalla

**Objetivo:** validar que la ruta `#/to-be-designer` carga dentro del Workspace.

**Pasos:**
1. Abrir `frontend/index.html`.
2. Navegar a `To-Be Designer`.

**Resultado esperado:**
- Se muestra el header del Sprint 15.
- Se muestra el boton `Generar proceso To-Be`.
- No aparecen errores de JavaScript.

## TC-02 - Process Model faltante

**Objetivo:** validar que el consultor no crea procesos desde cero.

**Precondicion:** no existe Process Model As-Is.

**Resultado esperado:**
- La pantalla informa que el Process Model As-Is es requerido.
- No se genera `To-Be Package`.

## TC-03 - Generacion de To-Be Package

**Objetivo:** validar la generacion del paquete futuro.

**Precondicion:** existe Process Model As-Is con actividades y evidencia.

**Pasos:**
1. Ejecutar `Generar proceso To-Be`.

**Resultado esperado:**
- Se genera `TO_BE_PACKAGE`.
- Existe `processModelToBe`.
- Existe comparativo As-Is vs To-Be.
- Existe `decisionTrace`.

## TC-04 - Mantener actividad

**Objetivo:** validar actividades sin evidencia de cambio.

**Datos sugeridos:**
- Actividad con evidencia suficiente.
- Sin Lean NVA.
- Sin oportunidades Automation & AI.
- Sin restriccion TOC.

**Resultado esperado:**
- La actividad queda como `UNCHANGED`.
- La accion propuesta es `Mantener`.

## TC-05 - Eliminar actividad

**Objetivo:** validar eliminacion solo con evidencia.

**Datos sugeridos:**
- Lean clasifica actividad como NVA.
- No existe restriccion TOC asociada.

**Resultado esperado:**
- La actividad aparece en `eliminatedActivities`.
- La justificacion incluye evidencia Lean.

## TC-06 - Automatizar e incorporar IA

**Objetivo:** validar uso del Automation & AI Opportunity Package.

**Datos sugeridos:**
- Actividad con `FULLY_AUTOMATABLE`.
- Oportunidades IA disponibles.

**Resultado esperado:**
- El To-Be Activity incluye `Automation Layer`.
- El To-Be Activity incluye `AI Assistant`.
- Se registra validacion humana de salidas IA en reglas.

## TC-07 - Comparativo As-Is vs To-Be

**Objetivo:** validar tiempos estimados.

**Precondicion:** existen tiempos As-Is.

**Resultado esperado:**
- Se muestran tiempos antes y despues.
- Se calcula beneficio estimado.
- Si faltan tiempos, el beneficio queda limitado.

## TC-08 - Preguntas por informacion insuficiente

**Objetivo:** validar reglas anti alucinacion.

**Precondicion:** actividad sin evidencia.

**Resultado esperado:**
- Se genera pregunta bloqueante.
- El paquete queda en `NEEDS_MORE_INFORMATION`.

## TC-09 - Integracion con Methodology Orchestrator

**Objetivo:** validar readiness metodologico.

**Pasos:**
1. Generar To-Be Package.
2. Abrir Methodology Orchestrator.

**Resultado esperado:**
- La etapa `To-Be Designer` aparece como implementada.
- La etapa queda lista para aprobacion si no existen preguntas bloqueantes.

## TC-10 - Restricciones funcionales

**Objetivo:** confirmar alcance.

**Resultado esperado:**
- No se genera Business Case.
- No se genera Roadmap.
- No se genera Executive Report.
- No se invoca AIService.
- No se modifica AIProviderClient ni Prompt Repository.
