# ScreenCraft — Interactive Application Prototyping Proposal v1.1
**Date:** 2026-11-12  
**Status:** APPROVED DIRECTION / INITIAL IMPLEMENTATION ON FEATURE BRANCH (not user accepted)  
**Supersedes:** None. This extends docs/INITIAL_IDEA.md without rewriting its historical record.

## Product boundary
ScreenCraft is a local-first browser-based multi-screen application designer and interactive UI prototyper, with reusable components, configurable visual actions, responsive layouts, optional Figma imports and export to a single interactive HTML application. It does **not** implement production business workflows, database connectors or permissions in generated prototypes.

## Stack recommendation
- React + TypeScript + native HTML5/CSS for editor, DOM preview and visual property inspector. Evaluate dnd-kit for nested sortable placement; specialist canvas/drag/resize libraries must pass compatibility and licence review. CSS Grid/Flex for responsive containers; absolute positioning allowed within freeform canvas regions.
- Python Flask API for users, projects, secure file IO, import/export, data sessions and authentication.
- SQLAlchemy/Alembic for persistent relational storage, **PostgreSQL as primary Ubuntu multi-user backend**; SQLite optionally for single-user development/tests. Do not hard-code vendor-specific queries into component model.
- No live collaboration in MVP. Server-side project permissions, optimistic versioning and edit-lock leases first; evaluate WebSockets/Yjs for simultaneous coediting later.
- Native design model is framework-neutral; React library details stay out of portable file schema.

## 1. Layout, sizing and scrolling
Distinguish canvas viewport size from actual document content dimensions. Each screen and nested container supports sizing modes (fixed, fill, hug, min/max); overflow (visible, clip, auto, scroll); horizontal/vertical scroll direction; and layout (flex, grid, freeform).
- A 1280x800 screen can include forms taller than viewport and tables wider than viewport. Preview must use native accessible scrollbars.
- Tables have configurable max height, sticky headers where appropriate, column width, row count, and horizontal/vertical scroll.
- Rendered preview and exported HTML must have identical overflow rules.
- Design mode can pan/zoom outer canvas independently of inner scrollable elements; provide explicit scroll tool.
- Check at 1440/1280/1024/768/390 CSS px and 200% zoom.

## 2. Object gallery and visual interactions
Initial palette: text, buttons, links, dropdown/select, checkboxes, inputs, date, cards, tab bar, nav menu, modal, accordion, scroll container, image, table, form layout and standard application shell. Charts can follow after foundation.
For each instance: stable ID, type, properties, states, binding to mock data, visual style/theme tokens, responsive constraints, accessibility metadata and prototype actions. Properties and components are validated against versioned schemas.
Support nonproduction declarative actions only: navigate screen, back, open/close modal, set field, toggle visibility, switch tab, filter/sort table, add/edit/delete **mock** table row, show temporary message. Preview implements genuine HTML input/dropdown/button behaviour and an interaction log; no arbitrary script execution or external HTTP in portable docs.

## 3. Drag and edit modes
- Design mode: drag from palette, move/resize, nest, reorder, multi-select, align/snap, group/ungroup, lock, keyboard nudge and undo/redo.
- Preview mode: controls behave like real controls; editing handles disabled.
- Separate the source JSON model, editing command/history layer, and shared DOM renderer, so Preview and exported HTML match.

## 4. Single `.scraft` document (ZIP package)
Treat `.scraft` as one portable versioned ZIP archive, never as a raw executable project.
Example contents:
```
myapp.scraft
  manifest.json          # format_version, project_id, title, revisions, checksums
  application.json       # routes, screens index, component registry, interactions
  screens/*.json         # editable semantic trees and responsive rules
  themes/*.json          # tokens, modes, component variants
  mock-data/*.json       # sanitized seed/example datasets and table schemas ONLY
  assets/<hash>.<ext>    # approved PNG/JPEG/SVG and other supported images/icons
```
Manifest pins a schema version and allowed assets. Support atomic save/reopen, validation, migrations, deterministic unpacked Git-friendly export, checksum verification, asset deduplication and ZIP bomb/path traversal/symlink protection. Imported PNGs are first-class referenced assets and must remain bundled. Do not include passwords, database credentials, personal/corporate datasets or server SQL content in archives.

