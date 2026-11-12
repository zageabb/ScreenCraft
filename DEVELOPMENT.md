# ScreenCraft development register
**Status 2026-11-12:** Phases 1–4 initial implementation exists on feature branch, with backend/unit and React build checks. Not deployed or manually user-accepted.
**Evidence rule:** Track implementation, local validation, CI, merge, deployment and user acceptance separately. Never mark documentation-only work as runtime complete.

| ID | Workstream | Status | First acceptance |
|---|---|---|---|
| SC-001 | Standards/governance/CI | TESTED | Files present, CI green, review |
| SC-002 | Canonical JSON schema | IMPLEMENTED_UNVERIFIED | Versioned round trip tests |
| SC-003 | Flask storage/project/asset API | TESTED | Secure create/save/open/reopen |
| SC-004 | Visual editor | IMPLEMENTED_UNVERIFIED | Layers, selection, move/resize, undo |
| SC-005 | Components and themes | IMPLEMENTED_UNVERIFIED | Instances, overrides, design tokens |
| SC-006 | Desktop/mobile responsive preview | IMPLEMENTED_UNVERIFIED | 1440/1280/1024/768/390 + 200% zoom |
| SC-007 | Figma API/JSON adapter | PLANNED | Approved fixture import and warnings |
| SC-008 | Native .fig parser feasibility | PLANNED | Licence/security/fidelity go-no-go |
| SC-009 | SVG/images/assets | PLANNED | Sanitised import/provenance |
| SC-010 | Interactive HTML prototype export (static/Jinja later) | TESTED | Generated output renders |
| SC-011 | React export | PLANNED | Generated components compile |
| SC-012 | Optional GitHub sync | PLANNED | Secure PR/diff/versioning |
| SC-013 | Accessibility/security/performance | IN_PROGRESS | Automated + manual evidence |
| SC-014 | User manual/release/deployment | IN_PROGRESS | Fresh clone + root/prefix tests |

## Standards adoption
- Source: zageabb/Application-Standard, proposed v1.0 baseline; profile P6 design tooling with P3 editor characteristics.
- Copied master standard, reusable screen/proxy/integration/reuse guidance, QA and templates.
- Adaptation: Flask plus JavaScript allowed; Figma optional; no private corporate screenshots or official brand token claims.
- Review and CI evidence pending on this branch. Documentation checks alone do not demonstrate a working editor.
- User manual: docs/USER_MANUAL.md records not yet released; update in every future user-visible feature change.
- Source discussion and feature details: docs/INITIAL_IDEA.md.

## Interactive prototype extension — 2026-11-12 (proposal)
See [docs/INTERACTIVE_PROTOTYPE_PROPOSAL.md](docs/INTERACTIVE_PROTOTYPE_PROPOSAL.md) for requirements, acceptance criteria and phased delivery.
- SC-002: portable versioned application document schema; .scraft ZIP with PNG/SVG/JPEG and editable screen/component trees.
- SC-003: PostgreSQL-backed multi-user project and prototype mock-data API; SQLite only as optional single-user development mode.
- SC-004: evaluate React/TypeScript + native HTML5 DOM renderer and drag/drop library for full editing/preview parity.
- SC-005: configurable object gallery and functional native HTML controls.
- SC-006: viewport/content distinction, nested scroll, resizable layout and responsive breakpoints.
- SC-010: **single self-contained interactive HTML application** with screen navigation, dropdowns, modal actions, table Add Record and offline in-memory mock data.
- SC-014: Ubuntu 24.04 and Caddy /apps/screencraft/ **from first running milestone**, with direct-root and prefixed smoke tests.
- SC-015: Prototype-only declarative interaction engine — PLANNED.
- SC-016: Application-wide, independently editable light/dark theme and component tokens — PLANNED.
- SC-017: Multi-user ACL and SQL-backed prototype data sessions, isolated/shared modes — PLANNED.
- SC-018: Single .scraft ZIP application document with integrated asset bundling and unpacked Git-friendly export — PLANNED.
All items remain proposals, not implemented or tested.

