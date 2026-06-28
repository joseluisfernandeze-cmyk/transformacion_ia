window.ProcessDataCollectionStudioRenderer = Object.freeze({
  render(state, session) {
    const model = state.processState.draftProcessModel;
    const selected = model && model.activities ? model.activities.find((activity) => activity.activityUUID === state.selectedActivityUUID) || model.activities[0] : null;

    return `
      <section class="data-collection-studio" aria-labelledby="data-collection-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 8 - Process Data Collection Studio</p>
            <h2 id="data-collection-title" class="page-title">Datos operacionales del proceso</h2>
            <p class="page-description">Captura y valida la informacion operacional necesaria para VSM, Lean, TOC, Automatizacion, IA, Business Case, Monte Carlo y dimensionamiento de cargas.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        ${model ? this.renderWorkspace(state, selected) : this.renderEmptyState()}
      </section>
    `;
  },

  renderEmptyState() {
    return `
      <section class="conversation-card">
        <h3>Process Model requerido</h3>
        <p>Primero debe existir un Process Model para capturar datos operacionales por actividad.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    return `
      <div class="data-collection-layout">
        <aside class="data-activity-list">
          ${this.renderReadiness(state)}
          ${this.renderActivityList(state, selected)}
        </aside>
        <main class="data-form-area">
          ${selected ? this.renderActivityForm(selected) : ""}
        </main>
        <aside class="data-validation-panel">
          ${this.renderValidations(state, selected)}
          ${this.renderConsultantChat(state)}
        </aside>
      </div>
    `;
  },

  renderReadiness(state) {
    const readiness = state.readiness;

    return `
      <section class="studio-panel">
        <p class="page-kicker">Readiness operacional</p>
        <h3 class="panel-title">${readiness.score}/100</h3>
        <p class="status-note">${this.escape(readiness.classification)}</p>
        <p class="status-note">${readiness.completedActivities}/${readiness.totalActivities} actividades completas</p>
      </section>
    `;
  },

  renderActivityList(state, selected) {
    const activities = state.processState.draftProcessModel.activities || [];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Actividades</h3>
          <span class="status-note">${activities.length}</span>
        </div>
        <div class="activity-selector-list">
          ${activities.map((activity) => {
            const issues = window.ProcessDataCollectionStudioService.validateActivity(activity).length;
            return `
              <button class="activity-selector ${selected && selected.activityUUID === activity.activityUUID ? "is-selected" : ""}" data-activity-uuid="${this.escape(activity.activityUUID)}" type="button">
                <strong>${this.escape(activity.sequence)}. ${this.escape(activity.name)}</strong>
                <span>${issues ? `${issues} pendientes` : "Completa"}</span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  },

  renderActivityForm(activity) {
    const data = activity.operationalData || {};

    return `
      <form id="process-data-form" class="data-collection-form" data-activity-uuid="${this.escape(activity.activityUUID)}">
        <section class="studio-panel">
          <div class="context-section-header">
            <div>
              <p class="page-kicker">Actividad seleccionada</p>
              <h3 class="panel-title">${this.escape(activity.name)}</h3>
            </div>
            <button class="primary-button" type="submit">Guardar datos</button>
          </div>
        </section>

        ${this.renderBasicFields(data)}
        ${this.renderFrequencyFields(data)}
        ${this.renderTimeFields(data)}
        ${this.renderClassificationFields(data)}
        ${this.renderWaitFields(data)}
        ${this.renderResourceFields(data)}
        ${this.renderVolumeFields(data)}
        ${this.renderRiskFields(data)}
        ${this.renderIndicatorFields(data)}
      </form>
    `;
  },

  renderBasicFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Informacion basica</h3>
        <div class="form-grid">
          ${this.input("Responsable", "responsible", data.basic.responsible)}
          ${this.input("Area", "area", data.basic.area)}
          ${this.input("Cargo", "jobTitle", data.basic.jobTitle)}
          ${this.input("Sistema utilizado", "systemUsed", data.basic.systemUsed)}
          ${this.input("Documento utilizado", "documentUsed", data.basic.documentUsed)}
        </div>
      </section>
    `;
  },

  renderFrequencyFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Frecuencia</h3>
        <div class="form-grid four-columns">
          ${this.input("Veces por dia", "perDay", data.frequency.perDay, "number")}
          ${this.input("Semana", "perWeek", data.frequency.perWeek, "number")}
          ${this.input("Mes", "perMonth", data.frequency.perMonth, "number")}
          ${this.input("Anio", "perYear", data.frequency.perYear, "number")}
        </div>
      </section>
    `;
  },

  renderTimeFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Tiempo</h3>
        <div class="form-grid four-columns">
          ${this.input("Tiempo minimo", "timeMin", data.time.min, "number")}
          ${this.input("Mas probable", "timeLikely", data.time.likely, "number")}
          ${this.input("Tiempo maximo", "timeMax", data.time.max, "number")}
          <label class="form-field">
            Unidad
            <select name="timeUnit">
              ${["MIN", "HOUR", "DAY"].map((unit) => `<option value="${unit}" ${data.time.timeUnit === unit ? "selected" : ""}>${unit}</option>`).join("")}
            </select>
          </label>
        </div>
      </section>
    `;
  },

  renderClassificationFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Clasificacion</h3>
        <div class="segmented-control" role="radiogroup" aria-label="Clasificacion de valor">
          ${["VA", "NNVA", "NVA"].map((value) => `
            <label class="segment-option ${data.classification.valueClassification === value ? "is-selected" : ""}">
              <input type="radio" name="valueClassification" value="${value}" ${data.classification.valueClassification === value ? "checked" : ""} />
              ${value}
            </label>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderWaitFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Esperas</h3>
        <div class="form-grid">
          ${this.input("Tiempo de espera", "waitTime", data.waits.waitTime, "number")}
          ${this.input("Motivo de la espera", "waitReason", data.waits.reason)}
        </div>
      </section>
    `;
  },

  renderResourceFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Recursos</h3>
        <div class="form-grid">
          ${this.textarea("Personas involucradas", "peopleInvolved", data.resources.peopleInvolved)}
          ${this.textarea("Equipos", "equipment", data.resources.equipment)}
          ${this.textarea("Aplicaciones", "applications", data.resources.applications)}
        </div>
      </section>
    `;
  },

  renderVolumeFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Volumen</h3>
        <div class="form-grid">
          ${this.input("Cantidad procesada", "quantityProcessed", data.volume.quantityProcessed, "number")}
          ${this.input("Lotes", "batches", data.volume.batches)}
          ${this.input("Variabilidad", "variability", data.volume.variability)}
        </div>
      </section>
    `;
  },

  renderRiskFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Riesgos</h3>
        <div class="form-grid">
          ${this.textarea("Riesgos operativos", "operationalRisks", data.risks.operationalRisks)}
          ${this.textarea("Errores frecuentes", "frequentErrors", data.risks.frequentErrors)}
          ${this.textarea("Retrabajos", "rework", data.risks.rework)}
        </div>
      </section>
    `;
  },

  renderIndicatorFields(data) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Indicadores</h3>
        <div class="form-grid">
          ${this.textarea("KPI relacionados", "kpis", data.indicators.kpis)}
          ${this.input("SLA", "sla", data.indicators.sla)}
          ${this.input("Meta", "target", data.indicators.target)}
        </div>
      </section>
    `;
  },

  renderValidations(state, selected) {
    const validations = selected ? window.ProcessDataCollectionStudioService.validateActivity(selected) : state.validations;

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Validaciones</h3>
          <span class="status-note">${validations.length}</span>
        </div>
        <ul class="validation-list">
          ${validations.length ? validations.map((item) => `
            <li class="is-failed">
              <span>${this.escape(item.severity)}</span>
              <div>
                <strong>${this.escape(item.code)}</strong>
                <p>${this.escape(item.message)}</p>
              </div>
            </li>
          `).join("") : "<li class=\"is-passed\"><span>OK</span><div><strong>Completa</strong><p>La actividad tiene datos operacionales suficientes.</p></div></li>"}
        </ul>
      </section>
    `;
  },

  renderConsultantChat(state) {
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

  input(label, name, value, type) {
    return `
      <label class="form-field">
        ${this.escape(label)}
        <input name="${this.escape(name)}" type="${type || "text"}" value="${this.escape(value)}" />
      </label>
    `;
  },

  textarea(label, name, value) {
    return `
      <label class="form-field">
        ${this.escape(label)}
        <textarea name="${this.escape(name)}" rows="3">${this.escape(value)}</textarea>
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
