window.BusinessDiscoveryController = Object.seal({
  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.BusinessDiscoveryService.loadState();
    this.state.package = window.BusinessDiscoveryService.buildBusinessKnowledgePackage(this.state);
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.BusinessDiscoveryRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    this.root.querySelectorAll("[data-step-index]").forEach((button) => {
      button.addEventListener("click", (event) => this.handleStepClick(event));
    });
    this.root.querySelector("#previous-step-button").addEventListener("click", () => this.handlePrevious());
    this.root.querySelector("#next-step-button").addEventListener("click", () => this.handleNext());
    this.root.querySelector("#save-business-button").addEventListener("click", () => this.handleSave());
    this.root.querySelector("#business-chat-form").addEventListener("submit", (event) => this.handleChat(event));
    this.root.querySelector("#logout-button").addEventListener("click", () => this.handleLogout());

    const fileInput = this.root.querySelector("#business-document-input");
    const manualDocumentButton = this.root.querySelector("#add-business-document-button");
    const approveButton = this.root.querySelector("#approve-business-package-button");

    if (fileInput) {
      fileInput.addEventListener("change", (event) => this.handleFiles(event));
    }

    if (manualDocumentButton) {
      manualDocumentButton.addEventListener("click", () => this.handleManualDocument());
    }

    if (approveButton) {
      approveButton.addEventListener("click", () => this.handleApprove());
    }
  },

  handleStepClick(event) {
    this.syncFromForm();
    const stepIndex = Number(event.currentTarget.getAttribute("data-step-index"));
    this.state = window.BusinessDiscoveryService.moveToStep(this.state, stepIndex);
    this.render();
  },

  handlePrevious() {
    this.syncFromForm();
    this.state = window.BusinessDiscoveryService.moveToStep(this.state, this.state.currentStep - 1);
    this.render();
  },

  handleNext() {
    this.syncFromForm();
    this.state.package = window.BusinessDiscoveryService.buildBusinessKnowledgePackage(this.state);
    window.BusinessDiscoveryService.syncToContextBuilder(this.state);
    this.state = window.BusinessDiscoveryService.moveToStep(this.state, this.state.currentStep + 1);
    this.render();
  },

  handleSave() {
    this.syncFromForm();
    this.state.package = window.BusinessDiscoveryService.buildBusinessKnowledgePackage(this.state);
    window.BusinessDiscoveryService.syncToContextBuilder(this.state);
    window.BusinessDiscoveryService.saveState(this.state);
    this.render();
  },

  async handleFiles(event) {
    const documents = await window.BusinessDiscoveryService.readFiles(event.target.files);
    this.state.documents = this.state.documents.concat(documents);
    this.state.package = window.BusinessDiscoveryService.buildBusinessKnowledgePackage(this.state);
    window.BusinessDiscoveryService.syncToContextBuilder(this.state);
    window.BusinessDiscoveryService.saveState(this.state);
    this.render();
  },

  handleManualDocument() {
    const textarea = this.root.querySelector("[name='manualDocumentText']");
    const text = textarea.value.trim();

    if (!text) {
      return;
    }

    this.state.documents.push({
      documentId: `BDOC-${Date.now()}`,
      type: "MANUAL",
      title: `Evidencia manual ${this.state.documents.length + 1}`,
      normalizedText: text,
      size: text.length,
      status: "NORMALIZED",
      createdAt: new Date().toISOString()
    });
    this.state.package = window.BusinessDiscoveryService.buildBusinessKnowledgePackage(this.state);
    window.BusinessDiscoveryService.syncToContextBuilder(this.state);
    window.BusinessDiscoveryService.saveState(this.state);
    this.render();
  },

  handleChat(event) {
    event.preventDefault();
    const textarea = event.currentTarget.querySelector("[name='businessMessage']");
    const message = textarea.value.trim();

    if (!message) {
      return;
    }

    this.state = window.BusinessDiscoveryService.handleUserMessage(this.state, message);
    this.render();
  },

  handleApprove() {
    this.syncFromForm();
    this.state = window.BusinessDiscoveryService.approvePackage(this.state);
    this.render();
  },

  syncFromForm() {
    const form = this.root.querySelector("#business-discovery-form");

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    this.copyGroup(formData, "organization");
    this.copyGroup(formData, "business");
    this.copyGroup(formData, "structure");
    this.copyGroup(formData, "technology");
    this.copyGroup(formData, "project");
  },

  copyGroup(formData, groupName) {
    Object.keys(this.state[groupName] || {}).forEach((fieldName) => {
      const value = formData.get(`${groupName}.${fieldName}`);

      if (value !== null) {
        this.state[groupName][fieldName] = value;
      }
    });
  },

  async handleLogout() {
    if (this.session && this.session.sessionId && window.APP_CONFIG.apiBaseUrl) {
      await window.AiSecurityService.logout(this.session.sessionId);
    }

    window.AiSecurityService.clearSession();
    window.location.reload();
  }
});
