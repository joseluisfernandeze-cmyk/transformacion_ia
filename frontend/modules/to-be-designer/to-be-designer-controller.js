window.ToBeDesignerController = Object.seal({
  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.ToBeDesignerService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.ToBeDesignerRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const runButton = this.root.querySelector("#run-to-be-design");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (runButton) {
      runButton.addEventListener("click", () => this.handleRunDesign());
    }

    this.root.querySelectorAll("[data-to-be-activity-uuid]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelectActivity(event));
    });
  },

  handleRunDesign() {
    window.ToBeDesignerService.runDesign(this.state);
    this.render();
  },

  handleSelectActivity(event) {
    this.state.selectedActivityUUID = event.currentTarget.getAttribute("data-to-be-activity-uuid");
    window.ToBeDesignerService.saveState(this.state);
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
