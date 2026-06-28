# PB08 VSM Data Model

PB08 extends Process Modeling Engine activities. It does not duplicate activities.

## Required Activity Identity

Every process activity must have:

```text
activityId
activityUUID
```

`activityId` is the operational sheet identifier. `activityUUID` is the permanent cross-version identity used by VSM, comparison, simulation, and future analytics.

## Sheets

```text
VsmMaps
VsmActivityData
VsmMetrics
```

## VsmMaps

```text
vsmMapId
processModelId
initiativeId
processId
mapType
name
description
status
createdAt
createdBy
updatedAt
updatedBy
isActive
```

Supported `mapType` values:

```text
AS_IS
TO_BE
SIMULATION
BASELINE
```

## VsmActivityData

```text
vsmActivityDataId
vsmMapId
activityId
activityUUID
sequence
lane
color
collapsed
x
y
valueClassification
processTimeMin
processTimeLikely
processTimeMax
waitTimeMin
waitTimeLikely
waitTimeMax
queueTimeMin
queueTimeLikely
queueTimeMax
frequency
wip
timeUnit
notes
createdAt
createdBy
updatedAt
updatedBy
isActive
```

Supported `valueClassification` values:

```text
VA
NNVA
NVA
```

## VsmMetrics

```text
vsmMetricId
vsmMapId
leadTimeTotal
processTimeTotal
valueAddedTime
necessaryNonValueAddedTime
nonValueAddedTime
valueAddedPercentage
nonValueAddedPercentage
handoffCount
activityCount
responsibleCount
accumulatedWaitTime
calculatedAt
calculatedBy
```

