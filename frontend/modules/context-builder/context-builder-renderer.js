window.ContextBuilderRenderer = Object.freeze({
  render(state, session) {
    const result = state.result;

    return `
      <section class="context-workspace" aria-labelledby="context-title">
        <div class="context-header">
          <div>
            <p class="page-kicker">Sprint 2 - Discovery Workspace</p>
            <h2 id="context-title" class="page-title">Revision guiada del conocimiento operativo</h2>
            <p class="page-description">Trabaja con el Consultor Digital para validar, explicar y enriquecer el Knowledge Package antes de construir el proceso As-Is.</p>
          </div>
          <div class="context-session">
            <span>${session.user.displayName}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </div>

        <div class="discovery-layout">
          <form id="context-builder-form" class="context-form">
            ${this.renderProjectSection(state)}
            ${this.renderDocumentsSection(state)}
            ${this.renderInterviewsSection(state)}
            ${this.renderNotesSection(state)}
            <div class="context-actions">
              <button class="secondary-button" id="save-context-button" type="button">Guardar avance</button>
              <button class="primary-button" type="submit">Actualizar Knowledge Package</button>
            </div>
          </form>

          <section class="discovery-panels" aria-live="polite">
            ${result ? this.renderDiscoveryWorkspace(state, result) : this.renderEmptyResult()}
          </section>

          <aside class="consultant-chat" aria-label="Chat del Consultor Digital">
            ${this.renderConsultantChat(state)}
          </aside>
        </div>
      </section>
    `;
  },

  renderProjectSection(state) {
    const project = state.project;

    return `
      <section class="context-section">
        <h3 class="panel-title">Proyecto</h3>
        <div class="context-grid">
          ${this.renderInput("name", "Nombre del proyecto", project.name, true)}
          ${this.renderInput("company", "Empresa", project.company, true)}
          ${this.renderInput("client", "Cliente", project.client, false)}
          ${this.renderInput("area", "Area", project.area, true)}
          ${this.renderInput("process", "Proceso", project.process, true)}
          ${this.renderInput("owner", "Responsable", project.owner, false)}
          ${this.renderInput("date", "Fecha", project.date, false, "date")}
        </div>
        ${this.renderTextarea("objective", "Objetivo", project.objective, true)}
        ${this.renderTextarea("scope", "Alcance", project.scope, true)}
      </section>
    `;
  },

  renderDocumentsSection(state) {
    return `
      <section class="context-section">
        <div class="context-section-header">
          <h3 class="panel-title">Documentos</h3>
          <span class="status-note">${state.documents.length} cargados</span>
        </div>
        <label class="form-field">
          Cargar documentos
          <input id="document-input" type="file" multiple accept=".txt,.md,.markdown,.json,.csv,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.vsd,.vsdx,.png,.jpg,.jpeg,.mp4" />
        </label>
        <label class="form-field">
          Texto normalizado manual
          <textarea id="manual-document-text" rows="5" placeholder="Pega aqui texto extraido de PDF, Word, entrevistas o notas documentales."></textarea>
        </label>
        <button class="secondary-button" id="add-manual-document-button" type="button">Agregar texto como documento</button>
        ${this.renderList(state.documents, "title", "normalizationStatus")}
      </section>
    `;
  },

  renderInterviewsSection(state) {
    return `
      <section class="context-section">
        <div class="context-section-header">
          <h3 class="panel-title">Entrevistas</h3>
          <span class="status-note">${state.interviews.length} registradas</span>
        </div>
        <div class="context-grid">
          ${this.renderInput("interviewPerson", "Persona", "", false)}
          ${this.renderInput("interviewRole", "Rol", "", false)}
        </div>
        ${this.renderTextarea("interviewContent", "Notas de entrevista", "", false)}
        <button class="secondary-button" id="add-interview-button" type="button">Agregar entrevista</button>
        ${this.renderList(state.interviews, "person", "role")}
      </section>
    `;
  },

  renderNotesSection(state) {
    return `
      <section class="context-section">
        <div class="context-section-header">
          <h3 class="panel-title">Notas</h3>
          <span class="status-note">${state.notes.length} registradas</span>
        </div>
        ${this.renderTextarea("noteContent", "Nota libre", "", false)}
        <button class="secondary-button" id="add-note-button" type="button">Agregar nota</button>
        ${this.renderList(state.notes, "content", "createdAt")}
      </section>
    `;
  },

  renderResult(result) {
    const packageData = result.knowledgePackage || {};
    const graph = result.contextGraph || {};

    return `
      <div class="result-card">
        <p class="page-kicker">Knowledge Package</p>
        <h3 class="panel-title">${packageData.knowledgePackageId || "Resultado"}</h3>
        <div class="confidence-badge">${packageData.confidence || "PENDING"}</div>
      </div>
      ${this.renderResultGroup("Objetivo", [packageData.objective && packageData.objective.description])}
      ${this.renderResultGroup("Alcance", [packageData.scope && packageData.scope.description])}
      ${this.renderResultGroup("Procesos", packageData.identifiedProcesses, "name")}
      ${this.renderResultGroup("Actividades", packageData.identifiedActivities, "name")}
      ${this.renderResultGroup("Sistemas", packageData.systems, "name")}
      ${this.renderResultGroup("Personas", packageData.people, "name")}
      ${this.renderResultGroup("Roles", packageData.roles, "name")}
      ${this.renderResultGroup("Restricciones", packageData.restrictions)}
      ${this.renderResultGroup("Reglas", packageData.businessRules)}
      ${this.renderResultGroup("Informacion faltante", packageData.missingInformation)}
      ${this.renderResultGroup("Contradicciones", packageData.contradictions)}
      <div class="result-card">
        <p class="status-label">Context Graph</p>
        <p class="status-value">${(graph.nodes || []).length} nodos / ${(graph.edges || []).length} relaciones</p>
      </div>
    `;
  },

  renderDiscoveryWorkspace(state, result) {
    const packageData = result.knowledgePackage || {};
    const graph = result.contextGraph || {};
    const questions = window.ContextBuilderService.generateConsultantQuestions(state);

    return `
      <div class="discovery-summary">
        <div class="result-card">
          <p class="page-kicker">Knowledge Package</p>
          <h3 class="panel-title">${packageData.knowledgePackageId || "Resultado"}</h3>
          <div class="confidence-badge">${packageData.confidence || "PENDING"}</div>
          <p class="status-note">Estado: ${state.validation.status || "DRAFT"}</p>
        </div>
        <div class="result-card">
          <p class="status-label">Context Graph</p>
          <p class="status-value">${(graph.nodes || []).length} nodos / ${(graph.edges || []).length} relaciones</p>
        </div>
      </div>

      <div class="panel-grid">
        ${this.renderDiscoveryPanel("Documentos analizados", state.documents, "title", "normalizationStatus", "DOCUMENT")}
        ${this.renderDiscoveryPanel("Entrevistas", state.interviews, "person", "role", "INTERVIEW")}
        ${this.renderDiscoveryPanel("Informacion faltante", packageData.missingInformation, null, null, "GAP")}
        ${this.renderDiscoveryPanel("Contradicciones", packageData.contradictions, null, null, "CONTRADICTION")}
        ${this.renderDiscoveryPanel("Procesos detectados", packageData.identifiedProcesses, "name", "confidence", "PROCESS")}
        ${this.renderDiscoveryPanel("Actividades detectadas", packageData.identifiedActivities, "name", "confidence", "ACTIVITY")}
        ${this.renderDiscoveryPanel("Sistemas", packageData.systems, "name", "confidence", "SYSTEM")}
        ${this.renderDiscoveryPanel("Personas", packageData.people, "name", "role", "PERSON")}
        ${this.renderDiscoveryPanel("Reglas de negocio", packageData.businessRules, null, null, "RULE")}
        ${this.renderDiscoveryPanel("Restricciones", packageData.restrictions, null, null, "RESTRICTION")}
      </div>

      <section class="context-section">
        <div class="context-section-header">
          <h3 class="panel-title">Preguntas priorizadas</h3>
          <span class="status-note">${questions.length} abiertas</span>
        </div>
        <ul class="compact-list">
          ${questions.map((question) => `<li>${this.escape(question)}</li>`).join("")}
        </ul>
      </section>
    `;
  },

  renderDiscoveryPanel(title, items, titleField, metaField, topic) {
    const normalizedItems = (items || []).filter(Boolean);
    const body = normalizedItems.length ? normalizedItems.map((item) => {
      const primary = titleField && item && typeof item === "object" ? item[titleField] : item;
      const secondary = metaField && item && typeof item === "object" ? item[metaField] : "";
      const description = item && typeof item === "object" && item.description ? item.description : "";
      const display = primary || description || "Pendiente de identificar";

      return `
        <li>
          <span>
            <strong>${this.escape(String(display))}</strong>
            ${secondary ? `<small>${this.escape(String(secondary))}</small>` : ""}
          </span>
          <button class="link-button" data-explain-topic="${this.escape(String(display))}" type="button">Explicar</button>
        </li>
      `;
    }).join("") : `<li><span><strong>Pendiente de completar</strong><small>El consultor solicitara mas informacion.</small></span></li>`;

    return `
      <section class="discovery-panel" data-panel-topic="${topic}">
        <div class="context-section-header">
          <h3 class="panel-title">${title}</h3>
          <span class="status-note">${normalizedItems.length}</span>
        </div>
        <ul class="review-list">${body}</ul>
      </section>
    `;
  },

  renderConsultantChat(state) {
    const messages = state.consultantChat || [];
    const hasPackage = Boolean(state.result && state.result.knowledgePackage);

    return `
      <div class="chat-header">
        <p class="page-kicker">Consultor Digital</p>
        <h3 class="panel-title">Revision asistida</h3>
        <p class="status-note">Responde preguntas, agrega evidencia o solicita explicaciones.</p>
      </div>
      <div class="chat-messages" id="consultant-chat-messages">
        ${messages.map((message) => `
          <article class="chat-message chat-message-${message.author}">
            <p>${this.escape(message.text)}</p>
            <span>${this.escape(message.createdAt || "")}</span>
          </article>
        `).join("")}
      </div>
      <form id="consultant-chat-form" class="chat-form">
        <label class="form-field">
          Respuesta o aclaracion
          <textarea name="consultantMessage" rows="5" ${hasPackage ? "" : "disabled"} placeholder="${hasPackage ? "Escribe una aclaracion, evidencia, entrevista o solicitud..." : "Primero ejecuta el Context Builder."}"></textarea>
        </label>
        <button class="primary-button" type="submit" ${hasPackage ? "" : "disabled"}>Enviar y actualizar</button>
      </form>
    `;
  },

  renderEmptyResult() {
    return `
      <div class="result-card">
        <p class="page-kicker">Sin Knowledge Package</p>
        <h3 class="panel-title">Ejecuta el Context Builder para abrir el Discovery Workspace.</h3>
        <p class="status-note">Luego podras revisar documentos, entrevistas, faltantes, contradicciones, procesos, actividades y evidencia desde una sola pantalla.</p>
      </div>
    `;
  },

  renderResultGroup(title, items, field) {
    const normalizedItems = (items || []).filter(Boolean);
    const htmlItems = normalizedItems.length ? normalizedItems.map((item) => {
      const value = field && item && typeof item === "object" ? item[field] : item;
      return `<li>${this.escape(String(value || ""))}</li>`;
    }).join("") : "<li>Pendiente de identificar.</li>";

    return `
      <div class="result-card">
        <p class="status-label">${title}</p>
        <ul class="compact-list">${htmlItems}</ul>
      </div>
    `;
  },

  renderInput(name, label, value, required, type = "text") {
    return `
      <label class="form-field">
        ${label}
        <input name="${name}" type="${type}" value="${this.escape(value || "")}" ${required ? "required" : ""} />
      </label>
    `;
  },

  renderTextarea(name, label, value, required) {
    return `
      <label class="form-field">
        ${label}
        <textarea name="${name}" rows="4" ${required ? "required" : ""}>${this.escape(value || "")}</textarea>
      </label>
    `;
  },

  renderList(items, titleField, metaField) {
    if (!items.length) {
      return `<p class="status-note">Sin registros.</p>`;
    }

    return `
      <ul class="source-list">
        ${items.map((item) => `
          <li>
            <strong>${this.escape(String(item[titleField] || "Registro"))}</strong>
            <span>${this.escape(String(item[metaField] || ""))}</span>
          </li>
        `).join("")}
      </ul>
    `;
  },

  escape(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
