# ScreenCraft — Ubuntu 24.04 + Caddy deployment guide
**Status:** proposed config. Deployment is handled outside this development session; not verified on the live server.

## Requirements
Docker Engine with Compose plugin, Caddy already serving UDA /apps/* paths. Database passwords, Flask secret and setup key must be generated on your server. Keep repo private design files out of public repos.

## Installation
1. Clone ScreenCraft and configure `deploy/.env` from `.env.example` (or provide secrets through your preferred environment manager). Do not store secrets in Git.
2. From `deploy/`, run `docker compose --env-file ../.env up -d --build` if the environment file is stored at project root. Ensure the file is in the Compose working environment; inspect with `docker compose config` without publishing the secret-filled output.
3. Test `curl -I http://127.0.0.1:8085/` and `curl http://127.0.0.1:8085/api/health`; expect a built UI and status ok.
4. Add the route from `deploy/Caddyfile.example` into your existing authenticated Caddy site without altering other applications. Apply the existing access policy, reload Caddy through your normal server change process.
5. Test `https://YOUR_HOST/apps/screencraft/`, `/apps/screencraft/api/health`, login, images, project save/download, browser reload, and cookie scope under the prefix.
6. One-time setup: the first browser setup form requires `SCREENCRAFT_SETUP_KEY`; choose a 12+ character password. Remove/rotate setup key once admin created.

## Prefix and security
The Caddy `handle_path` strips the external prefix and sets `X-Forwarded-Prefix`. `SCREENCRAFT_TRUST_PROXY=1` enables Flask ProxyFix with exactly one trusted hop. Port 8085 must remain bound to loopback or an isolated network. Block untrusted direct clients from spoofing forwarded headers. Caddy ingress authentication is not a substitute for the app's own project ACL. The Flask session cookie name is `screencraft_session`; use HTTPS Secure, HttpOnly and SameSite.
Ensure path-scoped cookie routing and CSRF checks before broad access; see docs/SECURITY.md.

## Persistence, backups and upgrades
PostgreSQL `screencraft-postgres` volume holds projects, packed .scraft blobs, users and mock data. Back up the database volume regularly; test restore. Alembic revision 0001_initial now defines the baseline schema; Docker starts by applying `alembic -c backend/alembic.ini upgrade head`. PostgreSQL upgrade/rollback against the real Ubuntu database is NOT yet validated; back up before changes. To upgrade: take backup, test schema changes against copy, build/restart with rollback image available.

## GitHub integration
Optional. Set `SCREENCRAFT_ALLOWED_REPOS` (comma-separated owner/repo) to explicitly permitted repos and use a fine-grained token with Contents read/write and Pull Requests write for those repositories. Never put token into a .scraft package or frontend. Opening/saving other repos must honor the allowlist. The GitHub write path opens a branch and PR, never silently commits to main.

## Verification status
Deployment not performed; GitHub Actions checks and local tests must be recorded in DEVELOPMENT.md. No exposure of live service has been requested from this chat.

**Cookie configuration:** production Compose sets `SCREENCRAFT_COOKIE_PATH=/apps/screencraft` to scope the unique application session cookie to its Caddy prefix. For direct root-path local development set cookie path to `/` and keep the backend isolated.

## Troubleshooting: 'Unexpected token <' / HTML returned for API
If the application loads and login succeeds but creating a project reports invalid JSON, the browser received HTML where a JSON API response was expected. The updated frontend reports the failing method/path, HTTP status, Content-Type and redirect pathname. Check those details first.

In browser DevTools > Network, select the failing `/apps/screencraft/api/...` request and inspect Status, Content-Type and Response (avoid sharing credentials/cookies). A 404 or 200 with the React HTML page points toward an incorrect route/fallback; a 502/503 indicates upstream/gateway trouble; a 500 with HTML may be an upstream server exception; a 302 to login indicates auth redirect. The status and content establish the next investigation step, not the other way round.

From the Ubuntu host (with an existing authenticated browser session for protected routes) compare:
```sh
curl -i http://127.0.0.1:8085/api/health
curl -i https://YOUR_HOST/apps/screencraft/api/health
```
Both should be JSON. Health alone does not establish that project POST works; use the Network tab when reproducing the project creation error. Caddy example must strip exactly one `/apps/screencraft` prefix before forwarding. Verify route ordering against existing Caddy/UDA handlers; preserve all other applications. Do not expose an unprotected production API to bypass gateway authentication.

## Optional UDA authentication instead of application passwords
ScreenCraft supports `SCREENCRAFT_AUTH_MODE=uda` so authenticated users from UDA do not need a second password. Do **not** enable it until your Caddy/UDA deployment has a verified, server-generated identity value and sets the protected proxy-secret header, as described in [UDA_AUTHENTICATION.md](UDA_AUTHENTICATION.md). In UDA mode, the existing project's administrator account is retained only when the authenticated UDA username maps to the existing ScreenCraft username. App-level permissions remain active. The default mode remains `local` to avoid an accidental lockout during installation.
