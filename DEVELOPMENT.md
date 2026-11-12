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
- **Canonical .scraft format and object catalogue:** `zageabb/Application-Standard` is the single authority for the `.scraft` v1 specification and `standards/screencraft/object-catalogue.json`. Each application stores its own design instance and references the central format/version; no copying or redefinition of canonical schema.
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

## Phase 5 — AI-governed application design authority (future scope, approved direction 2026-11-12)

**Shared design principle (canonical source: `zageabb/Application-Standard`):** **“Design what matters, let AI propose what's missing, and approve what changes.”** ScreenCraft applies this centrally defined principle rather than maintaining a separate variant.

**Decision (refined 2026-11-12):** Screen layouts and their identifiable components are the **only mandatory authored design baseline**. Other areas—behaviour, bindings, navigation details, database/data models, API contracts, workflows, permissions/roles and acceptance criteria—are **optional design inputs** and may be absent, incomplete or revised. ScreenCraft should be capable of governing these areas when provided or subsequently approved, but must not require users to completely specify them before AI-assisted development can proceed. The goal is **controlled, progressive development, not rigid specification completeness**. This does **not** mandate a particular implementation framework.

**Scheduling / non-interference:** This section is a requirement and roadmap addition only. Continue the existing Phase 1–4 scope, development, CI, testing and acceptance independently. Do **not** divert, block, rebase, or restart the current Phase 1–4 work for Phase 5. Phase 5 implementation requires separate planning and acceptance after the core foundation is sufficiently stable.

| ID | Future workstream | Status | First acceptance |
|---|---|---|---|
| SC-026 | Versioned, stable-ID declarative design contracts for screens/components, behaviour, bindings, navigation and responsive rules | PLANNED (Phase 5) | A design change produces a deterministic and machine-readable diff |
| SC-027 | Optional, incrementally enrichable application architecture contracts: entities, schema migrations, API schemas, integrations and workflows | PLANNED (Phase 5) | Absent contracts do not block development; approved additions are versioned and validated |
| SC-028 | Optional authored identity/role/permission design, plus mandatory enforcement of applicable security requirements | PLANNED (Phase 5) | AI can propose missing role rules; required backend security is still verified |
| SC-029 | Design-to-development handoff: export .scraft to application repos, produce change requests/issues and agent-readable tasks | PLANNED (Phase 5) | Agent can identify changed contract elements and required work |
| SC-030 | Implementation conformance: structural checks, browser/visual regression, API, workflow, data and permission tests | PLANNED (Phase 5) | CI reports pass/fail and traceability to design requirements |
| SC-031 | Governance: approval baselines, version history, deviations, design-to-code status and reverse feedback | PLANNED (Phase 5) | AI proposals and approved changes update the baseline transparently; no silent overwrite |
| SC-032 | Standard object catalogue and nested/reusable components, centrally maintained in Application-Standard | PLANNED (Phase 5; central format catalogue merged) | Read/version core + extension object definitions; nested objects and safe unsupported-object warnings; tests for round-trip and containment |

### Central object catalogue adoption (SC-032)
- Canonical catalogue: `zageabb/Application-Standard/standards/screencraft/object-catalogue.json` and `standards/screencraft/README.md`. ScreenCraft must **consume and validate against** this standard, not fork its definition.
- All ten v1 core types are specified; expanded `x-` prefixed objects are optional capabilities, not required editor support during Phase 1–4.
- Support nested object hierarchy using v1 `parent_id` semantics. Preserve stable IDs, prohibit parent cycles, and validate containment; composed screens should include buttons inside cards, grids inside panels and forms inside modals.
- Missing functional specifications must not block AI development; unsupported custom objects must be preserved, visibly warned about and never claimed functional.
- Future ScreenCraft editor gallery should load versioned catalogue descriptors, advertise supported renderers/exporters, and allow controlled proposals to extend the central catalogue.
- This is **future scope only**. CI bypass for documentation merge was explicitly authorised on 2026-11-12 because of GitHub Actions billing; do not consider CI passing by implication. No new Phase 1–4 dependency, gate, CI requirement or implementation diversion is authorised by this entry.

