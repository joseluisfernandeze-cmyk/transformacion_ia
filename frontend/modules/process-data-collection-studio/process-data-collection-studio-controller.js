window.ProcessDataCollectionStudioController = Object.seal({
  root: null,
  session: null,
  state: null,

  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.ProcessDataCollectionStudioService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.ProcessDataCollectionStudioRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const form = this.root.querySelector("#process-data-form");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (form) {
      form.addEventListener("submit", (event) => this.handleSave(event));
    }

    this.root.querySelectorAll("[data-activity-uuid]").forEach((node) => {
      if (node.classList.contains("activity-selector")) {
        node.addEventListener("click", (event) => this.handleSelect(event));
      }
    });
  },

  handleSelect(event) {
    this.state.selectedActivityUUID = event.currentTarget.getAttribute("data-activity-uuid");
    window.ProcessDataCollectionStudioService.saveState(this.state);
    this.render();
  },

  handleSave(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const activityUUID = form.getAttribute("data-activity-uuid");
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      data[key] = String(value || "").trim();
    });

    window.ProcessDataCollectionStudioService.updateActivityData(this.state, activityUUID, data);
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
