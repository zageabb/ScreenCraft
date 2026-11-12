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

## Interactive HTML export parity — field-to-table bindings (2026-11-12)
- Added a permanent AGENTS.md requirement that every Preview/editor feature change must update the standalone interactive HTML exporter in the same PR. Working Preview alone is not sufficient for feature acceptance.
- Fixed the exported offline HTML action engine to honour `add_mock_row.field_bindings` and current input values. Supported source types: text input, number, date, dropdown, checkbox, and textarea; static `action.values` remain defaults, with explicitly bound fields overriding them.
- The exporter now maintains in-memory input state across table rerenders so controls do not reset after adding records. These changes are prototype-local only and make no production or network requests.
- Added Playwright regression tests that generate a real HTML document with the Python exporter, load it in Chromium, enter values, add two rows, verify mapped columns and state persistence, and verify no network requests.
- Relevant checks: Python, React, browser, docs and Docker CI. Live Ubuntu/desktop user acceptance remains separate.

## Phase 9A — Tables and editable data grids (2026-11-12)

**Scope approved:** Begin advanced object functionality with tables and grids, independent of FigmaBridge. Canonical object IDs remain `table` and `x-editable-grid` from Application-Standard; `x-grid` is a separate **layout** object, not an editable data table.

**Implementation:** Shared React DataGrid supports opt-in search, numeric/text sorting, column filtering, row selection and bounded page size. `x-editable-grid` is now an active prototype object with inline cell editing and preview-local insert/delete; new tables and editable grids provision isolated sample datasets. Right-side Properties configure dataset, searchable/sortable/selectable, filter column/value and page size. Existing TableDataEditor continues to define columns and saved seed records in .scraft.

**Data semantics:** Grid mutations in ScreenCraft Preview are enabled for `seed-reset` mock datasets only. For server-persisted/shared datasets, the grid explicitly displays a limitation rather than incorrectly mutating other users' records. This phase does not introduce production SQL editing or grant extra permissions.

**Mandatory export parity:** Standalone one-file HTML implements the same search, sorting, filtering, pagination, selection, inline editing and preview-local row addition/deletion in browser memory; no network requests, dependencies or backend SQL. Exported grid changes do not modify server data. Field-to-table Add Row button bindings remain compatible.

**Acceptance:** Existing editable table inspector tests; additional Playwright editor Preview and generated-offline-HTML browser tests for grid insert/edit/delete, query/filter/sort, pagination and stable source row selection. Python/React/docs/Docker checks as applicable. Manual Ubuntu runtime verification remains independent of CI.

**Deferred:** True shared/session dataset inline write API, rich cell types/validation, bulk edit, column drag-reorder, server-side filtering/sorting, and advanced layout grid responsive column sizing. FigmaBridge remains deferred.

### Phase 9A merge and automated acceptance (2026-11-12)
- **Merged:** PR #14 https://github.com/zageabb/ScreenCraft/pull/14, squash commit `461975c4e12cd5e8f93e437e9253c3226a624d1e`.
- **CI:** Python, React, browser Playwright, Docker and documentation all passed on final feature head `72f7f8bc6a78bd7347966571b48b980a5ec01513`, run https://github.com/zageabb/ScreenCraft/actions/runs/43308595277.
- **Ubuntu deployment:** Not performed in this chat. Desktop should pull main and rebuild, then manually confirm grid sample dataset creation, selection/edit/delete/sort/filter, and standalone offline HTML parity.
- **Remaining Phase 9:** Charts and dataset-bound KPIs; expanded layout/navigation; form validation; further production hardening. FigmaBridge/Phase 7 stays deferred.

## Phase 9B — Dataset-bound KPI and charts (2026-11-12)

**Scope:** Continue Phase 9 independently of deferred FigmaBridge. Activate the canonical `x-chart` extension and enhance `x-kpi` without creating a second object standard.

**Capabilities:** KPI cards can display static values or select a dataset and aggregate `count`, `sum`, `average`, `min` and `max` over a field. Charts can group records by a chosen category field and show a bar, line or pie visualization using the same aggregation operations. The right-side Properties inspector exposes dataset, aggregation, value column, chart type and category column. Chart categories are capped at 30, with safe text labels and no external rendering libraries.

**Parity:** React preview and the standalone offline HTML exporter use the same declarative `.scraft` property contract, source datasets and aggregation semantics. They reflect in-memory mock changes from Add Row actions; exported charts are SVG and work without network requests. No production SQL/data writes.

