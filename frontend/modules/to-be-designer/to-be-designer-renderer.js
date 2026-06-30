window.ToBeDesignerRenderer = Object.freeze({
  render(state, session) {
    const model = state.sources.processState.draftProcessModel;
    const selected = this.findSelectedDecision(state);

    return `
      <section class="to-be-designer" aria-labelledby="to-be-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 15 - To-Be Designer</p>
            <h2 id="to-be-title" class="page-title">To-Be Designer</h2>
            <p class="page-description">Disena el proceso futuro usando evidencia de As-Is, VSM, taller, Lean, TOC y Automation & AI.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        ${model ? this.renderWorkspace(state, selected) : this.renderEmpty()}
      </section>
    `;
  },

  renderEmpty() {
    return `
      <section class="conversation-card">
        <h3>Process Model As-Is requerido</h3>
        <p>El To-Be Designer necesita un Process Model As-Is y los paquetes de diagnostico anteriores antes de construir el proceso futuro.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    const packageData = state.toBePackage;

    return `
      <div class="to-be-layout">
        <aside class="to-be-left">
          ${this.renderActions(packageData)}
          ${this.renderSummary(packageData)}
          ${this.renderActivities(state, selected)}
        </aside>
        <main class="to-be-main">
          ${packageData ? this.renderExecutiveSummary(packageData) : this.renderRunPrompt()}
          ${packageData ? this.renderDecisionDetail(selected) : ""}
          ${packageData ? this.renderComparison(packageData) : ""}
          ${packageData ? this.renderToBeModel(packageData) : ""}
        </main>
        <aside class="to-be-right">
          ${this.renderRisks(packageData)}
          ${this.renderQuestions(state)}
          ${this.renderChat(state)}
        </aside>
      </div>
    `;
  },

  renderActions(packageData) {
    return `
      <section class="studio-panel">
        <p class="page-kicker">To-Be Package</p>
        <h3 class="panel-title">${packageData ? this.escape(packageData.status) : "No generado"}</h3>
        <button class="primary-button" id="run-to-be-design" type="button">Generar proceso To-Be</button>
        <p class="status-note">No genera Business Case, Roadmap ni Executive Report.</p>
      </section>
    `;
  },

  renderSummary(packageData) {
    if (!packageData) {
      return "";
    }

    const summary = packageData.summary;
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Resumen To-Be</h3>
        <div class="dimension-grid">
          ${this.dimension("Actividades", summary.totalActivities)}
          ${this.dimension("Eliminadas", summary.eliminated)}
          ${this.dimension("Simplificadas", summary.simplified)}
          ${this.dimension("Automatizadas", summary.automated)}
          ${this.dimension("Con IA", summary.aiEnabled)}
          ${this.dimension("Paralelas", summary.parallelized)}
          ${this.dimension("Beneficio", summary.expectedTimeBenefit)}
          ${this.dimension("Confianza", summary.averageConfidence)}
        </div>
      </section>
    `;
  },

  renderActivities(state, selected) {
    const activities = state.toBePackage ? state.toBePackage.changeJustifications : (state.sources.processState.draftProcessModel.activities || []).map((activity) => ({
      activityUUID: activity.activityUUID,
      sequence: activity.sequence,
      activityName: activity.name,
      actions: [{ label: "Pendiente" }],
      toBeActivity: { status: "PENDING" }
    }));

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Actividades</h3>
          <span class="status-note">${activities.length}</span>
        </div>
        <div class="activity-selector-list">
          ${activities.map((decision) => `
            <button class="activity-selector ${selected && selected.activityUUID === decision.activityUUID ? "is-selected" : ""}" data-to-be-activity-uuid="${this.escape(decision.activityUUID)}" type="button">
              <strong>${this.escape(decision.sequence)}. ${this.escape(decision.activityName)}</strong>
              <span>${this.escape(decision.toBeActivity.status)} / ${this.escape(decision.actions.map((action) => action.label).join(", "))}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderRunPrompt() {
    return `
      <section class="conversation-card">
        <h3>Genera el proceso futuro</h3>
        <p>El consultor evaluara mantener, eliminar, simplificar, automatizar, incorporar IA, reordenar, paralelizar y redisenar responsabilidades con evidencia.</p>
      </section>
    `;
  },

  renderExecutiveSummary(packageData) {
    return `
      <section class="studio-panel">
        <p class="page-kicker">Executive Summary</p>
        <h3 class="panel-title">${this.escape(packageData.status)}</h3>
        <p>${this.escape(packageData.executiveSummary)}</p>
      </section>
    `;
  },

  renderDecisionDetail(decision) {
    if (!decision) {
      return `<section class="conversation-card"><h3>Sin actividad seleccionada</h3><p>Selecciona una actividad para revisar su decision To-Be.</p></section>`;
    }

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <div>
            <p class="page-kicker">Decision por actividad</p>
            <h3 class="panel-title">${this.escape(decision.activityName)}</h3>
          </div>
          <span class="confidence-badge">${this.escape(decision.confidence)}</span>
        </div>
        <div class="to-be-action-grid">
          ${decision.actions.map((action) => `
            <article class="to-be-action-card">
              <strong>${this.escape(action.label)}</strong>
              <p>${this.escape(action.rationale)}</p>
              <span>${this.escape(action.confidence)}</span>
            </article>
          `).join("")}
        </div>
        <div class="dimension-grid">
          ${this.dimension("Estado", decision.toBeActivity.status)}
          ${this.dimension("As-Is", decision.comparison.asIsTotalTime)}
          ${this.dimension("To-Be", decision.comparison.toBeTotalTime)}
          ${this.dimension("Beneficio", decision.comparison.expectedBenefit)}
        </div>
        <section class="activity-meta">
          <p><strong>Responsable To-Be:</strong> ${this.escape(decision.toBeActivity.responsible || "No definido")}</p>
          <p><strong>Sistemas:</strong> ${this.escape(decision.toBeActivity.systems.join(", ") || "No definidos")}</p>
          <p><strong>Documentos:</strong> ${this.escape(decision.toBeActivity.documents.join(", ") || "No definidos")}</p>
          <p><strong>Indicadores:</strong> ${this.escape(decision.toBeActivity.indicators.join(" | ") || "No definidos")}</p>
        </section>
        <h4 class="panel-title">Evidencia utilizada</h4>
        <ul class="validation-list">
          ${decision.evidence.length ? decision.evidence.map((item) => `
            <li class="is-passed">
              <span>${this.escape(item.category)}</span>
              <div>
                <strong>${this.escape(item.sourceName)}</strong>
                <p>${this.escape(item.fragment)}</p>
              </div>
            </li>
          `).join("") : "<li><span>MISS</span><div><strong>Sin evidencia</strong><p>No se encontro evidencia suficiente.</p></div></li>"}
        </ul>
      </section>
    `;
  },

  renderComparison(packageData) {
    const comparison = packageData.comparison;

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Comparativo As-Is vs To-Be</h3>
          <span class="status-note">${comparison.expectedTimeBenefit} beneficio estimado</span>
        </div>
        <div class="dimension-grid">
          ${this.dimension("As-Is actividades", comparison.asIsActivityCount)}
          ${this.dimension("To-Be actividades", comparison.toBeActivityCount)}
          ${this.dimension("Tiempo As-Is", comparison.asIsEstimatedTime)}
          ${this.dimension("Tiempo To-Be", comparison.toBeEstimatedTime)}
        </div>
        <div class="requirements-board">
          ${comparison.modifiedActivities.concat(comparison.eliminatedActivities).map((item) => `
            <article class="requirement-card">
              <strong>${this.escape(item.activityName)}</strong>
              <span>${this.escape(item.changes.join(", "))}</span>
              <span>Antes: ${this.escape(item.asIsTime)} / Despues: ${this.escape(item.toBeTime)}</span>
              <span>Beneficio: ${this.escape(item.benefit)} · ${this.escape(item.confidence)}</span>
            </article>
          `).join("") || "<p class=\"status-note\">Sin cambios propuestos con evidencia suficiente.</p>"}
        </div>
      </section>
    `;
  },

  renderToBeModel(packageData) {
    const activities = packageData.processModelToBe.activities || [];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Process Model To-Be</h3>
          <span class="status-note">${activities.length} actividades</span>
        </div>
        <div class="workshop-observation-list">
          ${activities.map((activity) => `
            <article class="workshop-observation-card">
              <strong>${this.escape(activity.sequence)}. ${this.escape(activity.name)}</strong>
              <p>${this.escape(activity.description)}</p>
              <p class="status-note">${this.escape(activity.responsible)} · ${this.escape(activity.changeTypes.join(", "))}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderRisks(packageData) {
    if (!packageData) {
      return "";
    }

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Riesgos</h3>
          <span class="status-note">${packageData.risks.length}</span>
        </div>
        <div class="workshop-observation-list">
          ${packageData.risks.length ? packageData.risks.map((item) => `
            <article class="workshop-observation-card">
              <strong>${this.escape(item.activityName)}</strong>
              <p>${this.escape(item.risk)}</p>
              <p class="status-note">${this.escape(item.severity)}</p>
            </article>
          `).join("") : "<p class=\"status-note\">Sin riesgos registrados.</p>"}
        </div>
      </section>
    `;
  },

  renderQuestions(state) {
    const questions = state.questions || [];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Preguntas pendientes</h3>
          <span class="status-note">${questions.length}</span>
        </div>
        <ul class="validation-list">
          ${questions.length ? questions.map((question) => `
            <li class="${question.blocksConsolidation ? "is-failed" : "is-warning"}">
              <span>${this.escape(question.priority || "Media")}</span>
              <div>
                <strong>${this.escape(question.question)}</strong>
                <p>${this.escape(question.reason)}</p>
              </div>
            </li>
          `).join("") : "<li class=\"is-passed\"><span>OK</span><div><strong>Sin preguntas pendientes</strong><p>El To-Be Package puede revisarse.</p></div></li>"}
        </ul>
      </section>
    `;
  },

  renderChat(state) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Chat del Consultor Digital</h3>
        <div class="consultant-chat">
          ${(state.chat || []).map((message) => `
            <article class="chat-message ${message.author === "consultant" ? "is-consultant" : "is-user"}">
              <span>${this.escape(message.author)}</span>
              <p>${this.escape(message.text)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  },

  findSelectedDecision(state) {
    const packageData = state.toBePackage;

    if (!packageData || !packageData.changeJustifications || !packageData.changeJustifications.length) {
      return null;
    }

    return packageData.changeJustifications.find((item) => item.activityUUID === state.selectedActivityUUID) || packageData.changeJustifications[0];
  },

  dimension(label, value) {
    return `
      <div class="dimension-card">
        <span>${this.escape(label)}</span>
        <strong>${this.escape(value)}</strong>
      </div>
    `;
  },

  escape(value) {
    return window.DomUtils.escapeHtml(value === undefined || value === null ? "" : String(value));
  }
});
