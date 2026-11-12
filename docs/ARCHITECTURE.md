# ScreenCraft proposed architecture
**Implementation in development:** Flask API, SQL store and React editor exist on feature branch; no live deployment acceptance yet.
```text
local UI / Figma JSON / SVG / possible .fig feasibility
            | import adapters
            v
Canonical versioned JSON project/screen model
       |               |              |
  browser editor   preview renderer   code exporters
       +---------------+--------------+
                       |
             Flask project/asset API
                       |
             Local JSON files and assets
```
Module boundaries: JSON model/schema and migrations; import adapters; asset validation/sanitisation; local project storage/atomic writes; editor command/undo system; responsive renderer; deterministic export targets; optional Figma/GitHub integrations.
Preserve editable hierarchy and source provenance; do not mistake Figma API dump for ScreenCraft project format. Unsupported effects become warnings. Generated UI code never invents business authorisation/persistence.
Security: no secrets in frontend or JSON; safe file paths, input/asset validation, no arbitrary remote fetches; Caddy/UDA prefix configurable with trusted proxy hops (LOCAL_UBUNTU_PROXY_COMPAT).
Test offline use and both direct / and /apps/screencraft/. See docs/TEST_STRATEGY.md.

## Proposed MVP architecture revision
- **Browser:** React/TypeScript editor and semantic HTML5/CSS DOM preview; independent designer/preview modes; responsive Flex/Grid plus optional freeform canvas, nested scroll and object gallery.
- **API:** Flask, authenticated projects/permissions, asset import/export, prototype data operations and project versions.
- **Database:** PostgreSQL for multi-user users/projects/project membership/revisions plus mock data schema and rows; SQLAlchemy/Alembic migrations. Preview data is either per-run seed-reset, per-session persisted or explicitly project-shared. Never use raw SQL from imported project documents.
- **Portable format:** .scraft ZIP with manifest, screen/component JSON, themes, sanitised mock seed data and hashed image assets. Never put secrets/runtime DB credentials/shared rows in archive by default.
- **Export:** a single self-contained HTML page supporting offline navigation, dropdowns, modal actions and in-memory table edits, with clear nonproduction behaviour. Separate from later React/Flask code export.
- **Hosting:** Ubuntu 24.04 / Caddy external path /apps/screencraft/ from first runnable release; validate local / and forwarded prefix, cookies, assets, API, uploads and access controls.
See docs/INTERACTIVE_PROTOTYPE_PROPOSAL.md for boundaries, acceptance gates, deployment notes and phase plan.
