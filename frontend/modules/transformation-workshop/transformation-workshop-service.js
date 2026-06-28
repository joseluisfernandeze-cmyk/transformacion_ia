window.TransformationWorkshopService = Object.seal({
  storageKey: "operational-intelligence.transformation-workshop",

  observationTypes: [
    "PROBLEMA_OBSERVADO",
    "DESPERDICIO_PERCIBIDO",
    "RETRABAJO",
    "ESPERA",
    "RIESGO",
    "IDEA_MEJORA",
    "AUTOMATIZACION_SUGERIDA",
    "IA_SUGERIDA",
    "COMENTARIO",
    "EVIDENCIA_ADICIONAL"
  ],

  createState() {
    const processState = this.loadProcessState();
    const packageData = this.createObservationPackage(processState);

    return {
      processState,
      selectedActivityUUID: this.firstActivityUuid(processState),
      packageData,
      questions: this.buildConsultantQuestions(packageData),
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `TWS-${Date.now()}`,
      author: "consultant",
      text: "Usaremos este taller para capturar observaciones del proceso. No hare diagnostico Lean, TOC ni recomendaciones automaticas; solo estructurare evidencia y preguntas.",
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
      state.processState = this.loadProcessState();
      state.packageData = this.normalizePackage(saved.packageData, state.processState);
      state.selectedActivityUUID = saved.selectedActivityUUID || this.firstActivityUuid(state.processState);
      state.questions = this.buildConsultantQuestions(state.packageData);
      state.chat = saved.chat && saved.chat.length ? saved.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.packageData = this.normalizePackage(state.packageData, state.processState);
    state.questions = this.buildConsultantQuestions(state.packageData);
    state.lastSavedAt = new Date().toISOString();
    this.syncToProcessModel(state);
    this.syncToKnowledgePackage(state);
    this.syncToContextGraph(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedActivityUUID: state.selectedActivityUUID,
      packageData: state.packageData,
      questions: state.questions,
      chat: state.chat,
      lastSavedAt: state.lastSavedAt
    }));
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

  createObservationPackage(processState) {
    const model = processState.draftProcessModel || {};

    return {
      transformationObservationPackageId: `TOB-${Date.now()}`,
      packageType: "TRANSFORMATION_OBSERVATION_PACKAGE",
      status: "IN_WORKSHOP",
      version: 1,
      processModelId: model.processModelId || "",
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER",
      observations: [],
      attachments: [],
      duplicateGroups: [],
      summary: this.buildSummary([])
    };
  },

  normalizePackage(packageData, processState) {
    const base = this.createObservationPackage(processState);
    const normalized = {
      ...base,
      ...(packageData || {}),
      observations: (packageData && packageData.observations) || [],
      attachments: (packageData && packageData.attachments) || [],
      duplicateGroups: []
    };

    normalized.observations = normalized.observations.map((observation) => this.normalizeObservation(observation, processState));
    normalized.duplicateGroups = this.detectDuplicates(normalized.observations);
    normalized.summary = this.buildSummary(normalized.observations);
    return normalized;
  },

  normalizeObservation(observation, processState) {
    const activity = this.findActivityInProcess(processState, observation.activityUUID);
    const type = observation.type || this.classifyObservation(observation.text || "").type;
    const confidence = this.calculateConfidence(observation, activity);

    return {
      observationId: observation.observationId || `OBS-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      activityUUID: observation.activityUUID || "",
      activityName: activity ? activity.name : observation.activityName || "",
      type,
      text: observation.text || "",
      evidenceNotes: observation.evidenceNotes || "",
      attachments: observation.attachments || [],
      classificationReason: observation.classificationReason || this.classifyObservation(observation.text || "").reason,
      confidence,
      status: observation.status || "DRAFT",
      createdAt: observation.createdAt || new Date().toISOString(),
      createdBy: observation.createdBy || "LOCAL_USER"
    };
  },

  addObservation(state, data) {
    const activity = this.findActivity(state, data.activityUUID);
    const classification = this.classifyObservation(data.text);
    const observation = this.normalizeObservation({
      activityUUID: data.activityUUID,
      activityName: activity ? activity.name : "",
      type: data.type || classification.type,
      text: data.text,
      evidenceNotes: data.evidenceNotes,
      attachments: this.createAttachments(data),
      classificationReason: classification.reason
    }, state.processState);

    state.packageData.observations.push(observation);
    this.addChat(state, "consultant", `Observacion registrada y clasificada como ${observation.type}. Confianza: ${observation.confidence}.`);
    this.saveState(state);
  },

  createAttachments(data) {
    return ["photo", "document", "link", "note", "voice"].map((kind) => {
      const value = data[kind];

      if (!value) {
        return null;
      }

      return {
        attachmentId: `ATT-${Date.now()}-${kind}`,
        type: kind.toUpperCase(),
        name: value,
        reference: value,
        status: kind === "voice" ? "ARCHITECTURE_READY_NOT_PROCESSED" : "REGISTERED",
        createdAt: new Date().toISOString()
      };
    }).filter(Boolean);
  },

  classifyObservation(text) {
    const normalized = String(text || "").toLowerCase();

    if (this.containsAny(normalized, ["retrabajo", "reproceso", "corregir", "devolver"])) {
      return { type: "RETRABAJO", reason: "Contiene senales de correccion o reproceso." };
    }

    if (this.containsAny(normalized, ["espera", "demora", "cola", "pendiente"])) {
      return { type: "ESPERA", reason: "Contiene senales de espera o demora." };
    }

    if (this.containsAny(normalized, ["riesgo", "error", "falla", "incumplimiento"])) {
      return { type: "RIESGO", reason: "Contiene senales de riesgo operativo." };
    }

    if (this.containsAny(normalized, ["automatizar", "robot", "integrar", "workflow"])) {
      return { type: "AUTOMATIZACION_SUGERIDA", reason: "Propone automatizacion o integracion." };
    }

    if (this.containsAny(normalized, ["ia", "inteligencia artificial", "clasificar", "extraer", "asistente"])) {
      return { type: "IA_SUGERIDA", reason: "Sugiere uso potencial de IA." };
    }

    if (this.containsAny(normalized, ["mejorar", "simplificar", "eliminar", "centralizar"])) {
      return { type: "IDEA_MEJORA", reason: "Describe una idea de mejora." };
    }

    if (this.containsAny(normalized, ["desperdicio", "manual", "duplicado", "sin valor"])) {
      return { type: "DESPERDICIO_PERCIBIDO", reason: "Describe desperdicio percibido, no clasificado oficialmente." };
    }

    if (this.containsAny(normalized, ["evidencia", "documento", "foto", "captura"])) {
      return { type: "EVIDENCIA_ADICIONAL", reason: "Aporta o solicita evidencia adicional." };
    }

    return { type: "PROBLEMA_OBSERVADO", reason: "Observacion general del taller." };
  },

  calculateConfidence(observation, activity) {
    const hasText = String(observation.text || "").trim().length > 12;
    const hasEvidence = String(observation.evidenceNotes || "").trim().length > 8 || (observation.attachments || []).length > 0;
    const hasActivity = Boolean(activity);

    if (hasText && hasEvidence && hasActivity) {
      return "HIGH_CONFIDENCE";
    }

    if (hasText && hasActivity) {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  buildConsultantQuestions(packageData) {
    const questions = [];

    packageData.observations.forEach((observation) => {
      if (observation.confidence === "LOW_CONFIDENCE") {
        questions.push(this.question(observation, "Necesito mas detalle o evidencia para esta observacion.", true));
      } else if (!observation.evidenceNotes && !observation.attachments.length) {
        questions.push(this.question(observation, "Que evidencia respalda esta observacion?", false));
      }
    });

    packageData.duplicateGroups.forEach((group) => {
      questions.push({
        questionId: `TWQ-DUP-${Date.now()}-${group.key}`,
        observationId: group.observationIds[0],
        question: `Hay ${group.observationIds.length} observaciones similares. Deseas fusionarlas o mantenerlas separadas?`,
        priority: "MEDIUM",
        blocksConsolidation: false,
        status: "OPEN"
      });
    });

    return questions.slice(0, 12);
  },

  question(observation, text, blocksConsolidation) {
    return {
      questionId: `TWQ-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      observationId: observation.observationId,
      question: `${observation.activityName}: ${text}`,
      priority: blocksConsolidation ? "HIGH" : "MEDIUM",
      blocksConsolidation,
      status: "OPEN"
    };
  },

  detectDuplicates(observations) {
    const groups = {};

    observations.forEach((observation) => {
      const key = `${observation.activityUUID}|${observation.type}|${this.normalizeTextKey(observation.text)}`;
      groups[key] = groups[key] || [];
      groups[key].push(observation);
    });

    return Object.keys(groups)
      .filter((key) => groups[key].length > 1)
      .map((key) => ({
        key,
        observationIds: groups[key].map((item) => item.observationId),
        type: groups[key][0].type,
        activityUUID: groups[key][0].activityUUID
      }));
  },

  normalizeTextKey(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 6)
      .join("-");
  },

  buildSummary(observations) {
    const grouped = observations.reduce((accumulator, observation) => {
      accumulator[observation.type] = (accumulator[observation.type] || 0) + 1;
      return accumulator;
    }, {});

    return {
      totalObservations: observations.length,
      highConfidence: observations.filter((item) => item.confidence === "HIGH_CONFIDENCE").length,
      mediumConfidence: observations.filter((item) => item.confidence === "MEDIUM_CONFIDENCE").length,
      lowConfidence: observations.filter((item) => item.confidence === "LOW_CONFIDENCE").length,
      byType: grouped
    };
  },

  syncToProcessModel(state) {
    const model = state.processState.draftProcessModel;

    if (!model || !model.activities) {
      return;
    }

    model.activities.forEach((activity) => {
      activity.workshopObservations = state.packageData.observations.filter((observation) => observation.activityUUID === activity.activityUUID);
    });

    if (window.ProcessDiscoveryService) {
      window.ProcessDiscoveryService.refreshAfterChange(state.processState);
    }
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.processState.draftProcessModel) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.transformationObservationPackage = state.packageData;
    contextState.result.knowledgePackage.identifiedActivities = state.processState.draftProcessModel.activities.map((activity) => ({
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
      workshopObservations: activity.workshopObservations || [],
      evidenceRefs: (activity.evidence || []).map((item) => item.evidenceId)
    }));
    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(state) {
    if (!window.ContextBuilderService) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    state.packageData.observations.forEach((observation) => {
      graph.nodes.push({
        id: observation.observationId,
        type: "WORKSHOP_OBSERVATION",
        label: `${observation.type}: ${observation.text.slice(0, 48)}`
      });
      graph.edges.push({ from: observation.activityUUID, to: observation.observationId, type: "HAS_OBSERVATION" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  addChat(state, author, text) {
    state.chat.push({
      messageId: `TWS-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  findActivity(state, activityUUID) {
    return this.findActivityInProcess(state.processState, activityUUID);
  },

  findActivityInProcess(processState, activityUUID) {
    return processState.draftProcessModel && processState.draftProcessModel.activities.find((activity) => activity.activityUUID === activityUUID);
  },

  firstActivityUuid(processState) {
    const activities = processState.draftProcessModel && processState.draftProcessModel.activities ? processState.draftProcessModel.activities : [];
    return activities[0] ? activities[0].activityUUID : "";
  },

  containsAny(text, keywords) {
    return keywords.some((keyword) => String(text || "").indexOf(keyword) !== -1);
  }
});
