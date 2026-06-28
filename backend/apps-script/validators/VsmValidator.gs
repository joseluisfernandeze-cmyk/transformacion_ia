function VsmValidator_validateMap(payload) {
  var errors = [];
  var supportedMapTypes = ["AS_IS", "TO_BE", "SIMULATION", "BASELINE"];

  if (!payload.processModelId) {
    errors.push({ code: "VALIDATION_ERROR", field: "processModelId", message: "processModelId is required." });
  }

  if (supportedMapTypes.indexOf(payload.mapType) === -1) {
    errors.push({ code: "VALIDATION_ERROR", field: "mapType", message: "mapType must be AS_IS, TO_BE, SIMULATION, or BASELINE." });
  }

  return errors;
}

function VsmValidator_validateActivityData(payload) {
  var errors = [];
  var supportedClassifications = ["VA", "NNVA", "NVA"];

  if (!payload.activityUUID) {
    errors.push({ code: "VALIDATION_ERROR", field: "activityUUID", message: "activityUUID is required." });
  }

  if (supportedClassifications.indexOf(payload.valueClassification) === -1) {
    errors.push({ code: "VALIDATION_ERROR", field: "valueClassification", message: "valueClassification must be VA, NNVA, or NVA." });
  }

  [
    "processTimeMin",
    "processTimeLikely",
    "processTimeMax",
    "waitTimeMin",
    "waitTimeLikely",
    "waitTimeMax",
    "queueTimeMin",
    "queueTimeLikely",
    "queueTimeMax"
  ].forEach(function(field) {
    if ((Number(payload[field]) || 0) < 0) {
      errors.push({ code: "VALIDATION_ERROR", field: field, message: field + " cannot be negative." });
    }
  });

  return errors;
}

