# Shared capabilities for [APPLICATION NAME]

Source catalogue: `zageabb/Application-Standard/registry/capabilities.json`.

## Reuse assessment
For each new capability or substantial refactor, consult the catalogue before writing bespoke code. Document the search result in DEVELOPMENT.md and select an approved, versioned dependency only after checking compatibility, licensing, security, test coverage and runtime constraints.

## Pinned dependencies
| Capability ID | Package URL | Version/ref | Owner | Compatibility CI | Update PR |
|---|---|---|---|---|---|
| [ID] | [URL or none] | [tag/version] | [name] | [workflow] | [link] |

A related repository in the registry is not automatically a consumer. Add verified consumers only after inspecting the application's manifest/lockfile.

## Update process
Shared library releases trigger proposed dependency PRs, not unreviewed code overwrites or production deployments. Require relevant green CI and manual checks for breaking changes. Record update/rollback outcomes in DEVELOPMENT.md.

## Active registry location

Check `zageabb/shared-capabilities/registry/capabilities.json` for current candidates, owners and release status; the Application-Standard registry is an initial snapshot. Only adopt packages after compatibility/security/licensing review.
