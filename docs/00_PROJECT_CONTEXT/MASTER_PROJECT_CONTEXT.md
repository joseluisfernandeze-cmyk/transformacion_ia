# MASTER PROJECT CONTEXT

## 1. Vision

Process Transformation AI es una plataforma profesional para transformacion operacional. Su proposito es ayudar a comprender, modelar, validar, analizar y transformar procesos de negocio mediante una combinacion de metodologia consultiva, datos operativos, modelos visuales, evidencia documental y consultores digitales.

El producto no debe comportarse como un chatbot. La experiencia debe sentirse como una plataforma de consultoria profesional donde el usuario trabaja con studios, paquetes de conocimiento, modelos de proceso y agentes especializados.

La arquitectura evoluciono hacia una plataforma reutilizable llamada temporalmente Operational Intelligence Platform. Process Transformation AI es la primera solucion sobre esa plataforma. La vision es soportar multiples soluciones reutilizando el mismo Core.

## 2. Filosofia del producto

La plataforma debe operar con estas ideas rectoras:

- primero comprender, luego analizar;
- no generar diagnosticos sin evidencia;
- no inventar informacion;
- separar captura, validacion, modelado, analisis y recomendacion;
- mantener trazabilidad entre documentos, entrevistas, actividades, reglas, restricciones, hallazgos y recomendaciones;
- permitir validacion humana antes de consolidar resultados;
- construir activos reutilizables del proyecto;
- disenar cada modulo pensando en los proximos diez Product Backlogs;
- no duplicar informacion ni recorridos del proceso;
- mantener un nucleo comun para todas las soluciones.

## 3. Arquitectura general

La arquitectura se organiza en cinco capas principales:

1. Frontend.
2. Backend Google Apps Script.
3. Datos operativos en Google Sheets.
4. Repositorio documental en Google Drive.
5. Servicios de IA mediante proveedores intercambiables.

### 3.1 Frontend

Tecnologias:

- HTML.
- CSS.
- JavaScript.
- Sin frameworks.
- Sin npm.
- Sin librerias externas.

El frontend se ejecuta desde `frontend/index.html`. A partir de `Sprint UI-01`, toda funcionalidad visible debe integrarse dentro del Application Shell y abrirse dentro del Workspace.

### 3.2 Backend

Tecnologia:

- Google Apps Script.

El backend se estructura con:

- `Code.gs` como entrada principal.
- Controladores.
- Servicios.
- Repositorios.
- Validadores.
- Utilidades.
- Configuracion.

La API utiliza `doGet` y `doPost`, contratos JSON estandarizados y respuestas uniformes.

### 3.3 Datos

La base de datos operativa es Google Sheets. Las hojas representan entidades del sistema, configuraciones, usuarios, proveedores IA, prompts, agentes, paquetes de conocimiento, grafos de contexto, VSM y datos derivados.

### 3.4 Documentos

Google Drive es el repositorio documental. Debe almacenar documentos originales, evidencias, normalizaciones, anexos y artefactos generados.

### 3.5 IA

La IA se consume exclusivamente desde Apps Script. El frontend nunca debe recibir ni solicitar API Keys. Toda ejecucion IA debe pasar por:

Frontend -> Apps Script -> AIService -> AIProviderClient -> Proveedor IA -> Respuesta JSON -> Frontend.

## 4. Principios de arquitectura

- Core congelado: no crear nuevos componentes Core sin aprobacion explicita.
- Modularidad estricta.
- Separacion de responsabilidades.
- SOLID.
- Clean Architecture adaptada al stack.
- Contratos estandarizados.
- Reutilizacion sobre duplicacion.
- Frontend desacoplado de proveedores IA.
- Backend como frontera de seguridad.
- Google Sheets como base operativa MVP.
- Google Drive como repositorio documental.
- Componentes preparados para evolucionar, no para reescribirse.

## 5. Core

El Core reutilizable de Operational Intelligence Platform incluye:

- Gestion de proyectos.
- Gestion documental.
- Document Intelligence Layer.
- Process Engine.
- Process Modeling Engine.
- VSM Engine.
- Calculation Engine.
- AI Service.
- AI Provider.
- Prompt Repository.
- Authentication.
- Agent Registry.
- Agent Orchestrator.
- Workspace.
- Knowledge Package Repository.
- Context Graph.
- Methodology Orchestrator.

Estos componentes deben ser reutilizados por cualquier solucion futura.

## 6. Solutions

### 6.1 Process Transformation

