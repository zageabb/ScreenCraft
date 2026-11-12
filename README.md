# ScreenCraft

**Local-first visual screen designer and Figma interoperability workspace.**

ScreenCraft is a proposed Flask-backed, browser-based design tool for creating and editing desktop/mobile application screens locally, importing externally designed screens (especially Figma), and exporting reusable designs or application UI code. **Current state: documentation-first repository; no working editor or importer exists yet.**

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

Python Flask backend and JavaScript-based editor (evaluate libraries for canvas and structured editing before selecting). Local storage of project JSON, metadata and assets; migrations or a database only when justified. UI design tokens and optional light/dark modes. Figma must be optional: no Figma account is necessary to create, edit or preview a local screen.

## Status and use

Initial documentation and quality controls are being established. **Do not treat the sketches, import claims or export formats as implemented.** When the first prototype exists, this README will gain tested setup/run instructions and a user manual.

The repository is public: no secrets, user/customer data, proprietary design assets, original private Figma files or copyrighted brand/screenshot material without authorisation.


## Standards adoption (proposed in PR)
ScreenCraft follows the [Application-Standard v1.0 policy](standards/Application_Design_Development_Standard_v1.0.md) as a P6 design-tool/P3 specialist editor, with a proposed Flask/JavaScript stack. See [STANDARD_VERSION.md](STANDARD_VERSION.md), [AGENTS.md](AGENTS.md), [DEVELOPMENT.md](DEVELOPMENT.md) and [DID.md](DID.md). UI work follows [Screen Building Standard](docs/SCREEN_BUILDING_STANDARD.md), [Screen QA](docs/SCREEN_QA_CHECKLIST.md) and [Screen Specification](templates/SCREEN_SPEC.md). [Architecture](docs/ARCHITECTURE.md), [Security](docs/SECURITY.md), [Test Strategy](docs/TEST_STRATEGY.md), [User Manual](docs/USER_MANUAL.md) and [Changelog](CHANGELOG.md) record project-specific requirements and actual evidence. The new CI workflow checks documentation only; this is **not** a verified executable application.
