# ScreenCraft Portable Application Document — `.scraft` Format v1

**Specification ID:** SCRAFT-1  
**Status:** Initial interoperability specification (draft for implementers)  
**Version:** 1.0.0  
**Date:** 2026-11-12  
**Canonical file extension:** `.scraft`  
**Media type (provisional):** `application/vnd.screencraft+zip`  
**Maintained in:** `zageabb/ScreenCraft`

This is a *portable data interchange standard* for storing an entire visual application prototype as one file. A repository may store, version, open, inspect, generate and exchange `.scraft` files **without installing ScreenCraft**. No claim is made that a runtime implementation or parser already satisfies this draft.

## 1. Normative language and scope

**MUST** is mandatory for conformance; **SHOULD** is recommended; **MAY** is optional.

A `.scraft` document contains:
- Multiple named application screens, stable IDs, hierarchy and editable components
- Responsive layout, sizing, viewport configuration, scroll/overflow rules
- Reusable component definitions and visual themes
- Declarative *prototype-only* interactions (buttons, navigation, modals, table mock-row operations)
- Synthetic seed datasets and optional images/fonts/icons
- Document-level schema/version identifiers, provenance and optional Git repository linkage

It is **not** a production application or executable SQL database. It MUST NOT contain passwords, access tokens, database credentials, privileged business operations or hidden executable code.

## 2. Container / filesystem format

A `.scraft` file MUST be a ZIP archive containing UTF-8 JSON. File paths inside the ZIP MUST be forward-slash-separated relative paths. The archive MUST have `manifest.json` and `application.json` at its root.

```text
example.scraft                     (ZIP file)
├── manifest.json                  REQUIRED
├── application.json               REQUIRED
├── screens/
│   ├── home.json                  optional: split screen definitions
│   └── orders.json
├── components/
│   └── app-button.json            optional: reusable component definitions
├── themes/
│   ├── light.json                 optional: named theme definitions
│   └── dark.json
├── data/
│   └── customers.json             optional: synthetic seed dataset
└── assets/
    ├── logo.png                   optional: image references by path
    └── screenshot.jpg
```

**v1 interoperability rule:** `application.json` MUST include all screen and component structures *or* contain explicit `$ref` paths pointing to other JSON entries in this ZIP. Readers MUST resolve references within this archive only; remote `$ref` URLs are not allowed. A portable writer SHOULD produce a self-contained `application.json` for simple projects.

The ZIP MUST NOT contain executable scripts or arbitrary extra file types. Allowed asset types in v1: PNG, JPEG, WebP and GIF. SVG is an *optional extension* and readers MUST sanitize it or reject it. Implementations MAY extend approved formats only via explicit declared capabilities, and MUST report unsupported formats. Asset references MUST refer to entries under `assets/`.

## 3. Required manifest.json

```json
{
  "format": "screencraft",
  "format_version": "1.0.0",
  "document_id": "c0c7803e-112a-4dbe-9fdd-1a30d5e26c4d",
  "document_revision": 1,
  "name": "Customer Management",
  "entry": "application.json",
  "created_at": "2026-11-12T14:00:00Z",
  "updated_at": "2026-11-12T14:00:00Z",
  "generator": {
    "name": "ScreenCraft",
    "version": "0.1.0"
  },
  "source_repository": {
    "provider": "github",
    "repository": "zageabb/example-app",
    "path": "design/screens/example.scraft",
    "ref": "main"
  }
}
```

- `format` MUST equal `"screencraft"`.
- `format_version` MUST follow semantic versioning. A v1 reader MUST reject unsupported major versions rather than silently misinterpret them.
- `document_id` MUST be stable across revisions, preferably UUIDv4.
- `document_revision` MUST be a positive integer incremented for each saved revision.
- `entry` MUST be `application.json` in v1.
- Timestamps MUST use ISO 8601/RFC 3339 UTC.
- `source_repository` is OPTIONAL descriptive provenance, never an authentication mechanism. It MUST NOT contain tokens, credentials, embedded HTTP basic auth or signed URLs.
- `generator` and `source_repository` MAY be absent; the other illustrated fields are required.
- File names are case-sensitive. Unknown JSON properties MAY be preserved for round-trip compatibility, but MUST NOT be executed.

## 4. Required application.json

