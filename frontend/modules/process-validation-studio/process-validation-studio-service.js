window.ProcessValidationStudioService = Object.seal({
  storageKey: "operational-intelligence.process-validation",

  createState() {
    return {
      validation: null,
      chat: this.createInitialChat(),
      lastValidatedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `VMSG-${Date.now()}`,
      author: "consultant",
      text: "Validare el modelo As-Is antes de permitir analisis posteriores. Si existen problemas criticos, bloqueare VSM, Lean, TOC, Automatizacion, IA, To-Be y Business Case.",
      createdAt: new Date().toISOString()
    }];
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      const state = rawState ? JSON.parse(rawState) : this.createState();
      return {
        ...this.createState(),
        ...state,
        chat: state.chat && state.chat.length ? state.chat : this.createInitialChat()
      };
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(state));
  },

  loadProcessState() {
    const state = window.ProcessModelingStudioService.createState();
    window.ProcessModelingStudioService.ensureLayout(state);
    return state;
  },

  validateCurrentProcess() {
    const processState = this.loadProcessState();
    const model = processState.draftProcessModel;
    const checks = this.runChecks(model);
    const healthScore = this.calculateHealthScore(checks);
    const classification = this.classifyHealthScore(healthScore, checks);
    const blockedCapabilities = this.resolveBlockedCapabilities(classification, checks);
    const explanation = this.buildExplanation(healthScore, classification, checks, blockedCapabilities);
    const recommendations = this.buildRecommendations(checks);

    return {
      validationId: `VAL-${Date.now()}`,
      processModelId: model && model.processModelId,
      processName: model && model.name,
      healthScore,
      classification,
      checks,
      blockedCapabilities,
      canRunAdvancedAnalysis: blockedCapabilities.length === 0,
      explanation,
      recommendations,
      validatedAt: new Date().toISOString()
    };
  },

  runChecks(model) {
    if (!model || !model.activities || !model.activities.length) {
      return [this.check("PROCESS_EXISTS", "Modelo de proceso disponible", false, "CRITICAL", "No existe un modelo As-Is para validar.", "")];
    }

    const checks = [];
    const activities = model.activities;
    const relationships = model.relationships || [];
    const first = activities[0];
    const last = activities[activities.length - 1];
    const duplicates = this.findDuplicateActivities(activities);
    const cycles = relationships.filter((relationship) => relationship.fromActivityUUID === relationship.toActivityUUID);
    const connectedIds = new Set();

    relationships.forEach((relationship) => {
      connectedIds.add(relationship.fromActivityUUID);
      connectedIds.add(relationship.toActivityUUID);
    });

    checks.push(this.check("START_ACTIVITY", "Actividad inicial", Boolean(first && first.name), "CRITICAL", "El proceso debe tener una actividad inicial identificable.", first && first.activityUUID));
    checks.push(this.check("END_ACTIVITY", "Actividad final", Boolean(last && last.name && activities.length > 1), "CRITICAL", "El proceso debe tener actividad final y mas de una actividad.", last && last.activityUUID));
    checks.push(this.check("NO_DUPLICATES", "Actividades duplicadas", duplicates.length === 0, "MAJOR", duplicates.length ? `Posibles duplicados: ${duplicates.join(", ")}` : "No se detectaron duplicados.", ""));
    checks.push(this.check("NO_CYCLES", "Ciclos incorrectos", cycles.length === 0, "CRITICAL", cycles.length ? "Existen ciclos hacia la misma actividad." : "No se detectaron ciclos incorrectos.", ""));
    checks.push(this.check("PROCESS_CONNECTED", "Actividades conectadas", activities.length <= 1 || activities.every((activity) => connectedIds.has(activity.activityUUID)), "CRITICAL", "Todas las actividades deben estar conectadas al flujo.", ""));
    checks.push(this.check("NO_MISSING_INFO", "Informacion faltante", this.missingInformationCount(model) === 0, "MAJOR", "El proceso no debe tener informacion faltante critica.", ""));
    checks.push(this.check("NO_CONTRADICTIONS", "Contradicciones", this.contradictionCount(model) === 0, "CRITICAL", "No deben existir contradicciones abiertas.", ""));

    activities.forEach((activity) => {
      checks.push(this.activityCheck("RESPONSIBLE", "Responsable", Boolean(activity.responsible), "CRITICAL", "Actividad sin responsable.", activity));
      checks.push(this.activityCheck("AREA", "Area", Boolean(activity.area), "MAJOR", "Actividad sin area.", activity));
      checks.push(this.activityCheck("INPUTS", "Entradas", Boolean(activity.inputs && activity.inputs.length), "MAJOR", "Actividad sin entradas.", activity));
      checks.push(this.activityCheck("OUTPUTS", "Salidas", Boolean(activity.outputs && activity.outputs.length), "MAJOR", "Actividad sin salidas.", activity));
      checks.push(this.activityCheck("SYSTEMS", "Sistemas", Boolean(activity.systems && activity.systems.length), "MINOR", "Actividad sin sistemas.", activity));
      checks.push(this.activityCheck("DOCUMENTS", "Documentos", Boolean(activity.documents && activity.documents.length), "MINOR", "Actividad sin documentos.", activity));
      checks.push(this.activityCheck("RULES", "Reglas de negocio", Boolean(activity.businessRules && activity.businessRules.length), "MINOR", "Actividad sin reglas de negocio.", activity));
      checks.push(this.activityCheck("DECISIONS", "Decisiones", Boolean(activity.decisions && activity.decisions.length), "MINOR", "Actividad sin decisiones registradas.", activity));
      checks.push(this.activityCheck("EVIDENCE", "Evidencia", Boolean(activity.evidence && activity.evidence.length), "CRITICAL", "Actividad sin evidencia.", activity));
      checks.push(this.activityCheck("CONFIDENCE", "Nivel de confianza", activity.confidence !== "LOW_CONFIDENCE" && activity.confidence !== "INSUFFICIENT_INFORMATION", "MAJOR", "Actividad con baja confianza.", activity));
    });

    return checks;
  },

  check(code, label, passed, severity, message, activityUUID) {
    return {
      checkId: `CHK-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      code,
      label,
      passed,
      severity,
      message,
      activityUUID: activityUUID || "",
      scope: "PROCESS"
    };
  },

  activityCheck(code, label, passed, severity, message, activity) {
    return {
      checkId: `CHK-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      code,
      label,
      passed,
      severity,
      message,
      activityUUID: activity.activityUUID,
      activityName: activity.name,
      scope: "ACTIVITY"
    };
  },

  calculateHealthScore(checks) {
    const weights = {
      CRITICAL: 8,
      MAJOR: 5,
      MINOR: 2
    };
    const total = checks.reduce((sum, check) => sum + weights[check.severity], 0);
    const lost = checks.filter((check) => !check.passed).reduce((sum, check) => sum + weights[check.severity], 0);

    if (!total) {
      return 0;
    }

    return Math.max(0, Math.round(((total - lost) / total) * 100));
  },

  classifyHealthScore(score, checks) {
    const criticalFailures = checks.filter((check) => !check.passed && check.severity === "CRITICAL").length;

    if (criticalFailures >= 3 || score < 50) {
      return "No apto para analisis";
    }

    if (criticalFailures || score < 70) {
      return "Requiere revision";
    }

    if (score < 82) {
      return "Aceptable";
    }

    if (score < 94) {
      return "Bueno";
    }

    return "Excelente";
  },

  resolveBlockedCapabilities(classification, checks) {
    const hasCriticalFailure = checks.some((check) => !check.passed && check.severity === "CRITICAL");

    if (classification === "Excelente" || classification === "Bueno" || (classification === "Aceptable" && !hasCriticalFailure)) {
      return [];
    }

    return ["VSM", "Lean", "TOC", "Automatizacion", "IA", "To-Be", "Business Case"];
  },

  buildExplanation(score, classification, checks, blockedCapabilities) {
    const failed = checks.filter((check) => !check.passed);
    const critical = failed.filter((check) => check.severity === "CRITICAL").length;
    const major = failed.filter((check) => check.severity === "MAJOR").length;
    const minor = failed.filter((check) => check.severity === "MINOR").length;
    const blockedText = blockedCapabilities.length ? `Se bloquean analisis posteriores: ${blockedCapabilities.join(", ")}.` : "El proceso puede continuar a analisis posteriores.";

    return `El proceso obtuvo ${score}/100 y clasificacion "${classification}". Encontre ${critical} problemas criticos, ${major} mayores y ${minor} menores. ${blockedText}`;
  },

  buildRecommendations(checks) {
    const failed = checks.filter((check) => !check.passed);
    const grouped = {};

    failed.forEach((check) => {
      grouped[check.code] = grouped[check.code] || check;
    });

    return Object.values(grouped).slice(0, 8).map((check) => ({
      recommendationId: `REC-${check.code}`,
      priority: check.severity,
      action: this.recommendationFor(check),
      reason: check.message,
      activityUUID: check.activityUUID || ""
    }));
  },

  recommendationFor(check) {
    const actions = {
      RESPONSIBLE: "Asignar responsable a todas las actividades criticas.",
      AREA: "Completar area dueña o participante por actividad.",
      INPUTS: "Registrar entradas necesarias para ejecutar cada actividad.",
      OUTPUTS: "Registrar salidas producidas por cada actividad.",
      SYSTEMS: "Confirmar sistemas utilizados por actividad.",
      DOCUMENTS: "Asociar documentos o artefactos usados en cada actividad.",
      RULES: "Agregar reglas de negocio relevantes o marcar que no aplican.",
      DECISIONS: "Registrar decisiones del flujo cuando existan.",
      EVIDENCE: "Agregar evidencia documental, entrevista o validacion humana.",
      CONFIDENCE: "Revisar actividades de baja confianza con el cliente.",
      PROCESS_CONNECTED: "Conectar todas las actividades a la secuencia principal.",
      NO_DUPLICATES: "Fusionar, eliminar o diferenciar actividades duplicadas.",
      NO_CYCLES: "Eliminar ciclos incorrectos antes de analizar.",
      END_ACTIVITY: "Definir claramente la actividad final del proceso.",
      START_ACTIVITY: "Definir claramente la actividad inicial del proceso."
    };

    return actions[check.code] || "Corregir el problema detectado antes de continuar.";
  },

  findDuplicateActivities(activities) {
    const names = {};
    const duplicates = [];

    activities.forEach((activity) => {
      const key = String(activity.name || "").trim().toLowerCase();

      if (!key) {
        return;
      }

      if (names[key] && duplicates.indexOf(activity.name) === -1) {
        duplicates.push(activity.name);
      }

      names[key] = true;
    });

    return duplicates;
  },

  missingInformationCount(model) {
    return (model.diagnostics || []).filter((item) => item.code === "MISSING_INFORMATION").length;
  },

  contradictionCount(model) {
    return (model.diagnostics || []).filter((item) => item.code === "CONTRADICTION").length;
  },

  addConsultantAnswer(state, validation, question) {
    const failed = validation.checks.filter((check) => !check.passed);
    const answer = this.answerQuestion(validation, failed, question);

    state.chat.push({
      messageId: `VMSG-${Date.now()}-USER`,
      author: "user",
      text: question,
      createdAt: new Date().toISOString()
    });
    state.chat.push({
      messageId: `VMSG-${Date.now()}-CONSULTANT`,
      author: "consultant",
      text: answer,
      createdAt: new Date().toISOString()
    });
    this.saveState(state);
  },

  answerQuestion(validation, failed, question) {
    const normalized = question.toLowerCase();

    if (normalized.indexOf("calificacion") !== -1 || normalized.indexOf("score") !== -1 || normalized.indexOf("por que") !== -1) {
      return validation.explanation;
    }

    if (normalized.indexOf("bloque") !== -1 || normalized.indexOf("continuar") !== -1) {
      return validation.blockedCapabilities.length ? `No recomiendo continuar porque existen problemas criticos. Capacidades bloqueadas: ${validation.blockedCapabilities.join(", ")}.` : "No hay bloqueo activo para analisis posteriores.";
    }

    if (normalized.indexOf("accion") !== -1 || normalized.indexOf("recomienda") !== -1 || normalized.indexOf("corregir") !== -1) {
      return validation.recommendations.map((item) => `${item.priority}: ${item.action}`).join(" | ");
    }

    return failed.length ? `El problema mas importante es: ${failed[0].message}. Recomendacion: ${this.recommendationFor(failed[0])}` : "El proceso no tiene problemas criticos abiertos segun la ultima validacion.";
  },

  persistValidation(state, validation) {
    state.validation = validation;
    state.lastValidatedAt = validation.validatedAt;
    state.chat.push({
      messageId: `VMSG-${Date.now()}-CONSULTANT`,
      author: "consultant",
      text: validation.explanation,
      createdAt: new Date().toISOString()
    });
    this.saveState(state);

    const processState = window.ProcessDiscoveryService.loadState();

    if (processState.draftProcessModel) {
      processState.draftProcessModel.validation = {
        healthScore: validation.healthScore,
        classification: validation.classification,
        canRunAdvancedAnalysis: validation.canRunAdvancedAnalysis,
        blockedCapabilities: validation.blockedCapabilities,
        validatedAt: validation.validatedAt
      };
      window.ProcessDiscoveryService.saveState(processState);
    }
  }
});
