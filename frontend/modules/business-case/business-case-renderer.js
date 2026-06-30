window.BusinessCaseRenderer = Object.freeze({
  render(state, session) {
    const selected = this.findSelectedInitiative(state);

    return `
      <section class="business-case" aria-labelledby="business-case-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 16 - Business Case Generator</p>
            <h2 id="business-case-title" class="page-title">Business Case Generator</h2>
            <p class="page-description">Cuantifica beneficios operacionales, economicos y estrategicos de la transformacion propuesta.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        ${state.sources.toBePackage ? this.renderWorkspace(state, selected) : this.renderEmpty()}
      </section>
    `;
  },

  renderEmpty() {
    return `
      <section class="conversation-card">
        <h3>To-Be Package requerido</h3>
        <p>El Business Case Generator necesita un To-Be Package vigente. No construye Roadmap ni Executive Report.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    const packageData = state.businessCasePackage;

    return `
      <div class="business-case-layout">
        <aside class="business-case-left">
          ${this.renderActions(packageData)}
          ${this.renderSummary(packageData)}
          ${this.renderInitiatives(state, selected)}
        </aside>
        <main class="business-case-main">
          ${packageData ? this.renderExecutiveSummary(packageData) : this.renderRunPrompt()}
          ${packageData ? this.renderInitiativeDetail(selected) : ""}
          ${packageData ? this.renderBenefits(packageData) : ""}
          ${packageData ? this.renderPrioritization(packageData) : ""}
        </main>
        <aside class="business-case-right">
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
        <p class="page-kicker">Business Case Package</p>
        <h3 class="panel-title">${packageData ? this.escape(packageData.status) : "No generado"}</h3>
        <button class="primary-button" id="run-business-case" type="button">Generar Business Case</button>
        <p class="status-note">No genera Roadmap ni Executive Report.</p>
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
        <h3 class="panel-title">Resumen financiero</h3>
        <div class="dimension-grid">
          ${this.dimension("Iniciativas", summary.totalInitiatives)}
          ${this.dimension("Quick Wins", summary.quickWins)}
          ${this.dimension("Estimadas", summary.estimatedInitiatives)}
          ${this.dimension("Beneficio anual", summary.annualEstimatedBenefit)}
          ${this.dimension("ROI", summary.roi)}
          ${this.dimension("Payback", summary.payback)}
          ${this.dimension("Preguntas", summary.pendingQuestions)}
          ${this.dimension("Confianza", summary.averageConfidence)}
        </div>
      </section>
    `;
  },

  renderInitiatives(state, selected) {
    const initiatives = state.businessCasePackage ? state.businessCasePackage.initiatives : [];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Iniciativas</h3>
          <span class="status-note">${initiatives.length}</span>
        </div>
        <div class="activity-selector-list">
          ${initiatives.length ? initiatives.map((initiative) => `
            <button class="activity-selector ${selected && selected.initiativeId === initiative.initiativeId ? "is-selected" : ""}" data-business-case-initiative-id="${this.escape(initiative.initiativeId)}" type="button">
              <strong>${this.escape(initiative.activityName)}</strong>
              <span>${this.escape(initiative.priority)} / ${this.escape(initiative.financialIndicators.roi)}</span>
            </button>
          `).join("") : "<p class=\"status-note\">Genera el Business Case para ver iniciativas.</p>"}
        </div>
      </section>
    `;
  },

  renderRunPrompt() {
    return `
      <section class="conversation-card">
        <h3>Genera el caso de negocio</h3>
        <p>El consultor cuantificara beneficios, costos, ROI, Payback, priorizacion, riesgos y preguntas usando el To-Be Package.</p>
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

  renderInitiativeDetail(initiative) {
    if (!initiative) {
      return `<section class="conversation-card"><h3>Sin iniciativa seleccionada</h3><p>Selecciona una iniciativa para ver su caso de negocio.</p></section>`;
    }

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <div>
            <p class="page-kicker">Iniciativa</p>
            <h3 class="panel-title">${this.escape(initiative.activityName)}</h3>
          </div>
          <span class="confidence-badge">${this.escape(initiative.confidence)}</span>
        </div>
        <div class="dimension-grid">
          ${this.dimension("Prioridad", initiative.priority)}
          ${this.dimension("Horas", initiative.economicBenefits.hoursRecovered)}
          ${this.dimension("FTE", initiative.economicBenefits.potentialFteReleased)}
          ${this.dimension("Ahorro", initiative.economicBenefits.estimatedSavings)}
          ${this.dimension("Costo", initiative.implementationCosts.totalEstimatedCost)}
          ${this.dimension("ROI", initiative.financialIndicators.roi)}
          ${this.dimension("Payback", initiative.financialIndicators.payback)}
          ${this.dimension("B/E", initiative.financialIndicators.benefitEffortRatio)}
        </div>
        <section class="activity-meta">
          <p><strong>Descripcion:</strong> ${this.escape(initiative.description)}</p>
          <p><strong>Lead Time:</strong> ${this.escape(initiative.operationalBenefits.leadTimeReduction)}</p>
          <p><strong>Productividad:</strong> ${this.escape(initiative.operationalBenefits.productivityIncrease)}</p>
          <p><strong>Costos evitados:</strong> ${this.escape(initiative.economicBenefits.avoidedCosts.join(" | "))}</p>
        </section>
        <h4 class="panel-title">Evidencia utilizada</h4>
        <ul class="validation-list">
          ${initiative.evidence.length ? initiative.evidence.map((item) => `
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

  renderBenefits(packageData) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Beneficios consolidados</h3>
        <div class="dimension-grid">
          ${this.dimension("Reduccion LT", packageData.operationalBenefits.leadTimeReduction)}
          ${this.dimension("Actividades menos", packageData.operationalBenefits.activityReduction)}
          ${this.dimension("Horas recuperadas", packageData.economicBenefits.hoursRecovered)}
          ${this.dimension("FTE", packageData.economicBenefits.potentialFteReleased)}
          ${this.dimension("Beneficio anual", packageData.economicBenefits.annualBenefits)}
          ${this.dimension("Costo total", packageData.implementationCosts.totalEstimatedCost)}
        </div>
      </section>
    `;
  },

  renderPrioritization(packageData) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Priorizacion</h3>
        <div class="requirements-board">
          ${packageData.prioritization.map((group) => `
            <article class="requirement-card">
              <strong>${this.escape(group.priority)}</strong>
              <span>${group.initiatives.length} iniciativa(s)</span>
              <span>${this.escape(group.initiatives.map((item) => item.activityName).join(", ") || "Sin iniciativas")}</span>
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
          `).join("") : "<li class=\"is-passed\"><span>OK</span><div><strong>Sin preguntas pendientes</strong><p>El Business Case Package puede revisarse.</p></div></li>"}
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

  findSelectedInitiative(state) {
    const packageData = state.businessCasePackage;

    if (!packageData || !packageData.initiatives || !packageData.initiatives.length) {
      return null;
    }

    return packageData.initiatives.find((item) => item.initiativeId === state.selectedInitiativeId) || packageData.initiatives[0];
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
