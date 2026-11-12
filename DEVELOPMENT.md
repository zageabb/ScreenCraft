# ScreenCraft development register
**Status 2026-11-12:** Documentation-first. No working editor, importer, exporter or runtime CI evidence.
**Evidence rule:** Track implementation, local validation, CI, merge, deployment and user acceptance separately. Never mark documentation-only work as runtime complete.

| ID | Workstream | Status | First acceptance |
|---|---|---|---|
| SC-001 | Standards/governance/CI | IN_PROGRESS | Files present, CI green, review |
| SC-002 | Canonical JSON schema | PLANNED | Versioned round trip tests |
| SC-003 | Flask storage/project/asset API | PLANNED | Secure create/save/open/reopen |
| SC-004 | Visual editor | PLANNED | Layers, selection, move/resize, undo |
| SC-005 | Components and themes | PLANNED | Instances, overrides, design tokens |
| SC-006 | Desktop/mobile responsive preview | PLANNED | 1440/1280/1024/768/390 + 200% zoom |
| SC-007 | Figma API/JSON adapter | PLANNED | Approved fixture import and warnings |
| SC-008 | Native .fig parser feasibility | PLANNED | Licence/security/fidelity go-no-go |
| SC-009 | SVG/images/assets | PLANNED | Sanitised import/provenance |
| SC-010 | HTML/CSS/Jinja export | PLANNED | Generated output renders |
| SC-011 | React export | PLANNED | Generated components compile |
| SC-012 | Optional GitHub sync | PLANNED | Secure PR/diff/versioning |
| SC-013 | Accessibility/security/performance | PLANNED | Automated + manual evidence |
| SC-014 | User manual/release/deployment | PLANNED | Fresh clone + root/prefix tests |

## Standards adoption
- Source: zageabb/Application-Standard, proposed v1.0 baseline; profile P6 design tooling with P3 editor characteristics.
- Copied master standard, reusable screen/proxy/integration/reuse guidance, QA and templates.
- Adaptation: Flask plus JavaScript allowed; Figma optional; no private corporate screenshots or official brand token claims.
- Review and CI evidence pending on this branch. Documentation checks alone do not demonstrate a working editor.
- User manual: docs/USER_MANUAL.md records not yet released; update in every future user-visible feature change.
- Source discussion and feature details: docs/INITIAL_IDEA.md.
