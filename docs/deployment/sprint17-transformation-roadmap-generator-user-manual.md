# Sprint 17 - Transformation Roadmap Generator

## Objetivo

El Transformation Roadmap Generator convierte el `Business Case Package` en un Roadmap de implementacion ejecutable. No genera fechas reales, cronograma Gantt ni Executive Report.

## Requisitos previos

- Abrir `frontend/index.html`.
- Tener un `Business Case Package` vigente.
- Contar, cuando aplique, con:
  - To-Be Package.
  - Lean Assessment Package.
  - TOC Assessment Package.
  - Automation & AI Opportunity Package.
  - Context Graph.

## Como usar

1. Ingresar a la plataforma.
2. Seleccionar `Roadmap` en el sidebar.
3. Presionar `Generar Roadmap`.
4. Revisar el Executive Summary.
5. Revisar las fases por horizonte:
   - Quick Wins.
   - Corto Plazo.
   - Mediano Plazo.
   - Largo Plazo.
6. Seleccionar una fase.
7. Revisar iniciativas, entregables, dependencias, riesgos y criterios de exito.
8. Revisar recursos requeridos, preguntas pendientes y riesgos consolidados.

## Salida generada

El Sprint genera un `ROADMAP_PACKAGE` con:

- Executive Summary.
- Fases.
- Iniciativas priorizadas.
- Dependencias.
- Recursos.
- Riesgos.
- Supuestos.
- Evidencia utilizada.
- Nivel de confianza.
- Preguntas pendientes.
- `decisionTrace` metodologico.

## Reglas de uso

- No se generan fechas calendario.
- No se genera Gantt.
- No se genera Executive Report.
- No se invoca AIService.
- No se modifica AIProviderClient ni Prompt Repository.
- Si falta informacion, se formulan preguntas.

## Persistencia

La persistencia temporal del MVP se guarda en `localStorage` bajo:

`operational-intelligence.roadmap`

Cuando existe `ContextBuilderService`, el paquete se sincroniza con:

- Knowledge Package.
- Context Graph.
