window.VsmBuilderService = Object.freeze({
  storageKey: "process-transformation-ai.pb08.vsm-map",

  loadProcessModel() {
    return {
      processModelId: "PM-000001",
      initiativeId: "INI-000001",
      processId: "PRO-000001",
      modelType: "AS_IS",
      name: "Customer onboarding process",
      activities: [
        {
          activityId: "ACT-000001",
          activityUUID: "act-uuid-001",
          sequenceNumber: 1,
          name: "Receive request",
          responsibleRole: "Sales assistant",
          systemUsed: "CRM"
        },
        {
          activityId: "ACT-000002",
          activityUUID: "act-uuid-002",
          sequenceNumber: 2,
          name: "Validate documentation",
          responsibleRole: "Operations analyst",
          systemUsed: "Document repository"
        },
        {
          activityId: "ACT-000003",
          activityUUID: "act-uuid-003",
          sequenceNumber: 3,
          name: "Approve onboarding",
          responsibleRole: "Operations lead",
          systemUsed: "Workflow tool"
        },
        {
          activityId: "ACT-000004",
          activityUUID: "act-uuid-004",
          sequenceNumber: 4,
          name: "Create customer account",
          responsibleRole: "Back office",
          systemUsed: "ERP"
        }
      ],
      connections: [
        { sourceActivityUUID: "act-uuid-001", targetActivityUUID: "act-uuid-002" },
        { sourceActivityUUID: "act-uuid-002", targetActivityUUID: "act-uuid-003" },
        { sourceActivityUUID: "act-uuid-003", targetActivityUUID: "act-uuid-004" }
      ]
    };
  },

  loadVsmMap(processModel) {
    const saved = window.localStorage.getItem(this.storageKey);

    if (saved) {
      return JSON.parse(saved);
    }

    return {
      vsmMapId: "VSM-000001",
      processModelId: processModel.processModelId,
      mapType: "AS_IS",
      name: `${processModel.name} VSM`,
      status: "DRAFT",
      activityData: processModel.activities.map((activity, index) => ({
        vsmActivityDataId: `VAD-${String(index + 1).padStart(6, "0")}`,
        vsmMapId: "VSM-000001",
        activityId: activity.activityId,
        activityUUID: activity.activityUUID,
        sequence: activity.sequenceNumber,
        lane: activity.responsibleRole,
        color: "#ffffff",
        collapsed: false,
        x: 32 + index * 268,
        y: 92,
        valueClassification: index === 2 ? "NNVA" : "VA",
        processTimeMin: 5,
        processTimeLikely: 10 + index * 2,
        processTimeMax: 18 + index * 3,
        waitTimeMin: 10,
        waitTimeLikely: 20 + index * 5,
        waitTimeMax: 40 + index * 8,
        queueTimeMin: 0,
        queueTimeLikely: 5 + index * 2,
        queueTimeMax: 10 + index * 4,
        frequency: 20,
        wip: index,
        timeUnit: "MIN",
        notes: ""
      }))
    };
  },

  saveVsmMap(vsmMap) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(vsmMap));

    return {
      success: true,
      data: vsmMap,
      message: "VSM map saved locally using the PB03-compatible contract.",
      errors: [],
      meta: {
        module: "vsm-builder",
        adapter: "localStorage"
      }
    };
  },

  buildApiRequest(action, payload) {
    return {
      action,
      payload,
      requestId: `REQ-${Date.now()}`,
      metadata: {
        source: "frontend",
        module: "vsm-builder"
      }
    };
  }
});

