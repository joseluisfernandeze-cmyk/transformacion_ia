window.TransformationIntelligenceEngine = Object.freeze({
  opportunityTypes: {
    LEAN: "LEAN",
    TOC: "TOC",
    AUTOMATION: "AUTOMATION",
    AI: "AI",
    INNOVATION: "INNOVATION"
  },

  buildTransformationOpportunityPackage(inputSources) {
    const sources = this.normalizeSources(inputSources || this.loadSources());
    const evidenceIndex = this.buildEvidenceIndex(sources);
    const activityContext = this.buildActivityContext(sources, evidenceIndex);
    const opportunities = this.mergeOpportunities([
      ...this.evaluateLean(activityContext, sources),
      ...this.evaluateToc(activityContext, sources),
      ...this.evaluateAutomation(activityContext, sources),
      ...this.evaluateAi(activityContext, sources),
      ...this.evaluateInnovation(activityContext, sources)
    ]);

    return {
      transformationOpportunityPackageId: `TOP-${Date.now()}`,
      packageType: "TRANSFORMATION_OPPORTUNITY_PACKAGE",
      status: opportunities.length ? "READY_FOR_REVIEW" : "INSUFFICIENT_INFORMATION",
      version: 1,
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER",
      businessKnowledgePackageId: sources.businessPackage && sources.businessPackage.businessKnowledgePackageId,
      knowledgePackageId: sources.knowledgePackage && sources.knowledgePackage.knowledgePackageId,
      contextGraphId: sources.contextGraph && sources.contextGraph.contextGraphId,
      processModelId: sources.processModel && sources.processModel.processModelId,
      requirementsPackageId: sources.requirementsPackage && sources.requirementsPackage.requirementsPackageId,
      vsmMapId: sources.vsmMap && sources.vsmMap.vsmMapId,
      summary: this.buildSummary(opportunities, sources),
      opportunities,
      evidenceIndex,
      missingInformation: this.detectMissingInformation(sources, opportunities),
      confidence: this.resolvePackageConfidence(opportunities, sources),
      reusableBy: [
        "Operational Transformation Consultant",
        "Business Case Consultant",
        "To-Be Consultant",
        "ERP Discovery Consultant",
        "ERP RFP Consultant"
      ]
    };
  },

  loadSources() {
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
    const processState = window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : null;
    const requirementsState = window.RequirementsDiscoveryService ? window.RequirementsDiscoveryService.loadState() : null;
    const processModel = processState && processState.draftProcessModel ? processState.draftProcessModel : null;

    return {
      businessPackage: businessState && businessState.package ? businessState.package : null,
      knowledgePackage: contextState && contextState.result ? contextState.result.knowledgePackage : null,
      contextGraph: contextState && contextState.result ? contextState.result.contextGraph : null,
      processModel,
      requirementsPackage: requirementsState && requirementsState.requirementsPackage ? requirementsState.requirementsPackage : null,
      vsmMap: this.loadVsmMap(processModel),
      businessState,
      contextState,
      processState,
      requirementsState
    };
  },

  loadVsmMap(processModel) {
    if (!processModel || !window.VsmBuilderService) {
      return null;
    }

    try {
      return window.VsmBuilderService.loadVsmMap(processModel);
    } catch (error) {
      return null;
    }
  },

  normalizeSources(sources) {
    return {
      businessPackage: sources.businessPackage || null,
      knowledgePackage: sources.knowledgePackage || null,
      contextGraph: sources.contextGraph || null,
      processModel: sources.processModel || null,
      requirementsPackage: sources.requirementsPackage || null,
      vsmMap: sources.vsmMap || null,
      businessState: sources.businessState || null,
      contextState: sources.contextState || null,
      processState: sources.processState || null,
      requirementsState: sources.requirementsState || null
    };
  },

  buildActivityContext(sources, evidenceIndex) {
    const activities = sources.processModel && sources.processModel.activities ? sources.processModel.activities : [];
    const vsmByActivity = this.indexBy((sources.vsmMap && sources.vsmMap.activityData) || [], "activityUUID");
    const requirementsByActivity = this.groupBy(
      (sources.requirementsPackage && sources.requirementsPackage.requirements) || [],
      "sourceActivityUUID"
    );

    return activities.map((activity, index) => {
      const vsm = vsmByActivity[activity.activityUUID] || {};
      const processTime = this.expectedTriangular(vsm.processTimeMin, vsm.processTimeLikely, vsm.processTimeMax);
      const waitTime = this.expectedTriangular(vsm.waitTimeMin, vsm.waitTimeLikely, vsm.waitTimeMax);
      const queueTime = this.expectedTriangular(vsm.queueTimeMin, vsm.queueTimeLikely, vsm.queueTimeMax);
      const evidence = this.resolveActivityEvidence(activity, evidenceIndex, index);

      return {
        activity,
        sequence: activity.sequence || activity.sequenceNumber || index + 1,
        text: this.activityText(activity),
        processTime,
        waitTime,
        queueTime,
        totalDelayTime: waitTime + queueTime,
        valueClassification: vsm.valueClassification || "",
        wip: Number(vsm.wip) || 0,
        frequency: Number(vsm.frequency) || 0,
        requirements: requirementsByActivity[activity.activityUUID] || [],
        evidence
      };
    });
  },

  evaluateLean(activityContext) {
    const opportunities = [];

    activityContext.forEach((context) => {
      const text = context.text.toLowerCase();

      if (context.totalDelayTime > 0 || this.containsAny(text, ["espera", "cola", "pendiente", "demora", "retraso"])) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.LEAN,
          subtype: "WAITING",
          title: `Reducir esperas en ${context.activity.name}`,
          description: "La actividad presenta tiempo de espera, cola o evidencia textual de demora.",
          activityContext: context,
          impact: context.totalDelayTime > 30 ? "HIGH" : "MEDIUM",
          complexity: "MEDIUM",
          effort: "MEDIUM",
          expectedBenefit: "Reduccion de lead time y mejora de flujo.",
          risks: ["La espera puede depender de reglas externas o aprobaciones obligatorias."],
          dependencies: ["Validar causa raiz de la espera con responsables del proceso."]
        }));
      }

      if (this.containsAny(text, ["retrabajo", "corregir", "devolver", "rechazo", "error", "reproceso"])) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.LEAN,
          subtype: "REWORK",
          title: `Eliminar retrabajo en ${context.activity.name}`,
          description: "Existe evidencia de correcciones, devoluciones, errores o reprocesos.",
          activityContext: context,
          impact: "HIGH",
          complexity: "MEDIUM",
          effort: "MEDIUM",
          expectedBenefit: "Menos ciclos repetidos, menor costo operativo y mejor calidad.",
          risks: ["Puede requerir cambios en reglas, datos maestros o controles previos."],
          dependencies: ["Identificar errores frecuentes y punto de deteccion."]
        }));
      }

      if (context.valueClassification === "NVA" || this.containsAny(text, ["duplicado", "manual", "transcribir", "copiar", "imprimir"])) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.LEAN,
          subtype: "OVERPROCESSING",
          title: `Simplificar sobreproceso en ${context.activity.name}`,
          description: "La actividad parece contener pasos manuales, duplicados o no agregadores de valor.",
          activityContext: context,
          impact: context.valueClassification === "NVA" ? "HIGH" : "MEDIUM",
          complexity: "LOW",
          effort: "LOW",
          expectedBenefit: "Menos pasos innecesarios y mayor productividad.",
          risks: ["Algunos controles pueden ser regulatorios o necesarios."],
          dependencies: ["Confirmar valor agregado y obligatoriedad del control."]
        }));
      }

      if (context.wip > 0 || this.containsAny(text, ["inventario", "wip", "acumulado", "bandeja", "backlog"])) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.LEAN,
          subtype: "INVENTORY",
          title: `Reducir acumulacion en ${context.activity.name}`,
          description: "La evidencia indica inventario operativo, backlog o trabajo acumulado.",
          activityContext: context,
          impact: context.wip > 5 ? "HIGH" : "MEDIUM",
          complexity: "MEDIUM",
          effort: "MEDIUM",
          expectedBenefit: "Menor trabajo en proceso y menor tiempo de ciclo.",
          risks: ["La acumulacion puede estar causada por capacidad insuficiente aguas abajo."],
          dependencies: ["Medir demanda, capacidad y frecuencia real."]
        }));
      }

      if (this.containsAny(text, ["traslad", "transport", "envia documento", "mover", "firma fisica"])) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.LEAN,
          subtype: "TRANSPORT_MOTION",
          title: `Eliminar transporte o movimiento en ${context.activity.name}`,
          description: "La actividad contiene señales de traslado de informacion, documentos o personas.",
          activityContext: context,
          impact: "MEDIUM",
          complexity: "LOW",
          effort: "LOW",
          expectedBenefit: "Menos tiempos muertos y menor riesgo de perdida de informacion.",
          risks: ["Puede depender de documentos originales o controles fisicos."],
          dependencies: ["Validar requisitos documentales y firma."]
        }));
      }

      if (this.containsAny(text, ["experto", "solo una persona", "conocimiento", "pendiente de especialista"])) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.LEAN,
          subtype: "UNUSED_TALENT",
          title: `Reducir dependencia de talento unico en ${context.activity.name}`,
          description: "La evidencia sugiere dependencia de conocimiento individual o especialista.",
          activityContext: context,
          impact: "MEDIUM",
          complexity: "MEDIUM",
          effort: "MEDIUM",
          expectedBenefit: "Menor riesgo operativo y mayor escalabilidad.",
          risks: ["El conocimiento puede no estar documentado."],
          dependencies: ["Capturar reglas y criterios del especialista."]
        }));
      }
    });

    return opportunities;
  },

  evaluateToc(activityContext) {
    const opportunities = [];
    const averageProcessTime = this.average(activityContext.map((context) => context.processTime));
    const averageDelayTime = this.average(activityContext.map((context) => context.totalDelayTime));

    activityContext.forEach((context) => {
      const text = context.text.toLowerCase();
      const isTimeConstraint = context.processTime > averageProcessTime * 1.5 || context.totalDelayTime > averageDelayTime * 1.5;
      const isTextConstraint = this.containsAny(text, ["cuello", "restriccion", "bloqueo", "capacidad", "dependencia", "aprobacion pendiente", "espera aprobacion", "requiere aprobacion"]);

      if (isTimeConstraint || isTextConstraint) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.TOC,
          subtype: "CONSTRAINT",
          title: `Gestionar restriccion en ${context.activity.name}`,
          description: "La actividad puede estar limitando el throughput por tiempo, dependencia, capacidad o aprobacion.",
          activityContext: context,
          impact: isTimeConstraint ? "HIGH" : "MEDIUM",
          complexity: "MEDIUM",
          effort: "MEDIUM",
          expectedBenefit: "Mayor flujo, menor acumulacion y mejor cumplimiento.",
          risks: ["La restriccion puede moverse a otra actividad despues de la mejora."],
          dependencies: ["Confirmar capacidad, demanda y dependencia real."]
        }));
      }
    });

    return opportunities;
  },

  evaluateAutomation(activityContext) {
    const opportunities = [];

    activityContext.forEach((context) => {
      const text = context.text.toLowerCase();
      const hasRules = (context.activity.businessRules || []).length || context.requirements.some((item) => ["BUSINESS_RULE", "VALIDATION", "APPROVAL"].indexOf(item.category) !== -1);
      const hasIntegrationNeed = context.requirements.some((item) => item.category === "INTEGRATION") || this.containsAny(text, ["integracion", "api", "interface", "interfaz", "sincroniza"]);
      const isRepetitive = context.frequency > 10 || this.containsAny(text, ["repetitivo", "diario", "cada", "masivo", "lote"]);
      const isManual = this.containsAny(text, ["manual", "excel", "copiar", "transcribir", "correo"]);

      if (hasRules || hasIntegrationNeed || isRepetitive || isManual) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.AUTOMATION,
          subtype: hasIntegrationNeed ? "INTEGRATION_AUTOMATION" : "RULE_BASED_AUTOMATION",
          title: `Automatizar ${context.activity.name}`,
          description: "La actividad contiene reglas, validaciones, integraciones, frecuencia o trabajo manual que puede automatizarse.",
          activityContext: context,
          impact: isRepetitive || hasIntegrationNeed ? "HIGH" : "MEDIUM",
          complexity: hasIntegrationNeed ? "HIGH" : "MEDIUM",
          effort: hasIntegrationNeed ? "HIGH" : "MEDIUM",
          expectedBenefit: "Menor esfuerzo manual, menor error y mayor velocidad de ejecucion.",
          risks: ["La automatizacion depende de datos confiables, reglas claras e integraciones disponibles."],
          dependencies: ["Estandarizar reglas, datos de entrada y excepciones."]
        }));
      }
    });

    return opportunities;
  },

  evaluateAi(activityContext, sources) {
    const opportunities = [];
    const requirements = (sources.requirementsPackage && sources.requirementsPackage.requirements) || [];

    activityContext.forEach((context) => {
      const text = context.text.toLowerCase();

      if (this.containsAny(text, ["clasifica", "categoriza", "prioriza", "segmenta"])) {
        opportunities.push(this.aiOpportunity("CLASSIFICATION", "Clasificacion asistida", context, "Clasificar solicitudes, documentos o casos con IA para acelerar decisiones."));
      }

      if (this.containsAny(text, ["predice", "forecast", "pronostico", "riesgo", "probabilidad", "demanda"])) {
        opportunities.push(this.aiOpportunity("PREDICTION", "Prediccion operativa", context, "Predecir riesgo, demanda, incumplimiento o probabilidad de excepcion."));
      }

      if (this.containsAny(text, ["documento", "pdf", "factura", "contrato", "orden", "extrae", "captura"])) {
        opportunities.push(this.aiOpportunity("DOCUMENT_EXTRACTION", "Extraccion documental", context, "Extraer datos de documentos y reducir captura manual."));
      }

      if (this.containsAny(text, ["consulta", "pregunta", "soporte", "asistente", "ayuda"])) {
        opportunities.push(this.aiOpportunity("ASSISTANT", "Asistente operativo", context, "Guiar usuarios y resolver consultas con contexto del proceso."));
      }

      if (this.containsAny(text, ["genera", "redacta", "informe", "resumen", "comunicacion"])) {
        opportunities.push(this.aiOpportunity("GENERATION", "Generacion automatica", context, "Generar borradores, reportes o comunicaciones con trazabilidad."));
      }
    });

    requirements.forEach((requirement) => {
      const text = `${requirement.title || ""} ${requirement.description || ""}`.toLowerCase();
      if (this.containsAny(text, ["clasifica", "predic", "extrae", "asistente", "genera"])) {
        opportunities.push(this.createOpportunity({
          type: this.opportunityTypes.AI,
          subtype: "REQUIREMENT_AI_ENABLEMENT",
          title: `Evaluar IA para requerimiento: ${requirement.title}`,
          description: "El Requirements Package contiene una necesidad compatible con capacidades de IA.",
          activityContext: this.emptyActivityContext(requirement),
          evidence: requirement.evidence || [],
          impact: "MEDIUM",
          complexity: "MEDIUM",
          effort: "MEDIUM",
          expectedBenefit: "Mejor experiencia, velocidad y soporte a decisiones.",
          risks: ["Requiere datos historicos, controles de calidad y gobierno de respuestas."],
          dependencies: ["Definir prompt, datos fuente, validacion humana y seguridad."]
        }));
      }
    });

    return opportunities;
  },

  evaluateInnovation(activityContext) {
    const opportunities = [];

    activityContext.forEach((context) => {
      const text = context.text.toLowerCase();

      if (context.valueClassification === "NVA" || this.containsAny(text, ["innecesario", "duplicado", "no agrega valor"])) {
        opportunities.push(this.innovationOpportunity("ELIMINATION", "Eliminar actividad sin valor claro", context, "Evaluar eliminacion o absorcion de la actividad."));
      }

      if (this.containsAny(text, ["complejo", "muchos pasos", "varios formatos", "manual"])) {
        opportunities.push(this.innovationOpportunity("SIMPLIFICATION", "Simplificar experiencia operativa", context, "Reducir pasos, formatos y controles redundantes."));
      }

      if (this.containsAny(text, ["espera aprobacion", "secuencial", "pendiente de"])) {
        opportunities.push(this.innovationOpportunity("PARALLELIZATION", "Paralelizar trabajo", context, "Ejecutar tareas independientes en paralelo para reducir lead time."));
      }

      if (this.containsAny(text, ["varias areas", "multiples equipos", "disperso", "descentralizado"])) {
        opportunities.push(this.innovationOpportunity("CENTRALIZATION", "Centralizar capacidad", context, "Concentrar operaciones repetibles para mejorar consistencia."));
      }

      if (this.containsAny(text, ["solicita", "consulta estado", "atencion", "mesa de ayuda"])) {
        opportunities.push(this.innovationOpportunity("SELF_SERVICE", "Habilitar autoservicio", context, "Permitir que usuarios consulten, registren o den seguimiento sin intermediacion."));
      }

      if (this.containsAny(text, ["papel", "firma fisica", "archivo fisico", "impreso"])) {
        opportunities.push(this.innovationOpportunity("DIGITALIZATION", "Digitalizar evidencia y aprobaciones", context, "Sustituir soporte fisico por flujo digital trazable."));
      }
    });

    return opportunities;
  },

  aiOpportunity(subtype, label, context, description) {
    return this.createOpportunity({
      type: this.opportunityTypes.AI,
      subtype,
      title: `${label} en ${context.activity.name}`,
      description,
      activityContext: context,
      impact: "MEDIUM",
      complexity: "MEDIUM",
      effort: "MEDIUM",
      expectedBenefit: "Mejor velocidad, consistencia y soporte a decisiones.",
      risks: ["La oportunidad requiere evidencia, calidad de datos y validacion humana."],
      dependencies: ["Definir datos disponibles, prompt, criterio de aceptacion y control humano."]
    });
  },

  innovationOpportunity(subtype, title, context, description) {
    return this.createOpportunity({
      type: this.opportunityTypes.INNOVATION,
      subtype,
      title: `${title}: ${context.activity.name}`,
      description,
      activityContext: context,
      impact: subtype === "ELIMINATION" || subtype === "PARALLELIZATION" ? "HIGH" : "MEDIUM",
      complexity: subtype === "DIGITALIZATION" ? "MEDIUM" : "LOW",
      effort: subtype === "DIGITALIZATION" ? "MEDIUM" : "LOW",
      expectedBenefit: "Mejora estructural de experiencia, flujo y escalabilidad.",
      risks: ["Puede requerir cambio organizacional y validacion de controles."],
      dependencies: ["Validar impacto con duenos de proceso y usuarios."]
    });
  },

  createOpportunity(data) {
    const evidence = data.evidence || (data.activityContext ? data.activityContext.evidence : []);
    const impact = data.impact || "MEDIUM";
    const complexity = data.complexity || "MEDIUM";
    const effort = data.effort || "MEDIUM";

    return {
      opportunityId: `OPP-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: data.type,
      subtype: data.subtype,
      title: data.title,
      description: data.description,
      activityUUID: data.activityContext && data.activityContext.activity ? data.activityContext.activity.activityUUID || "" : "",
      activityName: data.activityContext && data.activityContext.activity ? data.activityContext.activity.name || "" : "",
      evidence,
      confidence: this.resolveOpportunityConfidence(evidence, data.activityContext),
      expectedImpact: impact,
      complexity,
      effort,
      expectedBenefit: data.expectedBenefit,
      benefitScore: this.calculateBenefitScore(impact, complexity, effort, data.activityContext),
      risks: data.risks || [],
      dependencies: data.dependencies || [],
      status: "DRAFT"
    };
  },

  mergeOpportunities(opportunities) {
    const seen = {};
    return opportunities.filter((opportunity) => {
      const key = `${opportunity.type}|${opportunity.subtype}|${opportunity.activityUUID}|${opportunity.title}`.toLowerCase();
      if (seen[key]) {
        return false;
      }

      seen[key] = true;
      return true;
    }).slice(0, 120);
  },

  buildEvidenceIndex(sources) {
    const evidence = [];

    this.addEvidenceFromPackage(evidence, sources.businessPackage, "BUSINESS_KNOWLEDGE_PACKAGE");
    this.addEvidenceFromPackage(evidence, sources.knowledgePackage, "KNOWLEDGE_PACKAGE");
    this.addEvidenceFromRequirements(evidence, sources.requirementsPackage);

    ((sources.contextState && sources.contextState.interviews) || []).forEach((interview, index) => {
      this.addEvidence(evidence, {
        evidenceId: `TI-INTERVIEW-${index + 1}`,
        sourceType: "INTERVIEW",
        sourceName: interview.person || "Interview",
        fragment: interview.content || "",
        confidence: "HIGH_CONFIDENCE",
        date: interview.createdAt || ""
      });
    });

    ((sources.processModel && sources.processModel.activities) || []).forEach((activity, index) => {
      this.addEvidence(evidence, {
        evidenceId: `TI-ACTIVITY-${index + 1}`,
        sourceType: "PROCESS_MODEL",
        sourceName: activity.name,
        fragment: this.activityText(activity),
        confidence: activity.confidence || "LOW_CONFIDENCE",
        date: sources.processModel.createdAt || ""
      });
    });

    return evidence.slice(0, 160);
  },

  addEvidenceFromPackage(evidence, packageData, sourceType) {
    if (!packageData) {
      return;
    }

    ["businessRules", "restrictions", "contradictions", "missingInformation", "indicators"].forEach((field) => {
      ((packageData[field]) || []).forEach((item, index) => {
        this.addEvidence(evidence, {
          evidenceId: `TI-${sourceType}-${field}-${index + 1}`,
          sourceType,
          sourceName: field,
          fragment: typeof item === "string" ? item : item.description || item.name || JSON.stringify(item),
          confidence: item.confidence || packageData.confidence || "LOW_CONFIDENCE",
          date: packageData.createdAt || ""
        });
      });
    });

    ((packageData.documents) || []).forEach((documentItem, index) => {
      this.addEvidence(evidence, {
        evidenceId: `TI-${sourceType}-DOC-${index + 1}`,
        sourceType: "DOCUMENT",
        sourceName: documentItem.title || documentItem.documentId,
        fragment: documentItem.normalizedText || "",
        confidence: documentItem.normalizedText ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE",
        date: documentItem.lastModified || documentItem.createdAt || ""
      });
    });
  },

  addEvidenceFromRequirements(evidence, requirementsPackage) {
    ((requirementsPackage && requirementsPackage.requirements) || []).forEach((requirement, index) => {
      this.addEvidence(evidence, {
        evidenceId: `TI-REQ-${index + 1}`,
        sourceType: "REQUIREMENT",
        sourceName: requirement.title,
        fragment: requirement.description || requirement.title,
        confidence: requirement.confidence || "LOW_CONFIDENCE",
        date: requirementsPackage.createdAt || ""
      });

      (requirement.evidence || []).forEach((item, evidenceIndex) => this.addEvidence(evidence, {
        evidenceId: `TI-REQ-${index + 1}-EV-${evidenceIndex + 1}`,
        sourceType: item.sourceType || "REQUIREMENT_EVIDENCE",
        sourceName: item.sourceName || requirement.title,
        fragment: item.fragment || "",
        confidence: item.confidence || requirement.confidence || "LOW_CONFIDENCE",
        date: item.date || ""
      }));
    });
  },

  addEvidence(evidence, item) {
    if (!item || !String(item.fragment || "").trim()) {
      return;
    }

    evidence.push({
      evidenceId: item.evidenceId || `TI-EV-${evidence.length + 1}`,
      sourceType: item.sourceType || "UNKNOWN",
      sourceName: item.sourceName || "Unknown source",
      fragment: String(item.fragment || "").trim(),
      confidence: item.confidence || "LOW_CONFIDENCE",
      date: item.date || ""
    });
  },

  resolveActivityEvidence(activity, evidenceIndex, index) {
    const activityEvidence = (activity.evidence || []).map((item) => ({
      evidenceId: item.evidenceId || `ACT-EV-${index + 1}`,
      sourceType: item.sourceType || "PROCESS_MODEL",
      sourceName: item.sourceName || activity.name,
      fragment: item.fragment || activity.description || activity.name,
      confidence: item.confidence || activity.confidence || "LOW_CONFIDENCE",
      date: item.date || ""
    }));

    if (activityEvidence.length) {
      return activityEvidence.slice(0, 5);
    }

    return evidenceIndex
      .filter((item) => item.fragment.toLowerCase().indexOf(String(activity.name || "").toLowerCase()) !== -1)
      .slice(0, 3);
  },

  detectMissingInformation(sources, opportunities) {
    const missing = [];

    if (!sources.businessPackage) {
      missing.push("Business Knowledge Package no disponible.");
    }

    if (!sources.knowledgePackage) {
      missing.push("Knowledge Package no disponible.");
    }

    if (!sources.processModel || !((sources.processModel.activities || []).length)) {
      missing.push("Process Model no disponible o sin actividades.");
    }

    if (!sources.requirementsPackage) {
      missing.push("Requirements Package no disponible.");
    }

    if (!sources.vsmMap) {
      missing.push("VSM no disponible; oportunidades de tiempo se calculan con menor precision.");
    }

    if (!opportunities.length) {
      missing.push("No se detectaron oportunidades con la evidencia actual.");
    }

    return missing;
  },

  buildSummary(opportunities, sources) {
    const byType = this.groupBy(opportunities, "type");
    const highImpact = opportunities.filter((opportunity) => opportunity.expectedImpact === "HIGH").length;

    return {
      totalOpportunities: opportunities.length,
      highImpactOpportunities: highImpact,
      lean: (byType.LEAN || []).length,
      toc: (byType.TOC || []).length,
      automation: (byType.AUTOMATION || []).length,
      ai: (byType.AI || []).length,
      innovation: (byType.INNOVATION || []).length,
      hasVsm: Boolean(sources.vsmMap),
      hasRequirementsPackage: Boolean(sources.requirementsPackage)
    };
  },

  resolvePackageConfidence(opportunities, sources) {
    if (!opportunities.length || !sources.processModel) {
      return "INSUFFICIENT_INFORMATION";
    }

    const strong = opportunities.filter((opportunity) => opportunity.confidence === "HIGH_CONFIDENCE" || opportunity.confidence === "MEDIUM_CONFIDENCE").length;

    if (strong / opportunities.length > 0.75 && sources.requirementsPackage && sources.vsmMap) {
      return "HIGH_CONFIDENCE";
    }

    return "MEDIUM_CONFIDENCE";
  },

  resolveOpportunityConfidence(evidence, activityContext) {
    const evidenceCount = (evidence || []).length;
    const activityConfidence = activityContext && activityContext.activity ? activityContext.activity.confidence : "";
    const hasTiming = activityContext && (activityContext.processTime > 0 || activityContext.totalDelayTime > 0);

    if (evidenceCount >= 2 && activityConfidence === "HIGH_CONFIDENCE" && hasTiming) {
      return "HIGH_CONFIDENCE";
    }

    if (evidenceCount || activityConfidence === "MEDIUM_CONFIDENCE" || activityConfidence === "HIGH_CONFIDENCE") {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  calculateBenefitScore(impact, complexity, effort, activityContext) {
    const impactScore = { HIGH: 5, MEDIUM: 3, LOW: 1 }[impact] || 3;
    const complexityPenalty = { HIGH: 3, MEDIUM: 2, LOW: 1 }[complexity] || 2;
    const effortPenalty = { HIGH: 3, MEDIUM: 2, LOW: 1 }[effort] || 2;
    const delayBonus = activityContext && activityContext.totalDelayTime > 30 ? 1 : 0;

    return Math.max(1, Math.min(10, impactScore * 2 + delayBonus - complexityPenalty - effortPenalty));
  },

  activityText(activity) {
    return [
      activity.name,
      activity.description,
      activity.responsible,
      activity.area,
      (activity.inputs || []).join(" "),
      (activity.outputs || []).join(" "),
      (activity.systems || []).join(" "),
      (activity.documents || []).join(" "),
      (activity.businessRules || []).join(" "),
      (activity.decisions || []).join(" "),
      (activity.observations || []).map((item) => item.text || item).join(" ")
    ].filter(Boolean).join(" ");
  },

  emptyActivityContext(requirement) {
    return {
      activity: {
        activityUUID: requirement.sourceActivityUUID || "",
        name: requirement.title || "Requirement"
      },
      evidence: requirement.evidence || [],
      processTime: 0,
      waitTime: 0,
      queueTime: 0,
      totalDelayTime: 0,
      requirements: [requirement]
    };
  },

  containsAny(text, keywords) {
    const normalized = String(text || "").toLowerCase();
    return keywords.some((keyword) => normalized.indexOf(keyword) !== -1);
  },

  expectedTriangular(min, likely, max) {
    if (window.CalculationEngine && window.CalculationEngine.expectedTriangular) {
      return window.CalculationEngine.expectedTriangular(min, likely, max);
    }

    const a = Number(min) || 0;
    const m = Number(likely) || 0;
    const b = Number(max) || 0;
    return (a + m + b) / 3;
  },

  average(values) {
    const valid = values.filter((value) => Number(value) > 0);
    if (!valid.length) {
      return 0;
    }

    return valid.reduce((sum, value) => sum + Number(value), 0) / valid.length;
  },

  indexBy(records, key) {
    return (records || []).reduce((index, record) => {
      if (record && record[key]) {
        index[record[key]] = record;
      }

      return index;
    }, {});
  },

  groupBy(records, key) {
    return (records || []).reduce((groups, record) => {
      const groupKey = record && record[key] ? record[key] : "";
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(record);
      return groups;
    }, {});
  }
});
