# APPLICATION DESIGN & DEVELOPMENT STANDARD

**Version:** 1.0 — proposed baseline  
**Date:** 21 October 2026  
**Application family:** Taiju/GPQS candidates, Ubuntu-hosted tools, reusable libraries and future application projects  
**Status:** Reference standard for adoption; not evidence of deployed enterprise compatibility  
**Proposed template repository:** `zageabb/Application-Standard`

> **Purpose.** Make each new application consistent in design, easier to develop with AI agents, safe to demonstrate on Ubuntu, and more straightforward to adapt to production environments — without unnecessarily rewriting existing applications or restricting specialist features.

## 1. Executive decision record

1. Adopt a **library-first, compatibility-first** development policy. Approved existing technologies take priority; additional libraries are permitted when justified and recorded.
2. For **new production-candidate web UIs**, prefer React 19, Material UI (MUI) 7, Emotion, React Router 7, TanStack Query/Table, Axios and React Hook Form, using the Taiju inventory as the reference rather than claiming these versions are production approved.
3. For **new Python API services**, prefer Python 3.11, FastAPI, Pydantic, SQLAlchemy 2 and Alembic; use PostgreSQL for relational applications when feasible. Retain SQLite for lightweight, local-first or legacy tools when justified.
4. Use Docker Compose or the existing managed user-systemd/UDA path for Ubuntu demonstration deployment. Do not require Kubernetes or Azure for the local demo.
5. Treat Entra ID, Power BI, Azure AI Search, Cosmos DB, EDP and Teams as **optional future integrations** behind typed interfaces. A missing connection must never be mistaken for valid empty production data.
6. All Ubuntu-specific reverse-proxy adaptations must be isolated, explained by a searchable `LOCAL_UBUNTU_PROXY_COMPAT` comment, configuration-driven where possible and covered by local/prefixed-route tests.
7. Create a **shared Figma/UI design system** from approved reference screenshots, existing Taiju styles and MUI components. Do not invent definitive brand tokens where source values have not been provided or measured.
8. Create a reusable **GitHub Template Repository** with architectural documentation, `AGENTS.md`, `DEVELOPMENT.md`, `DID.md`, CI, design standards, integration contracts and application profiles. A template is a starting point, not a centrally enforced runtime dependency.
9. Preserve working legacy applications. Migrate only if integration, reuse, security, support or business need justifies the cost.
10. Define completion using implementation, tests, CI, deployment checks and separate user/business acceptance; agents must not claim success on documentation alone.

## 2. Scope and application profiles

This standard applies to newly created software and to changed components of existing applications where practical. It is deliberately **not** a requirement that every utility use React or FastAPI.

| Profile | Typical applications | Preferred approach | Allowed variation |
|---|---|---|---|
| P1 — Enterprise-targeted web | SCM dashboards, procurement workflows, CatManager-like successors | React/MUI, FastAPI, PostgreSQL | Approved specialist components; enterprise connectors optional |
| P2 — Standalone Ubuntu web | General Search, pricing tools, Notes, PackBridge | Shared UI language and API contracts | Existing Flask/Jinja/SQLite may remain; migrate incrementally |
| P3 — Data/AI specialist | Should-Cost, Context Studio, QueryBridge, document workspaces | Separate UI, services and adapters | Charts, editors, Graphviz, Mermaid, Python ML, local LLM |
| P4 — Desktop/mobile/native | FreeCAD Studio, AI Spreadsheet, CardDay, browser extensions | Consistent principles, security, evidence and UI tokens where useful | Native toolkit and platform-specific implementation |
| P5 — Libraries/APIs | research-core, integrations, reusable backend packages | Versioned APIs, tests, docs and compatibility contracts | No Figma/web front end required |
| P6 — Design tooling | DesignBridge, ScreenDesign | Portable semantic schema, tokens, round-trip validation | Penpot/Figma adapters and native design files |

**Mandatory documentation for every profile:** `README.md`, `AGENTS.md`, `DEVELOPMENT.md`, `DID.md` or `docs/decisions/`, applicable tests, `.env.example` where configured, and a release/deployment note. Profiles may mark clearly irrelevant template files `N/A`; they should not fabricate stub features.

## 3. Normative language and decision rights

