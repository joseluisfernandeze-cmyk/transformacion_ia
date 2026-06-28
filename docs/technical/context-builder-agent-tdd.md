# TDD - Context Builder Agent

## 1. Objective

Implement the first operational agent of Operational Intelligence Platform.

The Context Builder Agent converts normalized project knowledge into a reusable **Knowledge Package** and **Context Graph**.

It does not perform Lean, TOC, VSM, To-Be, Business Case, or improvement analysis.

## 2. Document Intelligence Layer

The agent never consumes raw files directly.

Raw files such as Word, PDF, Excel, PowerPoint, Visio, images, photos, interviews, and notes must first pass through the **Document Intelligence Layer**.

For this PB, OCR and binary extraction are not implemented. The layer only accepts:

- normalized documents already available as text
- document metadata
- interviews as text
- notes as text

Future extraction, OCR, image interpretation, Visio parsing, and connectors belong to this layer.

## 3. Knowledge Package

The previous name `Context Snapshot` is replaced by **Knowledge Package**.

The Knowledge Package is the reusable project knowledge asset consumed by future agents.

Required version metadata:

```text
version
createdBy
createdAt
sourceDocuments
confidence
parentKnowledgePackage
```

## 4. Context Graph

The Context Graph represents relationships between:

- processes
- activities
- people
- areas
- documents
- systems
- indicators
- restrictions
- business rules

Future agents consume Knowledge Packages and Context Graphs instead of original documents when a valid package exists.

## 5. Architecture

```text
Workspace
  -> Agent Orchestrator
    -> Agent Registry
    -> Context Builder Agent
      -> Document Intelligence Layer
      -> Process Model Adapter
      -> Prompt Repository
      -> AIService
      -> Knowledge Package Repository
      -> Context Graph Repository
```

## 6. Input

```json
{
  "projectId": "PRJ-000001",
  "processModelId": "PM-000001",
  "documentIds": [],
  "normalizedDocuments": [],
  "interviewNotes": [],
  "freeNotes": [],
  "parentKnowledgePackage": ""
}
```

At least one normalized document, interview note, or free note is required.

## 7. Output

```json
{
  "knowledgePackage": {
    "knowledgePackageId": "KPK-...",
    "version": 1,
    "objective": {},
    "scope": {},
    "identifiedProcesses": [],
    "identifiedActivities": [],
    "systems": [],
    "people": [],
    "roles": [],
    "documents": [],
    "indicators": [],
    "restrictions": [],
    "businessRules": [],
    "contradictions": [],
    "missingInformation": [],
    "confidence": "LOW",
    "sourceDocuments": [],
    "parentKnowledgePackage": ""
  },
  "contextGraph": {
    "nodes": [],
    "edges": []
  }
}
```

## 8. Acceptance Criteria

- Agent ID is `CONTEXT_BUILDER`.
- Agent is executed through Agent Orchestrator.
- Agent uses AIService.
- Agent uses Prompt Repository.
- Agent consumes only normalized documents and textual notes.
- Agent creates a Knowledge Package.
- Agent creates a Context Graph.
- Knowledge Package is versioned.
- No Lean, TOC, VSM, To-Be, or Business Case logic exists.

