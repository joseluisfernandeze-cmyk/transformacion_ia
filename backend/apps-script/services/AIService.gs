function AIService_executeAgent(payload) {
  try {
    var errors = AIValidator_validateExecuteAgent(payload);

    if (errors.length) {
      return ApiResponse_validationError(errors);
    }

    var session = SessionService_require(payload.sessionId, ["ADMIN", "CONSULTOR"]);
    var agent = AgentRepository_findActiveById(payload.agentId);

    if (!agent) {
      return ApiResponse_error("AGENT_NOT_FOUND", "Agent was not found or is inactive.", "agentId");
    }

    var prompt = PromptRepository_findActiveById(agent.promptId);

    if (!prompt) {
      return ApiResponse_error("PROMPT_NOT_FOUND", "Prompt was not found or is inactive.", "promptId");
    }

    var provider = AIProviderRepository_findProviderForAgent(agent);

    if (!provider) {
      return ApiResponse_error("AI_PROVIDER_NOT_CONFIGURED", "No active AI provider is configured.", null);
    }

    var finalPrompt = AIService_buildPrompt(prompt.prompt, payload.context || {});
    var aiResult = AIProviderClient_execute(provider, finalPrompt);

    return ApiResponse_success({
      agentId: agent.agentId,
      provider: provider.providerCode,
      model: provider.model,
      result: aiResult
    }, "Agent execution completed.");
  } catch (error) {
    if (error && error.code) {
      return ApiResponse_error(error.code, error.message, null);
    }

    return ApiResponse_error("AI_PROVIDER_ERROR", "AI execution failed.", null);
  }
}

function AIService_executeResolvedAgent(agent, prompt, provider, context) {
  var finalPrompt = AIService_buildPrompt(prompt.prompt, context || {});
  var aiResult = AIProviderClient_execute(provider, finalPrompt);

  return {
    agentId: agent.agentId,
    provider: provider.providerCode,
    model: provider.model,
    result: aiResult
  };
}

function AIService_buildPrompt(promptTemplate, context) {
  return [
    promptTemplate,
    "",
    "Return only valid JSON.",
    "Context:",
    JSON.stringify(context || {})
  ].join("\n");
}
