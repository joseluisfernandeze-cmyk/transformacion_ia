function DocumentIntelligenceRepository_findByDocumentIds(documentIds) {
  var ids = documentIds || [];

  return SheetRepository_getRecords("NORMALIZED_DOCUMENTS").filter(function(documentRecord) {
    return ids.indexOf(documentRecord.documentId) !== -1;
  });
}

