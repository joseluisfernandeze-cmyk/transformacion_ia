window.MethodologyOrchestratorService = Object.seal({
  storageKey: "operational-intelligence.methodology-orchestrator",

  stages: [
    { id: "BUSINESS_DISCOVERY", name: "Business Discovery", required: true, owner: "Business Discovery Consultant" },
    { id: "CONTEXT_BUILDER", name: "Context Builder", required: true, owner: "Context Builder Agent" },
    { id: "PROCESS_DISCOVERY", name: "Process Discovery", required: true, owner: "Process Discovery Consultant" },
    { id: "PROCESS_MODELING", name: "Process Modeling", required: true, owner: "Process Modeling Studio" },
    { id: "PROCESS_VALIDATION", name: "Process Validation", required: true, owner: "Process Validation Studio" },
    { id: "PROCESS_DATA_COLLECTION", name: "Process Data Collection", required: true, owner: "Process Data Collection Studio" },
    { id: "INTELLIGENT_VSM", name: "Intelligent VSM", required: true, owner: "Intelligent VSM Studio" },
    { id: "TRANSFORMATION_WORKSHOP", name: "Transformation Workshop", required: true, owner: "Transformation Workshop" },
    { id: "LEAN_CONSULTANT", name: "Lean Consultant", required: true, owner: "Lean Transformation Consultant" },
    { id: "TOC_CONSULTANT", name: "TOC Consultant", required: true, owner: "TOC Transformation Consultant" },
    { id: "AUTOMATION_AI_CONSULTANT", name: "Automation & AI Consultant", required: true, owner: "Automation & AI Transformation Consultant" },
    { id: "TO_BE_DESIGNER", name: "To-Be Designer", required: false, future: true, owner: "Future To-Be Designer" },
    { id: "BUSINESS_CASE", name: "Business Case", required: false, future: true, owner: "Future Business Case Consultant" },
    { id: "ROADMAP", name: "Roadmap", required: false, future: true, owner: "Future Roadmap Consultant" },
    { id: "EXECUTIVE_REPORT", name: "Executive Report", required: false, future: true, owner: "Future Executive Report Consultant" }
  ],

  createState() {
    return {
      approvals: {},
      comments: {},
      selectedStageId: "BUSINESS_DISCOVERY",
      projectTransformationStatus: this.buildProjectTransformationStatus({}, {})
    };
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      const savedState = rawState ? JSON.parse(rawState) : this.createState();
      const state = {
        ...this.createState(),
        ...savedState,
        approvals: savedState.approvals || {},
        comments: savedState.comments || {}
      };
      state.projectTransformationStatus = this.buildProjectTransformationStatus(state.approvals, state.comments);
      state.selectedStageId = state.selectedStageId || state.projectTransformationStatus.currentStageId;
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.projectTransformationStatus = this.buildProjectTransformationStatus(state.approvals, state.comments);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      approvals: state.approvals,
      comments: state.comments,
      selectedStageId: state.selectedStageId,
      projectTransformationStatus: state.projectTransformationStatus
    }));
  },

  buildProjectTransformationStatus(approvals, comments) {
    const sourceStates = this.loadSourceStates();
    const stageStatuses = this.stages.map((stage, index) => {
      const readiness = this.resolveReadiness(stage.id, sourceStates);
      const previousRequiredApproved = this.previousRequiredApproved(index, approvals);
      const approval = approvals[stage.id] || null;
      const blocked = this.resolveBlockers(stage, readiness, previousRequiredApproved, sourceStates);
      const status = this.resolveStageStatus(stage, readiness, approval, blocked);

      return {
        stageId: stage.id,
        name: stage.name,
        sequence: index + 1,
        required: stage.required,
        future: Boolean(stage.future),
        owner: stage.owner,
        status,
        readyForApproval: readiness.ready && !blocked.length && !stage.future,
        progress: readiness.progress,
        blockers: blocked,
        missingInformation: readiness.missingInformation,
        healthScore: readiness.healthScore,
        approval,
        comments: comments[stage.id] || "",
        updatedAt: readiness.updatedAt || ""
      };
    });

    const requiredStages = stageStatuses.filter((stage) => stage.required);
    const completedRequired = requiredStages.filter((stage) => stage.status === "APPROVED").length;
    const currentStage = stageStatuses.find((stage) => stage.required && stage.status !== "APPROVED") || stageStatuses.find((stage) => stage.future) || stageStatuses[stageStatuses.length - 1];
    const blockingItems = stageStatuses.flatMap((stage) => stage.blockers.map((blocker) => ({
      stageId: stage.stageId,
      stageName: stage.name,
      blocker
    })));
    const missingInformation = stageStatuses.flatMap((stage) => stage.missingInformation.map((item) => ({
      stageId: stage.stageId,
      stageName: stage.name,
      item
    })));

    return {
      projectTransformationStatusId: `PTS-${Date.now()}`,
      statusType: "PROJECT_TRANSFORMATION_STATUS",
      currentStageId: currentStage.stageId,
      currentStageName: currentStage.name,
      progressPercentage: Math.round((completedRequired / requiredStages.length) * 100),
      completedStages: stageStatuses.filter((stage) => stage.status === "APPROVED").map((stage) => stage.stageId),
      pendingStages: stageStatuses.filter((stage) => stage.status !== "APPROVED").map((stage) => stage.stageId),
      blockers: blockingItems,
      missingInformation,
      projectHealthScore: this.calculateProjectHealthScore(stageStatuses),
      updatedAt: new Date().toISOString(),
      responsibleConsultant: currentStage.owner,
      stages: stageStatuses
    };
  },

  loadSourceStates() {
    return {
      business: window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null,
      context: window.ContextBuilderService ? window.ContextBuilderService.loadState() : null,
      processDiscovery: window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : null,
      validation: window.ProcessValidationStudioService ? window.ProcessValidationStudioService.loadState() : null,
      dataCollection: window.ProcessDataCollectionStudioService ? window.ProcessDataCollectionStudioService.loadState() : null,
      vsm: window.IntelligentVsmStudioService ? window.IntelligentVsmStudioService.loadState() : null,
      workshop: window.TransformationWorkshopService ? window.TransformationWorkshopService.loadState() : null,
      lean: window.LeanConsultantService ? window.LeanConsultantService.loadState() : null,
      toc: window.TocConsultantService ? window.TocConsultantService.loadState() : null,
      automationAi: window.AutomationAiConsultantService ? window.AutomationAiConsultantService.loadState() : null
    };
  },

  resolveReadiness(stageId, states) {
    const resolvers = {
      BUSINESS_DISCOVERY: () => this.businessReadiness(states.business),
      CONTEXT_BUILDER: () => this.contextReadiness(states.context),
      PROCESS_DISCOVERY: () => this.processDiscoveryReadiness(states.processDiscovery),
      PROCESS_MODELING: () => this.processModelingReadiness(states.processDiscovery),
      PROCESS_VALIDATION: () => this.processValidationReadiness(states.validation),
      PROCESS_DATA_COLLECTION: () => this.dataCollectionReadiness(states.dataCollection),
      INTELLIGENT_VSM: () => this.vsmReadiness(states.vsm),
      TRANSFORMATION_WORKSHOP: () => this.workshopReadiness(states.workshop),
      LEAN_CONSULTANT: () => this.leanReadiness(states.lean),
      TOC_CONSULTANT: () => this.tocReadiness(states.toc),
      AUTOMATION_AI_CONSULTANT: () => this.automationAiReadiness(states.automationAi)
    };

    if (resolvers[stageId]) {
      return resolvers[stageId]();
    }

    return {
      ready: false,
      progress: 0,
      healthScore: 0,
      missingInformation: ["Etapa futura no implementada."],
      updatedAt: ""
    };
  },

  businessReadiness(state) {
    const packageData = state && state.package ? state.package : null;
    const missing = packageData ? packageData.missingInformation || [] : ["Business Knowledge Package no disponible."];
    const ready = Boolean(packageData && (packageData.status === "VALIDATED" || packageData.status === "READY_FOR_VALIDATION") && !missing.length);

    return {
      ready,
      progress: packageData ? (ready ? 100 : 65) : 0,
      healthScore: packageData ? this.confidenceScore(packageData.confidence) : 0,
      missingInformation: missing,
      updatedAt: packageData ? packageData.updatedAt || packageData.createdAt : ""
    };
  },

  contextReadiness(state) {
    const packageData = state && state.result ? state.result.knowledgePackage : null;
    const missing = packageData ? packageData.missingInformation || [] : ["Knowledge Package no disponible."];
    const ready = Boolean(packageData && packageData.confidence !== "LOW_CONFIDENCE" && !missing.length);

    return {
      ready,
      progress: packageData ? (ready ? 100 : 70) : 0,
      healthScore: packageData ? this.confidenceScore(packageData.confidence) : 0,
      missingInformation: missing,
      updatedAt: packageData ? packageData.createdAt : ""
    };
  },

  processDiscoveryReadiness(state) {
    const model = state && state.draftProcessModel ? state.draftProcessModel : null;
    const diagnostics = model ? model.diagnostics || [] : [];
    const blocking = diagnostics.filter((item) => item.impact === "HIGH" && item.status === "OPEN");
    const ready = Boolean(model && model.activities && model.activities.length && !blocking.length);

    return {
      ready,
      progress: model ? (ready ? 100 : 70) : 0,
      healthScore: ready ? 85 : 55,
      missingInformation: blocking.map((item) => item.message),
      updatedAt: model ? model.createdAt : ""
    };
  },

  processModelingReadiness(state) {
    const model = state && state.draftProcessModel ? state.draftProcessModel : null;
    const activities = model && model.activities ? model.activities : [];
    const approved = activities.filter((activity) => activity.approvalStatus === "HUMAN_APPROVED").length;
    const ready = Boolean(activities.length && approved === activities.length);

    return {
      ready,
      progress: activities.length ? Math.round((approved / activities.length) * 100) : 0,
      healthScore: activities.length ? Math.round((approved / activities.length) * 100) : 0,
      missingInformation: ready ? [] : ["Actividades pendientes de aprobacion humana en el modelo."],
      updatedAt: model ? model.createdAt : ""
    };
  },

  processValidationReadiness(state) {
    const validation = state && state.validation ? state.validation : null;
    const ready = Boolean(validation && validation.canRunAdvancedAnalysis);

    return {
      ready,
      progress: validation ? (ready ? 100 : 65) : 0,
      healthScore: validation ? validation.healthScore : 0,
      missingInformation: validation && validation.blockedCapabilities && validation.blockedCapabilities.length ? [`Capacidades bloqueadas: ${validation.blockedCapabilities.join(", ")}`] : validation ? [] : ["Validacion del proceso no ejecutada."],
      updatedAt: validation ? validation.validatedAt : ""
    };
  },

  dataCollectionReadiness(state) {
    const readiness = state && state.readiness ? state.readiness : null;
    const validations = state && state.validations ? state.validations : [];
    const highIssues = validations.filter((item) => item.severity === "HIGH" || item.severity === "CRITICAL");
    const ready = Boolean(readiness && readiness.score >= 75 && !highIssues.length);

    return {
      ready,
      progress: readiness ? readiness.score : 0,
      healthScore: readiness ? readiness.score : 0,
      missingInformation: highIssues.map((item) => `${item.activityName || "Actividad"}: ${item.message}`),
      updatedAt: state ? state.lastSavedAt : ""
    };
  },

  vsmReadiness(state) {
    const metrics = state && state.metrics ? state.metrics : null;
    const validations = state && state.validations ? state.validations : [];
    const highIssues = validations.filter((item) => item.severity === "HIGH" || item.severity === "CRITICAL");
    const ready = Boolean(metrics && metrics.activityCount > 0 && !highIssues.length);

    return {
      ready,
      progress: metrics ? (ready ? 100 : 70) : 0,
      healthScore: metrics ? (ready ? 90 : 60) : 0,
      missingInformation: highIssues.map((item) => `${item.activityName || "Actividad"}: ${item.message}`),
      updatedAt: state ? state.lastSavedAt : ""
    };
  },

  workshopReadiness(state) {
    const packageData = state && state.packageData ? state.packageData : null;
    const observations = packageData ? packageData.observations || [] : [];
    const lowConfidence = observations.filter((item) => item.confidence === "LOW_CONFIDENCE");
    const ready = Boolean(packageData && observations.length && !lowConfidence.length);

    return {
      ready,
      progress: observations.length ? (ready ? 100 : 75) : 0,
      healthScore: observations.length ? (ready ? 85 : 65) : 0,
      missingInformation: observations.length ? lowConfidence.map((item) => `${item.activityName}: observacion con baja confianza.`) : ["No existen observaciones del taller."],
      updatedAt: state ? state.lastSavedAt : ""
    };
  },

  leanReadiness(state) {
    const packageData = state && state.assessmentPackage ? state.assessmentPackage : null;
    const questions = state && state.questions ? state.questions : [];
    const blockingQuestions = questions.filter((item) => item.status === "OPEN" && item.blocksConsolidation);
    const ready = Boolean(packageData && packageData.activityAssessments && packageData.activityAssessments.length && !blockingQuestions.length);

    return {
      ready,
      progress: packageData ? (ready ? 100 : 70) : 0,
      healthScore: packageData ? (ready ? 86 : 62) : 0,
      missingInformation: packageData ? blockingQuestions.map((item) => item.question) : ["Lean Assessment Package no disponible."],
      updatedAt: packageData ? packageData.createdAt : ""
    };
  },

  tocReadiness(state) {
    const packageData = state && state.assessmentPackage ? state.assessmentPackage : null;
    const questions = state && state.questions ? state.questions : [];
    const blockingQuestions = questions.filter((item) => item.status === "OPEN" && item.blocksConsolidation);
    const ready = Boolean(packageData && packageData.activityAssessments && packageData.activityAssessments.length && !blockingQuestions.length);

    return {
      ready,
      progress: packageData ? (ready ? 100 : 70) : 0,
      healthScore: packageData ? (ready ? 86 : 62) : 0,
      missingInformation: packageData ? blockingQuestions.map((item) => item.question) : ["TOC Assessment Package no disponible."],
      updatedAt: packageData ? packageData.createdAt : ""
    };
  },

  automationAiReadiness(state) {
    const packageData = state && state.opportunityPackage ? state.opportunityPackage : null;
    const questions = state && state.questions ? state.questions : [];
    const blockingQuestions = questions.filter((item) => item.status === "OPEN" && item.blocksConsolidation);
    const ready = Boolean(packageData && packageData.activityOpportunities && packageData.activityOpportunities.length && !blockingQuestions.length);

    return {
      ready,
      progress: packageData ? (ready ? 100 : 70) : 0,
      healthScore: packageData ? (ready ? 86 : 62) : 0,
      missingInformation: packageData ? blockingQuestions.map((item) => item.question) : ["Automation & AI Opportunity Package no disponible."],
      updatedAt: packageData ? packageData.createdAt : ""
    };
  },

  resolveStageStatus(stage, readiness, approval, blockers) {
    if (stage.future) {
      return "FUTURE";
    }

    if (approval) {
      return "APPROVED";
    }

    if (blockers.length) {
      return "BLOCKED";
    }

    if (readiness.ready) {
      return "READY_FOR_APPROVAL";
    }

    if (readiness.progress > 0) {
      return "IN_PROGRESS";
    }

    return "PENDING";
  },

  resolveBlockers(stage, readiness, previousRequiredApproved) {
    const blockers = [];

    if (stage.future) {
      return blockers;
    }

    if (stage.required && !previousRequiredApproved) {
      blockers.push("Existe una etapa obligatoria anterior sin aprobacion.");
    }

    if (!readiness.ready && readiness.missingInformation.length) {
      blockers.push("La etapa tiene informacion faltante o validaciones abiertas.");
    }

    return blockers;
  },

  previousRequiredApproved(stageIndex, approvals) {
    return this.stages.slice(0, stageIndex).filter((stage) => stage.required).every((stage) => Boolean(approvals[stage.id]));
  },

  approveStage(state, stageId, approvalData) {
    const status = state.projectTransformationStatus.stages.find((stage) => stage.stageId === stageId);

    if (!status || !status.readyForApproval) {
      return {
        success: false,
        message: "La etapa no esta lista para aprobacion o tiene bloqueos."
      };
    }

    state.approvals[stageId] = {
      approvedBy: approvalData.approvedBy || "LOCAL_USER",
      approvedAt: new Date().toISOString(),
      comments: approvalData.comments || ""
    };
    state.comments[stageId] = approvalData.comments || "";
    this.saveState(state);

    return {
      success: true,
      message: "Etapa aprobada correctamente."
    };
  },

  selectStage(state, stageId) {
    state.selectedStageId = stageId;
    this.saveState(state);
  },

  calculateProjectHealthScore(stageStatuses) {
    const implemented = stageStatuses.filter((stage) => !stage.future);

    if (!implemented.length) {
      return 0;
    }

    return Math.round(implemented.reduce((total, stage) => total + (Number(stage.healthScore) || 0), 0) / implemented.length);
  },

  confidenceScore(confidence) {
    const scores = {
      HIGH_CONFIDENCE: 95,
      MEDIUM_CONFIDENCE: 75,
      LOW_CONFIDENCE: 45,
      INSUFFICIENT_INFORMATION: 20
    };

    return scores[confidence] || 50;
  }
});
