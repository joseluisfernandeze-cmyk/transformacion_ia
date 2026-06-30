# PROJECT BASELINE - Operational Intelligence Platform

Fecha de linea base: 2026-06-30  
Repositorio local: `C:\Users\josh_\Documents\GitHub\transformacion_ia`  
Repositorio remoto: `https://github.com/joseluisfernandeze-cmyk/transformacion_ia.git`  
Rama de trabajo: `develop`

Este documento es la linea base oficial de la plataforma y debe actualizarse al finalizar cada Sprint o hito relevante de integracion.

## 1. Resumen del proyecto

Process Transformation AI es la primera solucion de Operational Intelligence Platform, una plataforma modular de inteligencia operacional para transformar procesos usando metodologia consultiva, evidencia trazable, modelos de proceso, VSM, consultores digitales y paquetes reutilizables de conocimiento.

Estado actual:

- Arquitectura del Core congelada.
- Desarrollo funcional temporalmente congelado.
- Primera fase de integracion e infraestructura completada.
- Primer despliegue operativo completado.
- MVP en fase `Integration & Validation`.
- Frontend ejecutandose mediante Live Server.
- Backend publicado como Google Apps Script Web App.
- Google Sheets inicializado con 29 hojas creadas automaticamente.
- Google Drive inicializado con estructura documental bajo carpeta padre configurable.
- URL oficial DEV registrada en `APP_CONFIG.API.BASE_URL`.

## 2. Arquitectura

Arquitectura vigente:

- Frontend HTML, CSS y JavaScript puro.
- Backend Google Apps Script.
- Persistencia operativa Google Sheets.
- Repositorio documental Google Drive.
- Repositorio codigo GitHub.
- Despliegue Apps Script mediante Clasp.
- Core compartido por soluciones.
- Studios y Consultores Digitales sobre Core congelado.
- AIService y AIProviderClient con proveedores intercambiables.
- Prompt Repository y Agent Registry.
- Methodology Orchestrator como coordinador de la metodologia.

No se debe modificar la arquitectura hasta cerrar la validacion completa del MVP.

## 3. Estructura principal del proyecto

```text
transformacion_ia/
  README.md
  PROJECT_BASELINE.md
  DEPLOYMENT_CHECKLIST.md
  DEPLOYMENT_STATUS.md
  DECISIONS_LOG.md
  FIRST_EXECUTION_GUIDE.md
  INTEGRATION_REPORT.md
  backend/
    apps-script/
      Code.gs
      config/
      controllers/
      models/
      repositories/
      services/
      utils/
      validators/
  database/
    catalogs/
    samples/
    sheets-design/
  docs/
    00_MASTER_PROJECT/
    00_PROJECT_CONTEXT/
    architecture/
    deployment/
    product/
    technical/
    testing/
  drive/
    structure/
  frontend/
    index.html
    assets/
    config/
    modules/
    shared/
  tests/
    backend/
    frontend/
    integration/
```

## 4. Componentes implementados

### Frontend

- Application Shell.
- Dashboard.
- Gestion de proyectos local.
- Workspace.
- Sidebar y navegacion por rutas hash.
- API Client.
- DOM Utils.
- MVP Navigation Store.
- Consulting Decision Framework.
- Calculation Engine.
- Transformation Intelligence Engine.
- AI Security module.
- Business Discovery.
- Context Builder.
- Process Discovery.
- Process Modeling Studio.
- Process Validation Studio.
- Process Data Collection Studio.
- Intelligent VSM Studio.
- Transformation Workshop.
- Requirements Discovery.
- Lean Consultant.
- TOC Consultant.
- Automation & AI Consultant.
- To-Be Designer.
- Business Case Generator.
- Roadmap Generator.
- Executive Report Generator.
- Methodology Orchestrator.
- VSM Builder base.

### Backend Apps Script

- `doGet`.
- `doPost`.
- Router centralizado.
- API response estandar.
- Error utilities.
- Request parser.
- Auth controller/service.
- AI controller/service.
- AIProviderClient.
- Agent Orchestrator.
- Agent Registry.
- Context Builder Agent.
- Document Intelligence Layer.
- Context Graph Service.
- Session Service.
- VSM controller/service.
- Repositories para usuarios, proveedores IA, prompts, agentes, ejecuciones, paquetes de conocimiento, contexto documental, grafo y VSM.
- Validators para autenticacion, IA, Context Builder y VSM.
- Inicializador Google Sheets.
- Inicializador Google Drive.

## 5. Hitos completados de infraestructura