### Progressive AI design-change policy
- **Mandatory minimum:** a valid screen design with stable screen/component identifiers. Optional specification fields must not be mandatory checkboxes or hard development gates.
- **AI initiative:** when an unspecified interaction, field, screen, endpoint, workflow step or rule is needed, the agent proposes a sensible addition with rationale, impact and tests. It should not freeze the entire task because the designer omitted a detail.
- **Approval tiers:** (1) Within already-approved intent, low-risk implementation decisions may proceed autonomously and be recorded; (2) Material changes to approved screens, user-visible behaviour, data contracts, workflows or permissions are proposed as reviewable design amendments and require approval before becoming authoritative; (3) Destructive migrations, access expansion, sensitive data exposure, external actions and deployment always require the appropriate explicit approval.
- **Nonblocking execution:** while approval is pending, the AI continues independent development and testing, and may use clearly marked provisional assumptions or non-destructive mocks for dependent work. It must not quietly treat an unapproved proposal as a new baseline.
- **Change lifecycle:** identify gap → propose change with diff, rationale, risk and acceptance tests → classify approval tier → continue safe independent work → approve/reject/amend → version .scraft design and implementation trace → validate in CI.
- **Guardrails:** optional specification does not mean optional security, accessibility or correctness. Apply repository standards and safe defaults; ask for approval when a meaningful product/security choice cannot be made safely.
- **Traceability:** distinguish approved requirements, agent proposals, provisional assumptions, implemented changes and rejected changes. Capture decisions and outstanding approvals in DEVELOPMENT.md or linked issues.

### Format constraints to preserve during Phases 1–4 (forward compatibility, not new implementation blockers)
- Preserve stable unique IDs for screens, components, interactions and other schema entities; avoid position-dependent identification.
- Version .scraft documents against the canonical schema owned in `zageabb/Application-Standard`; retain explicit extension points and a documented migration mechanism. Do not create a competing ScreenCraft-owned schema.
- Keep the .scraft ZIP open, portable and machine-readable (canonical JSON plus assets), with Git-friendly unpacked representation; do not make the image preview the authoritative source.
- Allow optional references to contracts for data, APIs, workflows and permissions, even if their Phase 5 interpretation is not yet implemented. Existing Phase 1–4 artefacts must remain valid.
- Keep the application-specific approved design artefact in each consuming application's repository, referencing the shared .scraft standard in `zageabb/Application-Standard`; ScreenCraft reads/writes design instances via controlled GitHub sync and tracked revisions. Do not duplicate the standard definition in individual applications; cross-repository modifications must be explicit and reviewable.
- Treat imported Figma designs as inputs for review and normalisation, not automatic approval of functional or security contracts.

### Boundaries and safeguards
- Design contract owns **what** must be implemented; the AI agent/developer owns **how**, subject to repository architecture and standards.
- Generated code, database migrations and external actions are never automatically deployed from a design edit; use review, approvals and normal CI/merge controls.
- Never infer authorisation solely from client-side visibility; permissions must be validated in the backend and tested.
- Screen similarity alone is insufficient: visual, functional, persistence, data migration, API, workflow and security evidence are distinct.
- Record contract revisions, implementation traceability, approvals, deviations and test evidence in DEVELOPMENT.md or linked repository artefacts.

**Phase 5 acceptance (future):** Starting with screens alone and no authored API/database/workflow/permission contracts, the AI can develop a working implementation, propose missing requirements without deadlock, continue safe independent work while awaiting material decisions, and record all assumptions and approvals. Once a design change is approved, ScreenCraft generates a reproducible versioned contract and development task; tests report compliance for the specified areas and applicable safety standards, with no silent alteration to the approved baseline.
