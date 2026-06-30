# Sprint 14 - Automation & AI Transformation Consultant

## Objetivo

El Automation & AI Transformation Consultant identifica oportunidades de automatizacion e Inteligencia Artificial sobre el proceso actual sin construir To-Be, Business Case, Roadmap ni Executive Report.

## Requisitos previos

- Abrir `frontend/index.html` desde VS Code o desde el navegador.
- Tener un proyecto creado.
- Contar con Process Model disponible.
- Haber ejecutado, cuando aplique:
  - Process Data Collection Studio.
  - Intelligent VSM Studio.
  - Transformation Workshop.
  - Lean Transformation Consultant.
  - TOC Transformation Consultant.

## Como usar

1. Ingresar a la plataforma.
2. Seleccionar la ruta `Automation & AI Consultant` en el sidebar.
3. Presionar `Ejecutar diagnostico digital`.
4. Revisar el resumen ejecutivo.
5. Seleccionar una actividad en el panel izquierdo.
6. Validar:
   - potencial de automatizacion;
   - oportunidades IA;
   - datos requeridos;
   - integraciones necesarias;
   - beneficios esperados;
   - complejidad;
   - riesgos tecnicos;
   - evidencia utilizada;
   - preguntas pendientes.
7. Usar las preguntas pendientes para completar datos antes de consolidar decisiones futuras.

## Salida generada

El consultor genera un `Automation & AI Opportunity Package` con:

- resumen ejecutivo;
- oportunidades por actividad;
- oportunidades consolidadas;
- beneficios esperados;
- complejidad;
- riesgos;
- evidencia utilizada;
- nivel de confianza;
- preguntas pendientes;
- `decisionTrace` metodologico.

## Reglas de uso

- El consultor no ejecuta llamadas reales a IA.
- La API Key nunca se usa desde este modulo.
- No genera recomendaciones sin evidencia.
- Si falta informacion, genera preguntas.
- El paquete queda disponible para el futuro To-Be Designer.

## Persistencia

La persistencia del MVP se realiza en `localStorage` bajo la clave:

`operational-intelligence.automation-ai-consultant`

Cuando existe `ContextBuilderService`, el paquete se sincroniza con:

- Knowledge Package.
- Context Graph.
