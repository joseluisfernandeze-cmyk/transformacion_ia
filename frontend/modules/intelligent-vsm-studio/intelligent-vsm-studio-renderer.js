window.IntelligentVsmStudioRenderer = Object.freeze({
  render(state, session) {
    const model = state.processState.draftProcessModel;
    const selected = model && model.activities ? model.activities.find((activity) => activity.activityUUID === state.selectedActivityUUID) || model.activities[0] : null;

    return `
      <section class="intelligent-vsm-studio" aria-labelledby="intelligent-vsm-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 9 - Intelligent VSM Studio</p>
            <h2 id="intelligent-vsm-title" class="page-title">Value Stream Map vivo</h2>
            <p class="page-description">Visualiza el proceso enriquecido, sus tiempos, clasificacion, recursos y riesgos sin separar el VSM del Process Model.</p>
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
        <p>El VSM se genera automaticamente desde el Process Model enriquecido. Primero crea y valida actividades.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    return `
      <div class="intelligent-vsm-layout">
        <main class="intelligent-vsm-main">
          ${this.renderToolbar(state)}
          ${this.renderCanvas(state, selected)}
        </main>
        <aside class="intelligent-vsm-side">
          ${this.renderDashboard(state)}
          ${selected ? this.renderInspector(selected) : ""}
          ${this.renderValidations(state)}
        </aside>
      </div>
    `;
  },

  renderToolbar(state) {
    return `
      <section class="studio-panel">
        <div class="vsm-control-row">
          <div class="vsm-zoom-controls">
            <button class="secondary-button" id="zoom-out-button" type="button">-</button>
            <span class="environment-pill">${Math.round(state.view.zoom * 100)}%</span>
            <button class="secondary-button" id="zoom-in-button" type="button">+</button>
            <button class="secondary-button" id="pan-left-button" type="button">←</button>
            <button class="secondary-button" id="pan-right-button" type="button">→</button>
            <button class="secondary-button" id="pan-up-button" type="button">↑</button>
            <button class="secondary-button" id="pan-down-button" type="button">↓</button>
          </div>
          <div class="vsm-toggle-row">
            ${this.toggle("showMetrics", "Metricas", state.view.showMetrics)}
            ${this.toggle("showResponsibles", "Responsables", state.view.showResponsibles)}
            ${this.toggle("showSystems", "Sistemas", state.view.showSystems)}
          </div>
        </div>
        <div class="subprocess-row">
          ${window.IntelligentVsmStudioService.getSubprocesses(state).map((subprocess) => `
            <button class="secondary-button" data-subprocess="${this.escape(subprocess)}" type="button">
              ${state.collapsedSubprocesses.indexOf(subprocess) === -1 ? "Colapsar" : "Expandir"} ${this.escape(subprocess)}
            </button>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderCanvas(state, selected) {
    const activities = window.IntelligentVsmStudioService.getVisibleActivities(state);
    const transform = `translate(${state.view.panX}px, ${state.view.panY}px) scale(${state.view.zoom})`;

    return `
      <section class="studio-panel vsm-live-panel">
        <div class="vsm-live-canvas" id="intelligent-vsm-canvas">
          <div class="vsm-live-transform" style="transform:${transform};">
            <svg class="vsm-live-connections" aria-hidden="true">
              ${this.renderConnections(activities)}
            </svg>
            ${activities.map((activity) => this.renderActivity(activity, selected, state)).join("")}
          </div>
        </div>
      </section>
    `;
  },

  renderConnections(activities) {
    return activities.slice(0, -1).map((activity, index) => {
      const next = activities[index + 1];
      const currentData = activity.vsmData || {};
      const nextData = next.vsmData || {};
      const x1 = (Number(currentData.x) || 0) + 248;
      const y1 = (Number(currentData.y) || 0) + 78;
      const x2 = Number(nextData.x) || 0;
      const y2 = (Number(nextData.y) || 0) + 78;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="vsm-line" marker-end="url(#vsm-arrow)" />`;
    }).join("") + `
      <defs>
        <marker id="vsm-arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L7,3 z" fill="#5b6773" />
        </marker>
      </defs>
    `;
  },

  renderActivity(activity, selected, state) {
    const data = activity.vsmData || {};
    const average = window.IntelligentVsmStudioService.expectedTriangular(data.processTimeMin, data.processTimeLikely, data.processTimeMax);
    const waitTime = Number(data.waitTime) || 0;
    const className = `vsm-live-card classification-${String(data.valueClassification || "pending").toLowerCase()}`;

    return `
      <article
        class="${className} ${selected && selected.activityUUID === activity.activityUUID ? "is-selected" : ""}"
        data-vsm-activity-uuid="${this.escape(activity.activityUUID)}"
        draggable="true"
        style="left:${Number(data.x) || 0}px; top:${Number(data.y) || 0}px;"
      >
        <div class="vsm-card-header">
          <span class="confidence-badge">${this.escape(data.valueClassification || "PEND")}</span>
          <span class="status-note">#${this.escape(activity.sequence)}</span>
        </div>
        <h3>${this.escape(activity.name)}</h3>
        ${state.view.showResponsibles ? `<p>${this.escape(activity.responsible || "Responsable pendiente")} / ${this.escape(activity.area || "Area pendiente")}</p>` : ""}
        ${state.view.showSystems ? `<p>${this.escape((activity.systems || []).join(", ") || "Sistema pendiente")}</p>` : ""}
        ${state.view.showMetrics ? `
          <dl class="vsm-time-grid">
            <div><dt>Min</dt><dd>${this.escape(data.processTimeMin)}</dd></div>
            <div><dt>Prob</dt><dd>${this.escape(data.processTimeLikely)}</dd></div>
            <div><dt>Max</dt><dd>${this.escape(data.processTimeMax)}</dd></div>
            <div><dt>Avg</dt><dd>${average.toFixed(1)}</dd></div>
            <div><dt>Wait</dt><dd>${waitTime.toFixed(1)}</dd></div>
          </dl>
        ` : ""}
      </article>
    `;
  },

  renderDashboard(state) {
    const metrics = state.metrics;
    const items = [
      ["Lead Time total", metrics.leadTimeTotal],
      ["Process Time total", metrics.processTimeTotal],
      ["Touch Time", metrics.touchTimeTotal],
      ["Tiempo VA", metrics.vaTime],
      ["Tiempo NNVA", metrics.nnvaTime],
      ["Tiempo NVA", metrics.nvaTime],
      ["Tiempo Espera", metrics.waitingTimeTotal],
      ["% VA", `${metrics.vaPercentage.toFixed(1)}%`],
      ["Actividades", metrics.activityCount],
      ["Responsables", metrics.responsibleCount],
      ["Sistemas", metrics.systemCount]
    ];

    return `
      <section class="studio-panel">
        <h3 class="panel-title">Dashboard VSM</h3>
        <div class="dimension-grid">
          ${items.map(([label, value]) => `
            <div class="dimension-card">
              <p>${this.escape(label)}</p>
              <strong>${typeof value === "number" ? value.toFixed(1) : this.escape(value)}</strong>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderInspector(activity) {
    const data = activity.vsmData || {};

    return `
      <section class="studio-panel">
        <p class="page-kicker">Actividad seleccionada</p>
        <h3 class="panel-title">${this.escape(activity.name)}</h3>
        <form id="vsm-activity-form" data-activity-uuid="${this.escape(activity.activityUUID)}">
          <label class="form-field">
            Clasificacion
            <select name="valueClassification">
              <option value="">Pendiente</option>
              ${["VA", "NNVA", "NVA"].map((value) => `<option value="${value}" ${data.valueClassification === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
          <div class="form-grid">
            ${this.input("Tiempo minimo", "processTimeMin", data.processTimeMin)}
            ${this.input("Tiempo probable", "processTimeLikely", data.processTimeLikely)}
            ${this.input("Tiempo maximo", "processTimeMax", data.processTimeMax)}
            ${this.input("Tiempo espera", "waitTime", data.waitTime)}
            ${this.input("Motivo espera", "waitReason", data.waitReason, "text")}
            ${this.input("Veces por dia", "frequencyPerDay", data.frequencyPerDay)}
            ${this.input("Semana", "frequencyPerWeek", data.frequencyPerWeek)}
            ${this.input("Mes", "frequencyPerMonth", data.frequencyPerMonth)}
            ${this.input("Anio", "frequencyPerYear", data.frequencyPerYear)}
          </div>
          <button class="primary-button" type="submit">Guardar VSM</button>
        </form>
        <div class="activity-meta">
          <p><strong>Documentos:</strong> ${this.escape((activity.documents || []).join(", ") || "Pendiente")}</p>
          <p><strong>Personas:</strong> ${this.escape(activity.operationalData && activity.operationalData.resources ? activity.operationalData.resources.peopleInvolved || "Pendiente" : "Pendiente")}</p>
          <p><strong>Equipos:</strong> ${this.escape(activity.operationalData && activity.operationalData.resources ? activity.operationalData.resources.equipment || "Pendiente" : "Pendiente")}</p>
          <p><strong>Riesgos:</strong> ${this.escape((activity.operationalRisks || []).join(", ") || (activity.operationalData && activity.operationalData.risks ? activity.operationalData.risks.operationalRisks : "") || "Sin riesgos registrados")}</p>
        </div>
      </section>
    `;
  },

  renderValidations(state) {
    const validations = state.validations || [];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Riesgos y validaciones</h3>
          <span class="status-note">${validations.length}</span>
        </div>
        <ul class="validation-list">
          ${validations.length ? validations.slice(0, 12).map((item) => `
            <li class="is-failed">
              <span>${this.escape(item.severity)}</span>
              <div>
                <strong>${this.escape(item.activityName || item.code)}</strong>
                <p>${this.escape(item.message)}</p>
              </div>
            </li>
          `).join("") : "<li class=\"is-passed\"><span>OK</span><div><strong>VSM completo</strong><p>Sin validaciones abiertas para el VSM.</p></div></li>"}
        </ul>
      </section>
    `;
  },

  toggle(option, label, checked) {
    return `
      <label class="toggle-control">
        <input type="checkbox" data-view-option="${this.escape(option)}" ${checked ? "checked" : ""} />
        <span>${this.escape(label)}</span>
      </label>
    `;
  },

  input(label, name, value, type) {
    return `
      <label class="form-field">
        ${this.escape(label)}
        <input name="${this.escape(name)}" type="${type || "number"}" min="0" value="${this.escape(value)}" />
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
