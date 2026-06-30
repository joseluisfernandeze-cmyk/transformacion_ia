window.BusinessCaseController = Object.seal({
  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.BusinessCaseService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.BusinessCaseRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const runButton = this.root.querySelector("#run-business-case");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (runButton) {
      runButton.addEventListener("click", () => this.handleGenerate());
    }

    this.root.querySelectorAll("[data-business-case-initiative-id]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelectInitiative(event));
    });
  },

  handleGenerate() {
    window.BusinessCaseService.generateBusinessCase(this.state);
    this.render();
  },

  handleSelectInitiative(event) {
    this.state.selectedInitiativeId = event.currentTarget.getAttribute("data-business-case-initiative-id");
    window.BusinessCaseService.saveState(this.state);
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
