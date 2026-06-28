function ContextGraphService_build(knowledgePackage) {
  var nodes = [];
  var edges = [];

  ContextGraphService_addCollection(nodes, knowledgePackage.identifiedProcesses, "PROCESS", "name");
  ContextGraphService_addCollection(nodes, knowledgePackage.identifiedActivities, "ACTIVITY", "name");
  ContextGraphService_addCollection(nodes, knowledgePackage.people, "PERSON", "name");
  ContextGraphService_addCollection(nodes, knowledgePackage.roles, "ROLE", "name");
  ContextGraphService_addCollection(nodes, knowledgePackage.documents, "DOCUMENT", "title");
  ContextGraphService_addCollection(nodes, knowledgePackage.systems, "SYSTEM", "name");
  ContextGraphService_addCollection(nodes, knowledgePackage.indicators, "INDICATOR", "name");
  ContextGraphService_addCollection(nodes, knowledgePackage.restrictions, "RESTRICTION", "description");
  ContextGraphService_addCollection(nodes, knowledgePackage.businessRules, "BUSINESS_RULE", "name");

  knowledgePackage.identifiedActivities.forEach(function(activity) {
    var activityNodeId = ContextGraphService_nodeId("ACTIVITY", activity.name);

    (activity.systems || []).forEach(function(system) {
      edges.push(ContextGraphService_edge(activityNodeId, ContextGraphService_nodeId("SYSTEM", system), "USES"));
    });

    if (activity.responsibleRole) {
      edges.push(ContextGraphService_edge(activityNodeId, ContextGraphService_nodeId("ROLE", activity.responsibleRole), "PERFORMED_BY"));
    }
  });

  return {
    contextGraphId: "CGR-" + Utilities.getUuid(),
    knowledgePackageId: knowledgePackage.knowledgePackageId,
    projectId: knowledgePackage.projectId,
    processModelId: knowledgePackage.processModelId,
    version: knowledgePackage.version,
    nodes: nodes,
    edges: edges,
    createdAt: new Date().toISOString(),
    createdBy: knowledgePackage.createdBy
  };
}

function ContextGraphService_addCollection(nodes, collection, type, labelField) {
  (collection || []).forEach(function(item) {
    var label = typeof item === "string" ? item : item[labelField];

    if (label) {
      nodes.push({
        nodeId: ContextGraphService_nodeId(type, label),
        type: type,
        label: label,
        data: item
      });
    }
  });
}

function ContextGraphService_nodeId(type, label) {
  return type + "::" + String(label || "").toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function ContextGraphService_edge(source, target, relation) {
  return {
    edgeId: "EDG-" + Utilities.getUuid(),
    source: source,
    target: target,
    relation: relation
  };
}
