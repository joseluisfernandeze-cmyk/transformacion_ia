window.TocConsultantService = Object.seal({
  storageKey: "operational-intelligence.toc-consultant",

  constraintTypes: [
    "PHYSICAL_CONSTRAINT",
    "CAPACITY_CONSTRAINT",
    "POLICY_CONSTRAINT",
    "INFORMATION_CONSTRAINT",
    "TECHNOLOGY_CONSTRAINT",
    "NO_CONSTRAINT_EVIDENCE"
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
      messageId: `TOC-${Date.now()}`,
      author: "consultant",
      text: "Analizare restricciones reales del proceso con enfoque TOC. No asumire cuellos de botella sin evidencia de tiempos, esperas, capacidad, dependencias u observaciones.",
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
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const workshopState = window.TransformationWorkshopService ? window.TransformationWorkshopService.loadState() : null;
    const vsmState = window.IntelligentVsmStudioService ? window.IntelligentVsmStudioService.loadState() : null;
    const dataCollectionState = window.ProcessDataCollectionStudioService ? window.ProcessDataCollectionStudioService.loadState() : null;
    const leanState = window.LeanConsultantService ? window.LeanConsultantService.loadState() : null;

    return {
      businessKnowledgePackage: businessState && businessState.package ? businessState.package : null,
      processState,
      operationalDataState: dataCollectionState,
      vsmState,
      transformationObservationPackage: workshopState ? workshopState.packageData : null,
      leanAssessmentPackage: leanState ? leanState.assessmentPackage : null,
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
    const activityAssessments = activities.map((activity) => this.assessActivity(activity, state.sources, context));
    const constraints = this.buildConstraintIndex(activityAssessments);
    const bottlenecks = this.buildBottlenecks(activityAssessments);
    const criticalDependencies = this.buildCriticalDependencies(activityAssessments);
    const risks = this.buildRisks(activityAssessments);
    const actions = this.buildActions(activityAssessments);
    const questions = this.buildQuestions({ activityAssessments }, state.sources);
    const evidenceUsed = this.buildEvidenceIndex(activityAssessments);
    const summary = this.buildSummary(activityAssessments, constraints, bottlenecks, criticalDependencies, actions, questions);

    state.assessmentPackage = {
      tocAssessmentPackageId: `TOC-${Date.now()}`,
      packageType: "TOC_ASSESSMENT_PACKAGE",
      methodology: "TOC_TRANSFORMATION_CONSULTANT",
      status: questions.some((question) => question.blocksConsolidation) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
      version: 1,
      processModelId: model ? model.processModelId : "",
      knowledgePackageId: state.sources.knowledgePackage ? state.sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: state.sources.contextGraph ? state.sources.contextGraph.contextGraphId : "",
      sourcePackages: this.resolveSourcePackages(state.sources),
      decisionTrace: this.createPackageDecisionTrace(activityAssessments, questions),
      executiveSummary: this.buildExecutiveSummary(summary),
      activityAssessments,
      detectedConstraints: constraints,
      bottlenecks,
      criticalDependencies,
      risks,
      suggestedActions: actions,
      questions,
      evidenceUsed,
      summary,
      confidence: summary.averageConfidence,
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER"
    };
    state.questions = questions;
    this.addChat(state, "consultant", `TOC Assessment Package generado: ${constraints.length} restricciones con evidencia, ${bottlenecks.length} cuellos de botella y ${questions.length} preguntas pendientes.`);
    this.saveState(state);
  },

  assessActivity(activity, sources, context) {
    const evidence = this.collectActivityEvidence(activity, sources);
    const metrics = this.calculateActivityMetrics(activity);
    const dependencies = this.resolveDependencies(activity, context);
    const constraintAnalysis = this.evaluateConstraint(activity, evidence, metrics, dependencies);
    const bottleneckAnalysis = this.evaluateBottleneck(activity, metrics, dependencies, context);
    const impact = this.estimateImpact(constraintAnalysis, bottleneckAnalysis, metrics);
    const suggestedActions = this.suggestTocActions(activity, constraintAnalysis, impact);
    const questions = this.buildActivityQuestions(activity, evidence, constraintAnalysis, bottleneckAnalysis, metrics);
    const decisionTrace = this.createActivityDecisionTrace(activity, evidence, constraintAnalysis, questions);
    const confidence = this.resolveActivityConfidence(evidence, constraintAnalysis, bottleneckAnalysis, questions);

    return {
      tocActivityAssessmentId: `TOCA-${activity.activityUUID || Date.now()}`,
      activityUUID: activity.activityUUID,
      activityId: activity.activityId,
      sequence: activity.sequence,
      activityName: activity.name,
      responsible: activity.responsible || "",
      area: activity.area || "",
      metrics,
      constraintAnalysis,
      bottleneckAnalysis,
      dependencies,
      impact,
      suggestedActions,
      questions,
      evidence,
      decisionTrace,
      confidence,
      createdAt: new Date().toISOString()
    };
  },

  buildProcessContext(activities, model) {
    const metrics = activities.map((activity) => this.calculateActivityMetrics(activity));
    const maxCycleTime = Math.max(...metrics.map((item) => item.cycleTime), 0);
    const maxWaitTime = Math.max(...metrics.map((item) => item.waitTime), 0);
    const relationships = model && model.relationships ? model.relationships : [];

    return {
      maxCycleTime,
      maxWaitTime,
      averageCycleTime: this.average(metrics.map((item) => item.cycleTime)),
      averageWaitTime: this.average(metrics.map((item) => item.waitTime)),
      relationships
    };
  },

  calculateActivityMetrics(activity) {
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const processTime = this.expectedTriangular(vsm.processTimeMin || (operational.time && operational.time.min), vsm.processTimeLikely || (operational.time && operational.time.likely), vsm.processTimeMax || (operational.time && operational.time.max));
    const waitTime = Number(vsm.waitTime || (operational.waits && operational.waits.waitTime)) || 0;
    const frequency = this.resolveFrequency(vsm, operational);
    const volume = Number(operational.volume && operational.volume.quantityProcessed) || 0;
    const utilization = this.estimateUtilization(processTime, waitTime, frequency);

    return {
      cycleTime: processTime,
      waitTime,
      leadTimeContribution: processTime + waitTime,
      frequency,
      volume,
      utilization,
      hasTimeData: processTime > 0 || waitTime > 0,
      hasFrequencyData: frequency > 0
    };
  },

  evaluateConstraint(activity, evidence, metrics, dependencies) {
    const signals = this.collectConstraintSignals(activity, evidence, metrics, dependencies);
    const ranked = signals.slice().sort((left, right) => this.signalWeight(right) - this.signalWeight(left));
    const primary = ranked[0] || null;
    const type = primary ? primary.constraintType : "NO_CONSTRAINT_EVIDENCE";

    return {
      constraintType: type,
      constraintLabel: this.constraintLabel(type),
      exists: type !== "NO_CONSTRAINT_EVIDENCE",
      evidence: signals,
      confidence: this.resolveConstraintConfidence(signals),
      rationale: signals.length ? signals.map((item) => item.fragment).join(" | ") : "No existe evidencia suficiente para afirmar restriccion en esta actividad."
    };
  },

  collectConstraintSignals(activity, evidence, metrics, dependencies) {
    const operational = activity.operationalData || {};
    const text = this.normalizeText([
      activity.name,
      activity.description,
      operational.waits && operational.waits.reason,
      operational.risks && operational.risks.operationalRisks,
      operational.resources && operational.resources.peopleInvolved,
      evidence.map((item) => item.fragment).join(" ")
    ].filter(Boolean).join(" "));
    const signals = [];
    const add = (condition, constraintType, evidenceId, fragment, strength) => {
      if (condition) {
        signals.push({
          evidenceId,
          constraintType,
          fragment,
          strength: strength || "MEDIUM"
        });
      }
    };

    add(metrics.cycleTime > 0 && metrics.utilization >= 85, "CAPACITY_CONSTRAINT", "UTILIZATION", `Utilizacion estimada alta: ${metrics.utilization}%.`, "HIGH");
    add(metrics.waitTime > 0, "CAPACITY_CONSTRAINT", "WAIT_TIME", `Tiempo de espera registrado: ${metrics.waitTime}.`, metrics.waitTime >= 60 ? "HIGH" : "MEDIUM");
    add(dependencies.downstream.length > 1 || dependencies.blocks.length > 0, "CAPACITY_CONSTRAINT", "DEPENDENCY", "La actividad tiene dependencias o bloqueos relevantes en la secuencia.", "MEDIUM");
    add(this.containsAny(text, ["equipo", "maquina", "espacio", "turno", "recurso fisico"]), "PHYSICAL_CONSTRAINT", "TEXT-PHYSICAL", "Evidencia menciona recurso fisico, equipo, espacio o turno.", "MEDIUM");
    add(this.containsAny(text, ["politica", "aprobacion", "autorizacion", "regla", "comite", "firma"]), "POLICY_CONSTRAINT", "TEXT-POLICY", "Evidencia menciona politica, aprobacion, autorizacion o regla.", "MEDIUM");
    add(this.containsAny(text, ["informacion faltante", "dato", "documento incompleto", "espera informacion", "pendiente informacion"]), "INFORMATION_CONSTRAINT", "TEXT-INFORMATION", "Evidencia menciona informacion faltante o datos incompletos.", "HIGH");
    add(this.containsAny(text, ["sistema lento", "erp", "aplicacion", "integracion", "caida", "manual por sistema"]), "TECHNOLOGY_CONSTRAINT", "TEXT-TECHNOLOGY", "Evidencia menciona sistema, integracion o limitacion tecnologica.", "MEDIUM");

    return signals;
  },

  evaluateBottleneck(activity, metrics, dependencies, context) {
    const signals = [];
    const add = (condition, code, fragment, strength) => {
      if (condition) {
        signals.push({ code, fragment, strength: strength || "MEDIUM" });
      }
    };

    add(metrics.cycleTime > 0 && metrics.cycleTime === context.maxCycleTime, "MAX_CYCLE_TIME", "Mayor tiempo de ciclo del proceso.", "HIGH");
    add(metrics.waitTime > 0 && metrics.waitTime === context.maxWaitTime, "MAX_WAIT_TIME", "Mayor tiempo de espera del proceso.", "HIGH");
    add(metrics.utilization >= 85, "HIGH_UTILIZATION", `Utilizacion estimada ${metrics.utilization}%.`, "HIGH");
    add(dependencies.downstream.length > 1, "CRITICAL_DEPENDENCY", "Multiples actividades dependen de esta actividad.", "MEDIUM");
    add(dependencies.blocks.length > 0, "BLOCKING_ACTIVITY", "La actividad aparece como bloqueante en la secuencia.", "MEDIUM");

    return {
      isBottleneck: signals.length > 0,
      signals,
      confidence: signals.length ? (signals.some((item) => item.strength === "HIGH") ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE") : "INSUFFICIENT_INFORMATION",
      rationale: signals.length ? signals.map((item) => item.fragment).join(" | ") : "No se identifican senales suficientes de cuello de botella."
    };
  },

  resolveDependencies(activity, context) {
    const upstream = context.relationships.filter((relationship) => relationship.toActivityUUID === activity.activityUUID);
    const downstream = context.relationships.filter((relationship) => relationship.fromActivityUUID === activity.activityUUID);

    return {
      upstream: upstream.map((item) => item.fromActivityUUID),
      downstream: downstream.map((item) => item.toActivityUUID),
      blocks: downstream.length > 1 ? downstream.map((item) => item.toActivityUUID) : [],
      isCriticalDependency: downstream.length > 1
    };
  },

  estimateImpact(constraintAnalysis, bottleneckAnalysis, metrics) {
    const sufficient = constraintAnalysis.exists || bottleneckAnalysis.isBottleneck;

    if (!sufficient) {
      return {
        leadTimeImpact: "Sin impacto cuantificable con la evidencia disponible.",
        throughputImpact: "No determinado.",
        operationalImpact: "No determinado.",
        criticality: "SIN_EVIDENCIA",
        limitations: ["No existen senales suficientes de restriccion o cuello de botella."]
      };
    }

    return {
      leadTimeImpact: metrics.leadTimeContribution > 0 ? `Contribucion estimada al Lead Time: ${metrics.leadTimeContribution.toFixed(1)} unidades de tiempo.` : "Lead Time no cuantificable por falta de tiempos.",
      throughputImpact: metrics.utilization >= 85 ? "Puede limitar el Throughput por utilizacion alta o espera acumulada." : "Impacto en Throughput pendiente de datos de capacidad.",
      operationalImpact: constraintAnalysis.rationale,
      criticality: this.resolveCriticality(constraintAnalysis, bottleneckAnalysis),
      limitations: metrics.hasTimeData ? [] : ["No existen tiempos suficientes para cuantificar impacto."]
    };
  },

  suggestTocActions(activity, constraintAnalysis, impact) {
    if (!constraintAnalysis.exists) {
      return [];
    }

    return [
      this.action(activity, "EXPLOIT", "Explotar la restriccion", "Asegurar que la restriccion trabaje sobre prioridades correctas, sin interrupciones y con entradas completas.", impact, constraintAnalysis),
      this.action(activity, "SUBORDINATE", "Subordinar el sistema", "Alinear actividades aguas arriba y aguas abajo al ritmo de la restriccion.", impact, constraintAnalysis),
      this.action(activity, "ELEVATE", "Elevar la restriccion", "Evaluar capacidad adicional, simplificacion de reglas, integracion o soporte tecnologico cuando explotar/subordinar no baste.", impact, constraintAnalysis),
      this.action(activity, "REEVALUATE", "Reevaluar la restriccion", "Medir nuevamente el flujo despues de aplicar acciones para confirmar si la restriccion se desplazo.", impact, constraintAnalysis)
    ];
  },

  action(activity, actionType, label, description, impact, constraintAnalysis) {
    return {
      actionId: `TOC-ACT-${activity.activityUUID}-${actionType}`,
      activityUUID: activity.activityUUID,
      activityName: activity.name,
      actionType,
      label,
      description,
      expectedEffect: impact.throughputImpact,
      evidence: constraintAnalysis.evidence,
      confidence: constraintAnalysis.confidence
    };
  },

  buildActivityQuestions(activity, evidence, constraintAnalysis, bottleneckAnalysis, metrics) {
    const questions = [];

    if (!evidence.length) {
      questions.push(this.question(activity.activityUUID, `Que evidencia confirma como opera "${activity.name}"?`, "HIGH", true));
    }

    if (!metrics.hasTimeData) {
      questions.push(this.question(activity.activityUUID, `Cual es el tiempo de ciclo y espera de "${activity.name}"?`, "HIGH", true));
    }

    if (!metrics.hasFrequencyData) {
      questions.push(this.question(activity.activityUUID, `Con que frecuencia ocurre "${activity.name}" y con que volumen?`, "MEDIUM", false));
    }

    if (constraintAnalysis.exists && constraintAnalysis.confidence === "LOW_CONFIDENCE") {
      questions.push(this.question(activity.activityUUID, `Que dato confirma que "${activity.name}" es una restriccion ${constraintAnalysis.constraintLabel}?`, "HIGH", true));
    }

    if (bottleneckAnalysis.isBottleneck && !metrics.hasTimeData) {
      questions.push(this.question(activity.activityUUID, `Que medicion permite confirmar el cuello de botella en "${activity.name}"?`, "HIGH", true));
    }

    return questions;
  },

  buildQuestions(packageData, sources) {
    const model = sources && sources.processState ? sources.processState.draftProcessModel : null;

    if (!model || !model.activities || !model.activities.length) {
      return [this.question("", "No existe Process Model disponible para diagnostico TOC.", "HIGH", true)];
    }

    if (!packageData || !packageData.activityAssessments) {
      return [this.question("", "Ejecuta el diagnostico TOC para generar preguntas basadas en evidencia.", "MEDIUM", false)];
    }

    return packageData.activityAssessments.flatMap((assessment) => assessment.questions || []).slice(0, 30);
  },

  question(activityUUID, text, priority, blocksConsolidation) {
    if (window.ConsultingDecisionFramework) {
      return window.ConsultingDecisionFramework.createQuestion({
        activityUUID,
        question: text,
        priority,
        blocksConsolidation,
        reason: "Informacion requerida por el Consulting Decision Framework."
      });
    }

    return {
      questionId: `TOCQ-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      activityUUID,
      question: text,
      priority,
      blocksConsolidation,
      status: "OPEN"
    };
  },

  collectActivityEvidence(activity, sources) {
    const evidence = [];
    const add = (category, sourceType, sourceName, fragment, confidence) => {
      if (!fragment) {
        return;
      }

      evidence.push({
        evidenceId: `TOCEV-${activity.activityUUID}-${evidence.length + 1}`,
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
    const leanAssessment = this.findLeanAssessment(activity.activityUUID, sources);

    add("PROCESS_MODEL", "PROCESS_MODEL", activity.name, activity.description || activity.name, activity.confidence || "LOW_CONFIDENCE");
    (activity.evidence || []).forEach((item) => add("PROCESS_EVIDENCE", item.sourceType || "EVIDENCE", item.sourceName || item.evidenceId, item.fragment || item.sourceName, item.confidence));
    add("TIME", "VSM", "Intelligent VSM", this.formatTimeEvidence(vsm, operational), "MEDIUM_CONFIDENCE");
    add("WAIT", "OPERATIONAL_DATA", "Process Data Collection", operational.waits && `${operational.waits.waitTime || ""} ${operational.waits.reason || ""}`.trim(), operational.waits && operational.waits.waitTime ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE");
    add("RESOURCE", "OPERATIONAL_DATA", "Process Data Collection", operational.resources && [operational.resources.peopleInvolved, operational.resources.equipment, operational.resources.applications].filter(Boolean).join(" | "), "MEDIUM_CONFIDENCE");
    add("RISKS", "OPERATIONAL_DATA", "Process Data Collection", operational.risks && [operational.risks.operationalRisks, operational.risks.frequentErrors, operational.risks.rework].filter(Boolean).join(" | "), "MEDIUM_CONFIDENCE");
    observations.forEach((observation) => add("WORKSHOP_OBSERVATION", "TRANSFORMATION_OBSERVATION_PACKAGE", observation.type, `${observation.text} ${observation.evidenceNotes || ""}`.trim(), observation.confidence));
    if (leanAssessment) {
      add("LEAN_ASSESSMENT", "LEAN_ASSESSMENT_PACKAGE", leanAssessment.activityName, `Lean detecto ${leanAssessment.wastes.filter((waste) => waste.detected || waste.existence === "EXISTS").length} desperdicio(s) relevantes.`, leanAssessment.confidence);
    }

    return evidence;
  },

  buildConstraintIndex(assessments) {
    return assessments.filter((assessment) => assessment.constraintAnalysis.exists).map((assessment) => ({
      activityUUID: assessment.activityUUID,
      activityName: assessment.activityName,
      constraintType: assessment.constraintAnalysis.constraintType,
      constraintLabel: assessment.constraintAnalysis.constraintLabel,
      criticality: assessment.impact.criticality,
      evidence: assessment.constraintAnalysis.evidence,
      confidence: assessment.constraintAnalysis.confidence
    }));
  },

  buildBottlenecks(assessments) {
    return assessments.filter((assessment) => assessment.bottleneckAnalysis.isBottleneck).map((assessment) => ({
      activityUUID: assessment.activityUUID,
      activityName: assessment.activityName,
      signals: assessment.bottleneckAnalysis.signals,
      rationale: assessment.bottleneckAnalysis.rationale,
      confidence: assessment.bottleneckAnalysis.confidence
    }));
  },

  buildCriticalDependencies(assessments) {
    return assessments.filter((assessment) => assessment.dependencies.isCriticalDependency || assessment.dependencies.blocks.length).map((assessment) => ({
      activityUUID: assessment.activityUUID,
      activityName: assessment.activityName,
      upstream: assessment.dependencies.upstream,
      downstream: assessment.dependencies.downstream,
      blocks: assessment.dependencies.blocks,
      confidence: assessment.confidence
    }));
  },

  buildRisks(assessments) {
    return assessments.filter((assessment) => assessment.constraintAnalysis.exists || assessment.bottleneckAnalysis.isBottleneck).map((assessment) => ({
      riskId: `TOC-RISK-${assessment.activityUUID}`,
      activityUUID: assessment.activityUUID,
      activityName: assessment.activityName,
      description: `La actividad puede limitar flujo por ${assessment.constraintAnalysis.constraintLabel}.`,
      criticality: assessment.impact.criticality,
      evidence: assessment.constraintAnalysis.evidence,
      confidence: assessment.confidence
    }));
  },

  buildActions(assessments) {
    return assessments.flatMap((assessment) => assessment.suggestedActions || []).slice(0, 40);
  },

  buildSummary(assessments, constraints, bottlenecks, criticalDependencies, actions, questions) {
    return {
      totalActivities: assessments.length,
      constraintsDetected: constraints.length,
      bottlenecksDetected: bottlenecks.length,
      criticalDependencies: criticalDependencies.length,
      suggestedActions: actions.length,
      pendingQuestions: questions.length,
      highCriticality: constraints.filter((item) => item.criticality === "ALTA").length,
      averageConfidence: this.averageConfidence(assessments.map((item) => item.confidence))
    };
  },

  buildExecutiveSummary(summary) {
    if (!summary.totalActivities) {
      return "No existe informacion suficiente para ejecutar diagnostico TOC.";
    }

    return `Se analizaron ${summary.totalActivities} actividades. Se identificaron ${summary.constraintsDetected} restricciones con evidencia, ${summary.bottlenecksDetected} posibles cuellos de botella, ${summary.criticalDependencies} dependencias criticas y ${summary.suggestedActions} acciones TOC sugeridas.`;
  },

  buildEvidenceIndex(assessments) {
    const seen = {};
    return assessments.flatMap((assessment) => assessment.evidence).filter((item) => {
      if (seen[item.evidenceId]) {
        return false;
      }
      seen[item.evidenceId] = true;
      return true;
    });
  },

  createPackageDecisionTrace(assessments, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    const evidence = assessments.flatMap((assessment) => assessment.evidence || []);

    return window.ConsultingDecisionFramework.createDecisionTrace({
      consultantId: "TOC_TRANSFORMATION_CONSULTANT",
      subjectId: "TOC_ASSESSMENT_PACKAGE",
      subjectType: "PACKAGE",
      subjectName: "TOC Assessment Package",
      evidence,
      questions,
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: "Actividades y flujo comprendidos desde Process Model, VSM y datos operativos." },
        VALIDATE: { output: "Evidencia de tiempos, esperas, recursos, dependencias y observaciones consolidada." },
        DIAGNOSE: { output: "Restricciones y cuellos de botella evaluados." },
        QUANTIFY: { output: "Impacto estimado con Lead Time, espera, utilizacion y dependencias disponibles." },
        PROPOSE: { output: "Acciones TOC propuestas: explotar, subordinar, elevar y reevaluar." },
        JUSTIFY: { output: "Acciones justificadas con evidencia disponible." },
        ESTIMATE: { output: "Criticidad e impacto estimados cuando hubo datos suficientes." },
        WARN: { output: "Riesgos y dependencias criticas documentados." },
        ASK: { output: "Preguntas generadas para cerrar vacios de informacion." }
      }
    });
  },

  createActivityDecisionTrace(activity, evidence, constraintAnalysis, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      consultantId: "TOC_TRANSFORMATION_CONSULTANT",
      subjectId: activity.activityUUID,
      subjectType: "ACTIVITY",
      subjectName: activity.name,
      evidence,
      questions,
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: activity.description || activity.name || "" },
        VALIDATE: { output: evidence.length ? "Evidencia disponible para evaluar restriccion." : "Evidencia insuficiente." },
        DIAGNOSE: { output: constraintAnalysis.rationale },
        QUANTIFY: { output: "Impacto evaluado con tiempos, esperas, frecuencia, utilizacion y dependencias disponibles." },
        PROPOSE: { output: constraintAnalysis.exists ? "Acciones TOC sugeridas." : "No se proponen acciones sin evidencia de restriccion." },
        JUSTIFY: { output: constraintAnalysis.rationale },
        ESTIMATE: { output: "Criticidad estimada con la evidencia disponible." },
        WARN: { output: "Dependencias, riesgos e incertidumbre registrados." },
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
      vsmAvailable: Boolean(sources.vsmState && sources.vsmState.metrics),
      operationalDataAvailable: Boolean(sources.operationalDataState && sources.operationalDataState.readiness)
    };
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.assessmentPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.tocAssessmentPackage = state.assessmentPackage;
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
      const nodeId = assessment.tocActivityAssessmentId;
      graph.nodes.push({
        id: nodeId,
        type: "TOC_ASSESSMENT",
        label: `${assessment.activityName} / ${assessment.constraintAnalysis.constraintLabel}`
      });
      graph.edges.push({ from: assessment.activityUUID, to: nodeId, type: "HAS_TOC_ASSESSMENT" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  activityObservations(activityUUID, sources) {
    const packageData = sources.transformationObservationPackage;
    return packageData && packageData.observations ? packageData.observations.filter((item) => item.activityUUID === activityUUID) : [];
  },

  findLeanAssessment(activityUUID, sources) {
    const packageData = sources.leanAssessmentPackage;
    return packageData && packageData.activityAssessments ? packageData.activityAssessments.find((item) => item.activityUUID === activityUUID) : null;
  },

  formatTimeEvidence(vsm, operational) {
    const time = operational.time || {};
    const min = vsm.processTimeMin || time.min;
    const likely = vsm.processTimeLikely || time.likely;
    const max = vsm.processTimeMax || time.max;

    if (!min && !likely && !max && !vsm.waitTime && !(operational.waits && operational.waits.waitTime)) {
      return "";
    }

    return `Tiempo triangular min/probable/max: ${min || "NA"} / ${likely || "NA"} / ${max || "NA"}. Espera: ${vsm.waitTime || (operational.waits && operational.waits.waitTime) || "NA"}.`;
  },

  resolveFrequency(vsm, operational) {
    const frequency = operational.frequency || {};
    return Number(vsm.frequencyPerDay || frequency.perDay || 0) ||
      (Number(vsm.frequencyPerWeek || frequency.perWeek || 0) / 5) ||
      (Number(vsm.frequencyPerMonth || frequency.perMonth || 0) / 22) ||
      (Number(vsm.frequencyPerYear || frequency.perYear || 0) / 260) ||
      0;
  },

  estimateUtilization(processTime, waitTime, frequency) {
    if (!processTime || !frequency) {
      return 0;
    }

    return Math.min(100, Math.round(((processTime + waitTime) * frequency / 480) * 100));
  },

  expectedTriangular(min, likely, max) {
    if (window.CalculationEngine && window.CalculationEngine.expectedTriangular) {
      return window.CalculationEngine.expectedTriangular(min, likely, max);
    }

    return ((Number(min) || 0) + (Number(likely) || 0) + (Number(max) || 0)) / 3;
  },

  resolveCriticality(constraintAnalysis, bottleneckAnalysis) {
    const highSignal = constraintAnalysis.evidence.some((item) => item.strength === "HIGH") || bottleneckAnalysis.signals.some((item) => item.strength === "HIGH");

    if (highSignal && constraintAnalysis.exists && bottleneckAnalysis.isBottleneck) {
      return "ALTA";
    }

    if (constraintAnalysis.exists || bottleneckAnalysis.isBottleneck) {
      return "MEDIA";
    }

    return "BAJA";
  },

  resolveActivityConfidence(evidence, constraintAnalysis, bottleneckAnalysis, questions) {
    if (questions.some((question) => question.blocksConsolidation)) {
      return "INSUFFICIENT_INFORMATION";
    }

    const scores = evidence.map((item) => this.confidenceScore(item.confidence));
    scores.push(this.confidenceScore(constraintAnalysis.confidence));
    scores.push(this.confidenceScore(bottleneckAnalysis.confidence));
    return this.scoreToConfidence(scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : 0);
  },

  resolveConstraintConfidence(signals) {
    if (!signals.length) {
      return "INSUFFICIENT_INFORMATION";
    }

    if (signals.some((item) => item.strength === "HIGH") || signals.length >= 2) {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  signalWeight(signal) {
    return signal.strength === "HIGH" ? 3 : signal.strength === "MEDIUM" ? 2 : 1;
  },

  constraintLabel(type) {
    const labels = {
      PHYSICAL_CONSTRAINT: "Restriccion fisica",
      CAPACITY_CONSTRAINT: "Restriccion de capacidad",
      POLICY_CONSTRAINT: "Restriccion de politica",
      INFORMATION_CONSTRAINT: "Restriccion de informacion",
      TECHNOLOGY_CONSTRAINT: "Restriccion tecnologica",
      NO_CONSTRAINT_EVIDENCE: "Sin evidencia de restriccion"
    };

    return labels[type] || type;
  },

  average(values) {
    const valid = values.filter((value) => Number(value) > 0);
    return valid.length ? valid.reduce((total, value) => total + Number(value), 0) / valid.length : 0;
  },

  averageConfidence(confidences) {
    if (!confidences.length) {
      return "INSUFFICIENT_INFORMATION";
    }

    const average = confidences.reduce((total, confidence) => total + this.confidenceScore(confidence), 0) / confidences.length;
    return this.scoreToConfidence(average);
  },

  scoreToConfidence(score) {
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

  confidenceScore(confidence) {
    const scores = {
      HIGH_CONFIDENCE: 95,
      MEDIUM_CONFIDENCE: 72,
      LOW_CONFIDENCE: 42,
      INSUFFICIENT_INFORMATION: 12
    };

    return scores[confidence] || 40;
  },

  addChat(state, author, text) {
    if (!Array.isArray(state.chat)) {
      state.chat = this.createInitialChat();
    }

    state.chat.push({
      messageId: `TOC-${Date.now()}-${author}`,
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