**MUST** indicates a non-negotiable policy; **SHOULD** a recommended default requiring a documented reason to depart; **MAY** an optional choice. Project owners approve product decisions and library exceptions. Changes impacting credentials, public exposure, irreversible data, production systems or paid services require explicit approval. The project-specific README and current implementation describe the live application; this document sets the forward-looking baseline. In conflicts, record an exception and do not silently rewrite an existing architecture.

## 4. Core architectural model

```text
Figma approved screens + tokens / DesignBridge portable schema
                           |
                           v
        React + MUI application / approved native UI
                           |
                   typed API contract
                           |
         FastAPI or retained supported service layer
                /             |             \
          data store    local capabilities   adapters
       PostgreSQL/SQLite   Ollama/jobs      Power BI/Entra/Azure
                                              (not configured)
                           |
              Ubuntu: UDA/Caddy reverse proxy
                           |
         enterprise: approved gateway/services later
```

**Separation rules.** Business rules MUST NOT rely on a browser widget or a specific proxy prefix. Integrations MUST be accessed through defined service interfaces. Application screens MUST NOT depend directly on enterprise credentials or Azure availability. Background jobs and generated files SHOULD be durable and resumable where their workloads justify it. Library-specific code SHOULD be confined to a wrapper or adapter so it can be replaced without rebuilding business logic.

## 5. Repository and module conventions

A template-generated application SHOULD begin with a clean logical layout; omit unused folders rather than introducing dead scaffolding:

```text
Application-Name/
  README.md                    # what it does, local run, actual capabilities
  AGENTS.md                    # working instructions and evidence gates
  DEVELOPMENT.md               # ordered, factual delivery register
  DID.md                       # design intent / decisions and trade-offs
  CHANGELOG.md                 # release history
  STANDARD_VERSION.md          # inherited standard and exceptions
  .env.example                 # config names only; no secrets
  .gitignore
  .github/workflows/ci.yml
  .github/PULL_REQUEST_TEMPLATE.md
  docs/
    ARCHITECTURE.md
    DESIGN_SYSTEM.md
    FIGMA_HANDOFF.md
    LIBRARY_REGISTER.md
    EXCEPTIONS.md
    INTEGRATIONS.md
    DEPLOYMENT_UBUNTU.md
    SECURITY.md
    TEST_STRATEGY.md
    ACCEPTANCE.md
    adr/ADR-0001-stack-choice.md
  frontend/                    # when the profile uses a web UI
  backend/                     # when the profile uses an API
  tests/
  deploy/                      # optional Docker/Compose/UDA/systemd files
```

Individual repositories can use more focused layouts. Files should have one clear source of truth, links to related decisions, and documented owners. Shared libraries should be versioned and pinned by release/commit rather than tracking a moving default branch.

## 6. UI and interaction design standard

### 6.1 Foundations and tokens

The authoritative UI token set MUST be derived from approved Taiju sample screens, the existing production-aligned theme/style files where accessible, and the MUI Figma Design Kit. Record **value, semantic name, source, date and confidence** for each token. Define at least: primary/action, backgrounds/surfaces, typography, spacing, elevation, corners, borders, icon sizing, status semantic colours, focus states, light/dark variants and breakpoints. Until real source values are verified, use clearly labelled draft tokens; do not claim invented colours are enterprise standards.

**Typography:** Noto Sans appears in the Taiju inventory; adopt it for matching new web screens where licence/package delivery and available typefaces are appropriate. Use semantic heading/body/caption scales, not one-off pixel values.

**Responsiveness:** document layouts at desktop (wide, standard), tablet and narrow mobile. Navigation, filtering, tabular overflow, dialogs and interaction targets need defined behaviour. Support keyboard access, visible focus, proper labels, contrast and error messaging. Aim for WCAG 2.2 AA on web applications and document residual exceptions.

### 6.2 Shared screen families

| Pattern | Contents | Preferred implementation |
|---|---|---|
| Application shell | Header, nav drawer, page header, breadcrumbs, alert area | MUI AppBar/Drawer/Container/Box |
| Dashboard | KPI tiles, status indicators, compact trends | MUI Card/Grid, approved chart library |
| Data management | Filter bar, search, table, pagination, bulk actions | TanStack Table + MUI components |
| Data capture | Field groups, dates, dependent selectors, validation | React Hook Form + MUI controls |
| Detail and review | Summary panel, evidence, tabs, activity, audit history | MUI Tabs/Drawer/Dialog/Accordion |
| AI workspace | Conversation, citations, tool activity, status and uploads | MUI layout + approved Markdown/rendering |
| Document workspace | File tree, editable preview, compare/diff, approval | Specialist editor + MUI shell |
| Specialist canvas | Diagram, chart, spreadsheet grid, timeline | Approved canvas/grid library + MUI shell |
| Administration | Roles, configuration, mappings and data sources | Standard forms/tables with security controls |

