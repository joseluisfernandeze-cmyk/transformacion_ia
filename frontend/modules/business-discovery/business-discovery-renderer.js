window.BusinessDiscoveryRenderer = Object.freeze({
  render(state, session) {
    const step = window.BusinessDiscoveryService.getCurrentStep(state);
    const packageData = state.package || window.BusinessDiscoveryService.buildBusinessKnowledgePackage(state);

    return `
      <section class="business-experience" aria-labelledby="business-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 3 - Business Discovery Experience</p>
            <h2 id="business-title" class="page-title">Descubrimiento del negocio</h2>
            <p class="page-description">Una conversacion estructurada para comprender la organizacion antes de iniciar el descubrimiento de procesos.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        <div class="experience-progress" aria-label="Progreso de consultoria">
          ${window.BusinessDiscoveryService.steps.map((item, index) => `
            <button class="progress-step ${index === state.currentStep ? "is-active" : ""} ${index < state.currentStep ? "is-done" : ""}" data-step-index="${index}" type="button">
              <span>${index + 1}</span>
              ${item.title}
            </button>
          `).join("")}
        </div>

        <div class="experience-layout">
          <main class="consulting-stage">
            <section class="consultant-guidance">
              <p class="page-kicker">Consultor Digital</p>
              <h3 class="panel-title">${this.escape(step.title)}</h3>
              <p>${this.escape(step.prompt)}</p>
            </section>

            <form id="business-discovery-form" class="guided-card">
              ${this.renderStep(state, step.id, packageData)}
              <div class="wizard-actions">
                <button class="secondary-button" id="previous-step-button" type="button" ${state.currentStep === 0 ? "disabled" : ""}>Anterior</button>
                <button class="secondary-button" id="save-business-button" type="button">Guardar</button>
                <button class="primary-button" id="next-step-button" type="button">${state.currentStep === 7 ? "Actualizar validacion" : "Siguiente"}</button>
              </div>
            </form>
          </main>

          <aside class="business-inspector">
            ${this.renderPackageSummary(packageData, state)}
            ${this.renderChat(state)}
          </aside>
        </div>
      </section>
    `;
  },

  renderStep(state, stepId, packageData) {
    const renderers = {
      welcome: () => this.renderWelcome(),
      organization: () => this.renderOrganization(state.organization),
      business: () => this.renderBusiness(state.business),
      structure: () => this.renderStructure(state.structure),
      technology: () => this.renderTechnology(state.technology),
      project: () => this.renderProject(state.project),
      documentation: () => this.renderDocumentation(state.documents),
      validation: () => this.renderValidation(packageData)
    };

    return renderers[stepId]();
  },

  renderWelcome() {
    return `
      <div class="conversation-card">
        <h3>Primero entenderemos el negocio</h3>
        <p>Antes de mapear procesos necesito entender la organizacion, su modelo de negocio, tecnologia, riesgos y objetivo del proyecto.</p>
        <p>Con esta informacion construiremos un Business Knowledge Package validado que sera la base para Context Builder, Process Discovery, ERP Discovery y otros consultores digitales.</p>
      </div>
    `;
  },

  renderOrganization(organization) {
    return `
      <div class="guided-grid">
        ${this.input("organization.name", "Nombre", organization.name, "Como se identifica formalmente la organizacion.")}
        ${this.input("organization.industry", "Industria", organization.industry, "Ayuda a interpretar procesos, regulaciones y practicas comunes.")}
        ${this.input("organization.country", "Pais", organization.country, "Permite contextualizar normativa, moneda y operacion.")}
        ${this.input("organization.cities", "Ciudades", organization.cities, "Indica dispersion geografica.")}
        ${this.input("organization.plants", "Plantas", organization.plants, "Aclara complejidad productiva u operativa.")}
        ${this.input("organization.distributionCenters", "Centros de distribucion", organization.distributionCenters, "Ayuda a entender logistica y cadena de suministro.")}
        ${this.input("organization.offices", "Oficinas", organization.offices, "Ubica areas administrativas o comerciales.")}
        ${this.input("organization.employees", "Colaboradores aproximados", organization.employees, "Dimensiona escala y carga organizacional.", "number")}
      </div>
    `;
  },

  renderBusiness(business) {
    return `
      ${this.textarea("business.products", "Productos", business.products, "Que produce, distribuye o vende.")}
      ${this.textarea("business.services", "Servicios", business.services, "Servicios internos o externos relevantes.")}
      ${this.textarea("business.customers", "Clientes", business.customers, "Segmentos o tipos de clientes atendidos.")}
      ${this.textarea("business.channels", "Canales", business.channels, "Como llega al cliente o recibe demanda.")}
      ${this.textarea("business.strategicObjectives", "Objetivos estrategicos", business.strategicObjectives, "Prioridades que condicionan la transformacion.")}
    `;
  },

  renderStructure(structure) {
    return `
      ${this.textarea("structure.orgChart", "Organigrama", structure.orgChart, "Describe niveles, areas y dependencias si no hay archivo formal.")}
      ${this.textarea("structure.areas", "Areas", structure.areas, "Areas que participan en la operacion.")}
      ${this.textarea("structure.owners", "Responsables", structure.owners, "Personas o roles clave para entrevistas.")}
      ${this.textarea("structure.mainProcesses", "Procesos principales", structure.mainProcesses, "Lista inicial de procesos del negocio.")}
    `;
  },

  renderTechnology(technology) {
    return `
      ${this.textarea("technology.erp", "ERP", technology.erp, "Sistema transaccional principal si existe.")}
      ${this.textarea("technology.systems", "Sistemas", technology.systems, "Aplicaciones de negocio relevantes.")}
      ${this.textarea("technology.applications", "Aplicaciones", technology.applications, "Herramientas departamentales o especializadas.")}
      ${this.textarea("technology.integrations", "Integraciones", technology.integrations, "Interfaces entre sistemas o cargas manuales.")}
      ${this.textarea("technology.criticalExcels", "Excel criticos", technology.criticalExcels, "Archivos que sostienen operacion, control o reporting.")}
    `;
  },

  renderProject(project) {
    return `
      ${this.textarea("project.mainProblem", "Problema principal", project.mainProblem, "Dolor que origina la consultoria.")}
      ${this.textarea("project.scope", "Alcance", project.scope, "Limites funcionales, areas, ubicaciones o procesos incluidos.")}
      ${this.textarea("project.objectives", "Objetivos", project.objectives, "Resultados esperados por negocio y consultoria.")}
      ${this.textarea("project.restrictions", "Restricciones", project.restrictions, "Limitaciones de tiempo, datos, recursos o decisiones.")}
      ${this.textarea("project.knownRisks", "Riesgos conocidos", project.knownRisks, "Riesgos que pueden afectar el descubrimiento.")}
    `;
  },

  renderDocumentation(documents) {
    return `
      <label class="form-field">
        Asociar documentacion
        <input id="business-document-input" type="file" multiple accept=".txt,.md,.json,.csv,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.vsd,.vsdx,.png,.jpg,.jpeg" />
      </label>
      <label class="form-field">
        Registrar documento o evidencia manual
        <textarea name="manualDocumentText" rows="5" placeholder="Ejemplo: SOP de compras, politica de credito, manual de ERP, organigrama..."></textarea>
      </label>
      <button class="secondary-button" id="add-business-document-button" type="button">Agregar evidencia manual</button>
      <ul class="source-list">
        ${documents.length ? documents.map((documentItem) => `
          <li>
            <strong>${this.escape(documentItem.title)}</strong>
            <span>${this.escape(documentItem.type)} - ${this.escape(documentItem.status)}</span>
          </li>
        `).join("") : `<li><strong>Sin documentos asociados</strong><span>Agrega SOP, politicas, procedimientos u organigramas.</span></li>`}
      </ul>
    `;
  },

  renderValidation(packageData) {
    return `
      <div class="validation-grid">
        ${this.summaryBlock("Resumen Ejecutivo", [packageData.executiveSummary])}
        ${this.summaryBlock("Organizacion comprendida", [packageData.organizationUnderstanding])}
        ${this.summaryBlock("Procesos identificados", packageData.identifiedProcesses)}
        ${this.summaryBlock("Sistemas identificados", packageData.identifiedSystems)}
        ${this.summaryBlock("Riesgos identificados", packageData.identifiedRisks)}
        ${this.summaryBlock("Informacion faltante", packageData.missingInformation)}
        ${this.summaryBlock("Contradicciones", packageData.contradictions)}
        <div class="result-card">
          <p class="status-label">Nivel de confianza</p>
          <div class="confidence-badge">${this.escape(packageData.confidence)}</div>
          <p class="status-note">Estado: ${this.escape(packageData.status)}</p>
        </div>
      </div>
      <div class="context-actions">
        <button class="primary-button" id="approve-business-package-button" type="button">Aprobar Business Knowledge Package</button>
      </div>
    `;
  },

  renderPackageSummary(packageData, state) {
    return `
      <section class="result-card">
        <p class="page-kicker">Business Knowledge Package</p>
        <h3 class="panel-title">${this.escape(packageData.businessKnowledgePackageId || "Borrador")}</h3>
        <div class="confidence-badge">${this.escape(packageData.confidence || "LOW_CONFIDENCE")}</div>
        <p class="status-note">Estado: ${this.escape(state.status || packageData.status || "IN_PROGRESS")}</p>
      </section>
      <section class="result-card">
        <p class="status-label">Progreso</p>
        <p class="status-value">${this.completionPercentage(packageData)}%</p>
        <p class="status-note">${(packageData.missingInformation || []).length} datos faltantes / ${(packageData.contradictions || []).length} contradicciones</p>
      </section>
    `;
  },

  renderChat(state) {
    return `
      <section class="business-chat">
        <div class="chat-header">
          <p class="page-kicker">Conversacion</p>
          <h3 class="panel-title">Consultor Digital</h3>
        </div>
        <div class="chat-messages">
          ${state.chat.map((message) => `
            <article class="chat-message chat-message-${message.author}">
              <p>${this.escape(message.text)}</p>
              <span>${this.escape(message.createdAt)}</span>
            </article>
          `).join("")}
        </div>
        <form id="business-chat-form" class="chat-form">
          <label class="form-field">
            Agregar informacion, correccion o aclaracion
            <textarea name="businessMessage" rows="4" placeholder="Ejemplo: el ERP real es SAP, pero inventarios aun se controla en Excel..."></textarea>
          </label>
          <button class="primary-button" type="submit">Enviar al consultor</button>
        </form>
      </section>
    `;
  },

  input(name, label, value, help, type = "text") {
    return `
      <label class="form-field">
        ${label}
        <input name="${name}" type="${type}" value="${this.escape(value || "")}" />
        <span class="field-help">${help}</span>
      </label>
    `;
  },

  textarea(name, label, value, help) {
    return `
      <label class="form-field">
        ${label}
        <textarea name="${name}" rows="4">${this.escape(value || "")}</textarea>
        <span class="field-help">${help}</span>
      </label>
    `;
  },

  summaryBlock(title, items) {
    const values = (items || []).filter(Boolean);
    return `
      <div class="result-card">
        <p class="status-label">${title}</p>
        <ul class="compact-list">
          ${values.length ? values.map((item) => `<li>${this.escape(String(item))}</li>`).join("") : "<li>Pendiente de completar.</li>"}
        </ul>
      </div>
    `;
  },

  completionPercentage(packageData) {
    const missing = (packageData.missingInformation || []).length;
    const total = 11;
    return Math.max(0, Math.round(((total - missing) / total) * 100));
  },

  escape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
