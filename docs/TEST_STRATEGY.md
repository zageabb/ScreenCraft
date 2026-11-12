# ScreenCraft test strategy
1. Baseline documentation checks in CI on push/PR.
2. Schema validation, migrations and JSON save/reopen round-trips.
3. Flask storage/API security: path traversal, upload sizes, atomic writes.
4. Editor unit/browser tests: layers, select, drag/resize, undo, preview.
5. Responsive/manual QA: 1440/1280/1024/768/390 CSS px, 200% zoom, keyboard, touch, WCAG 2.2 AA.
6. Figma JSON fixture import, unsupported node warnings; native .fig spike only if feasible.
7. HTML/Jinja/React export build/render and visual comparison.
8. Root and /apps/screencraft/ proxy, auth and cookie smoke tests.
CI evidence must include commit/run ID, exact command and result. Documentation-only CI is NOT runtime readiness.
