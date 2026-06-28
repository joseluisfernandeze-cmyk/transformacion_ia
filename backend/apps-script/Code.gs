function doGet(e) {
  return ApiResponse_json({
    success: true,
    data: {
      app: "Process Transformation AI",
      status: "OK",
      supportedActions: getSupportedActions_()
    },
    message: "Backend is available.",
    errors: [],
    meta: ApiResponse_meta(null)
  });
}

function doPost(e) {
  try {
    var request = RequestParser_parsePost(e);
    var response = routeRequest_(request);
    return ApiResponse_json(response);
  } catch (error) {
    return ApiResponse_json(ApiResponse_error(
      "INTERNAL_ERROR",
      "The request could not be processed.",
      null,
      error && error.message
    ));
  }
}

function routeRequest_(request) {
  var action = request.action;

  if (!action) {
    return ApiResponse_error("VALIDATION_ERROR", "Action is required.", "action");
  }

  if (["login", "logout", "validateSession"].indexOf(action) !== -1) {
    return handleAuthRequest(request);
  }

  if (action === "executeAgent") {
    return handleAIRequest(request);
  }

  if (typeof VSM_ROUTE_ACTIONS !== "undefined" && VSM_ROUTE_ACTIONS.indexOf(action) !== -1) {
    return handleVsmRequest(request);
  }

  return ApiResponse_error("ROUTE_NOT_FOUND", action + " is not registered.", "action");
}

function getSupportedActions_() {
  return [
    "login",
    "logout",
    "validateSession",
    "executeAgent"
  ].concat(typeof VSM_ROUTE_ACTIONS !== "undefined" ? VSM_ROUTE_ACTIONS : []);
}

