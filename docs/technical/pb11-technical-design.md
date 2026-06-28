# TDD PB11 - AI & Security Foundation

## 1. Objective

Prepare the minimum security and AI infrastructure for a low-cost MVP used by a small group of users.

This PB does not implement OAuth, JWT, Firebase, Azure, licenses, multi-company support, Lean, TOC, To-Be, or Business Case.

## 2. Authentication

Authentication uses:

```text
email
password
```

Users are stored in Google Sheets in `USERS`. Passwords are stored as SHA-256 hashes. Apps Script compares the submitted password hash against `passwordHash`.

Roles:

```text
ADMIN
CONSULTOR
LECTOR
```

Sessions are simple server-side sessions stored with Apps Script `CacheService` for 4 hours.

## 3. AI Provider Architecture

`AIProviderClient` uses interchangeable providers:

```text
OPENAI
CLAUDE
GEMINI
DEEPSEEK
CUSTOM
```

The frontend never depends on a provider and never receives provider configuration or API keys.

## 4. AI_PROVIDERS Sheet

The single `API_KEY` config is replaced by `AI_PROVIDERS`.

Columns:

```text
providerId
providerCode
name
model
apiKey
baseUrl
temperature
maxTokens
isActive
createdAt
createdBy
updatedAt
updatedBy
```

Only one provider should be active by default for MVP unless an agent explicitly references a provider.

## 5. PROMPTS Sheet

Columns:

```text
promptId
name
description
prompt
isActive
createdAt
createdBy
updatedAt
updatedBy
```

Prompts can be changed in Google Sheets without republishing the frontend.

## 6. AGENTS Sheet

The frontend executes agents, not prompts.

Columns:

```text
agentId
name
description
promptId
providerId
isActive
createdAt
createdBy
updatedAt
updatedBy
```

`providerId` is optional. If empty, the backend selects the active provider in `AI_PROVIDERS`.

## 7. Mandatory AI Flow

```text
Frontend
  -> Apps Script
    -> AIService
      -> AIProviderClient
        -> Provider
      -> standardized JSON
  -> Frontend
```

The API key never reaches the browser.

## 8. API Actions

Authentication:

```text
login
logout
validateSession
```

AI:

```text
executeAgent
```

The old `executePrompt` action is not used.

## 9. executeAgent Contract

Request:

```json
{
  "action": "executeAgent",
  "payload": {
    "sessionId": "SES-...",
    "agentId": "AGT-000001",
    "context": {}
  }
}
```

Backend responsibilities:

- validate session
- validate role
- select agent
- select prompt
- select provider/model/key
- build final prompt
- call provider
- return standardized JSON

## 10. Files

Frontend:

```text
frontend/modules/ai-security/
frontend/shared/services/api-client.js
```

Backend:

```text
backend/apps-script/controllers/AuthController.gs
backend/apps-script/controllers/AIController.gs
backend/apps-script/services/AuthService.gs
backend/apps-script/services/SessionService.gs
backend/apps-script/services/AIService.gs
backend/apps-script/repositories/
backend/apps-script/utils/AIProviderClient.gs
```

## 11. Risks

- SHA-256 without salt is MVP-only and should be strengthened later.
- API keys in Sheets require strict sharing controls.
- Provider responses may not be valid JSON.
- CacheService sessions are simple and not enterprise identity.

## 12. Acceptance Criteria

- Login uses Google Sheets users.
- Passwords are compared using SHA-256.
- Roles are ADMIN, CONSULTOR, LECTOR.
- Sessions are stored server-side.
- AI providers are interchangeable.
- AI providers are stored in `AI_PROVIDERS`.
- Frontend executes `executeAgent`, never `executePrompt`.
- Backend selects provider, model, prompt, and API key.
- API key never reaches browser.
- AIService returns standardized JSON.

