# 00 START HERE

## Que es Process Transformation AI

Process Transformation AI es una plataforma profesional para transformacion operacional. No esta disenada como un chatbot, sino como un entorno de trabajo donde consultores digitales, studios visuales, modelos de proceso, evidencias, documentos y datos operativos permiten comprender, validar y transformar procesos de negocio.

El producto evoluciono hacia una plataforma modular llamada temporalmente Operational Intelligence Platform. Process Transformation AI es la primera solucion construida sobre ese nucleo reutilizable.

## Objetivo del producto

El objetivo es permitir que un consultor pueda:

- comprender el negocio y sus procesos;
- construir conocimiento estructurado del proyecto;
- generar y validar el proceso As-Is;
- enriquecer actividades con datos operativos;
- construir un VSM vivo;
- capturar observaciones de taller;
- preparar analisis Lean, TOC, automatizacion, IA, To-Be, Business Case, Roadmap y reporte ejecutivo.

## Estado actual

El proyecto cuenta con una base funcional navegable desde `frontend/index.html`. La interfaz principal ya tiene Application Shell, Dashboard, Sidebar, Workspace, Breadcrumb, Footer y rutas para las etapas implementadas y futuras.

El Core se considera congelado. No deben crearse nuevos componentes Core ni redisenar arquitectura salvo solicitud explicita.

El ultimo Sprint implementado es:

`Sprint UI-01 - Application Shell & Navigation`

## Arquitectura general resumida

La plataforma esta compuesta por:

- Frontend: HTML, CSS y JavaScript sin frameworks, sin npm y sin librerias externas.
- Backend: Google Apps Script con punto de entrada unico mediante `doGet` y `doPost`.
- Base de datos operativa: Google Sheets.
- Repositorio documental: Google Drive.
- Repositorio de codigo: GitHub.
- Ejecucion local: apertura directa de `frontend/index.html` desde VS Code o navegador.

La arquitectura se organiza en:

- Core reutilizable.
- Solutions.
- Studios.
- Consultores Digitales.
- Repositorios.
- Servicios.
- Contratos JSON estandarizados.

## Metodologia general

La metodologia oficial sigue estas etapas:

1. Business Discovery.
2. Context Builder.
3. Process Discovery.
4. Process Modeling.
5. Process Validation.
6. Process Data Collection.
7. Intelligent VSM.
8. Transformation Workshop.
9. Lean Consultant.
10. TOC Consultant.
11. Automation & AI Consultant.
12. To-Be Designer.
13. Business Case.
14. Roadmap.
15. Executive Report.

Cada etapa debe ser aprobada antes de avanzar cuando sea obligatoria. Los agentes y consultores deben trabajar con evidencia, confianza, trazabilidad, preguntas aclaratorias e intervencion humana antes de consolidar resultados.

## Soluciones existentes

Soluciones definidas:

- Process Transformation: transformacion operacional completa.
- ERP Discovery: identificacion y estructuracion de requerimientos ERP.
- ERP RFP Builder: generacion futura de RFP funcional.
- Operational Audit: solucion futura.
- Workload Analysis: solucion futura.
- Knowledge Capture: solucion futura.

La solucion mas avanzada actualmente es Process Transformation. ERP Discovery cuenta con Requirements Discovery Consultant implementado a nivel frontend modular.

## Studios existentes

Studios y experiencias existentes en el frontend:

- Business Discovery Experience.
- Discovery Workspace / Context Builder.
- Process Discovery Workspace.
- Process Modeling Studio.
- Process Validation Studio.
- Process Data Collection Studio.
- Intelligent VSM Studio.
- Transformation Workshop.
- Methodology Orchestrator.
- Application Shell & Navigation.

## Consultores Digitales existentes

Consultores y agentes existentes o parcialmente implementados:

- Context Builder Agent.
- Process Discovery Consultant.
- Requirements Discovery Consultant.

Consultores futuros:

- Lean Transformation Consultant.
- TOC Transformation Consultant.
- Automation & AI Consultant.
- To-Be Designer.
- Business Case Consultant.
- Roadmap Consultant.
- Executive Report Consultant.

## Roadmap resumido

Etapas completadas o con base funcional:

- Base frontend.
- Base backend Apps Script.
- Modelo maestro Google Sheets.
- AI & Security Foundation.
- Context Builder Agent.
- Business Discovery Experience.
- Process Discovery Consultant.
- Process Modeling Studio.
- Process Validation Studio.
- Process Data Collection Studio.
- Intelligent VSM Studio.
- Transformation Workshop.
- Methodology Orchestrator.
- Application Shell & Navigation.

Proximas etapas recomendadas:

- Lean Transformation Consultant.
- TOC Transformation Consultant.
- Automation & AI Consultant.
- To-Be Designer.
- Business Case.
- Roadmap.
- Executive Report.

## Ultimo Sprint implementado

`Sprint UI-01 - Application Shell & Navigation`

Resultado principal:

- aplicacion navegable desde `frontend/index.html`;
- dashboard visible;
- rutas principales configuradas;
- modulos existentes accesibles desde el Workspace;
- etapas futuras visibles como proximamente.

## Proximo Sprint recomendado

`Sprint 12 - Lean Transformation Consultant`

Justificacion:

La plataforma ya cuenta con proceso validado, datos operativos, VSM inteligente y observaciones de taller. El siguiente paso natural es convertir esa informacion en diagnostico Lean trazable, sin romper la arquitectura congelada.

## Donde encontrar informacion detallada

- Contexto completo: `docs/00_PROJECT_CONTEXT/MASTER_PROJECT_CONTEXT.md`.
- Estado vivo: `docs/00_PROJECT_CONTEXT/CURRENT_STATE.md`.
- Linea base previa: `PROJECT_BASELINE.md`.
- Roadmap tecnico/producto: `docs/product/roadmap.md`.
- Documentacion tecnica historica: `docs/technical`.
- Planes de prueba: `docs/testing`.
- Modelo de Google Sheets: `database/sheets-design`.
- Estructura Google Drive: `drive/structure`.
