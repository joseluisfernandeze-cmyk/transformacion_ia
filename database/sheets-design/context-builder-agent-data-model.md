# Context Builder Agent Data Model

## NORMALIZED_DOCUMENTS

```text
normalizedDocumentId
documentId
projectId
documentType
title
normalizedText
sourceUrl
normalizationStatus
createdAt
createdBy
```

The Document Intelligence Layer owns this sheet.

## AGENT_EXECUTIONS

```text
agentExecutionId
agentId
projectId
processModelId
status
startedAt
completedAt
requestedBy
inputJson
outputJson
errorJson
```

## KNOWLEDGE_PACKAGES

```text
knowledgePackageId
version
projectId
processModelId
agentExecutionId
objectiveJson
scopeJson
identifiedProcessesJson
identifiedActivitiesJson
systemsJson
peopleJson
rolesJson
documentsJson
indicatorsJson
restrictionsJson
businessRulesJson
contradictionsJson
missingInformationJson
confidence
assumptionsJson
sourceDocumentsJson
parentKnowledgePackage
createdBy
createdAt
```

## CONTEXT_GRAPHS

```text
contextGraphId
knowledgePackageId
projectId
processModelId
version
nodesJson
edgesJson
createdAt
createdBy
```

