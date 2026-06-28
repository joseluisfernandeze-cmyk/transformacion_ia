window.BusinessDiscoveryService = Object.seal({
  storageKey: "operational-intelligence.business-discovery",

  steps: [
    {
      id: "welcome",
      title: "Bienvenida",
      prompt: "Antes de analizar procesos, necesito comprender como opera la organizacion. Construiremos una base de negocio validada para que los siguientes consultores digitales trabajen con mejor contexto."
    },
    {
      id: "organization",
      title: "Organizacion",
      prompt: "Estos datos me permiten delimitar escala, complejidad geografica y estructura operativa antes de entrar a procesos."
    },
    {
      id: "business",
      title: "Negocio",
      prompt: "Necesito entender que vende la organizacion, a quien atiende, por que canales y cuales son sus prioridades estrategicas."
    },
    {
      id: "structure",
      title: "Estructura",
      prompt: "La estructura organizacional ayuda a conectar procesos, responsables, decisiones y dolores operativos."
    },
    {
      id: "technology",
      title: "Tecnologia",
      prompt: "Los sistemas actuales muestran donde vive la informacion, donde hay integraciones y donde suelen aparecer fricciones."
    },
    {
      id: "project",
      title: "Proyecto",
      prompt: "Ahora delimitaremos el problema, alcance, objetivos, restricciones y riesgos conocidos de la consultoria."
    },
    {
      id: "documentation",
      title: "Documentacion",
      prompt: "La documentacion disponible sera evidencia para validar o cuestionar lo que sabemos del negocio."
    },
    {
      id: "validation",
      title: "Validacion",
      prompt: "Voy a consolidar el Business Knowledge Package. Puedes aprobarlo, corregirlo o agregar informacion hasta que quede validado."
    }
  ],

  createEmptyState() {
    return {
      currentStep: 0,
      status: "IN_PROGRESS",
      organization: {
        name: "",
        industry: "",
        country: "",
        cities: "",
        plants: "",
        distributionCenters: "",
        offices: "",
        employees: ""
      },
      business: {
        products: "",
        services: "",
        customers: "",
        channels: "",
        strategicObjectives: ""
      },
      structure: {
        orgChart: "",
        areas: "",
        owners: "",
        mainProcesses: ""
      },
      technology: {
        erp: "",
        systems: "",
        applications: "",
        integrations: "",
        criticalExcels: ""
      },
      project: {
        mainProblem: "",
        scope: "",
        objectives: "",
        restrictions: "",
        knownRisks: ""
      },
      documents: [],
      chat: this.createInitialChat(),
      package: null
    };
  },

  createInitialChat() {
    return [{
      messageId: `BMSG-${Date.now()}`,
      author: "consultant",
      text: "Comencemos por comprender la organizacion. No busco solo datos: busco contexto suficiente para que los agentes posteriores no trabajen a ciegas.",
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
      organization: { ...baseState.organization, ...(state.organization || {}) },
      business: { ...baseState.business, ...(state.business || {}) },
      structure: { ...baseState.structure, ...(state.structure || {}) },
      technology: { ...baseState.technology, ...(state.technology || {}) },
      project: { ...baseState.project, ...(state.project || {}) },
      documents: state.documents || [],
      chat: state.chat && state.chat.length ? state.chat : this.createInitialChat(),
      package: state.package || null
    };
  },

  saveState(state) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(state));
  },

  getCurrentStep(state) {
    return this.steps[state.currentStep] || this.steps[0];
  },

  moveToStep(state, stepIndex) {
    state.currentStep = Math.max(0, Math.min(this.steps.length - 1, stepIndex));
    this.saveState(state);
    return state;
  },

  async readFiles(fileList) {
    const files = Array.from(fileList || []);
    const documents = [];

    for (const file of files) {
      const normalizedText = await this.readFileAsText(file);
      documents.push({
        documentId: `BDOC-${Date.now()}-${documents.length + 1}`,
        type: this.resolveDocumentType(file),
        title: file.name,
        normalizedText,
        size: file.size,
        status: normalizedText ? "NORMALIZED" : "REGISTERED",
        createdAt: new Date().toISOString()
      });
    }

    return documents;
  },

  readFileAsText(file) {
    const readableExtension = /\.(md|markdown|txt|json|csv|tsv|xml|html)$/i.test(file.name);
    const readableType = ["text/", "application/json", "application/xml"].some((type) => file.type.indexOf(type) === 0);

    if (!readableExtension && !readableType) {
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
    return (file.name.split(".").pop() || file.type || "UNKNOWN").toUpperCase();
  },

  addChatMessage(state, author, text) {
    state.chat.push({
      messageId: `BMSG-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  handleUserMessage(state, message) {
    this.addChatMessage(state, "user", message);
    this.applyMessageAsClarification(state, message);
    state.package = this.buildBusinessKnowledgePackage(state);
    this.addChatMessage(state, "consultant", this.buildConsultantReply(state.package));
    this.syncToContextBuilder(state);
    this.saveState(state);
    return state;
  },

  applyMessageAsClarification(state, message) {
    const normalized = message.toLowerCase();

    if (normalized.indexOf("riesgo") !== -1) {
      state.project.knownRisks = this.appendText(state.project.knownRisks, message);
      return;
    }

    if (normalized.indexOf("sistema") !== -1 || normalized.indexOf("erp") !== -1 || normalized.indexOf("excel") !== -1) {
      state.technology.systems = this.appendText(state.technology.systems, message);
      return;
    }

    if (normalized.indexOf("proceso") !== -1 || normalized.indexOf("area") !== -1) {
      state.structure.mainProcesses = this.appendText(state.structure.mainProcesses, message);
      return;
    }

    state.project.objectives = this.appendText(state.project.objectives, message);
  },

  appendText(currentValue, addition) {
    return [currentValue, addition].filter(Boolean).join("\n");
  },

  buildConsultantReply(packageData) {
    const missing = packageData.missingInformation || [];
    const contradictions = packageData.contradictions || [];

    if (contradictions.length) {
      return `Detecte una posible contradiccion: ${contradictions[0]}. Necesito que la aclaremos antes de validar el paquete.`;
    }

    if (missing.length) {
      return `Actualice el Business Knowledge Package. La siguiente informacion mas importante por completar es: ${missing[0]}.`;
    }

    return `El Business Knowledge Package ya tiene cobertura suficiente para validacion. Revisa el resumen ejecutivo y apruebalo si refleja correctamente el negocio.`;
  },

  buildBusinessKnowledgePackage(state) {
    const missingInformation = this.detectMissingInformation(state);
    const contradictions = this.detectContradictions(state);
    const confidence = this.resolveConfidence(missingInformation, contradictions, state);
    const processes = this.extractList(state.structure.mainProcesses);
    const systems = this.extractSystems(state);
    const risks = this.extractList(state.project.knownRisks);

    return {
      businessKnowledgePackageId: `BKP-${Date.now()}`,
      version: 1,
      status: confidence === "HIGH_CONFIDENCE" && !missingInformation.length ? "READY_FOR_VALIDATION" : "IN_REVIEW",
      organization: state.organization,
      business: state.business,
      structure: state.structure,
      technology: state.technology,
      project: state.project,
      documents: state.documents,
      executiveSummary: this.buildExecutiveSummary(state),
      organizationUnderstanding: this.buildOrganizationUnderstanding(state),
      identifiedProcesses: processes,
      identifiedSystems: systems,
      identifiedRisks: risks,
      missingInformation,
      contradictions,
      confidence,
      evidence: this.buildEvidence(state),
      validatedAt: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  buildExecutiveSummary(state) {
    const organization = state.organization.name || "La organizacion";
    const industry = state.organization.industry || "industria pendiente";
    const problem = state.project.mainProblem || "problema principal pendiente de validar";
    const objective = state.project.objectives || "objetivos pendientes de validar";
    return `${organization} opera en ${industry}. El proyecto busca atender ${problem}. Objetivos declarados: ${objective}.`;
  },

  buildOrganizationUnderstanding(state) {
    return [
      `Pais: ${state.organization.country || "pendiente"}`,
      `Ciudades: ${state.organization.cities || "pendiente"}`,
      `Plantas: ${state.organization.plants || "pendiente"}`,
      `Centros de distribucion: ${state.organization.distributionCenters || "pendiente"}`,
      `Oficinas: ${state.organization.offices || "pendiente"}`,
      `Colaboradores aproximados: ${state.organization.employees || "pendiente"}`
    ].join("\n");
  },

  detectMissingInformation(state) {
    const required = [
      ["Nombre de la organizacion", state.organization.name],
      ["Industria", state.organization.industry],
      ["Pais", state.organization.country],
      ["Productos o servicios", state.business.products || state.business.services],
      ["Clientes", state.business.customers],
      ["Areas", state.structure.areas],
      ["Procesos principales", state.structure.mainProcesses],
      ["ERP o sistemas principales", state.technology.erp || state.technology.systems],
      ["Problema principal", state.project.mainProblem],
      ["Alcance del proyecto", state.project.scope],
      ["Objetivos del proyecto", state.project.objectives]
    ];

    return required.filter((item) => !String(item[1] || "").trim()).map((item) => item[0]);
  },

  detectContradictions(state) {
    const contradictions = [];
    const employees = Number(state.organization.employees);

    if (employees > 0 && employees < 10 && String(state.organization.plants || "").trim()) {
      contradictions.push("La organizacion reporta menos de 10 colaboradores pero tambien plantas operativas; validar escala real.");
    }

    if (!state.technology.erp && String(state.technology.integrations || "").trim()) {
      contradictions.push("Se registran integraciones pero no un ERP o sistema principal asociado.");
    }

    return contradictions;
  },

  resolveConfidence(missingInformation, contradictions, state) {
    if (contradictions.length || missingInformation.length > 4) {
      return "LOW_CONFIDENCE";
    }

    if (missingInformation.length || !state.documents.length) {
      return "MEDIUM_CONFIDENCE";
    }

    return "HIGH_CONFIDENCE";
  },

  buildEvidence(state) {
    const evidence = [];

    state.documents.forEach((documentItem) => {
      evidence.push({
        source: documentItem.title,
        sourceType: "DOCUMENT",
        fragment: documentItem.normalizedText || "Documento registrado sin texto normalizado.",
        confidence: documentItem.normalizedText ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE",
        date: documentItem.createdAt
      });
    });

    if (state.chat.length) {
      evidence.push({
        source: "Conversacion guiada",
        sourceType: "USER_INPUT",
        fragment: state.chat.filter((message) => message.author === "user").map((message) => message.text).join(" | "),
        confidence: "MEDIUM_CONFIDENCE",
        date: new Date().toISOString()
      });
    }

    return evidence;
  },

  extractSystems(state) {
    return this.extractList([
      state.technology.erp,
      state.technology.systems,
      state.technology.applications,
      state.technology.integrations,
      state.technology.criticalExcels
    ].filter(Boolean).join("\n"));
  },

  extractList(text) {
    return String(text || "")
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 30);
  },

  approvePackage(state) {
    state.package = this.buildBusinessKnowledgePackage(state);
    state.package.status = "VALIDATED";
    state.package.validatedAt = new Date().toISOString();
    state.status = "VALIDATED";
    this.addChatMessage(state, "consultant", "Business Knowledge Package validado. Ya puede ser utilizado por Context Builder y los consultores digitales posteriores.");
    this.syncToContextBuilder(state);
    this.saveState(state);
    return state;
  },

  syncToContextBuilder(state) {
    if (!window.ContextBuilderService || !state.package) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();
    contextState.project = {
      ...contextState.project,
      name: state.organization.name || contextState.project.name,
      company: state.organization.name || contextState.project.company,
      area: state.structure.areas || contextState.project.area,
      process: state.structure.mainProcesses || contextState.project.process,
      objective: state.project.objectives || contextState.project.objective,
      scope: state.project.scope || contextState.project.scope
    };

    const documentId = "BDOC-BUSINESS-KNOWLEDGE-PACKAGE";
    const normalizedText = this.packageToText(state.package);
    const existingIndex = contextState.documents.findIndex((documentItem) => documentItem.documentId === documentId);
    const packageDocument = {
      documentId,
      documentType: "BUSINESS_KNOWLEDGE_PACKAGE",
      title: "Business Knowledge Package validado",
      normalizedText,
      size: normalizedText.length,
      lastModified: new Date().toISOString(),
      normalizationStatus: state.package.status === "VALIDATED" ? "VALIDATED" : "NORMALIZED"
    };

    if (existingIndex === -1) {
      contextState.documents.push(packageDocument);
    } else {
      contextState.documents[existingIndex] = packageDocument;
    }

    window.ContextBuilderService.saveState(contextState);
  },

  packageToText(packageData) {
    return [
      "Business Knowledge Package",
      `Resumen ejecutivo: ${packageData.executiveSummary}`,
      `Organizacion: ${JSON.stringify(packageData.organization)}`,
      `Negocio: ${JSON.stringify(packageData.business)}`,
      `Estructura: ${JSON.stringify(packageData.structure)}`,
      `Tecnologia: ${JSON.stringify(packageData.technology)}`,
      `Proyecto: ${JSON.stringify(packageData.project)}`,
      `Procesos identificados: ${(packageData.identifiedProcesses || []).join(", ")}`,
      `Sistemas identificados: ${(packageData.identifiedSystems || []).join(", ")}`,
      `Riesgos identificados: ${(packageData.identifiedRisks || []).join(", ")}`,
      `Informacion faltante: ${(packageData.missingInformation || []).join(", ")}`,
      `Contradicciones: ${(packageData.contradictions || []).join(", ")}`,
      `Nivel de confianza: ${packageData.confidence}`
    ].join("\n");
  }
});