## 5. SQL-backed prototype data and collaboration
Retain a fast in-browser preview state for interaction and offline rendering, but permit server-backed persistence of **mock prototype data** in SQL when authenticated multi-user access is available.
- Server PostgreSQL holds users, projects, roles, revisions, asset inventory, prototype dataset definitions, row data and preview-session metadata; SQL store can be JSONB-based and need not create physical SQL tables for each visual table.
- Visual tables bind to declared dataset IDs and column schemas. Mock add/edit/delete operations call a validated service API; no arbitrary SQL from the document.
- Dataset mode: `seed-reset` (default, isolated per preview run), `session-persisted` (per user/session), or `project-shared` (explicitly opted-in and permission-guarded). Show mode prominently. Reset/restore sample data and protect shared edits with transactions and revision checks.
- Distinguish `design data` (safe sample rows packaged in scraft) from `runtime data` (server sessions/rows), excluded from .scraft by default. Users may explicitly export a sanitized sample snapshot; never silently publish shared records.
- Multi-user roles: Owner/Admin, Designer, Viewer, with project-level ACL, audited writes and safe defaults. A deployed app can have multiple concurrent users without live coediting; live presence/cursors are later-stage.
- Offline preview gracefully falls back to seed data. No mandatory network service to open/design a .scraft file.

## 6. Single-file interactive HTML application export (explicitly requested)
One self-contained .html file containing the screens, responsive CSS, allowed inline assets, mock seed data and **restricted declarative interaction runtime**. It opens in a browser without server/React build or ScreenCraft installation.
- Buttons navigate screens, modal/dialogs open, dropdowns operate, filters work and Add Record inserts in-memory mock rows.
- Save state within the page session; optional localStorage behind explicit opt-in and privacy warning, never SQL/real server access in standalone export.
- Strictly escape imported text and sanitize images/SVG; no credentials, project ACLs, authenticated actions or arbitrary untrusted scripts embedded. Note CSP constraints for self-contained assets/code.
- Test navigation, data actions, browser refresh behaviour, table overflow, themes and responsive layout. Label output **interactive prototype—not a production application**.
- Keep static HTML/CSS, Flask/Jinja and React export targets as separate later outputs.

## 7. Ubuntu + Caddy reverse proxy — mandatory from first running build
**Deployment target:** Ubuntu Server 24.04, Caddy published under `/apps/screencraft/`. This is a release requirement from MVP, not a deferred nice-to-have.
- Flask backend bound to loopback or private Docker network; Caddy handles HTTPS and ingress authentication as deployed. App independently enforces authenticated project/user permissions.
- Configure external base path and Flask url generation with controlled X-Forwarded-Prefix and narrowly scoped ProxyFix trust. Never blindly trust client-supplied forwarded headers.
- SPA client routing, history fallback, APIs, static assets, redirects, cookie paths, CSRF, uploads/downloads, WebSocket upgrades (if added), health endpoints and SSE must work under prefix.
- Unique session cookie, HTTPS Secure/HttpOnly/SameSite, secrets via server env; backups for DB and project assets, migrations and rollback. Avoid sharing unscoped cookies across other /apps/* apps.
- Test local root `/` and Caddy `/apps/screencraft/` from the first runnable milestone, with automated smoke tests and user-manual setup. Store sample Caddy and Compose/systemd configuration in deploy/ without secrets.
- Tag genuinely local prefix work `LOCAL_UBUNTU_PROXY_COMPAT`. Access/network exposure changes require explicit approval.

## Build milestones and success criteria
**M1:** React/Flask/PostgreSQL skeleton, login/project roles, root+prefix test, initial JSON schema, .scraft create/save/reopen, PNG asset.
**M2:** drag/drop editor, object palette, properties, scrollable table/form, responsive preview, light/dark themes.
**M3:** prototype declarative actions, SQL-backed mock datasets with session isolation, Add Record and cross-screen navigation.
**M4:** standalone single HTML interactive export passing offline tests.
**M5:** Figma JSON import with fidelity warnings; advanced components, versioning, GitHub sync and optional real-time collaboration.

## Explicit exclusions
No production SQL query designer or application data entry backend; no arbitrary JavaScript on button actions; no user-provided SQL execution; no requirement for Figma to start; no guaranteed native .fig decoding; no simultaneous CRDT collaboration as a v1 prerequisite.

## Related workstreams
SC-002 schema/.scraft; SC-003 Flask+SQL storage; SC-004 React visual editing; SC-005 gallery; SC-006 scroll/responsive; SC-009 images/assets; SC-010 interactive HTML; SC-013 roles/security; SC-014 Caddy/deploy; SC-015 visual interactions; SC-016 themes; SC-017 multi-user SQL/project access; SC-018 portable .scraft packaging.
