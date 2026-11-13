# ScreenCraft user manual — early prototype
**State:** implementation in progress, backend tests and React build checked in GitHub Actions, no browser/server acceptance.
1. Start with a configured Flask+PostgreSQL backend and built React frontend. Open /apps/screencraft/ through your approved Caddy route, or / directly on a trusted local development host.
2. First use: enter setup key, choose an administrator username and long password; later sign in with provisioned accounts.
3. From Applications choose a name and Create application; Open a project to edit.
4. Drag an object type from Object Gallery onto the canvas (or click the gallery item). Select a node to edit its properties and overflow/size. Drag an object to move it; use Undo/Redo.
5. Add screens using + Screen. Configure button action = navigate and target screen to prototype navigation.
6. Toggle Design/Preview; in preview dropdowns and inputs operate and a button configured for add_mock_row changes the temporary table data. This is mock data only.
7. Use Theme to preview tokens; edit dark/light token data in the document format until a full token inspector is built.
8. Save the project, Download .scraft, or import a local .scraft file. Save checks project revision; a conflict requires a reload.
9. Export Interactive HTML for a self-contained, offline prototype with declarative actions and mock data. Export is not an executable production app.
10. Shared projects use project roles enforced on the server. An administrator can provision other users via the API; a full admin UI is pending.
11. GitHub remote design files: API supports approved repos configured server-side. Browse/download and creating a design PR need integration token; full UI connection controls are pending.

**Important limitations:** no Figma importer, live multi-cursor collaboration or SQL migration tooling yet. Check DEVELOPMENT.md before using on a live network.

## GitHub-linked application document
An administrator can configure `SCREENCRAFT_ALLOWED_REPOS` and an optional fine-grained `SCREENCRAFT_GITHUB_TOKEN` on the server. The project panel accepts a repository owner/name, path (default `design/screencraft/application.scraft`), and branch. Import Repo Design updates the current project revision; Create Design PR sends the current saved archive to a new branch and proposes a PR. The application never writes directly to a target repo's main branch. A real integration with an authorised target repository remains unverified.

## Image assets
Add an Image object to the canvas, select it and use the Image File property to upload PNG, JPEG, GIF or WebP. The backend stores the image in the .scraft ZIP and preview serves it only to project members. Save again after editing; export embeds packaged binary images into the standalone HTML prototype. Image upload and export have unit test coverage, while rendered browser fidelity still needs acceptance.

### GitHub access restriction
Until per-user OAuth and repository permissions are designed, only a ScreenCraft **server administrator** may use GitHub remote import and PR save-back through the shared configured GitHub token. Project Designer rights alone do not grant access to that token.

### Shared preview data
For project-shared SQL mock datasets the API enforces an expected revision and locks the edited row-set transactionally. If another user has changed it, reload the preview and retry instead of overwriting their changes.

## Editing table sample data
Select a Table in Design mode. In Properties > Table dataset, choose an existing dataset or click **Create sample dataset** for older table objects without one. Newly inserted tables start with a dedicated dataset, two example columns (Name and Status), and an example record so they are immediately visible. Under **Table sample data**, add/rename/remove columns and add/edit/remove sample rows. Changes appear on the canvas immediately; click **Save** to store them in the project and its .scraft ZIP document. Table sample data is separate from the **Sample action row (JSON)** field on a button, which defines what a button's Add Row prototype action inserts.

## Renaming screens
Select a screen from the **Screens** list on the left. In the right-hand **Screen** panel, edit **Screen name**, then press Enter or click outside the field to apply it. Click **Save** to retain the name in the application and `.scraft` document. The underlying screen ID does not change, so existing navigation buttons keep working. New screens receive distinct default names until renamed.

## UDA sign-in
When `SCREENCRAFT_AUTH_MODE=uda` is enabled by the administrator, users sign in through the normal UDA login and navigate to ScreenCraft. No secondary ScreenCraft password or password-reset flow is needed; use UDA to sign out. ScreenCraft continues to control access to individual application designs using project ownership and memberships. New UDA users can be invited to designs after they have first opened ScreenCraft and established an account. See docs/UDA_AUTHENTICATION.md for installation details.

## Phase 5 — Screen ordering and object management

**Reorder screens:** Use the up/down arrows in the left Screens list. Screen IDs and button navigation remain intact; Save persists the new order and standalone HTML uses it.

**Delete:** Select an object in the canvas or Layers. Choose Delete object at the top of right-hand Properties, or the small x at the right end of its Layers row. Deleting a container deletes its descendants; Undo restores the prior state. Existing Get started buttons are ordinary removable elements. New applications start with a blank Home screen.

**Preview:** The preview toolbar supplies Back and Home independently of the design, so empty screens never trap the user. Design exits preview.

**Nesting:** Add a card, container, grid, flex or toolbar and drag a gallery object into it, or set Parent container in the inspector. Circular parent references are rejected; child identity is stored in parent_id. Layout mode controls freeform, flow, grid and flex.

