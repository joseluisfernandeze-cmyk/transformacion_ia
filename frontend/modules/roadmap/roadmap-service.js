window.RoadmapService = Object.seal({
  storageKey: "operational-intelligence.roadmap",

  horizons: [
    { id: "QUICK_WINS", label: "Quick Wins", timeframe: "0-30 dias", priorities: ["Quick Win"] },
    { id: "SHORT_TERM", label: "Corto Plazo", timeframe: "1-3 meses", priorities: ["Corto Plazo"] },
    { id: "MEDIUM_TERM", label: "Mediano Plazo", timeframe: "3-6 meses", priorities: ["Mediano Plazo"] },
    { id: "LONG_TERM", label: "Largo Plazo", timeframe: "6-12 meses", priorities: ["Largo Plazo"] }
  ],

  createState() {
    return {
      sources: this.loadSources(),
      selectedPhaseId: "",
      roadmapPackage: null,
      questions: [],
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `RM-${Date.now()}`,
      author: "consultant",
      text: "Convertire el Business Case en un Roadmap ejecutable por horizontes y fases, sin fechas reales ni Gantt.",
      createdAt: new Date().toISOString()
    }];
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      const saved = rawState ? JSON.parse(rawState) : {};
      const state = { ...this.createState(), ...saved };
      state.sources = this.loadSources();
      state.roadmapPackage = saved.roadmapPackage || null;
      state.questions = this.buildQuestions(state.roadmapPackage, state.sources);
      state.selectedPhaseId = saved.selectedPhaseId || this.firstPhaseId(state.roadmapPackage);
      state.chat = saved.chat && saved.chat.length ? saved.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.questions = this.buildQuestions(state.roadmapPackage, state.sources);
    state.lastSavedAt = new Date().toISOString();
    this.syncToKnowledgePackage(state);
    this.syncToContextGraph(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedPhaseId: state.selectedPhaseId,
      roadmapPackage: state.roadmapPackage,
      questions: state.questions,
      chat: state.chat,
      lastSavedAt: state.lastSavedAt
    }));
  },

  loadSources() {
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const processState = window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : { draftProcessModel: null };
    const leanState = window.LeanConsultantService ? window.LeanConsultantService.loadState() : null;
    const tocState = window.TocConsultantService ? window.TocConsultantService.loadState() : null;
    const automationAiState = window.AutomationAiConsultantService ? window.AutomationAiConsultantService.loadState() : null;
    const toBeState = window.ToBeDesignerService ? window.ToBeDesignerService.loadState() : null;
    const businessCaseState = window.BusinessCaseService ? window.BusinessCaseService.loadState() : null;

    return {
      businessKnowledgePackage: businessState && businessState.package ? businessState.package : null,
      processState,
      knowledgePackage: contextState && contextState.result ? contextState.result.knowledgePackage : null,
      contextGraph: contextState && contextState.result ? contextState.result.contextGraph : null,
      leanAssessmentPackage: leanState ? leanState.assessmentPackage : null,
      tocAssessmentPackage: tocState ? tocState.assessmentPackage : null,
      automationAiOpportunityPackage: automationAiState ? automationAiState.opportunityPackage : null,
      toBePackage: toBeState ? toBeState.toBePackage : null,
      businessCasePackage: businessCaseState ? businessCaseState.businessCasePackage : null
    };
  },

  generateRoadmap(state) {
    state.sources = this.loadSources();
    const businessCasePackage = state.sources.businessCasePackage;
    const initiatives = businessCasePackage && businessCasePackage.initiatives ? businessCasePackage.initiatives.map((initiative, index) => this.buildRoadmapInitiative(initiative, index, state.sources)) : [];
    const groupedInitiatives = this.groupByHorizon(initiatives);
    const phases = this.buildPhases(groupedInitiatives);
    const dependencies = this.buildDependencies(initiatives, phases);
    const resources = this.buildResources(initiatives);
    const risks = this.buildRisks(initiatives);
    const assumptions = this.buildAssumptions(initiatives);
    const evidenceUsed = initiatives.flatMap((initiative) => initiative.evidence);
    const questions = this.buildQuestions({ initiatives }, state.sources);
    const summary = this.buildSummary(initiatives, phases, questions);

    state.roadmapPackage = {
      roadmapPackageId: `RM-${Date.now()}`,
      packageType: "ROADMAP_PACKAGE",
      methodology: "TRANSFORMATION_ROADMAP_GENERATOR",
      status: questions.some((question) => question.blocksConsolidation) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
      version: 1,
      sourcePackages: this.resolveSourcePackages(state.sources),
      decisionTrace: this.createPackageDecisionTrace(initiatives, questions),
      executiveSummary: this.buildExecutiveSummary(summary),
      phases,
      prioritizedInitiatives: initiatives,
      dependencies,
      resources,
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
    state.selectedPhaseId = this.firstPhaseId(state.roadmapPackage);
    this.addChat(state, "consultant", `Roadmap Package generado: ${phases.length} fases, ${initiatives.length} iniciativas y ${questions.length} preguntas pendientes.`);
    this.saveState(state);
  },

  buildRoadmapInitiative(initiative, index, sources) {
    const priority = initiative.priority || "Largo Plazo";
    const horizon = this.resolveHorizon(priority);
    const complexity = this.resolveComplexity(initiative);
    const dependencies = this.resolveInitiativeDependencies(initiative, sources);
    const risks = this.resolveInitiativeRisks(initiative);
    const evidence = this.collectEvidence(initiative, sources);
    const questions = this.buildInitiativeQuestions(initiative, evidence);
    const confidence = this.resolveConfidence(evidence, questions);

    return {
      roadmapInitiativeId: `RMI-${initiative.initiativeId || index + 1}`,
      sourceInitiativeId: initiative.initiativeId,
      activityUUID: initiative.activityUUID,
      name: initiative.activityName || `Iniciativa ${index + 1}`,
      objective: this.resolveObjective(initiative),
      description: initiative.description || "Iniciativa derivada del Business Case.",
      expectedBenefit: this.resolveExpectedBenefit(initiative),
      priority,
      horizon,
      dependencies,
      risks,
      suggestedResponsible: this.resolveResponsible(initiative),
      responsibleArea: this.resolveArea(initiative),
      estimatedEffort: this.resolveEffort(initiative),
      complexity,
      confidence,
      evidence,
      questions,
      executionOrder: index + 1,
      decisionTrace: this.createInitiativeDecisionTrace(initiative, evidence, questions)
    };
  },

  groupByHorizon(initiatives) {
    return this.horizons.map((horizon) => ({
      ...horizon,
      initiatives: initiatives.filter((initiative) => initiative.horizon.id === horizon.id)
    }));
  },

  buildPhases(groupedInitiatives) {
    return groupedInitiatives.filter((group) => group.initiatives.length).map((group, index) => ({
      phaseId: `PH-${index + 1}-${group.id}`,
      sequence: index + 1,
      name: group.label,
      timeframe: group.timeframe,
      objective: this.phaseObjective(group),
      initiatives: group.initiatives.map((initiative) => initiative.roadmapInitiativeId),
      deliverables: this.phaseDeliverables(group),
      dependencies: this.unique(group.initiatives.flatMap((initiative) => initiative.dependencies)),
      risks: this.unique(group.initiatives.flatMap((initiative) => initiative.risks.map((risk) => risk.description))),
      successCriteria: this.phaseSuccessCriteria(group),
      confidence: this.confidenceFromScore(this.average(group.initiatives.map((initiative) => this.confidenceScore(initiative.confidence))))
    }));
  },

  buildDependencies(initiatives, phases) {
    const dependencies = initiatives.flatMap((initiative) => initiative.dependencies.map((dependency) => ({
      initiativeId: initiative.roadmapInitiativeId,
      initiativeName: initiative.name,
      dependency
    })));

    phases.forEach((phase, index) => {
      if (index > 0) {
        dependencies.push({
          initiativeId: phase.phaseId,
          initiativeName: phase.name,
          dependency: `Completar fase previa: ${phases[index - 1].name}.`
        });
      }
    });

    return dependencies;
  },

  buildResources(initiatives) {
    return {
      involvedAreas: this.unique(initiatives.map((initiative) => initiative.responsibleArea)),
      suggestedRoles: this.unique(initiatives.flatMap((initiative) => this.rolesForInitiative(initiative))),
      requiredTeams: this.unique(initiatives.flatMap((initiative) => this.teamsForInitiative(initiative)))
    };
  },

  buildRisks(initiatives) {
    return initiatives.flatMap((initiative) => initiative.risks.map((risk) => ({
      initiativeId: initiative.roadmapInitiativeId,
      initiativeName: initiative.name,
      ...risk
    })));
  },

  buildAssumptions(initiatives) {
    const assumptions = [
      "El roadmap no contiene fechas calendario ni cronograma Gantt.",
      "Los horizontes se derivan de la prioridad del Business Case.",
      "Las dependencias tecnicas y organizacionales deben validarse antes de ejecucion."
    ];

    initiatives.forEach((initiative) => {
      if (initiative.expectedBenefit === "Pendiente de estimacion") {
        assumptions.push(`${initiative.name}: beneficio pendiente de cuantificacion completa.`);
      }
    });

    return this.unique(assumptions);
  },

  buildQuestions(packageData, sources) {
    const questions = [];

    if (!sources.businessCasePackage) {
      questions.push({
        questionId: "RMQ-BUSINESS-CASE",
        question: "Existe un Business Case Package vigente para construir el Roadmap?",
        reason: "El Roadmap Generator consume el Business Case; no cuantifica beneficios.",
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

  buildInitiativeQuestions(initiative, evidence) {
    const questions = [];
    const add = (question, reason, priority, blocksConsolidation) => {
      questions.push({
        questionId: `RMQ-${initiative.initiativeId || initiative.activityUUID}-${questions.length + 1}`,
        initiativeId: initiative.initiativeId,
        initiativeName: initiative.activityName,
        question,
        reason,
        priority,
        status: "OPEN",
        blocksConsolidation
      });
    };

    if (!evidence.length) {
      add("Que evidencia respalda esta iniciativa y su prioridad?", "No se debe planificar una iniciativa sin evidencia del Business Case.", "Alta", true);
    }

    if (!initiative.risks || !initiative.risks.length) {
      add("Que riesgos o dependencias deben considerarse para esta iniciativa?", "La ejecucion requiere riesgos y dependencias explicitas.", "Media", false);
    }

    return questions;
  },

  buildSummary(initiatives, phases, questions) {
    return {
      totalInitiatives: initiatives.length,
      totalPhases: phases.length,
      quickWins: initiatives.filter((initiative) => initiative.horizon.id === "QUICK_WINS").length,
      shortTerm: initiatives.filter((initiative) => initiative.horizon.id === "SHORT_TERM").length,
      mediumTerm: initiatives.filter((initiative) => initiative.horizon.id === "MEDIUM_TERM").length,
      longTerm: initiatives.filter((initiative) => initiative.horizon.id === "LONG_TERM").length,
      pendingQuestions: questions.length,
      averageConfidence: this.confidenceFromScore(this.average(initiatives.map((initiative) => this.confidenceScore(initiative.confidence))))
    };
  },

  buildExecutiveSummary(summary) {
    if (!summary.totalInitiatives) {
      return "No existen iniciativas del Business Case para construir el Roadmap.";
    }

    return `Se genero un Roadmap con ${summary.totalInitiatives} iniciativas en ${summary.totalPhases} fases: ${summary.quickWins} Quick Wins, ${summary.shortTerm} de corto plazo, ${summary.mediumTerm} de mediano plazo y ${summary.longTerm} de largo plazo. Confianza consolidada: ${summary.averageConfidence}.`;
  },

  collectEvidence(initiative, sources) {
    const evidence = [];
    const add = (category, sourceType, sourceName, fragment, confidence) => {
      if (!fragment) {
        return;
      }

      evidence.push({
        evidenceId: `RME-${initiative.initiativeId || Date.now()}-${evidence.length + 1}`,
        category,
        sourceType,
        sourceName: sourceName || "Fuente no especificada",
        fragment: String(fragment),
        confidence: confidence || "MEDIUM_CONFIDENCE",
        date: new Date().toISOString()
      });
    };

    (initiative.evidence || []).forEach((item) => add(item.category || "BUSINESS_CASE_EVIDENCE", item.sourceType || "BUSINESS_CASE_PACKAGE", item.sourceName, item.fragment, item.confidence));
    add("BUSINESS_CASE", "BUSINESS_CASE_PACKAGE", initiative.activityName, `${initiative.priority}; ROI ${initiative.financialIndicators && initiative.financialIndicators.roi}; Payback ${initiative.financialIndicators && initiative.financialIndicators.payback}.`, initiative.confidence);
    if (sources.toBePackage) {
      add("TO_BE", "TO_BE_PACKAGE", "To-Be Package", "Proceso futuro utilizado como base del Roadmap.", sources.toBePackage.confidence);
    }

    return evidence;
  },

  resolveObjective(initiative) {
    const changes = initiative.changeTypes || [];

    if (changes.includes("AUTOMATE")) {
      return "Implementar automatizacion para reducir trabajo manual y errores.";
    }

    if (changes.includes("INCORPORATE_AI")) {
      return "Incorporar capacidades IA con validacion humana.";
    }

    if (changes.includes("SIMPLIFY")) {
      return "Simplificar el proceso y reducir retrabajo.";
    }

    return "Ejecutar mejora priorizada del Business Case.";
  },

  resolveExpectedBenefit(initiative) {
    return initiative.economicBenefits && initiative.economicBenefits.annualBenefits !== "Pendiente de estimacion"
      ? `Beneficio anual estimado: ${initiative.economicBenefits.annualBenefits}.`
      : initiative.operationalBenefits && initiative.operationalBenefits.productivityIncrease
        ? initiative.operationalBenefits.productivityIncrease
        : "Pendiente de estimacion";
  },

  resolveHorizon(priority) {
    return this.horizons.find((horizon) => horizon.priorities.includes(priority)) || this.horizons[3];
  },

  resolveComplexity(initiative) {
    const changes = initiative.changeTypes || [];
    const cost = Number(initiative.implementationCosts && initiative.implementationCosts.totalEstimatedCost) || 0;

    if (changes.includes("INCORPORATE_AI") || cost > 10000) {
      return "Alta";
    }

    if (changes.includes("AUTOMATE") || cost > 4000) {
      return "Media";
    }

    return "Baja";
  },

  resolveEffort(initiative) {
    const complexity = this.resolveComplexity(initiative);

    if (complexity === "Alta") {
      return "Alto";
    }

    if (complexity === "Media") {
      return "Medio";
    }

    return "Bajo";
  },

  resolveInitiativeDependencies(initiative, sources) {
    const dependencies = [];
    const changes = initiative.changeTypes || [];

    if (changes.includes("AUTOMATE")) {
      dependencies.push("Disponibilidad de integraciones y acceso a sistemas.");
    }

    if (changes.includes("INCORPORATE_AI")) {
      dependencies.push("Datos validados, criterios de aceptacion y gobierno IA.");
    }

    if (changes.includes("CENTRALIZE_OR_DECENTRALIZE")) {
      dependencies.push("Alineacion organizacional y aprobacion de cambios de rol.");
    }

    if (sources.toBePackage) {
      dependencies.push("To-Be Package aprobado.");
    }

    return this.unique(dependencies);
  },

  resolveInitiativeRisks(initiative) {
    const risks = initiative.risks && initiative.risks.length ? initiative.risks.map((risk) => ({
      type: risk.type || "Riesgo",
      description: risk.description || risk.risk || "Riesgo pendiente de detalle.",
      severity: risk.severity || "Media"
    })) : [];

    if (!risks.length) {
      risks.push({ type: "Ejecucion", description: "Riesgos pendientes de validacion.", severity: "Media" });
    }

    return risks;
  },

  resolveResponsible(initiative) {
    const changes = initiative.changeTypes || [];

    if (changes.includes("AUTOMATE") || changes.includes("INCORPORATE_AI")) {
      return "Lider de Automatizacion / Tecnologia";
    }

    if (changes.includes("CENTRALIZE_OR_DECENTRALIZE")) {
      return "Lider de Transformacion Organizacional";
    }

    return "Lider de Proceso";
  },

  resolveArea(initiative) {
    if (initiative.activityName && initiative.activityName.toLowerCase().indexOf("factura") >= 0) {
      return "Finanzas";
    }

    const changes = initiative.changeTypes || [];

    if (changes.includes("AUTOMATE") || changes.includes("INCORPORATE_AI")) {
      return "Tecnologia";
    }

    return "Operacion";
  },

  rolesForInitiative(initiative) {
    const roles = ["Product Owner", "Consultor de Procesos"];
    const changes = initiative.changeTypes || [];

    if (changes.includes("AUTOMATE")) {
      roles.push("Especialista de Automatizacion");
    }

    if (changes.includes("INCORPORATE_AI")) {
      roles.push("Especialista IA", "Data Owner");
    }

    if (changes.includes("CENTRALIZE_OR_DECENTRALIZE")) {
      roles.push("Change Manager");
    }

    return roles;
  },

  teamsForInitiative(initiative) {
    const teams = [initiative.responsibleArea || "Operacion"];
    const changes = initiative.changeTypes || [];

    if (changes.includes("AUTOMATE") || changes.includes("INCORPORATE_AI")) {
      teams.push("Tecnologia");
    }

    if (changes.includes("CENTRALIZE_OR_DECENTRALIZE")) {
      teams.push("Gestion del Cambio");
    }

    return teams;
  },

  phaseObjective(group) {
    const map = {
      QUICK_WINS: "Capturar beneficios rapidos y reducir friccion operativa inicial.",
      SHORT_TERM: "Implementar mejoras de bajo a medio esfuerzo con impacto visible.",
      MEDIUM_TERM: "Ejecutar automatizaciones, IA o cambios de mayor coordinacion.",
      LONG_TERM: "Completar iniciativas complejas y estabilizar capacidades futuras."
    };

    return map[group.id] || "Ejecutar iniciativas priorizadas.";
  },

  phaseDeliverables(group) {
    return [
      "Iniciativas implementadas o listas para validacion.",
      "Evidencia de cumplimiento de criterios de exito.",
      "Riesgos y dependencias actualizados.",
      `${group.label} cerrado con aprobacion humana.`
    ];
  },

  phaseSuccessCriteria(group) {
    return [
      "Iniciativas completadas segun orden recomendado.",
      "Beneficios esperados validados por responsable de proceso.",
      "Dependencias criticas resueltas.",
      "Riesgos residuales documentados."
    ];
  },

  createPackageDecisionTrace(initiatives, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "ROADMAP_PACKAGE",
      subjectId: `RM-${Date.now()}`,
      consultant: "Transformation Roadmap Generator",
      evidence: initiatives.flatMap((initiative) => initiative.evidence),
      assumptions: this.buildAssumptions(initiatives),
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: "Se comprendieron iniciativas y beneficios del Business Case." },
        VALIDATE: { output: "Se valido evidencia antes de ordenar iniciativas." },
        DIAGNOSE: { output: "Se identificaron dependencias, riesgos, recursos y horizontes." },
        QUANTIFY: { output: "Se reutilizaron beneficios del Business Case; no se recalcularon beneficios." },
        PROPOSE: { output: "Se genero Roadmap Package por fases." },
        JUSTIFY: { output: "Cada iniciativa mantiene evidencia, prioridad y confianza." },
        ESTIMATE: { output: "Esfuerzo y complejidad se estimaron por tipo de cambio y costo." },
        WARN: { output: "Riesgos y dependencias consolidados." },
        ASK: { output: questions.length ? "Existen preguntas pendientes." : "Sin preguntas pendientes." }
      }
    });
  },

  createInitiativeDecisionTrace(initiative, evidence, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "ROADMAP_INITIATIVE",
      subjectId: initiative.initiativeId,
      consultant: "Transformation Roadmap Generator",
      evidence,
      assumptions: [],
      missingInformation: questions.map((question) => question.question),
      stages: {
        UNDERSTAND: { output: initiative.activityName || initiative.initiativeId },
        VALIDATE: { output: evidence.length ? "Evidencia disponible." : "Evidencia insuficiente." },
        DIAGNOSE: { output: initiative.priority || "" },
        QUANTIFY: { output: "Beneficio esperado tomado del Business Case." },
        PROPOSE: { output: "Iniciativa ubicada en horizonte y fase." },
        JUSTIFY: { output: initiative.description || "" },
        ESTIMATE: { output: "Esfuerzo y complejidad estimados." },
        WARN: { output: "Riesgos y dependencias registrados." },
        ASK: { output: questions.length ? "Existen preguntas abiertas." : "Sin preguntas abiertas." }
      }
    });
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.roadmapPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.roadmapPackage = state.roadmapPackage;
    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(state) {
    if (!window.ContextBuilderService || !state.roadmapPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    state.roadmapPackage.phases.forEach((phase) => {
      graph.nodes.push({ id: phase.phaseId, type: "ROADMAP_PHASE", label: phase.name });
    });
    state.roadmapPackage.prioritizedInitiatives.forEach((initiative) => {
      graph.nodes.push({ id: initiative.roadmapInitiativeId, type: "ROADMAP_INITIATIVE", label: initiative.name });
      graph.edges.push({ from: initiative.sourceInitiativeId, to: initiative.roadmapInitiativeId, type: "ROADMAPS" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  resolveSourcePackages(sources) {
    return {
      businessKnowledgePackageId: sources.businessKnowledgePackage ? sources.businessKnowledgePackage.businessKnowledgePackageId : "",
      knowledgePackageId: sources.knowledgePackage ? sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: sources.contextGraph ? sources.contextGraph.contextGraphId : "",
      toBePackageId: sources.toBePackage ? sources.toBePackage.toBePackageId : "",
      businessCasePackageId: sources.businessCasePackage ? sources.businessCasePackage.businessCasePackageId : ""
    };
  },

  resolveConfidence(evidence, questions) {
    if (questions.some((question) => question.blocksConsolidation)) {
      return "INSUFFICIENT_INFORMATION";
    }

    return this.confidenceFromScore(this.average(evidence.map((item) => this.confidenceScore(item.confidence))));
  },

  confidenceScore(confidence) {
    const scores = { HIGH_CONFIDENCE: 95, MEDIUM_CONFIDENCE: 72, LOW_CONFIDENCE: 42, INSUFFICIENT_INFORMATION: 12, Alta: 95, Media: 72, Baja: 42 };
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

  unique(values) {
    return [...new Set(values.filter(Boolean))];
  },

  addChat(state, author, text) {
    if (!Array.isArray(state.chat)) {
      state.chat = this.createInitialChat();
    }

    state.chat.push({
      messageId: `RM-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  firstPhaseId(packageData) {
    return packageData && packageData.phases && packageData.phases[0] ? packageData.phases[0].phaseId : "";
  }
});