**Testing:** Playwright validates inspector configuration and saved document properties, and separately generates a real offline HTML export to verify KPI values, bar/line/pie SVGs, grouped totals, live mock updates and network independence. CI Python, React, browser, Docker and docs required prior to merge.

**Still pending in Phase 9:** advanced navigation/layout objects and form validation, additional accessibility and responsive layout checks. FigmaBridge phase 7 remains deferred.

## Phase 9.1 — Collapsible containers and shared application navigation (planned, 2026-11-12)

**Scheduling:** A separate follow-on subphase. Phase 9 is already in active development; do not interrupt or replace its implementation. Begin 9.1 after Phase 9 is integrated or in an independent non-conflicting development stream.

**Goal:** Allow a container to own nested screen objects and let a configurable button, optionally the container header, minimise/expand the entire subtree in both Preview and the self-contained interactive HTML export.

**Requirements:**
- Reuse canonical nested container/card/layout objects and stable child IDs; avoid introducing a second incompatible container model.
- Add declarative button actions `toggle_container`, `collapse_container`, and `expand_container`. Configure target container through a right-side Properties dropdown limited to valid containers on the screen; validate missing/cyclic/invalid targets safely.
- Expose initial expanded/collapsed state on the container, and optionally a clickable header/chevron. Collapsed state hides child content while keeping the header/control accessible; distinguish collapse from deleting objects.
- Ensure inputs, tables, charts, field bindings and mock dataset values are retained when a container is collapsed and reopened. Nested containers must work; moving/resizing the parent should retain child relationships.
- Define predictable layout behaviour when collapsed (header-only compact height versus hidden content), as well as sensible keyboard and screen-reader semantics (`aria-expanded`, controls association, focus recovery).
- Preserve the behaviour in .scraft save/reload and make editor Preview and standalone offline HTML export functionally equivalent, as required by AGENTS.md. No external JS dependency.

**Shared application navigation:**
- Provide a single application-level navigation component definition (shared sidebar/menu), editable once and displayed automatically on every configured screen; do not copy menu objects into each screen's editable node tree.
- Support left/right fixed or collapsible sidebars, horizontal navigation, nested/accordion menu items, mobile hamburger/drawer behaviour, and configurable initial state by breakpoint.
- Menu items support existing declarative screen navigation, active-screen indication, labels/icons, ordering and optional visibility by screen. Do not invent production permission enforcement; access control remains application-side.
- Screen designers can opt a screen out of the shared menu (e.g. login/full-screen view), while retaining stable IDs and predictable preview/export parity.
- Expose application-level navigation editing in the designer, including a clear distinction between global menu properties and per-screen content; shared changes propagate immediately to all participating screens.
- Store shared navigation in the canonical .scraft application document with backward-compatible handling of documents without a shared menu; save/reopen and standalone HTML must preserve the same menu structure and interactions.
- Test global edits across multiple screens, screen opt-outs, nested navigation, mobile collapse/restore, active states, invalid/deleted targets, and real offline HTML export behaviour.

**Acceptance:** Browser tests cover button toggle/expand/collapse, nested objects, initial state, persistence, invalid targets, keyboard operation, and reopening with existing user-entered values. Run the same interaction against the **actual generated standalone HTML export**, not just its source. Keep manual and automated verification separate and document deviations.

**Status:** MERGED INTO MAIN via PR #19 (2026-11-12); detailed implementation and acceptance in docs/PHASE_9_1.md. CI green; live Ubuntu deployment/manual acceptance pending.

## Phase 9C — Interactive layout and navigation objects (2026-11-12)

**Goal:** Continue Phase 9 independently of FigmaBridge, using the unchanged Application-Standard object catalogue.

**Implementation:** Activate `x-wizard`, `x-accordion`, `x-sidebar` and `x-splitter`; extend core `tabs`. Tabs and wizards expose a configurable list of up to 10 captions. Nested children can be assigned to a tab/step via `props.tab_index` in the right inspector. In Preview only children assigned to the selected tab/step are rendered; Design keeps all children visible for editing. Wizards offer Previous/Next step controls; accordions have accessible expand/collapse button with default expanded state. Sidebar/splitter are distinct nested layout containers, with a configurable splitter percentage. Children persist through normal `.scraft` hierarchy.

