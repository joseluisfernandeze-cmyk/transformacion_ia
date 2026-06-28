# TDD PB08 - VSM Builder

## 1. Objective

Build the VSM Builder using Process Modeling Engine objects from PB06. The module creates a professional visual Value Stream Map, classifies activities as VA/NNVA/NVA, captures triangular time estimates, and calculates basic operational metrics.

## 2. Scope

Included: AS-IS VSM view, activity classification, triangular process/wait/queue time capture, layout persistence, visual map, metrics, local frontend execution, PB03-compatible backend contracts.

Excluded: Lean detection, TOC, AI, To-Be generation, Business Case, Roadmap, and process simulation execution.

## 3. Architecture

```text
VSM Builder
  -> Process Modeling Engine activity objects
  -> VSM extension data
  -> Calculation Engine
  -> VSM Renderer
  -> PB03 API contract
```

The VSM model extends activities through `activityUUID`. Activities are not duplicated.

## 4. Extended Activity Model

Each activity must include:

```text
activityId
activityUUID
```

`activityUUID` is permanent across versions and is used by VSM, comparison, simulation, and future analytics.

## 5. VSM Data

`VsmActivityData` stores:

```text
activityId
activityUUID
sequence
lane
color
collapsed
x
y
valueClassification
processTimeMin / processTimeLikely / processTimeMax
waitTimeMin / waitTimeLikely / waitTimeMax
queueTimeMin / queueTimeLikely / queueTimeMax
frequency
wip
timeUnit
```

Supported `mapType`:

```text
AS_IS
TO_BE
SIMULATION
BASELINE
```

## 6. Calculation Engine

All calculations are isolated in `frontend/shared/services/calculation-engine.js`.

This engine is independent from the VSM Renderer and is prepared for future Lean, TOC, Business Case, and Simulation usage.

Triangular expected value:

```text
expected = (min + likely + max) / 3
```

## 7. Metrics and Formulas

```text
Lead Time = SUM(processExpected + waitExpected + queueExpected)
Process Time = SUM(processExpected)
VA Time = SUM(processExpected where classification = VA)
NNVA Time = SUM(processExpected where classification = NNVA)
NVA Time = SUM(processExpected where classification = NVA)
VA % = VA Time / Lead Time * 100
NVA % = (NVA Time + accumulated waits) / Lead Time * 100
Handoffs = count changes in responsibleRole between sequential activities
```

## 8. APIs

PB08 uses the PB03 action contract:

```text
createVsmMap
getVsmMap
listVsmMaps
updateVsmActivityData
saveVsmMap
calculateVsmMetrics
getVsmMetrics
archiveVsmMap
```

## 9. Persistence

Frontend PB08 persists locally for immediate VS Code execution. Backend Apps Script contracts are prepared for Google Sheets persistence through:

```text
VsmMaps
VsmActivityData
VsmMetrics
```

## 10. Risks

- PB06 is not physically implemented in this workspace: mitigated with PB06-compatible activity objects.
- Duplicating activities: mitigated through `activityUUID`.
- Renderer coupling to calculations: mitigated with Calculation Engine.
- Future map types: mitigated with `mapType`.

## 11. Acceptance Criteria

- VSM renders from PB06-compatible activities.
- `mapType` supports AS_IS, TO_BE, SIMULATION, BASELINE.
- Activities use permanent `activityUUID`.
- VSM layout persists sequence, lane, color, collapsed, x, y.
- Triangular time fields are used.
- Metrics calculate through reusable Calculation Engine.
- No Lean, TOC, AI, To-Be, Business Case, or Roadmap is implemented.

## 12. Test Strategy

- Load VSM locally from VS Code.
- Validate metric calculations.
- Edit classification and triangular times.
- Drag activities and verify persisted x/y.
- Confirm local save and reload.
- Confirm no external dependencies.

