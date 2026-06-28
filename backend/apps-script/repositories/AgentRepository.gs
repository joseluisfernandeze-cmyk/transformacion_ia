function AgentRepository_findActiveById(agentId) {
  var agent = SheetRepository_findOneBy("AGENTS", "agentId", agentId);
  return agent && String(agent.isActive).toUpperCase() === "TRUE" ? agent : null;
}

