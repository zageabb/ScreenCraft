# Phase 9.1 — Collapsible containers and shared application navigation

Status: implementation ready for CI/manual verification. The `.scraft` portable-format authority remains `zageabb/Application-Standard`; ScreenCraft uses compatible optional fields, not an independent normative standard.

## Container collapse

The existing container, card, grid, flex, toolbar, sidebar and splitter objects accept `props.collapsible` (enable header chevron) and `props.expanded` (initial state, defaults true). The canvas remains editable in Design mode, whereas Preview and standalone Interactive HTML may collapse the subtree to a compact 40 px header.

Buttons may set `action.type` to `toggle_container`, `collapse_container` or `expand_container`, and select `action.target_node` from local compatible container nodes. Invalid targets are rejected on import. Collapsing never deletes child definitions or mock values. Input values persist in Preview memory and in offline Interactive HTML across repeated renders.

## Shared navigation

At application level, a single optional `shared_navigation` object is shared by screens without duplicating child menu nodes. Existing files without it remain compatible. Properties:

- `enabled`, `position` (left/right/top), `collapsible`, `initial_collapsed`, `mobile_collapsed`
- `items`: ordered records with unique `id`, `label`, optional `icon`/symbol, `target_screen`, `parent_id`, `hidden_on` screen IDs
- Each screen may set `shared_navigation_hidden: true` to opt out

The right-hand inspector allows global editing of menu labels, screen targets, symbols, order, nesting, visibility, side/top placement and initial/mobile collapse state. Preview and exported HTML display active links, group expand/collapse, mobile menu control and screen opt-outs. The offline export has Back/Home recovery buttons even on screens where shared navigation is hidden.

## Acceptance and limitations

Browser tests exercise actual Python-generated standalone HTML, and editor Preview tests verify button targets, state preservation, shared menu and per-screen opt-out. Backend conformance tests check duplicate IDs, broken targets, cycles and package round-trips. The five CI jobs (React, Python, browser, Docker, docs) gate merge.

This is a design prototype, **not** an access-control implementation. Permission-aware visibility, complex breakpoint rules, drag-resizable splitters, full focus management, custom SVG icons and deployment/manual Ubuntu acceptance are outside this phase. No database migration is required.
