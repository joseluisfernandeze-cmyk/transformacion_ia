# MASTER PROJECT CONTEXT

## 1. Identidad del proyecto

Nombre original del producto: **Process Transformation AI**.

Nombre arquitectonico evolucionado: **Operational Intelligence Platform**.

Solucion inicial dentro de la plataforma: **Process Transformation**.

Objetivo principal: construir una plataforma profesional para transformacion operacional, inteligencia de procesos y consultoria digital asistida por agentes.

La plataforma no es un chatbot. Es una plataforma modular de inteligencia operacional que permite comprender procesos, levantar informacion, modelar As-Is, construir VSM, capturar datos operacionales, estructurar observaciones de taller, coordinar la metodologia y preparar diagnosticos posteriores.

## 2. Estado actual real

Fecha de este contexto maestro: 2026-06-28.

Repositorio local:

```text
C:\Users\josh_\Documents\GitHub\transformacion_ia
```

Repositorio remoto oficial:

```text
https://github.com/joseluisfernandeze-cmyk/transformacion_ia.git
```

Rama de trabajo esperada: `develop`.

Tecnologia actual:

- Frontend: HTML, CSS, JavaScript puro.
- Backend: Google Apps Script.
- Base de datos operativa esperada: Google Sheets.
- Repositorio documental esperado: Google Drive.
- Repositorio de codigo: GitHub.
- IDE: Visual Studio Code.
- Sin npm.
- Sin frameworks frontend.
- Sin librerias externas.

## 3. Reglas permanentes aprobadas

- No redisenar la arquitectura Core salvo solicitud explicita.
- No crear nuevos componentes Core sin autorizacion.
- Cada Sprint debe usar la infraestructura existente.
- Todo modulo debe pensar no solo en el siguiente PB, sino en los siguientes 10 PB.
- No duplicar informacion.
- No duplicar recorridos del proceso.
- No implementar funcionalidades fuera del Sprint solicitado.
- No implementar IA, Lean, TOC, To-Be o Business Case antes de su Sprint especifico.
- Cada entrega debe ser funcional desde `frontend/index.html`.
- Cada cambio debe indicar archivos creados, modificados, pruebas y pendientes.
- No exponer API keys en frontend.
- La API key nunca debe llegar al navegador.
- El frontend solicita ejecucion de agentes; el backend decide proveedor, modelo y prompt.
- Toda afirmacion generada por consultores digitales debe estar respaldada por evidencia.
- Cuando falte informacion, el consultor debe preguntar en vez de inventar.

## 4. Arquitectura congelada

La arquitectura se basa en una plataforma reusable con:

- Core.
- Solutions.
- Agents.
- Consulting Framework.
- AI Governance Framework.
- Workspace modular.
- Methodology Orchestrator.

El Core conceptual incluye:

- Gestion de proyectos.
- Gestion documental.
- Document Intelligence Layer.
- Process Engine.
- Process Modeling Engine.
- VSM Engine.
- Calculation Engine.
- Workspace.
- Authentication.
- AI Service.
- AI Provider abstraction.
- Prompt Repository.
- Agent Registry.
- Agent Orchestrator.
- Knowledge Package.
- Context Graph.

La solucion inicial es Process Transformation.

Soluciones futuras previstas:

- ERP Discovery.
- ERP RFP Builder.
- Operational Audit.
- Workload Analysis.
- Knowledge Capture.

## 5. Modulos implementados en frontend

Todos los modulos siguen patron:

```text
module-name/
  module-name-service.js
  module-name-renderer.js
  module-name-controller.js
```

Modulos existentes:

- `ai-security`
- `business-discovery`
- `context-builder`
- `process-discovery`
- `process-modeling-studio`
- `process-validation-studio`
- `process-data-collection-studio`
- `intelligent-vsm-studio`
- `transformation-workshop`
- `methodology-orchestrator`
- `requirements-discovery`
- `vsm-builder`

Servicios compartidos:

- `api-client.js`
- `calculation-engine.js`
- `transformation-intelligence-engine.js`
- `dom-utils.js`
- `app-shell.js`
- `app-constants.js`

## 6. Application Shell actual

Sprint UI-01 implemento la primera version navegable.

`frontend/index.html` carga la aplicacion.

`frontend/assets/js/app.js` contiene el hash router.

Rutas visibles:

- `#/dashboard`
- `#/projects`
- `#/business-discovery`
- `#/context-builder`
- `#/process-discovery`
- `#/process-modeling`
- `#/process-validation`
- `#/process-data-collection`
- `#/intelligent-vsm`
- `#/transformation-workshop`
- `#/methodology-orchestrator`

Etapas futuras visibles como `Proximamente`:

- Lean Consultant.
- TOC Consultant.
- Automation & AI Consultant.
- To-Be Designer.
- Business Case.
- Roadmap.
- Executive Report.

## 7. Backend existente

Backend en:

```text
backend/apps-script/
```

Elementos principales:

- `Code.gs`
- `controllers/`
- `services/`
- `repositories/`
- `validators/`
- `utils/`
- `config/`

Entrada Apps Script:

- `doGet(e)`
- `doPost(e)`

Acciones soportadas:

- `login`
- `logout`
- `validateSession`
- `executeAgent`
- acciones VSM definidas en `VsmRoutesConfig.gs`

Estado:

- Backend base preparado.
- Integracion end-to-end real con Google Sheets pendiente.
- Frontend sigue funcionando localmente con `localStorage`.

## 8. Objetos principales actuales

- `Business Knowledge Package`
- `Knowledge Package`
- `Context Graph`
- `Draft Process Model`
- `Process Model`
- `Operational Data`
- `VSM Data`
- `Requirements Package`
- `Transformation Opportunity Package`
- `Transformation Observation Package`
- `Project Transformation Status`

## 9. Estado funcional end-to-end

La plataforma puede ejecutarse desde `frontend/index.html`.

Flujo visible:

1. Business Discovery.
2. Context Builder.
3. Process Discovery.
4. Process Modeling.
5. Process Validation.
6. Process Data Collection.
7. Intelligent VSM.
8. Transformation Workshop.
9. Methodology Orchestrator.

El flujo todavia usa almacenamiento local.

## 10. Proximo Sprint recomendado

Sprint recomendado despues de UI-01:

```text
Sprint 12 - Lean Transformation Consultant
```

Justificacion:

- Ya existe Process Model.
- Ya existe captura operacional.
- Ya existe VSM vivo.
- Ya existe Transformation Observation Package.
- Ya existe Methodology Orchestrator.
- El diagnostico Lean formal puede consumir estos activos sin inventar informacion.
