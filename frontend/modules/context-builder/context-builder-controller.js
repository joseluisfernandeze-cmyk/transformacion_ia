window.ContextBuilderController = Object.seal({
  root: null,
  session: null,
  state: null,

  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.ContextBuilderService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.ContextBuilderRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    this.root.querySelector("#context-builder-form").addEventListener("submit", (event) => this.handleExecute(event));
    this.root.querySelector("#save-context-button").addEventListener("click", () => this.handleSave());
    this.root.querySelector("#document-input").addEventListener("change", (event) => this.handleFiles(event));
    this.root.querySelector("#add-manual-document-button").addEventListener("click", () => this.handleManualDocument());
    this.root.querySelector("#add-interview-button").addEventListener("click", () => this.handleInterview());
    this.root.querySelector("#add-note-button").addEventListener("click", () => this.handleNote());
    this.root.querySelector("#logout-button").addEventListener("click", () => this.handleLogout());

    const chatForm = this.root.querySelector("#consultant-chat-form");

    if (chatForm) {
      chatForm.addEventListener("submit", (event) => this.handleConsultantMessage(event));
    }

    this.root.querySelectorAll("[data-explain-topic]").forEach((button) => {
      button.addEventListener("click", (event) => this.handleExplain(event));
    });
  },

  syncProjectFromForm() {
    const form = this.root.querySelector("#context-builder-form");
    const formData = new FormData(form);

    this.state.project = {
      ...this.state.project,
      name: formData.get("name") || "",
      company: formData.get("company") || "",
      client: formData.get("client") || "",
      area: formData.get("area") || "",
      process: formData.get("process") || "",
      owner: formData.get("owner") || "",
      date: formData.get("date") || "",
      objective: formData.get("objective") || "",
      scope: formData.get("scope") || ""
    };
  },

  handleSave() {
    this.syncProjectFromForm();
    window.ContextBuilderService.saveState(this.state);
    this.render();
  },

  async handleFiles(event) {
    const documents = await window.ContextBuilderService.readFiles(event.target.files);
    this.state.documents = this.state.documents.concat(documents);
    window.ContextBuilderService.saveState(this.state);
    this.render();
  },

  handleManualDocument() {
    const textarea = this.root.querySelector("#manual-document-text");
    const text = textarea.value.trim();

    if (!text) {
      return;
    }

    this.state.documents.push({
      documentId: `DOC-${Date.now()}`,
      documentType: "MANUAL_TEXT",
      title: `Texto normalizado ${this.state.documents.length + 1}`,
      normalizedText: text,
      size: text.length,
      lastModified: new Date().toISOString(),
      normalizationStatus: "NORMALIZED"
    });
    window.ContextBuilderService.saveState(this.state);
    this.render();
  },

  handleInterview() {
    const person = this.root.querySelector("[name='interviewPerson']").value.trim();
    const role = this.root.querySelector("[name='interviewRole']").value.trim();
    const content = this.root.querySelector("[name='interviewContent']").value.trim();

    if (!content) {
      return;
    }

    this.state.interviews.push({
      interviewId: `INT-${Date.now()}`,
      person,
      role,
      content,
      createdAt: new Date().toISOString()
    });
    window.ContextBuilderService.saveState(this.state);
    this.render();
  },

  handleNote() {
    const content = this.root.querySelector("[name='noteContent']").value.trim();

    if (!content) {
      return;
    }

    this.state.notes.push({
      noteId: `NOT-${Date.now()}`,
      content,
      createdAt: new Date().toISOString()
    });
    window.ContextBuilderService.saveState(this.state);
    this.render();
  },

  async handleExecute(event) {
    event.preventDefault();
    this.syncProjectFromForm();
    const response = await window.ContextBuilderService.executeAgent(this.session.sessionId, this.state);

    if (response.success) {
      this.state.result = response.data;
      this.state.validation = {
        status: window.ContextBuilderService.resolveValidationStatus(response.data.knowledgePackage),
        updatedAt: new Date().toISOString()
      };
      window.ContextBuilderService.saveState(this.state);
    } else {
      this.state.result = {
        knowledgePackage: {
          knowledgePackageId: "ERROR",
          confidence: "INSUFFICIENT_INFORMATION",
          objective: { description: response.message },
          scope: { description: "No se pudo ejecutar el agente." },
          missingInformation: (response.errors || []).map((error) => error.message || error.code)
        },
        contextGraph: { nodes: [], edges: [] }
      };
    }

    this.render();
  },

  async handleConsultantMessage(event) {
    event.preventDefault();
    const textarea = event.currentTarget.querySelector("[name='consultantMessage']");
    const message = textarea.value.trim();

    if (!message) {
      return;
    }

    this.state = await window.ContextBuilderService.enrichKnowledgePackage(
      this.session.sessionId,
      this.state,
      message
    );
    this.render();
  },

  handleExplain(event) {
    const topic = event.currentTarget.getAttribute("data-explain-topic");
    const explanation = window.ContextBuilderService.explainConclusion(this.state, topic);

    this.state.consultantChat.push({
      messageId: `MSG-${Date.now()}-EXPLAIN`,
      author: "consultant",
      text: explanation,
      createdAt: new Date().toISOString()
    });
    window.ContextBuilderService.saveState(this.state);
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