```json
{
  "application_id": "customer-management",
  "name": "Customer Management",
  "start_screen": "home",
  "default_theme": "light",
  "screen_order": ["home", "customers"],
  "screens": [
    {
      "id": "home",
      "name": "Home",
      "viewport": {"width": 1280, "height": 800},
      "layout": {"mode": "freeform", "overflow_x": "auto", "overflow_y": "auto"},
      "nodes": [
        {
          "id": "welcome",
          "type": "text",
          "parent_id": null,
          "props": {"text": "Welcome"},
          "layout": {"x": 24, "y": 24, "width": 320, "height": 48},
          "style": {"color_token": "text.primary"}
        },
        {
          "id": "open-customers",
          "type": "button",
          "parent_id": null,
          "props": {"label": "Customers"},
          "layout": {"x": 24, "y": 90, "width": 160, "height": 44},
          "action": {"type": "navigate", "target_screen": "customers"}
        }
      ]
    },
    {
      "id": "customers",
      "name": "Customers",
      "viewport": {"width": 1280, "height": 800},
      "layout": {"mode": "flow", "overflow_x": "auto", "overflow_y": "auto"},
      "nodes": [
        {
          "id": "customer-table",
          "type": "table",
          "parent_id": null,
          "props": {"label": "Customers", "dataset_id": "customer-seed"},
          "layout": {"width": "fill", "max_height": 450, "overflow_x": "auto", "overflow_y": "auto"}
        },
        {
          "id": "add-customer",
          "type": "button",
          "parent_id": null,
          "props": {"label": "Add sample customer"},
          "action": {"type": "add_mock_row", "dataset_id": "customer-seed", "values": {"Name": "New customer", "Status": "Draft"}}
        }
      ]
    }
  ],
  "components": [],
  "themes": {
    "light": {
      "tokens": {
        "surface.default": "#FFFFFF",
        "text.primary": "#172033",
        "action.primary": "#2563EB",
        "spacing.medium": "8px"
      }
    }
  },
  "datasets": [
    {
      "id": "customer-seed",
      "columns": [
        {"id": "Name", "type": "text"},
        {"id": "Status", "type": "text"}
      ],
      "rows": [{"Name": "Example Ltd", "Status": "Active"}],
      "persistence": "seed-reset"
    }
  ],
  "assets": []
}
```

### General validation

- `application_id`, `start_screen`, screen IDs, node IDs, dataset IDs and component IDs MUST be nonempty strings.
- Each screen ID MUST be unique within its application; each node ID MUST be unique within its screen.
- `start_screen` and all navigation targets MUST resolve to a declared screen.
- `screen_order` MUST list every screen ID exactly once.
- `viewport.width` and `viewport.height` MUST be positive integers in CSS pixels.
- Node `type` MUST match a supported component type. Unknown node types SHOULD be preserved as placeholders with a visible import warning, not silently removed.
- `parent_id` null means a root node; otherwise it MUST resolve to a node in the same screen with no parent-cycle.
- `props`, `layout`, `style`, `action` and `bindings` are optional objects; absent values use component defaults.
- Inline `themes` and `datasets` in application.json are the simplest v1 form. For larger projects, references to `themes/*.json`, `data/*.json` etc. are allowed under §2.

## 5. Standard component types

An interoperable v1 reader SHOULD support the following types:

| Type | Required visual purpose |
|---|---|
| `text` | Label, heading, body text |
| `button` | Clickable action or screen navigation |
| `input` | Editable plain text / numeric field |
| `select` | Native or accessible dropdown |
| `checkbox` | Toggleable boolean control |
| `table` | Mock dataset table, sorting/filtering and overflow where configured |
| `image` | Image from packaged assets |
| `container` | Nested layout, clipping and scrolling |
| `tabs` | Selection between sections |
| `modal` | Configurable dialog with show/hide behaviour |

Additional types such as `chart`, `date`, `radio` and `accordion` MAY be represented using an extension prefix (`x-`) until formally standardized. Readers MUST not silently render unsupported types as working controls.

## 6. Layout, sizing, scrolling and responsive rules

Layout properties are expressed in CSS pixels unless a CSS-like sizing keyword is supplied:
- `mode`: `freeform`, `flow`, `flex`, `grid`.
- Sizes: numeric fixed pixels or `"fill"`, `"hug"`; optional `min_width`, `max_width`, `min_height`, `max_height`.
- Overflow: `overflow_x` and `overflow_y` each `"visible"`, `"hidden"`, `"auto"`, `"scroll"`.
- Freeform mode uses `x`, `y`, `width`, `height`; flow/flex/grid layouts use order, gap, padding, alignment and constraints.
- Responsive overrides MAY be supplied as `"responsive": [{"min_width": 0, "max_width": 767, "layout": {"width": "fill"}}]`.
- A screen's configured viewport DOES NOT bound its document content. Screens and containers MUST be able to overflow and scroll.
- Editor canvas pan/zoom MUST be separate from prototype inner-element scrolling.

## 7. Declarative prototype interactions

Only prototype-safe actions are permitted. Standard v1 action types:

| Action | Arguments | Expected behaviour |
|---|---|---|
| `navigate` | `target_screen` | Switch current screen |
| `back` | none | Return to previous screen |
| `show_modal` | `target_node` | Open declared modal |
| `close_modal` | `target_node` | Close declared modal |
| `toggle_visibility` | `target_node` | Toggle node's displayed state |
| `set_mock_field` | `dataset_id`, row/field/value | Modify preview-only record |
| `add_mock_row` | `dataset_id`, `values` | Append one mock record |
| `delete_mock_row` | `dataset_id`, row id | Remove mock record |
| `message` | `text` | Show a temporary preview message |

