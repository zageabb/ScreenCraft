# Shared capability consumption and release policy

## Before implementation
1. Search [capabilities registry](../registry/capabilities.json) and [human audit](REUSABLE_CAPABILITIES_CATALOGUE.md) for matching functionality.
2. Inspect the candidate's actual APIs, tests, dependency licences and supported runtime; a registry candidate is **not** an approved shared dependency.
3. Prefer a compatible versioned package over copying code. If reuse is unsuitable, document the reason and any proposed improvements in the DEV item.
4. Do not silently migrate existing apps, copy proprietary/corporate code or expose private repository source via a public package.

## Source of truth and promotion gates
- Candidate -> evaluated: compare behaviour, imports, security boundaries, provenance, dependencies, maintenance/ownership and CI.
- Evaluated -> packaged: design a stable public API, isolate domain behaviour, add integration fixtures and backwards-compatibility tests, review licences and release artefacts.
- Packaged -> approved: reproducible versioned build, security review, documentation, changelog, automated tests, owner, and green CI.
- A registry's `related_repositories` is **not** proof of a deployed dependency. Only register `consumers_verified` after inspecting a pinned manifest/lockfile.

## Propagation
- Release a package under SemVer. Publish through a supported private registry (for example GitHub Packages for npm) or signed/tagged Git release as suitable to the language and installer.
- Dependabot/Renovate or a CI workflow proposes dependency updates as **PRs** to known consumers. Never overwrite vendored application files blindly.
- Each PR runs the consumer's full relevant CI, functional compatibility tests, and release/deployment checks. Block auto-merge on failures or breaking changes.
- Consumers pin versions. Rollback means restoring the previous tagged release/version. A shared release does not imply automatic production deployment.
- When a consumer adds a useful fix, first propose it upstream with regression tests, then release and update other consumers.

## Registry ownership
Each capability has a stable id, candidate source, list of overlapping repositories, package state and evidence fields. Proposed packages must add owner, public API, dependency strategy, licences and verifiable CI before promotion. Keep the reusable catalogue outside inherited application templates; future application templates should link to it instead of copying its inventory.

## Repository boundary
`Application-Standard` is the policy/template repository. A separate private `shared-capabilities` repository is recommended for executable packages. Do not put executable libraries or organisation-sensitive business code in this template repository.

## Active shared source repository

The private central source repository is [zageabb/shared-capabilities](https://github.com/zageabb/shared-capabilities). Its `registry/capabilities.json` is the maintained package candidate list. The registry in Application-Standard is a dated baseline audit, not a live package-release record. Use shared-capabilities for current package status and versions.
