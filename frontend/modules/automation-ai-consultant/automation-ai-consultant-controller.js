window.AutomationAiConsultantController = Object.seal({
  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.AutomationAiConsultantService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.AutomationAiConsultantRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const runButton = this.root.querySelector("#run-automation-ai-assessment");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (runButton) {
      runButton.addEventListener("click", () => this.handleRunAssessment());
    }

    this.root.querySelectorAll("[data-automation-ai-activity-uuid]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelectActivity(event));
    });
  },

  handleRunAssessment() {
    window.AutomationAiConsultantService.runAssessment(this.state);
    this.render();
  },

  handleSelectActivity(event) {
    this.state.selectedActivityUUID = event.currentTarget.getAttribute("data-automation-ai-activity-uuid");
    window.AutomationAiConsultantService.saveState(this.state);
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
