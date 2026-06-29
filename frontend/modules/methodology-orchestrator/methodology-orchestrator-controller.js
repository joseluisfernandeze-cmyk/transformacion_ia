window.MethodologyOrchestratorController = Object.seal({
  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.MethodologyOrchestratorService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.MethodologyOrchestratorRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const approvalForm = this.root.querySelector("#stage-approval-form");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (approvalForm) {
      approvalForm.addEventListener("submit", (event) => this.handleApproval(event));
    }

    this.root.querySelectorAll("[data-stage-id]").forEach((node) => {
      if (node.classList.contains("stage-card")) {
        node.addEventListener("click", (event) => this.handleSelectStage(event));
      }
    });
  },

  handleSelectStage(event) {
    const stageId = event.currentTarget.getAttribute("data-stage-id");
    window.MethodologyOrchestratorService.selectStage(this.state, stageId);
    this.render();
  },

  handleApproval(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const stageId = form.getAttribute("data-stage-id");
    const formData = new FormData(form);
    const approvalData = {};

    formData.forEach((value, key) => {
      approvalData[key] = String(value || "").trim();
    });

    window.MethodologyOrchestratorService.approveStage(this.state, stageId, approvalData);
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
