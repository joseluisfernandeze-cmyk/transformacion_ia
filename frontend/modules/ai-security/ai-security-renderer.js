window.AiSecurityRenderer = Object.freeze({
  renderLogin(message) {
    return `
      <main class="auth-screen">
        <section class="auth-panel" aria-labelledby="auth-title">
          <p class="page-kicker">PB11 - AI & Security Foundation</p>
          <h1 id="auth-title" class="page-title">Sign in to Process Transformation AI</h1>
          <p class="page-description">Use the MVP account stored in Google Sheets. API keys and prompts are never loaded in the browser.</p>
          ${message ? `<div class="auth-message">${message}</div>` : ""}
          <form id="login-form" class="auth-form">
            <label class="form-field">
              Email
              <input name="email" type="email" autocomplete="username" required />
            </label>
            <label class="form-field">
              Password
              <input name="password" type="password" autocomplete="current-password" required />
            </label>
            <button class="primary-button" type="submit">Login</button>
          </form>
        </section>
      </main>
    `;
  },

  renderAgentPanel(session) {
    return `
      <section class="ai-panel" aria-label="AI agent execution">
        <div>
          <p class="page-kicker">AI Agent</p>
          <h3 class="panel-title">Execute configured agent</h3>
          <p class="status-note">Logged in as ${session.user.displayName} (${session.user.role}). The frontend sends only agent id and context.</p>
        </div>
        <form id="agent-form" class="agent-form">
          <label class="form-field">
            Agent ID
            <input name="agentId" value="CONTEXT_BUILDER" required />
          </label>
          <label class="form-field">
            Context JSON
            <textarea name="context" rows="10">{
  "projectId": "PRJ-000001",
  "processModelId": "PM-000001",
  "normalizedDocuments": [
    {
      "documentId": "DOC-000001",
      "documentType": "Markdown",
      "title": "Interview notes",
      "normalizedText": "The onboarding process starts when Sales receives a customer request. Operations validates documents and creates the account."
    }
  ],
  "interviewNotes": [],
  "freeNotes": []
}</textarea>
          </label>
          <button class="primary-button" type="submit">Execute agent</button>
          <button class="secondary-button" id="logout-button" type="button">Logout</button>
        </form>
        <pre id="agent-result" class="agent-result">{ "status": "Ready" }</pre>
      </section>
    `;
  }
});
