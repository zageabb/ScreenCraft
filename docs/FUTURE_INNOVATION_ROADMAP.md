# ScreenCraft — Future Innovation Roadmap
**Proposed 2026-11-13 · status: PLANNED / NOT IMPLEMENTED**

This is a separate future backlog. Do **not** interrupt, renumber or claim completion of the active Phase 10 development, Phase 7 FigmaBridge, or existing SC-001–SC-019 work. Review overlap and dependencies before implementation. Screen design remains the only mandatory .scraft area; all new contracts, workflows, database, API, AI and security sections are optional and backwards compatible. The canonical .scraft schema belongs in `zageabb/Application-Standard`, not a competing ScreenCraft-local standard.

## Guiding principle
> Design what matters, let AI propose what's missing, and approve what changes.

All AI/extraction/generation actions must propose reviewable diffs, never silently overwrite source files, generated application logic, permissions or production data. Maintain local-first operation for core editor/save/preview/export; AI/cloud integrations are optional. Any new interactive editor behaviour must retain standalone offline HTML export parity where safe, or document a clear explicit limitation.

## Priority tracks (provisional sequence; re-evaluate at Phase 10 exit)

| Roadmap ID | Proposed phase | Feature | Priority | Dependencies |
| --- | --- | --- | --- | --- |
| SC-F01 | 11 | AI Design Reviewer | High | .scraft AST validation, approved AI provider adapter |
| SC-F02 | 12 | Visual Design Diff/History | High | canonical ID stability, project revisions |
| SC-F03 | 13 | Visual Workflow Designer | High | declarative action engine, export parity |
| SC-F04 | 14 | Data and API Binding Studio | High | dataset mapping, secrets isolation, mock/live separation |
| SC-F05 | 15 | Business Rules Editor | High | workflow and field binding types |
| SC-F06 | 15 | Permission Simulator | High | role schema, isolated prototype personas |
| SC-F07 | 16 | Controlled Application Generator | High | approved design/data/security contracts, safe code generation |
| SC-F08 | Discovery, parallel to 11 | Existing Application Reverse Engineering | Highest discovery priority | source adapters, scope/provenance |
| SC-F09 | Later | Screenshot-to-editable-Screen | High | object recognition, user confirmation |
| SC-F10 | Later | Requirements-to-Design | High | structured user stories, change review |
| SC-F11 | Later | Automated Test Generator | High | workflow graph, assertion metadata |
| SC-F12 | Later | Interactive User Journey Testing | High | deterministic mock datasets and expected outcomes |
| SC-F13 | Later | Visual Database Designer | High | migration preview, PostgreSQL adapters |
| SC-F14 | Later | Database Schema Drift Detector | Medium | read-only schema introspection |
| SC-F15 | Later | Application Documentation Generator | High | metadata completeness and traceability |
| SC-F16 | Later | Screen Recording Import | Medium | consent, media redaction, extraction fidelity |
| SC-F17 | Later | Design Template/Component Library | Medium | versioned packages, licensing/provenance |
| SC-F18 | Later | Multilingual and RTL Preview | Low | locale strings and responsive tests |
| SC-F19 | Later | Plugin/Extension SDK | Medium | sandboxing, versioned contracts and capability grants |

**Note:** Phase numbers 11–16 are *proposals*, not a declaration that Phase 10 is complete or that work is approved to start. Visual Database Designer is deliberately kept distinct from Data Binding Studio: modelling and migration are not the same as connecting a screen to data.

## First discovery project — SC-F08 reverse engineering
- Read-only source adapters for React/Vite and Flask/Jinja first; allow future adapters for other frameworks.
- Inventory routes, screens, object trees, common components and navigation; capture detection confidence and unknown/unmapped behaviours.
- Build draft .scraft designs without altering repositories; preserve source paths, component identifiers, provenance and reversible mappings.
- Compare extracted layouts against rendered application screenshots where available. Never assume runtime security, workflows or external DB semantics from UI appearance.
- Demonstrate a narrow proof of concept using a synthetic/sample application before proposing a real QueryBridge, TAIJU or LedgerOne integration.
- **Acceptance:** import fixture twice deterministically; produce editable, navigable .scraft; identify unsupported elements without dropping them; emit source map and diff; no source writes, no secrets collected.

## Proposed phase acceptance gates