## Phases 1–4 implementation evidence (2026-11-12)

**Branch:** `feat/phases-1-4-foundation-and-prototyping` — [PR #3](https://github.com/zageabb/ScreenCraft/pull/3), opened as draft for review. **No server deployment or user-acceptance claim.**

| Phase | What exists in code | Validation / acceptance status |
|---|---|---|
| 1 — Foundation | Flask API, SQLAlchemy/PostgreSQL-capable user/project/ACL/mock data schema, secure first-user bootstrap, .scraft ZIP parsing/packing, image API, Docker/Caddy examples | Backend pytest passed in CI. Root route and Caddy live deployment NOT validated; Alembic baseline committed; PostgreSQL migration/rollback execution on Ubuntu outstanding |
| 2 — Editor | React + TypeScript, HTML5 DOM object gallery, drag placement, pointer movement/resizing, layers, properties, themes, configurable viewport and overflow | TypeScript compile + Vite production build passed. Browser interaction, responsive and accessibility manual acceptance PENDING |
| 3 — Prototype & multi-user | Mock action navigation/alerts/table Add Row, PostgreSQL session/shared dataset APIs, account provisioning, memberships, optional GitHub design read/import/PR save-back with repo allowlist | SQL/API unit tests passed; concurrent browser sessions and GitHub external API behaviour NOT tested live |
| 4 — Standalone HTML | One-file offline HTML with embedded CSS/JSON/images, native input/dropdown, navigation, table mock-data actions | Python exporter unit tests passed; independent visual/browser cross-platform acceptance PENDING |

**CI evidence:** GitHub Actions `ScreenCraft checks`, successful push workflow [run 43247265597](https://github.com/zageabb/ScreenCraft/actions/runs/43247265597) for SHA `fd244f464fe506aaab96b1fbe2caf0280b1b4b43`. This ran docs, Python and React jobs; earlier image/JS failures were corrected. Later merge-from-main commit `8afd73d69168413938eb96e5534ff44bcd3a8b57` requires its own check. CI does not replace manual testing or live reverse-proxy verification.

### Additional scope tracking
- **SC-015** declarative visual interactions — IN_PROGRESS; prototype nav, modal, message, Add Row implemented, extended designer controls/browser verification pending.
- **SC-016** application themes — IN_PROGRESS; named tokens and light/dark preview present, complete token management/variant editor pending.
- **SC-017** multi-user collaboration and SQL mock data — IN_PROGRESS; project roles and database-backed sessions/shared data present, concurrent E2E and live coediting remain pending.
- **SC-018** .scraft ZIP + image packaging — TESTED at archive/API unit level; complete fidelity/asset viewer and full-format conformance suite pending.
- **SC-019** GitHub-linked per-application design — IN_PROGRESS; allowlisted repository import and PR endpoints/UI implemented, requires real GitHub integration test and authorization review.

### Outstanding issues / gates before deployment or release
1. Verify Alembic revision 0001_initial on PostgreSQL 17 with upgrade/rollback and backup restore; test-only `create_all` remains opt-in.
2. Complete manual browser acceptance for drag/resize, nested containers, scrolling, mock data, themes, mobile layouts, zoom and screen-reader/keyboard interactions. Nested component editing is not complete.
3. Conduct an actual Caddy/UDA `/apps/screencraft/` smoke test and verify routed assets/APIs, cookies, auth, login/logout and CSRF, without changing the live server from this chat.
4. Verify real GitHub repository permissions, rate limits, PR creation, conflict handling and absence of credential leakage.
5. Add integration/E2E tests for multiple concurrent users and shared data; review the first-admin provisioning procedure.
6. Add archive package conformance fixtures, stricter image decoding/dimension checks, JSON depth/size bounds and trusted repository import limits.
7. Establish offline/standalone browser tests and compare preview to exported HTML; test binary asset fidelity and responsive overflow.
8. Pin dependency lockfiles and perform dependency/security/licence checks. A fresh-clone Docker build on Ubuntu and a backup/restore test are pending.

**Merge policy:** only merge implementation after relevant green CI and review of outstanding blockers. Completing initial code is not equivalent to release acceptance.

## Browser regression test expansion — 2026-11-12
- Added Playwright Chromium smoke tests for object palette insertion, theme switching, screen navigation and mock Add Record.
- CI now includes a `browser` job with a Vite test server and intercepted synthetic API fixtures. This is editor behavioural verification, **not** a complete real-backend/browser integration test.
- Added initial Alembic upgrade/downgrade test and Caddy forwarded-prefix/cookie-scope test.
- New acceptance gate: Playwright browser job green; verify errors and correct before marking these browser behaviours tested. Real Ubuntu/Caddy remains manual acceptance pending.

## Concurrency and GitHub privilege refinement
- Project writes now use a single conditional SQL update against the expected revision, avoiding silent lost updates from concurrent saves.
- Shared mock-data writes now require a matching dataset revision and use row locking where the SQL backend supports it; editor preview tracks returned revisions.
- The shared server-side GitHub token is accessible only to the ScreenCraft server administrator. Per-user OAuth/delegated permissions remain future work; this must be assessed before enabling non-admin repository access.
- Added regression tests for shared-dataset optimistic locking and GitHub admin-only access. New CI run pending; earlier passing CI remains recorded above, not assumed to cover the latest changes.

## Phase 1–4 final CI evidence — 2026-11-12
- **Verified commit:** `8b43aa450c5c828d0b054c8a8ed415a3e96c1d44`.
- **Successful GitHub Actions workflow:** [run 43249859736](https://github.com/zageabb/ScreenCraft/actions/runs/43249859736). All five jobs succeeded: docs, Python backend tests, React/TypeScript production build, Playwright Chromium browser tests (3), and Docker build/runtime smoke test.
- **Docker CI:** built production multi-stage image, applied Alembic initial migration to isolated SQLite, started Gunicorn/Flask, and received API health success. This establishes build/start viability, **not** live Ubuntu/Caddy/PostgreSQL acceptance.
- **Security checks:** concurrent project saves use atomic SQL conditional revision; project-shared dataset writes require a matching revision and use row locking; server GitHub credentials restricted to ScreenCraft administrator and allowlisted repos.
- **Manual acceptance still pending:** live PostgreSQL migration/restore; Ubuntu Caddy /apps/screencraft/ route; authentication across actual UDA session and cookie path; actual GitHub repo PR round trip; browser accessibility/200% zoom and design fidelity; multi-user concurrent end-to-end test; Figma import is a later phase.
- **Merge policy:** code may enter main as a documented prototype when CI green, but do not tag it production-ready or claim deployment. A release acceptance checklist remains open in docs/ACCEPTANCE.md.

## Ubuntu manual acceptance: project creation returned HTML, 2026-11-12
- User confirmed ScreenCraft renders through `/apps/screencraft/` and first administrator login succeeded.
- On Applications screen, UI displayed `SyntaxError: Unexpected token '<', '<!doctype ...' is not valid JSON`. This means **an API fetch received an HTML response**, but the screenshot does not establish which URL, HTTP status or upstream service returned it. Root cause NOT yet confirmed; do not mark resolved from static review alone.
- Fix branch `fix/caddy-api-html-response-diagnostics`: frontend checks response Content-Type and reports request method/path, HTTP status, MIME type and redirect path (without printing response contents); Flask returns JSON for missing/method-invalid `/api/*` routes.
- New tests: Caddy-style prefix bootstrap and project creation; JSON errors; Playwright HTML/proxy-response diagnostics.
- Manual acceptance after deployment: reproduce Create application, record exact displayed API path/status, inspect browser Network request and Caddy/upstream logs, confirm new project opens and reloads. Never send passwords, setup keys, session cookies or authentication headers into an issue or chat.
- If the diagnostic shows `/api/projects` with HTML, inspect Caddy route priority and whether `handle_path /apps/screencraft/*` is reached before catch-all SPA/site routes. If upstream returns HTML for an internal error, use logs to locate the exception; do not assume a proxy rewrite is the cause.

### Root cause confirmed by Ubuntu/Desktop investigation
PostgreSQL rejected the new owner membership because the parent project had not been flushed/inserted first. SQLAlchemy `create_project()` previously queued both objects without a relationship dependency and committed them together. The database generated an HTTP 500 HTML page; the frontend parsed that as JSON. **Caddy routing was not the cause.**
Fix: explicitly `db.flush()` after adding the project and before adding its owner membership, within the same transaction (failure rolls back both). Enable `PRAGMA foreign_keys=ON` for SQLite test engines; add FK violation assertion and verify project/owner membership join. Other API/HTML diagnostics remain useful but are not the primary fix. Live PostgreSQL confirmation after deployment is still pending.

## Ubuntu acceptance — Table prototype data editor (2026-11-12)
- User confirmed application creation, visual drag/resize, button navigation, saving and .scraft operations work through Ubuntu/Caddy.
- Found gap: table instances had no direct inspector for mock datasets and new tables could be blank/invisible because no dataset was assigned. Button-action Sample row (JSON) was not an editable table dataset.
- New feature branch `fix/editable-table-sample-data`: new tables create an independent seed-reset dataset containing visible example columns and a record; Table Properties now has its own sample-data editor for columns/rows, including adding/removing rows and columns, changing values, and selecting existing datasets. Existing unbound table nodes show a visible placeholder with a Create sample dataset action.
- Acceptance: add table, see sample row, edit it through inspector, add row, save and confirm the dataset appears in JSON/.scraft; recover old unbound table. Test in Chromium and CI before merging. Live Ubuntu retest remains separate.

## Ubuntu acceptance improvement — editable screen names (2026-11-12)
- User confirmed table sample-data editor is functioning on Ubuntu.
- New screen names were fixed to `New Screen`, making multiple screens indistinguishable.
- Added a screen-name input in the inspector, committing on blur/Enter. Screen IDs are preserved so existing button navigation and other references remain valid. Empty names are rejected and restored; Escape cancels the rename.
- New screens use distinct initial names (`New Screen`, `New Screen 2`, etc.). Browser tests validate rename and saved JSON, stable navigation IDs and distinct default names. Live Ubuntu acceptance after deploy is pending.

## Authentication enhancement — UDA sign-on (2026-11-12)
- User requested use of the existing UDA login rather than building a second ScreenCraft password-reset flow.
- Added opt-in `SCREENCRAFT_AUTH_MODE=uda` with authenticated reverse-proxy identity and server-only assertion. In UDA mode every API request requires trusted headers; local login and bootstrap are disabled. Username matching retains existing owner/admin identity; new UDA users are non-admin by default. Current project ACL is unchanged.
- Frontend detects the auth mode and suppresses the ScreenCraft login/password form for UDA sessions. Local mode remains available for non-UDA installations and rollback.
- Security design and Caddy handoff documented in docs/UDA_AUTHENTICATION.md. **The actual UDA username header or verified identity placeholder is not documented in Application-Standard and must be confirmed by Desktop from the live UDA configuration before enabling**. Never forward user-supplied identity headers.
- Validation: Python trust-boundary and legacy-account-preservation tests; React build and browser regression still to verify. No deployment/security assertion until Caddy live identity mapping is tested. Existing server has not been reconfigured in this PR.

### UDA integration merge and validation (2026-11-12)
- PR [#8](https://github.com/zageabb/ScreenCraft/pull/8) merged into main as `9e36ad7dd082b3ba2959b7272014167855d2ef0e`.
- All five GitHub Actions jobs (docs, Python, React, Playwright browser, Docker) passed on PR SHA `cac24984fe88d58c40243ba712859cb4a6987934` (run [43264058633](https://github.com/zageabb/ScreenCraft/actions/runs/43264058633)).
- **Runtime status (updated 2026-11-12):** User confirms UDA SSO is working on the live Ubuntu ScreenCraft deployment. The verified UDA identity contract uses `X-UDA-User` populated from `/auth/check`, with the administrator email matching the existing ScreenCraft account. This confirms the sign-in path works; user has not separately reported evidence for anonymous/forged-header denial, logout/session expiry, role isolation or rollback testing. Keep those as outstanding security acceptance checks.
- No database migration required; do not reset existing users or project ACLs. Rollback: `SCREENCRAFT_AUTH_MODE=local`.

### Live UDA SSO acceptance update (2026-11-12)
- **SSO login — CONFIRMED WORKING by user on Ubuntu**, following configuration by ChatGPT Desktop.
- Identity mapping: UDA provides the verified authenticated email in `X-UDA-User`, matching the existing ScreenCraft administrator username.
- Remaining verification not independently evidenced in this chat: unauthenticated and forged-header rejection through public ingress and direct backend, prior-cookie rejection, role/ownership isolation for another UDA account, sign-out/session expiry, and documented local-mode rollback.
- No additional application code or live server changes were made for this status update.

## Phase 5 — Canonical objects, nesting and screen management (2026-11-12)

**Approved scope:** Complete Phase 5 in one pass, including screen reorder and per-object delete on the right. The Get started demo button and preview navigation are also corrected.

**Canonical source:** Application-Standard/standards/SCRAFT_FILE_FORMAT_v1.md plus standards/screencraft/object-catalogue.json. ScreenCraft uses a generated pinned snapshot of source blob SHA e7c91d3325988cfa07e39171b713dc919344e813; scripts/sync_scraft_catalogue.py refreshes the derived snapshot. No competing master object standard.

**Features:** Grouped 39-type catalogue palette with unsupported placeholders; nested container/card/grid/flex/toolbar canvas and parent controls; reusable subtree templates; screen move up/down without changing stable IDs; delete selected object in right-side Properties (or at the right edge of Layers), including descendants; empty new Home screen instead of unrequested Get started; Preview Back and Home controls; standalone export using screen order and nested structure; initial support for x-card/x-grid/x-flex/x-toolbar/x-date/x-number/x-textarea/x-kpi. Legacy demo buttons remain ordinary editable/deletable objects. Unsupported extensions remain visible/inert and survive save/export.

**Evidence:** Browser tests cover screen ordering, deletion, nested objects, reusable components, preview recovery and unknown extension preservation. Backend tests cover default blank screen and SCRAFT v1 nested round-trip. React, Python, Docker, browser and documentation jobs must pass before merge.

**Not claimed:** All 39 types are fully interactive; full pixel-perfect preview/export parity, accessibility, production data, Figma import and live Ubuntu manual acceptance are separate gates. Live UDA SSO remains configured independently.

### Phase 5 merge verification — 2026-11-12
- **Merged:** PR #9 (https://github.com/zageabb/ScreenCraft/pull/9), squash commit `2869d68defeb4959618c8660eba9f81e9c9b7730`.
- **CI green on final feature head** `18575e62e55c1955b1ad78a7f094ea2ee9598142`, workflow run https://github.com/zageabb/ScreenCraft/actions/runs/43269997302: Python, React/TypeScript build, Playwright Chromium browser tests, Docker/container and docs all passed.
- **Implementation acceptance:** Phase 5 available on GitHub main, including the editable/deletable legacy Get started button, blank new-project starter, screen order and Preview Back/Home. **Live Ubuntu deployment and manual feature acceptance remain pending**. No server changes performed in this chat.
- **Limitations:** Not all 39 catalogue types are functional. Inert unsupported objects round-trip with warnings, and extended object fidelity/mobile/accessibility require future work. FigmaBridge integration remains a separate phase.

## Screen deletion (Phase 5 follow-up, 2026-11-12)
- Added an explicit **Delete screen ×** button to the right of each screen's up/down reorder controls in the left Screens list.
- Deletion requires confirmation; deleting the final remaining screen is disabled, and the entire operation can be undone before Save.
- The deleted screen and its nodes are removed from screen_order and screens. If it was the start screen, the first remaining ordered screen becomes start_screen. Incoming navigate actions to the removed screen are cleared to preserve .scraft reference validity. Active screen, selected node, modal state and preview Back history are adjusted.
- Browser acceptance covers delete/save, navigation cleanup, entry screen reassignment, Undo, confirmation dismissal and last-screen protection. Automated CI and manual Ubuntu acceptance are tracked separately.

## Phase 6 — SCRAFT v1 validation and compatibility (2026-11-12)

**Canonical contract:** zageabb/Application-Standard/standards/SCRAFT_FILE_FORMAT_v1.md (version 1.0.0) and its centralized object catalogue. No second normative standard is created in ScreenCraft.

**Implemented:** A dedicated backend conformance validator for semantic references and security-sensitive fields, ZIP JSON reference resolution restricted to the local archive, duplicate-key rejection, JSON nesting depth limit, SCRAFT v1 version handling and explicit compatibility warnings for non-rendered extensions and future v1 minor fields. Checks cover screen IDs/order/start screen, viewport, node hierarchy, safe action types/targets, dataset/column IDs, seed record limit, declared image MIME and optional SHA-256 integrity, and dangerous provenance URLs. Unsupported major versions or invalid references are rejected, never partially imported.

**Import workflow:** Authenticated read-only POST /api/scraft/inspect returns a summary and compatibility warnings **without replacing or altering the stored project**. The browser shows the warnings and requests explicit user action before /api/projects/:id/upload. Invalid files have no confirmation action. Upload normalizes local ZIP references into self-contained application JSON and keeps unknown safe metadata in the model. Existing revision locking and project role permissions remain active; the API returns warnings from the successful import.

**Tests:** Two-screen responsive design with nested/extension types, images, synthetic datasets and navigation; invalid IDs/references/actions/asset checksums, unsupported major and forward v1 minor versions, local JSON refs including cyclic/remote rejection, JSON depth/duplicate keys, API read-only inspection and failed import preserving the current project, plus browser warning and approval flow.

**Known limitations:** This phase does not claim formal external certification or full rendering of every catalogue extension. Uploaded image decoding/dimension inspection and complete content provenance scanning need additional hardening; the accepted file types/byte limits and signature checks remain in force. Self-contained zip ref expansion on import is supported; unknown extra unreferenced JSON entries are not preserved on re-pack. No DB schema or UDA/Caddy changes. Live Ubuntu manual acceptance remains separate from CI.

### Phase 6 merge and automated acceptance (2026-11-12)
- **Merged:** PR #11 (https://github.com/zageabb/ScreenCraft/pull/11), squash commit `9636464fe3bea298f81a54fb0dd014af8b002ac0`.
- **All five CI jobs passed** for final branch SHA `534f7490612737b8a6d95186eea100f7162469be` in workflow https://github.com/zageabb/ScreenCraft/actions/runs/43277489317 (Python, React, browser/Playwright, Docker, documentation).
- **Deployment status:** Included in GitHub main; live Ubuntu Caddy/UDA deployment and real-file import acceptance are not yet verified. No database migration required.
- **Follow-up hardening:** Real image decoding/dimension enforcement, expanded component capability checks, audit log of imports, and retaining unrelated extra JSON ZIP entries are not yet complete. These do not block the tested SCRAFT-1 validation/import workflow, but they are not claimed as finished.