A document MUST NOT embed arbitrary JavaScript, SQL, Python, network requests or URL callbacks as actions. An unsupported action MUST be disabled with a visible warning.

## 8. Prototype data vs SQL-hosted collaborative data

`.scraft` packages contain only **synthetic, sanitized seed data and schemas**. They MUST NOT contain SQL database dumps, live preview sessions, user passwords or real application customer data by default.

The host application MAY persist prototype data in PostgreSQL for multi-user work:
- `seed-reset`: per-preview isolated in-memory data, default
- `session-persisted`: separate authenticated preview session per user
- `project-shared`: explicit project-authorised shared mock dataset

In the ZIP, `datasets[].persistence` declares *desired prototype semantics*, not a guaranteed server capability. Standalone HTML exports MUST fall back to in-memory data unless the user explicitly chooses a safe local persistence mode. SQL table names/queries and credentials MUST never be taken directly from a `.scraft` document and executed.

## 9. Asset packaging and references

Assets SHOULD be addressed by an internal path (e.g. `assets/logo.png`), not a local filesystem path or authenticated URL.

Example reference:
```json
{
  "id": "logo",
  "path": "assets/logo.png",
  "media_type": "image/png",
  "sha256": "<lowercase-hex-asset-sha256>"
}
```

Every declared asset MUST exist in the ZIP, be within a configured maximum size and match its declared media type. Readers SHOULD verify checksums if supplied. Asset entries MUST be treated as untrusted input and never executed.

## 10. GitHub / other-repository storage

The same `.scraft` format MUST work in **any application repository**, not just `ScreenCraft`. Recommended layout:

```text
my-application-repo/
  design/
    screencraft/
      application.scraft
      README.md                  (optional handoff and version info)
```

Tools MAY read or write the document from GitHub, GitLab, a local Git checkout or filesystem. For GitHub, use repository owner/name + branch/ref + path and the API's commit SHA/version checks. Writers SHOULD create a branch and PR instead of directly overwriting the default branch, and MUST obtain explicit authorization for modifying another repository. The optional `manifest.source_repository` field is informational only and must not grant access or control sync. Git credentials remain in the host's secure credential store, never in the archive.

For reviewable Git diffs, a tool MAY unpack the archive into an additional `design/screencraft/source/` tree, but the `.scraft` file is the portable deliverable; unpacked files should remain semantically consistent with it. CI SHOULD validate the manifest, references, assets and supported schema against the standard.

## 11. Security limits and conformance

Readers MUST:
1. Refuse absolute paths, `..` traversal, backslashes-as-paths, symbolic links and duplicate archive names.
2. Enforce limits on compressed size, expanded size, number of entries, JSON nesting and asset dimensions.
3. Parse JSON as data, sanitize text/HTML and unsafe SVG, and never run embedded code.
4. Validate screen/node identifiers, references, data columns, asset paths and action types.
5. Preserve unknown future metadata where possible, but never execute unsupported semantics.
6. Keep server authentication, permissions and SQL persistence outside the document.

Suggested baseline limits (implementations MAY be stricter): 25 MiB compressed file, 100 MiB total expanded content, 1,000 files, 100 screens, 500 nodes per screen, 1,000 seed rows per dataset. An implementation SHOULD declare its enforced limits and give readable errors.

`format_version` changes:
- Major: incompatible structure or semantics
- Minor: backward-compatible additions
- Patch: clarification/validation corrections
Readers MUST check the major version and SHOULD report unsupported minor features. Save/reopen round trips SHOULD retain stable IDs and asset references.

## 12. Implementation checklist for any existing repository

- [ ] Store a `.scraft` ZIP at `design/screencraft/application.scraft`.
- [ ] Write and validate `manifest.json` and `application.json` using this v1 contract.
- [ ] Use stable screen/node IDs and relative asset paths.
- [ ] Package approved image assets and declared mock-only seed data.
- [ ] Validate ZIP paths, size, MIME signatures, schema and cross-references on import.
- [ ] Track schema version and provenance; never bundle GitHub or DB credentials.
- [ ] Ensure design/export previews treat actions as visual-only, never production operations.
- [ ] Optionally add a CI format validator and unpacked JSON for readable diffs.

## 13. Evolution and implementation caveats

This specification is a **first common format** so existing repositories can create compatible design artifacts now. ScreenCraft itself is still under development; not every feature in this document is yet supported by a working editor/importer. Before declaring a parser/converter conformant, validate with at least a two-screen project, an image asset, a dark/light theme, a scrollable table and a navigation plus mock Add Record action.

Any deliberate schema departure SHOULD be documented in the adopting repository. Future revisions should include machine-readable JSON Schema files and executable conformance fixtures, while retaining support for older major versions when practical.
