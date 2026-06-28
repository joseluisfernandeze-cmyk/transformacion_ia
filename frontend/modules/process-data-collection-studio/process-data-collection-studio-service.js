window.ProcessDataCollectionStudioService = Object.seal({
  storageKey: "operational-intelligence.process-data-collection",

  createState() {
    const processState = this.loadProcessState();
    this.ensureOperationalData(processState);

    return {
      processState,
      selectedActivityUUID: processState.selectedActivityUUID || this.firstActivityUuid(processState),
      validations: this.validateProcessData(processState),
      readiness: this.calculateReadiness(processState),
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `DCS-${Date.now()}`,
      author: "consultant",
      text: "Capturaremos datos operacionales por actividad para que VSM, Lean, TOC, Automatizacion, IA, Business Case, Monte Carlo y cargas laborales trabajen con informacion completa.",
      createdAt: new Date().toISOString()
    }];
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      const state = rawState ? JSON.parse(rawState) : this.createState();
      state.processState = this.loadProcessState();
      this.ensureOperationalData(state.processState);
      state.selectedActivityUUID = state.selectedActivityUUID || this.firstActivityUuid(state.processState);
      state.validations = this.validateProcessData(state.processState);
      state.readiness = this.calculateReadiness(state.processState);
      state.chat = state.chat && state.chat.length ? state.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.validations = this.validateProcessData(state.processState);
    state.readiness = this.calculateReadiness(state.processState);
    state.lastSavedAt = new Date().toISOString();
    this.persistProcessState(state.processState);
    this.syncToKnowledgePackage(state.processState);
    this.syncToContextGraph(state.processState);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedActivityUUID: state.selectedActivityUUID,
      validations: state.validations,
      readiness: state.readiness,
      chat: state.chat,
      lastSavedAt: state.lastSavedAt
    }));
  },

  loadProcessState() {
    if (window.ProcessModelingStudioService) {
      const state = window.ProcessModelingStudioService.createState();
      window.ProcessModelingStudioService.ensureLayout(state);
      return state;
    }

    return window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : { draftProcessModel: null };
  },

  persistProcessState(processState) {
    if (window.ProcessDiscoveryService && processState.draftProcessModel) {
      window.ProcessDiscoveryService.refreshAfterChange(processState);
    }
  },

  ensureOperationalData(processState) {
    const model = processState.draftProcessModel;

    if (!model || !model.activities) {
      return;
    }

    model.activities.forEach((activity) => {
      activity.operationalData = this.normalizeOperationalData(activity.operationalData, activity);
    });
  },

  normalizeOperationalData(data, activity) {
    const base = {
      basic: {
        responsible: activity.responsible || "",
        area: activity.area || "",
        jobTitle: "",
        systemUsed: (activity.systems || [])[0] || "",
        documentUsed: (activity.documents || [])[0] || ""
      },
      frequency: {
        perDay: "",
        perWeek: "",
        perMonth: "",
        perYear: ""
      },
      time: {
        min: "",
        likely: "",
        max: "",
        timeUnit: "MIN"
      },
      classification: {
        valueClassification: ""
      },
      waits: {
        waitTime: "",
        reason: ""
      },
      resources: {
        peopleInvolved: "",
        equipment: "",
        applications: ""
      },
      volume: {
        quantityProcessed: "",
        batches: "",
        variability: ""
      },
      risks: {
        operationalRisks: "",
        frequentErrors: "",
        rework: ""
      },
      indicators: {
        kpis: "",
        sla: "",
        target: ""
      },
      updatedAt: ""
    };

    return {
      ...base,
      ...(data || {}),
      basic: { ...base.basic, ...((data && data.basic) || {}) },
      frequency: { ...base.frequency, ...((data && data.frequency) || {}) },
      time: { ...base.time, ...((data && data.time) || {}) },
      classification: { ...base.classification, ...((data && data.classification) || {}) },
      waits: { ...base.waits, ...((data && data.waits) || {}) },
      resources: { ...base.resources, ...((data && data.resources) || {}) },
      volume: { ...base.volume, ...((data && data.volume) || {}) },
      risks: { ...base.risks, ...((data && data.risks) || {}) },
      indicators: { ...base.indicators, ...((data && data.indicators) || {}) }
    };
  },

  updateActivityData(state, activityUUID, formData) {
    const activity = this.findActivity(state, activityUUID);

    if (!activity) {
      return;
    }

    activity.operationalData = this.normalizeOperationalData({
      basic: {
        responsible: formData.responsible,
        area: formData.area,
        jobTitle: formData.jobTitle,
        systemUsed: formData.systemUsed,
        documentUsed: formData.documentUsed
      },
      frequency: {
        perDay: formData.perDay,
        perWeek: formData.perWeek,
        perMonth: formData.perMonth,
        perYear: formData.perYear
      },
      time: {
        min: formData.timeMin,
        likely: formData.timeLikely,
        max: formData.timeMax,
        timeUnit: formData.timeUnit || "MIN"
      },
      classification: {
        valueClassification: formData.valueClassification
      },
      waits: {
        waitTime: formData.waitTime,
        reason: formData.waitReason
      },
      resources: {
        peopleInvolved: formData.peopleInvolved,
        equipment: formData.equipment,
        applications: formData.applications
      },
      volume: {
        quantityProcessed: formData.quantityProcessed,
        batches: formData.batches,
        variability: formData.variability
      },
      risks: {
        operationalRisks: formData.operationalRisks,
        frequentErrors: formData.frequentErrors,
        rework: formData.rework
      },
      indicators: {
        kpis: formData.kpis,
        sla: formData.sla,
        target: formData.target
      },
      updatedAt: new Date().toISOString()
    }, activity);

    activity.responsible = formData.responsible;
    activity.area = formData.area;
    activity.systems = this.mergeList(activity.systems, formData.systemUsed);
    activity.documents = this.mergeList(activity.documents, formData.documentUsed);
    activity.indicators = this.parseList(formData.kpis);
    activity.operationalRisks = this.parseList(formData.operationalRisks);
    activity.frequentErrors = this.parseList(formData.frequentErrors);
    activity.reworkNotes = formData.rework || "";
    activity.evidence = activity.evidence || [];
    activity.evidence.push({
      evidenceId: `OPERATIONAL-DATA-${Date.now()}`,
      sourceType: "USER_INPUT",
      sourceName: "Process Data Collection Studio",
      fragment: "Datos operacionales capturados y validados por el consultor.",
      confidence: "HIGH_CONFIDENCE"
    });

    window.ProcessDiscoveryService.addChat(state.processState, "consultant", `Datos operacionales actualizados para "${activity.name}".`);
    this.saveState(state);
  },

  validateProcessData(processState) {
    const model = processState.draftProcessModel;

    if (!model || !model.activities || !model.activities.length) {
      return [this.validation("NO_PROCESS", "No existe Process Model disponible.", "CRITICAL", "")];
    }

    return model.activities.flatMap((activity) => this.validateActivity(activity));
  },

  validateActivity(activity) {
    const data = this.normalizeOperationalData(activity.operationalData, activity);
    const validations = [];

    if (!data.basic.responsible) {
      validations.push(this.validation("MISSING_RESPONSIBLE", "Responsable faltante.", "HIGH", activity.activityUUID, activity.name));
    }

    if (!this.hasAnyFrequency(data.frequency)) {
      validations.push(this.validation("MISSING_FREQUENCY", "Frecuencia faltante.", "HIGH", activity.activityUUID, activity.name));
    }

    if (!data.time.min || !data.time.likely || !data.time.max) {
      validations.push(this.validation("MISSING_TIME", "Tiempo minimo, probable o maximo faltante.", "HIGH", activity.activityUUID, activity.name));
    }

    if (!data.classification.valueClassification) {
      validations.push(this.validation("MISSING_VALUE_CLASSIFICATION", "Clasificacion VA/NNVA/NVA pendiente.", "HIGH", activity.activityUUID, activity.name));
    }

    if (!data.indicators.kpis && !data.indicators.sla && !data.indicators.target) {
      validations.push(this.validation("MISSING_INDICATORS", "Indicadores faltantes.", "MEDIUM", activity.activityUUID, activity.name));
    }

    return validations;
  },

  calculateReadiness(processState) {
    const model = processState.draftProcessModel;

    if (!model || !model.activities || !model.activities.length) {
      return {
        score: 0,
        classification: "No apto para analisis",
        completedActivities: 0,
        totalActivities: 0
      };
    }

    const validations = this.validateProcessData(processState);
    const maxIssues = model.activities.length * 5;
    const penalty = validations.reduce((total, item) => total + (item.severity === "HIGH" || item.severity === "CRITICAL" ? 1.25 : 0.7), 0);
    const score = Math.max(0, Math.round(((maxIssues - penalty) / maxIssues) * 100));

    return {
      score,
      classification: this.classifyReadiness(score, validations),
      completedActivities: model.activities.filter((activity) => !this.validateActivity(activity).length).length,
      totalActivities: model.activities.length
    };
  },

  classifyReadiness(score, validations) {
    const critical = validations.some((item) => item.severity === "CRITICAL");
    const high = validations.filter((item) => item.severity === "HIGH").length;

    if (critical || score < 50) {
      return "No apto para analisis";
    }

    if (high || score < 75) {
      return "Requiere completar datos";
    }

    if (score < 90) {
      return "Suficiente";
    }

    return "Listo para analisis";
  },

  syncToKnowledgePackage(processState) {
    if (!window.ContextBuilderService || !processState.draftProcessModel) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.processModelId = processState.draftProcessModel.processModelId;
    contextState.result.knowledgePackage.identifiedActivities = processState.draftProcessModel.activities.map((activity) => ({
      activityId: activity.activityId,
      activityUUID: activity.activityUUID,
      sequence: activity.sequence,
      name: activity.name,
      description: activity.description,
      responsible: activity.responsible,
      area: activity.area,
      inputs: activity.inputs,
      outputs: activity.outputs,
      systems: activity.systems,
      documents: activity.documents,
      indicators: activity.indicators || [],
      operationalData: activity.operationalData,
      operationalRisks: activity.operationalRisks || [],
      frequentErrors: activity.frequentErrors || [],
      businessRules: activity.businessRules,
      decisions: activity.decisions,
      confidence: activity.confidence,
      evidenceRefs: (activity.evidence || []).map((item) => item.evidenceId)
    }));

    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(processState) {
    if (!window.ContextBuilderService || !processState.draftProcessModel) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    processState.draftProcessModel.activities.forEach((activity) => {
      this.addGraphOperationalNodes(graph, activity);
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  addGraphOperationalNodes(graph, activity) {
    const data = activity.operationalData || {};
    const activityId = activity.activityUUID;
    const addNode = (type, id, label) => {
      if (!label || graph.nodes.some((node) => node.id === id)) {
        return;
      }

      graph.nodes.push({ id, type, label });
      graph.edges.push({ from: activityId, to: id, type: "USES_OPERATIONAL_DATA" });
    };

    addNode("ROLE", `${activityId}-JOB`, data.basic && data.basic.jobTitle);
    addNode("KPI", `${activityId}-KPI`, data.indicators && data.indicators.kpis);
    addNode("SLA", `${activityId}-SLA`, data.indicators && data.indicators.sla);
    addNode("RESOURCE", `${activityId}-RESOURCE`, data.resources && data.resources.peopleInvolved);
    addNode("RISK", `${activityId}-RISK`, data.risks && data.risks.operationalRisks);
  },

  findActivity(state, activityUUID) {
    return state.processState.draftProcessModel && state.processState.draftProcessModel.activities.find((activity) => activity.activityUUID === activityUUID);
  },

  firstActivityUuid(processState) {
    const activities = processState.draftProcessModel && processState.draftProcessModel.activities ? processState.draftProcessModel.activities : [];
    return activities[0] ? activities[0].activityUUID : "";
  },

  hasAnyFrequency(frequency) {
    return Boolean(frequency.perDay || frequency.perWeek || frequency.perMonth || frequency.perYear);
  },

  mergeList(list, value) {
    const values = (list || []).concat(this.parseList(value));
    return Array.from(new Set(values.filter(Boolean)));
  },

  parseList(value) {
    return String(value || "")
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  },

  validation(code, message, severity, activityUUID, activityName) {
    return {
      validationId: `DCV-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      code,
      message,
      severity,
      activityUUID,
      activityName: activityName || ""
    };
  }
});
