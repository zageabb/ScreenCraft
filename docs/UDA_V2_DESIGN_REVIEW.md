# DEV-020 — ScreenCraft V2 deployment graph, design gate

**Status: BLOCKED — review-only design, no executable `uda.v2.yaml` yet.**

This evidence comes from `deploy/docker-compose.yml`, `deploy/Dockerfile`,
`docs/DEPLOYMENT_UBUNTU.md`, and `docs/UDA_AUTHENTICATION.md`.
The README describes an older prototype; it is not reliable evidence of
the currently running server release. Reconcile actual host containers,
registry and source revision read-only before producing an executable graph.

## Source graph

- `app`: locally built multi-stage Dockerfile. Node 22 frontend build,
  Python 3.11 backend, Gunicorn port 8085 bound to host loopback by Compose.
- `db`: Compose image `postgres:17-alpine`, not digest-pinned. It owns
  named persistent volume `screencraft-postgres` at
  `/var/lib/postgresql/data`, which may be project-prefixed at runtime.
- `app` waits for healthy DB. Current entrypoint automatically runs
  `alembic -c backend/alembic.ini upgrade head` before Gunicorn.
  An app restart is thus also a database migration attempt.
- UDA/Caddy external mount `/apps/screencraft/` strips a single prefix.
  App uses ProxyFix and scoped cookies; identity/password handling can use
  local or UDA mode, but the latter requires server-controlled identity
  AND an independent shared proxy-secret header verified on every request.
- Required sensitive references include `SCREENCRAFT_DB_PASSWORD`,
  `SCREENCRAFT_SECRET_KEY`, `SCREENCRAFT_SETUP_KEY`, and, for UDA mode,
  `SCREENCRAFT_UDA_PROXY_SECRET` and the authenticated identity contract.
  Never record actual values.

## Why this is blocked

1. V2 requires container images to use immutable sha256 digests. The
   source Compose reference `postgres:17-alpine` is mutable. Do not
   invent or assume a registry digest; inspect and pin the reviewed image.
2. The Dockerfile's application command runs Alembic automatically.
   Split schema migration from application startup, require explicit
   DB-write permission and a verified backup/restore rehearsal.
3. Confirm which PostgreSQL volume Docker actually uses, its storage
   owner and retention; never create or replace it from a guessed name.
4. Confirm whether live app uses UDA identity mode and whether Caddy
   strips untrusted incoming headers and injects identity + proxy secret.
   Do not enable UDA mode based on the sample Caddy configuration alone.
5. Determine the tested deployed commit, exact API/build provenance, and
   effective Caddy routes through authorised Desktop read-only checks.

## Acceptance checklist

- [ ] Resolve source/live version and effective Compose graph.
- [ ] Pin postgres image by verified SHA-256 digest.
- [ ] Refactor migration to separately approved explicit operation;
      prove safe startup against disposable migrated DB.
- [ ] Confirm backup/restore and real persistent-volume ID.
- [ ] Confirm auth proxy headers without exposing their values.
- [ ] Create declarative `uda.v2.yaml` (app + DB containers) only after
      these lifecycle facts are resolved.
- [ ] Run canonical V2 schema, semantic graph and isolated tests.
- [ ] Obtain owner approval separately for release, migration and activation.

This document changes no service, data, registry, Caddy route or UDA
deployment state.
