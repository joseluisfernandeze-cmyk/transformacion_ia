function KnowledgePackageRepository_save(knowledgePackage) {
  SheetRepository_appendRecord("KNOWLEDGE_PACKAGES", {
    knowledgePackageId: knowledgePackage.knowledgePackageId,
    version: knowledgePackage.version,
    projectId: knowledgePackage.projectId,
    processModelId: knowledgePackage.processModelId,
    agentExecutionId: knowledgePackage.agentExecutionId,
    objectiveJson: JSON.stringify(knowledgePackage.objective || {}),
    scopeJson: JSON.stringify(knowledgePackage.scope || {}),
    identifiedProcessesJson: JSON.stringify(knowledgePackage.identifiedProcesses || []),
    identifiedActivitiesJson: JSON.stringify(knowledgePackage.identifiedActivities || []),
    systemsJson: JSON.stringify(knowledgePackage.systems || []),
    peopleJson: JSON.stringify(knowledgePackage.people || []),
    rolesJson: JSON.stringify(knowledgePackage.roles || []),
    documentsJson: JSON.stringify(knowledgePackage.documents || []),
    indicatorsJson: JSON.stringify(knowledgePackage.indicators || []),
    restrictionsJson: JSON.stringify(knowledgePackage.restrictions || []),
    businessRulesJson: JSON.stringify(knowledgePackage.businessRules || []),
    contradictionsJson: JSON.stringify(knowledgePackage.contradictions || []),
    missingInformationJson: JSON.stringify(knowledgePackage.missingInformation || []),
    confidence: knowledgePackage.confidence,
    assumptionsJson: JSON.stringify(knowledgePackage.assumptions || []),
    sourceDocumentsJson: JSON.stringify(knowledgePackage.sourceDocuments || []),
    parentKnowledgePackage: knowledgePackage.parentKnowledgePackage || "",
    createdBy: knowledgePackage.createdBy,
    createdAt: knowledgePackage.createdAt
  });
}

function KnowledgePackageRepository_nextVersion(projectId, processModelId) {
  var packages = [];

  try {
    packages = SheetRepository_getRecords("KNOWLEDGE_PACKAGES").filter(function(item) {
      return item.projectId === projectId && String(item.processModelId || "") === String(processModelId || "");
    });
  } catch (error) {
    return 1;
  }

  return packages.length + 1;
}
