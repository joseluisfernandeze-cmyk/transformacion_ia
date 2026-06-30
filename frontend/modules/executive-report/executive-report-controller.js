window.ExecutiveReportController = Object.seal({
  root: null,
  session: null,
  state: null,

  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.ExecutiveReportService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.ExecutiveReportRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const runButton = this.root.querySelector("#run-executive-report");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (runButton) {
      runButton.addEventListener("click", () => this.handleGenerate());
    }

    this.root.querySelectorAll("[data-executive-section-id]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelectSection(event));
    });
  },

  handleGenerate() {
    window.ExecutiveReportService.generateReport(this.state);
    this.render();
  },

  handleSelectSection(event) {
    this.state.selectedSectionId = event.currentTarget.getAttribute("data-executive-section-id");
    window.ExecutiveReportService.saveState(this.state);
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
