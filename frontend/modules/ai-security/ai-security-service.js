window.AiSecurityService = Object.seal({
  sessionKey: "process-transformation-ai.session",
  memorySession: null,

  getSession() {
    try {
      const rawSession = window.sessionStorage.getItem(this.sessionKey);
      return rawSession ? JSON.parse(rawSession) : this.memorySession;
    } catch (error) {
      return this.memorySession;
    }
  },

  setSession(session) {
    this.memorySession = session;

    try {
      window.sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    } catch (error) {
      this.memorySession = session;
    }
  },

  clearSession() {
    this.memorySession = null;

    try {
      window.sessionStorage.removeItem(this.sessionKey);
    } catch (error) {
      this.memorySession = null;
    }
  },

  createLocalSession() {
    return {
      sessionId: "LOCAL_SESSION",
      user: {
        userId: "LOCAL_USER",
        displayName: "Consultor local",
        email: "local@operational-intelligence",
        role: "CONSULTOR"
      }
    };
  },

  login(email, password) {
    return window.ApiClient.post("login", { email, password });
  },

  logout(sessionId) {
    return window.ApiClient.post("logout", { sessionId });
  },

  validateSession(sessionId) {
    return window.ApiClient.post("validateSession", { sessionId });
  },

  executeAgent(sessionId, agentId, context) {
    return window.ApiClient.post("executeAgent", {
      sessionId,
      agentId,
      context
    });
  }
});
