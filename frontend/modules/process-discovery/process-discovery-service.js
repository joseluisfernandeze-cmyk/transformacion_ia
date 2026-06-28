window.ProcessDiscoveryService = Object.seal({
  storageKey: "operational-intelligence.process-discovery",

  createEmptyState() {
    return {
      draftProcessModel: null,
      selectedActivityUUID: "",
      consultantChat: this.createInitialChat(),
      questions: [],
      diagnostics: [],
      status: "NOT_STARTED"
    };
  },

  createInitialChat() {
    return [{
      messageId: `PMSG-${Date.now()}`,
      author: "consultant",
      text: "Estoy listo para construir el borrador As-Is usando el Business Knowledge Package, el Knowledge Package y la evidencia disponible. No consolidare nada sin tu validacion.",
      createdAt: new Date().toISOString()
    }];
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      return this.normalizeState(rawState ? JSON.parse(rawState) : this.createEmptyState());
    } catch (error) {
      return this.createEmptyState();
    }
  },

  normalizeState(state) {
    const baseState = this.createEmptyState();
    return {
      ...baseState,
      ...state,
      consultantChat: state.consultantChat && state.consultantChat.length ? state.consultantChat : this.createInitialChat(),
      questions: state.questions || [],
      diagnostics: state.diagnostics || []
    };
  },

  saveState(state) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(state));
  },

  loadKnowledgeSources() {
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;

    return {
      businessPackage: businessState && businessState.package ? businessState.package : businessState && window.BusinessDiscoveryService.buildBusinessKnowledgePackage(businessState),
      knowledgePackage: contextState && contextState.result ? contextState.result.knowledgePackage : null,
      contextGraph: contextState && contextState.result ? contextState.result.contextGraph : null,
      contextState: contextState || null,
      businessState: businessState || null
    };
  },

  buildDraftProcessModel() {
    const sources = this.loadKnowledgeSources();
    const activities = this.buildActivities(sources);
    const relationships = this.buildRelationships(activities);
    const diagnostics = this.detectDiagnostics(activities, relationships);
    const questions = this.buildQuestions(diagnostics, activities);

    return {
      draftProcessModel: {
        processModelId: `PM-${Date.now()}`,
        name: this.resolveProcessName(sources),
        processType: "AS_IS",
        status: "DRAFT",
        version: 1,
        businessKnowledgePackageId: sources.businessPackage && sources.businessPackage.businessKnowledgePackageId,
        knowledgePackageId: sources.knowledgePackage && sources.knowledgePackage.knowledgePackageId,
        createdAt: new Date().toISOString(),
        activities,
        relationships,
        subprocesses: this.buildSubprocesses(sources),
        diagnostics
      },
      questions
    };
  },

  resolveProcessName(sources) {
    const contextProcess = sources.knowledgePackage && sources.knowledgePackage.scope && sources.knowledgePackage.scope.process;
    const businessProcess = sources.businessPackage && sources.businessPackage.identifiedProcesses && sources.businessPackage.identifiedProcesses[0];
    return contextProcess || businessProcess || "Proceso As-Is borrador";
  },

  buildActivities(sources) {
    const contextActivities = sources.knowledgePackage && sources.knowledgePackage.identifiedActivities ? sources.knowledgePackage.identifiedActivities : [];
    const inferredActivities = this.inferActivitiesFromBusinessPackage(sources);

    if (contextActivities.length >= 3) {
      return contextActivities.map((activity, index) => this.normalizeActivity(activity, index, sources));
    }

    return this.mergeActivities(contextActivities, inferredActivities).map((activity, index) => this.normalizeActivity(activity, index, sources));
  },

  inferActivitiesFromBusinessPackage(sources) {
    const businessPackage = sources.businessPackage || {};
    const processes = businessPackage.identifiedProcesses || [];
    const systems = businessPackage.identifiedSystems || [];
    const documents = businessPackage.documents || [];
    const defaultProcess = processes[0] || "Proceso principal";
    const evidenceActivities = this.extractActivitiesFromEvidence(businessPackage);

    if (evidenceActivities.length >= 3) {
      return evidenceActivities;
    }

    return evidenceActivities.concat([
      {
        name: `Recibir solicitud o demanda de ${defaultProcess}`,
        description: "Actividad inferida desde el Business Knowledge Package. Requiere validacion del usuario.",
        systems,
        documents,
        confidence: "LOW_CONFIDENCE",
        evidenceRefs: ["BUSINESS_KNOWLEDGE_PACKAGE"]
      },
      {
        name: `Validar informacion requerida para ${defaultProcess}`,
        description: "Actividad inferida a partir del alcance y sistemas declarados.",
        systems,
        documents,
        confidence: "LOW_CONFIDENCE",
        evidenceRefs: ["BUSINESS_KNOWLEDGE_PACKAGE"]
      },
      {
        name: `Ejecutar operacion principal de ${defaultProcess}`,
        description: "Actividad base pendiente de detalle operativo.",
        systems,
        documents,
        confidence: "LOW_CONFIDENCE",
        evidenceRefs: ["BUSINESS_KNOWLEDGE_PACKAGE"]
      },
      {
        name: `Registrar resultado de ${defaultProcess}`,
        description: "Actividad inferida por necesidad de trazabilidad y cierre del flujo.",
        systems,
        documents,
        confidence: "LOW_CONFIDENCE",
        evidenceRefs: ["BUSINESS_KNOWLEDGE_PACKAGE"]
      }
    ]).slice(0, 8);
  },

  extractActivitiesFromEvidence(businessPackage) {
    const documents = businessPackage.documents || [];
    const evidenceText = documents.map((documentItem) => documentItem.normalizedText || "").join("\n");
    const clauses = this.extractActionClauses(evidenceText);

    return clauses.map((clause, index) => ({
      name: this.toActivityName(clause),
      description: clause,
      systems: businessPackage.identifiedSystems || [],
      documents: documents.map((documentItem) => documentItem.title || documentItem.documentId),
      confidence: "MEDIUM_CONFIDENCE",
      evidenceRefs: [`BUSINESS_DOCUMENT-${index + 1}`]
    }));
  },

  extractActionClauses(text) {
    const keywords = ["recibe", "valid", "revisa", "aprueba", "registra", "envia", "crea", "actualiza", "genera", "analiza", "solicita", "confirma", "entrega", "factura"];

    return String(text || "")
      .replace(/\n/g, ". ")
      .split(/\.|;|\|/)
      .map((item) => item.trim())
      .filter((item) => {
        const normalized = item.toLowerCase();
        return item.length > 8 && keywords.some((keyword) => normalized.indexOf(keyword) !== -1);
      })
      .slice(0, 12);
  },

  toActivityName(text) {
    const clean = String(text || "").replace(/^[\-\d.)\s]+/, "").trim();
    return clean.length > 76 ? `${clean.slice(0, 73)}...` : clean;
  },

  mergeActivities(primary, secondary) {
    const merged = [];
    const names = {};

    primary.concat(secondary).forEach((activity) => {
      const key = String(activity.name || activity.activityName || "").toLowerCase().trim();

      if (!key || names[key]) {
        return;
      }

      names[key] = true;
      merged.push(activity);
    });

    return merged;
  },

  normalizeActivity(activity, index, sources) {
    const evidence = this.resolveEvidence(activity, sources);
    const confidence = activity.confidence || (evidence.length ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE");

    return {
      activityId: activity.activityId || `ACT-${String(index + 1).padStart(6, "0")}`,
      activityUUID: activity.activityUUID || `ACTUUID-${Date.now()}-${index + 1}`,
      sequence: Number(activity.sequence || index + 1),
      name: activity.name || activity.activityName || "Actividad pendiente de nombrar",
      description: activity.description || "",
      subprocess: activity.subprocess || "Proceso principal",
      responsible: activity.responsible || activity.responsibleRole || "",
      area: activity.area || this.resolveArea(sources),
      inputs: activity.inputs || [],
      outputs: activity.outputs || [],
      systems: activity.systems || this.resolveSystems(sources),
      documents: activity.documents || this.resolveDocuments(sources),
      businessRules: activity.businessRules || [],
      decisions: activity.decisions || [],
      dependencies: activity.dependencies || [],
      confidence,
      evidence,
      questions: [],
      approvalStatus: "DRAFT"
    };
  },

  resolveArea(sources) {
    return sources.businessPackage && sources.businessPackage.structure ? sources.businessPackage.structure.areas || "" : "";
  },

  resolveSystems(sources) {
    if (sources.businessPackage && sources.businessPackage.identifiedSystems) {
      return sources.businessPackage.identifiedSystems;
    }

    return [];
  },

  resolveDocuments(sources) {
    if (sources.businessPackage && sources.businessPackage.documents) {
      return sources.businessPackage.documents.map((documentItem) => documentItem.title || documentItem.documentId);
    }

    return [];
  },

  resolveEvidence(activity, sources) {
    const evidence = [];
    const refs = activity.evidenceRefs || [];

    refs.forEach((ref) => {
      evidence.push({
        evidenceId: ref,
        sourceType: String(ref).indexOf("INTERVIEW") !== -1 ? "INTERVIEW" : "KNOWLEDGE_PACKAGE",
        sourceName: ref,
        fragment: activity.description || activity.name || "",
        confidence: activity.confidence || "LOW_CONFIDENCE"
      });
    });

    if (!evidence.length && sources.businessPackage) {
      evidence.push({
        evidenceId: "BUSINESS_KNOWLEDGE_PACKAGE",
        sourceType: "BUSINESS_KNOWLEDGE_PACKAGE",
        sourceName: sources.businessPackage.businessKnowledgePackageId || "Business Knowledge Package",
        fragment: sources.businessPackage.executiveSummary || "",
        confidence: sources.businessPackage.confidence || "LOW_CONFIDENCE"
      });
    }

    return evidence;
  },

  buildRelationships(activities) {
    return activities.slice(0, -1).map((activity, index) => ({
      relationshipId: `REL-${index + 1}`,
      fromActivityUUID: activity.activityUUID,
      toActivityUUID: activities[index + 1].activityUUID,
      relationshipType: "SEQUENCE",
      confidence: this.lowestConfidence(activity.confidence, activities[index + 1].confidence),
      evidenceRefs: activity.evidence.map((item) => item.evidenceId)
    }));
  },

  buildSubprocesses(sources) {
    const businessProcesses = sources.businessPackage && sources.businessPackage.identifiedProcesses ? sources.businessPackage.identifiedProcesses : [];
    return businessProcesses.length ? businessProcesses.map((name, index) => ({
      subprocessId: `SUB-${index + 1}`,
      name,
      confidence: sources.businessPackage.confidence || "LOW_CONFIDENCE"
    })) : [{ subprocessId: "SUB-1", name: "Proceso principal", confidence: "LOW_CONFIDENCE" }];
  },

  detectDiagnostics(activities, relationships) {
    const diagnostics = [];
    const names = {};

    activities.forEach((activity) => {
      const key = activity.name.toLowerCase().trim();
      names[key] = names[key] || [];
      names[key].push(activity);

      if (!activity.responsible) {
        diagnostics.push(this.diagnostic("NO_RESPONSIBLE", "Actividad sin responsable", activity.activityUUID, "HIGH"));
      }

      if (!activity.evidence || !activity.evidence.length) {
        diagnostics.push(this.diagnostic("NO_EVIDENCE", "Actividad sin evidencia", activity.activityUUID, "HIGH"));
      }

      if (activity.confidence === "LOW_CONFIDENCE" || activity.confidence === "INSUFFICIENT_INFORMATION") {
        diagnostics.push(this.diagnostic("LOW_CONFIDENCE", "Actividad con baja confianza", activity.activityUUID, "MEDIUM"));
      }
    });

    Object.keys(names).forEach((name) => {
      if (names[name].length > 1) {
        diagnostics.push(this.diagnostic("DUPLICATE_ACTIVITY", `Posible actividad duplicada: ${names[name][0].name}`, names[name][0].activityUUID, "MEDIUM"));
      }
    });

    if (relationships.length !== Math.max(activities.length - 1, 0)) {
      diagnostics.push(this.diagnostic("SEQUENCE_INCONSISTENT", "La secuencia del proceso no esta completa.", "", "HIGH"));
    }

    return diagnostics;
  },

  diagnostic(code, message, activityUUID, impact) {
    return {
      diagnosticId: `DIA-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      code,
      message,
      activityUUID,
      impact,
      status: "OPEN"
    };
  },

  buildQuestions(diagnostics, activities) {
    const questions = diagnostics.filter((item) => item.status === "OPEN").map((item, index) => ({
      questionId: `QPD-${index + 1}`,
      question: this.questionForDiagnostic(item, activities),
      reason: item.message,
      priority: item.impact,
      activityUUID: item.activityUUID,
      blocksApproval: item.impact === "HIGH",
      status: "OPEN"
    }));

    if (!questions.length) {
      questions.push({
        questionId: "QPD-CONFIRM",
        question: "Confirma si la secuencia y las actividades representan correctamente el proceso As-Is.",
        reason: "Validacion humana requerida antes de consolidar.",
        priority: "MEDIUM",
        activityUUID: "",
        blocksApproval: false,
        status: "OPEN"
      });
    }

    return questions;
  },

  questionForDiagnostic(diagnostic, activities) {
    const activity = activities.find((item) => item.activityUUID === diagnostic.activityUUID);
    const activityName = activity ? activity.name : "la actividad indicada";

    if (diagnostic.code === "NO_RESPONSIBLE") {
      return `Quien es responsable de "${activityName}"?`;
    }

    if (diagnostic.code === "NO_EVIDENCE") {
      return `Que documento, entrevista o dato confirma que "${activityName}" existe?`;
    }

    if (diagnostic.code === "LOW_CONFIDENCE") {
      return `Puedes confirmar o corregir la actividad "${activityName}"?`;
    }

    return diagnostic.message;
  },

  approveActivity(state, activityUUID) {
    const activity = this.findActivity(state, activityUUID);

    if (activity) {
      activity.approvalStatus = "HUMAN_APPROVED";
      activity.confidence = activity.confidence === "LOW_CONFIDENCE" ? "MEDIUM_CONFIDENCE" : activity.confidence;
      this.addChat(state, "consultant", `Actividad aprobada: ${activity.name}.`);
      this.refreshAfterChange(state);
    }
  },

  updateActivity(state, activityUUID, updates) {
    const activity = this.findActivity(state, activityUUID);

    if (activity) {
      Object.assign(activity, updates);
      activity.approvalStatus = "IN_REVIEW";
      activity.evidence.push({
        evidenceId: `USER_EDIT-${Date.now()}`,
        sourceType: "USER_INPUT",
        sourceName: "Edicion humana",
        fragment: "Actividad modificada por el usuario.",
        confidence: "HIGH_CONFIDENCE"
      });
      this.addChat(state, "consultant", `Actualice la actividad "${activity.name}" y registre tu edicion como evidencia humana.`);
      this.refreshAfterChange(state);
    }
  },

  deleteActivity(state, activityUUID) {
    if (!state.draftProcessModel) {
      return;
    }

    state.draftProcessModel.activities = state.draftProcessModel.activities.filter((activity) => activity.activityUUID !== activityUUID);
    this.resequence(state.draftProcessModel.activities);
    state.draftProcessModel.relationships = this.buildRelationships(state.draftProcessModel.activities);
    this.addChat(state, "consultant", "Elimine la actividad seleccionada y actualice la secuencia.");
    this.refreshAfterChange(state);
  },

  addActivity(state, activity) {
    if (!state.draftProcessModel) {
      return;
    }

    state.draftProcessModel.activities.push(this.normalizeActivity({
      ...activity,
      activityUUID: `ACTUUID-${Date.now()}`,
      sequence: state.draftProcessModel.activities.length + 1,
      confidence: "MEDIUM_CONFIDENCE",
      evidenceRefs: ["USER_INPUT"]
    }, state.draftProcessModel.activities.length, this.loadKnowledgeSources()));
    state.draftProcessModel.relationships = this.buildRelationships(state.draftProcessModel.activities);
    this.addChat(state, "consultant", "Agregue la nueva actividad con evidencia de usuario y actualice el borrador.");
    this.refreshAfterChange(state);
  },

  answerQuestion(state, message) {
    this.addChat(state, "user", message);
    const selectedQuestion = state.questions.find((question) => question.status === "OPEN");

    if (selectedQuestion) {
      selectedQuestion.status = "ANSWERED";
      const activity = this.findActivity(state, selectedQuestion.activityUUID);

      if (activity) {
        activity.evidence.push({
          evidenceId: `ANSWER-${Date.now()}`,
          sourceType: "USER_INPUT",
          sourceName: selectedQuestion.question,
          fragment: message,
          confidence: "HIGH_CONFIDENCE"
        });

        if (selectedQuestion.reason.indexOf("responsable") !== -1 || selectedQuestion.question.indexOf("responsable") !== -1) {
          activity.responsible = message;
        }

        activity.confidence = "MEDIUM_CONFIDENCE";
      }
    }

    this.addChat(state, "consultant", "Registre tu respuesta como evidencia y actualice el borrador As-Is.");
    this.refreshAfterChange(state);
  },

  refreshAfterChange(state) {
    if (!state.draftProcessModel) {
      return;
    }

    this.resequence(state.draftProcessModel.activities);
    state.draftProcessModel.relationships = this.buildRelationships(state.draftProcessModel.activities);
    state.draftProcessModel.diagnostics = this.detectDiagnostics(state.draftProcessModel.activities, state.draftProcessModel.relationships);
    state.questions = this.buildQuestions(state.draftProcessModel.diagnostics, state.draftProcessModel.activities);
    state.diagnostics = state.draftProcessModel.diagnostics;
    state.status = this.resolveStatus(state);
    this.syncToKnowledgePackage(state);
    this.saveState(state);
  },

  resolveStatus(state) {
    const blocking = (state.questions || []).some((question) => question.status === "OPEN" && question.blocksApproval);
    return blocking ? "NEEDS_MORE_INFORMATION" : "IN_REVIEW";
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.draftProcessModel) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.identifiedActivities = state.draftProcessModel.activities.map((activity) => ({
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
      businessRules: activity.businessRules,
      decisions: activity.decisions,
      confidence: activity.confidence,
      evidenceRefs: activity.evidence.map((item) => item.evidenceId)
    }));
    contextState.result.contextGraph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    window.ContextBuilderService.saveState(contextState);
  },

  findActivity(state, activityUUID) {
    return state.draftProcessModel && state.draftProcessModel.activities.find((activity) => activity.activityUUID === activityUUID);
  },

  resequence(activities) {
    activities.forEach((activity, index) => {
      activity.sequence = index + 1;
      activity.activityId = `ACT-${String(index + 1).padStart(6, "0")}`;
    });
  },

  addChat(state, author, text) {
    state.consultantChat.push({
      messageId: `PMSG-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  lowestConfidence(left, right) {
    const ranking = {
      INSUFFICIENT_INFORMATION: 0,
      LOW_CONFIDENCE: 1,
      MEDIUM_CONFIDENCE: 2,
      HIGH_CONFIDENCE: 3
    };

    return ranking[left] <= ranking[right] ? left : right;
  }
});
