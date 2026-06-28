window.RequirementsDiscoveryService = Object.seal({
  storageKey: "operational-intelligence.requirements-discovery",

  categories: [
    { id: "FUNCTIONAL", label: "Requerimientos funcionales", keywords: ["debe", "requiere", "necesita", "permite", "registra", "valida", "aprueba", "genera", "consulta"] },
    { id: "BUSINESS_RULE", label: "Reglas de negocio", keywords: ["regla", "politica", "obligatorio", "debe", "solo si", "condicion"] },
    { id: "VALIDATION", label: "Validaciones", keywords: ["valid", "verifica", "controla", "revisa", "confirma"] },
    { id: "APPROVAL", label: "Aprobaciones", keywords: ["aprueba", "autoriza", "aprobacion", "visto bueno"] },
    { id: "EXCEPTION", label: "Excepciones", keywords: ["excepcion", "rechazo", "error", "caso especial", "fuera de"] },
    { id: "INTEGRATION", label: "Integraciones", keywords: ["integra", "interface", "interfaz", "api", "envia", "recibe", "sincroniza"] },
    { id: "REPORT", label: "Reportes", keywords: ["reporte", "informe", "listado", "consulta", "exporta"] },
    { id: "KPI", label: "Indicadores", keywords: ["indicador", "kpi", "sla", "tiempo", "nivel de servicio"] },
    { id: "DASHBOARD", label: "Dashboards", keywords: ["dashboard", "tablero", "panel", "grafico"] },
    { id: "MASTER_DATA", label: "Maestros", keywords: ["maestro", "catalogo", "cliente", "producto", "proveedor", "material"] },
    { id: "PARAMETER", label: "Parametros", keywords: ["parametro", "configuracion", "umbral", "tolerancia"] },
    { id: "ALERT", label: "Alertas", keywords: ["alerta", "notifica", "aviso", "vencimiento"] },
    { id: "SECURITY", label: "Seguridad", keywords: ["rol", "perfil", "permiso", "seguridad", "acceso"] },
    { id: "AUDIT", label: "Auditoria", keywords: ["auditoria", "trazabilidad", "historial", "log", "bitacora"] },
    { id: "NON_FUNCTIONAL", label: "Requerimientos no funcionales", keywords: ["rendimiento", "disponibilidad", "seguridad", "usabilidad", "volumen", "concurrencia"] },
    { id: "RISK", label: "Riesgos", keywords: ["riesgo", "dependencia", "impacto", "probabilidad"] },
    { id: "RESTRICTION", label: "Restricciones", keywords: ["restriccion", "limitacion", "bloqueo", "no puede"] },
    { id: "ASSUMPTION", label: "Supuestos", keywords: ["supuesto", "asume", "pendiente", "por confirmar"] }
  ],

  createEmptyState() {
    return {
      requirementsPackage: null,
      selectedRequirementId: "",
      questions: [],
      chat: this.createInitialChat(),
      status: "NOT_STARTED"
    };
  },

  createInitialChat() {
    return [{
      messageId: `RMSG-${Date.now()}`,
      author: "consultant",
      text: "Estoy listo para identificar requerimientos ERP usando paquetes de conocimiento, grafo de contexto y proceso validado. No inventare requerimientos: si falta evidencia, formulare preguntas.",
      createdAt: new Date().toISOString()
    }];
  },

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      const state = rawState ? JSON.parse(rawState) : this.createEmptyState();
      return {
        ...this.createEmptyState(),
        ...state,
        questions: state.questions || [],
        chat: state.chat && state.chat.length ? state.chat : this.createInitialChat()
      };
    } catch (error) {
      return this.createEmptyState();
    }
  },

  saveState(state) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(state));
  },

  loadSources() {
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
    const processState = window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : null;
    const validationState = window.ProcessValidationStudioService ? window.ProcessValidationStudioService.loadState() : null;

    return {
      businessPackage: businessState && businessState.package ? businessState.package : businessState && window.BusinessDiscoveryService.buildBusinessKnowledgePackage(businessState),
      knowledgePackage: contextState && contextState.result ? contextState.result.knowledgePackage : null,
      contextGraph: contextState && contextState.result ? contextState.result.contextGraph : null,
      processModel: processState && processState.draftProcessModel ? processState.draftProcessModel : null,
      validation: validationState && validationState.validation ? validationState.validation : null,
      businessState,
      contextState,
      processState
    };
  },

  buildRequirementsPackage() {
    const sources = this.loadSources();
    const evidenceCorpus = this.buildEvidenceCorpus(sources);
    const processRequirements = this.extractFromProcessModel(sources.processModel);
    const textRequirements = this.extractFromEvidenceCorpus(evidenceCorpus);
    const requirements = this.mergeRequirements(processRequirements.concat(textRequirements));
    const questions = this.buildQuestions(sources, requirements);
    const risks = this.extractRisks(sources, evidenceCorpus);
    const restrictions = this.extractRestrictions(sources, evidenceCorpus);
    const assumptions = this.extractAssumptions(sources, questions);
    const confidence = this.resolvePackageConfidence(sources, requirements, questions);

    return {
      requirementsPackage: {
        requirementsPackageId: `RPK-${Date.now()}`,
        solution: "ERP_DISCOVERY",
        status: questions.some((question) => question.blocksApproval) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
        version: 1,
        businessKnowledgePackageId: sources.businessPackage && sources.businessPackage.businessKnowledgePackageId,
        knowledgePackageId: sources.knowledgePackage && sources.knowledgePackage.knowledgePackageId,
        contextGraphId: sources.contextGraph && sources.contextGraph.contextGraphId,
        processModelId: sources.processModel && sources.processModel.processModelId,
        createdAt: new Date().toISOString(),
        createdBy: "LOCAL_USER",
        confidence,
        summary: this.buildSummary(requirements, questions, confidence),
        requirements,
        risks,
        restrictions,
        assumptions,
        questions,
        evidenceIndex: evidenceCorpus
      },
      questions
    };
  },

  buildEvidenceCorpus(sources) {
    const evidence = [];
    const addEvidence = (item) => {
      if (item && item.fragment) {
        evidence.push({
          evidenceId: item.evidenceId || `EV-${evidence.length + 1}`,
          sourceType: item.sourceType || "UNKNOWN",
          sourceName: item.sourceName || item.source || "Fuente sin nombre",
          fragment: String(item.fragment || "").trim(),
          confidence: item.confidence || "LOW_CONFIDENCE",
          date: item.date || item.createdAt || ""
        });
      }
    };

    ((sources.businessPackage && sources.businessPackage.evidence) || []).forEach((item, index) => addEvidence({
      evidenceId: `BKP-EV-${index + 1}`,
      sourceType: item.sourceType || "BUSINESS_KNOWLEDGE_PACKAGE",
      sourceName: item.source || "Business Knowledge Package",
      fragment: item.fragment,
      confidence: item.confidence,
      date: item.date
    }));

    ((sources.businessPackage && sources.businessPackage.documents) || []).forEach((documentItem, index) => addEvidence({
      evidenceId: `BKP-DOC-${index + 1}`,
      sourceType: "DOCUMENT",
      sourceName: documentItem.title || documentItem.documentId,
      fragment: documentItem.normalizedText || "",
      confidence: documentItem.normalizedText ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE",
      date: documentItem.createdAt || documentItem.lastModified || ""
    }));

    ((sources.knowledgePackage && sources.knowledgePackage.documents) || []).forEach((documentItem, index) => addEvidence({
      evidenceId: `KPK-DOC-${index + 1}`,
      sourceType: "DOCUMENT",
      sourceName: documentItem.title || documentItem.documentId,
      fragment: documentItem.normalizedText || "",
      confidence: documentItem.normalizationStatus === "NORMALIZED" ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE",
      date: documentItem.lastModified || ""
    }));

    ((sources.contextState && sources.contextState.interviews) || []).forEach((interview, index) => addEvidence({
      evidenceId: `INT-${index + 1}`,
      sourceType: "INTERVIEW",
      sourceName: interview.person || "Entrevista",
      fragment: interview.content || "",
      confidence: "HIGH_CONFIDENCE",
      date: interview.createdAt || ""
    }));

    ((sources.contextState && sources.contextState.notes) || []).forEach((note, index) => addEvidence({
      evidenceId: `NOTE-${index + 1}`,
      sourceType: "NOTE",
      sourceName: "Nota del proyecto",
      fragment: note.content || "",
      confidence: "LOW_CONFIDENCE",
      date: note.createdAt || ""
    }));

    ((sources.processModel && sources.processModel.activities) || []).forEach((activity, index) => {
      addEvidence({
        evidenceId: `ACT-${index + 1}`,
        sourceType: "PROCESS_MODEL",
        sourceName: activity.name,
        fragment: [activity.description, (activity.businessRules || []).join(". "), (activity.decisions || []).join(". ")].filter(Boolean).join(". "),
        confidence: activity.confidence || "LOW_CONFIDENCE",
        date: sources.processModel.createdAt || ""
      });

      (activity.evidence || []).forEach((activityEvidence, evidenceIndex) => addEvidence({
        evidenceId: `ACT-${index + 1}-EV-${evidenceIndex + 1}`,
        sourceType: activityEvidence.sourceType,
        sourceName: activityEvidence.sourceName || activity.name,
        fragment: activityEvidence.fragment || "",
        confidence: activityEvidence.confidence || activity.confidence || "LOW_CONFIDENCE",
        date: activityEvidence.date || ""
      }));
    });

    return evidence.filter((item) => item.fragment.length > 3).slice(0, 120);
  },

  extractFromProcessModel(processModel) {
    if (!processModel || !processModel.activities) {
      return [];
    }

    const requirements = [];

    processModel.activities.forEach((activity, index) => {
      requirements.push(this.createRequirement({
        category: "FUNCTIONAL",
        title: `El ERP debe soportar: ${activity.name}`,
        description: activity.description || `Actividad del proceso As-Is: ${activity.name}`,
        sourceActivityUUID: activity.activityUUID,
        processArea: activity.area || "",
        responsible: activity.responsible || "",
        systems: activity.systems || [],
        evidence: this.activityEvidence(activity, index),
        confidence: this.normalizeConfidence(activity.confidence),
        priority: this.priorityFromConfidence(activity.confidence)
      }));

      (activity.businessRules || []).forEach((rule, ruleIndex) => {
        requirements.push(this.createRequirement({
          category: "BUSINESS_RULE",
          title: this.toTitle(rule, "Regla de negocio requerida"),
          description: rule,
          sourceActivityUUID: activity.activityUUID,
          processArea: activity.area || "",
          responsible: activity.responsible || "",
          systems: activity.systems || [],
          evidence: this.activityEvidence(activity, index, `RULE-${ruleIndex + 1}`),
          confidence: this.normalizeConfidence(activity.confidence),
          priority: "HIGH"
        }));
      });

      (activity.decisions || []).forEach((decision, decisionIndex) => {
        requirements.push(this.createRequirement({
          category: "VALIDATION",
          title: this.toTitle(decision, "Validacion o decision requerida"),
          description: decision,
          sourceActivityUUID: activity.activityUUID,
          processArea: activity.area || "",
          responsible: activity.responsible || "",
          systems: activity.systems || [],
          evidence: this.activityEvidence(activity, index, `DECISION-${decisionIndex + 1}`),
          confidence: this.normalizeConfidence(activity.confidence),
          priority: "HIGH"
        }));
      });
    });

    return requirements;
  },

  activityEvidence(activity, index, suffix) {
    const evidence = activity.evidence && activity.evidence.length ? activity.evidence : [{
      evidenceId: `ACTIVITY-${index + 1}${suffix ? `-${suffix}` : ""}`,
      sourceType: "PROCESS_MODEL",
      sourceName: activity.name,
      fragment: activity.description || activity.name,
      confidence: activity.confidence || "LOW_CONFIDENCE"
    }];

    return evidence.slice(0, 4).map((item) => ({
      evidenceId: item.evidenceId || `ACTIVITY-${index + 1}`,
      sourceType: item.sourceType || "PROCESS_MODEL",
      sourceName: item.sourceName || activity.name,
      fragment: item.fragment || activity.description || activity.name,
      confidence: item.confidence || activity.confidence || "LOW_CONFIDENCE"
    }));
  },

  extractFromEvidenceCorpus(evidenceCorpus) {
    const requirements = [];

    evidenceCorpus.forEach((evidence) => {
      this.extractSentences(evidence.fragment).forEach((sentence) => {
        const category = this.classifySentence(sentence);

        if (!category) {
          return;
        }

        requirements.push(this.createRequirement({
          category: category.id,
          title: this.toTitle(sentence, category.label),
          description: sentence,
          sourceActivityUUID: "",
          processArea: "",
          responsible: "",
          systems: this.extractSystems(sentence),
          evidence: [evidence],
          confidence: this.normalizeConfidence(evidence.confidence),
          priority: category.id === "RISK" || category.id === "SECURITY" || category.id === "AUDIT" ? "HIGH" : "MEDIUM"
        }));
      });
    });

    return requirements;
  },

  classifySentence(sentence) {
    const normalized = sentence.toLowerCase();
    return this.categories.find((category) => category.keywords.some((keyword) => normalized.indexOf(keyword) !== -1));
  },

  createRequirement(data) {
    const evidence = data.evidence || [];
    return {
      requirementId: `REQ-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      category: data.category,
      title: data.title,
      description: data.description,
      processArea: data.processArea || "",
      sourceActivityUUID: data.sourceActivityUUID || "",
      responsible: data.responsible || "",
      systems: data.systems || [],
      priority: data.priority || "MEDIUM",
      status: "DRAFT",
      confidence: data.confidence || "LOW_CONFIDENCE",
      evidence,
      documentsUsed: evidence.filter((item) => item.sourceType === "DOCUMENT").map((item) => item.sourceName),
      interviewsUsed: evidence.filter((item) => item.sourceType === "INTERVIEW").map((item) => item.sourceName),
      rationale: evidence.length ? "Derivado de evidencia disponible del proyecto." : "Pendiente de evidencia suficiente.",
      fitGapReady: data.confidence !== "LOW_CONFIDENCE" && evidence.length > 0,
      rfpReady: data.confidence === "HIGH_CONFIDENCE" || data.confidence === "MEDIUM_CONFIDENCE"
    };
  },

  mergeRequirements(requirements) {
    const merged = [];
    const seen = {};

    requirements.forEach((requirement) => {
      const key = `${requirement.category}|${String(requirement.title || "").toLowerCase().replace(/\s+/g, " ").trim()}`;

      if (!requirement.description || seen[key]) {
        return;
      }

      seen[key] = true;
      merged.push(requirement);
    });

    return merged.slice(0, 80);
  },

  buildQuestions(sources, requirements) {
    const questions = [];

    if (!sources.businessPackage) {
      questions.push(this.question("MISSING_BUSINESS_PACKAGE", "Falta el Business Knowledge Package validado para sustentar requerimientos ERP.", "HIGH", true));
    }

    if (!sources.knowledgePackage) {
      questions.push(this.question("MISSING_KNOWLEDGE_PACKAGE", "Falta el Knowledge Package del proyecto.", "HIGH", true));
    }

    if (!sources.processModel) {
      questions.push(this.question("MISSING_PROCESS_MODEL", "Falta un Process Model validado para derivar requerimientos por actividad.", "HIGH", true));
    } else if (!sources.processModel.validation || sources.processModel.validation.canRunAdvancedAnalysis !== true) {
      questions.push(this.question("PROCESS_NOT_VALIDATED", "El Process Model no tiene validacion suficiente. Confirma si puede usarse para ERP Discovery.", "HIGH", true));
    }

    if (!requirements.length) {
      questions.push(this.question("NO_REQUIREMENTS_FOUND", "No se detectaron requerimientos con la evidencia disponible. Agrega documentos, entrevistas o reglas de negocio.", "HIGH", true));
    }

    this.categories.forEach((category) => {
      const hasCategory = requirements.some((requirement) => requirement.category === category.id);
      if (!hasCategory && ["SECURITY", "AUDIT", "INTEGRATION", "REPORT", "NON_FUNCTIONAL"].indexOf(category.id) !== -1) {
        questions.push(this.question(`CATEGORY_${category.id}`, `No encontre evidencia suficiente para ${category.label}. Debe confirmarse si aplica al ERP.`, "MEDIUM", false));
      }
    });

    return questions.slice(0, 12);
  },

  extractRisks(sources, evidenceCorpus) {
    const risks = ((sources.businessPackage && sources.businessPackage.identifiedRisks) || []).map((risk, index) => ({
      riskId: `RRISK-${index + 1}`,
      description: risk,
      confidence: "MEDIUM_CONFIDENCE",
      evidence: []
    }));

    this.extractByCategory(evidenceCorpus, "RISK").forEach((item, index) => risks.push({
      riskId: `RRISK-EV-${index + 1}`,
      description: item.sentence,
      confidence: this.normalizeConfidence(item.evidence.confidence),
      evidence: [item.evidence]
    }));

    return risks.slice(0, 20);
  },

  extractRestrictions(sources, evidenceCorpus) {
    const restrictions = ((sources.knowledgePackage && sources.knowledgePackage.restrictions) || []).map((restriction, index) => ({
      restrictionId: `RREST-${index + 1}`,
      description: typeof restriction === "string" ? restriction : restriction.description || restriction.name,
      confidence: typeof restriction === "string" ? "LOW_CONFIDENCE" : restriction.confidence || "LOW_CONFIDENCE",
      evidence: []
    }));

    this.extractByCategory(evidenceCorpus, "RESTRICTION").forEach((item, index) => restrictions.push({
      restrictionId: `RREST-EV-${index + 1}`,
      description: item.sentence,
      confidence: this.normalizeConfidence(item.evidence.confidence),
      evidence: [item.evidence]
    }));

    return restrictions.slice(0, 20);
  },

  extractAssumptions(sources, questions) {
    const assumptions = [];

    if (sources.processModel && (!sources.processModel.validation || sources.processModel.validation.canRunAdvancedAnalysis !== true)) {
      assumptions.push({
        assumptionId: "ASM-PROCESS-VALIDATION",
        description: "El Process Model se usa como borrador hasta que la validacion indique aptitud suficiente.",
        validationNeeded: "Ejecutar Process Validation Studio y resolver bloqueos criticos.",
        confidence: "LOW_CONFIDENCE"
      });
    }

    questions.filter((questionItem) => questionItem.blocksApproval).forEach((questionItem, index) => assumptions.push({
      assumptionId: `ASM-Q-${index + 1}`,
      description: questionItem.question,
      validationNeeded: "Respuesta del usuario o evidencia adicional.",
      confidence: "INSUFFICIENT_INFORMATION"
    }));

    return assumptions;
  },

  extractByCategory(evidenceCorpus, categoryId) {
    return evidenceCorpus.flatMap((evidence) => this.extractSentences(evidence.fragment).map((sentence) => ({
      sentence,
      evidence,
      category: this.classifySentence(sentence)
    }))).filter((item) => item.category && item.category.id === categoryId);
  },

  resolvePackageConfidence(sources, requirements, questions) {
    const blockers = questions.filter((question) => question.blocksApproval).length;
    const mediumOrHigh = requirements.filter((requirement) => requirement.confidence === "HIGH_CONFIDENCE" || requirement.confidence === "MEDIUM_CONFIDENCE").length;

    if (blockers || !requirements.length) {
      return "INSUFFICIENT_INFORMATION";
    }

    if (mediumOrHigh / requirements.length > 0.7 && sources.processModel && sources.processModel.validation && sources.processModel.validation.canRunAdvancedAnalysis) {
      return "HIGH_CONFIDENCE";
    }

    return "MEDIUM_CONFIDENCE";
  },

  buildSummary(requirements, questions, confidence) {
    const functional = requirements.filter((item) => item.category === "FUNCTIONAL").length;
    const nonFunctional = requirements.filter((item) => item.category === "NON_FUNCTIONAL").length;
    return `Requirements Package generado con ${requirements.length} requerimientos, ${functional} funcionales y ${nonFunctional} no funcionales. Confianza: ${confidence}. Preguntas abiertas: ${questions.length}.`;
  },

  answerQuestion(state, answer) {
    this.addChat(state, "user", answer);

    const openQuestion = state.questions.find((question) => question.status === "OPEN");
    if (openQuestion) {
      openQuestion.status = "ANSWERED";
      openQuestion.answer = answer;
      openQuestion.answeredAt = new Date().toISOString();

      if (state.requirementsPackage) {
        state.requirementsPackage.evidenceIndex.push({
          evidenceId: `USER-ANSWER-${Date.now()}`,
          sourceType: "USER_INPUT",
          sourceName: openQuestion.question,
          fragment: answer,
          confidence: "HIGH_CONFIDENCE",
          date: new Date().toISOString()
        });
      }
    }

    this.addChat(state, "consultant", "Registre tu respuesta como evidencia humana. Ejecuta nuevamente el descubrimiento para recalcular el Requirements Package.");
    this.saveState(state);
  },

  approveRequirement(state, requirementId) {
    const requirement = this.findRequirement(state, requirementId);

    if (!requirement) {
      return;
    }

    requirement.status = "HUMAN_APPROVED";
    requirement.confidence = requirement.confidence === "LOW_CONFIDENCE" ? "MEDIUM_CONFIDENCE" : requirement.confidence;
    this.addChat(state, "consultant", `Requerimiento aprobado: ${requirement.title}. Queda disponible para Fit-Gap y RFP.`);
    this.saveState(state);
  },

  explainRequirement(requirement) {
    if (!requirement) {
      return "Selecciona un requerimiento para explicar su evidencia.";
    }

    const evidence = requirement.evidence || [];
    if (!evidence.length) {
      return `No hay evidencia suficiente para consolidar "${requirement.title}". Debe formularse una pregunta o agregarse documentacion.`;
    }

    return `El requerimiento "${requirement.title}" se propone porque la evidencia indica: ${evidence.slice(0, 3).map((item) => `${item.sourceType} ${item.sourceName}: ${item.fragment}`).join(" | ")}. Confianza: ${requirement.confidence}.`;
  },

  findRequirement(state, requirementId) {
    return state.requirementsPackage && state.requirementsPackage.requirements.find((requirement) => requirement.requirementId === requirementId);
  },

  question(code, question, priority, blocksApproval) {
    return {
      questionId: `RQ-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      code,
      question,
      priority,
      blocksApproval,
      status: "OPEN"
    };
  },

  addChat(state, author, text) {
    state.chat.push({
      messageId: `RMSG-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  extractSentences(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+|\n+|;/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 12)
      .slice(0, 60);
  },

  extractSystems(sentence) {
    const matches = String(sentence || "").match(/\b(ERP|SAP|Oracle|Dynamics|Excel|CRM|WMS|TMS|API|Power BI|Salesforce)\b/gi);
    return matches ? Array.from(new Set(matches)) : [];
  },

  toTitle(text, fallback) {
    const clean = String(text || fallback || "").replace(/^[\-\d.)\s]+/, "").trim();
    return clean.length > 86 ? `${clean.slice(0, 83)}...` : clean;
  },

  normalizeConfidence(confidence) {
    if (confidence === "HIGH_CONFIDENCE" || confidence === "MEDIUM_CONFIDENCE" || confidence === "LOW_CONFIDENCE") {
      return confidence;
    }

    return "LOW_CONFIDENCE";
  },

  priorityFromConfidence(confidence) {
    if (confidence === "HIGH_CONFIDENCE") {
      return "HIGH";
    }

    if (confidence === "MEDIUM_CONFIDENCE") {
      return "MEDIUM";
    }

    return "LOW";
  }
});
