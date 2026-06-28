# PB08 Test Plan

## Functional Tests

- Open `frontend/index.html`.
- Confirm VSM Builder renders.
- Confirm all process activities appear as VSM blocks.
- Select an activity and edit classification.
- Edit process/wait/queue min, likely, and max values.
- Drag an activity block.
- Reload and confirm saved VSM data persists locally.

## Calculation Tests

- Confirm Lead Time uses triangular expected values.
- Confirm Process Time uses process expected values.
- Confirm VA, NNVA, and NVA totals update after classification changes.
- Confirm handoffs use responsible role changes by sequence.
- Confirm Lead Time zero avoids divide-by-zero errors.

## Non-Scope Tests

Confirm the module does not include:

- Lean waste detection.
- TOC constraints.
- AI analysis.
- To-Be generation.
- Business Case.
- Roadmap.

