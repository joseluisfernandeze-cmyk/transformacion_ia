function ContextBuilderValidator_validateInput(context) {
  var errors = [];

  if (!context.projectId) {
    errors.push({ code: "VALIDATION_ERROR", field: "projectId", message: "projectId is required." });
  }

  var hasSources = Boolean(
    (context.documentIds && context.documentIds.length) ||
    (context.normalizedDocuments && context.normalizedDocuments.length) ||
    (context.interviewNotes && context.interviewNotes.length) ||
    (context.freeNotes && context.freeNotes.length)
  );

  if (!hasSources) {
    errors.push({
      code: "VALIDATION_ERROR",
      field: "sources",
      message: "At least one normalized document, interview note, or free note is required."
    });
  }

  return errors;
}

function ContextBuilderValidator_validateKnowledgePackage(knowledgePackage) {
  var errors = [];

  if (!knowledgePackage.objective) {
    errors.push({ code: "AI_RESPONSE_INVALID", field: "objective", message: "objective is required." });
  }

  if (!knowledgePackage.scope) {
    errors.push({ code: "AI_RESPONSE_INVALID", field: "scope", message: "scope is required." });
  }

  if (["LOW", "MEDIUM", "HIGH"].indexOf(String(knowledgePackage.confidence || "").toUpperCase()) === -1) {
    errors.push({ code: "AI_RESPONSE_INVALID", field: "confidence", message: "confidence must be LOW, MEDIUM, or HIGH." });
  }

  return errors;
}

