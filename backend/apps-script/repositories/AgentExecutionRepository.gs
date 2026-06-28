function AgentExecutionRepository_start(agentId, session, input) {
  var execution = {
    agentExecutionId: "AEX-" + Utilities.getUuid(),
    agentId: agentId,
    projectId: input.projectId || "",
    processModelId: input.processModelId || "",
    status: "RUNNING",
    startedAt: new Date().toISOString(),
    completedAt: "",
    requestedBy: session.userId,
    inputJson: JSON.stringify(input || {}),
    outputJson: "",
    errorJson: ""
  };

  SheetRepository_appendRecord("AGENT_EXECUTIONS", execution);
  return execution;
}

function AgentExecutionRepository_complete(agentExecutionId, output) {
  SheetRepository_updateById("AGENT_EXECUTIONS", "agentExecutionId", agentExecutionId, {
    status: "COMPLETED",
    completedAt: new Date().toISOString(),
    outputJson: JSON.stringify(output || {})
  });
}

function AgentExecutionRepository_fail(agentExecutionId, errors) {
  SheetRepository_updateById("AGENT_EXECUTIONS", "agentExecutionId", agentExecutionId, {
    status: "FAILED",
    completedAt: new Date().toISOString(),
    errorJson: JSON.stringify(errors || [])
  });
}

