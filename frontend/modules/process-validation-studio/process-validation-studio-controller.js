window.ProcessValidationStudioController = Object.seal({
  root: null,
  session: null,
  state: null,

  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.ProcessValidationStudioService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.ProcessValidationStudioRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    this.root.querySelector("#logout-button").addEventListener("click", () => this.handleLogout());
    this.root.querySelector("#run-validation-button").addEventListener("click", () => this.handleRunValidation());

    const chatForm = this.root.querySelector("#validation-chat-form");

    if (chatForm) {
      chatForm.addEventListener("submit", (event) => this.handleChat(event));
    }
  },

  handleRunValidation() {
    const validation = window.ProcessValidationStudioService.validateCurrentProcess();
    window.ProcessValidationStudioService.persistValidation(this.state, validation);
    this.render();
  },

  handleChat(event) {
    event.preventDefault();
    const question = event.currentTarget.querySelector("[name='validationQuestion']").value.trim();

    if (!question || !this.state.validation) {
      return;
    }

    window.ProcessValidationStudioService.addConsultantAnswer(this.state, this.state.validation, question);
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
