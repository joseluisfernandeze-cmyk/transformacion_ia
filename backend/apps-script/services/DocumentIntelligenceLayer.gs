function DocumentIntelligenceLayer_buildNormalizedContext(context) {
  var normalizedDocuments = [];

  if (context.normalizedDocuments && context.normalizedDocuments.length) {
    normalizedDocuments = normalizedDocuments.concat(context.normalizedDocuments);
  }

  if (context.documentIds && context.documentIds.length) {
    normalizedDocuments = normalizedDocuments.concat(
      DocumentIntelligenceRepository_findByDocumentIds(context.documentIds)
    );
  }

  return {
    normalizedDocuments: normalizedDocuments,
    interviews: context.interviewNotes || [],
    notes: context.freeNotes || [],
    limitations: DocumentIntelligenceLayer_getLimitations(normalizedDocuments)
  };
}

function DocumentIntelligenceLayer_getLimitations(normalizedDocuments) {
  if (normalizedDocuments.length) {
    return [];
  }

  return [{
    code: "NO_NORMALIZED_DOCUMENTS",
    message: "No normalized documents were available. The agent used interviews and notes only."
  }];
}