- Repositorio GitHub inicializado y sincronizado.
- Clasp configurado y operativo.
- Apps Script creado y conectado mediante Clasp.
- Backend desplegado exitosamente en Apps Script.
- Web App publicada.
- URL oficial DEV registrada.
- Google Sheets inicializado correctamente.
- 29 hojas creadas automaticamente.
- Google Drive inicializado correctamente.
- Estructura documental creada dentro de una carpeta padre configurable.
- Correccion aplicada para utilizar `DriveApp.getFolderById(parentFolderId)`.

## 6. Hitos completados de configuracion

- `app-config.js` actualizado para arquitectura multiambiente.
- `APP_CONFIG.API.BASE_URL` configurado para DEV.
- Eliminadas URLs hardcodeadas.
- Frontend preparado para consumir configuracion desde `APP_CONFIG`.

URL oficial DEV:

```text
https://script.google.com/macros/s/AKfycbyhjHHkkYjNiKvJkpdgwqS3IagrBIprTi-RxWEx5z-HNlvaQS6c4fYAd-YDx0EZMUqR/exec
```

## 7. Hitos completados de integracion

- Primer despliegue completo realizado.
- Frontend ejecutandose mediante Live Server.
- Backend respondiendo mediante Web App.
- Primera validacion funcional iniciada.

## 8. Product Backlogs y Sprints

| PB / Sprint | Estado | Comentario |
|---|---|---|
| PB01 - Product Foundation | Completo | Base inicial del proyecto. |
| PB02 - Modelo Maestro de Datos | Completo tecnico / validacion en progreso | Google Sheets inicializado con 29 hojas. |
| PB03 - Backend Base Apps Script | Desplegado / validacion en progreso | Backend publicado como Web App. |
| PB05 - Captura Guiada | Absorbido | Evolucionado hacia Business Discovery y Context Builder. |
| PB06 - Process Modeling Engine | Completo local | Persistencia real integral pendiente. |
| PB08 - VSM Builder | Completo local / validacion pendiente | Base VSM y Studio inteligente local implementados. |
| PB10 - Transformation Workspace | Completo local / validacion pendiente | Workspace navegable implementado. |
| PB11 - AI & Security Foundation | Parcial | Base disponible; validacion real de proveedores y prompts pendiente. |
| PB12A - Consulting Decision Framework | Completo | Metodologia reutilizable implementada/documentada. |
| Sprint UI-01 | Completo | Shell y navegacion inicial. |
| Sprint UI-02 | Completo | MVP navegable con persistencia local. |
| Sprint 1 a Sprint 18 | Completo local / parcial backend | Consultores, studios y paquetes principales implementados en modo local. |
| Sprint INT-01 | Completo | Integracion, scripts de despliegue y primera ejecucion. |
| Integration & Validation | En progreso | Validacion end-to-end del MVP. |

## 9. Consultores Digitales implementados

- Business Discovery Experience.
- Context Builder Agent.
- Process Discovery Consultant.
- Requirements Discovery Consultant.
- Lean Transformation Consultant.
- TOC Transformation Consultant.
- Automation & AI Transformation Consultant.
- To-Be Designer.
- Business Case Generator.
- Transformation Roadmap Generator.
- Executive Report Generator.

Estado general:

- Implementados principalmente en modo frontend/local.
- Preparados para integracion progresiva con Apps Script y Google Sheets.
- Deben mantener AI Governance, Consulting Framework y Consulting Decision Framework.

## 10. APIs existentes

Entrada Apps Script:

- `doGet(e)`
- `doPost(e)`

Acciones existentes:

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

## 11. Google Sheets

Estado:

- Inicializado correctamente.
- 29 hojas creadas automaticamente.

Inicializador:

- `initializeOperationalIntelligenceSheets(spreadsheetId)`.

Hojas principales:

- `CONFIG`
- `USERS`
- `AI_PROVIDERS`
- `PROMPTS`
- `AGENTS`
- `AGENT_EXECUTIONS`
- `PROJECTS`
- `DOCUMENTS`
- `INTERVIEWS`
- `NOTES`
- `NORMALIZED_DOCUMENTS`
- `BUSINESS_KNOWLEDGE_PACKAGES`
- `KNOWLEDGE_PACKAGES`
- `CONTEXT_GRAPHS`
- `PROCESS_MODELS`
- `OPERATIONAL_DATA`
- `VSM_MAPS`
- `VSM_ACTIVITY_DATA`
- `VSM_METRICS`
- `TRANSFORMATION_OBSERVATIONS`
- `REQUIREMENTS_PACKAGES`
- `LEAN_ASSESSMENTS`
- `TOC_ASSESSMENTS`
- `AUTOMATION_AI_OPPORTUNITIES`
- `TO_BE_PACKAGES`
- `BUSINESS_CASE_PACKAGES`
- `ROADMAP_PACKAGES`
- `EXECUTIVE_REPORT_PACKAGES`
- `PROJECT_TRANSFORMATION_STATUS`

