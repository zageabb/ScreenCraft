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
