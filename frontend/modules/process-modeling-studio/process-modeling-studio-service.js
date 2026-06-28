window.ProcessModelingStudioService = Object.seal({
  createState() {
    const processState = window.ProcessDiscoveryService.loadState();

    if (!processState.draftProcessModel) {
      const draft = window.ProcessDiscoveryService.buildDraftProcessModel();
      processState.draftProcessModel = draft.draftProcessModel;
      processState.questions = draft.questions;
      processState.diagnostics = draft.draftProcessModel.diagnostics;
      processState.selectedActivityUUID = processState.draftProcessModel.activities[0] ? processState.draftProcessModel.activities[0].activityUUID : "";
      processState.status = window.ProcessDiscoveryService.resolveStatus(processState);
      window.ProcessDiscoveryService.syncToKnowledgePackage(processState);
      window.ProcessDiscoveryService.saveState(processState);
    }

    return processState;
  },

  saveState(state) {
    this.ensureLayout(state);
    window.ProcessDiscoveryService.refreshAfterChange(state);
  },

  ensureLayout(state) {
    if (!state.draftProcessModel) {
      return;
    }

    state.draftProcessModel.activities.forEach((activity, index) => {
      if (typeof activity.x !== "number") {
        activity.x = 40 + (index % 3) * 280;
      }

      if (typeof activity.y !== "number") {
        activity.y = 40 + Math.floor(index / 3) * 180;
      }

      activity.observations = activity.observations || [];
      activity.inputs = activity.inputs || [];
      activity.outputs = activity.outputs || [];
      activity.systems = activity.systems || [];
      activity.documents = activity.documents || [];
      activity.businessRules = activity.businessRules || [];
      activity.decisions = activity.decisions || [];
      activity.evidence = activity.evidence || [];
    });
  },

  moveActivity(state, activityUUID, x, y) {
    const activity = window.ProcessDiscoveryService.findActivity(state, activityUUID);

    if (!activity) {
      return;
    }

    activity.x = Math.max(16, x);
    activity.y = Math.max(16, y);
    this.addTrace(activity, "LAYOUT_CHANGE", "Actividad movida en el Studio.");
    window.ProcessDiscoveryService.addChat(state, "consultant", `Actualice la posicion visual de "${activity.name}" y conserve trazabilidad del cambio.`);
    this.saveState(state);
  },

  updateActivity(state, activityUUID, updates) {
    const activity = window.ProcessDiscoveryService.findActivity(state, activityUUID);

    if (!activity) {
      return;
    }

    Object.assign(activity, {
      name: updates.name,
      description: updates.description,
      responsible: updates.responsible,
      area: updates.area,
      inputs: this.parseList(updates.inputs),
      outputs: this.parseList(updates.outputs),
      systems: this.parseList(updates.systems),
      documents: this.parseList(updates.documents),
      businessRules: this.parseList(updates.businessRules),
      decisions: this.parseList(updates.decisions)
    });

    if (updates.observation) {
      activity.observations.push({
        observationId: `OBS-${Date.now()}`,
        text: updates.observation,
        createdAt: new Date().toISOString(),
        createdBy: "USER"
      });
    }

    activity.approvalStatus = "IN_REVIEW";
    this.addTrace(activity, "USER_EDIT", "Actividad editada en Process Modeling Studio.");
    this.saveState(state);
  },

  splitActivity(state, activityUUID) {
    const model = state.draftProcessModel;
    const index = model.activities.findIndex((activity) => activity.activityUUID === activityUUID);

    if (index === -1) {
      return;
    }

    const source = model.activities[index];
    const newActivity = {
      ...JSON.parse(JSON.stringify(source)),
      activityId: `ACT-${String(index + 2).padStart(6, "0")}`,
      activityUUID: `ACTUUID-${Date.now()}-SPLIT`,
      sequence: source.sequence + 1,
      name: `${source.name} - detalle`,
      description: "Actividad dividida desde el Studio. Requiere validacion.",
      confidence: "LOW_CONFIDENCE",
      approvalStatus: "DRAFT",
      x: (source.x || 40) + 260,
      y: (source.y || 40) + 120,
      evidence: (source.evidence || []).concat([{
        evidenceId: `SPLIT-${Date.now()}`,
        sourceType: "USER_INPUT",
        sourceName: "Division de actividad",
        fragment: `Actividad dividida desde ${source.name}.`,
        confidence: "MEDIUM_CONFIDENCE"
      }]),
      observations: []
    };

    this.addTrace(source, "SPLIT_SOURCE", "Actividad usada como origen de division.");
    model.activities.splice(index + 1, 0, newActivity);
    window.ProcessDiscoveryService.addChat(state, "consultant", `Dividi "${source.name}" en dos actividades. Valida nombre, responsable y evidencia de la nueva actividad.`);
    this.saveState(state);
  },

  mergeActivityWithNext(state, activityUUID) {
    const model = state.draftProcessModel;
    const index = model.activities.findIndex((activity) => activity.activityUUID === activityUUID);

    if (index === -1 || index >= model.activities.length - 1) {
      return;
    }

    const first = model.activities[index];
    const second = model.activities[index + 1];
    first.name = `${first.name} / ${second.name}`;
    first.description = [first.description, second.description].filter(Boolean).join("\n");
    first.inputs = this.uniqueList((first.inputs || []).concat(second.inputs || []));
    first.outputs = this.uniqueList((first.outputs || []).concat(second.outputs || []));
    first.systems = this.uniqueList((first.systems || []).concat(second.systems || []));
    first.documents = this.uniqueList((first.documents || []).concat(second.documents || []));
    first.businessRules = this.uniqueList((first.businessRules || []).concat(second.businessRules || []));
    first.decisions = this.uniqueList((first.decisions || []).concat(second.decisions || []));
    first.evidence = (first.evidence || []).concat(second.evidence || []);
    first.confidence = window.ProcessDiscoveryService.lowestConfidence(first.confidence, second.confidence);
    this.addTrace(first, "MERGE", `Actividad unida con ${second.name}.`);
    model.activities.splice(index + 1, 1);
    window.ProcessDiscoveryService.addChat(state, "consultant", `Uni dos actividades consecutivas. Revise que la actividad resultante no oculte pasos relevantes.`);
    this.saveState(state);
  },

  addActivity(state) {
    window.ProcessDiscoveryService.addActivity(state, {
      name: "Nueva actividad del Studio",
      description: "Actividad agregada durante la validacion visual.",
      responsible: "",
      area: "",
      inputs: [],
      outputs: [],
      systems: [],
      documents: [],
      businessRules: [],
      decisions: [],
      dependencies: [],
      observations: []
    });
    const activity = state.draftProcessModel.activities[state.draftProcessModel.activities.length - 1];
    activity.x = 80;
    activity.y = 80 + state.draftProcessModel.activities.length * 120;
    state.selectedActivityUUID = activity.activityUUID;
    this.saveState(state);
  },

  deleteActivity(state, activityUUID) {
    window.ProcessDiscoveryService.deleteActivity(state, activityUUID);
    state.selectedActivityUUID = state.draftProcessModel.activities[0] ? state.draftProcessModel.activities[0].activityUUID : "";
    this.saveState(state);
  },

  validateModel(state) {
    const model = state.draftProcessModel;
    const warnings = [];

    if (!model || !model.activities.length) {
      return [{ code: "EMPTY_PROCESS", message: "El proceso no tiene actividades.", impact: "HIGH" }];
    }

    model.activities.forEach((activity) => {
      if (!activity.responsible) {
        warnings.push(this.warning("NO_RESPONSIBLE", "Actividad sin responsable.", activity.activityUUID, "HIGH"));
      }

      if (!activity.evidence || !activity.evidence.length) {
        warnings.push(this.warning("NO_EVIDENCE", "Actividad sin evidencia.", activity.activityUUID, "HIGH"));
      }

      if (activity.confidence === "LOW_CONFIDENCE" || activity.confidence === "INSUFFICIENT_INFORMATION") {
        warnings.push(this.warning("LOW_CONFIDENCE", "Actividad con baja confianza.", activity.activityUUID, "MEDIUM"));
      }

      const hasIncoming = model.relationships.some((relationship) => relationship.toActivityUUID === activity.activityUUID);
      const hasOutgoing = model.relationships.some((relationship) => relationship.fromActivityUUID === activity.activityUUID);

      if (model.activities.length > 1 && !hasIncoming && !hasOutgoing) {
        warnings.push(this.warning("ISOLATED_ACTIVITY", "Actividad aislada sin conexion.", activity.activityUUID, "HIGH"));
      }
    });

    if (model.relationships.some((relationship) => relationship.fromActivityUUID === relationship.toActivityUUID)) {
      warnings.push(this.warning("INVALID_CYCLE", "Existe un ciclo incorrecto hacia la misma actividad.", "", "HIGH"));
    }

    if (model.activities.length < 2) {
      warnings.push(this.warning("INCOMPLETE_PROCESS", "Proceso posiblemente incompleto: menos de dos actividades.", "", "MEDIUM"));
    }

    return warnings;
  },

  answerConsultant(state, message) {
    const selected = window.ProcessDiscoveryService.findActivity(state, state.selectedActivityUUID);
    const answer = this.buildEvidenceAnswer(selected, message);
    window.ProcessDiscoveryService.addChat(state, "user", message);
    window.ProcessDiscoveryService.addChat(state, "consultant", answer);
    window.ProcessDiscoveryService.saveState(state);
  },

  buildEvidenceAnswer(activity, message) {
    if (!activity) {
      return "Selecciona una actividad para mostrar evidencia especifica.";
    }

    const normalized = message.toLowerCase();

    if (normalized.indexOf("por que") !== -1 || normalized.indexOf("agregaste") !== -1) {
      return `Agregue "${activity.name}" porque aparece en la evidencia asociada: ${this.evidenceSummary(activity)}. Confianza: ${activity.confidence}.`;
    }

    if (normalized.indexOf("documento") !== -1 || normalized.indexOf("decision") !== -1) {
      return `Documentos/evidencia de "${activity.name}": ${this.evidenceSummary(activity)}. Decisiones registradas: ${(activity.decisions || []).join(", ") || "ninguna decision registrada aun"}.`;
    }

    if (normalized.indexOf("entrevista") !== -1 || normalized.indexOf("menciona") !== -1) {
      const interviewEvidence = (activity.evidence || []).filter((item) => item.sourceType === "INTERVIEW");
      return interviewEvidence.length ? `Entrevistas asociadas: ${interviewEvidence.map((item) => item.fragment).join(" | ")}` : "No encontre entrevista asociada directamente a esta actividad. Si tienes una, agregala como observacion o evidencia.";
    }

    return `Para "${activity.name}", la evidencia disponible es: ${this.evidenceSummary(activity)}. Si esta informacion no es suficiente, agrega una observacion o documento de respaldo.`;
  },

  evidenceSummary(activity) {
    const evidence = activity.evidence || [];

    if (!evidence.length) {
      return "sin evidencia registrada";
    }

    return evidence.slice(0, 3).map((item) => `${item.sourceType}: ${item.fragment || item.sourceName}`).join(" | ");
  },

  parseList(value) {
    return String(value || "")
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  },

  uniqueList(items) {
    return Array.from(new Set(items.filter(Boolean)));
  },

  addTrace(activity, sourceName, fragment) {
    activity.evidence = activity.evidence || [];
    activity.evidence.push({
      evidenceId: `${sourceName}-${Date.now()}`,
      sourceType: "USER_INPUT",
      sourceName,
      fragment,
      confidence: "HIGH_CONFIDENCE"
    });
  },

  warning(code, message, activityUUID, impact) {
    return {
      warningId: `WRN-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      code,
      message,
      activityUUID,
      impact
    };
  }
});
