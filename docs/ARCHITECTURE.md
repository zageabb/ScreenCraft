# ScreenCraft proposed architecture
**Planning only — no running backend/editor.**
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
