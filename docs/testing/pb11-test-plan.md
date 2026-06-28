# PB11 Test Plan

## Authentication

- Login with active user and correct password.
- Reject wrong password.
- Reject inactive user.
- Validate active session.
- Reject missing or expired session.
- Logout clears session.

## Roles

- ADMIN can execute agent.
- CONSULTOR can execute agent.
- LECTOR cannot execute agent.

## AI Provider Security

- Confirm API key is read from `AI_PROVIDERS`.
- Confirm API key is not returned to frontend.
- Confirm frontend sends `agentId`, not `promptId`.
- Confirm backend selects prompt from `AGENTS.promptId`.
- Confirm backend selects active provider or agent-specific provider.

## Provider Strategy

- Validate routing for OPENAI.
- Validate routing for CLAUDE.
- Validate routing for GEMINI.
- Validate routing for DEEPSEEK.
- Validate routing for CUSTOM.

