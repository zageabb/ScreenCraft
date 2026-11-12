# ScreenCraft — UDA single sign-on deployment

**Status: configurable integration. Live UDA identity forwarding has not been verified.**

ScreenCraft supports two authentication modes:
- `SCREENCRAFT_AUTH_MODE=local` (default): existing ScreenCraft username/password and bootstrap.
- `SCREENCRAFT_AUTH_MODE=uda`: UDA authenticates the browser at the reverse proxy; ScreenCraft accepts a **verified user identifier** from the trusted proxy and enforces project-level ACLs in its own database. No separate ScreenCraft login or password reset is needed.

## One-time identity mapping: preserve existing projects

Before enabling UDA mode, confirm exactly what stable identity UDA provides (prefer the user's primary email address). It must match the **existing ScreenCraft username**, case-insensitively; otherwise ScreenCraft will create a new non-admin account with no project memberships. Do not reset or drop PostgreSQL tables to switch modes. Existing account IDs, ownership and membership remain unchanged when the username matches.

**Important:** the application **does not auto-promote the first UDA user to administrator**. Existing administrator permissions are retained only when UDA maps to the same ScreenCraft account. If the identities differ, a database-backed account linking/migration must be reviewed first. Do not grant admin using an unauthenticated header or setup URL.

## Required trust boundary

1. UDA/Caddy authenticates the incoming user and denies anonymous requests to `/apps/screencraft/`.
2. The ingress implementation **removes all client-supplied identity and ScreenCraft proxy-secret headers** before setting new headers from its verified authentication result. Never simply forward an inbound `X-UDA-User` header from the browser.
3. Caddy sends a server-controlled `X-UDA-User` identity plus `X-ScreenCraft-Proxy-Secret` (matching a 32+ character random value in the ScreenCraft container) to the private backend on every API request.
4. Backend is reachable only through trusted Caddy / private Docker network or host loopback. It verifies both values per API request; possession of a prior ScreenCraft session cookie alone is insufficient.
5. Internal project roles still govern view/edit/share access and server-administrator operations.

The actual header populated by **your UDA installation** must be determined from its existing configuration before turning on UDA mode. There is no universal UDA identity-header name. Do not enable it until the upstream authenticated username/identity contract is confirmed.

## Environment

```dotenv
SCREENCRAFT_AUTH_MODE=uda
SCREENCRAFT_UDA_IDENTITY_HEADER=X-UDA-User
SCREENCRAFT_UDA_PROXY_SECRET=<generate-a-long-random-secret-and-set-the-same-value-in-trusted-Caddy>
```

Use the existing `SCREENCRAFT_SECRET_KEY` to sign Flask session cookies. Do not reuse it as the UDA proxy secret. In `deploy/docker-compose.yml`, `SCREENCRAFT_UDA_PROXY_SECRET` is passed to the application and `SCREENCRAFT_AUTH_MODE` defaults to `local` until switched explicitly. UDA mode refuses to start without an adequate proxy secret.

The Caddy example in `deploy/Caddyfile.example` is deliberately **not sufficient to activate UDA sign-on**: it must be integrated with the verified identity variable set by your actual UDA authentication layer. In the authenticated request path, Caddy must overwrite both `X-UDA-User` and `X-ScreenCraft-Proxy-Secret`; never forward client-provided values. The latter can be populated from Caddy's own protected environment variable `SCREENCRAFT_UDA_PROXY_SECRET`.

## Validation before rollout

- Confirm UDA identity equals the existing ScreenCraft username (including email format).
- Back up PostgreSQL and retain the previous `local` mode settings for rollback.
- Anonymous or direct-backend access to protected APIs must return 401.
- A deliberately forged identity header **without** trusted proxy assertion must return 401, even if a previous cookie exists.
- UDA-authenticated existing admin retains project ownership and `is_admin`.
- New UDA users get a non-admin account and no access to another user's projects by default.
- A different UDA user using the same browser must not inherit a previous user's identity.
- Local `/api/login`, `/api/bootstrap`, `/api/users` and `/api/logout` must not provide a secondary credential path in UDA mode.
- The UI should show ScreenCraft without a second login form once UDA auth succeeds.
- Root `/`, public `/apps/screencraft/`, API GET/POST, cookies, media download, and Caddy 401 behaviour should be checked. Proxy and identity tests must run against the **live configured UDA authentication** and not just simulated headers.

## Rollback

Switch `SCREENCRAFT_AUTH_MODE=local`, rebuild/restart the app as normally deployed. Existing ScreenCraft users and passwords remain intact; UDA-only shadow users cannot use local login. Retain database backups and project membership records.

**No password-reset UI is required in UDA mode.** If a standalone local deployment is used later, password reset is a separate scoped feature.
