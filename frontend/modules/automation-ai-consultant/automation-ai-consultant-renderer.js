window.AutomationAiConsultantRenderer = Object.freeze({
  render(state, session) {
    const model = state.sources.processState.draftProcessModel;
    const selected = this.findSelectedOpportunity(state);

    return `
      <section class="automation-ai-consultant" aria-labelledby="automation-ai-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 14 - Automation & AI Transformation Consultant</p>
            <h2 id="automation-ai-title" class="page-title">Automation & AI Transformation Consultant</h2>
            <p class="page-description">Identifica oportunidades digitales, automatizacion e IA con evidencia trazable y sin construir To-Be, Business Case o Roadmap.</p>
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
        <p>El Automation & AI Transformation Consultant necesita un Process Model enriquecido con datos operativos, VSM, Lean y TOC antes de evaluar oportunidades digitales.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    const packageData = state.opportunityPackage;

    return `
      <div class="automation-ai-layout">
        <aside class="automation-ai-left">
          ${this.renderActions(packageData)}
          ${this.renderSummary(packageData)}
          ${this.renderActivities(state, selected)}
        </aside>
        <main class="automation-ai-main">
          ${packageData ? this.renderExecutiveSummary(packageData) : this.renderRunPrompt()}
          ${packageData ? this.renderActivityDetail(selected) : ""}
          ${packageData ? this.renderConsolidatedOpportunities(packageData) : ""}
          ${packageData ? this.renderBenefits(packageData) : ""}
        </main>
        <aside class="automation-ai-right">
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
        <p class="page-kicker">Automation & AI Opportunity Package</p>
        <h3 class="panel-title">${packageData ? this.escape(packageData.status) : "No generado"}</h3>
        <button class="primary-button" id="run-automation-ai-assessment" type="button">Ejecutar diagnostico digital</button>
        <p class="status-note">No ejecuta IA, no genera To-Be, Business Case, Roadmap ni Executive Report.</p>
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
        <h3 class="panel-title">Resumen digital</h3>
        <div class="dimension-grid">
          ${this.dimension("Actividades", summary.totalActivities)}
          ${this.dimension("Automatizacion", summary.activitiesWithAutomation)}
          ${this.dimension("IA", summary.activitiesWithAi)}
          ${this.dimension("Oportunidades", summary.consolidatedOpportunities)}
          ${this.dimension("Quick Wins", summary.quickWins)}
          ${this.dimension("Beneficios", summary.benefitsEstimated)}
          ${this.dimension("Riesgos", summary.risks)}
          ${this.dimension("Confianza", summary.averageConfidence)}
        </div>
      </section>
    `;
  },

  renderActivities(state, selected) {
    const activities = state.opportunityPackage ? state.opportunityPackage.activityOpportunities : (state.sources.processState.draftProcessModel.activities || []).map((activity) => ({
      activityUUID: activity.activityUUID,
      sequence: activity.sequence,
      activityName: activity.name,
      automationPotential: { label: "Pendiente" },
      aiOpportunities: []
    }));

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Actividades</h3>
          <span class="status-note">${activities.length}</span>
        </div>
        <div class="activity-selector-list">
          ${activities.map((assessment) => `
            <button class="activity-selector ${selected && selected.activityUUID === assessment.activityUUID ? "is-selected" : ""}" data-automation-ai-activity-uuid="${this.escape(assessment.activityUUID)}" type="button">
              <strong>${this.escape(assessment.sequence)}. ${this.escape(assessment.activityName)}</strong>
              <span>${this.escape(assessment.automationPotential.label)} / IA: ${assessment.aiOpportunities.length}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderRunPrompt() {
    return `
      <section class="conversation-card">
        <h3>Ejecuta el diagnostico digital</h3>
        <p>El consultor evaluara automatizacion, IA, requisitos, beneficios, complejidad, riesgos y preguntas usando evidencia existente.</p>
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

  renderActivityDetail(assessment) {
    if (!assessment) {
      return `<section class="conversation-card"><h3>Sin actividad seleccionada</h3><p>Selecciona una actividad para ver oportunidades digitales.</p></section>`;
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
        <div class="automation-ai-potential-box">
          <strong>${this.escape(assessment.automationPotential.label)}</strong>
          <p>${this.escape(assessment.automationPotential.rationale)}</p>
          <small>${this.escape(assessment.automationPotential.confidence)}</small>
        </div>
        <div class="dimension-grid">
          ${this.dimension("Tiempo", assessment.metrics.processTime.toFixed(1))}
          ${this.dimension("Frecuencia", assessment.metrics.frequency.toFixed(1))}
          ${this.dimension("Ejec. anuales", assessment.metrics.annualExecutions)}
          ${this.dimension("Complejidad", assessment.complexity.level)}
        </div>
        <h4 class="panel-title">Oportunidades IA</h4>
        <div class="automation-ai-chip-list">
          ${assessment.aiOpportunities.length ? assessment.aiOpportunities.map((item) => `
            <span class="automation-ai-chip">${this.escape(item.aiOpportunityType)} · ${this.escape(item.confidence)}</span>
          `).join("") : "<p class=\"status-note\">Sin oportunidades IA con evidencia suficiente.</p>"}
        </div>
        <section class="activity-meta">
          <p><strong>Datos requeridos:</strong> ${this.escape(assessment.requirements.dataRequired.join(", ") || "No determinados")}</p>
          <p><strong>Integraciones:</strong> ${this.escape(assessment.requirements.integrationsNeeded.join(" | ") || "No determinadas")}</p>
          <p><strong>Beneficio:</strong> ${this.escape(assessment.expectedBenefits.productivityIncrease)}</p>
          <p><strong>Complejidad:</strong> ${this.escape(assessment.complexity.rationale)}</p>
        </section>
        <h4 class="panel-title">Quick Wins digitales</h4>
        <div class="workshop-observation-list">
          ${assessment.quickWins.length ? assessment.quickWins.map((item) => `
            <article class="workshop-observation-card">
              <strong>${this.escape(item.description)}</strong>
              <p>${this.escape(item.benefit)}</p>
              <p class="status-note">Esfuerzo: ${this.escape(item.effort)} · ${this.escape(item.confidence)}</p>
            </article>
          `).join("") : "<p class=\"status-note\">Sin Quick Wins digitales con evidencia suficiente.</p>"}
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

  renderConsolidatedOpportunities(packageData) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Oportunidades consolidadas</h3>
          <span class="status-note">${packageData.consolidatedOpportunities.length}</span>
        </div>
        <div class="requirements-board">
          ${packageData.consolidatedOpportunities.length ? packageData.consolidatedOpportunities.map((item) => `
            <article class="requirement-card">
              <strong>${this.escape(item.category)}</strong>
              <span>${this.escape(item.activityName)}</span>
              <span>${this.escape(item.description)}</span>
              <span>${this.escape(item.complexity)} · ${this.escape(item.confidence)}</span>
            </article>
          `).join("") : "<p class=\"status-note\">Sin oportunidades consolidadas.</p>"}
        </div>
      </section>
    `;
  },

  renderBenefits(packageData) {
    const groups = [
      ["Reduccion tiempo", packageData.expectedBenefits.timeReduction],
      ["Productividad", packageData.expectedBenefits.productivityIncrease],
      ["Trazabilidad", packageData.expectedBenefits.traceabilityImprovement]
    ];

    return `
      <section class="studio-panel">
        <h3 class="panel-title">Beneficios esperados</h3>
        ${groups.map(([label, items]) => `
          <div class="automation-ai-benefit-group">
            <strong>${this.escape(label)}</strong>
            ${items.length ? items.map((item) => `<p>${this.escape(item.activityName)}: ${this.escape(item.value)}</p>`).join("") : "<p class=\"status-note\">No estimable con la informacion disponible.</p>"}
          </div>
        `).join("")}
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
          <h3 class="panel-title">Riesgos tecnicos</h3>
          <span class="status-note">${packageData.risks.length}</span>
        </div>
        <div class="workshop-observation-list">
          ${packageData.risks.length ? packageData.risks.map((item) => `
            <article class="workshop-observation-card">
              <strong>${this.escape(item.activityName)}</strong>
              <p>${this.escape(item.risk)}</p>
              <p class="status-note">${this.escape(item.severity)}</p>
            </article>
          `).join("") : "<p class=\"status-note\">Sin riesgos tecnicos detectados.</p>"}
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
          `).join("") : "<li class=\"is-passed\"><span>OK</span><div><strong>Sin preguntas pendientes</strong><p>El paquete puede revisarse.</p></div></li>"}
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

  findSelectedOpportunity(state) {
    const packageData = state.opportunityPackage;

    if (!packageData || !packageData.activityOpportunities || !packageData.activityOpportunities.length) {
      return null;
    }

    return packageData.activityOpportunities.find((item) => item.activityUUID === state.selectedActivityUUID) || packageData.activityOpportunities[0];
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
