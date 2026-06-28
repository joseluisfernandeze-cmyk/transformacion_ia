window.ProcessValidationStudioRenderer = Object.freeze({
  render(state, session) {
    const validation = state.validation;

    return `
      <section class="validation-studio" aria-labelledby="validation-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 6 - Process Validation Studio</p>
            <h2 id="validation-title" class="page-title">Validacion del As-Is</h2>
            <p class="page-description">Verifica completitud, consistencia, trazabilidad, evidencia y confianza antes de habilitar analisis posteriores.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        <div class="studio-toolbar">
          <button class="primary-button" id="run-validation-button" type="button">Validar proceso</button>
        </div>

        ${validation ? this.renderValidation(state, validation) : this.renderEmpty()}
      </section>
    `;
  },

  renderEmpty() {
    return `
      <section class="conversation-card">
        <h3>Validacion pendiente</h3>
        <p>Ejecuta la validacion para calcular el Health Score y conocer si el proceso esta apto para VSM, Lean, TOC, Automatizacion, IA, To-Be o Business Case.</p>
      </section>
    `;
  },

  renderValidation(state, validation) {
    const failed = validation.checks.filter((check) => !check.passed);
    const passed = validation.checks.filter((check) => check.passed);

    return `
      <div class="validation-layout">
        <main class="validation-main">
          <section class="health-panel ${this.className(validation.classification)}">
            <div>
              <p class="page-kicker">Health Score</p>
              <h3>${validation.healthScore}/100</h3>
              <p>${this.escape(validation.classification)}</p>
            </div>
            <div>
              <p class="status-note">${this.escape(validation.explanation)}</p>
            </div>
          </section>

          ${this.renderBlockedCapabilities(validation)}
          ${this.renderQualityDimensions(validation)}
          ${this.renderChecks("Problemas detectados", failed)}
          ${this.renderChecks("Validaciones aprobadas", passed)}
        </main>

        <aside class="validation-side">
          ${this.renderRecommendations(validation)}
          ${this.renderConsultantChat(state)}
        </aside>
      </div>
    `;
  },

  renderBlockedCapabilities(validation) {
    const capabilities = ["VSM", "Lean", "TOC", "Automatizacion", "IA", "To-Be", "Business Case"];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Bloqueo inteligente</h3>
          <span class="status-note">${validation.canRunAdvancedAnalysis ? "Sin bloqueo" : "Bloqueado"}</span>
        </div>
        <div class="capability-grid">
          ${capabilities.map((capability) => `
            <div class="capability-pill ${validation.blockedCapabilities.indexOf(capability) !== -1 ? "is-blocked" : "is-enabled"}">
              ${this.escape(capability)}
            </div>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderQualityDimensions(validation) {
    const dimensions = this.calculateDimensions(validation.checks);

    return `
      <section class="studio-panel">
        <h3 class="panel-title">Dimensiones de calidad</h3>
        <div class="dimension-grid">
          ${dimensions.map((dimension) => `
            <div class="dimension-card">
              <p>${this.escape(dimension.name)}</p>
              <strong>${dimension.score}%</strong>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  },

  calculateDimensions(checks) {
    return [
      this.dimension("Completitud", checks, ["START_ACTIVITY", "END_ACTIVITY", "RESPONSIBLE", "AREA", "INPUTS", "OUTPUTS"]),
      this.dimension("Consistencia", checks, ["NO_DUPLICATES", "NO_CYCLES", "PROCESS_CONNECTED", "NO_CONTRADICTIONS"]),
      this.dimension("Trazabilidad", checks, ["DOCUMENTS", "RULES", "DECISIONS"]),
      this.dimension("Evidencia", checks, ["EVIDENCE"]),
      this.dimension("Confianza", checks, ["CONFIDENCE", "NO_MISSING_INFO"])
    ];
  },

  dimension(name, checks, codes) {
    const related = checks.filter((check) => codes.indexOf(check.code) !== -1);

    if (!related.length) {
      return { name, score: 100 };
    }

    return {
      name,
      score: Math.round((related.filter((check) => check.passed).length / related.length) * 100)
    };
  },

  renderChecks(title, checks) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">${title}</h3>
          <span class="status-note">${checks.length}</span>
        </div>
        <ul class="validation-list">
          ${checks.length ? checks.map((check) => `
            <li class="${check.passed ? "is-passed" : "is-failed"}">
              <span>${this.escape(check.severity)}</span>
              <div>
                <strong>${this.escape(check.label)}</strong>
                <p>${this.escape(check.activityName ? `${check.activityName}: ${check.message}` : check.message)}</p>
              </div>
            </li>
          `).join("") : "<li class=\"is-passed\"><span>OK</span><div><strong>Sin registros</strong><p>No hay elementos en esta categoria.</p></div></li>"}
        </ul>
      </section>
    `;
  },

  renderRecommendations(validation) {
    return `
      <section class="studio-panel">
        <h3 class="panel-title">Acciones recomendadas</h3>
        <ul class="compact-list">
          ${validation.recommendations.length ? validation.recommendations.map((item) => `<li><strong>${this.escape(item.priority)}</strong> ${this.escape(item.action)}</li>`).join("") : "<li>El proceso esta listo para continuar.</li>"}
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
        <form id="validation-chat-form" class="chat-form">
          <label class="form-field">
            Pregunta sobre la validacion
            <textarea name="validationQuestion" rows="3" placeholder="Ejemplo: Por que no puedo ejecutar VSM?"></textarea>
          </label>
          <button class="primary-button" type="submit">Preguntar</button>
        </form>
      </section>
    `;
  },

  className(classification) {
    return String(classification || "").toLowerCase().replace(/\s+/g, "-");
  },

  escape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
