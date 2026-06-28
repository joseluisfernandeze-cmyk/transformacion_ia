window.VsmBuilderValidator = Object.freeze({
  allowedMapTypes: ["AS_IS", "TO_BE", "SIMULATION", "BASELINE"],
  allowedClassifications: ["VA", "NNVA", "NVA"],

  validateMap(vsmMap) {
    const errors = [];

    if (!vsmMap.processModelId) {
      errors.push("processModelId is required.");
    }

    if (!this.allowedMapTypes.includes(vsmMap.mapType)) {
      errors.push("mapType must be AS_IS, TO_BE, SIMULATION, or BASELINE.");
    }

    return errors;
  },

  validateActivityData(activityData) {
    const errors = [];

    if (!activityData.activityUUID) {
      errors.push("activityUUID is required.");
    }

    if (!this.allowedClassifications.includes(activityData.valueClassification)) {
      errors.push("valueClassification must be VA, NNVA, or NVA.");
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
    ].forEach((field) => {
      if ((Number(activityData[field]) || 0) < 0) {
        errors.push(`${field} cannot be negative.`);
      }
    });

    return errors;
  }
});