For every reusable component include loading, empty, error, disabled, read-only, selected, validation and no-permission states as appropriate. Table variants must define column sizing, sorting, virtualisation thresholds, row selection, edit modes, accessibility and audit behaviour. Use existing reusable components before introducing duplicate ones.

### 6.3 Figma from reference screens

Use **three to five representative approved screenshots**, ideally dashboard, procurement table, form/detail, Akira chat and a complex/specialist workspace. Capture exact alignment, density, typography, colours and component states; inspect actual code theme values when available. Build a Figma library with foundations → components → composed patterns → screens → prototype flows. Map each Figma component to `@mui/material`, an existing specialised library, or an approved custom component. Preserve names and props where possible, and include a Figma-to-code mapping table.

A screenshot is evidence for visual appearance, **not** for responsive rules, keyboard behaviour, business validation or unseen interactions. Those need separate specification and validation. The official MUI Figma kit is the preferred starting point. Figma Code Connect is optional and subject to team entitlements; it is not a dependency of this standard.

### 6.4 Figma handoff and acceptance

Each screen handoff MUST contain: screen ID/owner/version; linked reference; layout widths; tokens; component instances and variants; interaction map; navigation target; field-level rules; data contracts; all material states; keyboard/accessibility notes; responsive screenshots; unresolved questions; permitted library exceptions. Validate code against approved Figma at representative sizes and log deviations rather than silently approximating.

### 6.5 DesignBridge and ScreenDesign

The existing DesignBridge canonical JSON approach is a strong candidate for an optional neutral design interchange format. It must evolve to describe component variants, semantic tokens, responsive behaviour, component mappings and round-trip identity before claiming production Figma/code equivalence. ScreenDesign's JSON-driven conditional fields are a reusable inspiration for schema-based forms. Neither should replace the MUI component library or project-owned business validation.

## 7. Approved technology and library policy

**Baseline derived from the uploaded Taiju/Akira inventory** (98 entries, not 98 mandatory dependencies):

| Layer | Preferred for P1 | Retained/conditional choices | Rule |
|---|---|---|---|
| UI | React 19, MUI 7, Emotion | Native UI, existing Flask templates | MUI for new enterprise web UI |
| Routes/build | React Router 7; Taiju Webpack 5/Babel baseline | Existing Next.js/Vite tools | Match the target host/build contract; exception if different |
| Network/cache | Axios, TanStack Query | Existing clients | One clear responsibility each |
| Tables/forms | TanStack Table, React Hook Form | AG Grid/specialist editors | No replacement with a weaker generic table |
| Renderers | react-markdown, sanitisation, KaTeX | Mermaid/Graphviz, approved viewers | Untrusted text must remain sanitised |
| Backend | Python 3.11, FastAPI, Pydantic | Supported Flask apps | API contracts survive framework changes |
| Persistence | PostgreSQL, SQLAlchemy 2, Alembic | SQLite/SQLModel where justified | Migrations and backups are required |
| Jobs/cache | Redis or controlled job runner as needed | Existing durable queues | Keep job state observable |
| Local AI | Ollama via explicit provider adapter | Semantic Kernel where it adds value | AI is optional to non-AI workflows |
| Enterprise | Typed disabled adapters | Entra, Power BI, Azure services | No required credentials in local demos |
| Operations | Docker/Compose or existing systemd/UDA | K8s later | Do not introduce K8s solely for demos |

**Adding libraries:** write a short decision record containing need, candidates, existing-stack gap, API/maintenance burden, licensing and commercial restrictions, accessibility, security, compatibility, bundle/performance impact, tests, rollback and owner. Approval permits an extension; it does not make that library mandatory for every project. Track package versions in a lockfile and include supply-chain/security scanning where feasible.

