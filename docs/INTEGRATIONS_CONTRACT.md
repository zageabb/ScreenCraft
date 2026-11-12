# Optional enterprise integration contract

Allowed outcomes: `not_configured`, `available`, `unavailable`, `permission_denied`, `invalid_request`, `error`.

```json
{"status":"not_configured","source":"powerbi","configured":false,"data":null,"error":null,"message":"Power BI is not connected in this deployment"}
```

- `not_configured` is deliberate absence, **not successful empty data**.
- `available` with `data: []` is a valid empty response.
- `unavailable` denotes an outage and should trigger operational handling/retries if safe.
- `permission_denied` must never fall back silently to a privileged connection.
- Synthetic fixtures MUST carry `source: "demo"` and UI labelling.
- Core startup MUST NOT require an optional SDK/secret unless that feature is enabled.
- Differentiate global readiness from optional adapter readiness in health endpoints.
- Tests cover each outcome independent of enterprise access.