**Export parity:** The one-file offline Interactive HTML exporter reproduces panel state, switching, wizard steps, accordion expansion, and basic sidebar/splitter layout. It does not require network or external UI libraries.

**Tests:** React editor and actual generated HTML Playwright checks cover step switching, content selection, accordion toggling, split dimensions and offline operation; Python/React/Docker/docs CI gates. Deployment/manual Ubuntu testing remains a separate acceptance step.

**Follow-ups:** Responsive sidebar drawer behavior, keyboard-focused tab patterns, production workflow validation and advanced layout resizing are separately tracked; not claimed as production-grade. Form validation remains next.

## Phase 9D — Prototype input validation and data-entry constraints (2026-11-12)

**Scope:** Add declarative input rules to existing canonical `.scraft` input objects and validate before `add_mock_row` actions that bind to those fields. No new action type or competing object standard.

**Implementation:** Right-side Properties allow required inputs (including required checkbox), text/textarea minimum and maximum length, number/date minimum and maximum values, and editable dropdown choices. When a button runs `add_mock_row`, each configured input binding is checked against its source control's current Preview value. If any rule fails the mock record is not inserted; a visible validation message identifies the offending field and constraint. Existing unbound fixed action values remain supported. The standalone offline HTML export enforces the same rules and preserves entered values after a rejected submit.

**Testing:** Playwright Preview and real Python-generated offline HTML browser tests verify required/short/out-of-range rejection and successful insertion after correction. CI React, Python, browser, Docker and docs as usual. Live Ubuntu user acceptance separate.

**Limitations:** This is prototype validation, not production backend enforcement or a generalized submission form object. Cross-field rules, server trust, custom regex and multi-field validation summaries are future design decisions. FigmaBridge remains deferred.

### Phase 9 continuation — merged implementation and acceptance (2026-11-12)

- **Phase 9B charts & KPIs:** PR #15 https://github.com/zageabb/ScreenCraft/pull/15 merged as `b03a1c8bdb12d953649d4ba16e97740c76a610ab`. All five CI checks passed on branch head `8f3d19945821c197c293a6eb47ceeba1d8910666` (run https://github.com/zageabb/ScreenCraft/actions/runs/43310042195).
- **Phase 9C layout/navigation:** PR #17 https://github.com/zageabb/ScreenCraft/pull/17 merged as `b441273eb0411e1148df4cbf543aea0ab50656fc`. All five CI checks passed on reconciled branch head `fe9c36f7ea27484bc4e43f9f4e03875f31d3b2e9` (run https://github.com/zageabb/ScreenCraft/actions/runs/43311895519). Superseded PR #16 was closed, preserving the concurrent Phase 9.1 planned work on main.
- **Phase 9D input validation:** PR #18 https://github.com/zageabb/ScreenCraft/pull/18 merged as `bbb64ea9bd8658c4ce4a2aae56959ea395c8b19f`. All five CI checks passed on branch head `186eb1c9022ea2557a57edc523609ae1e7b5ad4e` (run https://github.com/zageabb/ScreenCraft/actions/runs/43312512510).
- **Deployment:** Changes are in GitHub main but have not been deployed to or manually accepted on live Ubuntu in this chat. No database schema migration is needed; after Desktop updates main, verify UDA sign-in, chart/KPI aggregation, step switching, accordion nested content and input validation in Preview **and** Interactive HTML export.
- **Future:** Phase 9.1 collapsible containers/shared app-level navigation remains a distinct PLANNED specification, not completed by the Phase 9C local sidebar/accordion work. FigmaBridge remains deferred. Production hardening (Phase 10) and accessibility/mobile acceptance remain open.

### Phase 9.1 merge and automated acceptance (2026-11-12)
- Merged PR #19: https://github.com/zageabb/ScreenCraft/pull/19; squash commit `7d478374ef45f20809fec20c2e6943fc3fd2cc2d`.
- CI run https://github.com/zageabb/ScreenCraft/actions/runs/43319304058 passed all five jobs (React, Python, Chromium Playwright against real generated HTML, Docker and documentation) on head `f7f2c6e6dfc7242447221fd1386a6502598f9b7e`.
- No DB schema migration or Caddy/UDA configuration change. Live Ubuntu deployment, keyboard/mobile manual acceptance, and optional formalization of the navigation extension in Application-Standard remain open.
