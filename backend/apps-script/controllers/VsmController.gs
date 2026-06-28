function handleVsmRequest(apiRequest) {
  var action = apiRequest.action;
  var payload = apiRequest.payload || {};

  if (action === "createVsmMap") {
    return VsmService_createVsmMap(payload);
  }

  if (action === "getVsmMap") {
    return VsmService_getVsmMap(payload);
  }

  if (action === "updateVsmActivityData") {
    return VsmService_updateVsmActivityData(payload);
  }

  if (action === "calculateVsmMetrics") {
    return VsmService_calculateVsmMetrics(payload);
  }

  if (action === "getVsmMetrics") {
    return VsmService_getVsmMetrics(payload);
  }

  return {
    success: false,
    data: null,
    message: "VSM action is not supported.",
    errors: [{ code: "ROUTE_NOT_FOUND", message: action + " is not registered." }],
    meta: {}
  };
}

