# PROJECT BASELINE - Operational Intelligence Platform

Fecha de línea base: 2026-06-28  
Repositorio local: `C:\Users\josh_\Documents\GitHub\transformacion_ia`  
Repositorio remoto: `https://github.com/joseluisfernandeze-cmyk/transformacion_ia.git`  
Rama de trabajo esperada: `develop`  
Último commit base conocido: `25b19a4 Initial Architecture Freeze - Operational Intelligence Platform`

Este documento es la línea base oficial de la plataforma y debe actualizarse al finalizar cada Sprint.

## 1. Resumen del Proyecto

### Objetivo

Construir una plataforma profesional de inteligencia operacional reutilizable, orientada inicialmente a transformación de procesos y preparada para soportar múltiples soluciones sobre un mismo Core.

La solución inicial es **Process Transformation AI**, evolucionando hacia **Operational Intelligence Platform**.

### Estado Actual

La plataforma cuenta con:

- Core conceptual congelado.
- Backend base en Google Apps Script.
- Frontend modular en HTML, CSS y JavaScript puro.
- Modelo operativo local basado en `localStorage`.
- Primeras experiencias de consultoría implementadas.
- Primer consultor funcional de descubrimiento de procesos.
- Studio visual para edición As-Is.
- Studio de validación del proceso antes de análisis posteriores.
- Base de VSM Builder existente, aún no integrada como experiencia posterior al quality gate.
- Repositorio Git/GitHub profesionalizado.

### Arquitectura

Arquitectura modular basada en:

- Frontend modular por experiencias.
- Backend Apps Script por controladores, servicios, repositorios, validadores y utilidades.
- Google Sheets como base operativa.
- Google Drive como repositorio documental.
- Agent Orchestrator y Agent Registry.
- AIService con proveedores intercambiables.
- Prompt Repository.
- Knowledge Package.
- Business Knowledge Package.
- Context Graph.
- Process Model.
- Calculation Engine.

## 2. Estructura Completa de Carpetas

```text
transformacion_ia/
  .agents/
  .git/
  .gitignore
  PROJECT_BASELINE.md
  README.md
  backend/
    apps-script/
      Code.gs
      config/
        .gitkeep
        AISheetsConfig.gs
        SecurityConfig.gs
        VsmRoutesConfig.gs
      controllers/
        .gitkeep
        AIController.gs
        AuthController.gs
        VsmController.gs
      models/
        .gitkeep
      repositories/
        .gitkeep
        AgentExecutionRepository.gs
        AgentRepository.gs
        AIProviderRepository.gs
        ContextGraphRepository.gs
        DocumentIntelligenceRepository.gs
        KnowledgePackageRepository.gs
        PromptRepository.gs
        SheetRepository.gs
        UserRepository.gs
        VsmRepository.gs
      services/
        .gitkeep
        AgentOrchestratorService.gs
        AgentRegistryService.gs
        AIService.gs
        AuthService.gs
        ContextBuilderAgent.gs
        ContextGraphService.gs
        DocumentIntelligenceLayer.gs
        SessionService.gs
        VsmService.gs
      utils/
        .gitkeep
        AIProviderClient.gs
        ApiResponse.gs
        AppError.gs
        HashUtils.gs
        RequestParser.gs
      validators/
        .gitkeep
        AIValidator.gs
        AuthValidator.gs
        ContextBuilderValidator.gs
        VsmValidator.gs
  database/
    catalogs/
      .gitkeep
    samples/
      .gitkeep
    sheets-design/
      .gitkeep
      ai-security-data-model.md
      context-builder-agent-data-model.md
      vsm-data-model.md
      vsm-sheet-structure.md
  docs/
    architecture/
      .gitkeep
    deployment/
      .gitkeep
    product/
      roadmap.md
    technical/
      context-builder-agent-tdd.md
      pb01-technical-design.md
      pb08-technical-design.md
      pb11-technical-design.md
      project-charter-summary.md
    testing/
      .gitkeep
      context-builder-agent-test-plan.md
      pb08-test-plan.md
      pb11-test-plan.md
  drive/
    structure/
      google-drive-structure.md
  frontend/
    index.html
    assets/
      css/
        components.css
        layout.css
        main.css
        responsive.css
      js/
        app.js
    config/
      app-config.js
    modules/
      .gitkeep
      ai-security/
        ai-security-controller.js
        ai-security-renderer.js
        ai-security-service.js
      business-discovery/
        business-discovery-controller.js
        business-discovery-renderer.js
        business-discovery-service.js
      context-builder/
        context-builder-controller.js
        context-builder-renderer.js
        context-builder-service.js
      process-discovery/
        process-discovery-controller.js
        process-discovery-renderer.js
        process-discovery-service.js
      process-modeling-studio/
        process-modeling-studio-controller.js
        process-modeling-studio-renderer.js
        process-modeling-studio-service.js
      process-validation-studio/
        process-validation-studio-controller.js
        process-validation-studio-renderer.js
        process-validation-studio-service.js
      vsm-builder/
        vsm-builder-calculator.js
        vsm-builder-controller.js
        vsm-builder-page.js
        vsm-builder-renderer.js
        vsm-builder-service.js
        vsm-builder-state.js
        vsm-builder-validator.js
    shared/
      components/
        app-shell.js
      constants/
        app-constants.js
      services/
        api-client.js
        calculation-engine.js
      utils/
        dom-utils.js
  tests/
    backend/
      .gitkeep
    frontend/
      .gitkeep
    integration/
      .gitkeep
```