**Known approved-extension candidates from existing work:** Mermaid/Graphviz and `diagram-pptx` for diagrams; AG Grid or purpose-built cell editors for spreadsheet experiences; Office/PDF processing via established backend libraries; scikit-learn for deterministic estimation; PySide6 for native desktop apps; dnd-kit for interaction where Taiju already uses it. Verify licensing and actual features per use case before adoption.

## 8. Enterprise adapters and local demonstration behaviour

Use a consistent integration boundary. Every adapter exposes its identity, availability, capability flags, config validation, health and operation-level errors. **Never silently substitute synthetic data for an enterprise query.** Fake/demo results must be clearly labelled as synthetic and include `source=demo`.

A recommended response model:

```json
{
  "status": "not_configured",
  "source": "powerbi",
  "configured": false,
  "data": null,
  "error": null,
  "message": "Power BI is not connected in this deployment"
}
```

The states MUST remain distinct: `not_configured` (deliberately absent), `available` (connected, returns data including an empty array), `unavailable` (temporary dependency outage), `permission_denied`, `invalid_request`, `error`. Typed `null` means no result, not zero records and not success. In client code, hide non-essential enterprise functionality or show a labelled unavailable state instead of blank charts. Mock adapters must not share names or endpoints with live services without an explicit mode/flag and visible indicator.

| Capability | Ubuntu development | Future enterprise implementation |
|---|---|---|
| Authentication | Local development auth or UDA access boundary | Approved Entra/MSAL policy |
| Power BI/DAX | Disabled or synthetic data adapter | REST or verified ADOMD adapter |
| SAP/EDP data | Approved imported/sample extracts | Governed data connectors |
| Knowledge/RAG | Local indexed documents as needed | Azure AI Search if approved |
| Chat history | SQLite/PostgreSQL | Approved persistent enterprise store, e.g. Cosmos DB |
| AI inference | Ollama model provider | Approved enterprise provider |
| Notifications | Local log/outbox | Service Bus or enterprise messaging |
| Teams integration | Disabled integration contract | Approved Teams bot and app registration |

Do not hard-code cloud SDK import requirements into core service startup. Optional modules may load only when configured, and health reports should separately expose core readiness versus optional integration readiness.

## 9. Backend, data contracts and reliability

Build versioned HTTP APIs with request/response validation and reproducible error shapes. Where useful, publish OpenAPI. Use stable IDs, explicit timestamps/time zones, cursor/page limits and documented sorting/filtering. Backend business rules must be the final authority; UI validation is supplementary. Prefer async APIs when underlying I/O benefits, not merely for appearance.

Use database migrations, constraints, unique keys and transaction boundaries for persistent state. Define retention, backup/restore and export before launching any tool containing valuable data. For import/export maintain provenance and original values; preserve existing datasets during version upgrades. Synthetic seed data must be obviously synthetic. Where a job is long-running, use job IDs, progress states (`queued`, `processing`, `completed`, `failed`, `cancelled`), retry/recovery policy and idempotency where relevant.

## 10. Local AI, research and governed outputs

Keep AI providers behind replaceable adapters; default to local Ollama for demos where needed. AI-assisted reasoning is **advisory unless a controlled deterministic step approves it**. Preserve the successful existing pattern from PackBridge and Should-Cost: structured extraction, schema validation, provenance, explicit review, safe transformation and deterministic final output. Prompt versions, model identification, relevant tool activity and audit records should be retained for reproducibility where appropriate; do not expose private reasoning or secrets. Clearly distinguish sourced evidence, model-only estimates, synthetic demonstrations and validated calculations. Bound tool loops, external fetching, uploads and resource use.

## 11. Ubuntu, reverse proxy and deployment portability

### 11.1 Baseline

Use existing Universal Deployment Agent (UDA)/Caddy infrastructure or Docker Compose as appropriate. Default to loopback-only or isolated container network bindings; route external traffic through the authenticated HTTPS proxy. The UDA path prefix is `/apps/<slug>/`. The application must run directly at root locally and through the prefix when deployed. Store host ports and service names in a central registry; do not assume documented default ports are free.

### 11.2 Portable URL handling

Backend URL generation, static assets, redirects, uploads and the frontend API client must be base-path-aware. For Flask, validated one-hop `ProxyFix` and `url_for` can support prefix-aware URLs; do not trust client-supplied forwarding headers when the backend is exposed directly. For FastAPI use a verified ASGI `root_path`/proxy arrangement. For Next.js-style builds, a configured `basePath` may be resolved at build time and must be documented. Streaming (SSE), WebSockets if used, login cookies, CSRF and file downloads require tests through the real prefix.

