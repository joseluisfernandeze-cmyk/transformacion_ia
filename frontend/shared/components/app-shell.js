window.AppShell = Object.freeze({
  render(config, constants) {
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
          <p class="nav-section-title">Workspace</p>
          <ul class="nav-list">
            <li class="nav-item is-active">
              <span class="nav-indicator" aria-hidden="true"></span>
              Validation Studio
            </li>
            <li class="nav-item">
              <span class="nav-indicator" aria-hidden="true"></span>
              Sprint 6 active
            </li>
          </ul>
        </aside>

        <main class="app-main">
          <section class="main-content" id="main-content" aria-labelledby="page-title">
            <p class="page-kicker">${constants.pbCode} - ${constants.pbName}</p>
            <h2 id="page-title" class="page-title">Loading workspace.</h2>
          </section>
        </main>
      </div>
    `;
  }
});
