# Ubuntu UDA/Caddy reverse-proxy standard

Public UDA prefix: `/apps/<slug>/`. Caddy authenticates ingress; the app remains responsible for its own permissions. Bind backends to loopback/container network; trust exactly the configured proxy hops.

```python
# LOCAL_UBUNTU_PROXY_COMPAT
# Reason: UDA/Caddy publishes this app under /apps/<slug>/.
# Security: trust only the controlled local proxy hop.
# Design: keep business logic independent of external URL prefix.
```

Test separately:
1. Local root (`/`) and health.
2. Prefixed HTML and static assets.
3. Prefixed API GET, POST and CSRF where applicable.
4. Redirects, login/logout, cookie path/secure scope, direct-host rejection where required.
5. Upload/download, SSE and WebSocket if implemented.
6. UDA authentication: anonymous requests blocked; authorised sessions work.
7. No spoofed forwarded-header trust from arbitrary direct clients.
8. Rollback, health/readiness and preservation of persistent volumes.

Flask supports `ProxyFix`/`url_for`; FastAPI uses `root_path` when appropriate; Next.js `basePath` can be build-time. Use configuration rather than hard-coded public addresses. These patterns require test evidence against the actual deployment mode.
