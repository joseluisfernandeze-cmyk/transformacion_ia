var VSM_SHEETS = {
  maps: "VsmMaps",
  activityData: "VsmActivityData",
  metrics: "VsmMetrics"
};

function VsmRepository_createMap(payload) {
  return VsmRepository_notConnected("createVsmMap", payload);
}

function VsmRepository_getMap(vsmMapId) {
  return VsmRepository_notConnected("getVsmMap", { vsmMapId: vsmMapId });
}

function VsmRepository_updateActivityData(payload) {
  return VsmRepository_notConnected("updateVsmActivityData", payload);
}

function VsmRepository_saveMetrics(vsmMapId, metrics) {
  return VsmRepository_notConnected("calculateVsmMetrics", {
    vsmMapId: vsmMapId,
    metrics: metrics
  });
}

function VsmRepository_getMetrics(vsmMapId) {
  return VsmRepository_notConnected("getVsmMetrics", { vsmMapId: vsmMapId });
}

function VsmRepository_notConnected(action, payload) {
  return {
    success: true,
    data: {
      action: action,
      payload: payload,
      sheets: VSM_SHEETS,
      integrationStatus: "Prepared for Google Sheets repository integration."
    },
    message: "VSM backend contract is prepared. Google Sheets write/read is enabled by the repository implementation in a future deployment step.",
    errors: [],
    meta: {
      module: "vsm-builder"
    }
  };
}