Objetivo: transformacion operacional.

Incluye:

- As-Is.
- VSM.
- Lean.
- TOC.
- Automatizacion.
- IA.
- To-Be.
- Business Case.
- Roadmap.
- Executive Report.

### 6.2 ERP Discovery

Objetivo: levantar procesos y comprender la operacion para identificar requerimientos funcionales de ERP.

Incluye:

- levantamiento de procesos;
- procesos As-Is;
- sistemas actuales;
- formularios;
- reportes;
- catalogo de requerimientos;
- reglas de negocio;
- integraciones;
- dolor del usuario.

### 6.3 ERP RFP Builder

Objetivo: generar automaticamente un RFP funcional reutilizando informacion de ERP Discovery.

Debe producir:

- requerimientos funcionales;
- requerimientos tecnicos;
- matriz de evaluacion;
- criterios de seleccion;
- casos de uso;
- escenarios de prueba;
- scorecard de proveedores.

### 6.4 Operational Audit

Solucion futura para auditoria operacional.

### 6.5 Workload Analysis

Solucion futura para analisis de cargas laborales y preparacion de simulaciones.

### 6.6 Knowledge Capture

Solucion futura para capturar conocimiento estructurado desde documentos, entrevistas y notas.

## 7. Studios y experiencias

### 7.1 Business Discovery Experience

Primera experiencia de consultoria. Captura conocimiento de negocio antes de analizar procesos. Genera Business Knowledge Package.

### 7.2 Context Builder / Discovery Workspace

Permite cargar documentos, entrevistas y notas. Ejecuta el Context Builder Agent y permite revisar, validar y enriquecer el Knowledge Package y el Context Graph.

### 7.3 Process Discovery Workspace

Transforma conocimiento validado en un Draft Process Model con actividades, secuencia, responsables, entradas, salidas, sistemas, documentos, reglas y evidencia.

### 7.4 Process Modeling Studio

Permite visualizar, validar y editar el proceso As-Is. Soporta actividades, responsables, sistemas, documentos, reglas, decisiones, observaciones, evidencia y confianza.

### 7.5 Process Validation Studio

Valida la calidad del Process Model antes de permitir analisis posteriores. Calcula Health Score y bloquea etapas cuando el proceso no es apto.

### 7.6 Process Data Collection Studio

Captura informacion operacional por actividad: frecuencia, tiempos triangulares, clasificacion VA/NNVA/NVA, esperas, recursos, volumen, riesgos e indicadores.

### 7.7 Intelligent VSM Studio

Genera un VSM vivo desde el Process Model enriquecido. Calcula metricas, muestra flujo, clasificaciones, responsables, sistemas y validaciones.

### 7.8 Transformation Workshop

Permite capturar observaciones de taller sobre actividades del VSM: problemas, desperdicios percibidos, retrabajos, esperas, riesgos, ideas, automatizaciones sugeridas, uso de IA sugerido, comentarios y evidencia.

### 7.9 Methodology Orchestrator

Coordina la metodologia completa. No analiza ni ejecuta IA. Administra avance, aprobaciones, bloqueos, Health Score y estado del proyecto.

### 7.10 Application Shell

Construido en `Sprint UI-01`. Integra header, sidebar, workspace, breadcrumb, footer, dashboard y navegacion de modulos.

## 8. Consultores Digitales y agentes

### 8.1 Arquitectura comun

Todos los agentes deben usar:

- Agent Registry.
- Agent Orchestrator.
- AIService.
- AI Providers.
- Prompt Repository.
- Process Model.
- VSM Engine cuando aplique.
- Calculation Engine cuando aplique.
- Workspace.
- Document Repository.
- Knowledge Package.
- Context Graph.

El frontend no solicita prompts. Solicita ejecucion de agentes. El backend selecciona proveedor, modelo, prompt, contexto y salida.

### 8.2 Agentes definidos

- Context Builder Agent.
- Process Discovery Agent.
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

### 8.3 Implementados o parcialmente implementados

- Context Builder Agent: base funcional para Knowledge Package y Context Graph.
- Process Discovery Consultant: base funcional para Draft Process Model.
- Requirements Discovery Consultant: base funcional para Requirements Package.

### 8.4 Futuros

- Lean Transformation Consultant.
- TOC Transformation Consultant.
- Automation & AI Consultant.
- To-Be Designer.
- Business Case Consultant.
- Roadmap Consultant.
- Executive Report Consultant.

## 9. Consulting Framework

Todo Consultor Digital debe seguir el ciclo:

