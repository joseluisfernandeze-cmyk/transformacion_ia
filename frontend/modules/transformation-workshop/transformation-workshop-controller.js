window.TransformationWorkshopController = Object.seal({
  root: null,
  session: null,
  state: null,

  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.TransformationWorkshopService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.TransformationWorkshopRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const form = this.root.querySelector("#workshop-observation-form");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (form) {
      form.addEventListener("submit", (event) => this.handleAddObservation(event));
    }

    this.root.querySelectorAll("[data-workshop-activity-uuid]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelectActivity(event));
    });
  },

  handleSelectActivity(event) {
    this.state.selectedActivityUUID = event.currentTarget.getAttribute("data-workshop-activity-uuid");
    window.TransformationWorkshopService.saveState(this.state);
    this.render();
  },

  handleAddObservation(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const activityUUID = form.getAttribute("data-activity-uuid");
    const formData = new FormData(form);
    const data = { activityUUID };

    formData.forEach((value, key) => {
      data[key] = String(value || "").trim();
    });

    if (!data.text) {
      return;
    }

    window.TransformationWorkshopService.addObservation(this.state, data);
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