## 3. Componentes Implementados

### Frontend

- App Shell.
- API Client.
- DOM Utils.
- Calculation Engine.
- AI Security module.
- Business Discovery Experience.
- Context Builder Workspace.
- Discovery Workspace.
- Process Discovery Consultant.
- Process Modeling Studio / As-Is Studio.
- Process Validation Studio.
- VSM Builder base module.

### Backend Apps Script

- `doGet`.
- `doPost`.
- Request routing.
- Auth controller/service.
- AI controller.
- Agent Orchestrator.
- Agent Registry.
- Context Builder Agent.
- Document Intelligence Layer.
- Context Graph Service.
- VSM service/controller.
- Sheet repositories.
- AI Provider Client.
- Standard API responses.
- Standard error utilities.
- Validators.

### Data and Documentation

- Google Sheets design documents.
- Google Drive structure document.
- TDDs and test plans for implemented PBs.
- Product roadmap document.
- Project README.
- Git ignore policy.

## 4. Product Backlogs Implementados

| PB / Sprint | Estado | Comentario |
|---|---|---|
| PB01 - Product Foundation | Completo | Estructura base frontend/backend/documentación. |
| PB02 - Modelo Maestro de Datos | Parcial | Diseñado documentalmente; estructuras reales en Sheets pendientes de provisionamiento completo. |
| PB03 - Backend Base Apps Script | Parcial | Router, controladores y servicios base existen; despliegue real pendiente. |
| PB05 - Captura Guiada | Parcial / absorbido | Funcionalidad evolucionada hacia Business Discovery y Context Builder. |
| PB06 - Process Modeling Engine | Parcial | Modelo y studio visual local implementados; motor formal persistente pendiente. |
| PB08 - VSM Builder | Parcial | Módulo base existe; falta integración posterior al quality gate. |
| PB10 - Transformation Workspace | Parcial | Hay experiencias de workspace, falta workspace unificado con navegación completa. |
| PB11 - AI & Security Foundation | Parcial | Login/roles/base AI existen; configuración real Sheets/proveedores pendiente. |
| Sprint 1 - Context Builder Agent | Completo local / parcial backend | Agente y workspace local implementados; ejecución real IA depende de proveedor. |
| Sprint 2 - Discovery Workspace | Completo local | Revisión/enriquecimiento de Knowledge Package en frontend. |
| Sprint 3 - Business Discovery Experience | Completo local | Genera Business Knowledge Package y lo sincroniza con Context Builder. |
| Sprint 4 - Process Discovery Consultant | Completo local | Genera Draft Process Model As-Is con evidencia y preguntas. |
| Sprint 5 - Process Modeling Studio | Completo local | Studio visual editable con trazabilidad. |
| Sprint 6 - Process Validation Studio | Completo local | Quality gate, Health Score y bloqueo inteligente. |

## 5. Consultores Digitales Implementados

| Consultor Digital | Estado | Nivel de avance |
|---|---|---|
| Context Builder Agent | Implementado | Backend Apps Script + frontend local; IA real depende de proveedor configurado. |
| Process Discovery Consultant | Implementado local | Genera Draft Process Model desde paquetes de conocimiento. |
| Business Discovery Consultant Experience | Implementado local | Genera Business Knowledge Package validable. |
| Process Modeling Studio Consultant | Implementado local | Permite edición visual, evidencia y trazabilidad. |
| Process Validation Consultant | Implementado local | Evalúa calidad y bloquea análisis posteriores. |
| Lean Analyzer Agent | Pendiente | No implementado. |
| TOC Analyzer Agent | Pendiente | No implementado. |
| Automation Advisor Agent | Pendiente | No implementado. |
| AI Opportunity Agent | Pendiente | No implementado. |
| Innovation Agent | Pendiente | No implementado. |
| To-Be Designer Agent | Pendiente | No implementado. |
| Business Case Agent | Pendiente | No implementado. |
| ERP Discovery Agent | Pendiente | No implementado. |
| ERP RFP Builder Agent | Pendiente | No implementado. |
| Knowledge Capture Agent | Pendiente | No implementado. |
| Workload Analysis Agent | Pendiente | No implementado. |

