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
