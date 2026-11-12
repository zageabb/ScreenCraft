# ScreenCraft — design intent and decisions
## Product intent
Local-first editable browser designer; Figma is optional. Canonical versioned JSON defines screens, hierarchy, reusable components, responsive rules, themes and provenance. Imported layers remain editable where supported, and lossy conversions raise warnings. Desktop/mobile-browser preview and export are core goals.
## Proposed architecture (not implemented)
Flask Python project/asset API, browser JavaScript editor, local JSON/assets, optional Figma/GitHub adapters; future HTML/CSS, Flask/Jinja and React output. P6 design tooling/P3 specialist editor variation of standard; no mandatory rewrite to P1 React/MUI/FastAPI.
## Open decisions
JSON schema; canvas library; undo/redo; file storage locking/versioning; import fidelity; native .fig feasibility; authenticated multiuser hosting; export semantics; licence/security review.
## Evidence
Ideas above are design statements, not implemented features. Record accepted architecture/exception through ADRs with tests and owner approval.
