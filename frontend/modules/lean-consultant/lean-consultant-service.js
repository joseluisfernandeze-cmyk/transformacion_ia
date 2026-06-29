window.LeanConsultantService = Object.seal({
  storageKey: "operational-intelligence.lean-consultant",

  wastes: [
    { id: "OVERPRODUCTION", label: "Sobreproduccion" },
    { id: "WAITING", label: "Espera" },
    { id: "TRANSPORT", label: "Transporte" },
    { id: "OVERPROCESSING", label: "Sobreproceso" },
    { id: "INVENTORY", label: "Inventario" },
    { id: "MOTION", label: "Movimiento" },
    { id: "DEFECTS_REWORK", label: "Defectos / Retrabajos" },
    { id: "UNUSED_TALENT", label: "Talento desaprovechado" }
  ],

  createState() {
    const sources = this.loadSources();

    return {
      sources,
      selectedActivityUUID: this.firstActivityUuid(sources.processState),
      assessmentPackage: null,
      questions: [],
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `LEAN-${Date.now()}`,
      author: "consultant",
      text: "Estoy listo para ejecutar el diagnostico Lean. Solo usare evidencia del Process Model, datos operativos, VSM, observaciones del taller y paquetes de conocimiento.",
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
      state.assessmentPackage = saved.assessmentPackage || null;
      state.questions = this.buildQuestions(state.assessmentPackage, state.sources);
      state.chat = saved.chat && saved.chat.length ? saved.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.questions = this.buildQuestions(state.assessmentPackage, state.sources);
    state.lastSavedAt = new Date().toISOString();
    this.syncToKnowledgePackage(state);
    this.syncToContextGraph(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedActivityUUID: state.selectedActivityUUID,
      assessmentPackage: state.assessmentPackage,
      questions: state.questions,
      chat: state.chat,
      lastSavedAt: state.lastSavedAt
    }));
  },

  loadSources() {
    const processState = this.loadProcessState();
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
    const workshopState = window.TransformationWorkshopService ? window.TransformationWorkshopService.loadState() : null;
    const vsmState = window.IntelligentVsmStudioService ? window.IntelligentVsmStudioService.loadState() : null;
    const dataCollectionState = window.ProcessDataCollectionStudioService ? window.ProcessDataCollectionStudioService.loadState() : null;

    return {
      processState,
      operationalDataState: dataCollectionState,
      vsmState,
      transformationObservationPackage: workshopState ? workshopState.packageData : null,
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
    const assessments = activities.map((activity) => this.assessActivity(activity, state.sources));
    const quickWins = this.buildQuickWins(assessments);
    const opportunities = this.buildLeanOpportunities(assessments);
    const questions = this.buildQuestions({ activityAssessments: assessments }, state.sources);

    state.assessmentPackage = {
      leanAssessmentPackageId: `LAP-${Date.now()}`,
      packageType: "LEAN_ASSESSMENT_PACKAGE",
      status: questions.some((question) => question.blocksConsolidation) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
      version: 1,
      processModelId: model ? model.processModelId : "",
      knowledgePackageId: state.sources.knowledgePackage ? state.sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: state.sources.contextGraph ? state.sources.contextGraph.contextGraphId : "",
      sourcePackages: this.resolveSourcePackages(state.sources),
      activityAssessments: assessments,
      quickWins,
      opportunities,
      questions,
      summary: this.buildSummary(assessments, quickWins, opportunities),
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER"
    };
    state.questions = questions;
    this.addChat(state, "consultant", `Diagnostico Lean generado: ${assessments.length} actividades, ${quickWins.length} quick wins y ${opportunities.length} oportunidades. Estado: ${state.assessmentPackage.status}.`);
    this.saveState(state);
  },

  assessActivity(activity, sources) {
    const evidence = this.collectActivityEvidence(activity, sources);
    const valueClassification = this.resolveValueClassification(activity, evidence);
    const wasteAssessments = this.wastes.map((waste) => this.evaluateWaste(waste, activity, evidence));
    const confidence = this.resolveActivityConfidence(activity, evidence, valueClassification, wasteAssessments);

    return {
      leanActivityAssessmentId: `LAA-${activity.activityUUID || Date.now()}`,
      activityUUID: activity.activityUUID,
      activityId: activity.activityId,
      sequence: activity.sequence,
      activityName: activity.name,
      responsible: activity.responsible || "",
      area: activity.area || "",
      valueClassification,
      wastes: wasteAssessments,
      evidence,
      confidence,
      questions: this.buildActivityQuestions(activity, evidence, valueClassification, wasteAssessments),
      createdAt: new Date().toISOString()
    };
  },

  resolveValueClassification(activity, evidence) {
    const data = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const declared = vsm.valueClassification || (data.classification && data.classification.valueClassification) || "";
    const classificationEvidence = evidence.filter((item) => item.category === "VALUE_CLASSIFICATION");

    if (declared) {
      return {
        classification: declared,
        justification: `Clasificacion tomada del Process Data Collection / VSM: ${declared}.`,
        evidenceRefs: classificationEvidence.map((item) => item.evidenceId),
        confidence: classificationEvidence.length ? "HIGH_CONFIDENCE" : "MEDIUM_CONFIDENCE"
      };
    }

    return {
      classification: "PENDING",
      justification: "No existe clasificacion VA/NNVA/NVA registrada. El consultor no asume valor agregado sin validacion.",
      evidenceRefs: [],
      confidence: "INSUFFICIENT_INFORMATION"
    };
  },

  evaluateWaste(waste, activity, evidence) {
    const signals = this.collectWasteSignals(waste.id, activity, evidence);
    const severity = this.resolveSeverity(signals);
    const confidence = this.resolveWasteConfidence(signals);

    return {
      wasteId: waste.id,
      wasteName: waste.label,
      detected: signals.length > 0,
      severity,
      impact: this.resolveImpact(waste.id, signals, activity),
      evidence: signals,
      confidence,
      rationale: signals.length ? this.buildWasteRationale(waste.label, signals) : "No hay evidencia suficiente para afirmar este desperdicio."
    };
  },

  collectWasteSignals(wasteId, activity, evidence) {
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const text = this.normalizeText([
      activity.name,
      activity.description,
      operational.waits && operational.waits.reason,
      operational.risks && operational.risks.operationalRisks,
      operational.risks && operational.risks.frequentErrors,
      operational.risks && operational.risks.rework,
      operational.volume && operational.volume.variability,
      evidence.map((item) => item.fragment).join(" ")
    ].filter(Boolean).join(" "));
    const waitTime = Number(vsm.waitTime || (operational.waits && operational.waits.waitTime)) || 0;
    const valueClass = vsm.valueClassification || (operational.classification && operational.classification.valueClassification);
    const signals = [];
    const addSignal = (condition, evidenceId, fragment, strength) => {
      if (condition) {
        signals.push({
          evidenceId,
          sourceType: "LEAN_SIGNAL",
          fragment,
          strength: strength || "MEDIUM"
        });
      }
    };

    if (wasteId === "WAITING") {
      addSignal(waitTime > 0, "VSM-WAIT", `Tiempo de espera registrado: ${waitTime}.`, waitTime > 60 ? "HIGH" : "MEDIUM");
      addSignal(this.containsAny(text, ["espera", "demora", "cola", "pendiente", "bloqueado"]), "TEXT-WAIT", "Texto operativo u observacion menciona espera, demora o cola.", "MEDIUM");
    }

    if (wasteId === "DEFECTS_REWORK") {
      addSignal(this.containsAny(text, ["retrabajo", "reproceso", "corregir", "devolver", "error", "falla", "defecto"]), "TEXT-REWORK", "Evidencia menciona error, defecto, devolucion o retrabajo.", "HIGH");
    }

    if (wasteId === "OVERPROCESSING") {
      addSignal(valueClass === "NVA" || valueClass === "NNVA", "VALUE-CLASS", `Actividad clasificada como ${valueClass || "pendiente"}.`, valueClass === "NVA" ? "HIGH" : "MEDIUM");
      addSignal(this.containsAny(text, ["duplicado", "doble", "manual", "validacion adicional", "revisar nuevamente", "sobreproceso"]), "TEXT-OVERPROCESSING", "Evidencia menciona duplicidad, trabajo manual o revision adicional.", "MEDIUM");
    }

    if (wasteId === "TRANSPORT") {
      addSignal(this.containsAny(text, ["traslad", "transport", "enviar fisico", "mensajeria", "mover documento"]), "TEXT-TRANSPORT", "Evidencia menciona traslado fisico o transferencia innecesaria.", "MEDIUM");
    }

    if (wasteId === "INVENTORY") {
      addSignal(this.containsAny(text, ["inventario", "wip", "acumulado", "pendientes", "lote", "stock"]), "TEXT-INVENTORY", "Evidencia menciona acumulacion, lotes, WIP o pendientes.", "MEDIUM");
    }

    if (wasteId === "MOTION") {
      addSignal(this.containsAny(text, ["buscar", "copiar", "pegar", "capturar varias veces", "moverse", "recorrer"]), "TEXT-MOTION", "Evidencia menciona busqueda, captura repetida o movimientos administrativos.", "MEDIUM");
    }

    if (wasteId === "OVERPRODUCTION") {
      addSignal(this.containsAny(text, ["antes de tiempo", "sin solicitud", "exceso", "mas de lo requerido", "sobreproduccion"]), "TEXT-OVERPRODUCTION", "Evidencia menciona produccion anticipada o exceso.", "MEDIUM");
    }

    if (wasteId === "UNUSED_TALENT") {
      addSignal(this.containsAny(text, ["talento", "criterio experto", "aprobacion innecesaria", "manual repetitivo", "persona calificada"]), "TEXT-TALENT", "Evidencia sugiere talento usado en tareas repetitivas o de bajo valor.", "MEDIUM");
    }

    return signals;
  },

  buildQuickWins(assessments) {
    return assessments.flatMap((assessment) => {
      const quickWins = [];
      const waiting = assessment.wastes.find((waste) => waste.wasteId === "WAITING" && waste.detected);
      const overprocessing = assessment.wastes.find((waste) => waste.wasteId === "OVERPROCESSING" && waste.detected);
      const rework = assessment.wastes.find((waste) => waste.wasteId === "DEFECTS_REWORK" && waste.detected);

      if (waiting && waiting.severity !== "LOW") {
        quickWins.push(this.quickWin(assessment, "Definir regla de priorizacion y SLA visual para reducir esperas visibles.", waiting.evidence));
      }

      if (overprocessing && overprocessing.severity !== "LOW") {
        quickWins.push(this.quickWin(assessment, "Eliminar captura o revision duplicada validando un unico punto de control.", overprocessing.evidence));
      }

      if (rework && rework.severity !== "LOW") {
        quickWins.push(this.quickWin(assessment, "Crear checklist de calidad en el punto de entrada para reducir devoluciones.", rework.evidence));
      }

      return quickWins;
    }).slice(0, 12);
  },

  quickWin(assessment, description, evidence) {
    return {
      quickWinId: `QW-${assessment.activityUUID}-${Math.random().toString(16).slice(2)}`,
      activityUUID: assessment.activityUUID,
      activityName: assessment.activityName,
      description,
      justification: "No requiere desarrollo ni inversion significativa; se puede ejecutar con cambios de regla, visual management o estandarizacion.",
      evidence,
      confidence: evidence && evidence.length ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE"
    };
  },

  buildLeanOpportunities(assessments) {
    return assessments.flatMap((assessment) => {
      const detected = assessment.wastes.filter((waste) => waste.detected);

      return detected.map((waste) => ({
        opportunityId: `LOP-${assessment.activityUUID}-${waste.wasteId}`,
        activityUUID: assessment.activityUUID,
        activityName: assessment.activityName,
        type: "LEAN_IMPROVEMENT",
        wasteType: waste.wasteName,
        description: this.opportunityDescription(waste.wasteId, assessment.activityName),
        problemSolved: waste.rationale,
        expectedBenefit: this.expectedBenefit(waste.wasteId),
        estimatedEffort: this.estimatedEffort(waste.severity),
        evidence: waste.evidence,
        confidence: waste.confidence,
        status: "DRAFT"
      }));
    }).slice(0, 24);
  },

  opportunityDescription(wasteId, activityName) {
    const descriptions = {
      WAITING: `Reducir esperas en "${activityName}" mediante reglas de flujo, priorizacion y escalamiento visual.`,
      DEFECTS_REWORK: `Reducir defectos y retrabajos en "${activityName}" con criterios de entrada y control de calidad temprano.`,
      OVERPROCESSING: `Simplificar "${activityName}" eliminando revisiones, capturas o validaciones que no agregan valor.`,
      TRANSPORT: `Reducir traslados y transferencias innecesarias asociadas a "${activityName}".`,
      INVENTORY: `Disminuir acumulacion de pendientes o lotes antes/despues de "${activityName}".`,
      MOTION: `Reducir busquedas, capturas repetidas y movimientos administrativos en "${activityName}".`,
      OVERPRODUCTION: `Alinear la ejecucion de "${activityName}" con demanda real y criterios de solicitud.`,
      UNUSED_TALENT: `Liberar capacidad experta en "${activityName}" reduciendo trabajo repetitivo o de bajo valor.`
    };

    return descriptions[wasteId] || `Mejorar "${activityName}" con enfoque Lean.`;
  },

  expectedBenefit(wasteId) {
    const benefits = {
      WAITING: "Reduccion de lead time y mejor cumplimiento de SLA.",
      DEFECTS_REWORK: "Menos retrabajo, menos errores y mayor calidad de salida.",
      OVERPROCESSING: "Menor tiempo de proceso y menor carga operativa.",
      TRANSPORT: "Menos transferencias y menor riesgo de perdida de informacion.",
      INVENTORY: "Menos WIP, menor acumulacion y mejor flujo.",
      MOTION: "Menor esfuerzo administrativo y menor tiempo improductivo.",
      OVERPRODUCTION: "Menos trabajo no solicitado y mejor alineacion con demanda.",
      UNUSED_TALENT: "Mejor uso de capacidad experta."
    };

    return benefits[wasteId] || "Mejora operacional esperada.";
  },

  estimatedEffort(severity) {
    if (severity === "HIGH") {
      return "MEDIA";
    }

    return "BAJA";
  },

  buildQuestions(packageData, sources) {
    const model = sources && sources.processState ? sources.processState.draftProcessModel : null;

    if (!model || !model.activities || !model.activities.length) {
      return [this.question("", "No existe Process Model disponible para diagnostico Lean.", "HIGH", true)];
    }

    if (!packageData || !packageData.activityAssessments) {
      return [this.question("", "Ejecuta el diagnostico Lean para generar preguntas basadas en evidencia.", "MEDIUM", false)];
    }

    return packageData.activityAssessments.flatMap((assessment) => assessment.questions || []).slice(0, 20);
  },

  buildActivityQuestions(activity, evidence, valueClassification, wastes) {
    const questions = [];

    if (valueClassification.classification === "PENDING") {
      questions.push(this.question(activity.activityUUID, `Clasifica "${activity.name}" como VA, NNVA o NVA antes de consolidar el diagnostico Lean.`, "HIGH", true));
    }

    if (!evidence.length) {
      questions.push(this.question(activity.activityUUID, `Que evidencia respalda la actividad "${activity.name}"?`, "HIGH", true));
    }

    if (!wastes.some((waste) => waste.detected) && valueClassification.classification === "NVA") {
      questions.push(this.question(activity.activityUUID, `"${activity.name}" esta clasificada como NVA, pero no hay evidencia suficiente del desperdicio especifico. Que problema observable la sustenta?`, "MEDIUM", false));
    }

    return questions;
  },

  question(activityUUID, text, priority, blocksConsolidation) {
    return {
      questionId: `LQ-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      activityUUID,
      question: text,
      priority,
      blocksConsolidation,
      status: "OPEN"
    };
  },

  buildSummary(assessments, quickWins, opportunities) {
    const wasteCounts = this.wastes.reduce((accumulator, waste) => {
      accumulator[waste.id] = assessments.filter((assessment) => assessment.wastes.some((item) => item.wasteId === waste.id && item.detected)).length;
      return accumulator;
    }, {});

    return {
      totalActivities: assessments.length,
      vaActivities: assessments.filter((item) => item.valueClassification.classification === "VA").length,
      nnvaActivities: assessments.filter((item) => item.valueClassification.classification === "NNVA").length,
      nvaActivities: assessments.filter((item) => item.valueClassification.classification === "NVA").length,
      pendingClassification: assessments.filter((item) => item.valueClassification.classification === "PENDING").length,
      detectedWasteCount: assessments.reduce((total, item) => total + item.wastes.filter((waste) => waste.detected).length, 0),
      quickWinCount: quickWins.length,
      opportunityCount: opportunities.length,
      wasteCounts,
      averageConfidence: this.averageConfidence(assessments.map((item) => item.confidence))
    };
  },

  collectActivityEvidence(activity, sources) {
    const evidence = [];
    const add = (category, sourceType, sourceName, fragment, confidence) => {
      if (!fragment) {
        return;
      }

      evidence.push({
        evidenceId: `LEV-${activity.activityUUID}-${evidence.length + 1}`,
        category,
        sourceType,
        sourceName,
        fragment: String(fragment).slice(0, 420),
        confidence: confidence || "MEDIUM_CONFIDENCE",
        date: new Date().toISOString()
      });
    };
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const observations = this.activityObservations(activity.activityUUID, sources);

    add("PROCESS_MODEL", "PROCESS_MODEL", activity.name, activity.description || activity.name, activity.confidence || "LOW_CONFIDENCE");
    (activity.evidence || []).forEach((item) => add("PROCESS_EVIDENCE", item.sourceType || "EVIDENCE", item.sourceName || item.evidenceId, item.fragment || item.sourceName, item.confidence));
    add("VALUE_CLASSIFICATION", "VSM", "Intelligent VSM", vsm.valueClassification || (operational.classification && operational.classification.valueClassification), vsm.valueClassification ? "HIGH_CONFIDENCE" : "LOW_CONFIDENCE");
    add("TIME", "VSM", "Intelligent VSM", this.formatTimeEvidence(vsm, operational), "MEDIUM_CONFIDENCE");
    add("WAIT", "OPERATIONAL_DATA", "Process Data Collection", operational.waits && `${operational.waits.waitTime || ""} ${operational.waits.reason || ""}`.trim(), operational.waits && operational.waits.waitTime ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE");
    add("RISKS", "OPERATIONAL_DATA", "Process Data Collection", operational.risks && [operational.risks.operationalRisks, operational.risks.frequentErrors, operational.risks.rework].filter(Boolean).join(" | "), "MEDIUM_CONFIDENCE");
    observations.forEach((observation) => add("WORKSHOP_OBSERVATION", "TRANSFORMATION_OBSERVATION_PACKAGE", observation.type, `${observation.text} ${observation.evidenceNotes || ""}`.trim(), observation.confidence));

    return evidence;
  },

  formatTimeEvidence(vsm, operational) {
    const time = operational.time || {};
    const min = vsm.processTimeMin || time.min;
    const likely = vsm.processTimeLikely || time.likely;
    const max = vsm.processTimeMax || time.max;

    if (!min && !likely && !max) {
      return "";
    }

    return `Tiempo triangular min/probable/max: ${min || "NA"} / ${likely || "NA"} / ${max || "NA"}.`;
  },

  activityObservations(activityUUID, sources) {
    const packageData = sources.transformationObservationPackage;
    return packageData && packageData.observations ? packageData.observations.filter((item) => item.activityUUID === activityUUID) : [];
  },

  resolveSourcePackages(sources) {
    return {
      processModelId: sources.processState.draftProcessModel ? sources.processState.draftProcessModel.processModelId : "",
      knowledgePackageId: sources.knowledgePackage ? sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: sources.contextGraph ? sources.contextGraph.contextGraphId : "",
      transformationObservationPackageId: sources.transformationObservationPackage ? sources.transformationObservationPackage.transformationObservationPackageId : "",
      vsmAvailable: Boolean(sources.vsmState && sources.vsmState.metrics),
      operationalDataAvailable: Boolean(sources.operationalDataState && sources.operationalDataState.readiness)
    };
  },

  resolveActivityConfidence(activity, evidence, valueClassification, wastes) {
    const scores = evidence.map((item) => this.confidenceScore(item.confidence));
    scores.push(this.confidenceScore(valueClassification.confidence));
    wastes.forEach((waste) => scores.push(this.confidenceScore(waste.confidence)));

    if (!scores.length || valueClassification.classification === "PENDING") {
      return "INSUFFICIENT_INFORMATION";
    }

    const average = scores.reduce((total, score) => total + score, 0) / scores.length;

    if (average >= 82) {
      return "HIGH_CONFIDENCE";
    }

    if (average >= 60) {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  resolveSeverity(signals) {
    if (!signals.length) {
      return "NONE";
    }

    if (signals.some((signal) => signal.strength === "HIGH") || signals.length >= 3) {
      return "HIGH";
    }

    if (signals.length >= 2) {
      return "MEDIUM";
    }

    return "LOW";
  },

  resolveWasteConfidence(signals) {
    if (!signals.length) {
      return "INSUFFICIENT_INFORMATION";
    }

    if (signals.some((signal) => signal.strength === "HIGH") || signals.length >= 2) {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  resolveImpact(wasteId, signals) {
    if (!signals.length) {
      return "Sin impacto comprobado por falta de evidencia.";
    }

    return this.expectedBenefit(wasteId);
  },

  buildWasteRationale(label, signals) {
    return `${label} detectado con ${signals.length} senal(es) de evidencia: ${signals.map((signal) => signal.fragment).join(" | ")}`;
  },

  averageConfidence(confidences) {
    if (!confidences.length) {
      return "INSUFFICIENT_INFORMATION";
    }

    const average = confidences.reduce((total, confidence) => total + this.confidenceScore(confidence), 0) / confidences.length;

    if (average >= 82) {
      return "HIGH_CONFIDENCE";
    }

    if (average >= 60) {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  confidenceScore(confidence) {
    const scores = {
      HIGH_CONFIDENCE: 95,
      MEDIUM_CONFIDENCE: 72,
      LOW_CONFIDENCE: 42,
      INSUFFICIENT_INFORMATION: 12
    };

    return scores[confidence] || 40;
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.assessmentPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.leanAssessmentPackage = state.assessmentPackage;
    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(state) {
    if (!window.ContextBuilderService || !state.assessmentPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    state.assessmentPackage.activityAssessments.forEach((assessment) => {
      const nodeId = assessment.leanActivityAssessmentId;
      graph.nodes.push({
        id: nodeId,
        type: "LEAN_ASSESSMENT",
        label: `${assessment.activityName} / ${assessment.valueClassification.classification}`
      });
      graph.edges.push({ from: assessment.activityUUID, to: nodeId, type: "HAS_LEAN_ASSESSMENT" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  addChat(state, author, text) {
    state.chat.push({
      messageId: `LEAN-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  firstActivityUuid(processState) {
    const activities = processState.draftProcessModel && processState.draftProcessModel.activities ? processState.draftProcessModel.activities : [];
    return activities[0] ? activities[0].activityUUID : "";
  },

  normalizeText(value) {
    return String(value || "").toLowerCase();
  },

  containsAny(text, keywords) {
    return keywords.some((keyword) => String(text || "").indexOf(keyword) !== -1);
  }
});
