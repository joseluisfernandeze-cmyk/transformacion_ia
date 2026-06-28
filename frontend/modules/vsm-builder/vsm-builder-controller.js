window.VsmBuilderController = Object.freeze({
  dragState: null,

  init(containerSelector) {
    const container = window.DomUtils.selectElement(containerSelector);

    if (!container) {
      return;
    }

    const processModel = window.VsmBuilderService.loadProcessModel();
    const vsmMap = window.VsmBuilderService.loadVsmMap(processModel);

    window.VsmBuilderState.setProcessModel(processModel);
    window.VsmBuilderState.setVsmMap(vsmMap);

    this.render(container);
  },

  render(container) {
    window.DomUtils.setHtml(container, window.VsmBuilderPage.render());
    this.bindEvents(container);
  },

  bindEvents(container) {
    container.querySelectorAll(".vsm-activity").forEach((block) => {
      block.addEventListener("click", () => this.selectActivity(block.dataset.activityUuid, container));
      block.addEventListener("dragstart", (event) => this.startDrag(event, block));
    });

    const canvas = container.querySelector("#vsm-canvas");

    if (canvas) {
      canvas.addEventListener("dragover", (event) => event.preventDefault());
      canvas.addEventListener("drop", (event) => this.dropActivity(event, container));
    }
  },

  selectActivity(activityUUID, container) {
    window.VsmBuilderState.selectActivity(activityUUID);
    const activity = window.VsmBuilderState.getSelectedActivity();
    const data = window.VsmBuilderState.getSelectedVsmData();
    const editor = container.querySelector("#vsm-editor");

    window.DomUtils.setHtml(editor, window.VsmBuilderRenderer.renderEditor(activity, data));

    editor.querySelectorAll("[data-vsm-field]").forEach((field) => {
      field.addEventListener("change", () => this.updateSelectedField(field, container));
    });
  },

  updateSelectedField(field, container) {
    const data = window.VsmBuilderState.getSelectedVsmData();

    if (!data) {
      return;
    }

    data[field.dataset.vsmField] = field.type === "number" ? Number(field.value) : field.value;
    this.saveAndRender(container);
  },

  startDrag(event, block) {
    this.dragState = {
      activityUUID: block.dataset.activityUuid,
      offsetX: event.offsetX,
      offsetY: event.offsetY
    };
  },

  dropActivity(event, container) {
    event.preventDefault();

    if (!this.dragState) {
      return;
    }

    const canvasRect = event.currentTarget.getBoundingClientRect();
    const data = window.VsmBuilderState
      .getVsmActivityData()
      .find((item) => item.activityUUID === this.dragState.activityUUID);

    if (data) {
      data.x = Math.max(16, event.clientX - canvasRect.left - this.dragState.offsetX);
      data.y = Math.max(16, event.clientY - canvasRect.top - this.dragState.offsetY);
      this.saveAndRender(container);
    }

    this.dragState = null;
  },

  saveAndRender(container) {
    const errors = window.VsmBuilderValidator.validateMap(window.VsmBuilderState.vsmMap);
    const dataErrors = window.VsmBuilderState
      .getVsmActivityData()
      .flatMap((item) => window.VsmBuilderValidator.validateActivityData(item));

    if (errors.length || dataErrors.length) {
      window.VsmBuilderState.setSaveStatus("Error");
      return;
    }

    window.VsmBuilderState.setSaveStatus("Saving");
    window.VsmBuilderService.saveVsmMap(window.VsmBuilderState.vsmMap);
    window.VsmBuilderState.setSaveStatus("Saved");
    this.render(container);
  }
});

