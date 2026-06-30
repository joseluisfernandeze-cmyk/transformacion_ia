window.ProcessModelingStudioController = Object.seal({
  root: null,
  session: null,
  state: null,

  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.ProcessModelingStudioService.createState();
    window.ProcessModelingStudioService.ensureLayout(this.state);
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.ProcessModelingStudioRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    this.root.querySelector("#logout-button").addEventListener("click", () => this.handleLogout());
    this.root.querySelector("#studio-add-activity").addEventListener("click", () => this.handleAdd());

    const splitButton = this.root.querySelector("#studio-split-activity");
    const mergeButton = this.root.querySelector("#studio-merge-activity");
    const deleteButton = this.root.querySelector("#studio-delete-activity");
    const saveButton = this.root.querySelector("#studio-save-activity");
    const chatForm = this.root.querySelector("#studio-chat-form");

    if (splitButton) {
      splitButton.addEventListener("click", () => this.handleSplit());
    }

    if (mergeButton) {
      mergeButton.addEventListener("click", () => this.handleMerge());
    }

    if (deleteButton) {
      deleteButton.addEventListener("click", () => this.handleDelete());
    }

    if (saveButton) {
      saveButton.addEventListener("click", (event) => this.handleSaveActivity(event));
    }

    if (chatForm) {
      chatForm.addEventListener("submit", (event) => this.handleChat(event));
    }

    this.root.querySelectorAll(".studio-node").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelect(event));
      node.addEventListener("dragstart", (event) => this.handleDragStart(event));
    });

    const canvas = this.root.querySelector("#studio-canvas");

    if (canvas) {
      canvas.addEventListener("dragover", (event) => event.preventDefault());
      canvas.addEventListener("drop", (event) => this.handleDrop(event));
    }
  },

  handleSelect(event) {
    this.state.selectedActivityUUID = event.currentTarget.getAttribute("data-activity-uuid");
    window.ProcessDiscoveryService.saveState(this.state);
    this.render();
  },

  handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.currentTarget.getAttribute("data-activity-uuid"));
  },

  handleDrop(event) {
    event.preventDefault();
    const activityUUID = event.dataTransfer.getData("text/plain");
    const canvas = this.root.querySelector("#studio-canvas");
    const rect = canvas.getBoundingClientRect();
    window.ProcessModelingStudioService.moveActivity(
      this.state,
      activityUUID,
      event.clientX - rect.left + canvas.scrollLeft - 120,
      event.clientY - rect.top + canvas.scrollTop - 50
    );
    this.state.selectedActivityUUID = activityUUID;
    this.render();
  },

  handleSaveActivity(event) {
    const activityUUID = event.currentTarget.getAttribute("data-activity-uuid");
    window.ProcessModelingStudioService.updateActivity(this.state, activityUUID, {
      name: this.value("#studio-name"),
      description: this.value("#studio-description"),
      responsible: this.value("#studio-responsible"),
      area: this.value("#studio-area"),
      inputs: this.value("#studio-inputs"),
      outputs: this.value("#studio-outputs"),
      systems: this.value("#studio-systems"),
      documents: this.value("#studio-documents"),
      businessRules: this.value("#studio-rules"),
      decisions: this.value("#studio-decisions"),
      observation: this.value("#studio-observation")
    });
    this.render();
  },

  handleAdd() {
    window.ProcessModelingStudioService.addActivity(this.state);
    this.render();
  },

  handleSplit() {
    window.ProcessModelingStudioService.splitActivity(this.state, this.state.selectedActivityUUID);
    this.render();
  },

  handleMerge() {
    window.ProcessModelingStudioService.mergeActivityWithNext(this.state, this.state.selectedActivityUUID);
    this.render();
  },

  handleDelete() {
    window.ProcessModelingStudioService.deleteActivity(this.state, this.state.selectedActivityUUID);
    this.render();
  },

  handleChat(event) {
    event.preventDefault();
    const message = event.currentTarget.querySelector("[name='studioQuestion']").value.trim();

    if (!message) {
      return;
    }

    window.ProcessModelingStudioService.answerConsultant(this.state, message);
    this.render();
  },

  value(selector) {
    const element = this.root.querySelector(selector);
    return element ? element.value.trim() : "";
  },

  async handleLogout() {
    if (this.session && this.session.sessionId && window.APP_CONFIG.apiBaseUrl) {
      await window.AiSecurityService.logout(this.session.sessionId);
    }

    window.AiSecurityService.clearSession();
    window.location.reload();
  }
});
