function ContextGraphRepository_save(graph) {
  SheetRepository_appendRecord("CONTEXT_GRAPHS", {
    contextGraphId: graph.contextGraphId,
    knowledgePackageId: graph.knowledgePackageId,
    projectId: graph.projectId,
    processModelId: graph.processModelId,
    version: graph.version,
    nodesJson: JSON.stringify(graph.nodes || []),
    edgesJson: JSON.stringify(graph.edges || []),
    createdAt: graph.createdAt,
    createdBy: graph.createdBy
  });
}

