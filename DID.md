# ScreenCraft — design intent and decisions
## Product intent
Local-first editable browser designer; Figma is optional. Canonical versioned JSON defines screens, hierarchy, reusable components, responsive rules, themes and provenance. Imported layers remain editable where supported, and lossy conversions raise warnings. Desktop/mobile-browser preview and export are core goals.
## Proposed architecture (not implemented)
Flask Python project/asset API, browser JavaScript editor, local JSON/assets, optional Figma/GitHub adapters; future HTML/CSS, Flask/Jinja and React output. P6 design tooling/P3 specialist editor variation of standard; no mandatory rewrite to P1 React/MUI/FastAPI.
## Open decisions
JSON schema; canvas library; undo/redo; file storage locking/versioning; import fidelity; native .fig feasibility; authenticated multiuser hosting; export semantics; licence/security review.
## Evidence
Ideas above are design statements, not implemented features. Record accepted architecture/exception through ADRs with tests and owner approval.

## Design direction extension — 2026-11-12
User requested SQL-backed mock data for multi-user prototypes, approved .scraft as a ZIP application archive with PNG support, selected standalone interactive single-file HTML export, and required Ubuntu/Caddy readiness from the first running build. See docs/INTERACTIVE_PROTOTYPE_PROPOSAL.md.
**Proposed implementation:** React + TypeScript + HTML5/CSS editor with Flask API, PostgreSQL project/mock dataset persistence (in-browser preview state for offline mode); .scraft ZIP includes JSON/screens/themes/assets and **seed mock data only**, not runtime SQL data. Application interface supports declarative navigation, modal, filter and Add Record behaviours; not production business processing. Separate authenticated server multi-user sessions from optional future live collaboration.
Deployment: /apps/screencraft/ via trusted Caddy reverse proxy is an MVP acceptance gate, not a post-release enhancement. Detailed library selection, JSON schema and SQL structure remain implementation decisions to validate.
