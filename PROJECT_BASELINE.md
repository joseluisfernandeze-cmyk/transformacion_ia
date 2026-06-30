# PROJECT BASELINE - Operational Intelligence Platform

Fecha de linea base: 2026-06-30  
Repositorio local: `C:\Users\josh_\Documents\GitHub\transformacion_ia`  
Repositorio remoto: `https://github.com/joseluisfernandeze-cmyk/transformacion_ia.git`  
Rama de trabajo: `develop`  
Ultimo commit conocido antes de INT-01: `e4eb613 actualizacion`

Este documento es la linea base oficial de la plataforma y debe actualizarse al finalizar cada Sprint.

## 1. Resumen del proyecto

Process Transformation AI es la primera solucion de Operational Intelligence Platform, una plataforma modular de inteligencia operacional para transformar procesos con una metodologia consultiva, evidencia trazable, modelos de proceso, VSM, consultores digitales y paquetes reutilizables de conocimiento.

Estado actual:

- Arquitectura del Core congelada.
- Frontend modular ejecutable desde `frontend/index.html`.
- Backend base en Google Apps Script.
- Google Sheets definido como base operativa.
- Google Drive definido como repositorio documental.
- MVP navegable end-to-end en modo local.
- Consultores digitales principales de transformacion implementados en modo local.
- Scripts de inicializacion para Google Sheets y Google Drive generados en INT-01.
- Guias de despliegue y primera ejecucion creadas.

Arquitectura:

- Frontend HTML, CSS y JavaScript puro.
- Backend Google Apps Script.
- Persistencia operativa Google Sheets.
- Repositorio documental Google Drive.
- Repositorio codigo GitHub.
- Core compartido por soluciones.
- Studios y Consultores Digitales sobre Core congelado.
- AIService y AIProviderClient con proveedores intercambiables.
- Prompt Repository y Agent Registry.
- Methodology Orchestrator como coordinador de la metodologia.

## 2. Estructura de carpetas principal