1. Comprender el contexto.
2. Validar la informacion disponible.
3. Detectar informacion faltante.
4. Detectar contradicciones.
5. Formular preguntas cuando sea necesario.
6. Construir hipotesis.
7. Generar un borrador.
8. Explicar el nivel de confianza.
9. Mostrar la evidencia utilizada.
10. Esperar validacion humana antes de consolidar resultados.

Reglas obligatorias:

- nunca inventar informacion;
- toda afirmacion debe estar respaldada por evidencia;
- toda recomendacion debe explicar por que fue propuesta;
- toda salida debe incluir nivel de confianza;
- toda salida debe ser trazable a documentos, entrevistas o procesos;
- cuando la informacion sea insuficiente, formular preguntas en lugar de asumir.

### 9.1 Consulting Decision Framework

PB12A incorpora el Consulting Decision Framework como metodologia oficial de razonamiento para todos los Consultores Digitales. No es un agente, no es un modulo funcional, no tiene interfaz propia y no crea APIs nuevas. Es un marco reutilizable que estandariza como un consultor digital debe pasar desde la comprension hasta las preguntas pendientes antes de emitir conclusiones.

Las nueve etapas obligatorias son:

1. Comprender: entender que ocurre realmente. Debe responder que hace la actividad, cual es su proposito, quien participa, que entradas recibe y que salidas genera. No emite conclusiones.
2. Validar: confirmar evidencia suficiente. Toda afirmacion debe indicar fuente, evidencia y nivel de confianza. Si la evidencia es insuficiente, no continua el analisis y genera preguntas.
3. Diagnosticar: identificar el problema observado. No propone soluciones ni cuantifica beneficios.
4. Cuantificar: determinar impacto con tiempo, costo, frecuencia, volumen o riesgo cuando existan datos. Si no existen, registra limitacion.
5. Proponer: generar alternativas de mejora vinculadas al diagnostico.
6. Justificar: toda propuesta debe indicar evidencia, razonamiento, supuestos y restricciones.
7. Estimar: estimar beneficio esperado, esfuerzo, complejidad e impacto cuando sea posible. Si no es posible, indicar informacion insuficiente.
8. Advertir: identificar riesgos, dependencias, impactos colaterales e incertidumbre.
9. Preguntar: ante cualquier vacio de informacion, generar preguntas especificas antes de emitir conclusion definitiva.

Reglas anti alucinacion del Decision Framework:

- ningun consultor puede inventar procesos;
- ningun consultor puede inventar actividades;
- ningun consultor puede inventar responsables;
- ningun consultor puede inventar indicadores;
- ningun consultor puede inventar desperdicios;
- ningun consultor puede inventar restricciones;
- cuando la evidencia sea insuficiente, debe reducir confianza, solicitar informacion adicional y abstenerse de concluir.

Modelo comun de decision:

- `decisionTrace`: trazabilidad del razonamiento aplicado.
- `frameworkVersion`: version del Consulting Decision Framework.
- `canConclude`: indica si la conclusion esta permitida.
- `conclusionPolicy`: `CONCLUSION_ALLOWED` o `ASK_BEFORE_CONCLUSION`.
- `confidence`: nivel de confianza resultante.
- `stages`: resultado por cada una de las nueve etapas.
- `evidence`: evidencia utilizada.
- `assumptions`: supuestos declarados.
- `missingInformation`: informacion faltante.
- `questions`: preguntas requeridas.

El framework debe ser consumido por Lean Transformation Consultant, TOC Transformation Consultant, Automation & AI Consultant, ERP Discovery Consultant, RFP Consultant, Business Case Consultant, Operational Audit Consultant y Knowledge Capture Consultant. No debe duplicarse la logica metodologica en cada consultor.

## 10. AI Governance

El AI Governance Framework es obligatorio para todos los agentes.

### 10.1 Principios

- Evidencia antes que generacion.
- Trazabilidad obligatoria.
- Confianza explicita.
- Hipotesis separadas de hechos.
- Validacion humana antes de consolidar.
- No exposicion de claves.
- No prompts solicitados por frontend.
- Respuestas JSON estandarizadas.

### 10.2 Reglas anti alucinacion

- No crear procesos, actividades, requerimientos ni beneficios sin evidencia.
- No convertir hipotesis en hechos.
- No ocultar incertidumbre.
- No inferir responsables, tiempos, sistemas o reglas si no existen fuentes.
- Formular preguntas cuando falten datos.

