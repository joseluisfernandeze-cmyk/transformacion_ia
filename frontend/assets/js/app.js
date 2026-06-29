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
    { route: "methodology-orchestrator", label: "Methodology Orchestrator", group: "Control" },
    { route: "lean-consultant", label: "Lean Consultant", group: "Proximas etapas", future: true },
    { route: "toc-consultant", label: "TOC Consultant", group: "Proximas etapas", future: true },
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
    const appHtml = window.AppShell.render(window.APP_CONFIG, window.APP_CONSTANTS, navigation, route);
    window.DomUtils.setHtml(appRoot, appHtml);
    bindNavigation();
    renderRoute(route);
  }

  function bindNavigation() {
    appRoot.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const route = event.currentTarget.getAttribute("data-route");
        window.location.hash = `#/${route}`;
      });
    });
  }

  function renderRoute(route) {
    const routeItem = navigation.find((item) => item.route === route);
    const handler = routeHandlers[route];
    const session = window.AiSecurityService ? window.AiSecurityService.getSession() || window.AiSecurityService.createLocalSession() : { user: { displayName: "Consultor local" } };

    if (routeItem && routeItem.future) {
      renderFuture(routeItem);
      return;
    }

    if (handler) {
      handler("#main-content", session);
      return;
    }

    renderDashboard("#main-content", session);
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
    const status = window.MethodologyOrchestratorService ? window.MethodologyOrchestratorService.loadState().projectTransformationStatus : null;
    const businessState = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
    const businessPackage = businessState && businessState.package ? businessState.package : null;
    const projectName = businessPackage && businessPackage.organization && businessPackage.organization.name ? businessPackage.organization.name : "Proyecto de transformacion";
    const nextStep = status ? status.currentStageName : "Business Discovery";
    const updatedAt = status ? status.updatedAt : new Date().toISOString();

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
          ${dashboardCard("Estado", status ? status.currentStageName : "En preparacion")}
          ${dashboardCard("Avance", status ? `${status.progressPercentage}%` : "0%")}
          ${dashboardCard("Proximo paso", nextStep)}
          ${dashboardCard("Health Score", status ? status.projectHealthScore : 0)}
          ${dashboardCard("Ultima actualizacion", updatedAt)}
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
  }

  function renderProjects(rootSelector) {
    const root = window.DomUtils.selectElement(rootSelector);
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
          ${dashboardCard("Industria", organization.industry || "Pendiente")}
          ${dashboardCard("Pais", organization.country || "Pendiente")}
          ${dashboardCard("Colaboradores", organization.employees || "Pendiente")}
          ${dashboardCard("Estado", packageData ? packageData.status : "Sin Business Knowledge Package")}
        </section>
      </section>
    `);
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
