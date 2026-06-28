# Operational Intelligence Platform

Professional platform for operational intelligence and process transformation.

This repository contains the frozen Core architecture and the first functional consulting experiences for **Process Transformation AI**, evolving toward a reusable **Operational Intelligence Platform**.

## Current Scope

Implemented local frontend experiences:

- Business Discovery Experience
- Context Builder Agent workspace
- Discovery Workspace
- Process Discovery Consultant
- Process Modeling Studio / As-Is Studio
- Process Validation Studio
- VSM Builder base module
- AI and Security Foundation base module

The current frontend runs locally with plain HTML, CSS, and JavaScript. Backend foundations are prepared for Google Apps Script, Google Sheets, Google Drive, and AI providers.

## Architecture

The platform is organized around a reusable Core and solution-specific experiences.

Core concepts:

- Project and business knowledge capture
- Document Intelligence Layer
- Knowledge Package
- Business Knowledge Package
- Context Graph
- Process Model
- Process Modeling Engine
- Calculation Engine
- Agent Registry
- Agent Orchestrator
- AIService
- AI Provider abstraction
- Prompt Repository
- Authentication foundation
- Workspace experiences

Current solution:

- Process Transformation

Future supported solutions:

- ERP Discovery
- ERP RFP Builder
- Operational Audit
- Workload Analysis
- Knowledge Capture

## Technologies

Frontend:

- HTML
- CSS
- JavaScript
- No npm
- No frontend framework
- No external libraries

Backend:

- Google Apps Script

Database:

- Google Sheets

Document repository:

- Google Drive

Source control:

- Git
- GitHub

IDE:

- Visual Studio Code

## Folder Structure

```text
backend/
  apps-script/
    config/
    controllers/
    repositories/
    services/
    utils/
    validators/

database/
  sheets-design/

docs/
  product/
  technical/
  testing/

drive/
  structure/

frontend/
  assets/
    css/
    js/
  config/
  modules/
  shared/

tests/
```

## Run Locally from VS Code

1. Open Visual Studio Code.
2. Select `File > Open Folder`.
3. Open:

```text
C:\Users\josh_\Documents\GitHub\transformacion_ia
```

4. Open:

```text
frontend/index.html
```

5. Right-click the file and open it in the browser.

Optional:

- Use the VS Code Live Server extension if it is already installed.
- Do not install npm packages. The project currently does not require npm.

## Google Apps Script Configuration

The backend source is located in:

```text
backend/apps-script/
```

Expected deployment model:

1. Create a Google Apps Script project.
2. Copy or sync the `.gs` files from `backend/apps-script`.
3. Deploy as a Web App.
4. Configure the deployed Web App URL in:

```text
frontend/config/app-config.js
```

Configuration key:

```text
APP_CONFIG.apiBaseUrl
```

Security rule:

- Never expose API keys in frontend JavaScript.
- All provider credentials must be read by Apps Script from controlled configuration sheets.

## Google Sheets Configuration

Google Sheets is the operational database.

Design references are in:

```text
database/sheets-design/
```

Expected sheet categories:

- Users
- Sessions
- AI providers
- Prompts
- Agents
- Knowledge Packages
- Context Graphs
- Normalized Documents
- Process Models
- VSM data
- Audit/execution logs

Rules:

- Use stable IDs.
- Keep headers consistent.
- Do not store raw secrets in frontend-accessible files.
- Do not commit exported sheets containing credentials.

## Google Drive Configuration

Google Drive is the document repository.

Reference structure:

```text
drive/structure/google-drive-structure.md
```

Expected use:

- Project folders
- Source documents
- Normalized documents
- Generated artifacts
- Evidence files

Rules:

- Original documents remain in Drive.
- Agents consume normalized documents and Knowledge Packages whenever available.
- Evidence must remain traceable to source documents or interviews.

## AI Provider Configuration

AI provider access is handled only by backend services.

Supported provider architecture:

- OpenAI
- Claude
- Gemini
- DeepSeek
- Custom provider

Expected configuration:

- Provider code
- Model
- API key
- Temperature
- Max tokens
- Active provider flag

Rules:

- API keys must never be committed.
- API keys must never be sent to the browser.
- Frontend requests agent execution only.
- Backend selects provider, prompt, model, and executes AI calls.

## Git Flow

Simplified flow:

```text
feature/sprint-XX
  -> development
  -> tests
  -> commit
  -> merge to develop
  -> push
  -> approval
  -> merge to main
  -> tag v0.X.X
```

Primary development branch:

```text
develop
```

Stable branch:

```text
main
```

## Security

The repository must not include:

- API keys
- Tokens
- Credentials
- Service account files
- Local `.env` files
- Logs
- Temporary files
- Local VS Code configuration
- Test artifacts

See `.gitignore` for enforced exclusions.

## Current Status

The Core architecture is frozen. New development must follow the approved Sprint flow and must not redesign Core architecture unless explicitly requested.
