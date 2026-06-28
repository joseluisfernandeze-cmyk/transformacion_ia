function handleAuthRequest(apiRequest) {
  var action = apiRequest.action;
  var payload = apiRequest.payload || {};

  if (action === "login") {
    return AuthService_login(payload);
  }

  if (action === "logout") {
    return AuthService_logout(payload);
  }

  if (action === "validateSession") {
    return AuthService_validateSession(payload);
  }

  return ApiResponse_error("ROUTE_NOT_FOUND", action + " is not registered.", "action");
}

