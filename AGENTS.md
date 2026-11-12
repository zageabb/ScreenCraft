# ScreenCraft — AI/developer instructions
Read README.md, DEVELOPMENT.md, DID.md, STANDARD_VERSION.md and docs/ARCHITECTURE.md before changes. The master policy is standards/Application_Design_Development_Standard_v1.0.md.
- Evidence is mandatory: separate docs, implementation, tests, GitHub CI, deployment and user acceptance. Never call an untested feature complete.
- Keep DEVELOPMENT.md, DID.md/ADR and CHANGELOG.md accurate. Update docs/USER_MANUAL.md in the same change as user-visible behaviour.
- Green relevant CI required before routine merge.
- Before UI changes read docs/SCREEN_BUILDING_STANDARD.md, docs/SCREEN_QA_CHECKLIST.md, docs/DESIGN_SYSTEM.md; use templates/SCREEN_SPEC.md and templates/FIGMA_HANDOFF.md.
- Test desktop/mobile 1440/1280/1024/768/390 CSS px and 200% zoom; keyboard focus and WCAG 2.2 AA targets.
- Local-first is mandatory; editor, save, preview and export must work without Figma/GitHub. Canonical versioned JSON is source of truth; external adapters preserve original IDs, metadata and conversion warnings.
- Native .fig parsing is unverified research, not an established feature.
- Flask/JavaScript specialist design editor is permitted as profile P6/P3. Isolate editor, validation, storage, import, rendering and export modules.
- Code generation is frontend-only until actual business logic is implemented.
- Do not publish confidential assets, private Figma files, corporate screenshots, credentials or real user data (this repo is public).
- Verify library licences, security and compatibility. Prefer reviewed shared capabilities; do not copy private source into public repo.
- Optional integrations must distinguish not_configured from valid empty results.
- Support root / and configured /apps/screencraft/ via controlled proxy. Use LOCAL_UBUNTU_PROXY_COMPAT markers and test forwarded-header trust.
- Never deploy, expose a service, activate paid integrations or modify credentials without explicit approval.

## Interactive prototype approved direction (2026-11-12)
Read docs/INTERACTIVE_PROTOTYPE_PROPOSAL.md before implementing editor, data store or deployment. First runnable version must be Ubuntu/Caddy /apps/screencraft/ compatible; single .scraft ZIP packages include images; SQL-backed mock data must have explicitly isolated and shared preview modes; standalone one-file interactive HTML export must work offline and never claim production database behaviour.

## Mandatory interactive HTML export parity

**Every editor or Preview behaviour change MUST be checked against the standalone interactive HTML exporter in the same pull request.** Keep `backend/screencraft/export.py` and its offline browser tests in sync whenever changing object properties, data types, input controls, action bindings, dataset columns/rows, navigation, modals, themes or responsive layout.

- The standalone HTML must behave equivalently for supported prototype-safe interactions, including `add_mock_row` with `field_bindings` that read the current values of text/number/date/select/checkbox/textarea inputs.
- Preserve the published `.scraft` action schema; avoid duplicate incompatible binding formats. Static `action.values` are defaults, and bound input values override the respective dataset columns at click time.
- Export must remain a **single self-contained offline HTML file** with no network dependencies or production data mutations. Mock table changes must be in-memory only.
- Add or update automated tests that **open the actual generated export in a browser** and exercise the changed behaviour, not just check for JavaScript source strings. Compare the result with editor Preview where relevant.
- A feature is not complete if it works in ScreenCraft Preview but fails after Interactive HTML export. Document any intentionally unsupported feature as a visible limitation and keep the export safe.
