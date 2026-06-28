window.ProcessDiscoveryRenderer = Object.freeze({
  render(state, session) {
    const model = state.draftProcessModel;

    return `
      <section class="process-discovery" aria-labelledby="process-discovery-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 4 - Process Discovery Consultant</p>
            <h2 id="process-discovery-title" class="page-title">Borrador As-Is guiado</h2>
            <p class="page-description">Construye, valida y corrige el proceso As-Is usando evidencia del Business Knowledge Package, Knowledge Package y entrevistas.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        <div class="process-actions">
          <button class="primary-button" id="build-process-button" type="button">Construir Draft Process Model</button>
          <button class="secondary-button" id="add-activity-button" type="button">Agregar actividad</button>
        </div>

        ${model ? this.renderWorkspace(state) : this.renderEmptyState()}
      </section>
    `;
  },

  renderEmptyState() {
    return `
      <section class="conversation-card">
        <h3>Listo para descubrir el proceso</h3>
        <p>El consultor usara el Business Knowledge Package y el Knowledge Package disponibles. Si faltan datos, formulara preguntas antes de consolidar.</p>
      </section>
    `;
  },

  renderWorkspace(state) {
    const model = state.draftProcessModel;
    const selected = model.activities.find((activity) => activity.activityUUID === state.selectedActivityUUID) || model.activities[0];

    return `
      <div class="process-workspace-layout">
        <main class="process-map-area">
          ${this.renderSummary(state)}
          ${this.renderProcessCanvas(model, selected)}
        </main>
        <aside class="activity-inspector">
          ${selected ? this.renderInspector(selected) : ""}
          ${this.renderQuestions(state)}
          ${this.renderChat(state)}
        </aside>
      </div>
    `;
  },

  renderSummary(state) {
    const model = state.draftProcessModel;
    const approved = model.activities.filter((activity) => activity.approvalStatus === "HUMAN_APPROVED").length;
    const lowConfidence = model.activities.filter((activity) => activity.confidence === "LOW_CONFIDENCE").length;

    return `
      <section class="discovery-summary">
        <div class="result-card">
          <p class="page-kicker">Draft Process Model</p>
          <h3 class="panel-title">${this.escape(model.name)}</h3>
          <p class="status-note">${model.activities.length} actividades / ${model.relationships.length} relaciones / Estado ${this.escape(state.status)}</p>
        </div>
        <div class="result-card">
          <p class="status-label">Calidad del borrador</p>
          <p class="status-value">${approved}/${model.activities.length}</p>
          <p class="status-note">${lowConfidence} actividades con baja confianza</p>
        </div>
      </section>
    `;
  },

  renderProcessCanvas(model, selected) {
    return `
      <section class="process-canvas" aria-label="Draft process model">
        ${model.activities.map((activity, index) => `
          <article class="process-node ${selected && selected.activityUUID === activity.activityUUID ? "is-selected" : ""}" data-activity-uuid="${this.escape(activity.activityUUID)}">
            <div class="process-node-sequence">${index + 1}</div>
            <div>
              <h3>${this.escape(activity.name)}</h3>
              <p>${this.escape(activity.responsible || "Responsable pendiente")}</p>
              <span class="confidence-badge">${this.escape(activity.confidence)}</span>
            </div>
          </article>
        `).join("")}
      </section>
    `;
  },

  renderInspector(activity) {
    return `
      <section class="inspector-panel">
        <p class="page-kicker">Actividad seleccionada</p>
        <label class="form-field">
          Nombre
          <input id="activity-name-input" value="${this.escape(activity.name)}" />
        </label>
        <label class="form-field">
          Responsable
          <input id="activity-responsible-input" value="${this.escape(activity.responsible)}" />
        </label>
        <label class="form-field">
          Area
          <input id="activity-area-input" value="${this.escape(activity.area)}" />
        </label>
        <label class="form-field">
          Descripcion
          <textarea id="activity-description-input" rows="4">${this.escape(activity.description)}</textarea>
        </label>
        <div class="activity-meta">
          <p><strong>Sistemas:</strong> ${this.escape((activity.systems || []).join(", ") || "Pendiente")}</p>
          <p><strong>Documentos:</strong> ${this.escape((activity.documents || []).join(", ") || "Pendiente")}</p>
          <p><strong>Evidencias:</strong> ${(activity.evidence || []).length}</p>
        </div>
        <div class="context-actions">
          <button class="secondary-button" id="save-activity-button" data-activity-uuid="${this.escape(activity.activityUUID)}" type="button">Guardar cambios</button>
          <button class="primary-button" id="approve-activity-button" data-activity-uuid="${this.escape(activity.activityUUID)}" type="button">Aprobar actividad</button>
          <button class="secondary-button" id="delete-activity-button" data-activity-uuid="${this.escape(activity.activityUUID)}" type="button">Eliminar</button>
        </div>
      </section>
    `;
  },

  renderQuestions(state) {
    const openQuestions = (state.questions || []).filter((question) => question.status === "OPEN");

    return `
      <section class="inspector-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Preguntas del consultor</h3>
          <span class="status-note">${openQuestions.length}</span>
        </div>
        <ul class="compact-list">
          ${openQuestions.length ? openQuestions.map((question) => `<li>${this.escape(question.question)}</li>`).join("") : "<li>Sin preguntas bloqueantes.</li>"}
        </ul>
        <form id="process-question-form" class="chat-form">
          <label class="form-field">
            Respuesta
            <textarea name="questionAnswer" rows="3"></textarea>
          </label>
          <button class="primary-button" type="submit">Responder y actualizar</button>
        </form>
      </section>
    `;
  },

  renderChat(state) {
    return `
      <section class="inspector-panel">
        <h3 class="panel-title">Consultor Digital</h3>
        <div class="chat-messages process-chat">
          ${(state.consultantChat || []).map((message) => `
            <article class="chat-message chat-message-${message.author}">
              <p>${this.escape(message.text)}</p>
              <span>${this.escape(message.createdAt)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  },

  escape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
