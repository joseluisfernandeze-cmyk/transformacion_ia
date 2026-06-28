function ContextBuilderAgent_execute(agent, context, session, execution) {
  var validationErrors = ContextBuilderValidator_validateInput(context);

  if (validationErrors.length) {
    AgentExecutionRepository_fail(execution.agentExecutionId, validationErrors);
    return ApiResponse_validationError(validationErrors);
  }

  var prompt = PromptRepository_findActiveById(agent.promptId) || ContextBuilderAgent_defaultPrompt();
  var provider = AIProviderRepository_findProviderForAgent(agent);
  var normalizedContext = ContextBuilderAgent_buildContext(context);
  var agentResult = null;

  if (provider) {
    agentResult = AIService_executeResolvedAgent(agent, prompt, provider, normalizedContext).result;
  } else {
    agentResult = ContextBuilderAgent_buildDeterministicResult(normalizedContext);
  }

  var knowledgePackage = ContextBuilderAgent_toKnowledgePackage(agentResult, context, session, execution);
  var graph = ContextGraphService_build(knowledgePackage);
  var outputErrors = ContextBuilderValidator_validateKnowledgePackage(knowledgePackage);

  if (outputErrors.length) {
    AgentExecutionRepository_fail(execution.agentExecutionId, outputErrors);
    return ApiResponse_validationError(outputErrors);
  }

  KnowledgePackageRepository_save(knowledgePackage);
  ContextGraphRepository_save(graph);
  AgentExecutionRepository_complete(execution.agentExecutionId, {
    knowledgePackage: knowledgePackage,
    contextGraph: graph
  });

  return ApiResponse_success({
    agentExecutionId: execution.agentExecutionId,
    agentId: agent.agentId,
    knowledgePackage: knowledgePackage,
    contextGraph: graph
  }, "Context Builder Agent completed.");
}

function ContextBuilderAgent_buildContext(context) {
  return {
    projectId: context.projectId,
    processModelId: context.processModelId || "",
    selectedActivityUUID: context.selectedActivityUUID || "",
    scope: context.scope || "project",
    project: context.project || {},
    documentIntelligence: DocumentIntelligenceLayer_buildNormalizedContext(context),
    processModel: context.processModel || {},
    expectedOutput: ContextBuilderAgent_expectedOutputSchema()
  };
}

function ContextBuilderAgent_toKnowledgePackage(aiResult, context, session, execution) {
  var packageVersion = KnowledgePackageRepository_nextVersion(context.projectId, context.processModelId || "");

  return {
    knowledgePackageId: "KPK-" + Utilities.getUuid(),
    version: packageVersion,
    projectId: context.projectId,
    processModelId: context.processModelId || "",
    agentExecutionId: execution.agentExecutionId,
    objective: aiResult.objective || {},
    scope: aiResult.scope || {},
    identifiedProcesses: aiResult.identifiedProcesses || [],
    identifiedActivities: aiResult.identifiedActivities || [],
    systems: aiResult.systems || [],
    people: aiResult.people || [],
    roles: aiResult.roles || [],
    documents: aiResult.documents || [],
    indicators: aiResult.indicators || [],
    restrictions: aiResult.restrictions || [],
    businessRules: aiResult.businessRules || [],
    contradictions: aiResult.contradictions || [],
    missingInformation: aiResult.missingInformation || [],
    confidence: aiResult.confidence || aiResult.confidenceLevel || "LOW",
    assumptions: aiResult.assumptions || [],
    sourceDocuments: ContextBuilderAgent_getSourceDocuments(context),
    parentKnowledgePackage: context.parentKnowledgePackage || "",
    createdBy: session.userId,
    createdAt: new Date().toISOString()
  };
}

function ContextBuilderAgent_getSourceDocuments(context) {
  var sourceDocuments = (context.documentIds || []).slice();

  (context.normalizedDocuments || []).forEach(function(documentItem) {
    var documentId = documentItem.documentId || documentItem.id || documentItem.name;

    if (documentId && sourceDocuments.indexOf(documentId) === -1) {
      sourceDocuments.push(documentId);
    }
  });

  return sourceDocuments;
}

function ContextBuilderAgent_defaultPrompt() {
  return {
    promptId: "PROMPT_CONTEXT_BUILDER_AGENT",
    prompt: [
      "You are the Context Builder Agent for an operational intelligence platform.",
      "Use only normalized documents, notes, interviews, and process model context.",
      "Do not perform Lean analysis, TOC analysis, VSM creation, To-Be design, or business case work.",
      "Build a structured Knowledge Package and return only valid JSON matching the expected schema.",
      "Include missing information, contradictions, evidence, and confidence."
    ].join("\n"),
    isActive: "TRUE"
  };
}

function ContextBuilderAgent_expectedOutputSchema() {
  return {
    objective: {},
    scope: {},
    identifiedProcesses: [],
    identifiedActivities: [],
    systems: [],
    people: [],
    roles: [],
    documents: [],
    indicators: [],
    restrictions: [],
    businessRules: [],
    contradictions: [],
    missingInformation: [],
    confidence: "LOW|MEDIUM|HIGH",
    assumptions: []
  };
}

