window.ProcessDiscoveryController = Object.seal({
  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.ProcessDiscoveryService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.ProcessDiscoveryRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    this.root.querySelector("#build-process-button").addEventListener("click", () => this.handleBuild());
    this.root.querySelector("#add-activity-button").addEventListener("click", () => this.handleAddActivity());
    this.root.querySelector("#logout-button").addEventListener("click", () => this.handleLogout());

    this.root.querySelectorAll("[data-activity-uuid]").forEach((node) => {
      if (node.classList.contains("process-node")) {
        node.addEventListener("click", (event) => this.handleSelectActivity(event));
      }
    });

    const saveButton = this.root.querySelector("#save-activity-button");
    const approveButton = this.root.querySelector("#approve-activity-button");
    const deleteButton = this.root.querySelector("#delete-activity-button");
    const questionForm = this.root.querySelector("#process-question-form");

    if (saveButton) {
      saveButton.addEventListener("click", (event) => this.handleSaveActivity(event));
    }

    if (approveButton) {
      approveButton.addEventListener("click", (event) => this.handleApproveActivity(event));
    }

    if (deleteButton) {
      deleteButton.addEventListener("click", (event) => this.handleDeleteActivity(event));
    }

    if (questionForm) {
      questionForm.addEventListener("submit", (event) => this.handleQuestion(event));
    }
  },

  handleBuild() {
    const result = window.ProcessDiscoveryService.buildDraftProcessModel();
    this.state.draftProcessModel = result.draftProcessModel;
    this.state.questions = result.questions;
    this.state.diagnostics = result.draftProcessModel.diagnostics;
    this.state.selectedActivityUUID = this.state.draftProcessModel.activities[0] ? this.state.draftProcessModel.activities[0].activityUUID : "";
    this.state.status = window.ProcessDiscoveryService.resolveStatus(this.state);
    window.ProcessDiscoveryService.addChat(this.state, "consultant", "Construí el Draft Process Model. Revisa actividades con baja confianza, responsables faltantes y evidencia antes de aprobar.");
    window.ProcessDiscoveryService.syncToKnowledgePackage(this.state);
    window.ProcessDiscoveryService.saveState(this.state);
    this.render();
  },

  handleSelectActivity(event) {
    this.state.selectedActivityUUID = event.currentTarget.getAttribute("data-activity-uuid");
    window.ProcessDiscoveryService.saveState(this.state);
    this.render();
  },

  handleSaveActivity(event) {
    const activityUUID = event.currentTarget.getAttribute("data-activity-uuid");
    window.ProcessDiscoveryService.updateActivity(this.state, activityUUID, {
      name: this.root.querySelector("#activity-name-input").value.trim(),
      responsible: this.root.querySelector("#activity-responsible-input").value.trim(),
      area: this.root.querySelector("#activity-area-input").value.trim(),
      description: this.root.querySelector("#activity-description-input").value.trim()
    });
    this.render();
  },

  handleApproveActivity(event) {
    const activityUUID = event.currentTarget.getAttribute("data-activity-uuid");
    window.ProcessDiscoveryService.approveActivity(this.state, activityUUID);
    this.render();
  },

  handleDeleteActivity(event) {
    const activityUUID = event.currentTarget.getAttribute("data-activity-uuid");
    window.ProcessDiscoveryService.deleteActivity(this.state, activityUUID);
    this.state.selectedActivityUUID = this.state.draftProcessModel.activities[0] ? this.state.draftProcessModel.activities[0].activityUUID : "";
    this.render();
  },

  handleAddActivity() {
    if (!this.state.draftProcessModel) {
      this.handleBuild();
    }

    window.ProcessDiscoveryService.addActivity(this.state, {
      name: "Nueva actividad pendiente de validar",
      description: "Actividad agregada manualmente por el usuario.",
      responsible: "",
      area: "",
      inputs: [],
      outputs: [],
      systems: [],
      documents: [],
      businessRules: [],
      decisions: [],
      dependencies: []
    });
    this.state.selectedActivityUUID = this.state.draftProcessModel.activities[this.state.draftProcessModel.activities.length - 1].activityUUID;
    this.render();
  },

  handleQuestion(event) {
    event.preventDefault();
    const message = event.currentTarget.querySelector("[name='questionAnswer']").value.trim();

    if (!message) {
      return;
    }

    window.ProcessDiscoveryService.answerQuestion(this.state, message);
    this.render();
  },

  async handleLogout() {
    if (this.session && this.session.sessionId && window.APP_CONFIG.apiBaseUrl) {
      await window.AiSecurityService.logout(this.session.sessionId);
    }

    window.AiSecurityService.clearSession();
    window.location.reload();
  }
});
