window.TocConsultantController = Object.seal({
  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.TocConsultantService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.TocConsultantRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const runButton = this.root.querySelector("#run-toc-assessment");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (runButton) {
      runButton.addEventListener("click", () => this.handleRunAssessment());
    }

    this.root.querySelectorAll("[data-toc-activity-uuid]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelectActivity(event));
    });
  },

  handleRunAssessment() {
    window.TocConsultantService.runAssessment(this.state);
    this.render();
  },

  handleSelectActivity(event) {
    this.state.selectedActivityUUID = event.currentTarget.getAttribute("data-toc-activity-uuid");
    window.TocConsultantService.saveState(this.state);
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
