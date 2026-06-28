function VsmService_createVsmMap(payload) {
  var errors = VsmValidator_validateMap(payload);

  if (errors.length) {
    return VsmService_error("VSM validation failed.", errors);
  }

  return VsmRepository_createMap(payload);
}

function VsmService_getVsmMap(payload) {
  if (!payload.vsmMapId) {
    return VsmService_error("vsmMapId is required.", [
      { code: "VALIDATION_ERROR", field: "vsmMapId", message: "vsmMapId is required." }
    ]);
  }

  return VsmRepository_getMap(payload.vsmMapId);
}

function VsmService_updateVsmActivityData(payload) {
  var errors = VsmValidator_validateActivityData(payload);

  if (errors.length) {
    return VsmService_error("VSM activity data validation failed.", errors);
  }

  return VsmRepository_updateActivityData(payload);
}

function VsmService_calculateVsmMetrics(payload) {
  if (!payload.vsmMapId) {
    return VsmService_error("vsmMapId is required.", [
      { code: "VALIDATION_ERROR", field: "vsmMapId", message: "vsmMapId is required." }
    ]);
  }

  return VsmRepository_saveMetrics(payload.vsmMapId, payload.metrics || {});
}

function VsmService_getVsmMetrics(payload) {
  if (!payload.vsmMapId) {
    return VsmService_error("vsmMapId is required.", [
      { code: "VALIDATION_ERROR", field: "vsmMapId", message: "vsmMapId is required." }
    ]);
  }

  return VsmRepository_getMetrics(payload.vsmMapId);
}

function VsmService_error(message, errors) {
  return {
    success: false,
    data: null,
    message: message,
    errors: errors,
    meta: {}
  };
}

