(function initializeApp() {
  const appRoot = window.DomUtils.selectElement("#app");

  if (!appRoot) {
    return;
  }

  const renderProductShell = function renderProductShell() {
    const appHtml = window.AppShell.render(window.APP_CONFIG, window.APP_CONSTANTS);
    window.DomUtils.setHtml(appRoot, appHtml);

    const session = window.AiSecurityService ? window.AiSecurityService.getSession() : null;

    if (window.TransformationWorkshopController) {
      window.TransformationWorkshopController.init("#main-content", session || window.AiSecurityService.createLocalSession());
    }
  };

  if (window.AiSecurityController) {
    window.AiSecurityController.init("#app", renderProductShell);
    return;
  }

  renderProductShell();
})();