## 6. Agentes Registrados

Registro implementado en `AgentRegistryService.gs`:

- `CONTEXT_BUILDER`

Agentes conceptuales definidos pero no registrados como ejecución backend:

- Process Discovery Consultant.
- Lean Analyzer Agent.
- TOC Analyzer Agent.
- Automation Advisor Agent.
- AI Opportunity Agent.
- Innovation Agent.
- To-Be Designer Agent.
- Business Case Agent.
- ERP Discovery Agent.
- ERP RFP Builder Agent.
- Knowledge Capture Agent.
- Workload Analysis Agent.

## 7. APIs Existentes

### Backend Apps Script

Entrada:

- `doGet(e)`
- `doPost(e)`

Acciones soportadas:

- `login`
- `logout`
- `validateSession`
- `executeAgent`
- `createVsmMap`
- `getVsmMap`
- `listVsmMaps`
- `updateVsmActivityData`
- `saveVsmMap`
- `calculateVsmMetrics`
- `getVsmMetrics`
- `archiveVsmMap`

### Frontend

Servicio:

- `ApiClient.post(action, payload)`

Estado actual:

- `APP_CONFIG.apiBaseUrl` está vacío en modo local.
- La app funciona localmente sin backend desplegado.

## 8. Google Sheets Utilizados

Hojas definidas o esperadas:

- `USERS`
- `AI_PROVIDERS`
- `PROMPTS`
- `AGENTS`
- `NORMALIZED_DOCUMENTS`
- `AGENT_EXECUTIONS`
- `KNOWLEDGE_PACKAGES`
- `CONTEXT_GRAPHS`
- VSM sheets definidas en documentación de `database/sheets-design/`

Estado:

- Diseño documental existente.
- Repositorios Apps Script preparados.
- Provisionamiento real de Google Sheets pendiente de validación en entorno Google.

## 9. Google Drive Utilizado

Documento de referencia:

- `drive/structure/google-drive-structure.md`

Uso esperado:

- Documentos originales.
- Documentos normalizados.
- Evidencias.
- Artefactos generados.
- Estructura documental por proyecto.

Estado:

- Estructura documentada.
- Integración real con Drive pendiente.

## 10. Configuración IA

Componentes existentes:

- `AIService.gs`
- `AIProviderClient.gs`
- `AIProviderRepository.gs`
- `PromptRepository.gs`
- `AgentRegistryService.gs`
- `AgentOrchestratorService.gs`

Proveedores contemplados:

- OpenAI.
- Claude.
- Gemini.
- DeepSeek.
- Custom.

Estado:

- Arquitectura de proveedores intercambiables implementada a nivel base.
- API keys no están en frontend.
- Configuración real de proveedores en Google Sheets pendiente.
- El modo local usa lógica determinística cuando no existe proveedor IA configurado.

## 11. Estado del Workspace

Estado actual:

- Frontend carga una experiencia activa por Sprint desde `app.js`.
- Sprint activo en UI: `Sprint 6 - Process Validation Studio`.
- Existen módulos previos disponibles en código, pero no hay navegación global completa entre experiencias.

Pendiente:

- Workspace unificado con navegación entre Business Discovery, Context Builder, Process Discovery, As-Is Studio, Validation Studio y futuros estudios.

## 12. Estado del Process Engine

Implementado localmente:

- Draft Process Model.
- Actividades con `activityUUID`.
- Relaciones secuenciales.
- Edición visual.
- Agregar/eliminar/dividir/unir actividades.
- Trazabilidad por evidencia.
- Sincronización local con Knowledge Package.
- Reconstrucción local del Context Graph.

Pendiente:

- Persistencia real en Google Sheets.
- Versionamiento formal de Process Model en backend.
- Conectores backend para Process Model.
- Navegación y estados aprobados/consolidados.

## 13. Estado del VSM

Implementado:

- Módulo base VSM Builder.
- Calculation Engine base.
- Contratos y repositorios VSM en Apps Script.
- Rutas VSM en backend.

