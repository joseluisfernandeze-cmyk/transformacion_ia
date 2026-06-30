window.LeanConsultantService = Object.seal({
  storageKey: "operational-intelligence.lean-consultant",

  wastes: [
    { id: "OVERPRODUCTION", label: "Sobreproduccion" },
    { id: "WAITING", label: "Espera" },
    { id: "TRANSPORT", label: "Transporte" },
    { id: "OVERPROCESSING", label: "Sobreproceso" },
    { id: "INVENTORY", label: "Inventario" },
    { id: "MOTION", label: "Movimiento" },
    { id: "DEFECTS_REWORK", label: "Defectos / Retrabajos" },
    { id: "UNUSED_TALENT", label: "Talento desaprovechado" }
  ],

  opportunityTypes: {
    OVERPRODUCTION: "Eliminacion",
    WAITING: "Reduccion de esperas",
    TRANSPORT: "Flujo continuo",
    OVERPROCESSING: "Simplificacion",
    INVENTORY: "Flujo continuo",
    MOTION: "Estandarizacion",
    DEFECTS_REWORK: "Reduccion de retrabajos",
    UNUSED_TALENT: "Balanceo"
  },

  createState() {
    const sources = this.loadSources();

    return {
      sources,
      selectedActivityUUID: this.firstActivityUuid(sources.processState),
      assessmentPackage: null,
      questions: [],
      chat: this.createInitialChat(),
      lastSavedAt: ""
    };
  },

  createInitialChat() {
    return [{
      messageId: `LEAN-${Date.now()}`,
      author: "consultant",
      text: "Ejecutare un diagnostico Lean consultivo. No asumire desperdicios ni recomendaciones sin evidencia; cuando falte informacion generare preguntas especificas.",
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
      state.sources = this.loadSources();
      state.selectedActivityUUID = saved.selectedActivityUUID || this.firstActivityUuid(state.sources.processState);
      state.assessmentPackage = saved.assessmentPackage || null;
      state.questions = this.buildQuestions(state.assessmentPackage, state.sources);
      state.chat = saved.chat && saved.chat.length ? saved.chat : this.createInitialChat();
      return state;
    } catch (error) {
      return this.createState();
    }
  },

  saveState(state) {
    state.questions = this.buildQuestions(state.assessmentPackage, state.sources);
    state.lastSavedAt = new Date().toISOString();
    this.syncToKnowledgePackage(state);
    this.syncToContextGraph(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify({
      selectedActivityUUID: state.selectedActivityUUID,
      assessmentPackage: state.assessmentPackage,
      questions: state.questions,
      chat: state.chat,
      lastSavedAt: state.lastSavedAt
    }));
  },

  loadSources() {
    const processState = this.loadProcessState();
    const contextState = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
    const workshopState = window.TransformationWorkshopService ? window.TransformationWorkshopService.loadState() : null;
    const vsmState = window.IntelligentVsmStudioService ? window.IntelligentVsmStudioService.loadState() : null;
    const dataCollectionState = window.ProcessDataCollectionStudioService ? window.ProcessDataCollectionStudioService.loadState() : null;
    const requirementsState = window.RequirementsDiscoveryService ? window.RequirementsDiscoveryService.loadState() : null;

    return {
      businessKnowledgePackage: this.loadBusinessKnowledgePackage(),
      processState,
      operationalDataState: dataCollectionState,
      vsmState,
      transformationObservationPackage: workshopState ? workshopState.packageData : null,
      requirementsPackage: requirementsState && requirementsState.packageData ? requirementsState.packageData : null,
      knowledgePackage: contextState && contextState.result ? contextState.result.knowledgePackage : null,
      contextGraph: contextState && contextState.result ? contextState.result.contextGraph : null
    };
  },

  loadBusinessKnowledgePackage() {
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    return businessState && businessState.package ? businessState.package : null;
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

  runAssessment(state) {
    state.sources = this.loadSources();
    const model = state.sources.processState.draftProcessModel;
    const activities = model && model.activities ? model.activities : [];
    const diagnostics = activities.map((activity) => this.diagnoseActivity(activity, state.sources));
    const quickWins = this.buildQuickWins(diagnostics);
    const opportunities = this.buildLeanOpportunities(diagnostics);
    const questions = this.buildQuestions({ activityAssessments: diagnostics }, state.sources);
    const detectedWastes = this.buildDetectedWasteIndex(diagnostics);
    const evidenceUsed = this.buildEvidenceIndex(diagnostics);
    const summary = this.buildSummary(diagnostics, quickWins, opportunities, questions);

    state.assessmentPackage = {
      leanAssessmentPackageId: `LAP-${Date.now()}`,
      packageType: "LEAN_ASSESSMENT_PACKAGE",
      methodology: "PROFESSIONAL_LEAN_CONSULTANT",
      status: questions.some((question) => question.blocksConsolidation) ? "NEEDS_MORE_INFORMATION" : "READY_FOR_REVIEW",
      version: 2,
      processModelId: model ? model.processModelId : "",
      knowledgePackageId: state.sources.knowledgePackage ? state.sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: state.sources.contextGraph ? state.sources.contextGraph.contextGraphId : "",
      sourcePackages: this.resolveSourcePackages(state.sources),
      decisionTrace: this.createPackageDecisionTrace(diagnostics, questions),
      executiveSummary: this.buildExecutiveSummary(summary, detectedWastes, questions),
      activityAssessments: diagnostics,
      consolidatedDiagnosis: this.buildConsolidatedDiagnosis(diagnostics, summary),
      detectedWastes,
      quickWins,
      opportunities,
      questions,
      evidenceUsed,
      summary,
      confidence: summary.averageConfidence,
      createdAt: new Date().toISOString(),
      createdBy: "LOCAL_USER"
    };
    state.questions = questions;
    this.addChat(state, "consultant", `Lean Assessment Package profesional generado: ${diagnostics.length} actividades, ${detectedWastes.length} desperdicios con evidencia, ${quickWins.length} quick wins y ${questions.length} preguntas pendientes.`);
    this.saveState(state);
  },

  diagnoseActivity(activity, sources) {
    const evidence = this.collectActivityEvidence(activity, sources);
    const understanding = this.buildUnderstanding(activity, evidence);
    const valueAnalysis = this.resolveValueAnalysis(activity, evidence);
    const wasteDiagnostics = this.wastes.map((waste) => this.evaluateWaste(waste, activity, evidence));
    const rootCauses = this.buildRootCauses(wasteDiagnostics, activity);
    const questions = this.buildActivityQuestions(activity, evidence, valueAnalysis, wasteDiagnostics, rootCauses);
    const confidence = this.resolveActivityConfidence(evidence, valueAnalysis, wasteDiagnostics, questions);

    return {
      leanActivityAssessmentId: `LAA-${activity.activityUUID || Date.now()}`,
      activityUUID: activity.activityUUID,
      activityId: activity.activityId,
      sequence: activity.sequence,
      activityName: activity.name,
      responsible: activity.responsible || "",
      area: activity.area || "",
      understanding,
      valueAnalysis,
      valueClassification: {
        classification: valueAnalysis.classification,
        justification: valueAnalysis.reason,
        evidenceRefs: valueAnalysis.evidence.map((item) => item.evidenceId),
        confidence: valueAnalysis.confidence
      },
      wastes: wasteDiagnostics,
      rootCauses,
      decisionTrace: this.createActivityDecisionTrace(activity, evidence, valueAnalysis, wasteDiagnostics, questions),
      evidence,
      confidence,
      questions,
      createdAt: new Date().toISOString()
    };
  },

  buildUnderstanding(activity, evidence) {
    return {
      whatItDoes: activity.description || activity.name || "Descripcion no disponible.",
      purpose: this.resolvePurpose(activity),
      executedBy: activity.responsible || "Responsable no identificado.",
      inputs: activity.inputs && activity.inputs.length ? activity.inputs : ["Entradas no identificadas."],
      outputs: activity.outputs && activity.outputs.length ? activity.outputs : ["Salidas no identificadas."],
      systems: activity.systems || [],
      documents: activity.documents || [],
      evidence: evidence.filter((item) => item.category === "PROCESS_MODEL" || item.category === "PROCESS_EVIDENCE")
    };
  },

  resolvePurpose(activity) {
    if (activity.outputs && activity.outputs.length) {
      return `Generar o habilitar: ${activity.outputs.join(", ")}.`;
    }

    if (activity.description) {
      return `Proposito inferido de la descripcion registrada: ${activity.description}`;
    }

    return "Proposito pendiente de validar con el usuario.";
  },

  resolveValueAnalysis(activity, evidence) {
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const declared = vsm.valueClassification || (operational.classification && operational.classification.valueClassification) || "";
    const valueEvidence = evidence.filter((item) => item.category === "VALUE_CLASSIFICATION" || item.category === "PROCESS_MODEL");

    if (!declared) {
      return {
        classification: "PENDING",
        generatesCustomerValue: "EVIDENCE_INSUFFICIENT",
        reason: "No existe clasificacion VA/NNVA/NVA registrada. El consultor no asume valor agregado sin validacion.",
        evidence: [],
        confidence: "INSUFFICIENT_INFORMATION"
      };
    }

    const reasons = {
      VA: "La actividad esta registrada como VA en los datos operativos o VSM; se considera generadora de valor mientras la evidencia de cliente lo confirme.",
      NNVA: "La actividad esta registrada como NNVA; parece necesaria bajo condiciones actuales aunque no agregue valor directo al cliente.",
      NVA: "La actividad esta registrada como NVA; requiere analisis de eliminacion o simplificacion con evidencia del desperdicio asociado."
    };

    return {
      classification: declared,
      generatesCustomerValue: declared === "VA" ? "YES" : declared === "NNVA" ? "INDIRECT_OR_REQUIRED" : "NO",
      reason: reasons[declared] || `Clasificacion registrada: ${declared}.`,
      evidence: valueEvidence,
      confidence: valueEvidence.length ? "HIGH_CONFIDENCE" : "MEDIUM_CONFIDENCE"
    };
  },

  evaluateWaste(waste, activity, evidence) {
    const signals = this.collectWasteSignals(waste.id, activity, evidence);
    const existence = this.resolveWasteExistence(signals, evidence, activity);
    const severity = existence === "EXISTS" ? this.resolveSeverity(signals) : "NONE";
    const confidence = this.resolveWasteConfidence(existence, signals);

    return {
      wasteId: waste.id,
      wasteName: waste.label,
      existence,
      detected: existence === "EXISTS",
      severity,
      impact: this.resolveImpact(waste.id, existence, signals),
      evidence: signals,
      confidence,
      rootCause: this.resolveRootCause(waste.id, existence, signals),
      rationale: this.buildWasteRationale(waste.label, existence, signals)
    };
  },

  collectWasteSignals(wasteId, activity, evidence) {
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const text = this.normalizeText([
      activity.name,
      activity.description,
      operational.waits && operational.waits.reason,
      operational.risks && operational.risks.operationalRisks,
      operational.risks && operational.risks.frequentErrors,
      operational.risks && operational.risks.rework,
      operational.volume && operational.volume.variability,
      evidence.map((item) => item.fragment).join(" ")
    ].filter(Boolean).join(" "));
    const waitTime = Number(vsm.waitTime || (operational.waits && operational.waits.waitTime)) || 0;
    const valueClass = vsm.valueClassification || (operational.classification && operational.classification.valueClassification);
    const signals = [];
    const addSignal = (condition, evidenceId, fragment, strength) => {
      if (condition) {
        signals.push({
          evidenceId,
          sourceType: "LEAN_SIGNAL",
          fragment,
          strength: strength || "MEDIUM"
        });
      }
    };

    if (wasteId === "WAITING") {
      addSignal(waitTime > 0, "VSM-WAIT", `Tiempo de espera registrado: ${waitTime}.`, waitTime > 60 ? "HIGH" : "MEDIUM");
      addSignal(this.containsAny(text, ["espera", "demora", "cola", "pendiente", "bloqueado"]), "TEXT-WAIT", "Evidencia menciona espera, demora, cola o bloqueo.", "MEDIUM");
    }

    if (wasteId === "DEFECTS_REWORK") {
      addSignal(this.containsAny(text, ["retrabajo", "reproceso", "corregir", "devolver", "error", "falla", "defecto"]), "TEXT-REWORK", "Evidencia menciona error, defecto, devolucion o retrabajo.", "HIGH");
    }

    if (wasteId === "OVERPROCESSING") {
      addSignal(valueClass === "NVA" || valueClass === "NNVA", "VALUE-CLASS", `Actividad clasificada como ${valueClass || "pendiente"}.`, valueClass === "NVA" ? "HIGH" : "MEDIUM");
      addSignal(this.containsAny(text, ["duplicado", "doble", "manual", "validacion adicional", "revisar nuevamente", "sobreproceso"]), "TEXT-OVERPROCESSING", "Evidencia menciona duplicidad, revision adicional o trabajo manual.", "MEDIUM");
    }

    if (wasteId === "TRANSPORT") {
      addSignal(this.containsAny(text, ["traslad", "transport", "enviar fisico", "mensajeria", "mover documento"]), "TEXT-TRANSPORT", "Evidencia menciona traslado fisico o transferencia innecesaria.", "MEDIUM");
    }

    if (wasteId === "INVENTORY") {
      addSignal(this.containsAny(text, ["inventario", "wip", "acumulado", "pendientes", "lote", "stock"]), "TEXT-INVENTORY", "Evidencia menciona acumulacion, lotes, WIP o pendientes.", "MEDIUM");
    }

    if (wasteId === "MOTION") {
      addSignal(this.containsAny(text, ["buscar", "copiar", "pegar", "capturar varias veces", "moverse", "recorrer"]), "TEXT-MOTION", "Evidencia menciona busqueda, captura repetida o movimientos administrativos.", "MEDIUM");
    }

    if (wasteId === "OVERPRODUCTION") {
      addSignal(this.containsAny(text, ["antes de tiempo", "sin solicitud", "exceso", "mas de lo requerido", "sobreproduccion"]), "TEXT-OVERPRODUCTION", "Evidencia menciona produccion anticipada o exceso.", "MEDIUM");
    }

    if (wasteId === "UNUSED_TALENT") {
      addSignal(this.containsAny(text, ["talento", "criterio experto", "aprobacion innecesaria", "manual repetitivo", "persona calificada"]), "TEXT-TALENT", "Evidencia sugiere talento usado en tareas repetitivas o de bajo valor.", "MEDIUM");
    }

    return signals;
  },

  resolveWasteExistence(signals, evidence, activity) {
    if (signals.length) {
      return "EXISTS";
    }

    if (!evidence.length || !activity.operationalData) {
      return "INSUFFICIENT_EVIDENCE";
    }

    return "DOES_NOT_EXIST";
  },

  buildRootCauses(wastes, activity) {
    return wastes.filter((waste) => waste.existence === "EXISTS").map((waste) => ({
      wasteId: waste.wasteId,
      wasteName: waste.wasteName,
      probableCause: waste.rootCause,
      evidence: waste.evidence,
      confidence: waste.confidence,
      questionRequired: waste.rootCause === "Causa no determinable con la evidencia disponible."
    }));
  },

  resolveRootCause(wasteId, existence, signals) {
    if (existence !== "EXISTS" || !signals.length) {
      return "Causa no determinable con la evidencia disponible.";
    }

    const causes = {
      WAITING: "Reglas de priorizacion, aprobacion o disponibilidad de informacion posiblemente generan cola.",
      DEFECTS_REWORK: "Criterios de entrada, controles tempranos o calidad de datos posiblemente son insuficientes.",
      OVERPROCESSING: "Controles, capturas o validaciones duplicadas posiblemente permanecen por habito o falta de regla clara.",
      TRANSPORT: "El flujo posiblemente depende de transferencia fisica o traspasos no integrados.",
      INVENTORY: "El proceso posiblemente trabaja por lotes o acumula pendientes por desbalance de capacidad.",
      MOTION: "La informacion posiblemente esta dispersa y obliga a busquedas o capturas repetidas.",
      OVERPRODUCTION: "La actividad posiblemente se ejecuta antes de demanda real o sin criterio de solicitud.",
      UNUSED_TALENT: "Personas calificadas posiblemente ejecutan tareas repetitivas o administrativas de bajo valor."
    };

    return causes[wasteId] || "Causa probable pendiente de validar.";
  },

  buildQuickWins(assessments) {
    return assessments.flatMap((assessment) => assessment.wastes.filter((waste) => waste.existence === "EXISTS" && waste.severity !== "LOW").map((waste) => this.quickWin(assessment, waste))).slice(0, 16);
  },

  quickWin(assessment, waste) {
    const actions = {
      WAITING: "Definir regla de priorizacion, responsable de escalamiento y SLA visual.",
      DEFECTS_REWORK: "Crear checklist de calidad en el punto de entrada y criterio de rechazo claro.",
      OVERPROCESSING: "Eliminar o fusionar revisiones/capturas duplicadas con un unico punto de control.",
      TRANSPORT: "Sustituir traslado o transferencia manual por entrega digital controlada.",
      INVENTORY: "Reducir lotes y establecer limite visible de pendientes.",
      MOTION: "Consolidar informacion de consulta frecuente en una unica vista o plantilla.",
      OVERPRODUCTION: "Ejecutar la actividad solo con disparador validado de demanda.",
      UNUSED_TALENT: "Separar trabajo experto de tareas repetitivas mediante estandarizacion."
    };

    return {
      quickWinId: `QW-${assessment.activityUUID}-${waste.wasteId}`,
      activityUUID: assessment.activityUUID,
      activityName: assessment.activityName,
      problem: waste.rationale,
      proposedAction: actions[waste.wasteId] || "Estandarizar la forma de trabajo con evidencia disponible.",
      expectedBenefit: this.expectedBenefit(waste.wasteId),
      estimatedEffort: "BAJO",
      risks: "Riesgo de adopcion si no se valida con el responsable del proceso.",
      evidence: waste.evidence,
      confidence: waste.confidence
    };
  },

  buildLeanOpportunities(assessments) {
    return assessments.flatMap((assessment) => assessment.wastes.filter((waste) => waste.existence === "EXISTS").map((waste) => ({
      opportunityId: `LOP-${assessment.activityUUID}-${waste.wasteId}`,
      activityUUID: assessment.activityUUID,
      activityName: assessment.activityName,
      category: this.opportunityTypes[waste.wasteId] || "Simplificacion",
      wasteType: waste.wasteName,
      description: this.opportunityDescription(waste.wasteId, assessment.activityName),
      justification: waste.rationale,
      evidence: waste.evidence,
      expectedImpact: this.expectedBenefit(waste.wasteId),
      complexity: waste.severity === "ALTA" ? "MEDIA" : "BAJA",
      dependencies: this.resolveDependencies(waste.wasteId),
      confidence: waste.confidence,
      status: "DRAFT"
    }))).slice(0, 32);
  },

  opportunityDescription(wasteId, activityName) {
    const descriptions = {
      WAITING: `Reducir esperas en "${activityName}" mediante reglas de flujo, priorizacion y escalamiento visual.`,
      DEFECTS_REWORK: `Reducir defectos y retrabajos en "${activityName}" con criterios de entrada y control de calidad temprano.`,
      OVERPROCESSING: `Simplificar "${activityName}" eliminando revisiones, capturas o validaciones que no agregan valor.`,
      TRANSPORT: `Reducir traslados y transferencias innecesarias asociadas a "${activityName}".`,
      INVENTORY: `Disminuir acumulacion de pendientes o lotes antes/despues de "${activityName}".`,
      MOTION: `Reducir busquedas, capturas repetidas y movimientos administrativos en "${activityName}".`,
      OVERPRODUCTION: `Alinear la ejecucion de "${activityName}" con demanda real y criterios de solicitud.`,
      UNUSED_TALENT: `Liberar capacidad experta en "${activityName}" reduciendo trabajo repetitivo o de bajo valor.`
    };

    return descriptions[wasteId] || `Mejorar "${activityName}" con enfoque Lean.`;
  },

  resolveDependencies(wasteId) {
    const dependencies = {
      WAITING: ["Responsables de aprobacion", "SLA operativo"],
      DEFECTS_REWORK: ["Criterios de calidad", "Responsable de entrada"],
      OVERPROCESSING: ["Dueno del control", "Politica o regla de negocio"],
      TRANSPORT: ["Repositorio documental", "Canal digital"],
      INVENTORY: ["Capacidad operativa", "Regla de WIP"],
      MOTION: ["Disponibilidad de informacion", "Plantillas"],
      OVERPRODUCTION: ["Disparador de demanda", "Regla de liberacion"],
      UNUSED_TALENT: ["Roles", "Estandares de trabajo"]
    };

    return dependencies[wasteId] || ["Validacion del dueno del proceso"];
  },

  buildQuestions(packageData, sources) {
    const model = sources && sources.processState ? sources.processState.draftProcessModel : null;

    if (!model || !model.activities || !model.activities.length) {
      return [this.question("", "No existe Process Model disponible para diagnostico Lean.", "HIGH", true)];
    }

    if (!packageData || !packageData.activityAssessments) {
      return [this.question("", "Ejecuta el diagnostico Lean para generar preguntas basadas en evidencia.", "MEDIUM", false)];
    }

    return packageData.activityAssessments.flatMap((assessment) => assessment.questions || []).slice(0, 30);
  },

  buildActivityQuestions(activity, evidence, valueAnalysis, wastes, rootCauses) {
    const questions = [];

    if (valueAnalysis.classification === "PENDING") {
      questions.push(this.question(activity.activityUUID, `Clasifica "${activity.name}" como VA, NNVA o NVA y explica el criterio usado.`, "HIGH", true));
    }

    if (!activity.responsible) {
      questions.push(this.question(activity.activityUUID, `Quien ejecuta o es responsable de "${activity.name}"?`, "HIGH", true));
    }

    if (!activity.inputs || !activity.inputs.length) {
      questions.push(this.question(activity.activityUUID, `Que recibe "${activity.name}" para poder ejecutarse?`, "MEDIUM", false));
    }

    if (!activity.outputs || !activity.outputs.length) {
      questions.push(this.question(activity.activityUUID, `Que entrega "${activity.name}" al finalizar?`, "MEDIUM", false));
    }

    if (!evidence.length) {
      questions.push(this.question(activity.activityUUID, `Que documento, entrevista o dato respalda que "${activity.name}" ocurre asi?`, "HIGH", true));
    }

    rootCauses.filter((item) => item.questionRequired).forEach((item) => {
      questions.push(this.question(activity.activityUUID, `Que causa observable explica ${item.wasteName} en "${activity.name}"?`, "MEDIUM", false));
    });

    wastes.filter((waste) => waste.existence === "INSUFFICIENT_EVIDENCE").slice(0, 2).forEach((waste) => {
      questions.push(this.question(activity.activityUUID, `Existe evidencia de ${waste.wasteName} en "${activity.name}" o debe descartarse?`, "LOW", false));
    });

    return questions;
  },

  question(activityUUID, text, priority, blocksConsolidation) {
    if (window.ConsultingDecisionFramework) {
      return window.ConsultingDecisionFramework.createQuestion({
        activityUUID,
        question: text,
        priority,
        blocksConsolidation,
        reason: "Informacion requerida por el Consulting Decision Framework."
      });
    }

    return {
      questionId: `LQ-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      activityUUID,
      question: text,
      priority,
      blocksConsolidation,
      status: "OPEN"
    };
  },

  createPackageDecisionTrace(assessments, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    const evidence = assessments.flatMap((assessment) => assessment.evidence || []);

    return window.ConsultingDecisionFramework.createDecisionTrace({
      consultantId: "LEAN_TRANSFORMATION_CONSULTANT",
      subjectId: "LEAN_ASSESSMENT_PACKAGE",
      subjectType: "PACKAGE",
      subjectName: "Lean Assessment Package",
      evidence,
      questions,
      missingInformation: questions.filter((question) => question.blocksConsolidation).map((question) => question.question),
      stages: {
        UNDERSTAND: { output: "Actividades comprendidas desde Process Model, Operational Data y VSM." },
        VALIDATE: { output: "Evidencia consolidada por actividad." },
        DIAGNOSE: { output: "Desperdicios Lean evaluados por actividad." },
        QUANTIFY: { output: "Impacto cualitativo determinado con tiempos, esperas, frecuencia y riesgos disponibles." },
        PROPOSE: { output: "Quick Wins y oportunidades Lean vinculadas al diagnostico." },
        JUSTIFY: { output: "Propuestas justificadas con evidencia, supuestos y restricciones disponibles." },
        ESTIMATE: { output: "Esfuerzo, complejidad e impacto estimados cuando hubo evidencia suficiente." },
        WARN: { output: "Riesgos, dependencias e incertidumbre documentados." },
        ASK: { output: "Preguntas generadas para cerrar vacios de informacion." }
      }
    });
  },

  createActivityDecisionTrace(activity, evidence, valueAnalysis, wastes, questions) {
    if (!window.ConsultingDecisionFramework) {
      return null;
    }

    const detected = wastes.filter((waste) => waste.existence === "EXISTS");
    const missingInformation = questions.filter((question) => question.blocksConsolidation).map((question) => question.question);

    return window.ConsultingDecisionFramework.createDecisionTrace({
      consultantId: "LEAN_TRANSFORMATION_CONSULTANT",
      subjectId: activity.activityUUID,
      subjectType: "ACTIVITY",
      subjectName: activity.name,
      evidence,
      questions,
      missingInformation,
      stages: {
        UNDERSTAND: { output: activity.description || activity.name || "" },
        VALIDATE: { output: evidence.length ? "Evidencia disponible para la actividad." : "Evidencia insuficiente." },
        DIAGNOSE: { output: detected.length ? `Desperdicios con evidencia: ${detected.map((waste) => waste.wasteName).join(", ")}.` : "No se confirmaron desperdicios con evidencia suficiente." },
        QUANTIFY: { output: "Impacto determinado con datos operativos disponibles." },
        PROPOSE: { output: detected.length ? "Existen oportunidades potenciales vinculadas al diagnostico." : "No se proponen mejoras sin evidencia." },
        JUSTIFY: { output: valueAnalysis.reason },
        ESTIMATE: { output: "Estimacion limitada a esfuerzo, complejidad e impacto cualitativo disponibles." },
        WARN: { output: "Incertidumbre y dependencias quedan registradas en oportunidades y preguntas." },
        ASK: { output: questions.length ? "Existen preguntas abiertas." : "Sin preguntas abiertas." }
      }
    });
  },

  buildSummary(assessments, quickWins, opportunities, questions) {
    const wasteCounts = this.wastes.reduce((accumulator, waste) => {
      accumulator[waste.id] = assessments.filter((assessment) => assessment.wastes.some((item) => item.wasteId === waste.id && item.existence === "EXISTS")).length;
      return accumulator;
    }, {});

    return {
      totalActivities: assessments.length,
      vaActivities: assessments.filter((item) => item.valueAnalysis.classification === "VA").length,
      nnvaActivities: assessments.filter((item) => item.valueAnalysis.classification === "NNVA").length,
      nvaActivities: assessments.filter((item) => item.valueAnalysis.classification === "NVA").length,
      pendingClassification: assessments.filter((item) => item.valueAnalysis.classification === "PENDING").length,
      detectedWasteCount: assessments.reduce((total, item) => total + item.wastes.filter((waste) => waste.existence === "EXISTS").length, 0),
      insufficientEvidenceCount: assessments.reduce((total, item) => total + item.wastes.filter((waste) => waste.existence === "INSUFFICIENT_EVIDENCE").length, 0),
      quickWinCount: quickWins.length,
      opportunityCount: opportunities.length,
      pendingQuestionCount: questions.length,
      wasteCounts,
      averageConfidence: this.averageConfidence(assessments.map((item) => item.confidence))
    };
  },

  buildExecutiveSummary(summary, detectedWastes, questions) {
    if (!summary.totalActivities) {
      return "No existe informacion suficiente para generar un diagnostico Lean.";
    }

    return `Se analizaron ${summary.totalActivities} actividades. Se identificaron ${summary.detectedWasteCount} desperdicios con evidencia, ${summary.quickWinCount} quick wins y ${summary.opportunityCount} oportunidades Lean. Existen ${questions.length} preguntas pendientes que deben resolverse antes de consolidar recomendaciones de mayor impacto.`;
  },

  buildConsolidatedDiagnosis(assessments, summary) {
    const highWasteActivities = assessments.filter((assessment) => assessment.wastes.some((waste) => waste.existence === "EXISTS" && waste.severity === "HIGH"));

    return {
      valueProfile: `${summary.vaActivities} VA / ${summary.nnvaActivities} NNVA / ${summary.nvaActivities} NVA / ${summary.pendingClassification} pendientes.`,
      mainLeanFinding: highWasteActivities.length ? `Las actividades con mayor prioridad Lean son: ${highWasteActivities.map((item) => item.activityName).join(", ")}.` : "No se detectaron desperdicios de severidad alta con la evidencia disponible.",
      evidenceQuality: summary.averageConfidence,
      recommendationPolicy: summary.pendingQuestionCount ? "Resolver preguntas pendientes antes de consolidar recomendaciones." : "El paquete esta listo para revision humana."
    };
  },

  buildDetectedWasteIndex(assessments) {
    return assessments.flatMap((assessment) => assessment.wastes.filter((waste) => waste.existence === "EXISTS").map((waste) => ({
      activityUUID: assessment.activityUUID,
      activityName: assessment.activityName,
      wasteId: waste.wasteId,
      wasteName: waste.wasteName,
      severity: waste.severity,
      impact: waste.impact,
      evidence: waste.evidence,
      confidence: waste.confidence
    })));
  },

  buildEvidenceIndex(assessments) {
    const seen = {};
    return assessments.flatMap((assessment) => assessment.evidence).filter((item) => {
      if (seen[item.evidenceId]) {
        return false;
      }
      seen[item.evidenceId] = true;
      return true;
    });
  },

  collectActivityEvidence(activity, sources) {
    const evidence = [];
    const add = (category, sourceType, sourceName, fragment, confidence) => {
      if (!fragment) {
        return;
      }

      evidence.push({
        evidenceId: `LEV-${activity.activityUUID}-${evidence.length + 1}`,
        category,
        sourceType,
        sourceName,
        fragment: String(fragment).slice(0, 420),
        confidence: confidence || "MEDIUM_CONFIDENCE",
        date: new Date().toISOString()
      });
    };
    const operational = activity.operationalData || {};
    const vsm = activity.vsmData || {};
    const observations = this.activityObservations(activity.activityUUID, sources);

    add("PROCESS_MODEL", "PROCESS_MODEL", activity.name, activity.description || activity.name, activity.confidence || "LOW_CONFIDENCE");
    (activity.evidence || []).forEach((item) => add("PROCESS_EVIDENCE", item.sourceType || "EVIDENCE", item.sourceName || item.evidenceId, item.fragment || item.sourceName, item.confidence));
    add("VALUE_CLASSIFICATION", "VSM", "Intelligent VSM", vsm.valueClassification || (operational.classification && operational.classification.valueClassification), vsm.valueClassification ? "HIGH_CONFIDENCE" : "LOW_CONFIDENCE");
    add("TIME", "VSM", "Intelligent VSM", this.formatTimeEvidence(vsm, operational), "MEDIUM_CONFIDENCE");
    add("WAIT", "OPERATIONAL_DATA", "Process Data Collection", operational.waits && `${operational.waits.waitTime || ""} ${operational.waits.reason || ""}`.trim(), operational.waits && operational.waits.waitTime ? "MEDIUM_CONFIDENCE" : "LOW_CONFIDENCE");
    add("RISKS", "OPERATIONAL_DATA", "Process Data Collection", operational.risks && [operational.risks.operationalRisks, operational.risks.frequentErrors, operational.risks.rework].filter(Boolean).join(" | "), "MEDIUM_CONFIDENCE");
    observations.forEach((observation) => add("WORKSHOP_OBSERVATION", "TRANSFORMATION_OBSERVATION_PACKAGE", observation.type, `${observation.text} ${observation.evidenceNotes || ""}`.trim(), observation.confidence));

    return evidence;
  },

  formatTimeEvidence(vsm, operational) {
    const time = operational.time || {};
    const min = vsm.processTimeMin || time.min;
    const likely = vsm.processTimeLikely || time.likely;
    const max = vsm.processTimeMax || time.max;

    if (!min && !likely && !max) {
      return "";
    }

    return `Tiempo triangular min/probable/max: ${min || "NA"} / ${likely || "NA"} / ${max || "NA"}.`;
  },

  activityObservations(activityUUID, sources) {
    const packageData = sources.transformationObservationPackage;
    return packageData && packageData.observations ? packageData.observations.filter((item) => item.activityUUID === activityUUID) : [];
  },

  resolveSourcePackages(sources) {
    return {
      businessKnowledgePackageId: sources.businessKnowledgePackage ? sources.businessKnowledgePackage.businessKnowledgePackageId : "",
      processModelId: sources.processState.draftProcessModel ? sources.processState.draftProcessModel.processModelId : "",
      knowledgePackageId: sources.knowledgePackage ? sources.knowledgePackage.knowledgePackageId : "",
      contextGraphId: sources.contextGraph ? sources.contextGraph.contextGraphId : "",
      transformationObservationPackageId: sources.transformationObservationPackage ? sources.transformationObservationPackage.transformationObservationPackageId : "",
      requirementsPackageId: sources.requirementsPackage ? sources.requirementsPackage.requirementsPackageId : "",
      vsmAvailable: Boolean(sources.vsmState && sources.vsmState.metrics),
      operationalDataAvailable: Boolean(sources.operationalDataState && sources.operationalDataState.readiness)
    };
  },

  resolveActivityConfidence(evidence, valueAnalysis, wastes, questions) {
    if (questions.some((question) => question.blocksConsolidation)) {
      return "INSUFFICIENT_INFORMATION";
    }

    const scores = evidence.map((item) => this.confidenceScore(item.confidence));
    scores.push(this.confidenceScore(valueAnalysis.confidence));
    wastes.forEach((waste) => scores.push(this.confidenceScore(waste.confidence)));

    return this.scoreToConfidence(scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : 0);
  },

  resolveSeverity(signals) {
    if (!signals.length) {
      return "NONE";
    }

    if (signals.some((signal) => signal.strength === "HIGH") || signals.length >= 3) {
      return "ALTA";
    }

    if (signals.length >= 2) {
      return "MEDIA";
    }

    return "BAJA";
  },

  resolveWasteConfidence(existence, signals) {
    if (existence === "DOES_NOT_EXIST") {
      return "MEDIUM_CONFIDENCE";
    }

    if (existence === "INSUFFICIENT_EVIDENCE") {
      return "INSUFFICIENT_INFORMATION";
    }

    if (signals.some((signal) => signal.strength === "HIGH") || signals.length >= 2) {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  resolveImpact(wasteId, existence) {
    if (existence !== "EXISTS") {
      return "Sin impacto comprobado por falta de evidencia.";
    }

    return this.expectedBenefit(wasteId);
  },

  expectedBenefit(wasteId) {
    const benefits = {
      WAITING: "Reduccion de lead time y mejor cumplimiento de SLA.",
      DEFECTS_REWORK: "Menos retrabajo, menos errores y mayor calidad de salida.",
      OVERPROCESSING: "Menor tiempo de proceso y menor carga operativa.",
      TRANSPORT: "Menos transferencias y menor riesgo de perdida de informacion.",
      INVENTORY: "Menos WIP, menor acumulacion y mejor flujo.",
      MOTION: "Menor esfuerzo administrativo y menor tiempo improductivo.",
      OVERPRODUCTION: "Menos trabajo no solicitado y mejor alineacion con demanda.",
      UNUSED_TALENT: "Mejor uso de capacidad experta."
    };

    return benefits[wasteId] || "Mejora operacional esperada.";
  },

  buildWasteRationale(label, existence, signals) {
    if (existence === "EXISTS") {
      return `${label} existe con ${signals.length} senal(es) de evidencia: ${signals.map((signal) => signal.fragment).join(" | ")}`;
    }

    if (existence === "DOES_NOT_EXIST") {
      return `${label} no se evidencia en los datos disponibles.`;
    }

    return `Evidencia insuficiente para confirmar o descartar ${label}.`;
  },

  averageConfidence(confidences) {
    if (!confidences.length) {
      return "INSUFFICIENT_INFORMATION";
    }

    const average = confidences.reduce((total, confidence) => total + this.confidenceScore(confidence), 0) / confidences.length;
    return this.scoreToConfidence(average);
  },

  scoreToConfidence(score) {
    if (score >= 82) {
      return "HIGH_CONFIDENCE";
    }

    if (score >= 60) {
      return "MEDIUM_CONFIDENCE";
    }

    if (score >= 35) {
      return "LOW_CONFIDENCE";
    }

    return "INSUFFICIENT_INFORMATION";
  },

  confidenceScore(confidence) {
    const scores = {
      HIGH_CONFIDENCE: 95,
      MEDIUM_CONFIDENCE: 72,
      LOW_CONFIDENCE: 42,
      INSUFFICIENT_INFORMATION: 12
    };

    return scores[confidence] || 40;
  },

  syncToKnowledgePackage(state) {
    if (!window.ContextBuilderService || !state.assessmentPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result) {
      contextState.result = window.ContextBuilderService.buildLocalResult(window.ContextBuilderService.buildAgentContext(contextState));
    }

    contextState.result.knowledgePackage.leanAssessmentPackage = state.assessmentPackage;
    window.ContextBuilderService.saveState(contextState);
  },

  syncToContextGraph(state) {
    if (!window.ContextBuilderService || !state.assessmentPackage) {
      return;
    }

    const contextState = window.ContextBuilderService.loadState();

    if (!contextState.result || !contextState.result.knowledgePackage) {
      return;
    }

    const graph = window.ContextBuilderService.buildContextGraph(contextState.result.knowledgePackage);
    state.assessmentPackage.activityAssessments.forEach((assessment) => {
      const nodeId = assessment.leanActivityAssessmentId;
      graph.nodes.push({
        id: nodeId,
        type: "LEAN_ASSESSMENT",
        label: `${assessment.activityName} / ${assessment.valueAnalysis.classification}`
      });
      graph.edges.push({ from: assessment.activityUUID, to: nodeId, type: "HAS_LEAN_ASSESSMENT" });
    });
    contextState.result.contextGraph = graph;
    window.ContextBuilderService.saveState(contextState);
  },

  addChat(state, author, text) {
    state.chat.push({
      messageId: `LEAN-${Date.now()}-${author}`,
      author,
      text,
      createdAt: new Date().toISOString()
    });
  },

  firstActivityUuid(processState) {
    const activities = processState.draftProcessModel && processState.draftProcessModel.activities ? processState.draftProcessModel.activities : [];
    return activities[0] ? activities[0].activityUUID : "";
  },

  normalizeText(value) {
    return String(value || "").toLowerCase();
  },

  containsAny(text, keywords) {
    return keywords.some((keyword) => String(text || "").indexOf(keyword) !== -1);
  }
});
