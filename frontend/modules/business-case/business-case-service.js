window.BusinessCaseService = Object.seal({
  storageKey: "operational-intelligence.business-case",
  assumedHourlyRate: 25,
  annualWorkHoursPerFte: 1920,

  createState() {
    const sources = this.loadSources();

    return {
      sources,
      selectedInitiativeId: "",
      businessCasePackage: null,
      questions: [],
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `BC-${Date.now()}`,
      author: "consultant",
      text: "Cuantificare beneficios y costos solo con evidencia disponible. Cuando falten datos financieros, dejare la estimacion pendiente y formulare preguntas.",
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
      state.businessCasePackage = saved.businessCasePackage || null;
      state.questions = this.buildQuestions(state.businessCasePackage, state.sources);
      state.selectedInitiativeId = saved.selectedInitiativeId || this.firstInitiativeId(state.businessCasePackage);
      state.chat = saved.chat && saved.chat.length ? saved.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.questions = this.buildQuestions(state.businessCasePackage, state.sources);
    state.lastSavedAt = new Date().toISOString();
    this.syncToKnowledgePackage(state);
    this.syncToContextGraph(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedInitiativeId: state.selectedInitiativeId,
      businessCasePackage: state.businessCasePackage,
      questions: state.questions,
      chat: state.chat,
      lastSavedAt: state.lastSavedAt
    }));
  },

  loadSources() {
    const processState = this.loadProcessState();
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const vsmState = window.IntelligentVsmStudioService ? window.IntelligentVsmStudioService.loadState() : null;
    const dataCollectionState = window.ProcessDataCollectionStudioService ? window.ProcessDataCollectionStudioService.loadState() : null;
    const leanState = window.LeanConsultantService ? window.LeanConsultantService.loadState() : null;
    const tocState = window.TocConsultantService ? window.TocConsultantService.loadState() : null;
    const automationAiState = window.AutomationAiConsultantService ? window.AutomationAiConsultantService.loadState() : null;
    const toBeState = window.ToBeDesignerService ? window.ToBeDesignerService.loadState() : null;

    return {
      businessKnowledgePackage: businessState && businessState.package ? businessState.package : null,
      processState,
      operationalDataState: dataCollectionState,
      vsmState,
      leanAssessmentPackage: leanState ? leanState.assessmentPackage : null,
      tocAssessmentPackage: tocState ? tocState.assessmentPackage : null,
      automationAiOpportunityPackage: automationAiState ? automationAiState.opportunityPackage : null,
      toBePackage: toBeState ? toBeState.toBePackage : null,
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

  generateBusinessCase(state) {
    state.sources = this.loadSources();
    const toBePackage = state.sources.toBePackage;
    const decisions = toBePackage && toBePackage.changeJustifications ? toBePackage.changeJustifications : [];
    const initiatives = decisions.map((decision) => this.buildInitiative(decision, state.sources));
    const operationalBenefits = this.consolidateOperationalBenefits(initiatives, toBePackage);
    const economicBenefits = this.consolidateEconomicBenefits(initiatives);
    const strategicBenefits = this.consolidateStrategicBenefits(initiatives);
    const implementationCosts = this.consolidateCosts(initiatives);
    const financialIndicators = this.calculateFinancialIndicators(economicBenefits, implementationCosts);
    const prioritization = this.buildPrioritization(initiatives);
    const risks = initiatives.flatMap((initiative) => initiative.risks);
    const assumptions = this.buildAssumptions(initiatives);
    const evidenceUsed = initiatives.flatMap((initiative) => initiative.evidence);
    const questions = this.buildQuestions({ initiatives }, state.sources);
    const summary = this.buildSummary(initiatives, financialIndicators, questions);

    state.businessCasePackage = {
      businessCasePackageId: `BC-${Date.now()}`,
      packageType: "BUSINESS_CASE_PACKAGE",
      methodology: "BUSINESS_CASE_GENERATOR",
      status: questions.some((question) => question.blocksConsolidation) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
      version: 1,
      sourcePackages: this.resolveSourcePackages(state.sources),
      decisionTrace: this.createPackageDecisionTrace(initiatives, questions),
      executiveSummary: this.buildExecutiveSummary(summary, financialIndicators),
      initiatives,
      operationalBenefits,
      economicBenefits,
      strategicBenefits,
      implementationCosts,
      financialIndicators,
      prioritization,
      risks,
      assumptions,
      evidenceUsed,
      confidence: summary.averageConfidence,
      questions,
      summary,
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER"
    };
    state.questions = questions;
    state.selectedInitiativeId = this.firstInitiativeId(state.businessCasePackage);
    this.addChat(state, "consultant", `Business Case Package generado: ${initiatives.length} iniciativas, ROI ${financialIndicators.roi}, Payback ${financialIndicators.payback} y ${questions.length} preguntas pendientes.`);
    this.saveState(state);
  },

  buildInitiative(decision, sources) {
    const comparison = decision.comparison || {};
    const evidence = this.collectEvidence(decision, sources);
    const operational = this.calculateOperationalBenefits(decision);
    const economic = this.calculateEconomicBenefits(decision, operational);
    const costs = this.estimateImplementationCosts(decision);
    const financial = this.calculateInitiativeFinancials(economic, costs);
    const strategic = this.identifyStrategicBenefits(decision);
    const risks = this.identifyRisks(decision);
    const assumptions = this.identifyAssumptions(decision, economic, costs);
    const priority = this.classifyPriority(decision, economic, costs);
    const questions = this.buildInitiativeQuestions(decision, operational, economic, costs, evidence);
    const confidence = this.resolveConfidence(evidence, questions, financial);

    return {
      initiativeId: `BCI-${decision.activityUUID || Date.now()}`,
      activityUUID: decision.activityUUID,
      activityName: decision.activityName,
      changeTypes: comparison.changeTypes || decision.actions.map((action) => action.type),
      description: comparison.rationale || decision.actions.map((action) => action.rationale).join(" "),
      operationalBenefits: operational,
      economicBenefits: economic,
      strategicBenefits: strategic,
      implementationCosts: costs,
      financialIndicators: financial,
      priority,
      risks,
      assumptions,
      evidence,
      questions,
      confidence,
      decisionTrace: this.createInitiativeDecisionTrace(decision, evidence, questions, financial)
    };
  },

  calculateOperationalBenefits(decision) {
    const comparison = decision.comparison || {};
    const asIsTime = Number(comparison.asIsTotalTime) || 0;
    const toBeTime = Number(comparison.toBeTotalTime) || 0;
    const timeReduction = Math.max(asIsTime - toBeTime, 0);
    const changeTypes = comparison.changeTypes || decision.actions.map((action) => action.type);

    return {
      leadTimeReduction: timeReduction ? `${timeReduction.toFixed(2)} unidades de tiempo.` : "Pendiente de estimacion",
      processTimeReduction: changeTypes.includes("AUTOMATE") || changeTypes.includes("SIMPLIFY") ? `${(timeReduction * 0.65).toFixed(2)} unidades estimadas.` : "Pendiente de estimacion",
      waitingTimeReduction: changeTypes.includes("PARALLELIZE") || changeTypes.includes("REORDER") ? `${(timeReduction * 0.35).toFixed(2)} unidades estimadas.` : "Pendiente de estimacion",
      reworkReduction: changeTypes.includes("SIMPLIFY") || changeTypes.includes("INCORPORATE_AI") ? "Reduccion potencial por simplificacion, validaciones o asistencia IA." : "Pendiente de estimacion",
      errorReduction: changeTypes.includes("AUTOMATE") || changeTypes.includes("INCORPORATE_AI") ? "Reduccion potencial por automatizacion, controles y validacion asistida." : "Pendiente de estimacion",
      activityReduction: decision.toBeActivity && decision.toBeActivity.status === "ELIMINATED" ? 1 : 0,
      approvalReduction: changeTypes.includes("CENTRALIZE_OR_DECENTRALIZE") || changeTypes.includes("SIMPLIFY") ? "Reduccion potencial de aprobaciones o controles redundantes." : "Pendiente de estimacion",
      productivityIncrease: timeReduction ? `${timeReduction.toFixed(2)} unidades de tiempo liberadas por ejecucion.` : "Pendiente de estimacion",
      numericTimeReduction: timeReduction
    };
  },

  calculateEconomicBenefits(decision, operational) {
    const annualExecutions = this.estimateAnnualExecutions(decision);
    const hoursRecovered = operational.numericTimeReduction && annualExecutions ? (operational.numericTimeReduction * annualExecutions) / 60 : 0;
    const estimatedSavings = hoursRecovered ? hoursRecovered * this.assumedHourlyRate : 0;

    return {
      hoursRecovered: hoursRecovered ? Number(hoursRecovered.toFixed(2)) : "Pendiente de estimacion",
      equivalentHumanHours: hoursRecovered ? Number(hoursRecovered.toFixed(2)) : "Pendiente de estimacion",
      potentialFteReleased: hoursRecovered ? Number((hoursRecovered / this.annualWorkHoursPerFte).toFixed(3)) : "Pendiente de estimacion",
      estimatedSavings: estimatedSavings ? Number(estimatedSavings.toFixed(2)) : "Pendiente de estimacion",
      avoidedCosts: this.resolveAvoidedCosts(decision),
      annualBenefits: estimatedSavings ? Number(estimatedSavings.toFixed(2)) : "Pendiente de estimacion",
      annualExecutions,
      estimationAvailable: Boolean(hoursRecovered && estimatedSavings)
    };
  },

  estimateImplementationCosts(decision) {
    const changeTypes = decision.actions.map((action) => action.type);
    const base = {
      development: "Pendiente de estimacion",
      automation: "Pendiente de estimacion",
      ai: "Pendiente de estimacion",
      training: "Pendiente de estimacion",
      changeManagement: "Pendiente de estimacion",
      licenses: "Pendiente de estimacion",
      infrastructure: "Pendiente de estimacion",
      totalEstimatedCost: "Pendiente de estimacion",
      estimationAvailable: false
    };
    let total = 0;

    if (changeTypes.includes("SIMPLIFY")) {
      total += 1000;
      base.development = 1000;
    }

    if (changeTypes.includes("AUTOMATE")) {
      total += 4000;
      base.automation = 4000;
    }

    if (changeTypes.includes("INCORPORATE_AI")) {
      total += 6000;
      base.ai = 6000;
      base.licenses = 1200;
      total += 1200;
    }

    if (changeTypes.includes("CENTRALIZE_OR_DECENTRALIZE")) {
      total += 2500;
      base.changeManagement = 2500;
      base.training = 1000;
      total += 1000;
    }

    if (total) {
      base.infrastructure = changeTypes.includes("AUTOMATE") || changeTypes.includes("INCORPORATE_AI") ? 1500 : 0;
      total += Number(base.infrastructure) || 0;
      base.totalEstimatedCost = total;
      base.estimationAvailable = true;
    }

    return base;
  },

  calculateInitiativeFinancials(economic, costs) {
    if (!economic.estimationAvailable || !costs.estimationAvailable) {
      return {
        roi: "No aplica",
        payback: "No aplica",
        annualEstimatedBenefit: economic.annualBenefits,
        benefitEffortRatio: "No aplica"
      };
    }

    const annualBenefit = Number(economic.annualBenefits);
    const totalCost = Number(costs.totalEstimatedCost);
    const roi = totalCost ? ((annualBenefit - totalCost) / totalCost) * 100 : 0;
    const payback = annualBenefit ? totalCost / annualBenefit : 0;

    return {
      roi: `${roi.toFixed(1)}%`,
      payback: `${payback.toFixed(2)} anios`,
      annualEstimatedBenefit: Number(annualBenefit.toFixed(2)),
      benefitEffortRatio: totalCost ? Number((annualBenefit / totalCost).toFixed(2)) : "No aplica"
    };
  },

  identifyStrategicBenefits(decision) {
    const changeTypes = decision.actions.map((action) => action.type);

    return {
      traceability: changeTypes.includes("AUTOMATE") || changeTypes.includes("INCORPORATE_AI") ? "Mayor trazabilidad por registros automaticos y validaciones." : "Pendiente de validacion",
      customerExperience: changeTypes.includes("PARALLELIZE") || changeTypes.includes("SIMPLIFY") ? "Mejor experiencia por menor espera y flujo mas simple." : "Pendiente de validacion",
      operationalRiskReduction: changeTypes.includes("SIMPLIFY") || changeTypes.includes("INCORPORATE_AI") ? "Reduccion potencial de riesgo operativo por menos retrabajo y validaciones asistidas." : "Pendiente de validacion",
      compliance: changeTypes.includes("AUTOMATE") || changeTypes.includes("INCORPORATE_AI") ? "Mayor cumplimiento si se registran reglas, excepciones y aprobaciones." : "Pendiente de validacion",
      scalability: changeTypes.includes("AUTOMATE") || changeTypes.includes("CENTRALIZE_OR_DECENTRALIZE") ? "Mayor capacidad de crecimiento con menor dependencia manual." : "Pendiente de validacion"
    };
  },

  identifyRisks(decision) {
    const risks = [];
    const changeTypes = decision.actions.map((action) => action.type);

    if (changeTypes.includes("AUTOMATE")) {
      risks.push(this.risk(decision, "Tecnico", "Dependencia de integraciones, datos y estabilidad de sistemas."));
    }

    if (changeTypes.includes("INCORPORATE_AI")) {
      risks.push(this.risk(decision, "Tecnico", "Riesgo de calidad de datos, validacion humana y precision de IA."));
    }

    if (changeTypes.includes("CENTRALIZE_OR_DECENTRALIZE")) {
      risks.push(this.risk(decision, "Organizacional", "Cambio de roles, capacidades y adopcion."));
    }

    if (changeTypes.includes("ELIMINATE")) {
      risks.push(this.risk(decision, "Operativo", "Eliminar actividad puede afectar control, cumplimiento o experiencia si no se valida."));
    }

    return risks;
  },

  risk(decision, type, description) {
    return {
      initiativeId: `BCI-${decision.activityUUID}`,
      activityName: decision.activityName,
      type,
      description,
      severity: type === "Tecnico" ? "Media" : "Alta"
    };
  },

  identifyAssumptions(decision, economic, costs) {
    const assumptions = [];

    assumptions.push("Los tiempos As-Is y To-Be provienen del Process Model y To-Be Package disponibles.");
    assumptions.push(`La tarifa horaria usada para estimacion preliminar es ${this.assumedHourlyRate}.`);

    if (!economic.estimationAvailable) {
      assumptions.push("Beneficio economico pendiente por falta de frecuencia o tiempo suficiente.");
    }

    if (!costs.estimationAvailable) {
      assumptions.push("Costo de implementacion pendiente por falta de alcance tecnico detallado.");
    }

    return assumptions;
  },

  buildInitiativeQuestions(decision, operational, economic, costs, evidence) {
    const questions = [];
    const add = (question, reason, priority, blocksConsolidation) => {
      questions.push({
        questionId: `BCQ-${decision.activityUUID}-${questions.length + 1}`,
        initiativeId: `BCI-${decision.activityUUID}`,
        activityName: decision.activityName,
        question,
        reason,
        priority,
        status: "OPEN",
        blocksConsolidation
      });
    };

    if (!evidence.length) {
      add("Que evidencia respalda esta iniciativa y su impacto esperado?", "El Business Case no debe cuantificar beneficios sin evidencia.", "Alta", true);
    }

    if (!economic.estimationAvailable) {
      add("Cual es la frecuencia anual, tiempo real y costo horario aplicable a esta actividad?", "Sin estos datos no se calculan horas recuperadas, FTE, ahorro ni ROI.", "Alta", false);
    }

    if (!costs.estimationAvailable) {
      add("Cual es el costo estimado de desarrollo, automatizacion, IA, licencias, infraestructura y gestion del cambio?", "Sin costos no se calcula ROI ni Payback.", "Alta", false);
    }

    return questions;
  },

  classifyPriority(decision, economic, costs) {
    const changeTypes = decision.actions.map((action) => action.type);
    const totalCost = Number(costs.totalEstimatedCost) || 0;
    const annualBenefit = Number(economic.annualBenefits) || 0;

    if ((changeTypes.includes("SIMPLIFY") || changeTypes.includes("AUTOMATE")) && totalCost <= 5000) {
      return "Quick Win";
    }

    if (annualBenefit && totalCost && annualBenefit >= totalCost) {
      return "Corto Plazo";
    }

    if (changeTypes.includes("INCORPORATE_AI") || totalCost > 8000) {
      return "Mediano Plazo";
    }

    return "Largo Plazo";
  },

  consolidateOperationalBenefits(initiatives, toBePackage) {
    return {
      leadTimeReduction: toBePackage && toBePackage.comparison ? toBePackage.comparison.expectedTimeBenefit : "Pendiente de estimacion",
      processTimeReduction: initiatives.filter((item) => item.operationalBenefits.processTimeReduction !== "Pendiente de estimacion").length,
      waitingTimeReduction: initiatives.filter((item) => item.operationalBenefits.waitingTimeReduction !== "Pendiente de estimacion").length,
      reworkReduction: initiatives.filter((item) => item.operationalBenefits.reworkReduction !== "Pendiente de estimacion").length,
      errorReduction: initiatives.filter((item) => item.operationalBenefits.errorReduction !== "Pendiente de estimacion").length,
      activityReduction: initiatives.reduce((total, item) => total + item.operationalBenefits.activityReduction, 0),
      approvalReduction: initiatives.filter((item) => item.operationalBenefits.approvalReduction !== "Pendiente de estimacion").length,
      productivityIncrease: initiatives.filter((item) => item.operationalBenefits.productivityIncrease !== "Pendiente de estimacion").length
    };
  },

  consolidateEconomicBenefits(initiatives) {
    const estimated = initiatives.filter((item) => item.economicBenefits.estimationAvailable);
    const annualBenefits = estimated.reduce((total, item) => total + Number(item.economicBenefits.annualBenefits || 0), 0);
    const hoursRecovered = estimated.reduce((total, item) => total + Number(item.economicBenefits.hoursRecovered || 0), 0);

    return {
      hoursRecovered: estimated.length ? Number(hoursRecovered.toFixed(2)) : "Pendiente de estimacion",
      equivalentHumanHours: estimated.length ? Number(hoursRecovered.toFixed(2)) : "Pendiente de estimacion",
      potentialFteReleased: estimated.length ? Number((hoursRecovered / this.annualWorkHoursPerFte).toFixed(3)) : "Pendiente de estimacion",
      estimatedSavings: estimated.length ? Number(annualBenefits.toFixed(2)) : "Pendiente de estimacion",
      avoidedCosts: initiatives.flatMap((item) => item.economicBenefits.avoidedCosts).filter((item) => item !== "Pendiente de estimacion"),
      annualBenefits: estimated.length ? Number(annualBenefits.toFixed(2)) : "Pendiente de estimacion"
    };
  },

  consolidateStrategicBenefits(initiatives) {
    return {
      traceability: initiatives.filter((item) => item.strategicBenefits.traceability !== "Pendiente de validacion").length,
      customerExperience: initiatives.filter((item) => item.strategicBenefits.customerExperience !== "Pendiente de validacion").length,
      operationalRiskReduction: initiatives.filter((item) => item.strategicBenefits.operationalRiskReduction !== "Pendiente de validacion").length,
      compliance: initiatives.filter((item) => item.strategicBenefits.compliance !== "Pendiente de validacion").length,
      scalability: initiatives.filter((item) => item.strategicBenefits.scalability !== "Pendiente de validacion").length
    };
  },

  consolidateCosts(initiatives) {
    const estimated = initiatives.filter((item) => item.implementationCosts.estimationAvailable);
    const total = estimated.reduce((sum, item) => sum + Number(item.implementationCosts.totalEstimatedCost || 0), 0);

    return {
      development: this.sumCost(estimated, "development"),
      automation: this.sumCost(estimated, "automation"),
      ai: this.sumCost(estimated, "ai"),
      training: this.sumCost(estimated, "training"),
      changeManagement: this.sumCost(estimated, "changeManagement"),
      licenses: this.sumCost(estimated, "licenses"),
      infrastructure: this.sumCost(estimated, "infrastructure"),
      totalEstimatedCost: estimated.length ? total : "Pendiente de estimacion",
      estimationAvailable: Boolean(estimated.length)
    };
  },

  calculateFinancialIndicators(economicBenefits, implementationCosts) {
    if (economicBenefits.annualBenefits === "Pendiente de estimacion" || implementationCosts.totalEstimatedCost === "Pendiente de estimacion") {
      return {
        roi: "No aplica",
        payback: "No aplica",
        annualEstimatedBenefit: economicBenefits.annualBenefits,
        benefitEffortRatio: "No aplica"
      };
    }

    const annualBenefit = Number(economicBenefits.annualBenefits);
    const totalCost = Number(implementationCosts.totalEstimatedCost);
    const roi = totalCost ? ((annualBenefit - totalCost) / totalCost) * 100 : 0;

    return {
      roi: `${roi.toFixed(1)}%`,
      payback: annualBenefit ? `${(totalCost / annualBenefit).toFixed(2)} anios` : "No aplica",
      annualEstimatedBenefit: annualBenefit,
      benefitEffortRatio: totalCost ? Number((annualBenefit / totalCost).toFixed(2)) : "No aplica"
    };
  },

  buildPrioritization(initiatives) {
    return ["Quick Win", "Corto Plazo", "Mediano Plazo", "Largo Plazo"].map((priority) => ({
      priority,
      initiatives: initiatives.filter((item) => item.priority === priority).map((item) => ({
        initiativeId: item.initiativeId,
        activityName: item.activityName,
        annualBenefits: item.economicBenefits.annualBenefits,
        totalEstimatedCost: item.implementationCosts.totalEstimatedCost,
        confidence: item.confidence
      }))
    }));
  },

  buildQuestions(packageData, sources) {
    const questions = [];

    if (!sources.toBePackage) {
      questions.push({
        questionId: "BCQ-TOBE",
        question: "Existe un To-Be Package vigente para cuantificar el caso de negocio?",
        reason: "El Business Case Generator consume el proceso futuro; no construye To-Be.",
        priority: "Alta",
        status: "OPEN",
        blocksConsolidation: true
      });
    }

    if (packageData && packageData.initiatives) {
      packageData.initiatives.forEach((initiative) => initiative.questions.forEach((question) => questions.push(question)));
    }

    return questions;
  },

  buildSummary(initiatives, financialIndicators, questions) {
    return {
      totalInitiatives: initiatives.length,
      quickWins: initiatives.filter((item) => item.priority === "Quick Win").length,
      estimatedInitiatives: initiatives.filter((item) => item.economicBenefits.estimationAvailable).length,
      annualEstimatedBenefit: financialIndicators.annualEstimatedBenefit,
      roi: financialIndicators.roi,
      payback: financialIndicators.payback,
      pendingQuestions: questions.length,
      averageConfidence: this.confidenceFromScore(this.average(initiatives.map((item) => this.confidenceScore(item.confidence))))
    };
  },

  buildExecutiveSummary(summary, financialIndicators) {
    if (!summary.totalInitiatives) {
      return "No existen iniciativas To-Be para construir el Business Case.";
    }

    return `Se evaluaron ${summary.totalInitiatives} iniciativas, con ${summary.quickWins} Quick Wins y ${summary.estimatedInitiatives} iniciativas con beneficio economico estimado. Beneficio anual: ${financialIndicators.annualEstimatedBenefit}. ROI: ${financialIndicators.roi}. Payback: ${financialIndicators.payback}. Confianza consolidada: ${summary.averageConfidence}.`;
  },

  collectEvidence(decision, sources) {
    const evidence = [];
    const add = (category, sourceType, sourceName, fragment, confidence) => {
      if (!fragment) {
        return;
      }

      evidence.push({
        evidenceId: `BCE-${decision.activityUUID || Date.now()}-${evidence.length + 1}`,
        category,
        sourceType,
        sourceName: sourceName || "Fuente no especificada",
        fragment: String(fragment),
        confidence: confidence || "MEDIUM_CONFIDENCE",
        date: new Date().toISOString()
      });
    };

    (decision.evidence || []).forEach((item) => add(item.category || "TO_BE_EVIDENCE", item.sourceType || "TO_BE_PACKAGE", item.sourceName, item.fragment, item.confidence));
    add("TO_BE_COMPARISON", "TO_BE_PACKAGE", "Comparativo As-Is vs To-Be", decision.comparison && `Antes ${decision.comparison.asIsTotalTime}; despues ${decision.comparison.toBeTotalTime}; beneficio ${decision.comparison.expectedBenefit}.`, decision.confidence);
    add("TO_BE_DECISION", "TO_BE_PACKAGE", decision.activityName, decision.actions.map((action) => action.rationale).join(" "), decision.confidence);
    if (sources.automationAiOpportunityPackage) {
      add("AUTOMATION_AI", "AUTOMATION_AI_OPPORTUNITY_PACKAGE", "Automation & AI Opportunity Package", "Paquete digital utilizado para estimar automatizacion, IA y costos preliminares.", "MEDIUM_CONFIDENCE");
    }

    return evidence;
  },

  createPackageDecisionTrace(initiatives, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "BUSINESS_CASE_PACKAGE",
      subjectId: `BC-${Date.now()}`,
      consultant: "Business Case Generator",
      evidence: initiatives.flatMap((initiative) => initiative.evidence),
      assumptions: this.buildAssumptions(initiatives),
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: "Se comprendieron iniciativas To-Be y paquetes de diagnostico." },
        VALIDATE: { output: "Se valido evidencia antes de cuantificar." },
        DIAGNOSE: { output: "Se identificaron beneficios, costos, riesgos y dependencias." },
        QUANTIFY: { output: "Se calcularon beneficios economicos cuando existian tiempo y frecuencia." },
        PROPOSE: { output: "Se genero Business Case Package." },
        JUSTIFY: { output: "Cada iniciativa conserva evidencia, supuestos y confianza." },
        ESTIMATE: { output: "ROI y Payback se calculan solo con datos suficientes." },
        WARN: { output: "Riesgos y dependencias registrados." },
        ASK: { output: questions.length ? "Existen preguntas pendientes." : "Sin preguntas pendientes." }
      }
    });
  },

  createInitiativeDecisionTrace(decision, evidence, questions, financial) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "BUSINESS_CASE_INITIATIVE",
      subjectId: `BCI-${decision.activityUUID}`,
      consultant: "Business Case Generator",
      evidence,
      assumptions: [],
      missingInformation: questions.map((question) => question.question),
      stages: {
        UNDERSTAND: { output: decision.activityName },
        VALIDATE: { output: evidence.length ? "Evidencia disponible." : "Evidencia insuficiente." },
        DIAGNOSE: { output: decision.actions.map((action) => action.label).join(", ") },
        QUANTIFY: { output: `ROI ${financial.roi}; Payback ${financial.payback}.` },
        PROPOSE: { output: "Iniciativa cuantificada para Business Case." },
        JUSTIFY: { output: decision.actions.map((action) => action.rationale).join(" ") },
        ESTIMATE: { output: "Beneficios y costos estimados cuando aplica." },
        WARN: { output: "Riesgos y supuestos registrados." },
        ASK: { output: questions.length ? "Existen preguntas abiertas." : "Sin preguntas abiertas." }
      }
    });
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.businessCasePackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.businessCasePackage = state.businessCasePackage;
    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(state) {
    if (!window.ContextBuilderService || !state.businessCasePackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    state.businessCasePackage.initiatives.forEach((initiative) => {
      graph.nodes.push({
        id: initiative.initiativeId,
        type: "BUSINESS_CASE_INITIATIVE",
        label: `${initiative.activityName} / ${initiative.priority}`
      });
      graph.edges.push({ from: initiative.activityUUID, to: initiative.initiativeId, type: "HAS_BUSINESS_CASE" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  resolveSourcePackages(sources) {
    return {
      knowledgePackageId: sources.knowledgePackage ? sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: sources.contextGraph ? sources.contextGraph.contextGraphId : "",
      asIsProcessModelId: sources.processState.draftProcessModel ? sources.processState.draftProcessModel.processModelId : "",
      toBePackageId: sources.toBePackage ? sources.toBePackage.toBePackageId : "",
      leanAssessmentPackageId: sources.leanAssessmentPackage ? sources.leanAssessmentPackage.leanAssessmentPackageId : "",
      tocAssessmentPackageId: sources.tocAssessmentPackage ? sources.tocAssessmentPackage.tocAssessmentPackageId : "",
      automationAiOpportunityPackageId: sources.automationAiOpportunityPackage ? sources.automationAiOpportunityPackage.automationAiOpportunityPackageId : ""
    };
  },

  estimateAnnualExecutions(decision) {
    const toBeActivity = decision.toBeActivity || {};
    const frequency = toBeActivity.frequency || {};
    return Number(frequency.perYear || frequency.annual || 0) || 250;
  },

  resolveAvoidedCosts(decision) {
    const changeTypes = decision.actions.map((action) => action.type);
    const costs = [];

    if (changeTypes.includes("SIMPLIFY")) {
      costs.push("Costos evitados por retrabajo y sobreproceso.");
    }

    if (changeTypes.includes("AUTOMATE")) {
      costs.push("Costos evitados por digitacion manual y errores operativos.");
    }

    if (changeTypes.includes("INCORPORATE_AI")) {
      costs.push("Costos evitados por clasificacion, extraccion o asistencia manual.");
    }

    return costs.length ? costs : ["Pendiente de estimacion"];
  },

  sumCost(initiatives, key) {
    const total = initiatives.reduce((sum, item) => sum + (Number(item.implementationCosts[key]) || 0), 0);
    return total || "Pendiente de estimacion";
  },

  buildAssumptions(initiatives) {
    if (!Array.isArray(initiatives)) {
      return [];
    }

    return [...new Set(initiatives.flatMap((initiative) => initiative.assumptions || []))];
  },

  resolveConfidence(evidence, questions, financial) {
    if (questions.some((question) => question.blocksConsolidation)) {
      return "INSUFFICIENT_INFORMATION";
    }

    const base = this.average(evidence.map((item) => this.confidenceScore(item.confidence)));
    const financialPenalty = financial.roi === "No aplica" ? -15 : 0;
    return this.confidenceFromScore(base + financialPenalty);
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

  addChat(state, author, text) {
    if (!Array.isArray(state.chat)) {
      state.chat = this.createInitialChat();
    }

    state.chat.push({
      messageId: `BC-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  firstInitiativeId(packageData) {
    return packageData && packageData.initiatives && packageData.initiatives[0] ? packageData.initiatives[0].initiativeId : "";
  }
});