### 10.3 Evidencia

Cada resultado debe registrar:

- fuente;
- fragmento utilizado;
- nivel de confianza;
- fecha;
- documento o entrevista de origen.

### 10.4 Confianza

Clasificaciones:

- Alta confianza.
- Confianza media.
- Baja confianza.
- Informacion insuficiente.

### 10.5 Hipotesis

Toda hipotesis debe indicar:

- descripcion;
- razon de creacion;
- evidencia parcial;
- informacion necesaria para validarla o descartarla.

### 10.6 Validacion humana

Los resultados relevantes deben quedar en estado borrador hasta aprobacion, correccion o rechazo del usuario.

## 11. Product Backlog y Roadmap

### 11.1 Backlog historico relevante

- PB01: Fundacion frontend.
- PB02: Modelo maestro de datos en Google Sheets.
- PB03: Backend base en Google Apps Script.
- PB05: Captura guiada de informacion del proceso.
- PB06: Process Modeling Engine.
- PB08: VSM Builder.
- PB09 a PB13: fusionados en Transformation Analyzer.
- PB10: Transformation Workspace.
- PB11: AI & Security Foundation.
- PB12: Consulting Framework.

### 11.2 Sprints funcionales

- Sprint 1: Context Builder Agent.
- Sprint 2: Discovery Workspace.
- Sprint 3: Business Discovery Experience.
- Sprint 4: Process Discovery Consultant.
- Sprint 5: Process Modeling Studio.
- Sprint 6: Process Validation Studio.
- Sprint 8: Process Data Collection Studio.
- Sprint 9: Intelligent VSM Studio.
- Sprint 10: Transformation Workshop.
- Sprint 11: Case Runner & Methodology Orchestrator.
- Sprint UI-01: Application Shell & Navigation.

### 11.3 Roadmap actual

Completado o base funcional:

- arquitectura Core;
- frontend base;
- backend base;
- seguridad e IA base;
- Knowledge Package;
- Context Graph;
- Business Discovery;
- Process Discovery;
- Process Modeling;
- Process Validation;
- Process Data Collection;
- Intelligent VSM;
- Transformation Workshop;
- Methodology Orchestrator;
- Application Shell.

Pendiente:

- Lean Transformation Consultant;
- TOC Transformation Consultant;
- Automation & AI Consultant;
- To-Be Designer;
- Business Case;
- Roadmap;
- Executive Report;
- ERP Fit-Gap;
- ERP RFP Builder;
- scorecards y evaluaciones avanzadas.

## 12. Modelo de datos

Activos principales:

- Business Knowledge Package.
- Knowledge Package.
- Context Graph.
- Normalized Document.
- Interview.
- Note.
- Process Model.
- Activity.
- Operational Data.
- VSM Map.
- VSM Activity Data.
- Requirements Package.
- Transformation Observation Package.
- Transformation Opportunity Package.
- Project Transformation Status.

### 12.1 Knowledge Package

Activo reutilizable que consolida informacion del proyecto.

Debe incluir:

- version;
- createdBy;
- createdAt;
- sourceDocuments;
- confidence;
- parentKnowledgePackage;
- objetivo;
- alcance;
- procesos;
- actividades;
- sistemas;
- personas;
- roles;
- documentos;
- indicadores;
- restricciones;
- reglas de negocio;
- contradicciones;
- informacion faltante.

### 12.2 Context Graph

Representa relaciones entre:

- procesos;
- actividades;
- personas;
- areas;
- documentos;
- sistemas;
- indicadores;
- restricciones;
- reglas de negocio.

### 12.3 Process Model

Modelo del proceso con:

- procesos;
- subprocesos;
- actividades;
- sequence;
- activityId;
- activityUUID permanente;
- responsables;
- areas;
- entradas;
- salidas;
- sistemas;
- documentos;
- decisiones;
- reglas;
- dependencias;
- evidencia;
- confianza;
- layout visual.

### 12.4 VSM

El VSM extiende actividades existentes. No duplica actividades.

`mapType` debe soportar:

- AS_IS.
- TO_BE.
- SIMULATION.
- BASELINE.

`VsmActivityData` debe almacenar:

- activityUUID;
- sequence;
- lane;
- color;
- collapsed;
- x;
- y;
- clasificacion VA/NNVA/NVA;
- processTimeMin;
- processTimeLikely;
- processTimeMax;
- waitingTimeMin;
- waitingTimeLikely;
- waitingTimeMax;
- queueTimeMin;
- queueTimeLikely;
- queueTimeMax;
- frecuencia;
- WIP cuando aplique.

