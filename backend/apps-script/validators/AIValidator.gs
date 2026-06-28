function AIValidator_validateExecuteAgent(payload) {
  var errors = [];

  if (!payload.sessionId) {
    errors.push({ code: "VALIDATION_ERROR", field: "sessionId", message: "sessionId is required." });
  }

  if (!payload.agentId) {
    errors.push({ code: "VALIDATION_ERROR", field: "agentId", message: "agentId is required." });
  }

  if (payload.context && Object.prototype.toString.call(payload.context) !== "[object Object]") {
    errors.push({ code: "VALIDATION_ERROR", field: "context", message: "context must be a JSON object." });
  }

  return errors;
}

