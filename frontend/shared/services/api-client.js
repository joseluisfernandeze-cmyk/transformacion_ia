window.ApiClient = Object.freeze({
  async post(action, payload) {
    if (!window.APP_CONFIG.apiBaseUrl) {
      return {
        success: false,
        data: null,
        message: "Backend URL is not configured. Set APP_CONFIG.apiBaseUrl after deploying Apps Script.",
        errors: [{ code: "BACKEND_NOT_CONFIGURED", message: "apiBaseUrl is empty." }],
        meta: { action }
      };
    }

    const response = await fetch(window.APP_CONFIG.apiBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action,
        payload,
        requestId: `REQ-${Date.now()}`,
        metadata: {
          source: "frontend",
          appVersion: window.APP_CONFIG.appVersion
        }
      })
    });

    return response.json();
  }
});

