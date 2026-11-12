# Changelog
## Unreleased
- Initial ScreenCraft local-first design concept and roadmap.
- Adopted applicable Application-Standard v1.0 documentation, governance, QA, design, integration and Ubuntu proxy guidance.
- Added ScreenCraft-specific architecture, security, test and development evidence policies.
No runnable ScreenCraft application has been released.

## 0.1.0 prototype — implementation proposed for main (2026-11-12)
- Flask API and PostgreSQL-capable SQLAlchemy schema, user/project roles, session/project-shared mock prototype data and Alembic migration.
- React/TypeScript HTML5 visual designer: multi-screen projects, gallery, drag/drop, resize, canvas, object properties, responsive/overflow controls, light/dark themes and visual prototype actions.
- Portable .scraft ZIP packages with image assets, safe validation, import/export and a central specification link to Application-Standard.
- Standalone offline interactive HTML application export with embedded images, navigation and mock-data table interactions.
- Optional restricted GitHub design import/PR storage under other application repos.
- Docker/Caddy integration examples and user manual; 5-job GitHub CI including Playwright/Flask/Postgres-model/Alembic and container smoke tests.
- Not deployed or user-accepted. Pending live Ubuntu/PostgreSQL/Caddy validation and remaining roadmap features are tracked in DEVELOPMENT.md.

## Unreleased — prefix API response diagnostics
- Handle HTML proxy/upstream/API fallback responses with explicit endpoint, HTTP code and Content-Type in ScreenCraft instead of `Unexpected token '<'`.
- Return JSON 404/405 for unknown API routes and unsupported API methods.
- Add regression tests for prefixed bootstrap/project creation and HTML error handling.
- Production cause pending actual request/status evidence from Ubuntu; no remote deployment performed by this change.

- Corrected PostgreSQL project creation: flush the new project row before creating the foreign-key dependent owner membership, atomically within one transaction. Enabled SQLite foreign-key enforcement in test DB connections and added regression coverage. Confirmed independent Desktop investigation excluded Caddy as the cause.

- Added a direct Table sample-data editor with editable column names, sample cell values and add/remove rows and columns. New table objects now have visible default sample data; existing unbound tables offer explicit dataset creation. Kept button action JSON separate from the table data editor.

- Added an editable screen name field in the inspector and distinct default names for new screens. Renaming preserves screen IDs and existing navigation links.

- Added opt-in UDA single sign-on to reuse the reverse-proxy authenticated identity without a second ScreenCraft password. Preserves accounts/projects by matching the existing username, creates least-privilege accounts for new UDA users and disables local credential endpoints in UDA mode. Deployment requires verified UDA identity forwarding plus protected proxy secret; live integration is pending.

## Phase 5 — Canonical catalogue and nested objects
- Canonical 39-object gallery with supported widgets and explicit unsupported placeholders.
- Nested containers/cards, flex/grid/toolbars, parent selection and reusable component templates.
- Screen reorder controls and right Properties panel delete action for every object.
- New application templates no longer include Get started; existing demo buttons are deletable.
- Preview Back/Home buttons and screen-order-aware standalone export.
- Browser and package regression tests for deletion, nesting, ordering and unknown object preservation.

- Added a per-screen Delete control to the Screens list beside reorder arrows. It confirms deletion, protects the last screen, updates the entry screen, clears dangling navigation references and supports Undo before Save.

## Phase 6 — SCRAFT validation and import compatibility
- Added reference/manifest/dataset/node/action/asset integrity checks and safer ZIP/JSON handling.
- Resolves local ZIP JSON references and preserves compatible v1 minor metadata without silent version downgrades; rejects unsupported major formats and remote references.
- Added a read-only /api/scraft/inspect endpoint and a two-step browser import workflow with visible compatibility warnings and user approval.
- Added conformance and browser regression tests covering round trips, safety failures and failed imports without project mutation.

- Fixed Interactive HTML export to honour button Add Row field bindings from text, number, date, select, checkbox and textarea controls. Bound values override fixed defaults; controls retain their values after the table rerenders.
- Added AGENTS.md mandatory parity rule: whenever Preview or editor functionality changes, update and browser-test exported interactive HTML in the same change.

## Phase 9A — Advanced tables and editable grids
- Activated canonical x-editable-grid as a functional mock-data control, with auto-created sample datasets and inline Preview row editing, insertion, deletion and selection.
- Added table and grid search, sortable headers, fixed column filtering and configurable pagination in the Properties inspector.
- Mirrored the data controls in fully self-contained offline HTML export; mock writes never target production SQL.
- Added browser tests for editor Preview and generated HTML parity including sorted/index-stable row deletion.

## Phase 9B — Charts and KPIs
- Activated canonical x-chart object with SVG bar, line and pie charts, dataset grouping and numeric/count aggregation.
- Enhanced x-kpi with dataset-linked count, sum, average, min and max, while preserving existing static-value designs.
- Added right-side metric properties and standalone offline HTML equivalents with real browser tests.

## Phase 9C — Interactive navigation and layout objects
- Added functional tabs and wizard step switching, configurable captions and per-child step assignment.
- Enabled accordion expand/collapse, sidebar layout and percentage-based splitter containers.
- Implemented equivalent behaviour in standalone offline HTML with real browser tests.

## Phase 9D — Form input validation
- Added required, text-length, number/date ranges and dropdown choice properties for inputs in the right-hand inspector.
- Add Row buttons validate bound inputs before writing mock records, with a visible user message and no partial insert on failure.
- Mirrored form validation in standalone HTML export and added Preview and real generated HTML browser tests.

## Phase 9.1 — Collapsible containers and shared navigation
- Added declarative `toggle_container`, `collapse_container` and `expand_container` button actions, plus optional collapsible headers and saved initial state on nested containers.
- Added a single shared application navigation definition with global inspector editing, active screen links, nested menu groups, left/right/top placement, mobile collapse and per-screen opt-out.
- Added SCRAFT reference/cycle validation, screen deletion menu cleanup and matching offline Interactive HTML controls, verified by browser and backend conformance tests.