## 12. Google Drive

Estado:

- Inicializado correctamente.
- Estructura documental creada dentro de una carpeta padre configurable.
- Correccion aplicada para utilizar `DriveApp.getFolderById(parentFolderId)`.

Inicializador:

- `initializeOperationalIntelligenceDrive(parentFolderId)`.

Estructura raiz:

```text
Carpeta Padre (ID recibido)
  Process Transformation AI/
    00_Admin/
    01_Projects/
    02_Prompt-Repository/
    03_Templates/
    04_Exports/
    99_Archive/
```

## 13. Configuracion IA

Componentes:

- `AIService.gs`
- `AIProviderClient.gs`
- `AIProviderRepository.gs`
- `PromptRepository.gs`
- `AgentRegistryService.gs`
- `AgentOrchestratorService.gs`

Proveedores soportados:

- OpenAI.
- Claude.
- Gemini.
- DeepSeek.
- Custom.

Regla:

- La API Key nunca debe llegar al navegador ni subirse al repositorio.

## 14. Estado del Workspace

Workspace navegable desde `frontend/index.html`.

Rutas principales:

- Dashboard.
- Proyectos.
- Business Discovery.
- Context Builder.
- Process Discovery.
- Process Modeling.
- Process Validation.
- Process Data Collection.
- Intelligent VSM.
- Transformation Workshop.
- Lean.
- TOC.
- Automation & AI.
- To-Be.
- Business Case.
- Roadmap.
- Executive Report.
- Methodology Orchestrator.

## 15. Bugs corregidos

### Bug 1

Bug:

`DriveDeploymentService` interpretaba `parentFolderId` como nombre de carpeta.

Estado:

Corregido.

### Bug 2

Bug:

`app-shell.js` utilizaba `appName` y `appVersion` mientras `APP_CONFIG` utilizaba `APP_NAME` y `VERSION`.

Estado:

Corregido.

## 16. Roadmap actualizado

El desarrollo funcional queda temporalmente congelado hasta finalizar la fase de integracion.

Roadmap inmediato:

1. Completar pruebas end-to-end `Frontend -> Apps Script -> Google Sheets -> Google Drive`.
2. Validar lectura y escritura real desde Web App.
3. Validar flujo de autenticacion.
4. Validar consumo de `APP_CONFIG.API.BASE_URL`.
5. Validar paquetes principales contra Google Sheets.
6. Validar estructura documental en Google Drive.
7. Registrar hallazgos.
8. Corregir solo bugs de integracion.
9. Autorizar reactivacion de desarrollo funcional.

Roadmap funcional posterior, congelado temporalmente:

1. Persistencia real completa de paquetes, Process Model y Project Transformation Status.
2. Validacion real de AI Providers, Prompts y Agents.
3. Exportaciones fisicas.
4. ERP Fit-Gap.
5. ERP RFP Builder.
6. Scorecard de proveedores.

## 17. Proximo objetivo

Continuar con pruebas end-to-end:

```text
Frontend
  -> Apps Script
  -> Google Sheets
  -> Google Drive
```

No agregar nuevas funcionalidades hasta completar la validacion completa del MVP.

## 18. Riesgos abiertos

- Validacion end-to-end aun en progreso.
- Riesgo de incompatibilidad entre modulos legacy y nueva estructura `APP_CONFIG`.
- Necesidad de confirmar todos los flujos reales contra Apps Script, Sheets y Drive.
- API Keys deben mantenerse fuera del frontend y del repositorio.
- Persistencia real completa sigue pendiente para varios studios.
- Exportaciones fisicas aun no implementadas.

## 19. Deuda tecnica

- Completar migracion de consumidores frontend hacia `APP_CONFIG.API.BASE_URL` cuando se autorice tocar codigo funcional relacionado.
- Automatizar pruebas frontend.
- Crear pruebas Apps Script ejecutables.
- Estandarizar migracion de `localStorage` a repositorios Apps Script.
- Agregar versionamiento formal de paquetes.
- Validar seguridad de sesiones en despliegue real.

## 20. Resumen ejecutivo

La primera fase de integracion e infraestructura fue completada. El repositorio, Apps Script, Clasp, Web App, Google Sheets y Google Drive ya estan operativos para el MVP.

El estado general es:

- Infraestructura: 100%.
- Backend: 95%.
- Frontend: 90%.
- Integracion: en progreso.

La prioridad absoluta ahora es terminar la validacion funcional end-to-end antes de reactivar cualquier desarrollo funcional.
