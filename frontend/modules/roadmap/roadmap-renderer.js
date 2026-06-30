window.RoadmapRenderer = Object.freeze({
  render(state, session) {
    const selected = this.findSelectedPhase(state);

    return `
      <section class="roadmap" aria-labelledby="roadmap-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 17 - Transformation Roadmap Generator</p>
            <h2 id="roadmap-title" class="page-title">Transformation Roadmap Generator</h2>
            <p class="page-description">Convierte el Business Case en un plan de implementacion ejecutable por horizontes y fases, sin fechas reales ni Gantt.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        ${state.sources.businessCasePackage ? this.renderWorkspace(state, selected) : this.renderEmpty()}
      </section>
    `;
  },

  renderEmpty() {
    return `
      <section class="conversation-card">
        <h3>Business Case Package requerido</h3>
        <p>El Transformation Roadmap Generator necesita un Business Case Package vigente. No genera Executive Report.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    const packageData = state.roadmapPackage;

    return `
      <div class="roadmap-layout">
        <aside class="roadmap-left">
          ${this.renderActions(packageData)}
          ${this.renderSummary(packageData)}
          ${this.renderPhases(state, selected)}
        </aside>
        <main class="roadmap-main">
          ${packageData ? this.renderExecutiveSummary(packageData) : this.renderRunPrompt()}
          ${packageData ? this.renderPhaseDetail(selected, packageData) : ""}
          ${packageData ? this.renderInitiatives(packageData) : ""}
          ${packageData ? this.renderResources(packageData) : ""}
        </main>
        <aside class="roadmap-right">
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
        <p class="page-kicker">Roadmap Package</p>
        <h3 class="panel-title">${packageData ? this.escape(packageData.status) : "No generado"}</h3>
        <button class="primary-button" id="run-roadmap" type="button">Generar Roadmap</button>
        <p class="status-note">No genera fechas calendario, Gantt ni Executive Report.</p>
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
        <h3 class="panel-title">Resumen Roadmap</h3>
        <div class="dimension-grid">
          ${this.dimension("Iniciativas", summary.totalInitiatives)}
          ${this.dimension("Fases", summary.totalPhases)}
          ${this.dimension("Quick Wins", summary.quickWins)}
          ${this.dimension("Corto", summary.shortTerm)}
          ${this.dimension("Mediano", summary.mediumTerm)}
          ${this.dimension("Largo", summary.longTerm)}
          ${this.dimension("Preguntas", summary.pendingQuestions)}
          ${this.dimension("Confianza", summary.averageConfidence)}
        </div>
      </section>
    `;
  },

  renderPhases(state, selected) {
    const phases = state.roadmapPackage ? state.roadmapPackage.phases : [];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Fases</h3>
          <span class="status-note">${phases.length}</span>
        </div>
        <div class="activity-selector-list">
          ${phases.length ? phases.map((phase) => `
            <button class="activity-selector ${selected && selected.phaseId === phase.phaseId ? "is-selected" : ""}" data-roadmap-phase-id="${this.escape(phase.phaseId)}" type="button">
              <strong>${this.escape(phase.sequence)}. ${this.escape(phase.name)}</strong>
              <span>${this.escape(phase.timeframe)} / ${phase.initiatives.length} iniciativa(s)</span>
            </button>
          `).join("") : "<p class=\"status-note\">Genera el Roadmap para ver fases.</p>"}
        </div>
      </section>
    `;
  },

  renderRunPrompt() {
    return `
      <section class="conversation-card">
        <h3>Genera el Roadmap</h3>
        <p>El consultor ordenara iniciativas por horizonte, fase, dependencias, recursos y riesgos usando el Business Case.</p>
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

  renderPhaseDetail(phase, packageData) {
    if (!phase) {
      return `<section class="conversation-card"><h3>Sin fase seleccionada</h3><p>Selecciona una fase para revisar iniciativas y criterios.</p></section>`;
    }

    const initiatives = packageData.prioritizedInitiatives.filter((initiative) => phase.initiatives.includes(initiative.roadmapInitiativeId));

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <div>
            <p class="page-kicker">${this.escape(phase.timeframe)}</p>
            <h3 class="panel-title">${this.escape(phase.name)}</h3>
          </div>
          <span class="confidence-badge">${this.escape(phase.confidence)}</span>
        </div>
        <p>${this.escape(phase.objective)}</p>
        <div class="requirements-board">
          ${initiatives.map((initiative) => `
            <article class="requirement-card">
              <strong>${this.escape(initiative.name)}</strong>
              <span>${this.escape(initiative.objective)}</span>
              <span>${this.escape(initiative.estimatedEffort)} · ${this.escape(initiative.complexity)} · ${this.escape(initiative.confidence)}</span>
            </article>
          `).join("")}
        </div>
        <h4 class="panel-title">Criterios de exito</h4>
        <ul class="validation-list">
          ${phase.successCriteria.map((item) => `<li class="is-passed"><span>OK</span><div><strong>${this.escape(item)}</strong></div></li>`).join("")}
        </ul>
      </section>
    `;
  },

  renderInitiatives(packageData) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Iniciativas priorizadas</h3>
        <div class="requirements-board">
          ${packageData.prioritizedInitiatives.map((initiative) => `
            <article class="requirement-card">
              <strong>${this.escape(initiative.name)}</strong>
              <span>${this.escape(initiative.horizon.label)} · ${this.escape(initiative.priority)}</span>
              <span>${this.escape(initiative.expectedBenefit)}</span>
              <span>${this.escape(initiative.suggestedResponsible)} / ${this.escape(initiative.responsibleArea)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderResources(packageData) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Recursos</h3>
        <section class="activity-meta">
          <p><strong>Areas:</strong> ${this.escape(packageData.resources.involvedAreas.join(", ") || "No definidas")}</p>
          <p><strong>Roles:</strong> ${this.escape(packageData.resources.suggestedRoles.join(", ") || "No definidos")}</p>
          <p><strong>Equipos:</strong> ${this.escape(packageData.resources.requiredTeams.join(", ") || "No definidos")}</p>
        </section>
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
              <strong>${this.escape(item.initiativeName)}</strong>
              <p>${this.escape(item.description)}</p>
              <p class="status-note">${this.escape(item.type)} · ${this.escape(item.severity)}</p>
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
          `).join("") : "<li class=\"is-passed\"><span>OK</span><div><strong>Sin preguntas pendientes</strong><p>El Roadmap Package puede revisarse.</p></div></li>"}
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

  findSelectedPhase(state) {
    const packageData = state.roadmapPackage;

    if (!packageData || !packageData.phases || !packageData.phases.length) {
      return null;
    }

    return packageData.phases.find((phase) => phase.phaseId === state.selectedPhaseId) || packageData.phases[0];
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
