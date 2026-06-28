window.TransformationWorkshopRenderer = Object.freeze({
  render(state, session) {
    const model = state.processState.draftProcessModel;
    const selected = model && model.activities ? model.activities.find((activity) => activity.activityUUID === state.selectedActivityUUID) || model.activities[0] : null;

    return `
      <section class="transformation-workshop" aria-labelledby="workshop-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 10 - Transformation Workshop</p>
            <h2 id="workshop-title" class="page-title">Taller de transformacion</h2>
            <p class="page-description">Captura observaciones, evidencias e ideas sobre el VSM antes de ejecutar cualquier diagnostico automatico.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        ${model ? this.renderWorkshop(state, selected) : this.renderEmpty()}
      </section>
    `;
  },

  renderEmpty() {
    return `
      <section class="conversation-card">
        <h3>VSM requerido</h3>
        <p>El taller necesita actividades del Process Model para relacionar observaciones.</p>
      </section>
    `;
  },

  renderWorkshop(state, selected) {
    return `
      <div class="workshop-layout">
        <aside class="workshop-activity-panel">
          ${this.renderPackageSummary(state)}
          ${this.renderActivities(state, selected)}
        </aside>
        <main class="workshop-main-panel">
          ${selected ? this.renderObservationForm(selected) : ""}
          ${this.renderObservations(state, selected)}
        </main>
        <aside class="workshop-side-panel">
          ${this.renderQuestions(state)}
          ${this.renderChat(state)}
        </aside>
      </div>
    `;
  },

  renderPackageSummary(state) {
    const summary = state.packageData.summary;

    return `
      <section class="studio-panel">
        <p class="page-kicker">Transformation Observation Package</p>
        <h3 class="panel-title">${summary.totalObservations} observaciones</h3>
        <p class="status-note">${summary.highConfidence} alta / ${summary.mediumConfidence} media / ${summary.lowConfidence} baja confianza</p>
      </section>
    `;
  },

  renderActivities(state, selected) {
    const activities = state.processState.draftProcessModel.activities || [];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Actividades VSM</h3>
          <span class="status-note">${activities.length}</span>
        </div>
        <div class="activity-selector-list">
          ${activities.map((activity) => {
            const observations = state.packageData.observations.filter((item) => item.activityUUID === activity.activityUUID).length;
            return `
              <button class="activity-selector ${selected && selected.activityUUID === activity.activityUUID ? "is-selected" : ""}" data-workshop-activity-uuid="${this.escape(activity.activityUUID)}" type="button">
                <strong>${this.escape(activity.sequence)}. ${this.escape(activity.name)}</strong>
                <span>${observations} observaciones / ${this.escape(activity.responsible || "Sin responsable")}</span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  },

  renderObservationForm(activity) {
    return `
      <form id="workshop-observation-form" class="workshop-observation-form" data-activity-uuid="${this.escape(activity.activityUUID)}">
        <section class="studio-panel">
          <div class="context-section-header">
            <div>
              <p class="page-kicker">Actividad seleccionada</p>
              <h3 class="panel-title">${this.escape(activity.name)}</h3>
            </div>
            <button class="primary-button" type="submit">Agregar observacion</button>
          </div>
          <div class="form-grid">
            <label class="form-field">
              Tipo sugerido
              <select name="type">
                <option value="">Clasificar automaticamente</option>
                ${window.TransformationWorkshopService.observationTypes.map((type) => `<option value="${type}">${this.escape(type)}</option>`).join("")}
              </select>
            </label>
            <label class="form-field">
              Observacion
              <textarea name="text" rows="4" placeholder="Describe problema, espera, riesgo, retrabajo, idea o comentario"></textarea>
            </label>
            <label class="form-field">
              Evidencia adicional
              <textarea name="evidenceNotes" rows="3" placeholder="Documento, entrevista, dato observado o contexto de respaldo"></textarea>
            </label>
          </div>
        </section>

        <section class="studio-panel">
          <h3 class="panel-title">Adjuntos y referencias</h3>
          <div class="form-grid">
            ${this.input("Fotografia o captura", "photo")}
            ${this.input("Documento", "document")}
            ${this.input("Enlace", "link")}
            ${this.input("Nota", "note")}
            ${this.input("Grabacion de voz", "voice")}
          </div>
          <p class="status-note">La grabacion de voz queda registrada como referencia para versiones futuras; no se procesa audio todavia.</p>
        </section>
      </form>
    `;
  },

  renderObservations(state, selected) {
    const observations = state.packageData.observations.filter((observation) => !selected || observation.activityUUID === selected.activityUUID);

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Observaciones de la actividad</h3>
          <span class="status-note">${observations.length}</span>
        </div>
        <div class="workshop-observation-list">
          ${observations.length ? observations.map((observation) => this.renderObservationCard(observation)).join("") : "<p class=\"status-note\">Sin observaciones registradas para esta actividad.</p>"}
        </div>
      </section>
    `;
  },

  renderObservationCard(observation) {
    return `
      <article class="workshop-observation-card">
        <div class="context-section-header">
          <span class="confidence-badge">${this.escape(observation.type)}</span>
          <span class="status-note">${this.escape(observation.confidence)}</span>
        </div>
        <p>${this.escape(observation.text)}</p>
        <p class="status-note">${this.escape(observation.classificationReason)}</p>
        ${observation.evidenceNotes ? `<p><strong>Evidencia:</strong> ${this.escape(observation.evidenceNotes)}</p>` : ""}
        ${observation.attachments.length ? `
          <ul class="compact-list">
            ${observation.attachments.map((attachment) => `<li>${this.escape(attachment.type)} - ${this.escape(attachment.name)} (${this.escape(attachment.status)})</li>`).join("")}
          </ul>
        ` : ""}
      </article>
    `;
  },

  renderQuestions(state) {
    const openQuestions = (state.questions || []).filter((question) => question.status === "OPEN");

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Preguntas del consultor</h3>
          <span class="status-note">${openQuestions.length}</span>
        </div>
        <ul class="compact-list">
          ${openQuestions.length ? openQuestions.map((question) => `<li><strong>${this.escape(question.priority)}</strong> ${this.escape(question.question)}</li>`).join("") : "<li>Sin preguntas abiertas.</li>"}
        </ul>
      </section>
    `;
  },

  renderChat(state) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Consultor Digital</h3>
        <div class="chat-messages process-chat">
          ${(state.chat || []).map((message) => `
            <article class="chat-message chat-message-${message.author}">
              <p>${this.escape(message.text)}</p>
              <span>${this.escape(message.createdAt)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  },

  input(label, name) {
    return `
      <label class="form-field">
        ${this.escape(label)}
        <input name="${this.escape(name)}" type="text" />
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