### SC-F01 / Phase 11 — AI Design Reviewer
- Validate layout consistency, navigation reachability, missing bindings, accessibility, theme contrast and field semantics.
- Offer rule-based checks offline; optional AI explanations/suggestions using a configured provider.
- **Acceptance:** reproducible finding report with severity/location; one-click *proposal* diff with undo; no automatic design mutation or sensitive asset exfiltration.

### SC-F02 / Phase 12 — Visual Design Diff/History
- Compare two .scraft documents visually and structurally; flag moved/added/deleted objects, property, workflow and theme differences.
- **Acceptance:** stable ID-based diff with change summary and safe restoration; no data loss of unknown extension fields; revision conflict behaviour verified.

### SC-F03 / Phase 13 — Visual Workflow Designer
- Graph editor for trigger, condition, validation, navigation, modal, data operation and error handling; reference screen/object IDs.
- **Acceptance:** deterministic graph validation (including broken refs and cycles); a Save → validate → mock add row → feedback journey works both in preview and single-file offline HTML. No arbitrary executable code in .scraft.

### SC-F04 / Phase 14 — Data and API Binding Studio
- Visually bind controls to declared data contracts, mappings and read-only API fixtures; separate mock, staging and live capabilities.
- **Acceptance:** schema validation, test response previews, pagination and failure states; credentials remain server-side, network actions disabled in standalone offline export; real writes require explicit admin approval and cannot be enabled by design import.

### SC-F05 and F06 / Phase 15 — Business Rules and Permission Simulator
- Typed validation, calculations, conditional visibility and dependency rules; roles/personas for prototype previews, not live authorisation policy.
- **Acceptance:** tests for rule precedence, cycles, missing fields and role-based UI; prominently label preview security as simulation and enforce actual backend ACL independently.

### SC-F07 / Phase 16 — Controlled Application Generator
- Generate PR-ready React/Flask starter UI, API contracts, optional migration drafts, README and Playwright tests from an approved design.
- **Acceptance:** generation produces clean reproducible diffs; compiles/test passes on a sample app; never overwrites handwritten code without review; DB migrations are dry-run/review only until separately approved; no invented production security controls.

## Additional backlog (F09–F19)
- **F09 Screenshot-to-Screen:** produce an editable tree, per-node confidence and unresolved overlay; verify reimport/edit/export.
- **F10 Requirements-to-Design:** map user stories to screens/actions; output traceability and unresolved requirement questions, not fabricated mandatory fields.
- **F11 Test Generator:** derive executable Playwright scenarios from approved workflows, with assertions and fixtures; export tests as reviewable files.
- **F12 User Journey Testing:** sequence screens/actions/expected results across personas and mock sessions; report the failing step with screenshots.
- **F13 Visual Database Designer:** model entities, relationships, PK/FK and indexes; propose PostgreSQL DDL and reversible migration drafts; never apply automatically.
- **F14 Schema Drift:** read-only compare approved contracts with database introspection; redact credentials and warn on breaking changes.
- **F15 Documentation Generator:** generate user and technical docs, navigation map, API/data dictionaries and traceability from saved metadata.
- **F16 Screen Recording Import:** consent-based local processing, secrets/PII redaction, frame/interaction extraction; human-assisted mapping required.
- **F17 Template/Component Library:** version, preview, licence and provenance for reusable internal objects and screen packs; support upgrades with diff.
- **F18 Localisation:** preview locale switching, long strings, RTL and missing translation checks.
- **F19 Extension SDK:** signed/allowlisted plugin manifests, permission-scoped connectors and renderer/export compatibility tests.

## Engineering and governance
1. **Canonical schema:** propose optional namespaced .scraft v1-compatible extensions in Application-Standard, with fixture and round-trip tests before activating any new writer. Unknown fields must survive import/export.
2. **Risk boundary:** generated UI is not production security; real DB/API mutations need explicit approvals, audit logs and permission checks. Never put credentials in .scraft or standalone HTML.
3. **AI behaviour:** machine-generated suggestions carry provenance, evidence and confidence; prompt injection from imported files/source/text must not become instructions.
4. **Quality:** Playwright browser tests plus actual standalone HTML export parity where relevant; WCAG and responsive regressions, import/export determinism, no UI regressions.
5. **Delivery:** feature branches and reviewed PRs; status tracked separately as proposed, implemented, tested, CI, merged, deployed and user accepted. Respect existing CI/merge gate; if CI unavailable, mark unverified and do not claim green.
6. **Approval:** completing this roadmap documentation is not approval to implement or deploy all features. Prioritise a reversible reverse-engineering spike and reviewer/diff foundation when the active workstream permits.
