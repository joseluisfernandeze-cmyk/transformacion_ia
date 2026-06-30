# Sprint 16 - Business Case Generator - Casos de prueba

## TC-01 - Carga de pantalla

**Objetivo:** validar que la ruta `#/business-case` carga en el Workspace.

**Pasos:**
1. Abrir `frontend/index.html`.
2. Navegar a `Business Case`.

**Resultado esperado:**
- Se muestra el header del Sprint 16.
- Se muestra el boton `Generar Business Case`.
- No aparecen errores de JavaScript.

## TC-02 - To-Be Package faltante

**Objetivo:** validar que el consultor no genera Business Case sin proceso futuro.

**Precondicion:** no existe `To-Be Package`.

**Resultado esperado:**
- Se informa que el To-Be Package es requerido.
- No se genera `Business Case Package`.

## TC-03 - Generacion de paquete

**Objetivo:** validar la creacion del `BUSINESS_CASE_PACKAGE`.

**Precondicion:** existe `To-Be Package` con iniciativas.

**Pasos:**
1. Ejecutar `Generar Business Case`.

**Resultado esperado:**
- Se genera `BUSINESS_CASE_PACKAGE`.
- Existen iniciativas.
- Existen beneficios, costos, priorizacion y riesgos.
- Existe `decisionTrace`.

## TC-04 - Beneficios operacionales

**Objetivo:** validar reducciones operacionales.

**Datos sugeridos:**
- Comparativo As-Is vs To-Be con tiempo antes y despues.

**Resultado esperado:**
- Se calcula reduccion de tiempo.
- Se muestra reduccion de actividades si aplica.

## TC-05 - Beneficios economicos

**Objetivo:** validar estimacion economica.

**Datos sugeridos:**
- Iniciativa con reduccion de tiempo y frecuencia estimada.

**Resultado esperado:**
- Se calculan horas recuperadas.
- Se calcula FTE potencial.
- Se calcula ahorro anual estimado.

## TC-06 - Costos pendientes

**Objetivo:** validar reglas anti alucinacion.

**Datos sugeridos:**
- Iniciativa sin alcance tecnico suficiente.

**Resultado esperado:**
- Los costos quedan como `Pendiente de estimacion`.
- ROI y Payback quedan como `No aplica`.

## TC-07 - ROI y Payback

**Objetivo:** validar indicadores financieros.

**Datos sugeridos:**
- Iniciativa con beneficio anual y costo estimado.

**Resultado esperado:**
- Se calcula ROI.
- Se calcula Payback.
- Se calcula relacion beneficio/esfuerzo.

## TC-08 - Priorizacion

**Objetivo:** validar clasificacion temporal.

**Resultado esperado:**
- Las iniciativas aparecen agrupadas como Quick Win, Corto Plazo, Mediano Plazo o Largo Plazo.

## TC-09 - Methodology Orchestrator

**Objetivo:** validar integracion metodologica.

**Pasos:**
1. Generar Business Case Package.
2. Abrir Methodology Orchestrator.

**Resultado esperado:**
- La etapa `Business Case` aparece implementada.
- Queda lista para aprobacion si no existen preguntas bloqueantes.

## TC-10 - Restricciones funcionales

**Objetivo:** confirmar alcance.

**Resultado esperado:**
- No se genera Roadmap.
- No se genera Executive Report.
- No se invoca AIService.
- No se modifica AIProviderClient ni Prompt Repository.