## 13. Google Sheets

Google Sheets es la base operativa del MVP.

Hojas existentes o esperadas:

- USERS.
- AI_PROVIDERS.
- PROMPTS.
- AGENTS.
- AGENT_EXECUTIONS.
- NORMALIZED_DOCUMENTS.
- KNOWLEDGE_PACKAGES.
- CONTEXT_GRAPHS.
- VSM_MAPS.
- VSM_ACTIVITY_DATA.
- VSM_METRICS.
- PROCESS_MODELS.
- OPERATIONAL_DATA.
- REQUIREMENTS_PACKAGES.
- TRANSFORMATION_OBSERVATIONS.
- TRANSFORMATION_OPPORTUNITIES.
- PROJECT_TRANSFORMATION_STATUS.

Reglas:

- nombres de hojas en mayusculas;
- IDs estables;
- campos de auditoria;
- estados explicitos;
- versionamiento cuando el activo evoluciona;
- no almacenar API Keys en frontend;
- claves IA solo en hoja segura administrada desde Apps Script.

## 14. Google Drive

Google Drive es el repositorio documental.

Debe organizar:

- documentos originales;
- documentos normalizados;
- entrevistas;
- notas;
- evidencias;
- anexos;
- entregables generados;
- reportes;
- archivos por proyecto.

El Context Builder Agent no debe consumir archivos directamente. Debe consumir documentos normalizados por el Document Intelligence Layer.

OCR, extraccion avanzada de imagenes, Visio y conectores externos quedan preparados para futuras versiones.

## 15. Apps Script

Estructura actual:

- `backend/apps-script/Code.gs`.
- `config`.
- `controllers`.
- `models`.
- `repositories`.
- `services`.
- `utils`.
- `validators`.

Controladores existentes:

- `AIController.gs`.
- `AuthController.gs`.
- `VsmController.gs`.

Servicios existentes:

- `AgentOrchestratorService.gs`.
- `AgentRegistryService.gs`.
- `AIService.gs`.
- `AuthService.gs`.
- `ContextBuilderAgent.gs`.
- `ContextGraphService.gs`.
- `DocumentIntelligenceLayer.gs`.
- `SessionService.gs`.
- `VsmService.gs`.

Repositorios existentes:

- `AgentExecutionRepository.gs`.
- `AgentRepository.gs`.
- `AIProviderRepository.gs`.
- `ContextGraphRepository.gs`.
- `DocumentIntelligenceRepository.gs`.
- `KnowledgePackageRepository.gs`.
- `PromptRepository.gs`.
- `SheetRepository.gs`.
- `UserRepository.gs`.
- `VsmRepository.gs`.

Utilidades existentes:

- `AIProviderClient.gs`.
- `ApiResponse.gs`.
- `AppError.gs`.
- `HashUtils.gs`.
- `RequestParser.gs`.

Validadores existentes:

- `AIValidator.gs`.
- `AuthValidator.gs`.
- `ContextBuilderValidator.gs`.
- `VsmValidator.gs`.

## 16. APIs

Acciones conocidas:

- `login`.
- `logout`.
- `validateSession`.
- `executeAgent`.
- `createVsmMap`.
- `getVsmMap`.
- `listVsmMaps`.
- `updateVsmActivityData`.
- `saveVsmMap`.
- `calculateVsmMetrics`.
- `getVsmMetrics`.
- `archiveVsmMap`.

Contrato general esperado:

- solicitud JSON con `action` y `payload`;
- respuesta JSON estandarizada;
- errores estandarizados;
- validacion centralizada;
- logs de ejecucion cuando aplique.

## 17. AI Service y proveedores

`AIService` debe:

- leer configuracion;
- seleccionar proveedor activo;
- seleccionar modelo;
- seleccionar prompt;
- construir prompt final;
- ejecutar proveedor mediante `AIProviderClient`;
- devolver JSON estandarizado.

`AIProviderClient` debe soportar proveedores intercambiables:

- OpenAI.
- Claude.
- Gemini.
- DeepSeek.
- Custom.

El frontend nunca debe leer:

- prompts;
- API Keys;
- tokens;
- configuracion sensible.

## 18. Prompt Repository

Los prompts se administran en Google Sheets para permitir modificacion sin republicar el sistema.

Cada prompt debe incluir:

- ID;
- nombre;
- descripcion;
- prompt;
- activo.

El frontend solicita agentes, no prompts.

