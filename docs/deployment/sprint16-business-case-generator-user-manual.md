# Sprint 16 - Business Case Generator

## Objetivo

El Business Case Generator cuantifica los beneficios de la transformacion propuesta y genera un `Business Case Package` ejecutivo. Este paquete sera entrada oficial del futuro Roadmap Generator.

## Requisitos previos

- Abrir `frontend/index.html`.
- Tener un `To-Be Package` vigente.
- Contar, cuando aplique, con:
  - Process Model As-Is.
  - Process Model To-Be.
  - Operational Data.
  - Intelligent VSM.
  - Lean Assessment Package.
  - TOC Assessment Package.
  - Automation & AI Opportunity Package.

## Como usar

1. Ingresar a la plataforma.
2. Seleccionar `Business Case` en el sidebar.
3. Presionar `Generar Business Case`.
4. Revisar el Executive Summary.
5. Seleccionar cada iniciativa.
6. Revisar:
   - beneficios operacionales;
   - beneficios economicos;
   - beneficios estrategicos;
   - costos estimados;
   - ROI;
   - Payback;
   - priorizacion;
   - riesgos;
   - supuestos;
   - evidencia;
   - preguntas pendientes.

## Salida generada

El Sprint genera un `BUSINESS_CASE_PACKAGE` con:

- Executive Summary.
- Beneficios operacionales.
- Beneficios economicos.
- Beneficios estrategicos.
- Costos estimados.
- ROI y Payback cuando aplica.
- Priorizacion.
- Riesgos.
- Supuestos.
- Evidencia utilizada.
- Nivel de confianza.
- Preguntas pendientes.
- `decisionTrace` metodologico.

## Reglas de uso

- No se genera Roadmap.
- No se genera Executive Report.
- No se invoca AIService.
- No se modifica AIProviderClient ni Prompt Repository.
- Cuando faltan datos, el sistema muestra `Pendiente de estimacion`.
- El ROI y Payback solo se calculan cuando existen beneficio anual y costo estimado.

## Persistencia

La persistencia temporal del MVP se guarda en `localStorage` bajo:

`operational-intelligence.business-case`

Cuando existe `ContextBuilderService`, el paquete se sincroniza con:

- Knowledge Package.
- Context Graph.
