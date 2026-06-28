window.RequirementsDiscoveryRenderer = Object.freeze({
  render(state, session) {
    const packageData = state.requirementsPackage;
    const selected = packageData ? this.resolveSelectedRequirement(state) : null;

    return `
      <section class="requirements-discovery" aria-labelledby="requirements-discovery-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 8 - ERP Discovery</p>
            <h2 id="requirements-discovery-title" class="page-title">Requirements Discovery Consultant</h2>
            <p class="page-description">Identifica y estructura requerimientos ERP desde paquetes de conocimiento, proceso validado y evidencia. Cada afirmacion conserva trazabilidad y confianza.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        <div class="process-actions">
          <button class="primary-button" id="build-requirements-button" type="button">Construir Requirements Package</button>
          ${packageData ? `<button class="secondary-button" id="explain-requirement-button" type="button">Explicar seleccion</button>` : ""}
        </div>

        ${packageData ? this.renderWorkspace(state, selected) : this.renderEmptyState()}
      </section>
    `;
  },

  renderEmptyState() {
    return `
      <section class="conversation-card">
        <h3>Listo para descubrir requerimientos ERP</h3>
        <p>El consultor usara el Business Knowledge Package, Knowledge Package, Context Graph y Process Model validado. Si la evidencia no alcanza, generara preguntas antes de consolidar.</p>
      </section>
    `;
  },

  renderWorkspace(state, selected) {
    const packageData = state.requirementsPackage;

    return `
      <div class="process-workspace-layout">
        <main class="process-map-area">
          ${this.renderSummary(packageData)}
          ${this.renderCategoryBoard(packageData, selected)}
        </main>
        <aside class="activity-inspector">
          ${selected ? this.renderInspector(selected) : this.renderNoSelection()}
          ${this.renderQuestions(state)}
          ${this.renderChat(state)}
        </aside>
      </div>
    `;
  },

  renderSummary(packageData) {
    const approved = packageData.requirements.filter((requirement) => requirement.status === "HUMAN_APPROVED").length;
    const blockers = packageData.questions.filter((question) => question.status === "OPEN" && question.blocksApproval).length;

    return `
      <section class="discovery-summary">
        <div class="result-card">
          <p class="page-kicker">Requirements Package</p>
          <h3 class="panel-title">${this.escape(packageData.requirementsPackageId)}</h3>
          <p class="status-note">${this.escape(packageData.summary)}</p>
        </div>
        <div class="result-card">
          <p class="status-label">Estado</p>
          <p class="status-value">${this.escape(packageData.status)}</p>
          <p class="status-note">${approved}/${packageData.requirements.length} aprobados / ${blockers} bloqueos</p>
        </div>
      </section>
    `;
  },

  renderCategoryBoard(packageData, selected) {
    const grouped = this.groupByCategory(packageData.requirements);
    const categories = window.RequirementsDiscoveryService.categories;

    return `
      <section class="requirements-board" aria-label="Requirements package">
        ${categories.map((category) => {
          const requirements = grouped[category.id] || [];
          return `
            <article class="requirement-column">
              <div class="context-section-header">
                <h3 class="panel-title">${this.escape(category.label)}</h3>
                <span class="status-note">${requirements.length}</span>
              </div>
              ${requirements.length ? requirements.map((requirement) => this.renderRequirementCard(requirement, selected)).join("") : `<p class="status-note">Sin evidencia suficiente.</p>`}
            </article>
          `;
        }).join("")}
      </section>
    `;
  },

  renderRequirementCard(requirement, selected) {
    return `
      <button class="requirement-card ${selected && selected.requirementId === requirement.requirementId ? "is-selected" : ""}" data-requirement-id="${this.escape(requirement.requirementId)}" type="button">
        <span class="confidence-badge">${this.escape(requirement.confidence)}</span>
        <strong>${this.escape(requirement.title)}</strong>
        <span>${this.escape(requirement.priority)} / ${this.escape(requirement.status)}</span>
      </button>
    `;
  },

  renderInspector(requirement) {
    return `
      <section class="inspector-panel">
        <p class="page-kicker">Requerimiento seleccionado</p>
        <h3 class="panel-title">${this.escape(requirement.title)}</h3>
        <p>${this.escape(requirement.description)}</p>
        <div class="activity-meta">
          <p><strong>Categoria:</strong> ${this.escape(requirement.category)}</p>
          <p><strong>Prioridad:</strong> ${this.escape(requirement.priority)}</p>
          <p><strong>Confianza:</strong> ${this.escape(requirement.confidence)}</p>
          <p><strong>Sistemas:</strong> ${this.escape((requirement.systems || []).join(", ") || "No especificado")}</p>
          <p><strong>Documentos:</strong> ${this.escape((requirement.documentsUsed || []).join(", ") || "No especificado")}</p>
          <p><strong>Entrevistas:</strong> ${this.escape((requirement.interviewsUsed || []).join(", ") || "No especificado")}</p>
          <p><strong>Racional:</strong> ${this.escape(requirement.rationale)}</p>
        </div>
        <div class="context-actions">
          <button class="primary-button" id="approve-requirement-button" data-requirement-id="${this.escape(requirement.requirementId)}" type="button">Aprobar requerimiento</button>
        </div>
        <h4 class="panel-title">Evidencia</h4>
        <ul class="compact-list">
          ${(requirement.evidence || []).length ? requirement.evidence.map((item) => `
            <li>${this.escape(item.sourceType)} - ${this.escape(item.sourceName)}: ${this.escape(item.fragment)}</li>
          `).join("") : "<li>Sin evidencia suficiente.</li>"}
        </ul>
      </section>
    `;
  },

  renderNoSelection() {
    return `
      <section class="inspector-panel">
        <h3 class="panel-title">Selecciona un requerimiento</h3>
        <p>El inspector mostrara evidencia, confianza, documentos usados y entrevistas usadas.</p>
      </section>
    `;
  },

  renderQuestions(state) {
    const openQuestions = (state.questions || []).filter((question) => question.status === "OPEN");

    return `
      <section class="inspector-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Preguntas del consultor</h3>
          <span class="status-note">${openQuestions.length}</span>
        </div>
        <ul class="compact-list">
          ${openQuestions.length ? openQuestions.map((question) => `<li>${this.escape(question.question)}</li>`).join("") : "<li>Sin preguntas abiertas.</li>"}
        </ul>
        <form id="requirements-question-form" class="chat-form">
          <label class="form-field">
            Respuesta
            <textarea name="questionAnswer" rows="3"></textarea>
          </label>
          <button class="primary-button" type="submit">Responder</button>
        </form>
      </section>
    `;
  },

  renderChat(state) {
    return `
      <section class="inspector-panel">
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

  resolveSelectedRequirement(state) {
    const requirements = state.requirementsPackage.requirements || [];
    return requirements.find((requirement) => requirement.requirementId === state.selectedRequirementId) || requirements[0];
  },

  groupByCategory(requirements) {
    return (requirements || []).reduce((grouped, requirement) => {
      grouped[requirement.category] = grouped[requirement.category] || [];
      grouped[requirement.category].push(requirement);
      return grouped;
    }, {});
  },

  escape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