## 19. Frontend

Estructura actual:

- `frontend/index.html`.
- `frontend/assets/css`.
- `frontend/assets/js/app.js`.
- `frontend/config/app-config.js`.
- `frontend/shared`.
- `frontend/modules`.

Modulos frontend existentes:

- `ai-security`.
- `business-discovery`.
- `context-builder`.
- `intelligent-vsm-studio`.
- `methodology-orchestrator`.
- `process-data-collection-studio`.
- `process-discovery`.
- `process-modeling-studio`.
- `process-validation-studio`.
- `requirements-discovery`.
- `transformation-workshop`.
- `vsm-builder`.

Componentes compartidos:

- `app-shell.js`.
- `app-constants.js`.
- `api-client.js`.
- `consulting-decision-framework.js`.
- `calculation-engine.js`.
- `transformation-intelligence-engine.js`.
- `dom-utils.js`.

Rutas visibles:

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
- Methodology Orchestrator.
- Lean Consultant proximamente.
- TOC Consultant proximamente.
- Automation & AI proximamente.
- To-Be Designer proximamente.
- Business Case proximamente.
- Roadmap proximamente.
- Executive Report proximamente.

## 20. Backend

El backend debe mantenerse como frontera de:

- seguridad;
- IA;
- persistencia;
- validacion;
- integracion con Google Sheets;
- integracion con Google Drive;
- normalizacion de documentos;
- orquestacion de agentes.

No debe exponerse configuracion sensible al navegador.

## 21. GitHub

Repositorio remoto oficial:

`https://github.com/joseluisfernandeze-cmyk/transformacion_ia.git`

Flujo obligatorio:

1. Crear rama `feature/sprint-XX`.
2. Desarrollar.
3. Probar.
4. Commit.
5. Merge a `develop`.
6. Push.
7. Cuando el Sprint sea aprobado, merge a `main`.
8. Crear tag `v0.X.X`.

Rama de trabajo base:

- `develop`.

## 22. Convenciones

### 22.1 Nomenclatura

- Carpetas en kebab-case para frontend.
- Archivos JS por modulo con sufijos `controller`, `renderer`, `service`.
- Apps Script en PascalCase por responsabilidad.
- Hojas de Google Sheets en mayusculas.
- Objetos de dominio en ingles tecnico consistente.

### 22.2 Frontend

- No usar frameworks.
- No usar npm.
- No usar librerias externas.
- Mantener modulos aislados.
- Reutilizar componentes compartidos.
- Integrar todo en Application Shell.
- No crear pantallas independientes fuera del Workspace.

### 22.3 Backend

- Separar controladores, servicios, repositorios, validadores y utilidades.
- No mezclar logica de negocio con entrada HTTP.
- No mezclar persistencia con renderizado.
- No exponer secretos.

### 22.4 UI

- Aspecto profesional.
- Layout responsive.
- Componentes preparados para crecer.
- Evitar formularios largos cuando la experiencia sea consultiva.
- Mantener studios como espacios de trabajo.

### 22.5 UX

- Guiar al usuario.
- Explicar por que se solicita informacion.
- Mostrar progreso.
- Mostrar bloqueos.
- Permitir validacion y correccion.
- Diferenciar hechos, hipotesis, preguntas y recomendaciones.

## 23. Reglas para futuras implementaciones

- No modificar arquitectura congelada sin solicitud explicita.
- No crear nuevos componentes Core sin aprobacion.
- No avanzar al siguiente Sprint sin autorizacion.
- No implementar funcionalidades no solicitadas.
- No duplicar informacion existente.
- No duplicar recorridos del proceso.
- No romper funcionalidades existentes.
- Cada entrega debe ser funcional.
- Cada Sprint debe ejecutarse desde VS Code.
- Cada modulo debe integrarse al Application Shell.
- Cada salida generada por IA debe tener evidencia, confianza y trazabilidad.
- Cada Consultor Digital debe aplicar el Consulting Decision Framework antes de emitir conclusiones o recomendaciones.
- Las API Keys nunca deben llegar al navegador.
- El frontend nunca debe solicitar prompts.
- El backend debe ejecutar agentes mediante `executeAgent`.
- Actualizar `CURRENT_STATE.md` al finalizar cada Sprint.
- Actualizar `MASTER_PROJECT_CONTEXT.md` solo cuando cambien decisiones arquitectonicas o metodologicas.
- Actualizar `00_START_HERE.md` solo cuando cambie significativamente el producto.
