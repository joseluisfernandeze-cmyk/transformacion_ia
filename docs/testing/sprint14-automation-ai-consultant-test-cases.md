# Sprint 14 - Automation & AI Transformation Consultant - Casos de prueba

## TC-01 - Carga de pantalla

**Objetivo:** validar que la ruta `#/automation-ai` carga dentro del Workspace.

**Pasos:**
1. Abrir `frontend/index.html`.
2. Navegar a `Automation & AI Consultant`.

**Resultado esperado:**
- Se muestra el header del Sprint 14.
- Se muestra el boton `Ejecutar diagnostico digital`.
- No aparecen errores de JavaScript.

## TC-02 - Process Model faltante

**Objetivo:** validar que el consultor no inventa procesos.

**Precondicion:** no existe Process Model en almacenamiento local.

**Resultado esperado:**
- La pantalla indica que el Process Model es requerido.
- No se genera `Automation & AI Opportunity Package`.

## TC-03 - Generacion de paquete

**Objetivo:** validar la creacion del paquete de oportunidades.

**Precondicion:** existe Process Model con actividades, evidencia, sistemas y datos operativos.

**Pasos:**
1. Ejecutar el diagnostico digital.

**Resultado esperado:**
- Se genera `AUTOMATION_AI_OPPORTUNITY_PACKAGE`.
- El paquete contiene `activityOpportunities`.
- El paquete contiene `consolidatedOpportunities`.
- El paquete contiene `decisionTrace`.

## TC-04 - Clasificacion de automatizacion

**Objetivo:** validar la clasificacion por actividad.

**Datos sugeridos:**
- Actividad manual.
- Frecuencia alta.
- Sistema ERP.
- Regla de validacion.

**Resultado esperado:**
- La actividad se clasifica como parcial o totalmente automatizable.
- La clasificacion incluye justificacion, evidencia y confianza.

## TC-05 - Oportunidades IA

**Objetivo:** validar identificacion de capacidades IA.

**Datos sugeridos:**
- Actividad con documentos PDF, correos o formularios.
- Actividad con clasificacion o priorizacion.

**Resultado esperado:**
- Se identifican oportunidades como OCR, extraccion documental o clasificacion automatica.
- Cada oportunidad incluye evidencia y confianza.

## TC-06 - Beneficios esperados

**Objetivo:** validar estimacion condicional de beneficios.

**Precondicion:** la actividad tiene tiempo y frecuencia.

**Resultado esperado:**
- Se estima reduccion de tiempo o productividad.
- Si faltan datos, el beneficio se marca como no estimable.

## TC-07 - Preguntas por informacion insuficiente

**Objetivo:** validar regla anti alucinacion.

**Precondicion:** actividad sin evidencia o sin tiempos/frecuencia.

**Resultado esperado:**
- Se generan preguntas especificas.
- Las preguntas criticas bloquean consolidacion cuando falta evidencia base.

## TC-08 - Integracion con Methodology Orchestrator

**Objetivo:** validar que el Sprint 14 participa en el flujo metodologico.

**Pasos:**
1. Generar el paquete Automation & AI.
2. Abrir Methodology Orchestrator.

**Resultado esperado:**
- La etapa `Automation & AI Consultant` aparece como implementada.
- La etapa queda lista para aprobacion si no existen preguntas bloqueantes.

## TC-09 - Persistencia

**Objetivo:** validar almacenamiento local.

**Pasos:**
1. Ejecutar diagnostico digital.
2. Refrescar navegador.
3. Volver a `Automation & AI Consultant`.

**Resultado esperado:**
- El paquete generado permanece disponible.
- La actividad seleccionada y chat se conservan.

## TC-10 - Restricciones funcionales

**Objetivo:** confirmar alcance del Sprint.

**Resultado esperado:**
- No se construye To-Be.
- No se genera Business Case.
- No se genera Roadmap.
- No se invoca AIService.
- No se modifica AIProviderClient ni Prompt Repository.
