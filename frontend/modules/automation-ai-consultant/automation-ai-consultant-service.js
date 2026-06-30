window.AutomationAiConsultantService = Object.seal({
  storageKey: "operational-intelligence.automation-ai-consultant",

  automationLevels: {
    NONE: "No automatizable",
    PARTIAL: "Parcialmente automatizable",
    FULL: "Totalmente automatizable"
  },

  aiOpportunityTypes: [
    "OCR",
    "Clasificacion automatica",
    "Extraccion documental",
    "Generacion de contenido",
    "Asistentes inteligentes",
    "Prediccion",
    "Recomendacion",
    "Deteccion de anomalias",
    "Vision artificial",
    "IA conversacional"
  ],

  createState() {
    const sources = this.loadSources();

    return {
      sources,
      selectedActivityUUID: this.firstActivityUuid(sources.processState),
      opportunityPackage: null,
      questions: [],
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `AAI-${Date.now()}`,
      author: "consultant",
      text: "Evaluare oportunidades de automatizacion e IA solo con evidencia del proceso actual, datos operativos, VSM, taller, Lean y TOC.",
      createdAt: new Date().toISOString()
    }];
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      const saved = rawState ? JSON.parse(rawState) : {};
      const state = {
        ...this.createState(),
        ...saved
      };
      state.sources = this.loadSources();
      state.selectedActivityUUID = saved.selectedActivityUUID || this.firstActivityUuid(state.sources.processState);
      state.opportunityPackage = saved.opportunityPackage || null;
      state.questions = this.buildQuestions(state.opportunityPackage, state.sources);
      state.chat = saved.chat && saved.chat.length ? saved.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.questions = this.buildQuestions(state.opportunityPackage, state.sources);
    state.lastSavedAt = new Date().toISOString();
    this.syncToKnowledgePackage(state);
    this.syncToContextGraph(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedActivityUUID: state.selectedActivityUUID,
      opportunityPackage: state.opportunityPackage,
      questions: state.questions,
      chat: state.chat,
      lastSavedAt: state.lastSavedAt
    }));
  },

  loadSources() {
    const processState = this.loadProcessState();
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const workshopState = window.TransformationWorkshopService ? window.TransformationWorkshopService.loadState() : null;
    const vsmState = window.IntelligentVsmStudioService ? window.IntelligentVsmStudioService.loadState() : null;
    const dataCollectionState = window.ProcessDataCollectionStudioService ? window.ProcessDataCollectionStudioService.loadState() : null;
    const leanState = window.LeanConsultantService ? window.LeanConsultantService.loadState() : null;
    const tocState = window.TocConsultantService ? window.TocConsultantService.loadState() : null;

    return {
      businessKnowledgePackage: businessState && businessState.package ? businessState.package : null,
      processState,
      operationalDataState: dataCollectionState,
      vsmState,
      transformationObservationPackage: workshopState ? workshopState.packageData : null,
      leanAssessmentPackage: leanState ? leanState.assessmentPackage : null,
      tocAssessmentPackage: tocState ? tocState.assessmentPackage : null,
      knowledgePackage: contextState && contextState.result ? contextState.result.knowledgePackage : null,
      contextGraph: contextState && contextState.result ? contextState.result.contextGraph : null
    };
  },

  loadProcessState() {
    if (window.IntelligentVsmStudioService) {
      const state = window.IntelligentVsmStudioService.loadProcessState();
      window.IntelligentVsmStudioService.ensureVsmData(state);
      return state;
    }

    if (window.ProcessDataCollectionStudioService) {
      const state = window.ProcessDataCollectionStudioService.loadProcessState();
      window.ProcessDataCollectionStudioService.ensureOperationalData(state);
      return state;
    }

    return window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : { draftProcessModel: null };
  },

  runAssessment(state) {
    state.sources = this.loadSources();
    const model = state.sources.processState.draftProcessModel;
    const activities = model && model.activities ? model.activities : [];
    const context = this.buildProcessContext(activities, model);
    const activityOpportunities = activities.map((activity) => this.assessActivity(activity, state.sources, context));
    const consolidatedOpportunities = this.buildConsolidatedOpportunities(activityOpportunities);
    const benefits = this.buildExpectedBenefits(activityOpportunities);
    const risks = this.buildRisks(activityOpportunities);
    const evidenceUsed = this.buildEvidenceIndex(activityOpportunities);
    const questions = this.buildQuestions({ activityOpportunities }, state.sources);
    const summary = this.buildSummary(activityOpportunities, consolidatedOpportunities, benefits, risks, questions);

    state.opportunityPackage = {
      automationAiOpportunityPackageId: `AAI-${Date.now()}`,
      packageType: "AUTOMATION_AI_OPPORTUNITY_PACKAGE",
      methodology: "AUTOMATION_AI_TRANSFORMATION_CONSULTANT",
      status: questions.some((question) => question.blocksConsolidation) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
      version: 1,
      processModelId: model ? model.processModelId : "",
      knowledgePackageId: state.sources.knowledgePackage ? state.sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: state.sources.contextGraph ? state.sources.contextGraph.contextGraphId : "",
      sourcePackages: this.resolveSourcePackages(state.sources),
      decisionTrace: this.createPackageDecisionTrace(activityOpportunities, questions),
      executiveSummary: this.buildExecutiveSummary(summary),
      activityOpportunities,
      consolidatedOpportunities,
      expectedBenefits: benefits,
      complexity: this.resolvePackageComplexity(activityOpportunities),
      risks,
      evidenceUsed,
      questions,
      summary,
      confidence: summary.averageConfidence,
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER"
    };
    state.questions = questions;
    this.addChat(state, "consultant", `Automation & AI Opportunity Package generado: ${consolidatedOpportunities.length} oportunidades, ${risks.length} riesgos y ${questions.length} preguntas pendientes.`);
    this.saveState(state);
  },

  assessActivity(activity, sources, context) {
    const evidence = this.collectActivityEvidence(activity, sources);
    const metrics = this.calculateActivityMetrics(activity);
    const signals = this.collectSignals(activity, evidence, metrics, sources);
    const automationPotential = this.evaluateAutomationPotential(activity, evidence, metrics, signals);
    const aiOpportunities = this.evaluateAiOpportunities(activity, evidence, metrics, signals);
    const requirements = this.identifyRequirements(activity, aiOpportunities, automationPotential);
    const expectedBenefits = this.estimateBenefits(activity, automationPotential, aiOpportunities, metrics);
    const complexity = this.evaluateComplexity(activity, requirements, aiOpportunities, automationPotential);
    const quickWins = this.identifyQuickWins(activity, automationPotential, aiOpportunities, complexity);
    const risks = this.identifyActivityRisks(activity, requirements, aiOpportunities, complexity);
    const questions = this.buildActivityQuestions(activity, evidence, metrics, automationPotential, aiOpportunities, requirements);
    const decisionTrace = this.createActivityDecisionTrace(activity, evidence, automationPotential, aiOpportunities, questions);
    const confidence = this.resolveActivityConfidence(evidence, automationPotential, aiOpportunities, questions);

    return {
      automationAiActivityOpportunityId: `AAIA-${activity.activityUUID || Date.now()}`,
      activityUUID: activity.activityUUID,
      activityId: activity.activityId,
      sequence: activity.sequence,
      activityName: activity.name,
      responsible: activity.responsible || "",
      area: activity.area || "",
      metrics,
      automationPotential,
      aiOpportunities,
      requirements,
      expectedBenefits,
      complexity,
      quickWins,
      risks,
      questions,
      evidence,
      decisionTrace,
      confidence,
      createdAt: new Date().toISOString()
    };
  },

  buildProcessContext(activities, model) {
    const relationships = model && model.relationships ? model.relationships : [];

    return {
      relationships,
      systemCount: this.unique(activities.flatMap((activity) => this.asArray(activity.systems))).length,
      documentCount: this.unique(activities.flatMap((activity) => this.asArray(activity.documents))).length
    };
  },

  calculateActivityMetrics(activity) {
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const processTime = this.expectedTriangular(vsm.processTimeMin || (operational.time && operational.time.min), vsm.processTimeLikely || (operational.time && operational.time.likely), vsm.processTimeMax || (operational.time && operational.time.max));
    const waitTime = Number(vsm.waitTime || (operational.waits && operational.waits.waitTime)) || 0;
    const frequency = this.resolveFrequency(vsm, operational);
    const volume = Number(operational.volume && operational.volume.quantityProcessed) || 0;

    return {
      processTime,
      waitTime,
      leadTimeContribution: processTime + waitTime,
      frequency,
      volume,
      annualExecutions: Math.round(frequency * 250),
      hasTimeData: processTime > 0 || waitTime > 0,
      hasFrequencyData: frequency > 0,
      hasVolumeData: volume > 0
    };
  },

  collectSignals(activity, evidence, metrics, sources) {
    const operational = activity.operationalData || {};
    const text = this.normalizeText([
      activity.name,
      activity.description,
      this.asArray(activity.systems).join(" "),
      this.asArray(activity.documents).join(" "),
      this.asArray(activity.rules).join(" "),
      operational.waits && operational.waits.reason,
      operational.risks && operational.risks.frequentErrors,
      operational.risks && operational.risks.rework,
      evidence.map((item) => item.fragment).join(" ")
    ].filter(Boolean).join(" "));
    const signals = [];

    if (metrics.frequency >= 10 || metrics.annualExecutions >= 2000) {
      signals.push(this.signal("HIGH_FREQUENCY", "La actividad tiene frecuencia suficiente para evaluar automatizacion.", "MEDIUM_CONFIDENCE"));
    }

    if (this.containsAny(text, ["manual", "excel", "copiar", "pegar", "registrar", "capturar", "digitar", "transcribir", "repetitivo"])) {
      signals.push(this.signal("MANUAL_REPETITIVE", "Existe evidencia de tarea manual o repetitiva.", "MEDIUM_CONFIDENCE"));
    }

    if (this.containsAny(text, ["validar", "aprobacion", "regla", "politica", "control", "verificar"])) {
      signals.push(this.signal("RULE_BASED", "La actividad contiene reglas, validaciones o controles.", "MEDIUM_CONFIDENCE"));
    }

    if (this.containsAny(text, ["documento", "pdf", "factura", "orden", "formulario", "correo", "adjunto", "archivo"])) {
      signals.push(this.signal("DOCUMENT_INTENSIVE", "La actividad consume o produce documentos.", "MEDIUM_CONFIDENCE"));
    }

    if (this.containsAny(text, ["clasificar", "categoria", "priorizar", "segmentar", "tipo"])) {
      signals.push(this.signal("CLASSIFICATION", "Existe evidencia de clasificacion o priorizacion.", "MEDIUM_CONFIDENCE"));
    }

    if (this.containsAny(text, ["predecir", "forecast", "demanda", "riesgo", "probabilidad", "estimacion", "tendencia"])) {
      signals.push(this.signal("PREDICTION", "Existe evidencia de decision predictiva o estimativa.", "LOW_CONFIDENCE"));
    }

    if (this.containsAny(text, ["foto", "imagen", "camara", "inspeccion visual", "fotografia"])) {
      signals.push(this.signal("VISION", "Existe evidencia de informacion visual.", "LOW_CONFIDENCE"));
    }

    if (this.containsAny(text, ["correo", "cliente", "consulta", "pregunta", "ticket", "solicitud"])) {
      signals.push(this.signal("CONVERSATIONAL", "Existe interaccion textual o solicitud de usuario.", "MEDIUM_CONFIDENCE"));
    }

    if (sources.leanAssessmentPackage && this.findLeanAssessment(activity.activityUUID, sources)) {
      signals.push(this.signal("LEAN_WASTE", "Lean Assessment Package contiene hallazgos asociados a la actividad.", "MEDIUM_CONFIDENCE"));
    }

    if (sources.tocAssessmentPackage && this.findTocAssessment(activity.activityUUID, sources)) {
      signals.push(this.signal("TOC_CONSTRAINT", "TOC Assessment Package contiene restricciones o cuellos asociados a la actividad.", "MEDIUM_CONFIDENCE"));
    }

    return signals;
  },

  evaluateAutomationPotential(activity, evidence, metrics, signals) {
    const hasEvidence = evidence.length > 0;
    const manual = this.hasSignal(signals, "MANUAL_REPETITIVE");
    const rules = this.hasSignal(signals, "RULE_BASED");
    const highFrequency = this.hasSignal(signals, "HIGH_FREQUENCY");
    const systems = this.asArray(activity.systems).filter(Boolean);
    const documents = this.asArray(activity.documents).filter(Boolean);

    if (!hasEvidence) {
      return {
        classification: "INSUFFICIENT_INFORMATION",
        label: "Evidencia insuficiente",
        rationale: "No existe evidencia suficiente para clasificar el potencial de automatizacion.",
        evidence: [],
        confidence: "INSUFFICIENT_INFORMATION"
      };
    }

    if ((manual && rules && highFrequency && systems.length) || (manual && documents.length && highFrequency)) {
      return {
        classification: "FULLY_AUTOMATABLE",
        label: this.automationLevels.FULL,
        rationale: "La actividad combina repeticion, reglas o documentos y frecuencia suficiente; podria automatizarse ampliamente si existen integraciones disponibles.",
        evidence: signals.filter((signal) => ["MANUAL_REPETITIVE", "RULE_BASED", "HIGH_FREQUENCY", "DOCUMENT_INTENSIVE"].includes(signal.type)),
        confidence: this.resolveConfidenceFromEvidence(evidence, "MEDIUM_CONFIDENCE")
      };
    }

    if (manual || rules || documents.length || systems.length > 1) {
      return {
        classification: "PARTIALLY_AUTOMATABLE",
        label: this.automationLevels.PARTIAL,
        rationale: "Existe evidencia de pasos manuales, reglas, documentos o sistemas que pueden automatizarse parcialmente.",
        evidence: signals.filter((signal) => ["MANUAL_REPETITIVE", "RULE_BASED", "DOCUMENT_INTENSIVE"].includes(signal.type)),
        confidence: this.resolveConfidenceFromEvidence(evidence, "MEDIUM_CONFIDENCE")
      };
    }

    return {
      classification: "NOT_AUTOMATABLE",
      label: this.automationLevels.NONE,
      rationale: "No se encontro evidencia suficiente de repeticion, reglas, documentos o integraciones que justifiquen automatizacion.",
      evidence: evidence.slice(0, 3),
      confidence: "LOW_CONFIDENCE"
    };
  },

  evaluateAiOpportunities(activity, evidence, metrics, signals) {
    const opportunities = [];
    const add = (type, description, requiredSignals, confidence) => {
      const matchedSignals = signals.filter((signal) => requiredSignals.includes(signal.type));
      if (!matchedSignals.length) {
        return;
      }

      opportunities.push({
        aiOpportunityType: type,
        description,
        evidence: matchedSignals,
        confidence: this.resolveConfidenceFromEvidence(evidence, confidence),
        requirements: this.aiRequirements(type),
        expectedUse: this.aiExpectedUse(type)
      });
    };

    add("OCR", "Digitalizar lectura de documentos o formularios asociados a la actividad.", ["DOCUMENT_INTENSIVE"], "MEDIUM_CONFIDENCE");
    add("Clasificacion automatica", "Clasificar solicitudes, documentos o casos por tipo, prioridad o categoria.", ["CLASSIFICATION", "CONVERSATIONAL", "DOCUMENT_INTENSIVE"], "MEDIUM_CONFIDENCE");
    add("Extraccion documental", "Extraer campos clave desde documentos, correos o adjuntos.", ["DOCUMENT_INTENSIVE"], "MEDIUM_CONFIDENCE");
    add("Generacion de contenido", "Generar borradores de respuestas, reportes o comunicaciones.", ["CONVERSATIONAL", "DOCUMENT_INTENSIVE"], "LOW_CONFIDENCE");
    add("Asistentes inteligentes", "Guiar al usuario durante la ejecucion de la actividad con contexto del proceso.", ["CONVERSATIONAL", "RULE_BASED"], "MEDIUM_CONFIDENCE");
    add("Prediccion", "Estimar riesgo, demanda, prioridad o probabilidad de excepcion.", ["PREDICTION"], "LOW_CONFIDENCE");
    add("Recomendacion", "Sugerir siguiente accion con base en reglas, historico o patrones.", ["RULE_BASED", "PREDICTION", "TOC_CONSTRAINT"], "LOW_CONFIDENCE");
    add("Deteccion de anomalias", "Identificar casos atipicos, errores o desviaciones operativas.", ["LEAN_WASTE", "TOC_CONSTRAINT", "RULE_BASED"], "LOW_CONFIDENCE");
    add("Vision artificial", "Interpretar imagenes, fotografias o inspecciones visuales.", ["VISION"], "LOW_CONFIDENCE");
    add("IA conversacional", "Atender consultas o solicitudes relacionadas con la actividad.", ["CONVERSATIONAL"], "MEDIUM_CONFIDENCE");

    return opportunities;
  },

  identifyRequirements(activity, aiOpportunities, automationPotential) {
    const systems = this.asArray(activity.systems).filter(Boolean);
    const documents = this.asArray(activity.documents).filter(Boolean);
    const integrations = systems.length ? systems.map((system) => `Integracion o acceso controlado con ${system}.`) : [];
    const dataRequired = [
      automationPotential.classification !== "NOT_AUTOMATABLE" ? "Datos historicos de ejecucion de la actividad." : "",
      documents.length ? "Documentos fuente estructurados o digitalizados." : "",
      aiOpportunities.length ? "Dataset de ejemplos validados por usuarios expertos." : ""
    ].filter(Boolean);

    return {
      dataRequired,
      integrationsNeeded: integrations,
      involvedSystems: systems,
      technicalRisks: this.buildTechnicalRisks(systems, documents, aiOpportunities, automationPotential)
    };
  },

  estimateBenefits(activity, automationPotential, aiOpportunities, metrics) {
    const hasData = metrics.hasTimeData && metrics.hasFrequencyData;
    const automationFactor = automationPotential.classification === "FULLY_AUTOMATABLE" ? 0.45 : automationPotential.classification === "PARTIALLY_AUTOMATABLE" ? 0.25 : 0;
    const aiFactor = aiOpportunities.length ? Math.min(0.25, aiOpportunities.length * 0.05) : 0;
    const factor = automationFactor + aiFactor;
    const annualMinutes = metrics.processTime * metrics.annualExecutions;

    if (!hasData || !factor) {
      return {
        timeReduction: "No estimable con la informacion disponible.",
        reworkReduction: aiOpportunities.some((item) => item.aiOpportunityType === "Deteccion de anomalias") ? "Potencial cualitativo de reduccion de errores." : "No estimable.",
        errorReduction: aiOpportunities.length ? "Potencial cualitativo pendiente de datos de errores." : "No estimable.",
        productivityIncrease: "No estimable.",
        traceabilityImprovement: automationPotential.classification !== "NOT_AUTOMATABLE" ? "Mejora potencial si la automatizacion registra eventos y evidencias." : "No estimable.",
        estimationAvailable: false,
        limitations: ["Faltan datos completos de tiempo, frecuencia, errores o retrabajos para cuantificar beneficios."]
      };
    }

    const savedMinutes = Math.round(annualMinutes * factor);

    return {
      timeReduction: `${savedMinutes} minutos anuales estimados sobre ${Math.round(annualMinutes)} minutos base.`,
      reworkReduction: aiOpportunities.some((item) => item.aiOpportunityType === "Deteccion de anomalias") ? "Reduccion potencial de retrabajos si se captura historico de defectos." : "No estimada.",
      errorReduction: aiOpportunities.length ? "Reduccion potencial de errores por validacion automatica o IA asistida." : "No estimada.",
      productivityIncrease: `Liberacion estimada equivalente a ${Math.round(savedMinutes / 60)} horas anuales.`,
      traceabilityImprovement: "Mayor trazabilidad por registro automatico de datos, reglas y decisiones.",
      estimationAvailable: true,
      limitations: []
    };
  },

  evaluateComplexity(activity, requirements, aiOpportunities, automationPotential) {
    let score = 0;
    score += requirements.integrationsNeeded.length * 20;
    score += aiOpportunities.length * 12;
    score += automationPotential.classification === "FULLY_AUTOMATABLE" ? 20 : 10;

    if (aiOpportunities.some((item) => ["Prediccion", "Vision artificial", "Deteccion de anomalias"].includes(item.aiOpportunityType))) {
      score += 25;
    }

    if (!requirements.integrationsNeeded.length && aiOpportunities.length <= 1) {
      score -= 10;
    }

    if (score >= 65) {
      return { level: "Alta", rationale: "Requiere multiples integraciones, datos historicos o capacidades IA avanzadas.", score };
    }

    if (score >= 35) {
      return { level: "Media", rationale: "Requiere integracion o configuracion controlada, pero el alcance puede modularizarse.", score };
    }

    return { level: "Baja", rationale: "Puede abordarse con automatizacion simple, reglas o asistencia digital de bajo alcance.", score: Math.max(score, 5) };
  },

  identifyQuickWins(activity, automationPotential, aiOpportunities, complexity) {
    const quickWins = [];

    if (automationPotential.classification === "PARTIALLY_AUTOMATABLE" && complexity.level !== "Alta") {
      quickWins.push({
        quickWinId: `QW-${activity.activityUUID}-AUTO`,
        activityUUID: activity.activityUUID,
        activityName: activity.name,
        description: "Automatizar captura, validacion o traspaso de datos repetitivos en la actividad.",
        benefit: "Reducir tiempo manual y errores de transcripcion.",
        effort: complexity.level,
        confidence: automationPotential.confidence,
        evidence: automationPotential.evidence
      });
    }

    aiOpportunities.filter((item) => ["OCR", "Extraccion documental", "Asistentes inteligentes", "IA conversacional"].includes(item.aiOpportunityType)).slice(0, 2).forEach((item) => {
      quickWins.push({
        quickWinId: `QW-${activity.activityUUID}-${item.aiOpportunityType.replace(/\s/g, "_").toUpperCase()}`,
        activityUUID: activity.activityUUID,
        activityName: activity.name,
        description: `Piloto de ${item.aiOpportunityType} para asistir la actividad.`,
        benefit: item.expectedUse,
        effort: complexity.level === "Alta" ? "Media" : complexity.level,
        confidence: item.confidence,
        evidence: item.evidence
      });
    });

    return quickWins;
  },

  identifyActivityRisks(activity, requirements, aiOpportunities, complexity) {
    const risks = [...requirements.technicalRisks];

    if (complexity.level === "Alta") {
      risks.push("Complejidad alta por integraciones, datos o capacidades IA avanzadas.");
    }

    if (aiOpportunities.length && !requirements.dataRequired.length) {
      risks.push("Oportunidad IA sin dataset definido para validacion.");
    }

    return this.unique(risks).map((risk) => ({
      activityUUID: activity.activityUUID,
      activityName: activity.name,
      risk,
      severity: complexity.level === "Alta" ? "Alta" : "Media"
    }));
  },

  buildActivityQuestions(activity, evidence, metrics, automationPotential, aiOpportunities, requirements) {
    const questions = [];
    const add = (question, reason, priority, blocksConsolidation) => {
      questions.push({
        questionId: `AAIQ-${activity.activityUUID || Date.now()}-${questions.length + 1}`,
        activityUUID: activity.activityUUID,
        activityName: activity.name,
        question,
        reason,
        priority,
        status: "OPEN",
        blocksConsolidation
      });
    };

    if (!evidence.length) {
      add("Que evidencia confirma como se ejecuta esta actividad y que sistemas o documentos utiliza?", "Sin evidencia no se debe concluir una oportunidad de automatizacion o IA.", "Alta", true);
    }

    if (!metrics.hasTimeData || !metrics.hasFrequencyData) {
      add("Cual es el tiempo y frecuencia real de ejecucion de esta actividad?", "Los beneficios esperados no pueden cuantificarse sin tiempos y frecuencia.", "Alta", false);
    }

    if ((automationPotential.classification === "FULLY_AUTOMATABLE" || automationPotential.classification === "PARTIALLY_AUTOMATABLE") && !requirements.integrationsNeeded.length) {
      add("Que sistemas deben integrarse o que datos deben intercambiarse para automatizar esta actividad?", "La automatizacion requiere conocer integraciones y fuentes de datos.", "Media", false);
    }

    if (aiOpportunities.length && !requirements.dataRequired.length) {
      add("Existe historico, documentos etiquetados o ejemplos validados para entrenar o configurar la solucion IA?", "Las oportunidades IA requieren datos de referencia y validacion humana.", "Alta", false);
    }

    return questions;
  },

  buildConsolidatedOpportunities(activityOpportunities) {
    return activityOpportunities.flatMap((assessment) => {
      const automation = assessment.automationPotential.classification !== "NOT_AUTOMATABLE" && assessment.automationPotential.classification !== "INSUFFICIENT_INFORMATION" ? [{
        opportunityId: `AAIO-${assessment.activityUUID}-AUTOMATION`,
        category: "Automatizacion",
        activityUUID: assessment.activityUUID,
        activityName: assessment.activityName,
        description: assessment.automationPotential.rationale,
        benefit: assessment.expectedBenefits.productivityIncrease,
        complexity: assessment.complexity.level,
        confidence: assessment.automationPotential.confidence,
        evidence: assessment.automationPotential.evidence
      }] : [];
      const ai = assessment.aiOpportunities.map((item) => ({
        opportunityId: `AAIO-${assessment.activityUUID}-${item.aiOpportunityType.replace(/\s/g, "_").toUpperCase()}`,
        category: "IA",
        activityUUID: assessment.activityUUID,
        activityName: assessment.activityName,
        description: item.description,
        benefit: item.expectedUse,
        complexity: assessment.complexity.level,
        confidence: item.confidence,
        evidence: item.evidence
      }));

      return automation.concat(ai);
    });
  },

  buildExpectedBenefits(activityOpportunities) {
    return {
      timeReduction: activityOpportunities.filter((item) => item.expectedBenefits.estimationAvailable).map((item) => ({
        activityName: item.activityName,
        value: item.expectedBenefits.timeReduction
      })),
      reworkReduction: activityOpportunities.map((item) => ({
        activityName: item.activityName,
        value: item.expectedBenefits.reworkReduction
      })).filter((item) => item.value !== "No estimable."),
      errorReduction: activityOpportunities.map((item) => ({
        activityName: item.activityName,
        value: item.expectedBenefits.errorReduction
      })).filter((item) => item.value !== "No estimable."),
      productivityIncrease: activityOpportunities.filter((item) => item.expectedBenefits.estimationAvailable).map((item) => ({
        activityName: item.activityName,
        value: item.expectedBenefits.productivityIncrease
      })),
      traceabilityImprovement: activityOpportunities.map((item) => ({
        activityName: item.activityName,
        value: item.expectedBenefits.traceabilityImprovement
      })).filter((item) => item.value !== "No estimable.")
    };
  },

  buildRisks(activityOpportunities) {
    return activityOpportunities.flatMap((item) => item.risks);
  },

  buildSummary(activityOpportunities, consolidatedOpportunities, benefits, risks, questions) {
    const activitiesWithAutomation = activityOpportunities.filter((item) => item.automationPotential.classification === "FULLY_AUTOMATABLE" || item.automationPotential.classification === "PARTIALLY_AUTOMATABLE").length;
    const activitiesWithAi = activityOpportunities.filter((item) => item.aiOpportunities.length).length;
    const quickWins = activityOpportunities.reduce((total, item) => total + item.quickWins.length, 0);
    const confidenceScores = activityOpportunities.map((item) => this.confidenceScore(item.confidence));
    const averageConfidence = this.confidenceFromScore(this.average(confidenceScores));

    return {
      totalActivities: activityOpportunities.length,
      activitiesWithAutomation,
      activitiesWithAi,
      consolidatedOpportunities: consolidatedOpportunities.length,
      quickWins,
      benefitsEstimated: benefits.timeReduction.length,
      risks: risks.length,
      pendingQuestions: questions.length,
      averageConfidence
    };
  },

  buildExecutiveSummary(summary) {
    if (!summary.totalActivities) {
      return "No existe Process Model para evaluar oportunidades de automatizacion e IA.";
    }

    return `Se evaluaron ${summary.totalActivities} actividades. Se identificaron ${summary.activitiesWithAutomation} actividades con potencial de automatizacion, ${summary.activitiesWithAi} con potencial IA, ${summary.quickWins} Quick Wins digitales y ${summary.pendingQuestions} preguntas pendientes. Confianza consolidada: ${summary.averageConfidence}.`;
  },

  buildQuestions(packageData, sources) {
    const questions = [];

    if (!sources.processState || !sources.processState.draftProcessModel) {
      questions.push({
        questionId: "AAIQ-PROCESS-MODEL",
        question: "Existe un Process Model validado para evaluar automatizacion e IA?",
        reason: "El consultor necesita actividades existentes; no crea procesos ni actividades.",
        priority: "Alta",
        status: "OPEN",
        blocksConsolidation: true
      });
    }

    if (!sources.leanAssessmentPackage) {
      questions.push({
        questionId: "AAIQ-LEAN",
        question: "Existe un Lean Assessment Package vigente para conocer desperdicios y retrabajos?",
        reason: "Lean aporta evidencia para oportunidades digitales orientadas a eliminar desperdicio.",
        priority: "Media",
        status: "OPEN",
        blocksConsolidation: false
      });
    }

    if (!sources.tocAssessmentPackage) {
      questions.push({
        questionId: "AAIQ-TOC",
        question: "Existe un TOC Assessment Package vigente para conocer restricciones y cuellos de botella?",
        reason: "TOC ayuda a priorizar oportunidades digitales sobre restricciones reales.",
        priority: "Media",
        status: "OPEN",
        blocksConsolidation: false
      });
    }

    if (packageData && packageData.activityOpportunities) {
      packageData.activityOpportunities.forEach((assessment) => {
        assessment.questions.forEach((question) => questions.push(question));
      });
    }

    return questions;
  },

  buildEvidenceIndex(activityOpportunities) {
    return activityOpportunities.flatMap((item) => item.evidence.map((evidence) => ({
      activityUUID: item.activityUUID,
      activityName: item.activityName,
      ...evidence
    })));
  },

  resolvePackageComplexity(activityOpportunities) {
    const high = activityOpportunities.filter((item) => item.complexity.level === "Alta").length;
    const medium = activityOpportunities.filter((item) => item.complexity.level === "Media").length;

    if (high) {
      return "Alta";
    }

    if (medium) {
      return "Media";
    }

    return activityOpportunities.length ? "Baja" : "No determinada";
  },

  createPackageDecisionTrace(activityOpportunities, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "AUTOMATION_AI_OPPORTUNITY_PACKAGE",
      subjectId: `AAIP-${Date.now()}`,
      consultant: "Automation & AI Transformation Consultant",
      evidence: activityOpportunities.flatMap((item) => item.evidence),
      assumptions: [],
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: "Se comprendio el proceso actual, datos operativos, VSM, taller, Lean y TOC disponibles." },
        VALIDATE: { output: "Se valido evidencia por actividad antes de clasificar oportunidades." },
        DIAGNOSE: { output: "Se identificaron senales de repeticion, reglas, documentos, sistemas, restricciones y desperdicios." },
        QUANTIFY: { output: "Se estimaron beneficios solo cuando existen tiempos y frecuencia." },
        PROPOSE: { output: "Se propusieron oportunidades de automatizacion e IA con evidencia." },
        JUSTIFY: { output: "Cada oportunidad mantiene evidencia, confianza y requisitos." },
        ESTIMATE: { output: "Complejidad y beneficios esperados fueron estimados con informacion disponible." },
        WARN: { output: "Riesgos tecnicos e incertidumbre quedaron registrados." },
        ASK: { output: questions.length ? "Existen preguntas pendientes." : "Sin preguntas pendientes." }
      }
    });
  },

  createActivityDecisionTrace(activity, evidence, automationPotential, aiOpportunities, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "ACTIVITY_AUTOMATION_AI_OPPORTUNITY",
      subjectId: activity.activityUUID,
      consultant: "Automation & AI Transformation Consultant",
      evidence,
      assumptions: [],
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: activity.description || activity.name || "" },
        VALIDATE: { output: evidence.length ? "Evidencia disponible." : "Evidencia insuficiente." },
        DIAGNOSE: { output: automationPotential.rationale },
        QUANTIFY: { output: "Beneficio evaluado con tiempos, frecuencia, volumen y evidencia disponible." },
        PROPOSE: { output: `${automationPotential.label}. ${aiOpportunities.length} oportunidad(es) IA.` },
        JUSTIFY: { output: automationPotential.rationale },
        ESTIMATE: { output: "Complejidad y beneficios evaluados con informacion disponible." },
        WARN: { output: "Riesgos tecnicos e incertidumbre registrados." },
        ASK: { output: questions.length ? "Existen preguntas abiertas." : "Sin preguntas abiertas." }
      }
    });
  },

  resolveSourcePackages(sources) {
    return {
      businessKnowledgePackageId: sources.businessKnowledgePackage ? sources.businessKnowledgePackage.businessKnowledgePackageId : "",
      knowledgePackageId: sources.knowledgePackage ? sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: sources.contextGraph ? sources.contextGraph.contextGraphId : "",
      processModelId: sources.processState.draftProcessModel ? sources.processState.draftProcessModel.processModelId : "",
      transformationObservationPackageId: sources.transformationObservationPackage ? sources.transformationObservationPackage.transformationObservationPackageId : "",
      leanAssessmentPackageId: sources.leanAssessmentPackage ? sources.leanAssessmentPackage.leanAssessmentPackageId : "",
      tocAssessmentPackageId: sources.tocAssessmentPackage ? sources.tocAssessmentPackage.tocAssessmentPackageId : "",
      vsmAvailable: Boolean(sources.vsmState && sources.vsmState.metrics),
      operationalDataAvailable: Boolean(sources.operationalDataState && sources.operationalDataState.readiness)
    };
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.opportunityPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.automationAiOpportunityPackage = state.opportunityPackage;
    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(state) {
    if (!window.ContextBuilderService || !state.opportunityPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    state.opportunityPackage.activityOpportunities.forEach((assessment) => {
      const nodeId = assessment.automationAiActivityOpportunityId;
      graph.nodes.push({
        id: nodeId,
        type: "AUTOMATION_AI_OPPORTUNITY",
        label: `${assessment.activityName} / ${assessment.automationPotential.label}`
      });
      graph.edges.push({ from: assessment.activityUUID, to: nodeId, type: "HAS_AUTOMATION_AI_OPPORTUNITY" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  collectActivityEvidence(activity, sources) {
    const evidence = [];
    const add = (category, sourceType, sourceName, fragment, confidence) => {
      if (!fragment) {
        return;
      }

      evidence.push({
        evidenceId: `AAIE-${activity.activityUUID || Date.now()}-${evidence.length + 1}`,
        category,
        sourceType,
        sourceName: sourceName || "Fuente no especificada",
        fragment: String(fragment),
        confidence: confidence || "MEDIUM_CONFIDENCE",
        date: new Date().toISOString()
      });
    };
    const operational = activity.operationalData || {};
    const observations = this.activityObservations(activity.activityUUID, sources);
    const leanAssessment = this.findLeanAssessment(activity.activityUUID, sources);
    const tocAssessment = this.findTocAssessment(activity.activityUUID, sources);

    (activity.evidence || []).forEach((item) => add("PROCESS_EVIDENCE", item.sourceType || "EVIDENCE", item.sourceName || item.evidenceId, item.fragment || item.sourceName, item.confidence));
    add("SYSTEMS", "PROCESS_MODEL", "Process Model", this.asArray(activity.systems).join(", "), "MEDIUM_CONFIDENCE");
    add("DOCUMENTS", "PROCESS_MODEL", "Process Model", this.asArray(activity.documents).join(", "), "MEDIUM_CONFIDENCE");
    add("RULES", "PROCESS_MODEL", "Process Model", this.asArray(activity.rules).join(", "), "MEDIUM_CONFIDENCE");
    add("TIME", "OPERATIONAL_DATA", "Process Data Collection", this.formatTimeEvidence(activity), "MEDIUM_CONFIDENCE");
    add("WAIT", "OPERATIONAL_DATA", "Process Data Collection", operational.waits && `${operational.waits.waitTime || ""} ${operational.waits.reason || ""}`.trim(), operational.waits && operational.waits.waitTime ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE");
    add("RISKS", "OPERATIONAL_DATA", "Process Data Collection", operational.risks && [operational.risks.operationalRisks, operational.risks.frequentErrors, operational.risks.rework].filter(Boolean).join(" | "), "MEDIUM_CONFIDENCE");
    observations.forEach((observation) => add("WORKSHOP_OBSERVATION", "TRANSFORMATION_OBSERVATION_PACKAGE", observation.type, `${observation.text} ${observation.evidenceNotes || ""}`.trim(), observation.confidence));
    if (leanAssessment) {
      add("LEAN_ASSESSMENT", "LEAN_ASSESSMENT_PACKAGE", leanAssessment.activityName, "Lean Assessment Package contiene hallazgos para la actividad.", leanAssessment.confidence);
    }
    if (tocAssessment) {
      add("TOC_ASSESSMENT", "TOC_ASSESSMENT_PACKAGE", tocAssessment.activityName, "TOC Assessment Package contiene restricciones o cuellos para la actividad.", tocAssessment.confidence);
    }

    return evidence;
  },

  buildTechnicalRisks(systems, documents, aiOpportunities, automationPotential) {
    const risks = [];

    if (systems.length > 1) {
      risks.push("Integracion entre multiples sistemas puede requerir APIs, permisos o validaciones tecnicas.");
    }

    if (documents.length && aiOpportunities.some((item) => ["OCR", "Extraccion documental"].includes(item.aiOpportunityType))) {
      risks.push("Calidad documental puede afectar precision de OCR o extraccion.");
    }

    if (aiOpportunities.some((item) => ["Prediccion", "Deteccion de anomalias", "Vision artificial"].includes(item.aiOpportunityType))) {
      risks.push("Capacidades IA avanzadas requieren historico suficiente y validacion especializada.");
    }

    if (automationPotential.classification === "FULLY_AUTOMATABLE" && !systems.length) {
      risks.push("Automatizacion completa requiere confirmar sistemas o fuente transaccional.");
    }

    return risks;
  },

  activityObservations(activityUUID, sources) {
    const packageData = sources.transformationObservationPackage;
    return packageData && packageData.observations ? packageData.observations.filter((item) => item.activityUUID === activityUUID) : [];
  },

  findLeanAssessment(activityUUID, sources) {
    const packageData = sources.leanAssessmentPackage;
    return packageData && packageData.activityAssessments ? packageData.activityAssessments.find((item) => item.activityUUID === activityUUID) : null;
  },

  findTocAssessment(activityUUID, sources) {
    const packageData = sources.tocAssessmentPackage;
    return packageData && packageData.activityAssessments ? packageData.activityAssessments.find((item) => item.activityUUID === activityUUID) : null;
  },

  signal(type, description, confidence) {
    return { type, description, confidence };
  },

  hasSignal(signals, type) {
    return signals.some((signal) => signal.type === type);
  },

  aiRequirements(type) {
    const base = {
      OCR: ["Documentos escaneados o digitales.", "Muestras validadas de lectura."],
      "Clasificacion automatica": ["Categorias objetivo.", "Casos historicos etiquetados."],
      "Extraccion documental": ["Campos a extraer.", "Plantillas o documentos de referencia."],
      "Generacion de contenido": ["Plantillas de salida.", "Criterios de aprobacion humana."],
      "Asistentes inteligentes": ["Base de conocimiento.", "Reglas y preguntas frecuentes."],
      Prediccion: ["Historico suficiente.", "Variable objetivo definida."],
      Recomendacion: ["Reglas de decision.", "Historico de decisiones."],
      "Deteccion de anomalias": ["Historico normal y casos excepcionales.", "Criterios de alerta."],
      "Vision artificial": ["Imagenes etiquetadas.", "Criterios visuales de evaluacion."],
      "IA conversacional": ["Intenciones frecuentes.", "Politicas de respuesta y escalamiento."]
    };

    return base[type] || [];
  },

  aiExpectedUse(type) {
    const uses = {
      OCR: "Reducir lectura manual y acelerar captura documental.",
      "Clasificacion automatica": "Reducir tiempo de triage y mejorar consistencia.",
      "Extraccion documental": "Reducir digitacion y errores de transcripcion.",
      "Generacion de contenido": "Acelerar preparacion de comunicaciones o reportes.",
      "Asistentes inteligentes": "Guiar la ejecucion y reducir dependencia de conocimiento tacito.",
      Prediccion: "Anticipar riesgos, demanda o prioridades.",
      Recomendacion: "Sugerir decisiones consistentes con reglas y contexto.",
      "Deteccion de anomalias": "Detectar errores, excepciones o desviaciones tempranamente.",
      "Vision artificial": "Analizar evidencia visual o inspecciones.",
      "IA conversacional": "Responder solicitudes y capturar informacion estructurada."
    };

    return uses[type] || "Beneficio pendiente de validar.";
  },

  formatTimeEvidence(activity) {
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const time = operational.time || {};
    const min = vsm.processTimeMin || time.min;
    const likely = vsm.processTimeLikely || time.likely;
    const max = vsm.processTimeMax || time.max;

    if (!min && !likely && !max && !vsm.waitTime && !(operational.waits && operational.waits.waitTime)) {
      return "";
    }

    return `Tiempo triangular min/probable/max: ${min || "NA"} / ${likely || "NA"} / ${max || "NA"}. Espera: ${vsm.waitTime || (operational.waits && operational.waits.waitTime) || "NA"}.`;
  },

  expectedTriangular(min, likely, max) {
    const values = [Number(min), Number(likely), Number(max)].filter((value) => !Number.isNaN(value) && value > 0);

    if (!values.length) {
      return 0;
    }

    return Number(((Number(min) || values[0]) + (4 * (Number(likely) || values[0])) + (Number(max) || values[values.length - 1])) / 6);
  },

  resolveFrequency(vsm, operational) {
    const frequency = operational.frequency || {};
    return Number(vsm.frequencyPerDay || frequency.perDay || 0) ||
      (Number(vsm.frequencyPerWeek || frequency.perWeek || 0) / 5) ||
      (Number(vsm.frequencyPerMonth || frequency.perMonth || 0) / 22) ||
      (Number(vsm.frequencyPerYear || frequency.perYear || 0) / 250) ||
      0;
  },

  resolveConfidenceFromEvidence(evidence, fallback) {
    const score = this.average(evidence.map((item) => this.confidenceScore(item.confidence)));
    return this.confidenceFromScore(score || this.confidenceScore(fallback));
  },

  resolveActivityConfidence(evidence, automationPotential, aiOpportunities, questions) {
    if (questions.some((question) => question.blocksConsolidation)) {
      return "INSUFFICIENT_INFORMATION";
    }

    const score = this.average([
      this.confidenceScore(automationPotential.confidence),
      ...aiOpportunities.map((item) => this.confidenceScore(item.confidence)),
      ...evidence.map((item) => this.confidenceScore(item.confidence))
    ]);

    return this.confidenceFromScore(score);
  },

  confidenceScore(confidence) {
    const scores = {
      HIGH_CONFIDENCE: 95,
      MEDIUM_CONFIDENCE: 72,
      LOW_CONFIDENCE: 42,
      INSUFFICIENT_INFORMATION: 12,
      Alta: 95,
      Media: 72,
      Baja: 42
    };

    return scores[confidence] || 45;
  },

  confidenceFromScore(score) {
    if (score >= 82) {
      return "HIGH_CONFIDENCE";
    }

    if (score >= 60) {
      return "MEDIUM_CONFIDENCE";
    }

    if (score >= 35) {
      return "LOW_CONFIDENCE";
    }

    return "INSUFFICIENT_INFORMATION";
  },

  average(values) {
    const clean = values.filter((value) => Number.isFinite(value));
    return clean.length ? clean.reduce((total, value) => total + value, 0) / clean.length : 0;
  },

  asArray(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

    return String(value).split(",").map((item) => item.trim()).filter(Boolean);
  },

  unique(values) {
    return [...new Set(values.filter(Boolean))];
  },

  normalizeText(value) {
    return String(value || "").toLowerCase();
  },

  containsAny(text, keywords) {
    return keywords.some((keyword) => String(text || "").indexOf(keyword) !== -1);
  },

  addChat(state, author, text) {
    if (!Array.isArray(state.chat)) {
      state.chat = this.createInitialChat();
    }

    state.chat.push({
      messageId: `AAI-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  firstActivityUuid(processState) {
    const activities = processState.draftProcessModel && processState.draftProcessModel.activities ? processState.draftProcessModel.activities : [];
    return activities[0] ? activities[0].activityUUID : "";
  }
});