### 11.3 Mandatory comment marker

Where a deployment-specific adaptation is required, place a searchable explanatory comment adjacent to the relevant code:

```python
# LOCAL_UBUNTU_PROXY_COMPAT
# Reason: UDA/Caddy publishes this application under /apps/<slug>/.
# Scope: Ubuntu demonstration; keep root-mode and enterprise portability.
# Security: trust only the configured reverse-proxy hop.
# Review: replace with approved ingress configuration if appropriate.
```

The comment should explain a **real code adaptation**, not label generic application logic. Record the same decision in `docs/DEPLOYMENT_UBUNTU.md`, referencing files and regression tests. Avoid embedding machine addresses, private domains and port numbers in frontend code. Use environment-driven bases, with documented safe defaults.

### 11.4 Deployment acceptance

Check: direct root-mode; authenticated `/apps/<slug>/`; unauthenticated denial; static/JS/CSS; API GET/POST; navigation and redirects; login/logout; cookie scope; uploads/downloads; SSE/streaming; health/readiness; configuration and secret isolation; rollback; backup persistence; UDA live route and CI evidence. Do not claim production deployment based solely on a local dev-server response.

## 12. Security, privacy and access control

No passwords, keys, tokens, secrets, live database files or unapproved commercial datasets in Git. Keep configuration in environment variables/secret stores with example names only. Validate all files and imported JSON, restrict upload size and locations, prevent path traversal, guard external URL fetching against SSRF, sanitise rendered Markdown/HTML, and apply server-side authorisation to every meaningful action. UDA access control is a separate perimeter, **not proof of application-level role enforcement**. Define data sensitivity and the trusted network boundary. Add CSRF protection where cookie authentication is used and appropriate CORS rules for separated web/API origins. Threat-model tools capable of writing files, generating SQL or modifying business data. Log actions and outcomes without logging credentials or confidential content unnecessarily.

## 13. Quality gates, testing and acceptance

A change is not complete because the file exists. Minimum gating per project profile:

| Gate | Evidence expected |
|---|---|
| Source | Committed implementation with non-empty diff and named files |
| Static | Python compilation / TypeScript typecheck / lint / formatting as relevant |
| Tests | Unit and behavioural regression, plus contract tests for connectors |
| UI | Figma comparison, interaction states, accessible keyboard/screen reader checks |
| Data | Migration, backup/restore, import/export and invalid-input checks |
| Deployment | Direct and UDA-prefix smoke tests, health, unauthorised-denial checks |
| GitHub | Latest workflow run status, URL and commit SHA; no false CI-green claims |
| Acceptance | Separate product/user and, where relevant, SAP/enterprise acceptance |

For Python changes follow the strong Allocraft precedent: `python -m compileall -q` on actual application/tests source, then `python -m pytest -q`. For React projects add build, test, typecheck and lint. CI should not depend on enterprise secrets or live production connectors; mock them under explicit test configuration. A newly created template is not considered runtime-verified until its installation/build/test commands are run and results recorded.

## 14. `AGENTS.md` standard

This is the persistent working agreement for coding assistants. Keep instructions concise and enforceable. Mandatory sections: project goal and profile; read order; architecture constraints; approved libraries and exception policy; code boundaries; no-secret/no-unapproved-enterprise-access rules; reverse-proxy marker rule; tests and CI; Git/branch practices; parallel ownership; status evidence; stop/approval boundaries; handoff/reporting. Agents read the repository, its register and latest CI; they must not infer a completed implementation from previous chat. They should make the smallest coherent improvement and preserve working behaviour unless directed otherwise.

## 15. `DEVELOPMENT.md` standard

A factual delivery register rather than a wish list or conversation transcript. Each work item has stable `DEV-###` or `OPS-###` ID, title, priority, owner, branch, prerequisites, scope, affected modules, tests/CI, implementation evidence, integration status, acceptance criteria and acceptance owner. Standard statuses: `PLANNED`, `IN_PROGRESS`, `BLOCKED`, `AWAITING_ACCEPTANCE`, `COMPLETE`, `DEFERRED`. Distinguish **implemented**, **tested**, **merged**, **deployed** and **accepted**. Nothing is COMPLETE without its applicable evidence; partial features stay explicit. Update during the same development pass.

