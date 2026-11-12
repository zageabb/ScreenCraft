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
