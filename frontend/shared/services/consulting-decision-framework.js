window.ConsultingDecisionFramework = Object.freeze({
  frameworkId: "CONSULTING_DECISION_FRAMEWORK",
  version: "1.0.0",

  stages: [
    {
      id: "UNDERSTAND",
      sequence: 1,
      name: "Comprender",
      objective: "Entender que ocurre realmente sin emitir conclusiones."
    },
    {
      id: "VALIDATE",
      sequence: 2,
      name: "Validar",
      objective: "Confirmar que existe evidencia suficiente para continuar."
    },
    {
      id: "DIAGNOSE",
      sequence: 3,
      name: "Diagnosticar",
      objective: "Identificar el problema observado sin proponer soluciones."
    },
    {
      id: "QUANTIFY",
      sequence: 4,
      name: "Cuantificar",
      objective: "Determinar impacto con datos de tiempo, costo, frecuencia, volumen o riesgo."
    },
    {
      id: "PROPOSE",
      sequence: 5,
      name: "Proponer",
      objective: "Generar alternativas vinculadas al diagnostico."
    },
    {
      id: "JUSTIFY",
      sequence: 6,
      name: "Justificar",
      objective: "Explicar evidencia, razonamiento, supuestos y restricciones."
    },
    {
      id: "ESTIMATE",
      sequence: 7,
      name: "Estimar",
      objective: "Estimar beneficio, esfuerzo, complejidad e impacto cuando sea posible."
    },
    {
      id: "WARN",
      sequence: 8,
      name: "Advertir",
      objective: "Identificar riesgos, dependencias, impactos colaterales e incertidumbre."
    },
    {
      id: "ASK",
      sequence: 9,
      name: "Preguntar",
      objective: "Generar preguntas especificas cuando exista cualquier vacio de informacion."
    }
  ],

  prohibitedAssumptions: [
    "PROCESS",
    "ACTIVITY",
    "RESPONSIBLE",
    "INDICATOR",
    "WASTE",
    "CONSTRAINT"
  ],

  createDecisionTrace(input) {
    const evidence = this.normalizeEvidenceList(input.evidence);
    const missingInformation = input.missingInformation || [];
    const assumptions = input.assumptions || [];
    const questions = this.normalizeQuestions(input.questions || []);
    const evidenceAssessment = this.assessEvidence(evidence, missingInformation);
    const canConclude = evidenceAssessment.sufficient && !questions.some((question) => question.blocksConclusion);

    return {
      frameworkId: this.frameworkId,
      frameworkVersion: this.version,
      consultantId: input.consultantId || "",
      subjectId: input.subjectId || "",
      subjectType: input.subjectType || "",
      subjectName: input.subjectName || "",
      canConclude,
      conclusionPolicy: canConclude ? "CONCLUSION_ALLOWED" : "ASK_BEFORE_CONCLUSION",
      confidence: this.resolveConfidence(evidence, missingInformation, questions),
      stages: this.stages.map((stage) => this.buildStage(stage, input, evidenceAssessment, canConclude)),
      evidence,
      assumptions,
      missingInformation,
      questions,
      createdAt: new Date().toISOString()
    };
  },

  buildStage(stage, input, evidenceAssessment, canConclude) {
    const stageData = (input.stages && input.stages[stage.id]) || {};
    const blockedByEvidence = stage.sequence > 2 && !evidenceAssessment.sufficient;

    return {
      stageId: stage.id,
      sequence: stage.sequence,
      name: stage.name,
      objective: stage.objective,
      status: blockedByEvidence ? "BLOCKED_BY_INSUFFICIENT_EVIDENCE" : stageData.status || (canConclude || stage.sequence <= 2 ? "COMPLETED" : "REQUIRES_QUESTIONS"),
      output: stageData.output || "",
      evidenceRefs: stageData.evidenceRefs || [],
      limitations: blockedByEvidence ? evidenceAssessment.limitations : stageData.limitations || []
    };
  },

  assessEvidence(evidence, missingInformation) {
    const limitations = [];

    if (!evidence.length) {
      limitations.push("No existe evidencia registrada.");
    }

    if (missingInformation && missingInformation.length) {
      limitations.push(...missingInformation);
    }

    const strongEvidence = evidence.filter((item) => item.confidence === "HIGH_CONFIDENCE" || item.confidence === "MEDIUM_CONFIDENCE");

    return {
      sufficient: Boolean(strongEvidence.length && !limitations.length),
      evidenceCount: evidence.length,
      strongEvidenceCount: strongEvidence.length,
      limitations
    };
  },

  normalizeEvidenceList(evidence) {
    return (evidence || []).map((item, index) => this.normalizeEvidence(item, index));
  },

  normalizeEvidence(item, index) {
    return {
      evidenceId: item.evidenceId || `EVID-${Date.now()}-${index + 1}`,
      source: item.source || item.sourceName || "",
      sourceType: item.sourceType || "UNKNOWN",
      fragment: item.fragment || "",
      confidence: item.confidence || "LOW_CONFIDENCE",
      date: item.date || new Date().toISOString(),
      relatedObjectId: item.relatedObjectId || item.activityUUID || ""
    };
  },

  normalizeQuestions(questions) {
    return questions.map((question) => ({
      questionId: question.questionId || `Q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: question.text || question.question || "",
      reason: question.reason || "Informacion requerida para completar el razonamiento consultivo.",
      priority: question.priority || "MEDIUM",
      blocksConclusion: Boolean(question.blocksConclusion || question.blocksConsolidation),
      status: question.status || "OPEN",
      activityUUID: question.activityUUID || ""
    }));
  },

  createQuestion(input) {
    return {
      questionId: input.questionId || `Q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      activityUUID: input.activityUUID || "",
      question: input.question || input.text || "",
      reason: input.reason || "Informacion insuficiente para emitir conclusion definitiva.",
      priority: input.priority || "MEDIUM",
      blocksConsolidation: Boolean(input.blocksConclusion || input.blocksConsolidation),
      blocksConclusion: Boolean(input.blocksConclusion || input.blocksConsolidation),
      status: input.status || "OPEN"
    };
  },

  createConclusion(input) {
    const evidence = this.normalizeEvidenceList(input.evidence);
    const questions = this.normalizeQuestions(input.questions || []);
    const missingInformation = input.missingInformation || [];
    const canConclude = this.assessEvidence(evidence, missingInformation).sufficient && !questions.some((question) => question.blocksConclusion);

    return {
      conclusionId: input.conclusionId || `CON-${Date.now()}`,
      statement: canConclude ? input.statement || "" : "",
      status: canConclude ? "SUPPORTED" : "INSUFFICIENT_INFORMATION",
      evidence,
      confidence: this.resolveConfidence(evidence, missingInformation, questions),
      assumptions: input.assumptions || [],
      missingInformation,
      questions
    };
  },

  resolveConfidence(evidence, missingInformation, questions) {
    if ((missingInformation && missingInformation.length) || questions.some((question) => question.blocksConclusion)) {
      return "INSUFFICIENT_INFORMATION";
    }

    if (!evidence.length) {
      return "INSUFFICIENT_INFORMATION";
    }

    const scores = evidence.map((item) => this.confidenceScore(item.confidence));
    const average = scores.reduce((total, score) => total + score, 0) / scores.length;

    if (average >= 82) {
      return "HIGH_CONFIDENCE";
    }

    if (average >= 60) {
      return "MEDIUM_CONFIDENCE";
    }

    return "LOW_CONFIDENCE";
  },

  confidenceScore(confidence) {
    const scores = {
      HIGH_CONFIDENCE: 95,
      MEDIUM_CONFIDENCE: 72,
      LOW_CONFIDENCE: 42,
      INSUFFICIENT_INFORMATION: 12
    };

    return scores[confidence] || 40;
  }
});
