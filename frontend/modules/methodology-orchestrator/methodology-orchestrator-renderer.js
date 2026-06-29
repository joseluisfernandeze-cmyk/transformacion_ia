window.MethodologyOrchestratorRenderer = Object.freeze({
  render(state, session) {
    const status = state.projectTransformationStatus;
    const selected = status.stages.find((stage) => stage.stageId === state.selectedStageId) || status.stages[0];

    return `
      <section class="methodology-orchestrator" aria-labelledby="orchestrator-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Sprint 11 - Case Runner & Methodology Orchestrator</p>
            <h2 id="orchestrator-title" class="page-title">Methodology Orchestrator</h2>
            <p class="page-description">Coordina la metodologia completa de consultoria, controla aprobaciones, bloqueos y avance sin ejecutar analisis ni IA.</p>
          </div>
          <div class="context-session">
            <span>${this.escape(session.user.displayName)}</span>
            <button class="secondary-button" id="logout-button" type="button">Salir</button>
          </div>
        </header>

        <div class="orchestrator-layout">
          <main class="orchestrator-main">
            ${this.renderDashboard(status)}
            ${this.renderStages(status, selected)}
          </main>
          <aside class="orchestrator-side">
            ${this.renderSelectedStage(selected, session)}
            ${this.renderBlockers(status)}
          </aside>
        </div>
      </section>
    `;
  },

  renderDashboard(status) {
    const items = [
      ["Etapa actual", status.currentStageName],
      ["Avance", `${status.progressPercentage}%`],
      ["Completadas", status.completedStages.length],
      ["Pendientes", status.pendingStages.length],
      ["Bloqueos", status.blockers.length],
      ["Informacion faltante", status.missingInformation.length],
      ["Health Score", status.projectHealthScore],
      ["Consultor responsable", status.responsibleConsultant]
    ];

    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <div>
            <p class="page-kicker">Project Transformation Status</p>
            <h3 class="panel-title">${this.escape(status.currentStageName)}</h3>
          </div>
          <span class="environment-pill">${this.escape(status.updatedAt)}</span>
        </div>
        <div class="orchestrator-progress">
          <div class="orchestrator-progress-bar" style="width:${status.progressPercentage}%;"></div>
        </div>
        <div class="dimension-grid">
          ${items.map(([label, value]) => `
            <div class="dimension-card">
              <p>${this.escape(label)}</p>
              <strong>${this.escape(value)}</strong>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderStages(status, selected) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Flujo oficial</h3>
          <span class="status-note">${status.stages.length} etapas</span>
        </div>
        <div class="stage-timeline">
          ${status.stages.map((stage) => this.renderStageCard(stage, selected)).join("")}
        </div>
      </section>
    `;
  },

  renderStageCard(stage, selected) {
    return `
      <button class="stage-card status-${this.escape(stage.status.toLowerCase())} ${selected && selected.stageId === stage.stageId ? "is-selected" : ""}" data-stage-id="${this.escape(stage.stageId)}" type="button">
        <span class="stage-sequence">${stage.sequence}</span>
        <span>
          <strong>${this.escape(stage.name)}</strong>
          <small>${this.escape(stage.owner)} / ${this.escape(stage.status)}</small>
        </span>
        <span class="stage-progress">${stage.progress}%</span>
      </button>
    `;
  },

  renderSelectedStage(stage, session) {
    return `
      <section class="studio-panel">
        <p class="page-kicker">Etapa seleccionada</p>
        <h3 class="panel-title">${this.escape(stage.name)}</h3>
        <div class="activity-meta">
          <p><strong>Estado:</strong> ${this.escape(stage.status)}</p>
          <p><strong>Responsable:</strong> ${this.escape(stage.owner)}</p>
          <p><strong>Avance:</strong> ${stage.progress}%</p>
          <p><strong>Health Score:</strong> ${stage.healthScore}</p>
          <p><strong>Actualizado:</strong> ${this.escape(stage.updatedAt || "Sin fecha")}</p>
        </div>
        ${stage.approval ? this.renderApproval(stage.approval) : this.renderApprovalForm(stage, session)}
      </section>
    `;
  },

  renderApproval(approval) {
    return `
      <div class="approval-box">
        <h4 class="panel-title">Aprobada</h4>
        <p><strong>Por:</strong> ${this.escape(approval.approvedBy)}</p>
        <p><strong>Fecha:</strong> ${this.escape(approval.approvedAt)}</p>
        <p><strong>Comentarios:</strong> ${this.escape(approval.comments || "Sin comentarios")}</p>
      </div>
    `;
  },

  renderApprovalForm(stage, session) {
    if (stage.future) {
      return `<p class="status-note">Etapa futura. No disponible en esta version.</p>`;
    }

    return `
      <form id="stage-approval-form" data-stage-id="${this.escape(stage.stageId)}">
        <label class="form-field">
          Aprobado por
          <input name="approvedBy" value="${this.escape(session.user.displayName || "Consultor local")}" />
        </label>
        <label class="form-field">
          Comentarios
          <textarea name="comments" rows="3" placeholder="Comentarios de aprobacion"></textarea>
        </label>
        <button class="primary-button" type="submit" ${stage.readyForApproval ? "" : "disabled"}>Aprobar etapa</button>
        ${stage.readyForApproval ? "" : `<p class="status-note">No se puede aprobar hasta resolver bloqueos o informacion faltante.</p>`}
      </form>
    `;
  },

  renderBlockers(status) {
    return `
      <section class="studio-panel">
        <div class="context-section-header">
          <h3 class="panel-title">Bloqueos e informacion faltante</h3>
          <span class="status-note">${status.blockers.length + status.missingInformation.length}</span>
        </div>
        <ul class="validation-list">
          ${status.blockers.map((item) => `
            <li class="is-failed">
              <span>BLOCK</span>
              <div>
                <strong>${this.escape(item.stageName)}</strong>
                <p>${this.escape(item.blocker)}</p>
              </div>
            </li>
          `).join("")}
          ${status.missingInformation.map((item) => `
            <li class="is-failed">
              <span>MISS</span>
              <div>
                <strong>${this.escape(item.stageName)}</strong>
                <p>${this.escape(item.item)}</p>
              </div>
            </li>
          `).join("")}
          ${status.blockers.length || status.missingInformation.length ? "" : "<li class=\"is-passed\"><span>OK</span><div><strong>Sin bloqueos</strong><p>La metodologia no tiene bloqueos abiertos.</p></div></li>"}
        </ul>
      </section>
    `;
  },

  escape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
