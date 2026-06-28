function AgentRegistryService_getAgent(agentId) {
  var registered = AgentRepository_findActiveById(agentId);

  if (registered) {
    return registered;
  }

  if (agentId === "CONTEXT_BUILDER") {
    return AgentRegistryService_contextBuilderDefinition();
  }

  return null;
}

function AgentRegistryService_contextBuilderDefinition() {
  return {
    agentId: "CONTEXT_BUILDER",
    name: "Context Builder Agent",
    description: "Builds reusable Knowledge Packages and Context Graphs from normalized project knowledge.",
    solutionType: "CORE",
    promptId: "PROMPT_CONTEXT_BUILDER_AGENT",
    providerId: "",
    autonomyLevel: "LEVEL_2_RECOMMEND",
    allowedRoles: "ADMIN,CONSULTOR",
    requiredTools: "DOCUMENT_INTELLIGENCE_LAYER,PROCESS_ENGINE,AI_SERVICE,PROMPT_REPOSITORY",
    isActive: "TRUE"
  };
}

