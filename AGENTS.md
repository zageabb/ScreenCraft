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