```text
transformacion_ia/
  .gitignore
  README.md
  PROJECT_BASELINE.md
  DEPLOYMENT_CHECKLIST.md
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

## 3. Componentes implementados

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

## 4. Product Backlogs y Sprints

| PB / Sprint | Estado | Comentario |
|---|---|---|
| PB01 - Product Foundation | Completo | Base inicial del proyecto. |
| PB02 - Modelo Maestro de Datos | Parcial | Modelo definido; script de inicializacion Sheets creado en INT-01. |
| PB03 - Backend Base Apps Script | Parcial | Backend estructural listo; despliegue real pendiente. |
| PB05 - Captura Guiada | Absorbido | Evolucionado hacia Business Discovery y Context Builder. |
| PB06 - Process Modeling Engine | Parcial | Studio local implementado; persistencia real pendiente. |
| PB08 - VSM Builder | Parcial | Base VSM y Studio inteligente local implementados. |
| PB10 - Transformation Workspace | Parcial | Workspace navegable implementado; integracion backend real pendiente. |
| PB11 - AI & Security Foundation | Parcial | Base disponible; configuracion real pendiente. |
| PB12A - Consulting Decision Framework | Completo | Metodologia reutilizable implementada/documentada. |
| Sprint UI-01 | Completo | Shell y navegacion inicial. |
| Sprint UI-02 | Completo | MVP navegable con persistencia local. |
| Sprint 1 a Sprint 18 | Completo local / parcial backend | Consultores, studios y paquetes principales implementados en modo local. |
| Sprint INT-01 | En cierre | Integracion, scripts de despliegue y documentacion de primera ejecucion. |

## 5. Consultores Digitales implementados

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

## 6. Agentes registrados

Registrado en backend base:

- `CONTEXT_BUILDER`

Consultores disponibles en frontend/local:

- Process Discovery.
- Requirements Discovery.
- Lean.
- TOC.
- Automation & AI.
- To-Be.
- Business Case.
- Roadmap.
- Executive Report.

## 7. APIs existentes

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

Sprint INT-01 no agrego APIs nuevas.

## 8. Google Sheets utilizados

Inicializador:

- `backend/apps-script/services/SheetsDeploymentService.gs`

Funcion:

- `initializeOperationalIntelligenceSheets(spreadsheetId)`

Hojas incluidas:

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

## 9. Google Drive utilizado

Inicializador:

- `backend/apps-script/services/DriveDeploymentService.gs`

Funcion:

- `initializeOperationalIntelligenceDrive(rootFolderName)`

Estructura base:

- `00_Admin`
- `01_Projects/_TEMPLATE_PROJECT`
- `02_Prompt-Repository`
- `03_Templates`
- `04_Exports`
- `99_Archive`

## 10. Configuracion IA

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

## 11. Estado del Workspace

Workspace navegable desde `frontend/index.html`.

Rutas principales validadas en INT-01:

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

## 12. Estado del Process Engine

Implementado localmente:

- Process Model.
- Actividades con identificadores.
- Edicion visual.
- Evidencia.
- Trazabilidad.
- Validaciones.
- Datos operacionales.
- Integracion local con Knowledge Package y Context Graph.

Pendiente:

- Persistencia real completa y versionamiento formal backend.

## 13. Estado del VSM

Implementado:

- VSM Builder base.
- Intelligent VSM Studio.
- Metricas basicas.
- Integracion local con Process Model enriquecido.

Pendiente:

- Validacion end-to-end contra Sheets y Apps Script real.

## 14. Estado del Knowledge Package

Implementado:

- Business Knowledge Package.
- Knowledge Package.
- Actualizacion local desde experiences/studios.
- Consumo por consultores locales.

Pendiente:

- Versionamiento real completo en backend.
- Persistencia Sheets end-to-end.

## 15. Estado del Context Graph

Implementado:

- Context Graph base.
- Repositories/Service backend base.
- Actualizacion local vinculada a Knowledge Package y Process Model.

Pendiente:

- Persistencia real validada.
- Visualizacion dedicada.

## 16. Roadmap actualizado

1. Cerrar Sprint INT-01 con commit y push a `develop`.
2. Ejecutar primer despliegue controlado en Google Apps Script.
3. Inicializar Google Sheets con `initializeOperationalIntelligenceSheets`.
4. Inicializar Google Drive con `initializeOperationalIntelligenceDrive`.
5. Configurar `AI_PROVIDERS`, `PROMPTS` y `AGENTS`.
6. Probar `doGet`, `login`, `executeAgent` y acciones VSM.
7. Conectar frontend con `APP_CONFIG.apiBaseUrl`.
8. Ejecutar primer proyecto end-to-end con backend real.
9. Priorizar persistencia real completa de paquetes, Process Model y Project Transformation Status.
10. Implementar exportaciones fisicas cuando el modelo interno del reporte este validado.

## 17. Proximo Sprint recomendado

**Deployment Validation Sprint - Google Runtime**

Objetivo:

- Publicar Apps Script.
- Ejecutar inicializadores.
- Validar Sheets, Drive, AI config y primer flujo con backend real.

Justificacion:

- La plataforma ya es navegable localmente.
- INT-01 deja la infraestructura de primera ejecucion preparada.
- El siguiente riesgo mayor es validar la ejecucion real sobre Google.

## 18. Riesgos abiertos

- Despliegue Apps Script no probado aun en entorno Google real.
- Permisos Google pueden requerir aprobaciones manuales.
- Configuracion IA real depende de claves y modelos validos.
- `localStorage` sigue siendo persistencia temporal en el MVP local.
- Persistencia real completa de todos los paquetes aun no esta conectada.
- Exportacion fisica de reportes aun no existe.

## 19. Deuda tecnica

- Automatizar pruebas frontend.
- Crear pruebas Apps Script ejecutables.
- Estandarizar migracion de `localStorage` a repositorios Apps Script.
- Agregar versionamiento formal de paquetes.
- Validar seguridad de sesiones en despliegue real.
- Documentar operacion real posterior a despliegue.

## 20. Resumen ejecutivo

Operational Intelligence Platform cuenta con una base funcional amplia para Process Transformation AI. El sistema ya permite navegar la metodologia completa, revisar studios y consultores principales, y preparar entregables internos de transformacion operacional.

Sprint INT-01 consolida la integracion, corrige errores de navegacion, agrega scripts de inicializacion para Google Sheets y Google Drive, y deja documentadas las instrucciones de despliegue y primera ejecucion.

La prioridad inmediata es validar la plataforma en el runtime real de Google Apps Script con Google Sheets, Google Drive y proveedor IA configurado.
