window.VsmBuilderState = Object.seal({
  processModel: null,
  vsmMap: null,
  selectedActivityUUID: null,
  saveStatus: "Saved",

  setProcessModel(processModel) {
    this.processModel = processModel;
  },

  setVsmMap(vsmMap) {
    this.vsmMap = vsmMap;
  },

  selectActivity(activityUUID) {
    this.selectedActivityUUID = activityUUID;
  },

  setSaveStatus(status) {
    this.saveStatus = status;
  },

  getActivities() {
    return this.processModel ? this.processModel.activities : [];
  },

  getVsmActivityData() {
    return this.vsmMap ? this.vsmMap.activityData : [];
  },

  getSelectedActivity() {
    return this.getActivities().find((activity) => activity.activityUUID === this.selectedActivityUUID);
  },

  getSelectedVsmData() {
    return this.getVsmActivityData().find((item) => item.activityUUID === this.selectedActivityUUID);
  }
});

