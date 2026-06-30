(function initializeApp() {
  const navigation = [
    { route: "dashboard", label: "Dashboard", group: "General" },
    { route: "projects", label: "Proyectos", group: "General" },
    { route: "business-discovery", label: "Business Discovery", group: "Metodologia" },
    { route: "context-builder", label: "Context Builder", group: "Metodologia" },
    { route: "process-discovery", label: "Process Discovery", group: "Metodologia" },
    { route: "process-modeling", label: "Process Modeling", group: "Metodologia" },
    { route: "process-validation", label: "Process Validation", group: "Metodologia" },
    { route: "process-data-collection", label: "Process Data Collection", group: "Metodologia" },
    { route: "intelligent-vsm", label: "Intelligent VSM", group: "Metodologia" },
    { route: "transformation-workshop", label: "Transformation Workshop", group: "Metodologia" },
    { route: "lean-consultant", label: "Lean Consultant", group: "Metodologia" },
    { route: "toc-consultant", label: "TOC Consultant", group: "Metodologia" },
    { route: "methodology-orchestrator", label: "Methodology Orchestrator", group: "Control" },
    { route: "automation-ai", label: "Automation & AI Consultant", group: "Proximas etapas", future: true },
    { route: "to-be-designer", label: "To-Be Designer", group: "Proximas etapas", future: true },
    { route: "business-case", label: "Business Case", group: "Proximas etapas", future: true },
    { route: "roadmap", label: "Roadmap", group: "Proximas etapas", future: true },
    { route: "executive-report", label: "Executive Report", group: "Proximas etapas", future: true }
  ];

  const routeHandlers = {
    "dashboard": renderDashboard,
    "projects": renderProjects,
    "business-discovery": mountController("BusinessDiscoveryController"),
    "context-builder": mountController("ContextBuilderController"),
    "process-discovery": mountController("ProcessDiscoveryController"),
    "process-modeling": mountController("ProcessModelingStudioController"),
    "process-validation": mountController("ProcessValidationStudioController"),
    "process-data-collection": mountController("ProcessDataCollectionStudioController"),
    "intelligent-vsm": mountController("IntelligentVsmStudioController"),
    "transformation-workshop": mountController("TransformationWorkshopController"),
    "lean-consultant": mountController("LeanConsultantController"),
    "toc-consultant": mountController("TocConsultantController"),
    "methodology-orchestrator": mountController("MethodologyOrchestratorController")
  };

  const appRoot = window.DomUtils.selectElement("#app");

  if (!appRoot) {
    return;
  }

  function currentRoute() {
    const hash = window.location.hash.replace("#/", "").replace("#", "");
    const route = hash || "dashboard";
    return navigation.some((item) => item.route === route) ? route : "dashboard";
  }

  function renderProductShell() {
    const route = currentRoute();
    const flowState = window.MvpNavigationStore ? window.MvpNavigationStore.loadState() : null;
    const appHtml = window.AppShell.render(window.APP_CONFIG, window.APP_CONSTANTS, enrichNavigation(flowState), route);
    window.DomUtils.setHtml(appRoot, appHtml);
    bindNavigation();
    renderRoute(route);
  }

  function bindNavigation() {
    appRoot.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const route = event.currentTarget.getAttribute("data-route");
        const gate = window.MvpNavigationStore ? window.MvpNavigationStore.canAccessRoute(window.MvpNavigationStore.loadState(), route) : { allowed: true };

        if (!gate.allowed) {
          event.preventDefault();
          showFlowNotice(gate.message);
          return;
        }

        window.location.hash = `#/${route}`;
      });
    });
  }

  function renderRoute(route) {
    const routeItem = navigation.find((item) => item.route === route);
    const handler = routeHandlers[route];
    const session = window.AiSecurityService ? window.AiSecurityService.getSession() || window.AiSecurityService.createLocalSession() : { user: { displayName: "Consultor local" } };
    const gate = window.MvpNavigationStore ? window.MvpNavigationStore.canAccessRoute(window.MvpNavigationStore.loadState(), route) : { allowed: true };

    if (!gate.allowed) {
      renderBlockedRoute(routeItem, gate.message);
      renderFlowControls(route);
      return;
    }

    if (routeItem && routeItem.future) {
      renderFuture(routeItem);
      renderFlowControls(route);
      return;
    }

    if (handler) {
      handler("#main-content", session);
      renderFlowControls(route);
      return;
    }

    renderDashboard("#main-content", session);
    renderFlowControls(route);
  }

  function mountController(controllerName) {
    return function mount(rootSelector, session) {
      const controller = window[controllerName];

      if (!controller) {
        renderUnavailable(rootSelector, controllerName);
        return;
      }

      controller.init(rootSelector, session);
    };
  }

  function renderDashboard(rootSelector) {
    const root = window.DomUtils.selectElement(rootSelector);
    const flowState = window.MvpNavigationStore ? window.MvpNavigationStore.loadState() : null;
    const activeProject = flowState ? window.MvpNavigationStore.getActiveProject(flowState) : null;
    const recentProjects = flowState ? window.MvpNavigationStore.getRecentProjects(flowState).map((project) => window.MvpNavigationStore.summarizeProject(project)) : [];
    const status = window.MethodologyOrchestratorService ? window.MethodologyOrchestratorService.loadState().projectTransformationStatus : null;
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const businessPackage = businessState && businessState.package ? businessState.package : null;
    const projectName = activeProject ? activeProject.name : businessPackage && businessPackage.organization && businessPackage.organization.name ? businessPackage.organization.name : "Proyecto de transformacion";
    const nextStep = activeProject ? resolveNextOpenStage(activeProject) : status ? status.currentStageName : "Business Discovery";
    const updatedAt = activeProject ? activeProject.lastModifiedAt : status ? status.updatedAt : new Date().toISOString();

    window.DomUtils.setHtml(root, `
      <section class="dashboard-home" aria-labelledby="dashboard-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Application Dashboard</p>
            <h2 id="dashboard-title" class="page-title">Centro de transformacion</h2>
            <p class="page-description">Recorre la metodologia completa desde una unica interfaz navegable.</p>
          </div>
        </header>

        <section class="dashboard-summary-grid">
          ${dashboardCard("Proyecto actual", projectName)}
          ${dashboardCard("Estado", activeProject ? activeProject.status : "En preparacion")}
          ${dashboardCard("Avance", activeProject ? `${activeProject.progressPercentage}%` : status ? `${status.progressPercentage}%` : "0%")}
          ${dashboardCard("Proximo paso", nextStep)}
          ${dashboardCard("Health Score", status ? status.projectHealthScore : 0)}
          ${dashboardCard("Ultima actualizacion", updatedAt)}
        </section>

        <section class="studio-panel">
          <div class="context-section-header">
            <h3 class="panel-title">Proyectos recientes</h3>
            <button class="secondary-button" data-dashboard-route="projects" type="button">Gestionar proyectos</button>
          </div>
          <div class="project-card-grid">
            ${recentProjects.map((project) => `
              <article class="project-card">
                <div>
                  <strong>${escapeHtml(project.name)}</strong>
                  <span>${escapeHtml(project.currentStage)}</span>
                </div>
                <div class="mini-progress" aria-label="Project progress">
                  <span style="width: ${project.progressPercentage}%"></span>
                </div>
                <small>${project.progressPercentage}% - ${escapeHtml(project.lastModifiedAt)}</small>
                <button class="link-button" data-continue-project="${escapeHtml(project.projectId)}" type="button">Continuar</button>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="studio-panel">
          <div class="context-section-header">
            <h3 class="panel-title">Metodologia visible</h3>
            <span class="status-note">${navigation.length} rutas</span>
          </div>
          <div class="route-grid">
            ${navigation.filter((item) => item.group !== "Proximas etapas").map((item) => `
              <button class="route-card" data-dashboard-route="${item.route}" type="button">
                <strong>${item.label}</strong>
                <span>Abrir workspace</span>
              </button>
            `).join("")}
          </div>
        </section>
      </section>
    `);

    root.querySelectorAll("[data-dashboard-route]").forEach((button) => {
      button.addEventListener("click", (event) => {
        window.location.hash = `#/${event.currentTarget.getAttribute("data-dashboard-route")}`;
      });
    });
    root.querySelectorAll("[data-continue-project]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const state = window.MvpNavigationStore.selectProject(window.MvpNavigationStore.loadState(), event.currentTarget.getAttribute("data-continue-project"));
        const project = window.MvpNavigationStore.getActiveProject(state);
        window.location.hash = `#/${project.currentRoute || "projects"}`;
      });
    });
  }

  function renderProjects(rootSelector) {
    const root = window.DomUtils.selectElement(rootSelector);
    const flowState = window.MvpNavigationStore ? window.MvpNavigationStore.loadState() : null;
    const activeProject = flowState ? window.MvpNavigationStore.getActiveProject(flowState) : null;
    const recentProjects = flowState ? window.MvpNavigationStore.getRecentProjects(flowState).map((project) => window.MvpNavigationStore.summarizeProject(project)) : [];
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const packageData = businessState && businessState.package ? businessState.package : null;
    const organization = packageData && packageData.organization ? packageData.organization : {};

    window.DomUtils.setHtml(root, `
      <section class="projects-workspace" aria-labelledby="projects-title">
        <header class="business-hero">
          <div>
            <p class="page-kicker">Proyectos</p>
            <h2 id="projects-title" class="page-title">${escapeHtml(organization.name || "Proyecto actual")}</h2>
            <p class="page-description">Vista inicial del proyecto activo. La gestion multi-proyecto queda preparada para versiones futuras.</p>
          </div>
        </header>
        <section class="dashboard-summary-grid">
          ${dashboardCard("Proyecto activo", activeProject ? activeProject.name : organization.name || "Pendiente")}
          ${dashboardCard("Estado", activeProject ? activeProject.status : packageData ? packageData.status : "Sin Business Knowledge Package")}
          ${dashboardCard("Etapa actual", activeProject ? resolveNextOpenStage(activeProject) : "Business Discovery")}
          ${dashboardCard("Avance", activeProject ? `${activeProject.progressPercentage}%` : "0%")}
        </section>
        <section class="studio-panel">
          <h3 class="panel-title">Crear proyecto MVP</h3>
          <form class="project-create-form" id="project-create-form">
            <label class="form-field">
              Nombre del proyecto
              <input name="projectName" value="${escapeHtml(organization.name || "")}" placeholder="Ej. Transformacion proceso Order to Cash" />
            </label>
            <button class="primary-button" type="submit">Crear proyecto</button>
          </form>
        </section>
        <section class="studio-panel">
          <div class="context-section-header">
            <h3 class="panel-title">Proyectos recientes</h3>
            <span class="status-note">${recentProjects.length} proyecto(s)</span>
          </div>
          <div class="project-table">
            ${recentProjects.map((project) => `
              <button class="project-row ${activeProject && activeProject.projectId === project.projectId ? "is-active" : ""}" data-project-id="${escapeHtml(project.projectId)}" type="button">
                <span><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.projectId)}</small></span>
                <span>${escapeHtml(project.currentStage)}</span>
                <span>${project.progressPercentage}%</span>
                <span>${escapeHtml(project.lastModifiedAt)}</span>
              </button>
            `).join("")}
          </div>
        </section>
      </section>
    `);

    const form = root.querySelector("#project-create-form");

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const name = String(formData.get("projectName") || "").trim() || "Proyecto de transformacion";
        window.MvpNavigationStore.addProject(window.MvpNavigationStore.loadState(), name);
        window.location.hash = "#/business-discovery";
      });
    }

    root.querySelectorAll("[data-project-id]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const state = window.MvpNavigationStore.selectProject(window.MvpNavigationStore.loadState(), event.currentTarget.getAttribute("data-project-id"));
        const project = window.MvpNavigationStore.getActiveProject(state);
        window.location.hash = `#/${project.currentRoute || "business-discovery"}`;
      });
    });
  }

  function renderFuture(routeItem) {
    const root = window.DomUtils.selectElement("#main-content");
    window.DomUtils.setHtml(root, `
      <section class="future-workspace" aria-labelledby="future-title">
        <div class="conversation-card">
          <p class="page-kicker">Proximamente</p>
          <h2 id="future-title" class="page-title">${escapeHtml(routeItem.label)}</h2>
          <p class="page-description">Esta etapa ya esta visible en la metodologia, pero su funcionalidad se implementara en un Sprint posterior.</p>
        </div>
      </section>
    `);
  }

  function renderBlockedRoute(routeItem, message) {
    const root = window.DomUtils.selectElement("#main-content");
    window.DomUtils.setHtml(root, `
      <section class="future-workspace" aria-labelledby="blocked-title">
        <div class="conversation-card">
          <p class="page-kicker">Etapa bloqueada</p>
          <h2 id="blocked-title" class="page-title">${escapeHtml(routeItem ? routeItem.label : "Ruta bloqueada")}</h2>
          <p class="page-description">${escapeHtml(message || "Completa las etapas anteriores antes de continuar.")}</p>
        </div>
      </section>
    `);
  }

  function renderFlowControls(route) {
    const root = window.DomUtils.selectElement("#mvp-nav-controls");

    if (!root || !window.MvpNavigationStore) {
      return;
    }

    const state = window.MvpNavigationStore.loadState();
    const project = window.MvpNavigationStore.getActiveProject(state);
    const stage = project.stages[route];
    const previousRoute = window.MvpNavigationStore.getPreviousRoute(route);
    const nextRoute = window.MvpNavigationStore.getNextRoute(route);

    window.DomUtils.setHtml(root, `
      <div class="mvp-flow-panel">
        <div class="mvp-flow-summary">
          <strong>${escapeHtml(project.name)}</strong>
          <span>${project.progressPercentage}% completado</span>
          <div class="mvp-progress-bar" aria-label="MVP progress"><span style="width: ${project.progressPercentage}%"></span></div>
        </div>
        <div class="mvp-step-strip">
          ${window.MvpNavigationStore.stages.filter((item) => item.route !== "dashboard").map((item) => {
            const itemState = project.stages[item.route] || {};
            return `<button class="mvp-step ${item.route === route ? "is-active" : ""} status-${String(itemState.status || "AVAILABLE").toLowerCase()}" data-flow-route="${item.route}" type="button">${escapeHtml(item.label)}</button>`;
          }).join("")}
        </div>
        <div class="mvp-control-row">
          <button class="secondary-button" data-flow-action="previous" ${previousRoute ? "" : "disabled"} type="button">Anterior</button>
          <button class="secondary-button" data-flow-action="draft" ${stage ? "" : "disabled"} type="button">Guardar borrador</button>
          <button class="primary-button" data-flow-action="next" ${nextRoute ? "" : "disabled"} type="button">Siguiente</button>
        </div>
        <p class="mvp-flow-message" id="mvp-flow-message">${stage && stage.validationMessage ? escapeHtml(stage.validationMessage) : "El flujo usa persistencia local temporal compatible con la estructura futura de Apps Script."}</p>
      </div>
    `);

    root.querySelectorAll("[data-flow-route]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const targetRoute = event.currentTarget.getAttribute("data-flow-route");
        const gate = window.MvpNavigationStore.canAccessRoute(window.MvpNavigationStore.loadState(), targetRoute);

        if (!gate.allowed) {
          showFlowNotice(gate.message);
          return;
        }

        window.location.hash = `#/${targetRoute}`;
      });
    });

    root.querySelector("[data-flow-action='previous']").addEventListener("click", () => {
      if (previousRoute) {
        window.location.hash = `#/${previousRoute}`;
      }
    });

    root.querySelector("[data-flow-action='draft']").addEventListener("click", () => {
      window.MvpNavigationStore.saveDraft(window.MvpNavigationStore.loadState(), route);
      renderProductShell();
      showFlowNotice("Borrador guardado localmente.");
    });

    root.querySelector("[data-flow-action='next']").addEventListener("click", () => {
      const result = window.MvpNavigationStore.completeStage(window.MvpNavigationStore.loadState(), route);

      if (!result.success) {
        renderProductShell();
        showFlowNotice(result.message);
        return;
      }

      if (result.nextRoute) {
        window.location.hash = `#/${result.nextRoute}`;
      } else {
        renderProductShell();
      }
    });
  }

  function enrichNavigation(flowState) {
    if (!window.MvpNavigationStore || !flowState) {
      return navigation;
    }

    const project = window.MvpNavigationStore.getActiveProject(flowState);

    return navigation.map((item) => {
      const stage = project.stages[item.route];
      return {
        ...item,
        locked: stage ? stage.status === "LOCKED" : false,
        completed: stage ? stage.status === "COMPLETED" : false
      };
    });
  }

  function resolveNextOpenStage(project) {
    const nextStage = window.MvpNavigationStore.stages.find((stage) => {
      const stageState = project.stages[stage.route];
      return stage.required && stageState && stageState.status !== "COMPLETED";
    });

    return nextStage ? nextStage.label : "Flujo MVP completado";
  }

  function showFlowNotice(message) {
    const notice = window.DomUtils.selectElement("#mvp-flow-message");

    if (notice) {
      notice.textContent = message || "";
    }
  }

  function renderUnavailable(rootSelector, controllerName) {
    const root = window.DomUtils.selectElement(rootSelector);
    window.DomUtils.setHtml(root, `
      <section class="conversation-card">
        <h2 class="page-title">Modulo no disponible</h2>
        <p class="page-description">No se encontro ${escapeHtml(controllerName)} en la carga actual.</p>
      </section>
    `);
  }

  function dashboardCard(label, value) {
    return `
      <article class="status-card">
        <p class="status-label">${escapeHtml(label)}</p>
        <strong class="status-value">${escapeHtml(value)}</strong>
      </article>
    `;
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  window.addEventListener("hashchange", renderProductShell);

  if (window.AiSecurityController) {
    window.AiSecurityController.init("#app", renderProductShell);
    return;
  }

  renderProductShell();
})();
