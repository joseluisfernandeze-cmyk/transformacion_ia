window.RoadmapController = Object.seal({
  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.RoadmapService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.RoadmapRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const runButton = this.root.querySelector("#run-roadmap");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (runButton) {
      runButton.addEventListener("click", () => this.handleGenerate());
    }

    this.root.querySelectorAll("[data-roadmap-phase-id]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelectPhase(event));
    });
  },

  handleGenerate() {
    window.RoadmapService.generateRoadmap(this.state);
    this.render();
  },

  handleSelectPhase(event) {
    this.state.selectedPhaseId = event.currentTarget.getAttribute("data-roadmap-phase-id");
    window.RoadmapService.saveState(this.state);
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
