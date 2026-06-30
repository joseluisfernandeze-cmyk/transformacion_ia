window.TocConsultantRenderer = Object.freeze({
  render(state, session) {
    const model = state.sources.processState.draftProcessModel;
    const selected = this.findSelectedAssessment(state);

    return `
      <section class="toc-consultant" aria-labelledby="toc-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 13 - TOC Transformation Consultant</p>
            <h2 id="toc-title" class="page-title">TOC Transformation Consultant</h2>
            <p class="page-description">Identifica restricciones reales, cuellos de botella, dependencias criticas y acciones TOC con evidencia trazable.</p>
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
        <p>El TOC Transformation Consultant necesita un Process Model enriquecido con datos operativos y VSM antes de diagnosticar restricciones.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    const packageData = state.assessmentPackage;

    return `
      <div class="toc-layout">
        <aside class="toc-left">
          ${this.renderActions(packageData)}
          ${this.renderSummary(packageData)}
          ${this.renderActivities(state, selected)}
        </aside>
        <main class="toc-main">
          ${packageData ? this.renderExecutiveSummary(packageData) : this.renderRunPrompt()}
          ${packageData ? this.renderAssessmentDetail(selected) : ""}
          ${packageData ? this.renderBottlenecks(packageData) : ""}
          ${packageData ? this.renderActionsList(packageData) : ""}
        </main>
        <aside class="toc-right">
          ${this.renderQuestions(state)}
          ${this.renderChat(state)}
        </aside>
      </div>
    `;
  },

  renderActions(packageData) {
    return `
      <section class="studio-panel">
        <p class="page-kicker">TOC Assessment Package</p>
        <h3 class="panel-title">${packageData ? this.escape(packageData.status) : "No generado"}</h3>
        <button class="primary-button" id="run-toc-assessment" type="button">Ejecutar diagnostico TOC</button>
        <p class="status-note">No se generan Business Case, To-Be, Roadmap ni automatizaciones.</p>
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
        <h3 class="panel-title">Resumen TOC</h3>
        <div class="dimension-grid">
          ${this.dimension("Actividades", summary.totalActivities)}
          ${this.dimension("Restricciones", summary.constraintsDetected)}
          ${this.dimension("Cuellos", summary.bottlenecksDetected)}
          ${this.dimension("Dependencias", summary.criticalDependencies)}
          ${this.dimension("Acciones", summary.suggestedActions)}
          ${this.dimension("Preguntas", summary.pendingQuestions)}
          ${this.dimension("Criticidad alta", summary.highCriticality)}
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
      constraintAnalysis: { constraintLabel: "Pendiente" },
      bottleneckAnalysis: { isBottleneck: false }
    }));

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Actividades</h3>
          <span class="status-note">${activities.length}</span>
        </div>
        <div class="activity-selector-list">
          ${activities.map((assessment) => `
            <button class="activity-selector ${selected && selected.activityUUID === assessment.activityUUID ? "is-selected" : ""}" data-toc-activity-uuid="${this.escape(assessment.activityUUID)}" type="button">
              <strong>${this.escape(assessment.sequence)}. ${this.escape(assessment.activityName)}</strong>
              <span>${this.escape(assessment.constraintAnalysis.constraintLabel)} / ${assessment.bottleneckAnalysis.isBottleneck ? "Cuello" : "Sin cuello"}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderRunPrompt() {
    return `
      <section class="conversation-card">
        <h3>Ejecuta el diagnostico TOC</h3>
        <p>El consultor evaluara restricciones, cuellos de botella, dependencias, impacto y acciones TOC usando evidencia existente.</p>
      </section>
    `;
  },

  renderExecutiveSummary(packageData) {
    return `
      <section class="studio-panel">
        <p class="page-kicker">Resumen Ejecutivo</p>
        <h3 class="panel-title">${this.escape(packageData.status)}</h3>
        <p>${this.escape(packageData.executiveSummary)}</p>
      </section>
    `;
  },

  renderAssessmentDetail(assessment) {
    if (!assessment) {
      return `<section class="conversation-card"><h3>Sin actividad seleccionada</h3><p>Selecciona una actividad para ver el diagnostico TOC.</p></section>`;
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
        <div class="toc-constraint-box ${assessment.constraintAnalysis.exists ? "is-constraint" : ""}">
          <strong>${this.escape(assessment.constraintAnalysis.constraintLabel)}</strong>
          <p>${this.escape(assessment.constraintAnalysis.rationale)}</p>
          <small>${this.escape(assessment.constraintAnalysis.confidence)}</small>
        </div>
        <div class="dimension-grid">
          ${this.dimension("Ciclo", assessment.metrics.cycleTime.toFixed(1))}
          ${this.dimension("Espera", assessment.metrics.waitTime.toFixed(1))}
          ${this.dimension("Utilizacion", `${assessment.metrics.utilization}%`)}
          ${this.dimension("Criticidad", assessment.impact.criticality)}
        </div>
        <section class="activity-meta">
          <p><strong>Impacto Lead Time:</strong> ${this.escape(assessment.impact.leadTimeImpact)}</p>
          <p><strong>Impacto Throughput:</strong> ${this.escape(assessment.impact.throughputImpact)}</p>
          <p><strong>Aguas arriba:</strong> ${this.escape(assessment.dependencies.upstream.join(", ") || "Sin dependencias registradas")}</p>
          <p><strong>Aguas abajo:</strong> ${this.escape(assessment.dependencies.downstream.join(", ") || "Sin dependencias registradas")}</p>
        </section>
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

  renderBottlenecks(packageData) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Cuellos de botella</h3>
          <span class="status-note">${packageData.bottlenecks.length}</span>
        </div>
        <div class="workshop-observation-list">
          ${packageData.bottlenecks.length ? packageData.bottlenecks.map((item) => `
            <article class="workshop-observation-card">
              <strong>${this.escape(item.activityName)}</strong>
              <p>${this.escape(item.rationale)}</p>
              <p class="status-note">${this.escape(item.confidence)}</p>
            </article>
          `).join("") : "<p class=\"status-note\">Sin cuellos de botella con evidencia suficiente.</p>"}
        </div>
      </section>
    `;
  },

  renderActionsList(packageData) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Acciones TOC sugeridas</h3>
          <span class="status-note">${packageData.suggestedActions.length}</span>
        </div>
        <div class="requirements-board">
          ${packageData.suggestedActions.length ? packageData.suggestedActions.map((item) => `
            <article class="requirement-card">
              <strong>${this.escape(item.label)}</strong>
              <span>${this.escape(item.activityName)}</span>
              <span>${this.escape(item.description)}</span>
              <span>${this.escape(item.confidence)}</span>
            </article>
          `).join("") : "<p class=\"status-note\">Sin acciones TOC sugeridas por falta de evidencia.</p>"}
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
