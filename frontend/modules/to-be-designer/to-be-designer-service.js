window.ToBeDesignerService = Object.seal({
  storageKey: "operational-intelligence.to-be-designer",

  createState() {
    const sources = this.loadSources();

    return {
      sources,
      selectedActivityUUID: this.firstActivityUuid(sources.processState),
      toBePackage: null,
      questions: [],
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `TOBE-${Date.now()}`,
      author: "consultant",
      text: "Disenare el proceso futuro utilizando evidencia de As-Is, VSM, taller, Lean, TOC y Automation & AI. No asumire cambios sin evidencia.",
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
      state.toBePackage = saved.toBePackage || null;
      state.questions = this.buildQuestions(state.toBePackage, state.sources);
      state.chat = saved.chat && saved.chat.length ? saved.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.questions = this.buildQuestions(state.toBePackage, state.sources);
    state.lastSavedAt = new Date().toISOString();
    this.syncToKnowledgePackage(state);
    this.syncToContextGraph(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedActivityUUID: state.selectedActivityUUID,
      toBePackage: state.toBePackage,
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
    const automationAiState = window.AutomationAiConsultantService ? window.AutomationAiConsultantService.loadState() : null;

    return {
      businessKnowledgePackage: businessState && businessState.package ? businessState.package : null,
      processState,
      operationalDataState: dataCollectionState,
      vsmState,
      transformationObservationPackage: workshopState ? workshopState.packageData : null,
      leanAssessmentPackage: leanState ? leanState.assessmentPackage : null,
      tocAssessmentPackage: tocState ? tocState.assessmentPackage : null,
      automationAiOpportunityPackage: automationAiState ? automationAiState.opportunityPackage : null,
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

  runDesign(state) {
    state.sources = this.loadSources();
    const asIsModel = state.sources.processState.draftProcessModel;
    const activities = asIsModel && asIsModel.activities ? asIsModel.activities : [];
    const decisions = activities.map((activity, index) => this.designActivity(activity, index, state.sources));
    const toBeModel = this.buildToBeModel(asIsModel, decisions);
    const comparison = this.buildComparison(activities, decisions, toBeModel);
    const risks = this.buildRisks(decisions);
    const evidenceUsed = this.buildEvidenceIndex(decisions);
    const questions = this.buildQuestions({ decisions }, state.sources);
    const summary = this.buildSummary(decisions, comparison, questions);

    state.toBePackage = {
      toBePackageId: `TOBE-${Date.now()}`,
      packageType: "TO_BE_PACKAGE",
      methodology: "TO_BE_DESIGNER",
      status: questions.some((question) => question.blocksConsolidation) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
      version: 1,
      asIsProcessModelId: asIsModel ? asIsModel.processModelId : "",
      toBeProcessModelId: toBeModel.processModelId,
      knowledgePackageId: state.sources.knowledgePackage ? state.sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: state.sources.contextGraph ? state.sources.contextGraph.contextGraphId : "",
      sourcePackages: this.resolveSourcePackages(state.sources),
      decisionTrace: this.createPackageDecisionTrace(decisions, questions),
      executiveSummary: this.buildExecutiveSummary(summary),
      processModelToBe: toBeModel,
      comparison,
      changeJustifications: decisions,
      evidenceUsed,
      confidence: summary.averageConfidence,
      risks,
      questions,
      summary,
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER"
    };
    state.questions = questions;
    this.addChat(state, "consultant", `To-Be Package generado: ${comparison.modifiedActivities.length} actividades modificadas, ${comparison.eliminatedActivities.length} eliminadas, ${comparison.newActivities.length} nuevas y ${questions.length} preguntas pendientes.`);
    this.saveState(state);
  },

  designActivity(activity, index, sources) {
    const evidence = this.collectActivityEvidence(activity, sources);
    const lean = this.findLeanAssessment(activity.activityUUID, sources);
    const toc = this.findTocAssessment(activity.activityUUID, sources);
    const automationAi = this.findAutomationAiOpportunity(activity.activityUUID, sources);
    const metrics = this.calculateActivityMetrics(activity);
    const actions = this.resolveActions(activity, evidence, lean, toc, automationAi, metrics);
    const toBeActivity = this.buildToBeActivity(activity, index, actions, automationAi, metrics);
    const comparison = this.compareActivity(activity, toBeActivity, actions, metrics);
    const questions = this.buildActivityQuestions(activity, evidence, actions, automationAi);
    const confidence = this.resolveActivityConfidence(evidence, actions, questions);

    return {
      toBeDecisionId: `TBD-${activity.activityUUID || Date.now()}`,
      activityUUID: activity.activityUUID,
      activityId: activity.activityId,
      sequence: activity.sequence || index + 1,
      activityName: activity.name,
      actions,
      toBeActivity,
      comparison,
      evidence,
      confidence,
      risks: this.identifyActivityRisks(activity, actions, automationAi),
      questions,
      decisionTrace: this.createActivityDecisionTrace(activity, evidence, actions, questions),
      createdAt: new Date().toISOString()
    };
  },

  resolveActions(activity, evidence, lean, toc, automationAi, metrics) {
    const actions = [];
    const leanWastes = this.extractLeanWastes(lean);
    const automationPotential = automationAi ? automationAi.automationPotential : null;
    const aiCount = automationAi && automationAi.aiOpportunities ? automationAi.aiOpportunities.length : 0;
    const tocConstraint = toc && toc.constraintAnalysis && toc.constraintAnalysis.exists;

    if (!evidence.length) {
      actions.push(this.action("QUESTION", "Preguntar", "No existe evidencia suficiente para proponer cambios sobre esta actividad.", [], "INSUFFICIENT_INFORMATION"));
      return actions;
    }

    if (leanWastes.some((waste) => waste.wasteType === "Sobreproceso" || waste.wasteType === "Defectos / Retrabajos") || this.textHas(activity, ["duplicado", "retrabajo", "corregir", "reprocesar"])) {
      actions.push(this.action("SIMPLIFY", "Simplificar", "Existe evidencia de sobreproceso, retrabajo o duplicidad; la actividad debe reducir pasos o controles redundantes.", this.evidenceFromSources(lean, automationAi), "MEDIUM_CONFIDENCE"));
    }

    if (lean && lean.valueClassification && lean.valueClassification.classification === "NVA" && !tocConstraint) {
      actions.push(this.action("ELIMINATE", "Eliminar", "Lean clasifico la actividad como desperdicio y no existe evidencia TOC de restriccion critica que obligue a conservarla.", this.evidenceFromSources(lean), "MEDIUM_CONFIDENCE"));
    }

    if (automationPotential && (automationPotential.classification === "FULLY_AUTOMATABLE" || automationPotential.classification === "PARTIALLY_AUTOMATABLE")) {
      actions.push(this.action("AUTOMATE", "Automatizar", automationPotential.rationale, automationPotential.evidence || [], automationPotential.confidence));
    }

    if (automationAi && aiCount) {
      actions.push(this.action("INCORPORATE_AI", "Incorporar IA", `${aiCount} oportunidad(es) IA disponibles para enriquecer o asistir la actividad.`, automationAi.aiOpportunities.flatMap((item) => item.evidence || []), automationAi.confidence));
    }

    if (tocConstraint) {
      actions.push(this.action("REORDER", "Reordenar", "TOC detecto restriccion o cuello; el proceso futuro debe proteger su flujo y reducir bloqueos alrededor de esta actividad.", this.evidenceFromSources(toc), toc.confidence));
    }

    if (metrics.waitTime > metrics.processTime && metrics.waitTime > 0) {
      actions.push(this.action("PARALLELIZE", "Paralelizar", "La espera supera al tiempo de proceso; puede evaluarse ejecucion paralela de preparacion, validacion o recoleccion de datos.", [{ fragment: `Espera ${metrics.waitTime}; proceso ${metrics.processTime}.`, confidence: "MEDIUM_CONFIDENCE" }], "MEDIUM_CONFIDENCE"));
    }

    if (this.textHas(activity, ["aprobacion", "validar", "control", "centralizar", "politica"])) {
      actions.push(this.action("CENTRALIZE_OR_DECENTRALIZE", "Centralizar o descentralizar", "La actividad contiene aprobaciones, validaciones o controles que pueden redisenarse organizacionalmente.", evidence.slice(0, 3), "LOW_CONFIDENCE"));
    }

    if (!actions.length) {
      actions.push(this.action("KEEP", "Mantener", "No existe evidencia suficiente de eliminacion, simplificacion, automatizacion, IA, reordenamiento o cambio organizacional.", evidence.slice(0, 3), "MEDIUM_CONFIDENCE"));
    }

    return this.deduplicateActions(actions);
  },

  buildToBeActivity(activity, index, actions, automationAi, metrics) {
    const actionTypes = actions.map((action) => action.type);
    const eliminated = actionTypes.includes("ELIMINATE");
    const automated = actionTypes.includes("AUTOMATE");
    const aiEnabled = actionTypes.includes("INCORPORATE_AI");
    const simplified = actionTypes.includes("SIMPLIFY");
    const systems = this.unique(this.asArray(activity.systems).concat(automated ? ["Automation Layer"] : []).concat(aiEnabled ? ["AI Assistant"] : []));
    const documents = this.unique(this.asArray(activity.documents).concat(aiEnabled ? ["AI validation log"] : []));
    const processTime = this.estimateToBeTime(metrics.processTime, actions);
    const waitTime = this.estimateToBeWait(metrics.waitTime, actions);

    return {
      activityUUID: activity.activityUUID,
      activityId: activity.activityId,
      toBeActivityId: `TOBE-${activity.activityId || activity.activityUUID || index + 1}`,
      name: eliminated ? `[Eliminada] ${activity.name}` : activity.name,
      description: this.buildToBeDescription(activity, actions),
      sequence: this.resolveToBeSequence(activity, index, actions),
      status: eliminated ? "ELIMINATED" : actionTypes.includes("KEEP") ? "UNCHANGED" : "MODIFIED",
      responsible: this.resolveResponsible(activity, actions),
      area: activity.area || "",
      systems,
      documents,
      inputs: this.asArray(activity.inputs),
      outputs: this.asArray(activity.outputs),
      rules: this.resolveRules(activity, actions),
      indicators: this.resolveIndicators(activity, processTime, waitTime),
      estimatedTimes: {
        asIsProcessTime: metrics.processTime,
        asIsWaitTime: metrics.waitTime,
        toBeProcessTime: processTime,
        toBeWaitTime: waitTime
      },
      changeTypes: actionTypes,
      confidence: this.confidenceFromScore(this.average(actions.map((action) => this.confidenceScore(action.confidence))))
    };
  },

  buildToBeModel(asIsModel, decisions) {
    const activities = decisions.map((decision) => decision.toBeActivity).filter((activity) => activity.status !== "ELIMINATED");
    const eliminatedIds = decisions.filter((decision) => decision.toBeActivity.status === "ELIMINATED").map((decision) => decision.activityId);
    const relationships = (asIsModel && asIsModel.relationships ? asIsModel.relationships : []).filter((relationship) => !eliminatedIds.includes(relationship.from) && !eliminatedIds.includes(relationship.to));

    return {
      processModelId: `PM-TOBE-${Date.now()}`,
      mapType: "TO_BE",
      parentProcessModelId: asIsModel ? asIsModel.processModelId : "",
      name: asIsModel && asIsModel.name ? `${asIsModel.name} To-Be` : "Process Model To-Be",
      version: 1,
      status: "DRAFT_READY_FOR_REVIEW",
      activities,
      relationships,
      generatedBy: "TO_BE_DESIGNER",
      createdAt: new Date().toISOString()
    };
  },

  buildComparison(asIsActivities, decisions, toBeModel) {
    const modified = decisions.filter((decision) => decision.toBeActivity.status === "MODIFIED");
    const eliminated = decisions.filter((decision) => decision.toBeActivity.status === "ELIMINATED");
    const unchanged = decisions.filter((decision) => decision.toBeActivity.status === "UNCHANGED");
    const asIsTime = decisions.reduce((total, decision) => total + decision.comparison.asIsTotalTime, 0);
    const toBeTime = decisions.reduce((total, decision) => total + decision.comparison.toBeTotalTime, 0);

    return {
      asIsActivityCount: asIsActivities.length,
      toBeActivityCount: toBeModel.activities.length,
      eliminatedActivities: eliminated.map((decision) => this.comparisonItem(decision)),
      newActivities: this.buildNewActivities(decisions),
      modifiedActivities: modified.map((decision) => this.comparisonItem(decision)),
      unchangedActivities: unchanged.map((decision) => this.comparisonItem(decision)),
      asIsEstimatedTime: Number(asIsTime.toFixed(2)),
      toBeEstimatedTime: Number(toBeTime.toFixed(2)),
      expectedTimeBenefit: Number((asIsTime - toBeTime).toFixed(2)),
      expectedBenefits: this.buildExpectedBenefits(decisions, asIsTime, toBeTime)
    };
  },

  compareActivity(activity, toBeActivity, actions, metrics) {
    const asIsTotalTime = metrics.processTime + metrics.waitTime;
    const toBeTotalTime = toBeActivity.status === "ELIMINATED" ? 0 : toBeActivity.estimatedTimes.toBeProcessTime + toBeActivity.estimatedTimes.toBeWaitTime;

    return {
      activityUUID: activity.activityUUID,
      activityName: activity.name,
      status: toBeActivity.status,
      asIsTotalTime,
      toBeTotalTime,
      expectedBenefit: Number((asIsTotalTime - toBeTotalTime).toFixed(2)),
      changeTypes: actions.map((action) => action.type),
      rationale: actions.map((action) => action.rationale).join(" ")
    };
  },

  buildNewActivities(decisions) {
    return decisions.flatMap((decision) => {
      const activities = [];

      if (decision.actions.some((action) => action.type === "AUTOMATE")) {
        activities.push({
          activityName: `Monitorear automatizacion de ${decision.activityName}`,
          reason: "La automatizacion requiere monitoreo operativo y gestion de excepciones.",
          relatedActivityUUID: decision.activityUUID
        });
      }

      if (decision.actions.some((action) => action.type === "INCORPORATE_AI")) {
        activities.push({
          activityName: `Validar salida IA de ${decision.activityName}`,
          reason: "Las salidas IA requieren validacion humana o reglas de aprobacion en el MVP.",
          relatedActivityUUID: decision.activityUUID
        });
      }

      return activities;
    });
  },

  comparisonItem(decision) {
    return {
      activityUUID: decision.activityUUID,
      activityName: decision.activityName,
      asIsTime: decision.comparison.asIsTotalTime,
      toBeTime: decision.comparison.toBeTotalTime,
      benefit: decision.comparison.expectedBenefit,
      changes: decision.actions.map((action) => action.label),
      confidence: decision.confidence
    };
  },

  buildExpectedBenefits(decisions, asIsTime, toBeTime) {
    return {
      timeReduction: `${Number((asIsTime - toBeTime).toFixed(2))} unidades de tiempo estimadas.`,
      simplification: `${decisions.filter((decision) => decision.actions.some((action) => action.type === "SIMPLIFY")).length} actividad(es) con simplificacion.`,
      automation: `${decisions.filter((decision) => decision.actions.some((action) => action.type === "AUTOMATE")).length} actividad(es) con automatizacion incorporada.`,
      ai: `${decisions.filter((decision) => decision.actions.some((action) => action.type === "INCORPORATE_AI")).length} actividad(es) con IA incorporada.`,
      flow: `${decisions.filter((decision) => decision.actions.some((action) => action.type === "REORDER" || action.type === "PARALLELIZE")).length} actividad(es) con mejora de flujo.`
    };
  },

  buildQuestions(packageData, sources) {
    const questions = [];

    if (!sources.processState || !sources.processState.draftProcessModel) {
      questions.push(this.question("TOBEQ-PROCESS", "", "Existe un Process Model As-Is validado para construir el To-Be?", "El To-Be Designer no crea procesos desde cero.", "Alta", true));
    }

    if (!sources.automationAiOpportunityPackage) {
      questions.push(this.question("TOBEQ-AAI", "", "Existe un Automation & AI Opportunity Package vigente?", "El To-Be requiere oportunidades digitales validadas como entrada.", "Alta", false));
    }

    if (!sources.leanAssessmentPackage) {
      questions.push(this.question("TOBEQ-LEAN", "", "Existe un Lean Assessment Package vigente?", "Lean aporta evidencia para eliminar, simplificar o mantener actividades.", "Media", false));
    }

    if (!sources.tocAssessmentPackage) {
      questions.push(this.question("TOBEQ-TOC", "", "Existe un TOC Assessment Package vigente?", "TOC ayuda a proteger restricciones reales en el proceso futuro.", "Media", false));
    }

    if (packageData && packageData.decisions) {
      packageData.decisions.forEach((decision) => decision.questions.forEach((question) => questions.push(question)));
    }

    return questions;
  },

  buildActivityQuestions(activity, evidence, actions, automationAi) {
    const questions = [];

    if (!evidence.length) {
      questions.push(this.question(`TOBEQ-${activity.activityUUID}-EVIDENCE`, activity.activityUUID, "Que evidencia respalda la forma actual de ejecutar esta actividad?", "Sin evidencia no se debe redisenar la actividad.", "Alta", true, activity.name));
    }

    if (actions.some((action) => action.type === "CENTRALIZE_OR_DECENTRALIZE")) {
      questions.push(this.question(`TOBEQ-${activity.activityUUID}-ORG`, activity.activityUUID, "Que restricciones organizacionales existen para centralizar o descentralizar esta actividad?", "Los cambios organizacionales requieren validacion humana antes de consolidarse.", "Media", false, activity.name));
    }

    if (automationAi && automationAi.aiOpportunities && automationAi.aiOpportunities.length && !automationAi.requirements.dataRequired.length) {
      questions.push(this.question(`TOBEQ-${activity.activityUUID}-AI-DATA`, activity.activityUUID, "Que datos o ejemplos validados existen para incorporar IA en esta actividad?", "La IA no debe incorporarse sin datos o criterio de validacion.", "Alta", false, activity.name));
    }

    return questions;
  },

  buildSummary(decisions, comparison, questions) {
    const confidenceScores = decisions.map((decision) => this.confidenceScore(decision.confidence));

    return {
      totalActivities: decisions.length,
      maintained: decisions.filter((decision) => decision.actions.some((action) => action.type === "KEEP")).length,
      eliminated: comparison.eliminatedActivities.length,
      simplified: decisions.filter((decision) => decision.actions.some((action) => action.type === "SIMPLIFY")).length,
      automated: decisions.filter((decision) => decision.actions.some((action) => action.type === "AUTOMATE")).length,
      aiEnabled: decisions.filter((decision) => decision.actions.some((action) => action.type === "INCORPORATE_AI")).length,
      reordered: decisions.filter((decision) => decision.actions.some((action) => action.type === "REORDER")).length,
      parallelized: decisions.filter((decision) => decision.actions.some((action) => action.type === "PARALLELIZE")).length,
      orgChanges: decisions.filter((decision) => decision.actions.some((action) => action.type === "CENTRALIZE_OR_DECENTRALIZE")).length,
      expectedTimeBenefit: comparison.expectedTimeBenefit,
      pendingQuestions: questions.length,
      averageConfidence: this.confidenceFromScore(this.average(confidenceScores))
    };
  },

  buildExecutiveSummary(summary) {
    if (!summary.totalActivities) {
      return "No existe Process Model As-Is para construir el proceso To-Be.";
    }

    return `Se disenaron cambios To-Be para ${summary.totalActivities} actividades: ${summary.eliminated} eliminadas, ${summary.simplified} simplificadas, ${summary.automated} con automatizacion, ${summary.aiEnabled} con IA y ${summary.parallelized} con paralelizacion. Beneficio estimado de tiempo: ${summary.expectedTimeBenefit}. Confianza consolidada: ${summary.averageConfidence}.`;
  },

  buildRisks(decisions) {
    return decisions.flatMap((decision) => decision.risks);
  },

  buildEvidenceIndex(decisions) {
    return decisions.flatMap((decision) => decision.evidence.map((evidence) => ({
      activityUUID: decision.activityUUID,
      activityName: decision.activityName,
      ...evidence
    })));
  },

  collectActivityEvidence(activity, sources) {
    const evidence = [];
    const add = (category, sourceType, sourceName, fragment, confidence) => {
      if (!fragment) {
        return;
      }

      evidence.push({
        evidenceId: `TOBEE-${activity.activityUUID || Date.now()}-${evidence.length + 1}`,
        category,
        sourceType,
        sourceName: sourceName || "Fuente no especificada",
        fragment: String(fragment),
        confidence: confidence || "MEDIUM_CONFIDENCE",
        date: new Date().toISOString()
      });
    };
    const lean = this.findLeanAssessment(activity.activityUUID, sources);
    const toc = this.findTocAssessment(activity.activityUUID, sources);
    const automationAi = this.findAutomationAiOpportunity(activity.activityUUID, sources);

    (activity.evidence || []).forEach((item) => add("PROCESS_EVIDENCE", item.sourceType || "EVIDENCE", item.sourceName || item.evidenceId, item.fragment || item.sourceName, item.confidence));
    add("PROCESS_MODEL", "PROCESS_MODEL", "As-Is Process Model", activity.description || activity.name, "MEDIUM_CONFIDENCE");
    add("SYSTEMS", "PROCESS_MODEL", "As-Is Process Model", this.asArray(activity.systems).join(", "), "MEDIUM_CONFIDENCE");
    add("DOCUMENTS", "PROCESS_MODEL", "As-Is Process Model", this.asArray(activity.documents).join(", "), "MEDIUM_CONFIDENCE");
    add("TIME", "OPERATIONAL_DATA", "Process Data Collection", this.formatTimeEvidence(activity), "MEDIUM_CONFIDENCE");
    if (lean) {
      add("LEAN_ASSESSMENT", "LEAN_ASSESSMENT_PACKAGE", lean.activityName, "Lean Assessment Package contiene diagnostico para la actividad.", lean.confidence);
    }
    if (toc) {
      add("TOC_ASSESSMENT", "TOC_ASSESSMENT_PACKAGE", toc.activityName, "TOC Assessment Package contiene restricciones o cuellos para la actividad.", toc.confidence);
    }
    if (automationAi) {
      add("AUTOMATION_AI", "AUTOMATION_AI_OPPORTUNITY_PACKAGE", automationAi.activityName, `${automationAi.automationPotential.label}; ${automationAi.aiOpportunities.length} oportunidad(es) IA.`, automationAi.confidence);
    }

    return evidence;
  },

  calculateActivityMetrics(activity) {
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const processTime = this.expectedTriangular(vsm.processTimeMin || (operational.time && operational.time.min), vsm.processTimeLikely || (operational.time && operational.time.likely), vsm.processTimeMax || (operational.time && operational.time.max));
    const waitTime = Number(vsm.waitTime || (operational.waits && operational.waits.waitTime)) || 0;

    return {
      processTime,
      waitTime,
      totalTime: processTime + waitTime,
      hasTimeData: processTime > 0 || waitTime > 0
    };
  },

  estimateToBeTime(processTime, actions) {
    let factor = 1;

    if (actions.some((action) => action.type === "ELIMINATE")) {
      return 0;
    }

    if (actions.some((action) => action.type === "AUTOMATE")) {
      factor -= 0.35;
    }

    if (actions.some((action) => action.type === "INCORPORATE_AI")) {
      factor -= 0.15;
    }

    if (actions.some((action) => action.type === "SIMPLIFY")) {
      factor -= 0.2;
    }

    return Number(Math.max(processTime * factor, processTime ? processTime * 0.25 : 0).toFixed(2));
  },

  estimateToBeWait(waitTime, actions) {
    let factor = 1;

    if (actions.some((action) => action.type === "ELIMINATE")) {
      return 0;
    }

    if (actions.some((action) => action.type === "PARALLELIZE")) {
      factor -= 0.35;
    }

    if (actions.some((action) => action.type === "REORDER")) {
      factor -= 0.25;
    }

    if (actions.some((action) => action.type === "AUTOMATE")) {
      factor -= 0.15;
    }

    return Number(Math.max(waitTime * factor, 0).toFixed(2));
  },

  identifyActivityRisks(activity, actions, automationAi) {
    const risks = [];

    if (actions.some((action) => action.type === "ELIMINATE")) {
      risks.push("Eliminar actividad requiere validacion humana de impacto en control, cumplimiento y cliente.");
    }

    if (actions.some((action) => action.type === "AUTOMATE") && automationAi && automationAi.requirements.integrationsNeeded.length) {
      risks.push("Automatizacion depende de integraciones tecnicas disponibles.");
    }

    if (actions.some((action) => action.type === "INCORPORATE_AI")) {
      risks.push("Incorporar IA requiere datos, criterios de aceptacion y validacion humana.");
    }

    if (actions.some((action) => action.type === "CENTRALIZE_OR_DECENTRALIZE")) {
      risks.push("Cambio organizacional puede afectar roles, capacidades y adopcion.");
    }

    return risks.map((risk) => ({
      activityUUID: activity.activityUUID,
      activityName: activity.name,
      risk,
      severity: risk.indexOf("Eliminar") >= 0 ? "Alta" : "Media"
    }));
  },

  buildToBeDescription(activity, actions) {
    const labels = actions.map((action) => action.label).filter((label) => label !== "Mantener");

    if (!labels.length) {
      return activity.description || activity.name || "";
    }

    return `${activity.description || activity.name || ""} Cambio To-Be propuesto: ${labels.join(", ")}.`;
  },

  resolveToBeSequence(activity, index, actions) {
    let sequence = Number(activity.sequence || index + 1);

    if (actions.some((action) => action.type === "REORDER")) {
      sequence = Math.max(1, sequence - 0.1);
    }

    if (actions.some((action) => action.type === "PARALLELIZE")) {
      sequence += 0.05;
    }

    return Number(sequence.toFixed(2));
  },

  resolveResponsible(activity, actions) {
    if (actions.some((action) => action.type === "AUTOMATE")) {
      return `${activity.responsible || "Responsable actual"} + Automatizacion`;
    }

    if (actions.some((action) => action.type === "INCORPORATE_AI")) {
      return `${activity.responsible || "Responsable actual"} + Asistente IA`;
    }

    return activity.responsible || "";
  },

  resolveRules(activity, actions) {
    const rules = this.asArray(activity.rules);

    if (actions.some((action) => action.type === "AUTOMATE")) {
      rules.push("Reglas automatizadas con registro de excepciones.");
    }

    if (actions.some((action) => action.type === "INCORPORATE_AI")) {
      rules.push("Validacion humana de salidas IA antes de consolidacion.");
    }

    return this.unique(rules);
  },

  resolveIndicators(activity, processTime, waitTime) {
    return [
      `Tiempo To-Be estimado: ${processTime + waitTime}`,
      "Tasa de excepciones",
      "Cumplimiento de SLA",
      "Trazabilidad de cambios"
    ];
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.toBePackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.toBePackage = state.toBePackage;
    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(state) {
    if (!window.ContextBuilderService || !state.toBePackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    state.toBePackage.changeJustifications.forEach((decision) => {
      const nodeId = decision.toBeDecisionId;
      graph.nodes.push({
        id: nodeId,
        type: "TO_BE_DECISION",
        label: `${decision.activityName} / ${decision.actions.map((action) => action.label).join(", ")}`
      });
      graph.edges.push({ from: decision.activityUUID, to: nodeId, type: "HAS_TO_BE_DECISION" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  resolveSourcePackages(sources) {
    return {
      businessKnowledgePackageId: sources.businessKnowledgePackage ? sources.businessKnowledgePackage.businessKnowledgePackageId : "",
      knowledgePackageId: sources.knowledgePackage ? sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: sources.contextGraph ? sources.contextGraph.contextGraphId : "",
      asIsProcessModelId: sources.processState.draftProcessModel ? sources.processState.draftProcessModel.processModelId : "",
      transformationObservationPackageId: sources.transformationObservationPackage ? sources.transformationObservationPackage.transformationObservationPackageId : "",
      leanAssessmentPackageId: sources.leanAssessmentPackage ? sources.leanAssessmentPackage.leanAssessmentPackageId : "",
      tocAssessmentPackageId: sources.tocAssessmentPackage ? sources.tocAssessmentPackage.tocAssessmentPackageId : "",
      automationAiOpportunityPackageId: sources.automationAiOpportunityPackage ? sources.automationAiOpportunityPackage.automationAiOpportunityPackageId : "",
      vsmAvailable: Boolean(sources.vsmState && sources.vsmState.metrics),
      operationalDataAvailable: Boolean(sources.operationalDataState && sources.operationalDataState.readiness)
    };
  },

  createPackageDecisionTrace(decisions, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "TO_BE_PACKAGE",
      subjectId: `TOBE-${Date.now()}`,
      consultant: "To-Be Designer",
      evidence: decisions.flatMap((decision) => decision.evidence),
      assumptions: [],
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: "Se comprendio el As-Is y paquetes de diagnostico disponibles." },
        VALIDATE: { output: "Se valido evidencia antes de proponer cambios To-Be." },
        DIAGNOSE: { output: "Se identificaron actividades a mantener, eliminar, simplificar, automatizar, enriquecer con IA, reordenar o paralelizar." },
        QUANTIFY: { output: "Se compararon tiempos As-Is y To-Be cuando existian datos operativos." },
        PROPOSE: { output: "Se genero Process Model To-Be y comparativo." },
        JUSTIFY: { output: "Cada cambio mantiene evidencia y razonamiento." },
        ESTIMATE: { output: "Beneficios estimados solo con datos disponibles." },
        WARN: { output: "Riesgos de eliminacion, automatizacion, IA y cambio organizacional registrados." },
        ASK: { output: questions.length ? "Existen preguntas pendientes." : "Sin preguntas pendientes." }
      }
    });
  },

  createActivityDecisionTrace(activity, evidence, actions, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "ACTIVITY_TO_BE_DECISION",
      subjectId: activity.activityUUID,
      consultant: "To-Be Designer",
      evidence,
      assumptions: [],
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: activity.description || activity.name || "" },
        VALIDATE: { output: evidence.length ? "Evidencia disponible." : "Evidencia insuficiente." },
        DIAGNOSE: { output: actions.map((action) => action.rationale).join(" ") },
        QUANTIFY: { output: "Tiempo As-Is vs To-Be estimado cuando hay datos." },
        PROPOSE: { output: actions.map((action) => action.label).join(", ") },
        JUSTIFY: { output: actions.map((action) => action.rationale).join(" ") },
        ESTIMATE: { output: "Beneficio y confianza estimados con evidencia disponible." },
        WARN: { output: "Riesgos registrados." },
        ASK: { output: questions.length ? "Existen preguntas abiertas." : "Sin preguntas abiertas." }
      }
    });
  },

  action(type, label, rationale, evidence, confidence) {
    return {
      type,
      label,
      rationale,
      evidence: evidence || [],
      confidence: confidence || "MEDIUM_CONFIDENCE"
    };
  },

  question(questionId, activityUUID, question, reason, priority, blocksConsolidation, activityName) {
    return {
      questionId,
      activityUUID,
      activityName: activityName || "",
      question,
      reason,
      priority,
      status: "OPEN",
      blocksConsolidation
    };
  },

  findLeanAssessment(activityUUID, sources) {
    const packageData = sources.leanAssessmentPackage;
    return packageData && packageData.activityAssessments ? packageData.activityAssessments.find((item) => item.activityUUID === activityUUID) : null;
  },

  findTocAssessment(activityUUID, sources) {
    const packageData = sources.tocAssessmentPackage;
    return packageData && packageData.activityAssessments ? packageData.activityAssessments.find((item) => item.activityUUID === activityUUID) : null;
  },

  findAutomationAiOpportunity(activityUUID, sources) {
    const packageData = sources.automationAiOpportunityPackage;
    return packageData && packageData.activityOpportunities ? packageData.activityOpportunities.find((item) => item.activityUUID === activityUUID) : null;
  },

  extractLeanWastes(lean) {
    if (!lean) {
      return [];
    }

    if (lean.wastes) {
      return lean.wastes.filter((waste) => waste.detected || waste.existence === "EXISTS");
    }

    if (lean.detectedWastes) {
      return lean.detectedWastes;
    }

    return [];
  },

  evidenceFromSources(...sources) {
    return sources.filter(Boolean).flatMap((source) => source.evidence || source.evidenceUsed || []);
  },

  deduplicateActions(actions) {
    const seen = new Set();
    return actions.filter((action) => {
      if (seen.has(action.type)) {
        return false;
      }

      seen.add(action.type);
      return true;
    });
  },

  resolveActivityConfidence(evidence, actions, questions) {
    if (questions.some((question) => question.blocksConsolidation)) {
      return "INSUFFICIENT_INFORMATION";
    }

    return this.confidenceFromScore(this.average([
      ...evidence.map((item) => this.confidenceScore(item.confidence)),
      ...actions.map((action) => this.confidenceScore(action.confidence))
    ]));
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

  expectedTriangular(min, likely, max) {
    const values = [Number(min), Number(likely), Number(max)].filter((value) => !Number.isNaN(value) && value > 0);

    if (!values.length) {
      return 0;
    }

    return Number(((Number(min) || values[0]) + (4 * (Number(likely) || values[0])) + (Number(max) || values[values.length - 1])) / 6);
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

  textHas(activity, keywords) {
    const text = this.normalizeText([
      activity.name,
      activity.description,
      this.asArray(activity.rules).join(" "),
      this.asArray(activity.documents).join(" "),
      this.asArray(activity.systems).join(" ")
    ].filter(Boolean).join(" "));

    return keywords.some((keyword) => text.indexOf(keyword) >= 0);
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

  addChat(state, author, text) {
    if (!Array.isArray(state.chat)) {
      state.chat = this.createInitialChat();
    }

    state.chat.push({
      messageId: `TOBE-${Date.now()}-${author}`,
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