No implementado todavía:

- VSM Studio como experiencia posterior al quality gate.
- Generación automática desde As-Is validado.
- Integración final con Process Validation Studio.
- Lean/TOC sobre VSM.

## 14. Estado del Knowledge Package

Implementado:

- Knowledge Package creado por Context Builder.
- Business Knowledge Package creado por Business Discovery.
- Sincronización local entre Business Knowledge Package y Context Builder.
- Actualización local de actividades desde Process Discovery y Modeling Studio.

Pendiente:

- Persistencia real completa en Google Sheets.
- Versionamiento formal visible en UI.
- Aprobación humana formal del Knowledge Package.

## 15. Estado del Context Graph

Implementado:

- `ContextGraphService.gs`.
- `ContextGraphRepository.gs`.
- Context Graph local generado desde Knowledge Package.
- Reconstrucción local tras cambios del Process Model.

Pendiente:

- Visualización dedicada del grafo.
- Persistencia real en Google Sheets.
- Relaciones más ricas entre procesos, actividades, documentos, sistemas, personas, reglas e indicadores.

## 16. Roadmap Actualizado

Secuencia recomendada desde la línea base:

1. Sprint 7 - Workspace Navigation & Experience Switcher.
2. Sprint 8 - Process Correction Workflow desde Validation Studio hacia As-Is Studio.
3. Sprint 9 - VSM Studio automático desde As-Is validado.
4. Sprint 10 - Lean/TOC/Automation/AI Opportunity como Transformation Analyzer inicial.
5. Sprint 11 - To-Be Designer.
6. Sprint 12 - Business Case.
7. Sprint 13 - Persistencia real Google Sheets para Process Model y Knowledge Packages.
8. Sprint 14 - Google Drive integration operativa.
9. Sprint 15 - AI provider execution real y prompts gobernados.
10. Sprint 16 - ERP Discovery Experience.
11. Sprint 17 - ERP RFP Builder.
12. Sprint 18 - Workload Analysis.

## 17. Próximo Sprint Recomendado

**Sprint 7 - Workspace Navigation & Experience Switcher**

Justificación:

- Existen múltiples experiencias implementadas, pero la app solo activa una desde `app.js`.
- Antes de desarrollar VSM Studio conviene permitir navegación profesional entre:
  - Business Discovery.
  - Context Builder.
  - Discovery Workspace.
  - Process Discovery.
  - As-Is Studio.
  - Process Validation.
- Esto reducirá fricción y permitirá un flujo de consultoría real end-to-end.

## 18. Riesgos Abiertos

- Persistencia principal aún depende de `localStorage`.
- Backend Apps Script no ha sido validado end-to-end contra Google Sheets real.
- Proveedores IA no están configurados en entorno real.
- No existe navegación global completa.
- El repositorio tiene documentación de PB anteriores y experiencias recientes aún no reflejadas en docs técnicas específicas.
- VSM Builder existe, pero no está condicionado aún por el quality gate.
- Validación de seguridad de API keys depende de correcta configuración en Google Sheets/Apps Script.
- La cuenta Git local anterior presentó diferencias de permisos; se debe mantener control de credenciales GitHub.

## 19. Deuda Técnica

- Crear navegación global de experiencias.
- Separar estilos CSS por módulo o establecer convención de escalabilidad.
- Crear persistencia real del Process Model.
- Crear repositorios Apps Script para Business Knowledge Package y Process Model.
- Estandarizar contratos JSON entre frontend local y backend.
- Agregar pruebas automatizadas reales.
- Agregar pipeline mínimo de validación.
- Unificar estados de aprobación humana.
- Añadir versionamiento formal de Knowledge Package, Context Graph y Process Model.
- Completar integración real con Google Drive.
- Completar ejecución real de agentes vía AIService.

## 20. Resumen Ejecutivo

Operational Intelligence Platform cuenta con una base funcional relevante para transformación operacional:

- Captura y validación del negocio.
- Construcción de conocimiento estructurado.
- Descubrimiento inicial de procesos.
- Edición visual del As-Is.
- Validación automática de calidad del proceso.
- Bloqueo inteligente de análisis posteriores.

La plataforma todavía opera mayormente en modo local, con backend y data model preparados para Google Apps Script y Google Sheets. La prioridad inmediata recomendada es consolidar la navegación del Workspace para convertir las experiencias ya implementadas en un flujo profesional continuo antes de avanzar hacia VSM Studio y análisis Lean/TOC.

Esta línea base queda congelada como referencia oficial para los siguientes Sprints.
