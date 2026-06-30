window.AiSecurityController = Object.seal({
  root: null,
  renderProductShell: null,

  init(rootSelector, renderProductShell) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.renderProductShell = renderProductShell;

    if (!window.APP_CONFIG.apiBaseUrl) {
      const localSession = window.AiSecurityService.createLocalSession();
      window.AiSecurityService.setSession(localSession);
      this.renderAuthenticated(localSession);
      return;
    }

    const session = window.AiSecurityService.getSession();

    if (session) {
      this.renderAuthenticated(session);
      return;
    }

    this.renderLogin();
  },

  renderLogin(message) {
    window.DomUtils.setHtml(this.root, window.AiSecurityRenderer.renderLogin(message));
    const form = this.root.querySelector("#login-form");
    form.addEventListener("submit", (event) => this.handleLogin(event));
  },

  async handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await window.AiSecurityService.login(
      formData.get("email"),
      formData.get("password")
    );

    if (!result.success) {
      this.renderLogin(result.message);
      return;
    }

    window.AiSecurityService.setSession(result.data);
    this.renderAuthenticated(result.data);
  },

  renderAuthenticated(session) {
    if (typeof this.renderProductShell === "function") {
      this.renderProductShell();
    }

    if (window.APP_CONFIG.apiBaseUrl) {
      const main = window.DomUtils.selectElement("#main-content");

      if (main) {
        main.insertAdjacentHTML("afterbegin", window.AiSecurityRenderer.renderAgentPanel(session));
        this.bindAgentPanel(session);
      }
    }
  },

  bindAgentPanel(session) {
    const form = window.DomUtils.selectElement("#agent-form");
    const logoutButton = window.DomUtils.selectElement("#logout-button");

    form.addEventListener("submit", (event) => this.handleExecuteAgent(event, session));
    logoutButton.addEventListener("click", async () => {
      await window.AiSecurityService.logout(session.sessionId);
      window.AiSecurityService.clearSession();
      this.renderLogin("Session closed.");
    });
  },

  async handleExecuteAgent(event, session) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultPanel = window.DomUtils.selectElement("#agent-result");
    let context = {};

    try {
      context = JSON.parse(formData.get("context") || "{}");
    } catch (error) {
      window.DomUtils.setHtml(resultPanel, JSON.stringify({
        success: false,
        message: "Context must be valid JSON."
      }, null, 2));
      return;
    }

    const result = await window.AiSecurityService.executeAgent(
      session.sessionId,
      formData.get("agentId"),
      context
    );

    resultPanel.textContent = JSON.stringify(result, null, 2);
  }
});
