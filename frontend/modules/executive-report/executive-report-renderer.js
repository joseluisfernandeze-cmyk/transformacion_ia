window.ExecutiveReportRenderer = Object.freeze({
  render(state, session) {
    const selected = this.findSelectedSection(state);

    return `
      <section class="executive-report" aria-labelledby="executive-report-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 18 - Executive Report Generator</p>
            <h2 id="executive-report-title" class="page-title">Executive Report Generator</h2>
            <p class="page-description">Consolida toda la consultoria en un modelo interno de informe ejecutivo profesional.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        ${state.sources.roadmapPackage ? this.renderWorkspace(state, selected) : this.renderEmpty()}
      </section>
    `;
  },

  renderEmpty() {
    return `
      <section class="conversation-card">
        <h3>Roadmap Package requerido</h3>
        <p>El Executive Report Generator necesita un Roadmap Package vigente. La exportacion fisica se implementara posteriormente.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    const packageData = state.executiveReportPackage;

    return `
      <div class="executive-report-layout">
        <aside class="executive-report-left">
          ${this.renderActions(packageData)}
          ${this.renderSummary(packageData)}
          ${this.renderSections(state, selected)}
        </aside>
        <main class="executive-report-main">
          ${packageData ? this.renderExecutiveSummary(packageData) : this.renderRunPrompt()}
          ${packageData ? this.renderSectionDetail(selected) : ""}
          ${packageData ? this.renderRecommendations(packageData) : ""}
          ${packageData ? this.renderExportModel(packageData) : ""}
        </main>
        <aside class="executive-report-right">
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
        <p class="page-kicker">Executive Report Package</p>
        <h3 class="panel-title">${packageData ? this.escape(packageData.status) : "No generado"}</h3>
        <button class="primary-button" id="run-executive-report" type="button">Generar informe ejecutivo</button>
        <p class="status-note">No exporta PDF, Word ni PowerPoint en este Sprint.</p>
      </section>
    `;
  },

  renderSummary(packageData) {
    if (!packageData) return "";
    const summary = packageData.summary;
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Resumen del informe</h3>
        <div class="dimension-grid">
          ${this.dimension("Secciones", summary.totalSections)}
          ${this.dimension("Listas", summary.readySections)}
          ${this.dimension("Riesgos", summary.totalRisks)}
          ${this.dimension("Recomendaciones", summary.totalRecommendations)}
          ${this.dimension("Preguntas", summary.pendingQuestions)}
          ${this.dimension("Confianza", summary.averageConfidence)}
        </div>
      </section>
    `;
  },

  renderSections(state, selected) {
    const sections = state.executiveReportPackage ? state.executiveReportPackage.sections : [];
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Secciones</h3>
          <span class="status-note">${sections.length}</span>
        </div>
        <div class="activity-selector-list">
          ${sections.length ? sections.map((section) => `
            <button class="activity-selector ${selected && selected.sectionId === section.sectionId ? "is-selected" : ""}" data-executive-section-id="${this.escape(section.sectionId)}" type="button">
              <strong>${this.escape(section.title)}</strong>
              <span>${this.escape(section.confidence)} / ${section.readyForExport ? "Lista" : "Incompleta"}</span>
            </button>
          `).join("") : "<p class=\"status-note\">Genera el informe para ver secciones.</p>"}
        </div>
      </section>
    `;
  },

  renderRunPrompt() {
    return `
      <section class="conversation-card">
        <h3>Genera el informe ejecutivo</h3>
        <p>El consultor consolidara contexto, As-Is, diagnostico, To-Be, Business Case, Roadmap, riesgos, recomendaciones y preguntas pendientes.</p>
      </section>
    `;
  },

  renderExecutiveSummary(packageData) {
    return `
      <section class="studio-panel">
        <p class="page-kicker">Executive Summary</p>
        <h3 class="panel-title">${this.escape(packageData.status)}</h3>
        <p>${this.escape(packageData.executiveSummary.content.map((item) => `${item.label}: ${item.value}`).join(" | "))}</p>
      </section>
    `;
  },

  renderSectionDetail(section) {
    if (!section) {
      return `<section class="conversation-card"><h3>Sin seccion seleccionada</h3><p>Selecciona una seccion para revisar contenido.</p></section>`;
    }

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <div>
            <p class="page-kicker">Seccion</p>
            <h3 class="panel-title">${this.escape(section.title)}</h3>
          </div>
          <span class="confidence-badge">${this.escape(section.confidence)}</span>
        </div>
        <ul class="validation-list">
          ${section.content.map((item) => `
            <li class="${item.value === "Informacion no disponible" || item.value === "Pendiente de estimacion" ? "is-warning" : "is-passed"}">
              <span>${item.value === "Informacion no disponible" ? "MISS" : "OK"}</span>
              <div>
                <strong>${this.escape(item.label)}</strong>
                <p>${this.escape(item.value)}</p>
              </div>
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  },

  renderRecommendations(packageData) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Recomendaciones Finales</h3>
        <div class="requirements-board">
          ${packageData.finalRecommendations.map((item) => `
            <article class="requirement-card">
              <strong>${this.escape(item.priority)}</strong>
              <span>${this.escape(item.recommendation)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderExportModel(packageData) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Exportacion preparada</h3>
        <section class="activity-meta">
          <p><strong>Formatos futuros:</strong> ${this.escape(packageData.exportModel.supportedFormatsPrepared.join(", "))}</p>
          <p><strong>Exportacion fisica:</strong> ${packageData.exportModel.physicalExportImplemented ? "Implementada" : "No implementada en este Sprint"}</p>
        </section>
      </section>
    `;
  },

  renderRisks(packageData) {
    if (!packageData) return "";
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Riesgos consolidados</h3>
          <span class="status-note">${packageData.risks.length}</span>
        </div>
        <div class="workshop-observation-list">
          ${packageData.risks.length ? packageData.risks.map((item) => `
            <article class="workshop-observation-card">
              <strong>${this.escape(item.activityName || item.initiativeName || item.type || "Riesgo")}</strong>
              <p>${this.escape(item.description || item.risk)}</p>
              <p class="status-note">${this.escape(item.severity || "Media")}</p>
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
                <p>${this.escape(question.reason || "")}</p>
              </div>
            </li>
          `).join("") : "<li class=\"is-passed\"><span>OK</span><div><strong>Sin preguntas pendientes</strong><p>El informe puede revisarse.</p></div></li>"}
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

  findSelectedSection(state) {
    const packageData = state.executiveReportPackage;
    if (!packageData || !packageData.sections || !packageData.sections.length) return null;
    return packageData.sections.find((section) => section.sectionId === state.selectedSectionId) || packageData.sections[0];
  },

  dimension(label, value) {
    return `<div class="dimension-card"><span>${this.escape(label)}</span><strong>${this.escape(value)}</strong></div>`;
  },

  escape(value) {
    return window.DomUtils.escapeHtml(value === undefined || value === null ? "" : String(value));
  }
});
