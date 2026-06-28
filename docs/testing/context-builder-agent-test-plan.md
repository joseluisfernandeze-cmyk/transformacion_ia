# Context Builder Agent Test Plan

## Functional Tests

- Execute `CONTEXT_BUILDER` with one normalized document.
- Execute with interview notes only.
- Execute with free notes only.
- Confirm Knowledge Package is created.
- Confirm Context Graph is created.
- Confirm version is assigned.
- Confirm `sourceDocuments` is stored.
- Confirm `parentKnowledgePackage` can be stored.

## Negative Tests

- Reject missing `projectId`.
- Reject request with no normalized documents, interviews, or notes.
- Reject LECTOR role.
- Reject invalid AI JSON response.

## Non-Scope Tests

Confirm output does not include:

- Lean waste analysis.
- TOC constraints analysis.
- VSM construction.
- To-Be process design.
- Business Case.

