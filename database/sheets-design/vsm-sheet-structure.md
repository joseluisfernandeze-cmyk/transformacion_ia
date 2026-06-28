# PB08 VSM Sheet Structure

## Relationship Rules

- `VsmMaps.processModelId` references `ProcessModels.processModelId`.
- `VsmActivityData.activityId` references `ProcessModelActivities.activityId`.
- `VsmActivityData.activityUUID` references `ProcessModelActivities.activityUUID`.
- `VsmMetrics.vsmMapId` references `VsmMaps.vsmMapId`.

## Layout Persistence

The visual layout is stored in `VsmActivityData`:

```text
sequence
lane
color
collapsed
x
y
```

This allows the renderer to change without losing user layout decisions.

## Triangular Distribution Fields

Each time category uses:

```text
Min
Likely
Max
```

Examples:

```text
processTimeMin
processTimeLikely
processTimeMax
```

The reusable Calculation Engine computes expected values using:

```text
(min + likely + max) / 3
```