Use one top-level current focus and a compact development index, linking archived history to `docs/development/`; avoid the ever-growing, unstructured monolith seen in long-lived tools. For parallel agents, record branch/worktree ownership, dependencies, merge conflict boundaries and coordination.

## 16. `DID.md`, decisions and change control

`DID.md` (Design Intent & Decisions) records what the application is intended to do and why core choices were made. Add ADRs for decisions with a meaningful future cost: framework, persistence, new libraries, proxy modes, authentication, model/provider, file formats, irreversible migration and integration strategy. Every ADR should include context, considered options, decision, implications, alternatives rejected, date, owner and reassessment trigger. Require explicit approval for public exposure, destructive operations, enterprise access and new paid dependencies.

## 17. Shared GitHub template repository

**Recommended name:** `zageabb/Application-Standard` (mark as GitHub Template). It contains versioned **standard documentation plus example/optional scaffolds**, not production credentials, UDA registration or a prematurely forced full application runtime.

**Template architecture:**

- `standards/` — canonical master design/technology/security/deployment policy, versioned and reviewed.
- `templates/` — `AGENTS.md`, `DEVELOPMENT.md`, `DID.md`, README, ADR, library exception, Figma handoff and PR/issue templates.
- `examples/` — a minimal P1 React/MUI/FastAPI example, plus a P2 Flask/UDA compatibility example, added only once validated. A documentation-first v1.0 pack may omit runnable examples until their dependencies are built/tested.
- `.github/` — standard CI examples, CODEOWNERS when appropriate, PR checklist, issue templates and dependabot/security guidance.
- `docs/` — architecture, technology register, component mappings, deployment checks and sample-screen derivation procedure.
- `CHANGELOG.md` and `STANDARD_VERSION.md` — controlled updates and adoption status.

**Do not fork every new product from a giant runtime repository.** GitHub template copies files without shared history; each application pins a `standard_version`. Standard updates are opt-in, with an explicit comparison/review process. A reusable GitHub template is **not** a substitute for separately versioned shared libraries (`research-core`) or the Figma design library.

## 18. New application lifecycle

1. **Intake:** user goals, data classification, profile and proposed enterprise destination.
2. **Reuse scan:** discover existing code, business features and approved libraries. Record extension exceptions.
3. **Design:** choose approved Figma patterns/screens, tokens, states, component mapping and accessible flows.
4. **Contracts:** define API, data model, integration statuses, migrations and synthetic demo fixtures.
5. **Bootstrap:** create from approved template; set version, project docs, CI, safe environment configuration.
6. **Implement:** DEV register task → focused branch → tests → reviewable diff → CI → merge.
7. **Demo:** direct local test, UDA prefix test, protected ingress, health and rollback checks.
8. **Acceptance:** show Figma parity, user scenarios, data provenance and missing enterprise capabilities explicitly.
9. **Production preparation:** approve identity/services, security review, data governance, licences, performance and enterprise CI/deployment adapters.
10. **Maintenance:** release notes, incident/runbook updates, pinned library updates and exceptions review.

## 19. Current repository compatibility assessment

Static evidence reviewed from selected default-branch GitHub files in October 2026. **This is not a full source audit or live Ubuntu deployment certification.**

| Repository/pattern | Standard status | Exception or follow-up |
|---|---|---|
| General Search / Internet Pricing / research-core | Compatible | Maintain shared engine boundaries; proxy mode regression |
| Should-Cost / Price Estimator | Compatible with extension | Specialist charting and ML; retain deterministic outputs |
| PackBridge | Compatible with extension | Virtual SSD, document provenance and SAP export gates; UDA testing pending in ledger |
| Context Studio | Compatible principles; frontend variation | React 19 + Next.js/Tailwind, specialist Office editing; no forced rebuild |
| QueryBridge / System Knowledge Designer | Compatible with extension | Graph/schema editors, sqlglot, review-first changes |
| Mermaid Final | Compatible with extension | Mermaid canvas, export and correct live repo alias |
| Flask Spreadsheet / AI Spreadsheet | Specialist profiles | AG Grid/PySide6; not replaceable by basic MUI Table |
| CatManager / Allocraft / Notes | Compatible design concepts; legacy runtime | Preserve Flask/SQLite and working behaviours; apply change-by-change |
| DesignBridge / ScreenDesign | Complementary foundations | Structured design interchange and conditional-screen schema |

