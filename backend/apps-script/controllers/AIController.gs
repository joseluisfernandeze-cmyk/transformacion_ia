function handleAIRequest(apiRequest) {
  if (apiRequest.action === "executeAgent") {
    return AgentOrchestrator_executeAgent(apiRequest.payload || {});
  }

  return ApiResponse_error("ROUTE_NOT_FOUND", apiRequest.action + " is not registered.", "action");
}
