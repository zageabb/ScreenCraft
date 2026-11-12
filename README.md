# ScreenCraft

**Local-first visual screen designer and Figma interoperability workspace.**

ScreenCraft is a proposed Flask-backed, browser-based design tool for creating and editing desktop/mobile application screens locally, importing externally designed screens (especially Figma), and exporting reusable designs or application UI code. **Current state:** initial Phases 1–4 prototype code is under review in a feature branch; production deployment and browser acceptance remain outstanding.

## Product direction

- **Design locally first:** screen tree, drag/resize, properties, reusable components, layout rules, responsive previews, light/dark themes, and multi-screen projects.
- **Import:** portable JSON screen definitions; Figma API-derived JSON; evaluate native `.fig` file parsers and SVG as separately gated, provenance-preserving adapters. Imported fidelity and licensing must be tested with real samples.
- **Export:** JSON project package, static HTML/CSS, Flask/Jinja templates, and React UI stubs; generated output does not invent server-side business logic or security.
- **Desktop and mobile web:** breakpoint-aware canvas and browser previews with keyboard/accessibility checks.
- **Versioning:** human-readable project JSON and assets can live in Git and be reviewed like code.
- **Reusable foundation:** application shell, form, table, card, navigation, modal and status component libraries, plus optional Figma design handoff.

## Reference standards

Adopted from [Application-Standard](https://github.com/zageabb/Application-Standard), v1.0 baseline, as a **P3 design/AI-specialist web tool**; see [STANDARD_VERSION.md](STANDARD_VERSION.md). Existing Flask apps are an allowed profile, and a React/MUI/FastAPI rewrite is not a condition of adoption.

Start with [AGENTS.md](AGENTS.md), [DEVELOPMENT.md](DEVELOPMENT.md), [DID.md](DID.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/SCREEN_BUILDING_STANDARD.md](docs/SCREEN_BUILDING_STANDARD.md). The current project and its tests are the source of truth for implementation, not aspirational roadmap entries.

## Planned stack

Python Flask API and React/TypeScript editor. SQLAlchemy with PostgreSQL for multi-user project, asset and preview data; local SQLite for development/tests. .scraft ZIP is the portable application document. UI design tokens and optional light/dark modes. Figma must be optional: no Figma account is necessary to create, edit or preview a local screen.

## Status and use

Initial React/Flask editor, .scraft file handling, SQL-backed mock data and HTML preview exports are implemented in the development branch. **GitHub Actions tests do not constitute production acceptance.** See DEVELOPMENT.md for precise verified and pending items, and docs/DEPLOYMENT_UBUNTU.md for proposed server deployment.

The repository is public: no secrets, user/customer data, proprietary design assets, original private Figma files or copyrighted brand/screenshot material without authorisation.


## Standards adoption (proposed in PR)
ScreenCraft follows the [Application-Standard v1.0 policy](standards/Application_Design_Development_Standard_v1.0.md) as a P6 design-tool/P3 specialist editor, with a proposed Flask/JavaScript stack. See [STANDARD_VERSION.md](STANDARD_VERSION.md), [AGENTS.md](AGENTS.md), [DEVELOPMENT.md](DEVELOPMENT.md) and [DID.md](DID.md). UI work follows [Screen Building Standard](docs/SCREEN_BUILDING_STANDARD.md), [Screen QA](docs/SCREEN_QA_CHECKLIST.md) and [Screen Specification](templates/SCREEN_SPEC.md). [Architecture](docs/ARCHITECTURE.md), [Security](docs/SECURITY.md), [Test Strategy](docs/TEST_STRATEGY.md), [User Manual](docs/USER_MANUAL.md) and [Changelog](CHANGELOG.md) record project-specific requirements and actual evidence. The new CI workflow checks documentation only; this is **not** a verified executable application.

## Interactive application prototype proposal
The [new proposal](docs/INTERACTIVE_PROTOTYPE_PROPOSAL.md) extends the historical concept with an object gallery, drag-and-drop editor, scrollable nested layouts, configurable mock-only actions, PostgreSQL-backed multi-user preview datasets, portable `.scraft` ZIP documents (including image assets), application themes and **single-file interactive offline HTML export**. The first runnable milestone must work both directly and behind Ubuntu/Caddy at `/apps/screencraft/`. These are planned features; no code or production deployment is claimed.

## Prototype source and testing
The first implementation is reviewed through [ScreenCraft PR #3](https://github.com/zageabb/ScreenCraft/pull/3). Local API: `PYTHONPATH=backend python -m screencraft.api` after installing backend requirements and configuring `SCREENCRAFT_SECRET_KEY`, `DATABASE_URL`, and `SCREENCRAFT_SETUP_KEY`. Editor dev: `cd frontend && npm install && npm run dev`; production frontend: `npm run build`. CI: Python `pytest backend/tests`, TypeScript/Vite build and docs checks. Refer to `docs/DEPLOYMENT_UBUNTU.md` and `docs/USER_MANUAL.md`. No reverse-proxy or deployment steps have been executed by this conversation.

**Portable design format:** the [canonical .scraft specification](https://github.com/zageabb/Application-Standard/blob/main/standards/SCRAFT_FILE_FORMAT_v1.md) is maintained centrally in Application-Standard; this repo's spec path is only a pointer. Designs may be stored within each application repository under `design/screencraft/application.scraft`.
