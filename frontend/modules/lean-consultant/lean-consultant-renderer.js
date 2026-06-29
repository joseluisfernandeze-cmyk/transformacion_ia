window.LeanConsultantRenderer = Object.freeze({
  render(state, session) {
    const model = state.sources.processState.draftProcessModel;
    const selected = this.findSelectedAssessment(state);

    return `
      <section class="lean-consultant" aria-labelledby="lean-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 12 - Lean Transformation Consultant</p>
            <h2 id="lean-title" class="page-title">Lean Transformation Consultant</h2>
            <p class="page-description">Diagnostico Lean trazable por actividad usando Process Model, datos operativos, VSM, observaciones, Knowledge Package y Context Graph.</p>
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
        <h3>Process Model requerido</h3>
        <p>El Lean Transformation Consultant necesita un Process Model validado y enriquecido antes de generar diagnostico.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    const packageData = state.assessmentPackage;

    return `
      <div class="lean-layout">
        <aside class="lean-left">
          ${this.renderActions(packageData)}
          ${this.renderSummary(packageData)}
          ${this.renderActivities(state, selected)}
        </aside>
        <main class="lean-main">
          ${packageData ? this.renderAssessmentDetail(selected) : this.renderRunPrompt()}
          ${packageData ? this.renderQuickWins(packageData) : ""}
          ${packageData ? this.renderOpportunities(packageData) : ""}
        </main>
        <aside class="lean-right">
          ${this.renderQuestions(state)}
          ${this.renderChat(state)}
        </aside>
      </div>
    `;
  },

  renderActions(packageData) {
    return `
      <section class="studio-panel">
        <p class="page-kicker">Lean Assessment Package</p>
        <h3 class="panel-title">${packageData ? this.escape(packageData.status) : "No generado"}</h3>
        <button class="primary-button" id="run-lean-assessment" type="button">Ejecutar diagnostico Lean</button>
        <p class="status-note">El diagnostico no usa IA nueva ni inventa hallazgos; solo interpreta evidencia existente.</p>
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
        <h3 class="panel-title">Resumen Lean</h3>
        <div class="dimension-grid">
          ${this.dimension("Actividades", summary.totalActivities)}
          ${this.dimension("VA", summary.vaActivities)}
          ${this.dimension("NNVA", summary.nnvaActivities)}
          ${this.dimension("NVA", summary.nvaActivities)}
          ${this.dimension("Desperdicios", summary.detectedWasteCount)}
          ${this.dimension("Quick Wins", summary.quickWinCount)}
          ${this.dimension("Oportunidades", summary.opportunityCount)}
          ${this.dimension("Confianza", summary.averageConfidence)}
        </div>
      </section>
    `;
  },

  renderActivities(state, selected) {
    const activities = state.assessmentPackage ? state.assessmentPackage.activityAssessments : (state.sources.processState.draftProcessModel.activities || []).map((activity) => ({
      activityUUID: activity.activityUUID,
      sequence: activity.sequence,
      activityName: activity.name,
      valueClassification: { classification: "PENDING" },
      wastes: []
    }));

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Actividades</h3>
          <span class="status-note">${activities.length}</span>
        </div>
        <div class="activity-selector-list">
          ${activities.map((assessment) => {
            const wasteCount = (assessment.wastes || []).filter((waste) => waste.detected).length;
            return `
              <button class="activity-selector ${selected && selected.activityUUID === assessment.activityUUID ? "is-selected" : ""}" data-lean-activity-uuid="${this.escape(assessment.activityUUID)}" type="button">
                <strong>${this.escape(assessment.sequence)}. ${this.escape(assessment.activityName)}</strong>
                <span>${this.escape(assessment.valueClassification.classification)} / ${wasteCount} desperdicio(s)</span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  },

  renderRunPrompt() {
    return `
      <section class="conversation-card">
        <h3>Ejecuta el diagnostico Lean</h3>
        <p>El consultor analizara valor agregado, ocho desperdicios, quick wins, oportunidades Lean y preguntas de aclaracion.</p>
      </section>
    `;
  },

  renderAssessmentDetail(assessment) {
    if (!assessment) {
      return `<section class="conversation-card"><h3>Sin actividad seleccionada</h3><p>Selecciona una actividad para ver el diagnostico.</p></section>`;
    }

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <div>
            <p class="page-kicker">Actividad</p>
            <h3 class="panel-title">${this.escape(assessment.activityName)}</h3>
          </div>
          <span class="confidence-badge">${this.escape(assessment.confidence)}</span>
        </div>
        <div class="lean-value-box classification-${this.escape(assessment.valueClassification.classification.toLowerCase())}">
          <strong>${this.escape(assessment.valueClassification.classification)}</strong>
          <p>${this.escape(assessment.valueClassification.justification)}</p>
          <small>${this.escape(assessment.valueClassification.confidence)}</small>
        </div>
        <h4 class="panel-title">Desperdicios Lean</h4>
        <div class="lean-waste-grid">
          ${assessment.wastes.map((waste) => this.renderWaste(waste)).join("")}
        </div>
        <h4 class="panel-title">Evidencia utilizada</h4>
        <ul class="validation-list">
          ${assessment.evidence.length ? assessment.evidence.map((item) => `
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

  renderWaste(waste) {
    return `
      <article class="lean-waste-card ${waste.detected ? "is-detected" : ""}">
        <div class="context-section-header">
          <strong>${this.escape(waste.wasteName)}</strong>
          <span class="status-note">${this.escape(waste.severity)}</span>
        </div>
        <p>${this.escape(waste.rationale)}</p>
        <small>${this.escape(waste.confidence)}</small>
      </article>
    `;
  },

  renderQuickWins(packageData) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Quick Wins</h3>
          <span class="status-note">${packageData.quickWins.length}</span>
        </div>
        <div class="workshop-observation-list">
          ${packageData.quickWins.length ? packageData.quickWins.map((item) => `
            <article class="workshop-observation-card">
              <strong>${this.escape(item.activityName)}</strong>
              <p>${this.escape(item.description)}</p>
              <p class="status-note">${this.escape(item.justification)}</p>
            </article>
          `).join("") : "<p class=\"status-note\">Sin quick wins detectados con evidencia suficiente.</p>"}
        </div>
      </section>
    `;
  },

  renderOpportunities(packageData) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Oportunidades Lean</h3>
          <span class="status-note">${packageData.opportunities.length}</span>
        </div>
        <div class="requirements-board">
          ${packageData.opportunities.length ? packageData.opportunities.map((item) => `
            <article class="requirement-card">
              <strong>${this.escape(item.wasteType)}</strong>
              <span>${this.escape(item.description)}</span>
              <span>Beneficio: ${this.escape(item.expectedBenefit)}</span>
              <span>Esfuerzo: ${this.escape(item.estimatedEffort)} / ${this.escape(item.confidence)}</span>
            </article>
          `).join("") : "<p class=\"status-note\">Sin oportunidades Lean detectadas.</p>"}
        </div>
      </section>
    `;
  },

  renderQuestions(state) {
    const openQuestions = (state.questions || []).filter((question) => question.status === "OPEN");

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Preguntas</h3>
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

  findSelectedAssessment(state) {
    const assessments = state.assessmentPackage ? state.assessmentPackage.activityAssessments : null;

    if (!assessments || !assessments.length) {
      return null;
    }

    return assessments.find((item) => item.activityUUID === state.selectedActivityUUID) || assessments[0];
  },

  dimension(label, value) {
    return `
      <div class="dimension-card">
        <p>${this.escape(label)}</p>
        <strong>${this.escape(value)}</strong>
      </div>
    `;
  },

  escape(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
