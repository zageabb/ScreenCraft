# ScreenCraft development register
**Status 2026-11-12:** Documentation-first. No working editor, importer, exporter or runtime CI evidence.
**Evidence rule:** Track implementation, local validation, CI, merge, deployment and user acceptance separately. Never mark documentation-only work as runtime complete.

| ID | Workstream | Status | First acceptance |
|---|---|---|---|
| SC-001 | Standards/governance/CI | IN_PROGRESS | Files present, CI green, review |
| SC-002 | Canonical JSON schema | PLANNED | Versioned round trip tests |
| SC-003 | Flask storage/project/asset API | PLANNED | Secure create/save/open/reopen |
| SC-004 | Visual editor | PLANNED | Layers, selection, move/resize, undo |
| SC-005 | Components and themes | PLANNED | Instances, overrides, design tokens |
| SC-006 | Desktop/mobile responsive preview | PLANNED | 1440/1280/1024/768/390 + 200% zoom |
| SC-007 | Figma API/JSON adapter | PLANNED | Approved fixture import and warnings |
| SC-008 | Native .fig parser feasibility | PLANNED | Licence/security/fidelity go-no-go |
| SC-009 | SVG/images/assets | PLANNED | Sanitised import/provenance |
| SC-010 | HTML/CSS/Jinja export | PLANNED | Generated output renders |
| SC-011 | React export | PLANNED | Generated components compile |
| SC-012 | Optional GitHub sync | PLANNED | Secure PR/diff/versioning |
| SC-013 | Accessibility/security/performance | PLANNED | Automated + manual evidence |
| SC-014 | User manual/release/deployment | PLANNED | Fresh clone + root/prefix tests |

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

## Phase 5 — AI-governed application design authority (future scope, approved direction 2026-11-12)

**Decision (refined 2026-11-12):** Screen layouts and their identifiable components are the **only mandatory authored design baseline**. Other areas—behaviour, bindings, navigation details, database/data models, API contracts, workflows, permissions/roles and acceptance criteria—are **optional design inputs** and may be absent, incomplete or revised. ScreenCraft should be capable of governing these areas when provided or subsequently approved, but must not require users to completely specify them before AI-assisted development can proceed. The goal is **controlled, progressive development, not rigid specification completeness**. This does **not** mandate a particular implementation framework.

**Scheduling / non-interference:** This section is a requirement and roadmap addition only. Continue the existing Phase 1–4 scope, development, CI, testing and acceptance independently. Do **not** divert, block, rebase, or restart the current Phase 1–4 work for Phase 5. Phase 5 implementation requires separate planning and acceptance after the core foundation is sufficiently stable.

| ID | Future workstream | Status | First acceptance |
|---|---|---|---|
| SC-019 | Versioned, stable-ID declarative design contracts for screens/components, behaviour, bindings, navigation and responsive rules | PLANNED (Phase 5) | A design change produces a deterministic and machine-readable diff |
| SC-020 | Optional, incrementally enrichable application architecture contracts: entities, schema migrations, API schemas, integrations and workflows | PLANNED (Phase 5) | Absent contracts do not block development; approved additions are versioned and validated |
| SC-021 | Optional authored identity/role/permission design, plus mandatory enforcement of applicable security requirements | PLANNED (Phase 5) | AI can propose missing role rules; required backend security is still verified |
| SC-022 | Design-to-development handoff: export .scraft to application repos, produce change requests/issues and agent-readable tasks | PLANNED (Phase 5) | Agent can identify changed contract elements and required work |
| SC-023 | Implementation conformance: structural checks, browser/visual regression, API, workflow, data and permission tests | PLANNED (Phase 5) | CI reports pass/fail and traceability to design requirements |
| SC-024 | Governance: approval baselines, version history, deviations, design-to-code status and reverse feedback | PLANNED (Phase 5) | AI proposals and approved changes update the baseline transparently; no silent overwrite |

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
- Version the .scraft document/schema, retain explicit extension points and a documented migration mechanism.
- Keep the .scraft ZIP open, portable and machine-readable (canonical JSON plus assets), with Git-friendly unpacked representation; do not make the image preview the authoritative source.
- Allow optional references to contracts for data, APIs, workflows and permissions, even if their Phase 5 interpretation is not yet implemented. Existing Phase 1–4 artefacts must remain valid.
- Keep the authoritative design in each consuming application's repository, with ScreenCraft able to read/write via controlled GitHub sync and tracked revisions; changes to other repositories must be explicit and reviewable.
- Treat imported Figma designs as inputs for review and normalisation, not automatic approval of functional or security contracts.

### Boundaries and safeguards
- Design contract owns **what** must be implemented; the AI agent/developer owns **how**, subject to repository architecture and standards.
- Generated code, database migrations and external actions are never automatically deployed from a design edit; use review, approvals and normal CI/merge controls.
- Never infer authorisation solely from client-side visibility; permissions must be validated in the backend and tested.
- Screen similarity alone is insufficient: visual, functional, persistence, data migration, API, workflow and security evidence are distinct.
- Record contract revisions, implementation traceability, approvals, deviations and test evidence in DEVELOPMENT.md or linked repository artefacts.

**Phase 5 acceptance (future):** Starting with screens alone and no authored API/database/workflow/permission contracts, the AI can develop a working implementation, propose missing requirements without deadlock, continue safe independent work while awaiting material decisions, and record all assumptions and approvals. Once a design change is approved, ScreenCraft generates a reproducible versioned contract and development task; tests report compliance for the specified areas and applicable safety standards, with no silent alteration to the approved baseline.
