# ScreenCraft — Initial Idea and Conversation Record

**Origin:** ChatGPT discussion, 12 November 2026  
**Repository:** [zageabb/ScreenCraft](https://github.com/zageabb/ScreenCraft)  
**Project name chosen by user:** **ScreenCraft**  
**Document status:** Captured concept and planning notes, **not evidence of implemented functionality**  
**Scope:** The ScreenCraft-specific part of the conversation, including the preceding Figma/LedgerOne design and backup discussion that gave rise to the idea.

> This is a structured reconstruction of the discussion visible in this chat, not a verbatim export of the entire conversation. User decisions and requests are distinguished from assistant proposals and unverified third-party options.

## 1. How the idea started

The discussion started while designing a complete rebuild of LedgerOne's screens in Figma. The requested scope included:

- All major desktop workflows: dashboard, Home/Apprentice mode, sales, purchases, customer and supplier management, order entry, invoices, banking, ledger, reports, VAT, audit, AI and administration.
- Sales orders grouped or assigned by **salesperson**, and purchase orders by **buyer**; available people should come dynamically from organisation membership and security permissions rather than hard-coded lists.
- A **mobile-browser** option, not a separate native mobile app.
- Reusable design patterns, light/dark possibilities, responsive screens, and the conventions from the user's standard application template.

A Figma file named **LedgerOne — Complete Application Rebuild UX** was created:
https://www.figma.com/design/DBM9Y9up2Tu0SaoWyucPkY

The creation session reported **35 desktop** and **12 mobile-browser** first-pass screens. These are reference designs, not complete interactive or implementation-verified screens.

The user then asked whether the Figma work could be downloaded and copied into GitHub. The discussion established an important distinction:

1. Native Figma `.fig` files are proprietary and not equivalent to ordinary JSON.
2. Figma's connector supports reading file structure and rendering/exporting certain assets, but **a native `.fig` download was not available through the connected tools used**.
3. A portable scene JSON can preserve a selected subset of information such as hierarchy, frames, text, positions, dimensions and colours.
4. An attempted complete JSON export from Figma hit the Figma Starter-plan tool-call limit. **Do not claim the 47-screen JSON archive was completed or saved in GitHub.**

This limitation led to the idea of developing and storing screen designs **locally first**, instead of requiring Figma as the primary editor.

## 2. User's core product direction

The user clarified the intended workflow:

> “i was thinking we could develop screens locally, but if something was designed in figma we could import it.”

This is the controlling design requirement.

**ScreenCraft should be an independently useful, local-first browser application for visually designing application screens.** A Figma design can be imported when available, and developers can continue editing the imported result locally. Figma must not be required to create, edit, save or preview local designs.

Other user requests and decisions in the discussion:

> “question: is it possible to take that json export and have a local app read it and show the screen design ?”

> “Are you able to read a figma file if provided ?”

> “are there any python compatible libraries which can read figma files directly”

> “what would we call this app ?”

> “ive gone with ScreenCraft. Add in all the development ideas and also the standards from standard_template too”

> “repo created”

The final selected product name is **ScreenCraft**, replacing the earlier assistant-suggested name **ScreenBridge**.

## 3. Desired end-to-end workflow

```text
                      ScreenCraft (local-first)
                   ┌──────────────────────────┐
Local creation ───► │  Visual screen designer  │
                   │  Components / properties │
Figma JSON/API ───►│  Canonical screen model  │
                   │  Desktop/mobile previews │
Figma .fig* ──────►│  Projects and versioning  │
                   │  Code / JSON export      │
SVG / assets ─────►│                          │
                   └────────────┬─────────────┘
                                │
                   ┌────────────┼─────────────┐
                   ▼            ▼             ▼
                JSON/Git    HTML/CSS      Flask/Jinja
                                          or React UI

* Native .fig import is a research/prototype objective, NOT guaranteed.
```

The local designer should allow a team to:

1. Create a new project and screen without an external design service.
2. Build the screen visually using reusable components.
3. Save a human-readable, versioned project representation locally.
4. Import a compatible external design, especially Figma API JSON and potentially native `.fig` files.
5. Keep editing imported layers, components and responsive layouts.
6. Preview the design in desktop and mobile-browser widths.
7. Export the layout and components to frontend code while keeping application behaviour, permissions, database updates and business rules explicit implementation tasks.
8. Commit screen definitions and reviewed assets to GitHub alongside application development.

## 4. Suggested visual editor

The assistant proposed a workspace with:

- **Left-hand screen/layer panel:** projects, screen list, component hierarchy/tree, visibility, selection and ordering.
- **Central design canvas:** place, select, move and resize objects; pan/zoom; alignment and guides; desktop/tablet/mobile preview sizes.
- **Right-hand property inspector:** selected component's text, dimensions, position, spacing, layout, styling, visibility, binding names and responsive rules.
- **Top toolbar:** new screen, undo/redo, preview mode, viewport/theme changes, import, export and save.
- **Component palette:** application shell, navigation, headers, buttons, input fields, tables, cards, badges, dialogs, tabs, charts and specialist containers.
- **Preview:** inspect a screen as it would appear in a browser, with clearly specified mock interactions or links.

The visual editor should support nested frames/containers and reusable components. Imported Figma components should map to local reusable components where reasonable, rather than always becoming thousands of unrelated rectangles and text objects.

**Important:** the workspace layout was a proposed concept, not a final approved screen design.

## 5. Core data model

The central architectural proposal was to define a **tool-neutral canonical JSON screen model**.

It should describe (as appropriate):

- Project, screen, component and node IDs; schema version and migration history.
- Parent-child hierarchy, order, groups and reusable component/instance references.
- Text and typography, dimensions, position, alignment, padding, auto-layout constraints, transforms and visible/hidden state.
- Semantic design tokens and light/dark themes.
- Responsive breakpoints, constraints and desktop/mobile behaviour.
- Appearance: fills, borders, radii, shadows, icons, images, SVG and external asset references.
- UI states and interactions such as disabled, loading, empty, error, selected, hover, save and navigation.
- Future code-generation hints, intended framework/target and data-binding placeholders.
- Source provenance: whether a node was made locally or imported from Figma; original identifiers, source file/version, conversion warnings and unsupported features.

The JSON **must not be merely a Figma API dump** or coupled to a particular JavaScript canvas library. Use import adapters to convert external formats to the canonical model and renderers/exporters to convert it to previews or code.

Preserve original imported metadata when practicable so that conversions can be inspected and re-imported. Any import/export loss of fidelity must be made visible.

## 6. Import routes discussed

| Source | Intent | Notes / confidence |
|---|---|---|
| ScreenCraft project JSON | Primary local format | Required first; should support versioned round-trip save/reopen |
| Figma API-derived JSON | Import design hierarchy and properties | Planned; requires mapping and optional Figma access |
| Native Figma `.fig` | Upload a native file and import it offline | **Research needed**; proprietary format, parser coverage uncertain |
| SVG | Import vectors and potentially editable graphical structures | Feasible in principle; structure and behaviour differ from original components |
| PNG/JPEG | Visual reference and potential manual recreation | Cannot reconstruct original component tree reliably |
| Figma URL | Optional connected import through API/authorised access | Must handle permissions, credentials, rate limits, privacy and change tracking |
| ScreenCraft JSON from GitHub | Version-controlled import / restore | Planned |

### Native `.fig` reading and Python libraries

The conversation considered potential tooling:

- **fig-kiwi** — a Python/Kiwi decoding candidate.
- **FigmaPy** — Figma REST API wrapper; not a local native `.fig` parser.
- **figma-extractor** — suggested as a candidate; **actual package existence, API, format support, licensing and maintenance must be independently verified before use**.
- **openfig-core** — suggested as a JavaScript native format reader candidate; **actual availability, compatibility, supported formats, licensing and maintenance must be verified**.

These were **research leads, not accepted or installed dependencies**. The earlier discussion included stronger capability claims than can safely be relied on without hands-on testing. Run a technical spike using lawful, representative `.fig` samples before committing to a parser.

An import acceptance test should cover deeply nested frames, text/fonts, auto-layout, constraints, components/variants, variables, icons/images, assets, colours, transformations, unsupported effects, and editability after import.

## 7. Editing and rendering features proposed

### Initial editor
- Project and screen browser with screen add/delete/rename/duplicate.
- Drag, select, move, resize, rotate where supported, arrange, duplicate, delete.
- Nested layers; group/ungroup; undo/redo; snapping, alignment, guides, zoom and pan.
- Buttons, inputs, labels, cards, tables, frames, nav bars, tabs, modals and responsive containers.
- Properties for positioning, size, typography, colour, borders, padding/gaps, constraints and component variants.
- Local save/reopen, autosave/recovery strategy and JSON export/import.

### Advanced editor
- Component library; local components and instances/overrides.
- Light/dark themes using semantic design tokens.
- Desktop/tablet/mobile viewports; responsive breakpoints; mobile-browser preview.
- Layout rules and CSS-compatible auto-layout mappings.
- Interaction map and navigation linking; states for loading, error, empty, disabled, read-only and permissions.
- Accessibility checking, keyboard/focus behaviour and zoom/readability review.
- Assets and fonts handling with provenance, licences and safe loading.
- Screenshot comparisons to an original Figma design where permitted.

## 8. Code generation and application integration

The discussion proposed these export targets, in stages:

1. ScreenCraft's own portable JSON.
2. Standalone HTML/CSS preview.
3. Flask/Jinja templates for Python web projects.
4. React components.
5. Future integration with application repositories such as LedgerOne, QueryBridge and TAIJU.

Generated code should favour reusable layout/components, semantic CSS tokens and a readable file structure. It should be a **frontend starting point**, not an unsupported claim to have implemented business logic, persistence, account permissions or accounting calculations.

Generated screen hooks may describe intended data bindings and actions, but connecting them to real services is an explicit follow-up engineering task.

## 9. Proposed technical approach

- **Backend:** Python with Flask (preferred in the discussion).
- **Editor:** JavaScript/browser UI; canvas/editor framework remains to be evaluated.
- **Persistence:** local JSON project files and a managed assets directory first; add a database only if project/versioning/collaboration needs justify it.
- **Module boundaries:** models/schema, validator/migrations, import adapters, asset handlers, rendering engine, editor commands, export/code generation, project storage, optional GitHub/Figma integration.
- **Hosting:** local development first; optionally Ubuntu/UDA/Caddy reverse proxy under `/apps/screencraft/`, preserving root deployment when appropriate.
- **Offline use:** do not require Figma, cloud services or live connectors for routine design, editing and preview.
- **GitHub:** repository `zageabb/ScreenCraft`, with development documentation and source tracked in version control.

Do not treat framework names proposed here as final library selections. Choose dependencies after evaluating API compatibility, licensing, editability, performance, bundle size, maintenance and automated testing.

## 10. Standards to adopt

The user requested adoption of the existing **standard_template** conventions. The accessible reference repository was identified as [zageabb/Application-Standard](https://github.com/zageabb/Application-Standard) (private), whose master standard is *Application Design & Development Standard v1.0*.

ScreenCraft should adopt the standard's applicable rules, particularly:

- Root `README.md`, `AGENTS.md`, `DEVELOPMENT.md`, `DID.md`, `STANDARD_VERSION.md`, `CHANGELOG.md`, CI workflow and PR template.
- Documented architecture, technical decisions/ADR, exceptions, security, library dependencies, integrations, deployment, tests and acceptance evidence.
- Screen design system, reusable components, screen specifications, Figma handoff, semantic tokens and screen QA checklist.
- Keyboard accessibility, mobile responsiveness, 200% zoom, states, responsive breakpoints and light/dark modes.
- Shared-capability reuse evaluation before duplicating working code; approved, pinned dependencies and license reviews.
- Clear local/UDA reverse-proxy compatibility and strictly trusted forwarding; no hard-coded hostnames/secrets.
- Same-change user-manual updates for user-visible workflows.
- Green CI before routine merge; distinguish code completion, tests, CI, deployment and user acceptance.
- No private/corporate screenshots or confidential data in the public repository.

ScreenCraft is a **P3 specialist design application**; the standard allows justified specialist UI technology rather than requiring a wholesale React/MUI/FastAPI stack.

## 11. Proposed initial development streams

These are *planned*, not completed:

| ID | Workstream | First acceptance gate |
|---|---|---|
| SC-001 | Repository standards and development governance | Docs, CI and checklists established |
| SC-002 | Canonical, versioned JSON schema | Sample documents validate and round-trip |
| SC-003 | Flask project/asset API and local storage | Create/open/save/reopen projects safely |
| SC-004 | Browser-based visual editor | Editing of a representative screen is usable |
| SC-005 | Reusable components, properties and design tokens | Instance/component changes and overrides work |
| SC-006 | Responsive desktop/mobile preview and themes | Representative 390/768/1280/1440px checks |
| SC-007 | Figma API/JSON import | Real design imports with documented conversion coverage |
| SC-008 | Native `.fig` parser feasibility spike | Parser/license/fidelity test report; go/no-go |
| SC-009 | SVG/images/assets import | Asset provenance and safe rendering verified |
| SC-010 | HTML/CSS/Flask-Jinja export | Generated pages render and match a local preview |
| SC-011 | React export | Generated components compile and render |
| SC-012 | GitHub project sync/versioning | Safe commits/PR workflow with no secret exposure |
| SC-013 | Accessibility, security and performance | Automated and manual QA evidence |
| SC-014 | User manual, examples and release/deploy procedure | Fresh-clone install and local/UDA test evidence |

**Suggested build sequence:** standards → canonical JSON → Flask project storage → local editor and preview → components and responsiveness → Figma JSON import → native `.fig` spike → code generation → GitHub sync and deployment. Research can be parallel, but avoid letting an unreliable `.fig` parser block the usable local editor.

## 12. Key principles to keep

1. **Local-first is non-negotiable.** Figma is an input/output integration, not the application's foundation.
2. **Build once, render many.** One canonical scene model feeds the editor, mobile previews and code generators.
3. **Preserve editability.** Imported designs should retain meaningful layers/components, not just a raster screenshot.
4. **Declare fidelity limits.** Unsupported native Figma features must not silently disappear.
5. **Reusable screens and components.** The application should produce maintainable design/code artifacts, not opaque absolute-positioned mockups by default.
6. **No fabricated application behaviour.** Designs represent UI intent; generated business logic and security are separate engineering tasks.
7. **No unverified third-party claims.** Native `.fig` support is a feasibility target until demonstrated.
8. **Keep documentation and CI truthful.** Planning, implemented features, green tests, merged code, manual acceptance and live hosting are separate states.

## 13. Summary of decisions versus proposals

**User-chosen / explicit intent:** name **ScreenCraft**; repository created; development of screens locally; ability to import Figma-created designs; investigate reading Figma files directly; include ideas and standards in project documentation.

**Assistant-proposed, awaiting implementation/product validation:** Flask+JavaScript implementation, screen canvas layout, JSON schema, component model, specific export targets, native Figma importer, library choices, GitHub sync features, exact UX workflows and phase order.

**Existing external reference:** LedgerOne Figma design linked above. It can serve as an authorised *reference* for ScreenCraft import tests, subject to access and separate sample-data/asset review; it is **not currently a committed, complete JSON import fixture**.

---

*This document records the initial idea from the conversation so it remains available in source control as ScreenCraft evolves. Record subsequent changes in `DEVELOPMENT.md`, decision records and the changelog, rather than silently rewriting the original proposal.*
