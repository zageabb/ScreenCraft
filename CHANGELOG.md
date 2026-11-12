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
