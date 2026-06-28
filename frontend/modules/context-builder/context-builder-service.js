window.ContextBuilderService = Object.seal({
  storageKey: "operational-intelligence.context-builder",

  createEmptyState() {
    return {
      project: {
        projectId: `PRJ-${Date.now()}`,
        name: "",
        company: "",
        client: "",
        area: "",
        process: "",
        objective: "",
        scope: "",
        owner: "",
        date: new Date().toISOString().slice(0, 10)
      },
      documents: [],
      interviews: [],
      notes: [],
      consultantChat: [],
      validation: {
        status: "DRAFT",
        updatedAt: ""
      },
      result: null
    };
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
      project: { ...baseState.project, ...(state.project || {}) },
      documents: state.documents || [],
      interviews: state.interviews || [],
      notes: state.notes || [],
      consultantChat: state.consultantChat || this.createInitialChat(),
      validation: { ...baseState.validation, ...(state.validation || {}) }
    };
  },

  createInitialChat() {
    return [{
      messageId: `MSG-${Date.now()}`,
      author: "consultant",
      text: "Estoy listo para revisar el Knowledge Package. Ejecuta el Context Builder o agregame informacion adicional para enriquecer el contexto.",
      createdAt: new Date().toISOString()
    }];
  },

  saveState(state) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(state));
  },

  hasKnowledgePackage(state) {
    return Boolean(state.result && state.result.knowledgePackage);
  },

  async readFiles(fileList) {
    const files = Array.from(fileList || []);
    const documents = [];

    for (const file of files) {
      const normalizedText = await this.readFileAsText(file);
      documents.push({
        documentId: `DOC-${Date.now()}-${documents.length + 1}`,
        documentType: this.resolveDocumentType(file),
        title: file.name,
        normalizedText,
        size: file.size,
        lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : "",
        normalizationStatus: normalizedText ? "NORMALIZED" : "METADATA_ONLY"
      });
    }

    return documents;
  },

  readFileAsText(file) {
    const canReadAsText = [
      "text/",
      "application/json",
      "application/csv",
      "application/xml"
    ].some((type) => file.type.indexOf(type) === 0);

    const readableExtension = /\.(md|markdown|txt|json|csv|tsv|xml|html|css|js)$/i.test(file.name);

    if (!canReadAsText && !readableExtension) {
      return Promise.resolve("");
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsText(file);
    });
  },

  resolveDocumentType(file) {
    const extension = (file.name.split(".").pop() || "").toUpperCase();
    return extension || file.type || "UNKNOWN";
  },

  buildAgentContext(state) {
    return {
      projectId: state.project.projectId,
      processModelId: "",
      project: state.project,
      normalizedDocuments: state.documents.map((documentItem) => ({
        documentId: documentItem.documentId,
        documentType: documentItem.documentType,
        title: documentItem.title,
        normalizedText: documentItem.normalizedText,
        normalizationStatus: documentItem.normalizationStatus
      })),
      interviewNotes: state.interviews,
      freeNotes: state.notes
    };
  },

  async executeAgent(sessionId, state) {
    const context = this.buildAgentContext(state);

    if (window.APP_CONFIG.apiBaseUrl) {
      const response = await window.AiSecurityService.executeAgent(sessionId, "CONTEXT_BUILDER", context);

      if (response.success) {
        return response;
      }
    }

    return {
      success: true,
      message: "Context Builder Agent executed in local MVP mode.",
      data: this.buildLocalResult(context)
    };
  },

  async enrichKnowledgePackage(sessionId, state, message) {
    const classification = this.classifyUserMessage(message);

    if (classification.type === "INTERVIEW") {
      state.interviews.push({
        interviewId: `INT-${Date.now()}`,
        person: classification.person,
        role: classification.role,
        content: message,
        createdAt: new Date().toISOString()
      });
    } else if (classification.type === "DOCUMENT_REQUEST_RESPONSE") {
      state.documents.push({
        documentId: `DOC-${Date.now()}`,
        documentType: "MANUAL_TEXT",
        title: `Aclaracion documental ${state.documents.length + 1}`,
        normalizedText: message,
        size: message.length,
        lastModified: new Date().toISOString(),
        normalizationStatus: "NORMALIZED"
      });
    } else {
      state.notes.push({
        noteId: `NOT-${Date.now()}`,
        content: message,
        createdAt: new Date().toISOString()
      });
    }

    const response = await this.executeAgent(sessionId, state);

    if (response.success) {
      state.result = response.data;
      state.validation = {
        status: this.resolveValidationStatus(state.result.knowledgePackage),
        updatedAt: new Date().toISOString()
      };
    }

    state.consultantChat.push({
      messageId: `MSG-${Date.now()}-USER`,
      author: "user",
      text: message,
      createdAt: new Date().toISOString()
    });
    state.consultantChat.push(this.buildConsultantReply(state, classification));
    this.saveState(state);
    return state;
  },

  classifyUserMessage(message) {
    const normalized = message.toLowerCase();

    if (normalized.indexOf("entrevista") !== -1 || normalized.indexOf("me dijo") !== -1 || normalized.indexOf("usuario") !== -1) {
      return {
        type: "INTERVIEW",
        person: "Informante",
        role: "Pendiente de clasificar"
      };
    }

    if (normalized.indexOf("documento") !== -1 || normalized.indexOf("politica") !== -1 || normalized.indexOf("manual") !== -1 || normalized.indexOf("procedimiento") !== -1) {
      return { type: "DOCUMENT_REQUEST_RESPONSE" };
    }

    return { type: "NOTE" };
  },

  buildConsultantReply(state, classification) {
    const packageData = state.result && state.result.knowledgePackage ? state.result.knowledgePackage : {};
    const missing = packageData.missingInformation || [];
    const contradictions = packageData.contradictions || [];
    const confidence = packageData.confidence || "INSUFFICIENT_INFORMATION";
    const sourceLabel = classification.type === "INTERVIEW" ? "entrevista" : classification.type === "DOCUMENT_REQUEST_RESPONSE" ? "documento normalizado" : "nota";
    const nextFocus = missing[0] || contradictions[0] || "validar que los procesos y actividades detectadas reflejen la realidad operativa";

    return {
      messageId: `MSG-${Date.now()}-CONSULTANT`,
      author: "consultant",
      text: `Actualice el Knowledge Package usando tu respuesta como ${sourceLabel}. El nivel de confianza actual es ${confidence}. Siguiente foco recomendado: ${nextFocus}.`,
      createdAt: new Date().toISOString()
    };
  },

  resolveValidationStatus(knowledgePackage) {
    const missing = knowledgePackage.missingInformation || [];
    const contradictions = knowledgePackage.contradictions || [];

    if (missing.length || contradictions.length) {
      return "NEEDS_MORE_INFORMATION";
    }

    if (knowledgePackage.confidence === "HIGH_CONFIDENCE") {
      return "READY_FOR_VALIDATION";
    }

    return "IN_REVIEW";
  },

  generateConsultantQuestions(state) {
    const packageData = state.result && state.result.knowledgePackage ? state.result.knowledgePackage : null;

    if (!packageData) {
      return ["Carga documentos, entrevistas o notas y ejecuta el Context Builder para iniciar la revision."];
    }

    const questions = [];
    (packageData.missingInformation || []).forEach((item) => {
      questions.push(`Aclaracion requerida: ${item}`);
    });
    (packageData.contradictions || []).forEach((item) => {
      questions.push(`Resolver contradiccion: ${typeof item === "string" ? item : item.description || item.name || "Contradiccion sin detalle"}`);
    });

    if (!questions.length) {
      questions.push("Confirma si el objetivo, alcance, procesos y actividades detectadas son correctos.");
    }

    return questions.slice(0, 5);
  },

  explainConclusion(state, topic) {
    const packageData = state.result && state.result.knowledgePackage ? state.result.knowledgePackage : null;

    if (!packageData) {
      return "Todavia no hay Knowledge Package para explicar conclusiones.";
    }

    const evidence = this.collectEvidence(state, topic);

    if (!evidence.length) {
      return `La conclusion sobre ${topic} proviene de la combinacion de documentos, entrevistas y notas disponibles, pero requiere evidencia mas especifica.`;
    }

    return `La conclusion sobre ${topic} se basa en: ${evidence.slice(0, 3).map((item) => item.fragment).join(" | ")}`;
  },

  collectEvidence(state, topic) {
    const normalizedTopic = String(topic || "").toLowerCase();
    const evidence = [];

    state.documents.forEach((documentItem) => {
      const fragment = this.findFragment(documentItem.normalizedText || "", normalizedTopic);

      if (fragment) {
        evidence.push({
          source: documentItem.title,
          sourceType: "DOCUMENT",
          fragment,
          confidence: documentItem.normalizationStatus === "NORMALIZED" ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE",
          date: documentItem.lastModified || ""
        });
      }
    });

    state.interviews.forEach((interview) => {
      const fragment = this.findFragment(interview.content || "", normalizedTopic);

      if (fragment) {
        evidence.push({
          source: interview.person || "Entrevista",
          sourceType: "INTERVIEW",
          fragment,
          confidence: "HIGH_CONFIDENCE",
          date: interview.createdAt || ""
        });
      }
    });

    state.notes.forEach((note) => {
      const fragment = this.findFragment(note.content || "", normalizedTopic);

      if (fragment) {
        evidence.push({
          source: "Nota",
          sourceType: "NOTE",
          fragment,
          confidence: "LOW_CONFIDENCE",
          date: note.createdAt || ""
        });
      }
    });

    return evidence;
  },

  findFragment(text, topic) {
    const sentences = this.extractSentences(text);

    if (!topic) {
      return sentences[0] || "";
    }

    return sentences.find((sentence) => sentence.toLowerCase().indexOf(topic) !== -1) || "";
  },

  buildLocalResult(context) {
    const textCorpus = this.buildTextCorpus(context);
    const knowledgePackage = this.buildKnowledgePackage(context, textCorpus);
    const contextGraph = this.buildContextGraph(knowledgePackage);

    return {
      agentId: "CONTEXT_BUILDER",
      agentExecutionId: `AEX-${Date.now()}`,
      knowledgePackage,
      contextGraph
    };
  },

  buildTextCorpus(context) {
    const documentText = (context.normalizedDocuments || []).map((documentItem) => [
      documentItem.title,
      documentItem.normalizedText
    ].filter(Boolean).join("\n")).join("\n");
    const interviewText = (context.interviewNotes || []).map((item) => `${item.person || "Interview"}: ${item.content || ""}`).join("\n");
    const noteText = (context.freeNotes || []).map((item) => item.content || "").join("\n");
    return [documentText, interviewText, noteText].filter(Boolean).join("\n");
  },

  buildKnowledgePackage(context, textCorpus) {
    const project = context.project || {};
    const sentences = this.extractSentences(textCorpus);
    const processName = project.process || "Proceso identificado";
    const activities = this.extractActivities(sentences);
    const systems = this.extractTaggedItems(textCorpus, ["sistema", "aplicacion", "software", "erp", "crm"]);
    const people = this.extractPeople(context);
    const roles = this.extractRoles(textCorpus, people);
    const restrictions = this.extractSentencesByKeywords(sentences, ["restric", "bloque", "limit", "cuello", "demora"]);
    const rules = this.extractSentencesByKeywords(sentences, ["regla", "debe", "requiere", "obligatorio", "aprob"]);
    const contradictions = this.extractSentencesByKeywords(sentences, ["contradic", "conflict", "diferente", "inconsisten"]);
    const missingInformation = this.buildMissingInformation(project, context, activities);

    return {
      knowledgePackageId: `KPK-${Date.now()}`,
      version: 1,
      projectId: context.projectId,
      processModelId: context.processModelId || "",
      objective: {
        description: project.objective || this.firstOrDefault(sentences, "Objetivo pendiente de validar.")
      },
      scope: {
        description: project.scope || "Alcance pendiente de validar.",
        area: project.area || "",
        process: processName
      },
      identifiedProcesses: [{
        processId: `PROC-${Date.now()}`,
        name: processName,
        objective: project.objective || "",
        confidence: project.process ? "HIGH_CONFIDENCE" : "LOW_CONFIDENCE",
        evidenceRefs: ["PROJECT_BASIC_INFO"]
      }],
      identifiedActivities: activities,
      systems,
      people,
      roles,
      documents: context.normalizedDocuments || [],
      indicators: this.extractSentencesByKeywords(sentences, ["indicador", "kpi", "tiempo", "sla", "nivel de servicio"]),
      restrictions,
      businessRules: rules,
      contradictions,
      missingInformation,
      confidence: this.resolveOverallConfidence(context, activities, missingInformation),
      assumptions: [],
      sourceDocuments: (context.normalizedDocuments || []).map((documentItem) => documentItem.documentId),
      parentKnowledgePackage: "",
      createdBy: "LOCAL_USER",
      createdAt: new Date().toISOString()
    };
  },

  extractSentences(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+|\n+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 8)
      .slice(0, 80);
  },

  extractActivities(sentences) {
    const keywords = ["recibe", "valid", "revisa", "aprueba", "registra", "envia", "crea", "actualiza", "genera", "analiza", "solicita", "confirma"];
    const activitySentences = sentences.filter((sentence) => {
      const normalized = sentence.toLowerCase();
      return keywords.some((keyword) => normalized.indexOf(keyword) !== -1);
    }).slice(0, 12);

    return activitySentences.map((sentence, index) => ({
      activityId: `ACT-${String(index + 1).padStart(6, "0")}`,
      activityUUID: `ACTUUID-${Date.now()}-${index + 1}`,
      sequence: index + 1,
      name: this.toActivityName(sentence),
      description: sentence,
      responsible: this.inferResponsible(sentence),
      inputs: [],
      outputs: [],
      systems: [],
      documents: [],
      confidence: "MEDIUM_CONFIDENCE",
      evidenceRefs: [`SENTENCE-${index + 1}`]
    }));
  },

  toActivityName(sentence) {
    const clean = sentence.replace(/^[\-\d.)\s]+/, "");
    return clean.length > 72 ? `${clean.slice(0, 69)}...` : clean;
  },

  inferResponsible(sentence) {
    const match = sentence.match(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\s+(recibe|valida|revisa|aprueba|registra|envia|crea|actualiza|genera|analiza|solicita|confirma)/);
    return match ? match[1] : "Pendiente de confirmar";
  },

  extractTaggedItems(text, keywords) {
    const sentences = this.extractSentences(text);
    return this.extractSentencesByKeywords(sentences, keywords).map((sentence, index) => ({
      id: `SYS-${index + 1}`,
      name: sentence,
      confidence: "LOW_CONFIDENCE"
    }));
  },

  extractSentencesByKeywords(sentences, keywords) {
    return sentences.filter((sentence) => {
      const normalized = sentence.toLowerCase();
      return keywords.some((keyword) => normalized.indexOf(keyword) !== -1);
    }).slice(0, 10);
  },

  extractPeople(context) {
    return (context.interviewNotes || []).filter((item) => item.person).map((item, index) => ({
      personId: `PER-${index + 1}`,
      name: item.person,
      role: item.role || "",
      confidence: "HIGH_CONFIDENCE",
      evidenceRefs: [`INTERVIEW-${index + 1}`]
    }));
  },

  extractRoles(text, people) {
    const roles = people.filter((person) => person.role).map((person, index) => ({
      roleId: `ROL-${index + 1}`,
      name: person.role,
      person: person.name,
      confidence: "HIGH_CONFIDENCE"
    }));

    if (!roles.length && text) {
      roles.push({
        roleId: "ROL-1",
        name: "Responsable del proceso pendiente de confirmar",
        confidence: "LOW_CONFIDENCE"
      });
    }

    return roles;
  },

  buildMissingInformation(project, context, activities) {
    const missing = [];

    if (!project.objective) {
      missing.push("Objetivo del proceso no registrado.");
    }

    if (!project.scope) {
      missing.push("Alcance del proceso no registrado.");
    }

    if (!activities.length) {
      missing.push("No se identificaron actividades suficientes con la evidencia disponible.");
    }

    if (!(context.normalizedDocuments || []).some((item) => item.normalizedText)) {
      missing.push("No hay documentos normalizados con texto extraible.");
    }

    return missing;
  },

  resolveOverallConfidence(context, activities, missingInformation) {
    if (!activities.length || missingInformation.length > 2) {
      return "LOW_CONFIDENCE";
    }

    if ((context.normalizedDocuments || []).length && activities.length >= 3) {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  buildContextGraph(knowledgePackage) {
    const nodes = [];
    const edges = [];

    this.addGraphNode(nodes, "PROJECT", knowledgePackage.projectId, knowledgePackage.scope.process || "Proyecto");

    (knowledgePackage.identifiedProcesses || []).forEach((processItem) => {
      this.addGraphNode(nodes, "PROCESS", processItem.processId, processItem.name);
      edges.push({ from: knowledgePackage.projectId, to: processItem.processId, type: "CONTAINS" });
    });

    (knowledgePackage.identifiedActivities || []).forEach((activity) => {
      this.addGraphNode(nodes, "ACTIVITY", activity.activityUUID, activity.name);
      edges.push({ from: knowledgePackage.identifiedProcesses[0].processId, to: activity.activityUUID, type: "HAS_ACTIVITY" });
    });

    (knowledgePackage.people || []).forEach((person) => {
      this.addGraphNode(nodes, "PERSON", person.personId, person.name);
    });

    (knowledgePackage.systems || []).forEach((system) => {
      this.addGraphNode(nodes, "SYSTEM", system.id, system.name);
    });

    (knowledgePackage.documents || []).forEach((documentItem) => {
      this.addGraphNode(nodes, "DOCUMENT", documentItem.documentId, documentItem.title);
    });

    return {
      contextGraphId: `CG-${Date.now()}`,
      knowledgePackageId: knowledgePackage.knowledgePackageId,
      projectId: knowledgePackage.projectId,
      processModelId: knowledgePackage.processModelId,
      version: knowledgePackage.version,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      createdBy: knowledgePackage.createdBy
    };
  },

  addGraphNode(nodes, type, id, label) {
    if (!id || nodes.some((node) => node.id === id)) {
      return;
    }

    nodes.push({ id, type, label });
  },

  firstOrDefault(items, fallback) {
    return items.length ? items[0] : fallback;
  }
});
