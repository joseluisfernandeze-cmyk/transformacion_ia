window.IntelligentVsmStudioController = Object.seal({
  dragState: null,

  init(rootSelector, session) {
    this.root = window.DomUtils.selectElement(rootSelector);
    this.session = session;
    this.state = window.IntelligentVsmStudioService.loadState();
    this.render();
  },

  render() {
    window.DomUtils.setHtml(this.root, window.IntelligentVsmStudioRenderer.render(this.state, this.session));
    this.bindEvents();
  },

  bindEvents() {
    const logoutButton = this.root.querySelector("#logout-button");
    const form = this.root.querySelector("#vsm-activity-form");
    const canvas = this.root.querySelector("#intelligent-vsm-canvas");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }

    if (form) {
      form.addEventListener("submit", (event) => this.handleSaveActivity(event));
    }

    if (canvas) {
      canvas.addEventListener("dragover", (event) => event.preventDefault());
      canvas.addEventListener("drop", (event) => this.handleDrop(event));
    }

    this.root.querySelectorAll("[data-vsm-activity-uuid]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSelect(event));
      node.addEventListener("dragstart", (event) => this.handleDragStart(event));
    });

    this.root.querySelectorAll("[data-view-option]").forEach((node) => {
      node.addEventListener("change", (event) => this.handleToggle(event));
    });

    this.root.querySelectorAll("[data-subprocess]").forEach((node) => {
      node.addEventListener("click", (event) => this.handleSubprocess(event));
    });

    this.bindViewButtons();
  },

  bindViewButtons() {
    const actions = {
      "zoom-in-button": () => window.IntelligentVsmStudioService.setZoom(this.state, this.state.view.zoom + 0.1),
      "zoom-out-button": () => window.IntelligentVsmStudioService.setZoom(this.state, this.state.view.zoom - 0.1),
      "pan-left-button": () => window.IntelligentVsmStudioService.pan(this.state, -40, 0),
      "pan-right-button": () => window.IntelligentVsmStudioService.pan(this.state, 40, 0),
      "pan-up-button": () => window.IntelligentVsmStudioService.pan(this.state, 0, -40),
      "pan-down-button": () => window.IntelligentVsmStudioService.pan(this.state, 0, 40)
    };

    Object.keys(actions).forEach((id) => {
      const button = this.root.querySelector(`#${id}`);
      if (button) {
        button.addEventListener("click", () => {
          actions[id]();
          this.render();
        });
      }
    });
  },

  handleSelect(event) {
    this.state.selectedActivityUUID = event.currentTarget.getAttribute("data-vsm-activity-uuid");
    window.IntelligentVsmStudioService.saveState(this.state);
    this.render();
  },

  handleSaveActivity(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const activityUUID = form.getAttribute("data-activity-uuid");
    const formData = new FormData(form);
    const updates = {};

    formData.forEach((value, key) => {
      updates[key] = String(value || "").trim();
    });

    window.IntelligentVsmStudioService.updateActivityVsm(this.state, activityUUID, updates);
    this.render();
  },

  handleDragStart(event) {
    const target = event.currentTarget;
    this.dragState = {
      activityUUID: target.getAttribute("data-vsm-activity-uuid"),
      offsetX: event.offsetX,
      offsetY: event.offsetY
    };
  },

  handleDrop(event) {
    event.preventDefault();

    if (!this.dragState) {
      return;
    }

    const canvasRect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - canvasRect.left - this.state.view.panX - this.dragState.offsetX) / this.state.view.zoom;
    const y = (event.clientY - canvasRect.top - this.state.view.panY - this.dragState.offsetY) / this.state.view.zoom;
    window.IntelligentVsmStudioService.moveActivity(this.state, this.dragState.activityUUID, x, y);
    this.dragState = null;
    this.render();
  },

  handleToggle(event) {
    const option = event.currentTarget.getAttribute("data-view-option");
    window.IntelligentVsmStudioService.toggleViewOption(this.state, option);
    this.render();
  },

  handleSubprocess(event) {
    const subprocess = event.currentTarget.getAttribute("data-subprocess");
    window.IntelligentVsmStudioService.toggleSubprocess(this.state, subprocess);
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