**Reusable components:** Select an object (including a nested subtree) and choose Save as reusable component. The template appears in the left sidebar and can be inserted as a fresh editable copy with new node IDs.

**Catalogue:** The grouped object gallery comes from a generated pinned snapshot of Application-Standard. Objects marked with a diamond are unsupported placeholders, not functional controls; their design JSON is preserved. To adopt a newer canonical catalogue, run scripts/sync_scraft_catalogue.py on the approved upstream JSON with its Git blob SHA, review and run tests. Do not maintain parallel object definitions in ScreenCraft.

## Deleting screens
Each entry in **Screens** (left sidebar) has up/down arrows followed by **× Delete screen** on the right. Click × and confirm to delete the screen and every object it contains. You cannot delete the last remaining screen. When removing the Home/entry screen, ScreenCraft automatically selects the next remaining screen as the entry screen. Buttons elsewhere that navigated to the deleted screen lose that invalid navigation action. Use **Undo** before saving to restore the screen; click **Save** to persist the deletion in the application and exported .scraft file.

## Phase 6: validating and importing portable .scraft designs

Open an application and choose **Import .scraft**. ScreenCraft first sends the file through a **read-only validation** endpoint. The inspector displays the document name, format version, screen count, packaged asset count and any warnings. **The current project is not changed at this stage.** Review compatibility warnings for unsupported extension objects or newer v1 features; unsupported objects are preserved as inert placeholders, not runnable behaviour.

Choose **Import validated design** to replace the current project design, or **Cancel import** to keep your current design. Invalid or unsafe archives cannot be approved. A concurrent project revision change can still reject import; reload and reconcile instead of overwriting other edits.

Validation covers screen IDs, screen order and initial screen, navigation actions, node hierarchy, dataset identifiers, asset paths and optional SHA-256 checksums, and rejects executable/unsupported actions, unsafe ZIP paths, malformed JSON, remote references and incompatible format major versions. Local JSON references within the ZIP are resolved into the portable application on import; when saved, the package uses a self-contained application.json.

This is a prototype interchange validator, not a virus scanner or a guarantee that all extension objects render fully. Test your imported design in Preview and review any warnings before distribution.

## Interactive HTML export parity — input fields to table records
When a button is configured with **Action: add_mock_row**, choose the destination dataset and select **Input source for [column]** for each destination column. Supported inputs are text, number, date, dropdown, checkbox and textarea. Fixed values remain available for columns without an input binding.

**Interactive HTML export now uses the same field bindings as ScreenCraft Preview.** Users can enter values into those controls and click Add Record; the exported standalone HTML app appends a record containing the current field values. Input values survive the table rerender after the new record is added. The standalone export stores mock data only in browser memory; refreshing the page returns to the seed data. No backend, database or internet connection is needed.

## Phase 9A: Advanced tables and editable grids

Add a **table** or **x-editable-grid** object from the Object Gallery. Both create their own sample dataset automatically. Use the right-hand **Properties > Table / grid behaviour** section to enable/disable **searchable**, **sortable**, and **selectable** controls, set **Page size** (0 displays all records) or filter a specific column by text. The **Table dataset** editor below these settings controls the field names and saved sample rows.

In **Preview**, tables support search, column-header sorting, fixed-column filters, pagination and optional row selection. Editable grids additionally permit inline cell changes, **+ Row**, and **Delete selected** for **seed-reset** datasets. Row selection and editing target original record indices even when the view is sorted, filtered or paginated. Preview updates are temporary; change the sample dataset in the right-side editor and Save to persist intended design seed data in .scraft.

Standalone **Interactive HTML** supports the same controls entirely offline using browser-memory mock data. Reloading the exported page restores packaged seed rows. No production database is updated, and session-persisted or project-shared preview datasets are not editable through the ScreenCraft inline grid until separately approved and implemented.

The **x-grid** object is a layout container for arranging objects; **x-editable-grid** is the spreadsheet-like data control.

## Phase 9B — Charts and KPIs

Add **x-kpi** or **x-chart** from the Data section of the Object Gallery. Select the new object and configure the **Data source** section in the right-hand Properties inspector. Choose a **Metric dataset** and an aggregation: Count, Sum, Average, Minimum or Maximum. For Sum/Average/Min/Max, choose a **Value column** containing numeric records; non-numeric values are ignored. Count measures the number of records regardless of the selected value column.

**x-kpi** can also show a fixed number when no dataset is selected. **x-chart** requires a dataset, a **Category column** and a Chart type of Bar, Line or Pie. Charts group records by category and display up to 30 categories. For pie charts, negative values contribute zero to slice sizes; bar/line support numerical values.

In Preview and the standalone Interactive HTML export, a chart or KPI uses the same mock dataset as tables and buttons. Adding a record to that dataset refreshes values when the prototype re-renders. HTML export runs entirely offline; no production database writes are made.