function ContextBuilderAgent_buildDeterministicResult(normalizedContext) {
  var project = normalizedContext.project || {};
  var textCorpus = ContextBuilderAgent_buildTextCorpus(normalizedContext);
  var sentences = ContextBuilderAgent_extractSentences(textCorpus);
  var activities = ContextBuilderAgent_extractActivities(sentences);
  var missingInformation = ContextBuilderAgent_buildMissingInformation(project, normalizedContext, activities);

  return {
    objective: {
      description: project.objective || ContextBuilderAgent_firstOrDefault(sentences, "Objective pending validation.")
    },
    scope: {
      description: project.scope || "Scope pending validation.",
      area: project.area || "",
      process: project.process || "Identified process pending validation."
    },
    identifiedProcesses: [{
      processId: "PROC-" + Utilities.getUuid(),
      name: project.process || "Identified process pending validation.",
      objective: project.objective || "",
      confidence: project.process ? "HIGH_CONFIDENCE" : "LOW_CONFIDENCE",
      evidenceRefs: ["PROJECT_BASIC_INFO"]
    }],
    identifiedActivities: activities,
    systems: ContextBuilderAgent_extractKeywordSentences(sentences, ["sistema", "aplicacion", "software", "erp", "crm"]).map(function(sentence, index) {
      return { id: "SYS-" + (index + 1), name: sentence, confidence: "LOW_CONFIDENCE" };
    }),
    people: ContextBuilderAgent_extractPeople(normalizedContext),
    roles: ContextBuilderAgent_extractRoles(normalizedContext),
    documents: normalizedContext.documentIntelligence.normalizedDocuments || [],
    indicators: ContextBuilderAgent_extractKeywordSentences(sentences, ["indicador", "kpi", "tiempo", "sla"]),
    restrictions: ContextBuilderAgent_extractKeywordSentences(sentences, ["restric", "bloque", "limit", "cuello", "demora"]),
    businessRules: ContextBuilderAgent_extractKeywordSentences(sentences, ["regla", "debe", "requiere", "obligatorio", "aprob"]),
    contradictions: ContextBuilderAgent_extractKeywordSentences(sentences, ["contradic", "conflict", "diferente", "inconsisten"]),
    missingInformation: missingInformation,
    confidence: activities.length && missingInformation.length <= 2 ? "MEDIUM" : "LOW",
    assumptions: ["AI provider not configured. Result created with deterministic MVP extraction rules."]
  };
}

function ContextBuilderAgent_buildTextCorpus(normalizedContext) {
  var documents = (normalizedContext.documentIntelligence.normalizedDocuments || []).map(function(documentItem) {
    return [documentItem.title, documentItem.normalizedText].filter(Boolean).join("\n");
  }).join("\n");
  var interviews = (normalizedContext.documentIntelligence.interviews || []).map(function(item) {
    return [item.person || "Interview", item.content || ""].join(": ");
  }).join("\n");
  var notes = (normalizedContext.documentIntelligence.notes || []).map(function(item) {
    return item.content || item;
  }).join("\n");

  return [documents, interviews, notes].filter(Boolean).join("\n");
}

function ContextBuilderAgent_extractSentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/[\.\!\?]\s+|\n+/)
    .map(function(sentence) { return sentence.trim(); })
    .filter(function(sentence) { return sentence.length > 8; })
    .slice(0, 80);
}

function ContextBuilderAgent_extractActivities(sentences) {
  var keywords = ["recibe", "valid", "revisa", "aprueba", "registra", "envia", "crea", "actualiza", "genera", "analiza", "solicita", "confirma"];

  return sentences.filter(function(sentence) {
    var normalized = sentence.toLowerCase();
    return keywords.some(function(keyword) { return normalized.indexOf(keyword) !== -1; });
  }).slice(0, 12).map(function(sentence, index) {
    return {
      activityId: "ACT-" + String(index + 1),
      activityUUID: "ACTUUID-" + Utilities.getUuid(),
      sequence: index + 1,
      name: sentence.length > 72 ? sentence.slice(0, 69) + "..." : sentence,
      description: sentence,
      responsible: "Pending confirmation",
      inputs: [],
      outputs: [],
      systems: [],
      documents: [],
      confidence: "MEDIUM_CONFIDENCE",
      evidenceRefs: ["SENTENCE-" + (index + 1)]
    };
  });
}

function ContextBuilderAgent_extractKeywordSentences(sentences, keywords) {
  return sentences.filter(function(sentence) {
    var normalized = sentence.toLowerCase();
    return keywords.some(function(keyword) { return normalized.indexOf(keyword) !== -1; });
  }).slice(0, 10);
}

function ContextBuilderAgent_extractPeople(normalizedContext) {
  return (normalizedContext.documentIntelligence.interviews || []).filter(function(item) {
    return item.person;
  }).map(function(item, index) {
    return {
      personId: "PER-" + (index + 1),
      name: item.person,
      role: item.role || "",
      confidence: "HIGH_CONFIDENCE",
      evidenceRefs: ["INTERVIEW-" + (index + 1)]
    };
  });
}

function ContextBuilderAgent_extractRoles(normalizedContext) {
  return (normalizedContext.documentIntelligence.interviews || []).filter(function(item) {
    return item.role;
  }).map(function(item, index) {
    return {
      roleId: "ROL-" + (index + 1),
      name: item.role,
      person: item.person || "",
      confidence: "HIGH_CONFIDENCE"
    };
  });
}

function ContextBuilderAgent_buildMissingInformation(project, normalizedContext, activities) {
  var missing = [];

  if (!project.objective) {
    missing.push("Objective was not registered.");
  }

  if (!project.scope) {
    missing.push("Scope was not registered.");
  }

  if (!activities.length) {
    missing.push("No activities were identified with the available evidence.");
  }

  if (!(normalizedContext.documentIntelligence.normalizedDocuments || []).some(function(item) { return item.normalizedText; })) {
    missing.push("No normalized document text is available.");
  }

  return missing;
}

function ContextBuilderAgent_firstOrDefault(items, fallback) {
  return items.length ? items[0] : fallback;
}
