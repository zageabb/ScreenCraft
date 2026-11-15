# Standard adoption
- Source: zageabb/Application-Standard
- Baseline: Application Design & Development Standard v1.0 proposed (2026-10-21)
- Adoption date: 2026-11-12
- Profile: P6 specialist design tool, with P3 web-editor characteristics
- Approved variance for planning: local-first Flask/JavaScript rather than P1 React/MUI/FastAPI
- Excludes private/corporate references, confidential assets and screenshot-derived unapproved tokens
- Reassess when runtime/dependencies selected and when standard changes
- Runtime compliance: NOT YET VALIDATED


## Pending standard adoption: x-spreadsheet extension (2026-11-15)

- Branch `feature/x-spreadsheet-object` syncs the canonical ScreenCraft object catalogue **v1.1.0** from `Application-Standard` with `x-spreadsheet`.
- .scraft **container format remains v1**; the new object is an optional extension rather than a new core required field.
- This is not evidence of a live embedded Univer engine. Production adoption requires editor/export tests and PR review.
- Re-review catalogue hash and central version at merge to detect drift.
