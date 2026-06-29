window.AppShell = Object.freeze({
  render(config, constants, navigation, activeRoute) {
    const activeItem = navigation.find((item) => item.route === activeRoute) || navigation[0];

    return `
      <div class="app-shell">
        <header class="app-header">
          <div class="brand" aria-label="${config.appName}">
            <div class="brand-mark" aria-hidden="true">PT</div>
            <div class="brand-text">
              <h1 class="brand-name">${config.appName}</h1>
              <p class="brand-subtitle">${constants.productTagline}</p>
            </div>
          </div>
          <div class="environment-pill" title="Current local execution context">
            <span class="environment-dot" aria-hidden="true"></span>
            <span>${config.environment} - v${config.appVersion}</span>
          </div>
        </header>

        <aside class="app-sidebar" aria-label="Primary navigation">
          ${this.renderNavigation(navigation, activeRoute)}
        </aside>

        <main class="app-main">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <span>Process Transformation AI</span>
            <span aria-hidden="true">/</span>
            <strong>${this.escape(activeItem.label)}</strong>
          </nav>
          <section class="main-content" id="main-content" aria-labelledby="page-title">
            <p class="page-kicker">${constants.pbCode} - ${constants.pbName}</p>
            <h2 id="page-title" class="page-title">Loading workspace.</h2>
          </section>
          <section class="mvp-nav-controls" id="mvp-nav-controls" aria-label="MVP methodology navigation"></section>
          <footer class="app-footer">
            <span>${config.appName} - ${constants.foundationStatus}</span>
            <span>${config.environment} / v${config.appVersion}</span>
          </footer>
        </main>
      </div>
    `;
  },

  renderNavigation(navigation, activeRoute) {
    const groups = navigation.reduce((accumulator, item) => {
      accumulator[item.group] = accumulator[item.group] || [];
      accumulator[item.group].push(item);
      return accumulator;
    }, {});

    return Object.keys(groups).map((group) => `
      <p class="nav-section-title">${this.escape(group)}</p>
      <ul class="nav-list">
        ${groups[group].map((item) => `
          <li>
            <button
              class="nav-item ${item.route === activeRoute ? "is-active" : ""} ${item.future ? "is-future" : ""}"
              data-route="${this.escape(item.route)}"
              ${item.locked ? "aria-disabled=\"true\"" : ""}
              type="button"
            >
              <span class="nav-indicator ${item.completed ? "is-completed" : ""} ${item.locked ? "is-locked" : ""}" aria-hidden="true"></span>
              <span class="nav-label">${this.escape(item.label)}</span>
              ${item.future ? "<span class=\"nav-badge\">Proximamente</span>" : ""}
              ${item.locked ? "<span class=\"nav-badge\">Bloqueado</span>" : ""}
            </button>
          </li>
        `).join("")}
      </ul>
    `).join("");
  },

  escape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
