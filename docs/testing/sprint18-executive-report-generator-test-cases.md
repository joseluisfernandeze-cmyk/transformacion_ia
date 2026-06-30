# Sprint 18 - Executive Report Generator - Casos de prueba

## TC-01 - Carga de pantalla

**Objetivo:** validar que `#/executive-report` carga en el Workspace.

**Resultado esperado:**
- Se muestra el header del Sprint 18.
- Se muestra el boton `Generar informe ejecutivo`.
- No aparecen errores JavaScript.

## TC-02 - Roadmap faltante

**Objetivo:** validar que el informe no se genera sin Roadmap.

**Resultado esperado:**
- Se informa que el Roadmap Package es requerido.
- No se genera `Executive Report Package`.

## TC-03 - Generacion del paquete

**Precondicion:** existe `Roadmap Package`.

**Resultado esperado:**
- Se genera `EXECUTIVE_REPORT_PACKAGE`.
- Existen secciones.
- Existe `decisionTrace`.

## TC-04 - Secciones del informe

**Resultado esperado:**
- El paquete incluye Resumen Ejecutivo, Situacion Actual, Diagnostico, To-Be, Business Case, Roadmap, Riesgos, Recomendaciones y Preguntas Pendientes.

## TC-05 - Business Case consolidado

**Resultado esperado:**
- La seccion Business Case muestra beneficios, costos, ROI y Payback cuando existen.

## TC-06 - Roadmap consolidado

**Resultado esperado:**
- La seccion Roadmap muestra Quick Wins, Corto Plazo, Mediano Plazo y Largo Plazo.

## TC-07 - Preguntas pendientes

**Resultado esperado:**
- Las preguntas de paquetes anteriores se consolidan.

## TC-08 - Exportacion preparada

**Resultado esperado:**
- El `exportModel` declara PDF, Word y PowerPoint como formatos futuros.
- No se crea ningun archivo fisico.

## TC-09 - Methodology Orchestrator

**Resultado esperado:**
- La etapa `Executive Report` aparece implementada.
- Queda lista para aprobacion si no existen preguntas bloqueantes.

## TC-10 - Restricciones funcionales

**Resultado esperado:**
- No se exporta PDF.
- No se exporta Word.
- No se exporta PowerPoint.
- No se modifica AIService, AIProviderClient ni Prompt Repository.