## 20. Adoption roadmap and ownership

**Stage A — standards foundation (first):** approve this document; nominate standard owners; publish the repository template; record initial library register and permitted deviations. No application refactoring.

**Stage B — design baseline:** obtain 3–5 approved Taiju screenshots and, if possible, the actual MUI theme; derive exact tokens and reusable Figma components; map the dashboard, table, form, chat and specialist canvas patterns. Until received, visual values remain draft.

**Stage C — validated sample:** implement and test one minimal React/MUI + FastAPI screen, mock enterprise adapter, PostgreSQL or SQLite sample dataset, CI and Ubuntu prefix handling. Verify both root and proxied modes. Record actual test results, not planned ones.

**Stage D — pilot adoption:** build one new business-relevant app from the template; compare development effort, Figma/code fidelity, proxy regressions and cost to production integration. Iterate v1.1.

**Stage E — enterprise integration (later):** obtain approvals, add real adapters individually, validate Power BI/ADOMD Linux viability or approved alternative, implement authentication/authorisation and full governance. No unapproved enterprise access is assumed.

### Decision gates

- **G1 — Standard approved:** technology policy, extension governance and owners signed off.
- **G2 — Design approved:** sample screen fidelity and token sources accepted.
- **G3 — Template validated:** fresh checkout, instructions, CI and UDA-prefix regression actually pass.
- **G4 — Production readiness:** enterprise identity, data, security, legal/licensing and operational approval granted.

## Appendix A. Minimum new-project checklist

- [ ] Application profile and use cases recorded.
- [ ] Standard version and extensions/exceptions documented.
- [ ] Existing repository/library reuse considered.
- [ ] `README.md`, `AGENTS.md`, `DEVELOPMENT.md`, `DID.md` established.
- [ ] Figma mapping or approved `N/A` documented.
- [ ] API contracts and optional integration statuses defined.
- [ ] Sensitive data and secrets are not in the repository.
- [ ] Backend owns validation and authorisation.
- [ ] CI has build/test/static checks appropriate to the project.
- [ ] Tests cover local root and `/apps/<slug>/` prefix if web-based.
- [ ] Reverse-proxy deviations carry `LOCAL_UBUNTU_PROXY_COMPAT` markers.
- [ ] Demo/production data and connector modes visibly distinct.
- [ ] Deployment/backup/health/rollback procedures are recorded.
- [ ] Completion evidence and separate user acceptance are logged.

## Appendix B. Source basis and references

**User-supplied sources:** `TAIJU and Akira Coding.md`; `taiju_akira_tech_inventory.xlsx` (inventory summary: 98 entries); original manifests described therein, not independently re-audited here.

**Representative existing repositories, inspected by GitHub connector:**

- CatManager: https://github.com/zageabb/CatManager
- Allocraft: https://github.com/zageabb/Allocraft
- PackBridge: https://github.com/zageabb/PackBridge
- Context Studio: https://github.com/zageabb/context-studio
- General Search: https://github.com/zageabb/general-search
- Internet Pricing: https://github.com/zageabb/Internet_pricing
- Should-Cost Intelligence: https://github.com/zageabb/should-cost-intelligence
- QueryBridge: https://github.com/zageabb/querybridge
- Mermaid Final: https://github.com/zageabb/mermaid_final
- DesignBridge: https://github.com/zageabb/designbridge
- ScreenDesign: https://github.com/zageabb/ScreenDesign
- UDA registry: https://github.com/zageabb/universal-deployment-agent/blob/main/UBUNTU_PORTS.md

**Official external reference material:**

- MUI Figma design kit: https://mui.com/material-ui/design-resources/material-ui-for-figma/
- GitHub template repositories: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository
- GitHub project creation from template: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template
- FastAPI proxy/root_path: https://fastapi.tiangolo.com/advanced/behind-a-proxy/
- GitHub Actions Python CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/python
- GitHub Actions Node CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs

**Limitations:** No live enterprise services were used or configured. Visual Figma source screenshots/theme files were not attached to this request, so exact brand tokens and actual UI parity remain approval items. This document is prescriptive going forward and does not establish that legacy repositories already meet every requirement.