# ScreenCraft security baseline (requirements, not implementation)
No secrets/customer data/private corporate screenshots in this public repo or exported JSON. Validate paths, file names, imports, asset limits, SVG/HTML sanitisation and encoded text. Keep remote Figma/GitHub credentials optional, least-privilege, server-side; not_configured is not empty success. Vet and pin third-party dependencies. For hosted mode, authenticate at ingress and authorise inside app; trust only configured proxy hops, review CSRF/session scope/cookies and project ownership. Record tests and threat review before enabling remote writes.

## GitHub integration security
A server-wide GitHub token is never exposed to the browser or `.scraft` document. Current API requires a ScreenCraft server administrator plus an explicit `SCREENCRAFT_ALLOWED_REPOS` allowlist for reading or proposing changes in other repositories. GitHub writes produce a PR, not a direct main-branch push. Non-admin delegated repository access and audit are not implemented.

## SQL concurrent writes
Project saves require a matching document revision and perform an atomic conditional update. Project-shared prototype data writes require an expected dataset revision, with SQL row locking where supported. Do not disable these checks to bypass a conflict; reload and reconcile.

## Optional UDA single sign-on
In UDA mode, every API request requires a server-verifiable proxy assertion plus the verified UDA user identity; a previous Flask session cookie or client-set user header is not sufficient. The private Caddy integration MUST replace inbound identity headers with its authenticated identity and attach a separate 32+ character random server-only secret. Existing accounts link by matching username; new accounts default to non-admin with no project membership. Local login/bootstrap/logout/user-password provisioning are disabled while UDA mode is active. Live UDA/Caddy identity propagation is not yet verified. See docs/UDA_AUTHENTICATION.md.
