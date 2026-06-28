function AgentOrchestrator_executeAgent(payload) {
  try {
    var errors = AIValidator_validateExecuteAgent(payload);

    if (errors.length) {
      return ApiResponse_validationError(errors);
    }

    var session = SessionService_require(payload.sessionId, ["ADMIN", "CONSULTOR"]);
    var agent = AgentRegistryService_getAgent(payload.agentId);

    if (!agent) {
      return ApiResponse_error("AGENT_NOT_FOUND", "Agent was not found or is inactive.", "agentId");
    }

    var execution = AgentExecutionRepository_start(agent.agentId, session, payload.context || {});

    if (agent.agentId === "CONTEXT_BUILDER") {
      return ContextBuilderAgent_execute(agent, payload.context || {}, session, execution);
    }

    return AgentOrchestrator_executeGenericAgent(agent, payload.context || {}, session, execution);
  } catch (error) {
    if (error && error.code) {
      return ApiResponse_error(error.code, error.message, null);
    }

    return ApiResponse_error("AGENT_EXECUTION_ERROR", "Agent execution failed.", null);
  }
}

function AgentOrchestrator_executeGenericAgent(agent, context, session, execution) {
  var prompt = PromptRepository_findActiveById(agent.promptId);
  var provider = AIProviderRepository_findProviderForAgent(agent);

  if (!prompt) {
    return ApiResponse_error("PROMPT_NOT_FOUND", "Prompt was not found or is inactive.", "promptId");
  }

  if (!provider) {
    return ApiResponse_error("AI_PROVIDER_NOT_CONFIGURED", "No active AI provider is configured.", null);
  }

  var result = AIService_executeResolvedAgent(agent, prompt, provider, context);
  AgentExecutionRepository_complete(execution.agentExecutionId, result);

  return ApiResponse_success({
    agentExecutionId: execution.agentExecutionId,
    agentId: agent.agentId,
    result: result.result
  }, "Agent execution completed.");
}

