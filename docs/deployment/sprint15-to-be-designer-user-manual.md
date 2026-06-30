# Sprint 15 - To-Be Designer

## Objetivo

El To-Be Designer construye el proceso futuro utilizando la evidencia generada por los consultores anteriores. Su salida oficial es el `To-Be Package`, que sera entrada del futuro Business Case Generator.

## Requisitos previos

- Abrir `frontend/index.html`.
- Tener un Process Model As-Is disponible.
- Contar, cuando aplique, con:
  - Operational Data.
  - Intelligent VSM.
  - Transformation Observation Package.
  - Lean Assessment Package.
  - TOC Assessment Package.
  - Automation & AI Opportunity Package.

## Como usar

1. Ingresar a la plataforma.
2. Seleccionar `To-Be Designer` en el sidebar.
3. Presionar `Generar proceso To-Be`.
4. Revisar el Executive Summary.
5. Seleccionar cada actividad en el panel izquierdo.
6. Validar las decisiones propuestas:
   - mantener;
   - eliminar;
   - simplificar;
   - automatizar;
   - incorporar IA;
   - reordenar;
   - paralelizar;
   - centralizar o descentralizar.
7. Revisar el comparativo As-Is vs To-Be.
8. Revisar riesgos y preguntas pendientes.

## Salida generada

El Sprint genera un `TO_BE_PACKAGE` con:

- Executive Summary.
- Process Model To-Be.
- Comparativo As-Is vs To-Be.
- Justificacion de cambios.
- Evidencia utilizada.
- Nivel de confianza.
- Riesgos.
- Preguntas pendientes.
- `decisionTrace` metodologico.

## Reglas de uso

- No se genera Business Case.
- No se genera Roadmap.
- No se genera Executive Report.
- No se invoca AIService.
- No se modifica AIProviderClient ni Prompt Repository.
- Si falta evidencia, el consultor formula preguntas en lugar de asumir.

## Persistencia

La persistencia temporal del MVP se guarda en `localStorage` bajo:

`operational-intelligence.to-be-designer`

Cuando existe `ContextBuilderService`, el paquete se sincroniza con:

- Knowledge Package.
- Context Graph.
