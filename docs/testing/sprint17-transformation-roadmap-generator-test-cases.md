# Sprint 17 - Transformation Roadmap Generator - Casos de prueba

## TC-01 - Carga de pantalla

**Objetivo:** validar que la ruta `#/roadmap` carga dentro del Workspace.

**Pasos:**
1. Abrir `frontend/index.html`.
2. Navegar a `Roadmap`.

**Resultado esperado:**
- Se muestra el header del Sprint 17.
- Se muestra el boton `Generar Roadmap`.
- No aparecen errores de JavaScript.

## TC-02 - Business Case faltante

**Objetivo:** validar que el Roadmap no se genera sin Business Case.

**Precondicion:** no existe `Business Case Package`.

**Resultado esperado:**
- Se informa que el Business Case Package es requerido.
- No se genera `Roadmap Package`.

## TC-03 - Generacion de Roadmap Package

**Objetivo:** validar la creacion del paquete.

**Precondicion:** existe `Business Case Package` con iniciativas.

**Pasos:**
1. Ejecutar `Generar Roadmap`.

**Resultado esperado:**
- Se genera `ROADMAP_PACKAGE`.
- Existen fases.
- Existen iniciativas priorizadas.
- Existe `decisionTrace`.

## TC-04 - Agrupacion por horizonte

**Objetivo:** validar clasificacion temporal.

**Datos sugeridos:**
- Iniciativas con prioridad Quick Win, Corto Plazo, Mediano Plazo y Largo Plazo.

**Resultado esperado:**
- Las iniciativas quedan agrupadas en los horizontes correctos.

## TC-05 - Fases

**Objetivo:** validar construccion de fases.

**Resultado esperado:**
- Cada fase incluye objetivo, iniciativas, entregables, dependencias, riesgos y criterios de exito.

## TC-06 - Secuencia logica

**Objetivo:** validar orden recomendado sin fechas.

**Resultado esperado:**
- Las fases tienen secuencia.
- No se generan fechas calendario.
- No se genera Gantt.

## TC-07 - Recursos

**Objetivo:** validar recursos consolidados.

**Resultado esperado:**
- El paquete incluye areas involucradas, roles sugeridos y equipos requeridos.

## TC-08 - Riesgos y dependencias

**Objetivo:** validar consolidacion de riesgos.

**Resultado esperado:**
- Las dependencias tecnicas, organizacionales y de aprobacion aparecen asociadas a iniciativas y fases.

## TC-09 - Methodology Orchestrator

**Objetivo:** validar integracion metodologica.

**Pasos:**
1. Generar Roadmap Package.
2. Abrir Methodology Orchestrator.

**Resultado esperado:**
- La etapa `Roadmap` aparece implementada.
- Queda lista para aprobacion si no existen preguntas bloqueantes.

## TC-10 - Restricciones funcionales

**Objetivo:** confirmar alcance.

**Resultado esperado:**
- No se genera Executive Report.
- No se generan fechas reales.
- No se genera cronograma Gantt.
- No se invoca AIService.
- No se modifica AIProviderClient ni Prompt Repository.
