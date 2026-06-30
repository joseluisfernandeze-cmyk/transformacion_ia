window.RequirementsDiscoveryController = Object.seal({
  root: null,
  session: null,
  state: null,

  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.RequirementsDiscoveryService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.RequirementsDiscoveryRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const buildButton = this.root.querySelector("#build-requirements-button");
    const logoutButton = this.root.querySelector("#logout-button");
    const approveButton = this.root.querySelector("#approve-requirement-button");
    const questionForm = this.root.querySelector("#requirements-question-form");
    const explainButton = this.root.querySelector("#explain-requirement-button");

    if (buildButton) {
      buildButton.addEventListener("click", () => this.handleBuild());
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (approveButton) {
      approveButton.addEventListener("click", (event) => this.handleApprove(event));
    }

    if (questionForm) {
      questionForm.addEventListener("submit", (event) => this.handleQuestion(event));
    }

    if (explainButton) {
      explainButton.addEventListener("click", () => this.handleExplain());
    }

    this.root.querySelectorAll("[data-requirement-id]").forEach((node) => {
      if (node.classList.contains("requirement-card")) {
        node.addEventListener("click", (event) => this.handleSelect(event));
      }
    });
  },

  handleBuild() {
    const result = window.RequirementsDiscoveryService.buildRequirementsPackage();
    this.state.requirementsPackage = result.requirementsPackage;
    this.state.questions = result.questions;
    this.state.selectedRequirementId = this.state.requirementsPackage.requirements[0] ? this.state.requirementsPackage.requirements[0].requirementId : "";
    this.state.status = this.state.requirementsPackage.status;
    window.RequirementsDiscoveryService.addChat(this.state, "consultant", this.state.requirementsPackage.summary);
    window.RequirementsDiscoveryService.saveState(this.state);
    this.render();
  },

  handleSelect(event) {
    this.state.selectedRequirementId = event.currentTarget.getAttribute("data-requirement-id");
    window.RequirementsDiscoveryService.saveState(this.state);
    this.render();
  },

  handleApprove(event) {
    const requirementId = event.currentTarget.getAttribute("data-requirement-id");
    window.RequirementsDiscoveryService.approveRequirement(this.state, requirementId);
    this.render();
  },

  handleQuestion(event) {
    event.preventDefault();
    const message = event.currentTarget.querySelector("[name='questionAnswer']").value.trim();

    if (!message) {
      return;
    }

    window.RequirementsDiscoveryService.answerQuestion(this.state, message);
    this.render();
  },

  handleExplain() {
    const requirement = window.RequirementsDiscoveryService.findRequirement(this.state, this.state.selectedRequirementId);
    const answer = window.RequirementsDiscoveryService.explainRequirement(requirement);
    window.RequirementsDiscoveryService.addChat(this.state, "consultant", answer);
    window.RequirementsDiscoveryService.saveState(this.state);
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
