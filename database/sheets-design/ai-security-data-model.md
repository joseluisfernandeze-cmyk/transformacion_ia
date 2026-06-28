# PB11 AI & Security Data Model

## USERS

```text
userId
email
displayName
passwordHash
role
status
lastLoginAt
createdAt
createdBy
updatedAt
updatedBy
isActive
```

Rules:

- `email` must be unique.
- `passwordHash` stores SHA-256.
- Valid roles: `ADMIN`, `CONSULTOR`, `LECTOR`.
- Valid status: `ACTIVE`, `INACTIVE`, `LOCKED`.

## AI_PROVIDERS

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

Supported providers:

```text
OPENAI
CLAUDE
GEMINI
DEEPSEEK
CUSTOM
```

`apiKey` is read only by Apps Script and must never be sent to the frontend.

## PROMPTS

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

## AGENTS

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

The frontend sends only `agentId` and `context`. The backend selects the prompt and provider.

