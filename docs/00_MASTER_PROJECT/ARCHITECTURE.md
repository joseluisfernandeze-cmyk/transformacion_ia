# ARCHITECTURE

## 1. Vision arquitectonica

Operational Intelligence Platform es una plataforma modular para soportar multiples soluciones de inteligencia operacional usando un Core comun.

La primera solucion es Process Transformation AI.

Principio rector: los modulos actuales no son productos aislados. Son experiencias y servicios que comparten el mismo Core conceptual.

## 2. Arquitectura por capas

### Frontend

Tecnologia:

- HTML.
- CSS.
- JavaScript puro.
- Sin frameworks.
- Sin npm.
- Sin librerias externas.

Responsabilidades:

- Renderizar experiencias.
- Capturar datos.
- Mostrar estados.
- Navegar entre modulos.
- Persistir temporalmente en `localStorage`.
- Invocar backend cuando `APP_CONFIG.apiBaseUrl` este configurado.

### Backend

Tecnologia:

- Google Apps Script.

Responsabilidades:

- API central via `doGet` y `doPost`.
- Autenticacion simple.
- Ruteo de acciones.
- Ejecucion de agentes.
- Acceso a Google Sheets.
- Acceso a Google Drive.
- Invocacion de proveedores IA.
- Respuestas JSON estandarizadas.

### Datos

Base esperada:

- Google Sheets.

Estado actual:

- Diseno documentado.
- Repositorios Apps Script preparados.
- Persistencia frontend aun local.

### Documentos

Repositorio esperado:

- Google Drive.

Estado actual:

- Estructura documentada.
- Carga real a Drive pendiente.

## 3. Core conceptual

Componentes del Core:

- Project Management.
- Document Management.
- Document Intelligence Layer.
- Authentication.
- Workspace.
- Process Engine.
- Process Modeling Engine.
- VSM Engine.
- Calculation Engine.
- Knowledge Package Repository.
- Context Graph.
- AI Service.
- AI Provider abstraction.
- Prompt Repository.
- Agent Registry.
- Agent Orchestrator.
- Methodology Orchestrator.

Decision: aunque algunos componentes estan implementados localmente en frontend, su rol conceptual pertenece al Core. No deben duplicarse por solucion.

## 4. Solutions

### Process Transformation

Incluye:

- Business Discovery.
- Context Builder.
- Process Discovery.
- Process Modeling.
- Process Validation.
- Process Data Collection.
- Intelligent VSM.
- Transformation Workshop.
- Transformation Intelligence Engine.
- Futuros Lean, TOC, Automation & AI, To-Be, Business Case, Roadmap, Executive Report.

### ERP Discovery

Implementado parcialmente:

- Requirements Discovery Consultant.
- Requirements Package.

Pendiente:

- ERP Fit-Gap.
- ERP RFP Builder.

### Futuras soluciones

- ERP RFP Builder.
- Operational Audit.
- Workload Analysis.
- Knowledge Capture.

## 5. Patron frontend

Cada modulo funcional usa:

```text
module/
  module-service.js
  module-renderer.js
  module-controller.js
```

Responsabilidades:

- Service: estado, reglas locales, transformaciones, persistencia local.
- Renderer: HTML string, presentacion y escapes.
- Controller: eventos, inicializacion y coordinacion UI.

No se debe mezclar logica de negocio en renderers.

## 6. Shell y navegacion

Sprint UI-01 implemento:

- Header.
- Sidebar.
- Workspace.
- Breadcrumb.
- Footer.
- Dashboard.
- Hash routing.

Archivo principal:

```text
frontend/assets/js/app.js
```

Shell:

```text
frontend/shared/components/app-shell.js
```

El shell no ejecuta metodologia ni analisis. Solo estructura la experiencia.

## 7. Integracion entre modulos

La integracion actual ocurre mediante:

- `localStorage`.
- Servicios frontend compartidos.
- Lectura de estado de servicios existentes.

Ejemplos:

- Business Discovery sincroniza datos hacia Context Builder.
- Context Builder construye Knowledge Package y Context Graph.
- Process Discovery construye Draft Process Model.
- Process Modeling actualiza Process Model y Knowledge Package.
- Process Validation calcula Health Score.
- Data Collection enriquece actividades con `operationalData`.
- Intelligent VSM usa `operationalData` y escribe `vsmData`.
- Transformation Workshop genera observaciones por actividad.
- Methodology Orchestrator lee todos los estados y produce `Project Transformation Status`.

## 8. Backend Apps Script

Estructura:

```text
backend/apps-script/
  Code.gs
  config/
  controllers/
  repositories/
  services/
  utils/
  validators/
```

Contratos:

- Solicitud con `action` y `payload`.
- Respuesta con formato estandar.
- Errores con estructura controlada.

## 9. IA

Decision aprobada:

- AIProviderClient debe soportar proveedores intercambiables.
- AI_PROVIDERS reemplaza API_KEY unica.
- Frontend nunca solicita prompts.
- Frontend solicita `executeAgent`.
- Backend selecciona agente, proveedor, modelo y prompt.

Proveedores previstos:

- OpenAI.
- Claude.
- Gemini.
- DeepSeek.
- Custom.

## 10. Restricciones de arquitectura

- No crear nuevos Core components sin autorizacion.
- No reescribir modulos existentes.
- No duplicar Process Model.
- VSM usa actividades existentes.
- Requirements Package no duplica procesos.
- Transformation Observation Package referencia actividades.
- Methodology Orchestrator coordina; no analiza.
- Transformation Intelligence Engine analiza internamente; no tiene UI directa.

## 11. Deuda arquitectonica actual

- Persistencia real Google Sheets pendiente.
- Versionamiento formal de paquetes pendiente.
- Navegacion implementada en frontend; falta gobierno de rutas por permisos.
- Adjuntos reales Google Drive pendientes.
- Backend no validado end-to-end contra Apps Script desplegado.
- Tests automatizados reales pendientes.
