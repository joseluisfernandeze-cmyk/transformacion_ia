window.ProcessModelingStudioRenderer = Object.freeze({
  render(state, session) {
    const model = state.draftProcessModel;
    const selected = model && (model.activities.find((activity) => activity.activityUUID === state.selectedActivityUUID) || model.activities[0]);
    const warnings = window.ProcessModelingStudioService.validateModel(state);

    return `
      <section class="studio-workspace" aria-labelledby="studio-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 5 - Process Modeling Studio</p>
            <h2 id="studio-title" class="page-title">As-Is Studio</h2>
            <p class="page-description">Valida visualmente el proceso, edita actividades y conserva trazabilidad sobre cada cambio.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        <div class="studio-toolbar">
          <button class="primary-button" id="studio-add-activity" type="button">Agregar actividad</button>
          <button class="secondary-button" id="studio-split-activity" type="button" ${selected ? "" : "disabled"}>Dividir</button>
          <button class="secondary-button" id="studio-merge-activity" type="button" ${selected ? "" : "disabled"}>Unir con siguiente</button>
          <button class="secondary-button" id="studio-delete-activity" type="button" ${selected ? "" : "disabled"}>Eliminar</button>
        </div>

        <div class="studio-layout">
          <main class="studio-canvas-wrap">
            ${this.renderCanvas(model, selected)}
          </main>
          <aside class="studio-side">
            ${selected ? this.renderInspector(selected) : this.renderEmptyInspector()}
            ${this.renderWarnings(warnings)}
            ${this.renderChat(state)}
          </aside>
        </div>
      </section>
    `;
  },

  renderCanvas(model, selected) {
    if (!model || !model.activities.length) {
      return `
        <section class="conversation-card">
          <h3>No hay Process Model</h3>
          <p>Construye primero el Draft Process Model desde Process Discovery Consultant.</p>
        </section>
      `;
    }

    return `
      <section class="studio-canvas" id="studio-canvas">
        <svg class="studio-connections" aria-hidden="true">
          <defs>
            <marker id="studio-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#5b6773"></path>
            </marker>
          </defs>
          ${model.relationships.map((relationship) => this.renderConnection(model, relationship)).join("")}
        </svg>
        ${model.activities.map((activity) => `
          <article class="studio-node ${selected && selected.activityUUID === activity.activityUUID ? "is-selected" : ""}"
            draggable="true"
            data-activity-uuid="${this.escape(activity.activityUUID)}"
            style="left:${Number(activity.x || 40)}px; top:${Number(activity.y || 40)}px;">
            <div class="studio-node-header">
              <span>${activity.sequence}</span>
              <strong>${this.escape(activity.confidence)}</strong>
            </div>
            <h3>${this.escape(activity.name)}</h3>
            <p>${this.escape(activity.responsible || "Responsable pendiente")}</p>
          </article>
        `).join("")}
      </section>
    `;
  },

  renderConnection(model, relationship) {
    const from = model.activities.find((activity) => activity.activityUUID === relationship.fromActivityUUID);
    const to = model.activities.find((activity) => activity.activityUUID === relationship.toActivityUUID);

    if (!from || !to) {
      return "";
    }

    const x1 = Number(from.x || 40) + 230;
    const y1 = Number(from.y || 40) + 58;
    const x2 = Number(to.x || 40);
    const y2 = Number(to.y || 40) + 58;

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="studio-line" marker-end="url(#studio-arrow)" />`;
  },

  renderInspector(activity) {
    return `
      <section class="studio-panel">
        <p class="page-kicker">Inspector de actividad</p>
        ${this.input("studio-name", "Nombre", activity.name)}
        ${this.textarea("studio-description", "Descripcion", activity.description)}
        ${this.input("studio-responsible", "Responsable", activity.responsible)}
        ${this.input("studio-area", "Area", activity.area)}
        ${this.textarea("studio-inputs", "Entradas", (activity.inputs || []).join("\\n"))}
        ${this.textarea("studio-outputs", "Salidas", (activity.outputs || []).join("\\n"))}
        ${this.textarea("studio-systems", "Sistemas", (activity.systems || []).join("\\n"))}
        ${this.textarea("studio-documents", "Documentos", (activity.documents || []).join("\\n"))}
        ${this.textarea("studio-rules", "Reglas", (activity.businessRules || []).join("\\n"))}
        ${this.textarea("studio-decisions", "Decisiones", (activity.decisions || []).join("\\n"))}
        ${this.textarea("studio-observation", "Nueva observacion", "")}
        <div class="activity-meta">
          <p><strong>Confianza:</strong> ${this.escape(activity.confidence)}</p>
          <p><strong>Evidencia:</strong> ${(activity.evidence || []).length}</p>
          ${(activity.evidence || []).slice(0, 4).map((item) => `<p>${this.escape(item.sourceType)}: ${this.escape(item.fragment || item.sourceName)}</p>`).join("")}
          ${(activity.observations || []).map((item) => `<p><strong>Obs:</strong> ${this.escape(item.text)}</p>`).join("")}
        </div>
        <button class="primary-button" id="studio-save-activity" data-activity-uuid="${this.escape(activity.activityUUID)}" type="button">Guardar actividad</button>
      </section>
    `;
  },

  renderWarnings(warnings) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Validaciones</h3>
          <span class="status-note">${warnings.length}</span>
        </div>
        <ul class="compact-list">
          ${warnings.length ? warnings.map((warning) => `<li><strong>${this.escape(warning.impact)}</strong> ${this.escape(warning.message)}</li>`).join("") : "<li>Sin alertas criticas.</li>"}
        </ul>
      </section>
    `;
  },

  renderChat(state) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Chat del Consultor</h3>
        <div class="chat-messages process-chat">
          ${(state.consultantChat || []).map((message) => `
            <article class="chat-message chat-message-${message.author}">
              <p>${this.escape(message.text)}</p>
              <span>${this.escape(message.createdAt)}</span>
            </article>
          `).join("")}
        </div>
        <form id="studio-chat-form" class="chat-form">
          <label class="form-field">
            Pregunta sobre evidencia
            <textarea name="studioQuestion" rows="3" placeholder="Ejemplo: Que documento respalda esta decision?"></textarea>
          </label>
          <button class="primary-button" type="submit">Preguntar</button>
        </form>
      </section>
    `;
  },

  renderEmptyInspector() {
    return `<section class="studio-panel"><p>Selecciona una actividad.</p></section>`;
  },

  input(id, label, value) {
    return `
      <label class="form-field">
        ${label}
        <input id="${id}" value="${this.escape(value || "")}" />
      </label>
    `;
  },

  textarea(id, label, value) {
    return `
      <label class="form-field">
        ${label}
        <textarea id="${id}" rows="3">${this.escape(value || "")}</textarea>
      </label>
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