## Phase 9C — Tabs, wizards, accordions and layouts

The Object Gallery now contains working **tabs**, **x-wizard**, **x-accordion**, **x-sidebar** and **x-splitter** objects. All can be added and sized like other canvas objects.

For Tabs or Wizard, select the parent and set **Step labels (comma separated)** in the right-hand Properties panel (maximum 10). Drag child elements into the parent. Select a child and set **Assigned step** to choose which tab/step displays it in Preview. In Design all children remain visible for editing; in Preview switching tabs hides children assigned to other steps. The Wizard includes Next/Previous step buttons.

An Accordion opens and closes its child content in Preview. **Expanded initially** controls its default state. A Splitter exposes **Split width (%)** in Properties; Sidebar and Splitter act as two-area layout containers for nested objects. These are prototype-safe layout behaviours; no production routing or data access is added.

**Interactive HTML** reproduces the navigation/layout behaviours in a single offline file. Test exported designs with both tabs and nested input controls before publishing.

## Phase 9D — Required fields and validation

Select an input, dropdown, checkbox, date, number or textarea object in Design mode. The right-side **Input validation** section allows **Required**. Text and textarea controls additionally support **Minimum characters** and **Maximum characters**; number/date controls support **Minimum value** and **Maximum value**. Dropdown choices can be edited as one option per line.

These constraints are evaluated when an **add_mock_row** button binds a dataset column to that input in **Input source for [column]**. Clicking the button in Preview or standalone offline Interactive HTML checks the current values first. If required or value constraints fail, no row is added and a visible message explains the problem. Correct the field and click again. Unbound fixed row values still work as before.

This is an interactive design prototype: validation protects mock data demonstrations only and must not be treated as production security or database validation.

## Phase 9.1: Minimising containers and shared menus

**Minimise container:** Add a Container, Card, Grid, Flex, Toolbar, Sidebar or Splitter. Select it and use the right-hand **Collapse behaviour** settings: `Enable collapsible header` shows a chevron in Preview; `Initially expanded` sets its default. To control it with a different button, choose one of `toggle_container`, `collapse_container` or `expand_container` from the button's **Action** dropdown, then choose **Target container**. The entire subtree hides without being deleted, and your input values survive reopening.

**Shared application menu:** Open **Shared application navigation** at the top of the right-hand inspector and tick **Enabled**. The menu is stored once at application level and displayed across participating screens. Choose its left/right/top position, collapse settings and mobile initial state. Edit the ordered menu list with target screens, optional symbols, group nesting and screen-specific link visibility. Use **+ Menu item** to add links; menu edits propagate to all screens.

**Screen opt-out:** On a screen, select **Hide navigation on screen** to remove the shared menu there (for example, on a login or full-screen view). Saved .scraft and standalone HTML preserve the setting. The exported HTML includes Back/Home fallback controls, so a screen without the shared menu need not trap you.

This is mock navigation, not authorization; target applications must enforce their own permissions. For detailed field definitions and acceptance see `docs/PHASE_9_1.md`.

## Phase 9.2 — Record Detail linked to a selected table row

Choose **x-record-detail** under **Data** in the Object Gallery. If the current screen already has a table or editable grid with a dataset, the new detail panel links automatically. Otherwise select the panel and choose **Record detail settings > Linked dataset** and optionally a **Source table / grid**. Leaving the source blank allows selecting a row in any table or grid using that dataset.

Switch to **Preview** and click a table row. The detail panel immediately displays each dataset column from that row; choosing a different row updates it. Rows remain correctly linked when the table is sorted or filtered. Until a record is selected, the panel shows an instructional message instead of invented data.

For mock editing, enable **Allow mock editing** in Properties. The selected fields become editable, and changing them updates the same in-memory record used by tables and grids. Editing is enabled for `seed-reset` datasets only. Session-persisted and project-shared datasets are read-only within record detail. This is a prototype behaviour, not a database write.

**Interactive HTML** export supports the same selection and editing workflow entirely offline and does not contact the application server.

## Phase 9.3 — Time, radio, toggle, file selection and search

From the **Inputs** Object Gallery, add `x-time` for a browser-native HH:MM time selector, `x-radio` for mutually exclusive options, `x-toggle` for a Boolean on/off switch, `x-file-upload` for a filename-only file selector, or `x-search` for a search box. Use Properties to edit their labels, required settings, time minimum/maximum, radio choices (one per line) and accepted file extensions. For a search box, select **Filter table/grid** to link it to an existing table or editable grid on the same screen.

Preview and the exported Interactive HTML support the same user interactions and the current values can be bound into an Add Row button. The file selector is intentionally **not a file uploader**: only the selected filename is used as sample data, and the browser's file content is not uploaded or saved in the `.scraft` file. Both modes operate safely without external network dependencies.
