window.ExecutiveReportService = Object.seal({
  storageKey: "operational-intelligence.executive-report",

  createState() {
    return {
      sources: this.loadSources(),
      selectedSectionId: "",
      executiveReportPackage: null,
      questions: [],
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `ER-${Date.now()}`,
      author: "consultant",
      text: "Consolidare los resultados de la consultoria en un modelo interno de informe ejecutivo. La exportacion fisica queda preparada para una version posterior.",
      createdAt: new Date().toISOString()
    }];
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      const saved = rawState ? JSON.parse(rawState) : {};
      const state = { ...this.createState(), ...saved };
      state.sources = this.loadSources();
      state.executiveReportPackage = saved.executiveReportPackage || null;
      state.questions = this.buildQuestions(state.executiveReportPackage, state.sources);
      state.selectedSectionId = saved.selectedSectionId || this.firstSectionId(state.executiveReportPackage);
      state.chat = saved.chat && saved.chat.length ? saved.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.questions = this.buildQuestions(state.executiveReportPackage, state.sources);
    state.lastSavedAt = new Date().toISOString();
    this.syncToKnowledgePackage(state);
    this.syncToContextGraph(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedSectionId: state.selectedSectionId,
      executiveReportPackage: state.executiveReportPackage,
      questions: state.questions,
      chat: state.chat,
      lastSavedAt: state.lastSavedAt
    }));
  },

  loadSources() {
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const processState = window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : { draftProcessModel: null };
    const vsmState = window.IntelligentVsmStudioService ? window.IntelligentVsmStudioService.loadState() : null;
    const leanState = window.LeanConsultantService ? window.LeanConsultantService.loadState() : null;
    const tocState = window.TocConsultantService ? window.TocConsultantService.loadState() : null;
    const automationAiState = window.AutomationAiConsultantService ? window.AutomationAiConsultantService.loadState() : null;
    const toBeState = window.ToBeDesignerService ? window.ToBeDesignerService.loadState() : null;
    const businessCaseState = window.BusinessCaseService ? window.BusinessCaseService.loadState() : null;
    const roadmapState = window.RoadmapService ? window.RoadmapService.loadState() : null;

    return {
      businessKnowledgePackage: businessState && businessState.package ? businessState.package : null,
      knowledgePackage: contextState && contextState.result ? contextState.result.knowledgePackage : null,
      contextGraph: contextState && contextState.result ? contextState.result.contextGraph : null,
      processModelAsIs: processState && processState.draftProcessModel ? processState.draftProcessModel : null,
      vsm: vsmState || null,
      leanAssessmentPackage: leanState ? leanState.assessmentPackage : null,
      tocAssessmentPackage: tocState ? tocState.assessmentPackage : null,
      automationAiOpportunityPackage: automationAiState ? automationAiState.opportunityPackage : null,
      toBePackage: toBeState ? toBeState.toBePackage : null,
      businessCasePackage: businessCaseState ? businessCaseState.businessCasePackage : null,
      roadmapPackage: roadmapState ? roadmapState.roadmapPackage : null
    };
  },

  generateReport(state) {
    state.sources = this.loadSources();
    const sections = this.buildSections(state.sources);
    const risks = this.consolidateRisks(state.sources);
    const assumptions = this.consolidateAssumptions(state.sources);
    const recommendations = this.buildFinalRecommendations(state.sources);
    const questions = this.buildQuestions({ sections }, state.sources);
    const evidenceUsed = this.buildEvidenceIndex(state.sources);
    const summary = this.buildSummary(sections, risks, recommendations, questions);

    state.executiveReportPackage = {
      executiveReportPackageId: `ER-${Date.now()}`,
      packageType: "EXECUTIVE_REPORT_PACKAGE",
      methodology: "EXECUTIVE_REPORT_GENERATOR",
      status: questions.some((question) => question.blocksConsolidation) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
      version: 1,
      sourcePackages: this.resolveSourcePackages(state.sources),
      decisionTrace: this.createPackageDecisionTrace(sections, questions, evidenceUsed),
      executiveSummary: sections.find((section) => section.sectionId === "EXECUTIVE_SUMMARY"),
      sections,
      risks,
      assumptions,
      finalRecommendations: recommendations,
      pendingQuestions: questions,
      exportModel: this.buildExportModel(sections),
      evidenceUsed,
      confidence: summary.averageConfidence,
      questions,
      summary,
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER"
    };
    state.questions = questions;
    state.selectedSectionId = this.firstSectionId(state.executiveReportPackage);
    this.addChat(state, "consultant", `Executive Report Package generado: ${sections.length} secciones, ${recommendations.length} recomendaciones y ${questions.length} preguntas pendientes.`);
    this.saveState(state);
  },

  buildSections(sources) {
    return [
      this.section("EXECUTIVE_SUMMARY", "Resumen Ejecutivo", [
        this.line("Objetivo del proyecto", this.resolveProjectObjective(sources)),
        this.line("Alcance", this.resolveScope(sources)),
        this.line("Situacion actual", this.resolveCurrentSituation(sources)),
        this.line("Principales hallazgos", this.resolveMainFindings(sources))
      ], sources),
      this.section("CURRENT_STATE", "Situacion Actual", [
        this.line("Proceso As-Is", this.resolveAsIsDescription(sources)),
        this.line("Indicadores principales", this.resolveIndicators(sources)),
        this.line("VSM resumido", this.resolveVsmSummary(sources))
      ], sources),
      this.section("DIAGNOSIS", "Diagnostico", [
        this.line("Lean", this.resolveLeanFindings(sources)),
        this.line("TOC", this.resolveTocFindings(sources)),
        this.line("Automatizacion", this.resolveAutomationFindings(sources)),
        this.line("IA", this.resolveAiFindings(sources))
      ], sources),
      this.section("TO_BE", "Proceso To-Be", [
        this.line("Resumen de cambios", this.resolveToBeChanges(sources)),
        this.line("Comparativo As-Is vs To-Be", this.resolveToBeComparison(sources))
      ], sources),
      this.section("BUSINESS_CASE", "Business Case", [
        this.line("Beneficios operacionales", this.resolveOperationalBenefits(sources)),
        this.line("Beneficios economicos", this.resolveEconomicBenefits(sources)),
        this.line("Beneficios estrategicos", this.resolveStrategicBenefits(sources)),
        this.line("Costos estimados", this.resolveCosts(sources)),
        this.line("ROI", this.resolveRoi(sources)),
        this.line("Payback", this.resolvePayback(sources))
      ], sources),
      this.section("ROADMAP", "Roadmap", [
        this.line("Quick Wins", this.resolveRoadmapHorizon(sources, "QUICK_WINS")),
        this.line("Corto Plazo", this.resolveRoadmapHorizon(sources, "SHORT_TERM")),
        this.line("Mediano Plazo", this.resolveRoadmapHorizon(sources, "MEDIUM_TERM")),
        this.line("Largo Plazo", this.resolveRoadmapHorizon(sources, "LONG_TERM"))
      ], sources),
      this.section("RISKS", "Riesgos", this.consolidateRisks(sources).map((risk) => this.line(risk.type || "Riesgo", risk.description || risk.risk)), sources),
      this.section("RECOMMENDATIONS", "Recomendaciones Finales", this.buildFinalRecommendations(sources).map((item) => this.line(item.priority, item.recommendation)), sources),
      this.section("PENDING_QUESTIONS", "Preguntas Pendientes", this.consolidateQuestions(sources).map((item) => this.line(item.priority || "Media", item.question)), sources)
    ];
  },

  section(sectionId, title, content, sources) {
    const missing = content.filter((item) => item.value === "Informacion no disponible" || item.value === "Pendiente de estimacion").length;

    return {
      sectionId,
      title,
      content,
      confidence: missing ? "LOW_CONFIDENCE" : this.resolveSectionConfidence(sources),
      evidence: this.sectionEvidence(sectionId, sources),
      readyForExport: !missing
    };
  },

  line(label, value) {
    return { label, value: value || "Informacion no disponible" };
  },

  buildFinalRecommendations(sources) {
    const recommendations = [];
    const roadmap = sources.roadmapPackage;
    const businessCase = sources.businessCasePackage;

    if (roadmap && roadmap.summary) {
      recommendations.push({ priority: "Alta", recommendation: "Ejecutar primero los Quick Wins para generar traccion y evidencia temprana." });
    }

    if (businessCase && businessCase.financialIndicators && businessCase.financialIndicators.roi !== "No aplica") {
      recommendations.push({ priority: "Alta", recommendation: `Priorizar iniciativas con ROI positivo. ROI consolidado: ${businessCase.financialIndicators.roi}.` });
    }

    if (sources.tocAssessmentPackage && sources.tocAssessmentPackage.detectedConstraints && sources.tocAssessmentPackage.detectedConstraints.length) {
      recommendations.push({ priority: "Alta", recommendation: "Proteger las restricciones detectadas por TOC antes de escalar automatizaciones." });
    }

    if (sources.automationAiOpportunityPackage && sources.automationAiOpportunityPackage.summary && sources.automationAiOpportunityPackage.summary.activitiesWithAi) {
      recommendations.push({ priority: "Media", recommendation: "Implementar pilotos IA con validacion humana y datos controlados." });
    }

    return recommendations.length ? recommendations : [{ priority: "Media", recommendation: "Completar informacion faltante antes de presentar una version definitiva." }];
  },

  consolidateRisks(sources) {
    return []
      .concat(sources.toBePackage && sources.toBePackage.risks ? sources.toBePackage.risks : [])
      .concat(sources.businessCasePackage && sources.businessCasePackage.risks ? sources.businessCasePackage.risks : [])
      .concat(sources.roadmapPackage && sources.roadmapPackage.risks ? sources.roadmapPackage.risks : []);
  },

  consolidateAssumptions(sources) {
    return []
      .concat(sources.businessCasePackage && sources.businessCasePackage.assumptions ? sources.businessCasePackage.assumptions : [])
      .concat(sources.roadmapPackage && sources.roadmapPackage.assumptions ? sources.roadmapPackage.assumptions : []);
  },

  consolidateQuestions(sources) {
    return []
      .concat(sources.leanAssessmentPackage && sources.leanAssessmentPackage.questions ? sources.leanAssessmentPackage.questions : [])
      .concat(sources.tocAssessmentPackage && sources.tocAssessmentPackage.questions ? sources.tocAssessmentPackage.questions : [])
      .concat(sources.automationAiOpportunityPackage && sources.automationAiOpportunityPackage.questions ? sources.automationAiOpportunityPackage.questions : [])
      .concat(sources.toBePackage && sources.toBePackage.questions ? sources.toBePackage.questions : [])
      .concat(sources.businessCasePackage && sources.businessCasePackage.questions ? sources.businessCasePackage.questions : [])
      .concat(sources.roadmapPackage && sources.roadmapPackage.questions ? sources.roadmapPackage.questions : []);
  },

  buildQuestions(packageData, sources) {
    const questions = [];

    if (!sources.roadmapPackage) {
      questions.push({
        questionId: "ERQ-ROADMAP",
        question: "Existe un Roadmap Package vigente para consolidar el informe ejecutivo?",
        reason: "El Executive Report Generator consume el Roadmap; no construye Roadmap.",
        priority: "Alta",
        status: "OPEN",
        blocksConsolidation: true
      });
    }

    return questions.concat(this.consolidateQuestions(sources));
  },

  buildExportModel(sections) {
    return {
      supportedFormatsPrepared: ["PDF", "Word", "PowerPoint"],
      physicalExportImplemented: false,
      sections: sections.map((section, index) => ({
        order: index + 1,
        sectionId: section.sectionId,
        title: section.title,
        contentBlocks: section.content,
        readyForExport: section.readyForExport
      }))
    };
  },

  buildSummary(sections, risks, recommendations, questions) {
    return {
      totalSections: sections.length,
      readySections: sections.filter((section) => section.readyForExport).length,
      totalRisks: risks.length,
      totalRecommendations: recommendations.length,
      pendingQuestions: questions.length,
      averageConfidence: this.confidenceFromScore(this.average(sections.map((section) => this.confidenceScore(section.confidence))))
    };
  },

  buildEvidenceIndex(sources) {
    return []
      .concat(sources.leanAssessmentPackage && sources.leanAssessmentPackage.evidenceUsed ? sources.leanAssessmentPackage.evidenceUsed : [])
      .concat(sources.tocAssessmentPackage && sources.tocAssessmentPackage.evidenceUsed ? sources.tocAssessmentPackage.evidenceUsed : [])
      .concat(sources.automationAiOpportunityPackage && sources.automationAiOpportunityPackage.evidenceUsed ? sources.automationAiOpportunityPackage.evidenceUsed : [])
      .concat(sources.toBePackage && sources.toBePackage.evidenceUsed ? sources.toBePackage.evidenceUsed : [])
      .concat(sources.businessCasePackage && sources.businessCasePackage.evidenceUsed ? sources.businessCasePackage.evidenceUsed : [])
      .concat(sources.roadmapPackage && sources.roadmapPackage.evidenceUsed ? sources.roadmapPackage.evidenceUsed : []);
  },

  resolveProjectObjective(sources) {
    return sources.businessKnowledgePackage && (sources.businessKnowledgePackage.projectObjective || sources.businessKnowledgePackage.objective) || sources.knowledgePackage && sources.knowledgePackage.processObjective || "Informacion no disponible";
  },

  resolveScope(sources) {
    return sources.businessKnowledgePackage && sources.businessKnowledgePackage.scope || sources.knowledgePackage && sources.knowledgePackage.scope || "Informacion no disponible";
  },

  resolveCurrentSituation(sources) {
    const model = sources.processModelAsIs;
    return model && model.activities ? `Proceso As-Is con ${model.activities.length} actividades identificadas.` : "Informacion no disponible";
  },

  resolveMainFindings(sources) {
    const lean = sources.leanAssessmentPackage && sources.leanAssessmentPackage.summary;
    const toc = sources.tocAssessmentPackage && sources.tocAssessmentPackage.summary;
    const aai = sources.automationAiOpportunityPackage && sources.automationAiOpportunityPackage.summary;
    return [lean && `Lean: ${lean.detectedWastes || lean.totalWastes || 0} hallazgos`, toc && `TOC: ${toc.constraintsDetected || 0} restricciones`, aai && `Digital: ${aai.consolidatedOpportunities || 0} oportunidades`].filter(Boolean).join(" | ") || "Informacion no disponible";
  },

  resolveAsIsDescription(sources) {
    const model = sources.processModelAsIs;
    return model ? model.name || "Process Model As-Is disponible." : "Informacion no disponible";
  },

  resolveIndicators(sources) {
    return sources.vsm && sources.vsm.metrics ? JSON.stringify(sources.vsm.metrics) : "Informacion no disponible";
  },

  resolveVsmSummary(sources) {
    const metrics = sources.vsm && sources.vsm.metrics;
    return metrics ? `Lead Time: ${metrics.leadTimeTotal || "NA"}; Process Time: ${metrics.processTimeTotal || "NA"}; Actividades: ${metrics.activityCount || "NA"}.` : "Informacion no disponible";
  },

  resolveLeanFindings(sources) {
    const pkg = sources.leanAssessmentPackage;
    return pkg && pkg.summary ? JSON.stringify(pkg.summary) : "Informacion no disponible";
  },

  resolveTocFindings(sources) {
    const pkg = sources.tocAssessmentPackage;
    return pkg && pkg.summary ? JSON.stringify(pkg.summary) : "Informacion no disponible";
  },

  resolveAutomationFindings(sources) {
    const pkg = sources.automationAiOpportunityPackage;
    return pkg && pkg.summary ? `${pkg.summary.activitiesWithAutomation || 0} actividades con potencial de automatizacion.` : "Informacion no disponible";
  },

  resolveAiFindings(sources) {
    const pkg = sources.automationAiOpportunityPackage;
    return pkg && pkg.summary ? `${pkg.summary.activitiesWithAi || 0} actividades con potencial IA.` : "Informacion no disponible";
  },

  resolveToBeChanges(sources) {
    const pkg = sources.toBePackage;
    return pkg && pkg.summary ? JSON.stringify(pkg.summary) : "Informacion no disponible";
  },

  resolveToBeComparison(sources) {
    const comparison = sources.toBePackage && sources.toBePackage.comparison;
    return comparison ? `As-Is: ${comparison.asIsActivityCount}; To-Be: ${comparison.toBeActivityCount}; Beneficio tiempo: ${comparison.expectedTimeBenefit}.` : "Informacion no disponible";
  },

  resolveOperationalBenefits(sources) {
    const benefits = sources.businessCasePackage && sources.businessCasePackage.operationalBenefits;
    return benefits ? JSON.stringify(benefits) : "Informacion no disponible";
  },

  resolveEconomicBenefits(sources) {
    const benefits = sources.businessCasePackage && sources.businessCasePackage.economicBenefits;
    return benefits ? JSON.stringify(benefits) : "Informacion no disponible";
  },

  resolveStrategicBenefits(sources) {
    const benefits = sources.businessCasePackage && sources.businessCasePackage.strategicBenefits;
    return benefits ? JSON.stringify(benefits) : "Informacion no disponible";
  },

  resolveCosts(sources) {
    const costs = sources.businessCasePackage && sources.businessCasePackage.implementationCosts;
    return costs ? JSON.stringify(costs) : "Informacion no disponible";
  },

  resolveRoi(sources) {
    return sources.businessCasePackage && sources.businessCasePackage.financialIndicators ? sources.businessCasePackage.financialIndicators.roi : "Informacion no disponible";
  },

  resolvePayback(sources) {
    return sources.businessCasePackage && sources.businessCasePackage.financialIndicators ? sources.businessCasePackage.financialIndicators.payback : "Informacion no disponible";
  },

  resolveRoadmapHorizon(sources, horizonId) {
    const roadmap = sources.roadmapPackage;
    if (!roadmap || !roadmap.prioritizedInitiatives) {
      return "Informacion no disponible";
    }

    const initiatives = roadmap.prioritizedInitiatives.filter((item) => item.horizon && item.horizon.id === horizonId);
    return initiatives.length ? initiatives.map((item) => item.name).join(", ") : "Sin iniciativas";
  },

  sectionEvidence(sectionId, sources) {
    const map = {
      EXECUTIVE_SUMMARY: ["knowledgePackage", "businessKnowledgePackage"],
      CURRENT_STATE: ["processModelAsIs", "vsm"],
      DIAGNOSIS: ["leanAssessmentPackage", "tocAssessmentPackage", "automationAiOpportunityPackage"],
      TO_BE: ["toBePackage"],
      BUSINESS_CASE: ["businessCasePackage"],
      ROADMAP: ["roadmapPackage"]
    };

    return (map[sectionId] || []).filter((key) => Boolean(sources[key])).map((key) => ({ source: key, confidence: "MEDIUM_CONFIDENCE" }));
  },

  resolveSectionConfidence(sources) {
    return sources.roadmapPackage ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE";
  },

  createPackageDecisionTrace(sections, questions, evidence) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    return window.ConsultingDecisionFramework.createDecisionTrace({
      subjectType: "EXECUTIVE_REPORT_PACKAGE",
      subjectId: `ER-${Date.now()}`,
      consultant: "Executive Report Generator",
      evidence,
      assumptions: ["El reporte es un modelo interno; la exportacion fisica se implementara posteriormente."],
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: "Se consolidaron paquetes de consultoria disponibles." },
        VALIDATE: { output: "Se valido disponibilidad de Roadmap y paquetes previos." },
        DIAGNOSE: { output: "Se organizaron hallazgos en secciones ejecutivas." },
        QUANTIFY: { output: "Se reutilizaron beneficios del Business Case." },
        PROPOSE: { output: "Se genero Executive Report Package." },
        JUSTIFY: { output: "Cada seccion mantiene fuentes y confianza." },
        ESTIMATE: { output: "No se estiman nuevos beneficios en este Sprint." },
        WARN: { output: "Exportacion fisica no implementada." },
        ASK: { output: questions.length ? "Existen preguntas pendientes." : "Sin preguntas pendientes." }
      }
    });
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.executiveReportPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();
    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.executiveReportPackage = state.executiveReportPackage;
    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(state) {
    if (!window.ContextBuilderService || !state.executiveReportPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();
    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    graph.nodes.push({ id: state.executiveReportPackage.executiveReportPackageId, type: "EXECUTIVE_REPORT_PACKAGE", label: "Executive Report Package" });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  resolveSourcePackages(sources) {
    return {
      knowledgePackageId: sources.knowledgePackage ? sources.knowledgePackage.knowledgePackageId : "",
      roadmapPackageId: sources.roadmapPackage ? sources.roadmapPackage.roadmapPackageId : "",
      businessCasePackageId: sources.businessCasePackage ? sources.businessCasePackage.businessCasePackageId : "",
      toBePackageId: sources.toBePackage ? sources.toBePackage.toBePackageId : ""
    };
  },

  confidenceScore(confidence) {
    const scores = { HIGH_CONFIDENCE: 95, MEDIUM_CONFIDENCE: 72, LOW_CONFIDENCE: 42, INSUFFICIENT_INFORMATION: 12 };
    return scores[confidence] || 45;
  },

  confidenceFromScore(score) {
    if (score >= 82) return "HIGH_CONFIDENCE";
    if (score >= 60) return "MEDIUM_CONFIDENCE";
    if (score >= 35) return "LOW_CONFIDENCE";
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

    state.chat.push({ messageId: `ER-${Date.now()}-${author}`, author, text, createdAt: new Date().toISOString() });
  },

  firstSectionId(packageData) {
    return packageData && packageData.sections && packageData.sections[0] ? packageData.sections[0].sectionId : "";
  }
});
