window.IntelligentVsmStudioService = Object.seal({
  storageKey: "operational-intelligence.intelligent-vsm-studio",

  createState() {
    const processState = this.loadProcessState();
    this.ensureVsmData(processState);

    return {
      processState,
      selectedActivityUUID: this.firstActivityUuid(processState),
      view: {
        zoom: 1,
        panX: 0,
        panY: 0,
        showMetrics: true,
        showResponsibles: true,
        showSystems: true
      },
      validations: this.validateVsm(processState),
      metrics: this.calculateMetrics(processState),
      collapsedSubprocesses: [],
      lastSavedAt: ""
    };
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      const savedState = rawState ? JSON.parse(rawState) : {};
      const state = {
        ...this.createState(),
        ...savedState
      };
      state.processState = this.loadProcessState();
      this.ensureVsmData(state.processState);
      state.selectedActivityUUID = state.selectedActivityUUID || this.firstActivityUuid(state.processState);
      state.view = { ...this.createState().view, ...(savedState.view || {}) };
      state.collapsedSubprocesses = savedState.collapsedSubprocesses || [];
      state.validations = this.validateVsm(state.processState);
      state.metrics = this.calculateMetrics(state.processState);
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.validations = this.validateVsm(state.processState);
    state.metrics = this.calculateMetrics(state.processState);
    state.lastSavedAt = new Date().toISOString();
    this.persistProcessState(state.processState);
    this.syncToKnowledgePackage(state.processState);
    this.syncToContextGraph(state.processState);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedActivityUUID: state.selectedActivityUUID,
      view: state.view,
      collapsedSubprocesses: state.collapsedSubprocesses,
      lastSavedAt: state.lastSavedAt
    }));
  },

  loadProcessState() {
    if (window.ProcessDataCollectionStudioService) {
      const state = window.ProcessDataCollectionStudioService.loadProcessState();
      window.ProcessDataCollectionStudioService.ensureOperationalData(state);
      return state;
    }

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

  ensureVsmData(processState) {
    const model = processState.draftProcessModel;

    if (!model || !model.activities) {
      return;
    }

    model.activities.forEach((activity, index) => {
      const operationalData = activity.operationalData || {};
      activity.vsmData = this.normalizeVsmData(activity.vsmData, activity, operationalData, index);
    });
  },

  normalizeVsmData(vsmData, activity, operationalData, index) {
    const time = operationalData.time || {};
    const waits = operationalData.waits || {};
    const frequency = operationalData.frequency || {};
    const classification = operationalData.classification || {};

    const base = {
      sequence: activity.sequence || index + 1,
      lane: activity.responsible || "",
      x: typeof activity.x === "number" ? activity.x : 40 + index * 280,
      y: typeof activity.y === "number" ? activity.y : 80 + Math.floor(index / 4) * 190,
      collapsed: false,
      color: "#ffffff",
      processTimeMin: time.min || "",
      processTimeLikely: time.likely || "",
      processTimeMax: time.max || "",
      waitTime: waits.waitTime || "",
      waitReason: waits.reason || "",
      valueClassification: classification.valueClassification || "",
      frequencyPerDay: frequency.perDay || "",
      frequencyPerWeek: frequency.perWeek || "",
      frequencyPerMonth: frequency.perMonth || "",
      frequencyPerYear: frequency.perYear || "",
      showInVsm: true
    };

    return {
      ...base,
      ...(vsmData || {})
    };
  },

  calculateMetrics(processState) {
    const model = processState.draftProcessModel;
    const activities = model && model.activities ? model.activities : [];
    const enriched = activities.map((activity) => {
      const data = activity.vsmData || {};
      const processTimeAverage = this.expectedTriangular(data.processTimeMin, data.processTimeLikely, data.processTimeMax);
      const waitingTime = Number(data.waitTime) || 0;
      return {
        activity,
        data,
        processTimeAverage,
        waitingTime,
        totalTime: processTimeAverage + waitingTime
      };
    });

    const processTimeTotal = this.sum(enriched.map((item) => item.processTimeAverage));
    const waitingTimeTotal = this.sum(enriched.map((item) => item.waitingTime));
    const leadTimeTotal = processTimeTotal + waitingTimeTotal;
    const vaTime = this.sum(enriched.filter((item) => item.data.valueClassification === "VA").map((item) => item.processTimeAverage));
    const nnvaTime = this.sum(enriched.filter((item) => item.data.valueClassification === "NNVA").map((item) => item.processTimeAverage));
    const nvaTime = this.sum(enriched.filter((item) => item.data.valueClassification === "NVA").map((item) => item.processTimeAverage));

    return {
      leadTimeTotal,
      processTimeTotal,
      touchTimeTotal: processTimeTotal,
      waitingTimeTotal,
      totalTime: leadTimeTotal,
      vaTime,
      nnvaTime,
      nvaTime,
      vaPercentage: this.percentage(vaTime, leadTimeTotal),
      nvaPercentage: this.percentage(nvaTime + waitingTimeTotal, leadTimeTotal),
      activityCount: activities.length,
      responsibleCount: this.countDistinct(activities.map((activity) => activity.responsible)),
      systemCount: this.countDistinct(activities.flatMap((activity) => activity.systems || []))
    };
  },

  validateVsm(processState) {
    const model = processState.draftProcessModel;

    if (!model || !model.activities || !model.activities.length) {
      return [this.validation("NO_PROCESS", "No existe Process Model disponible.", "CRITICAL", "")];
    }

    return model.activities.flatMap((activity) => {
      const data = activity.vsmData || {};
      const validations = [];

      if (!data.processTimeMin || !data.processTimeLikely || !data.processTimeMax) {
        validations.push(this.validation("MISSING_TIME", "Actividad sin tiempos completos.", "HIGH", activity.activityUUID, activity.name));
      }

      if (!data.valueClassification) {
        validations.push(this.validation("MISSING_CLASSIFICATION", "Actividad sin clasificacion VA/NNVA/NVA.", "HIGH", activity.activityUUID, activity.name));
      }

      if (!data.frequencyPerDay && !data.frequencyPerWeek && !data.frequencyPerMonth && !data.frequencyPerYear) {
        validations.push(this.validation("MISSING_FREQUENCY", "Actividad sin frecuencia.", "HIGH", activity.activityUUID, activity.name));
      }

      if (!activity.responsible) {
        validations.push(this.validation("MISSING_RESPONSIBLE", "Actividad sin responsable.", "HIGH", activity.activityUUID, activity.name));
      }

      if (!activity.evidence || !activity.evidence.length) {
        validations.push(this.validation("NO_EVIDENCE", "Actividad sin evidencia.", "MEDIUM", activity.activityUUID, activity.name));
      }

      if (activity.confidence === "LOW_CONFIDENCE" || activity.confidence === "INSUFFICIENT_INFORMATION") {
        validations.push(this.validation("LOW_CONFIDENCE", "Actividad con baja confianza.", "MEDIUM", activity.activityUUID, activity.name));
      }

      return validations;
    });
  },

  updateActivityVsm(state, activityUUID, updates) {
    const activity = this.findActivity(state, activityUUID);

    if (!activity) {
      return;
    }

    activity.vsmData = {
      ...activity.vsmData,
      processTimeMin: updates.processTimeMin,
      processTimeLikely: updates.processTimeLikely,
      processTimeMax: updates.processTimeMax,
      waitTime: updates.waitTime,
      waitReason: updates.waitReason,
      valueClassification: updates.valueClassification,
      frequencyPerDay: updates.frequencyPerDay,
      frequencyPerWeek: updates.frequencyPerWeek,
      frequencyPerMonth: updates.frequencyPerMonth,
      frequencyPerYear: updates.frequencyPerYear
    };

    activity.operationalData = activity.operationalData || {};
    activity.operationalData.time = {
      ...(activity.operationalData.time || {}),
      min: updates.processTimeMin,
      likely: updates.processTimeLikely,
      max: updates.processTimeMax
    };
    activity.operationalData.waits = {
      ...(activity.operationalData.waits || {}),
      waitTime: updates.waitTime,
      reason: updates.waitReason
    };
    activity.operationalData.classification = {
      ...(activity.operationalData.classification || {}),
      valueClassification: updates.valueClassification
    };
    activity.operationalData.frequency = {
      ...(activity.operationalData.frequency || {}),
      perDay: updates.frequencyPerDay,
      perWeek: updates.frequencyPerWeek,
      perMonth: updates.frequencyPerMonth,
      perYear: updates.frequencyPerYear
    };
    activity.evidence = activity.evidence || [];
    activity.evidence.push({
      evidenceId: `VSM-EDIT-${Date.now()}`,
      sourceType: "USER_INPUT",
      sourceName: "Intelligent VSM Studio",
      fragment: "Datos VSM actualizados desde el modelo visual.",
      confidence: "HIGH_CONFIDENCE"
    });

    this.saveState(state);
  },

  moveActivity(state, activityUUID, x, y) {
    const activity = this.findActivity(state, activityUUID);

    if (!activity) {
      return;
    }

    activity.vsmData.x = Math.max(16, x);
    activity.vsmData.y = Math.max(16, y);
    activity.x = activity.vsmData.x;
    activity.y = activity.vsmData.y;
    this.saveState(state);
  },

  setZoom(state, zoom) {
    state.view.zoom = Math.max(0.55, Math.min(1.6, Number(zoom) || 1));
    this.saveState(state);
  },

  pan(state, deltaX, deltaY) {
    state.view.panX += deltaX;
    state.view.panY += deltaY;
    this.saveState(state);
  },

  toggleViewOption(state, option) {
    state.view[option] = !state.view[option];
    this.saveState(state);
  },

  toggleSubprocess(state, subprocess) {
    const key = subprocess || "Proceso principal";
    const index = state.collapsedSubprocesses.indexOf(key);

    if (index === -1) {
      state.collapsedSubprocesses.push(key);
    } else {
      state.collapsedSubprocesses.splice(index, 1);
    }

    this.saveState(state);
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
      systems: activity.systems,
      documents: activity.documents,
      confidence: activity.confidence,
      operationalData: activity.operationalData,
      vsmData: activity.vsmData,
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
      const metricId = `${activity.activityUUID}-VSM-METRICS`;
      graph.nodes.push({
        id: metricId,
        type: "VSM_METRICS",
        label: `${activity.vsmData.valueClassification || "PEND"} / ${this.expectedTriangular(activity.vsmData.processTimeMin, activity.vsmData.processTimeLikely, activity.vsmData.processTimeMax).toFixed(1)}`
      });
      graph.edges.push({ from: activity.activityUUID, to: metricId, type: "HAS_VSM_METRICS" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  getVisibleActivities(state) {
    const activities = state.processState.draftProcessModel && state.processState.draftProcessModel.activities ? state.processState.draftProcessModel.activities : [];
    return activities.filter((activity) => state.collapsedSubprocesses.indexOf(activity.subprocess || "Proceso principal") === -1);
  },

  findActivity(state, activityUUID) {
    return state.processState.draftProcessModel && state.processState.draftProcessModel.activities.find((activity) => activity.activityUUID === activityUUID);
  },

  firstActivityUuid(processState) {
    const activities = processState.draftProcessModel && processState.draftProcessModel.activities ? processState.draftProcessModel.activities : [];
    return activities[0] ? activities[0].activityUUID : "";
  },

  getSubprocesses(state) {
    const activities = state.processState.draftProcessModel && state.processState.draftProcessModel.activities ? state.processState.draftProcessModel.activities : [];
    return Array.from(new Set(activities.map((activity) => activity.subprocess || "Proceso principal")));
  },

  expectedTriangular(min, likely, max) {
    if (window.CalculationEngine && window.CalculationEngine.expectedTriangular) {
      return window.CalculationEngine.expectedTriangular(min, likely, max);
    }

    return ((Number(min) || 0) + (Number(likely) || 0) + (Number(max) || 0)) / 3;
  },

  sum(values) {
    return values.reduce((total, value) => total + (Number(value) || 0), 0);
  },

  percentage(part, total) {
    const denominator = Number(total) || 0;
    return denominator > 0 ? ((Number(part) || 0) / denominator) * 100 : 0;
  },

  countDistinct(values) {
    return new Set(values.filter(Boolean)).size;
  },

  validation(code, message, severity, activityUUID, activityName) {
    return {
      validationId: `IVSM-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      code,
      message,
      severity,
      activityUUID,
      activityName: activityName || ""
    };
  }
});
