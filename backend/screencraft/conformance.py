"""Phase 6 SCRAFT-1 validation and non-destructive compatibility diagnostics.

The canonical contract is maintained in zageabb/Application-Standard.
Errors block import; warnings are informational and must not rewrite the document.
"""
from __future__ import annotations

from datetime import datetime
from hashlib import sha256
from pathlib import PurePosixPath
import re

CORE_TYPES = frozenset("text button input select checkbox table image container tabs modal".split())
EDITOR_EXTENSIONS = frozenset("x-card x-grid x-flex x-toolbar x-date x-number x-textarea x-kpi".split())
KNOWN_CATALOGUE = frozenset("""x-card x-grid x-flex x-splitter x-sidebar x-accordion x-number x-date x-time x-radio x-toggle x-file-upload x-search x-textarea x-editable-grid x-tree x-list x-record-detail x-kpi x-chart x-pagination x-menu x-breadcrumbs x-toolbar x-wizard x-schema-map x-timeline x-file-preview x-diagram""".split())
ACTION_TYPES = frozenset("navigate back show_modal close_modal toggle_visibility set_mock_field add_mock_row delete_mock_row message".split())
PERSISTENCE = frozenset(("seed-reset", "session-persisted", "project-shared"))
MAX_DEPTH = 64
MAX_SEED_ROWS = 1000


class ContractError(ValueError):
    """Invalid or unsafe SCRAFT document."""


def _require(condition, message):
    if not condition:
        raise ContractError(message)


def _ident(value, path):
    _require(isinstance(value, str) and 0 < len(value) <= 200, f"{path} must be a nonempty identifier")
    return value


def _depth(value, limit=MAX_DEPTH):
    stack = [(value, 1)]
    while stack:
        item, depth = stack.pop()
        _require(depth <= limit, "JSON nesting depth limit exceeded")
        if isinstance(item, dict):
            stack.extend((v, depth + 1) for v in item.values())
        elif isinstance(item, list):
            stack.extend((v, depth + 1) for v in item)


def _unique(values, label):
    _require(len(values) == len(set(values)), f"Duplicate {label}")


def _timestamp(value, label):
    _require(isinstance(value, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)", value) is not None, f"Invalid UTC {label}")
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ContractError(f"Invalid UTC {label}") from exc


def _image_mime(path):
    return {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif"}.get(PurePosixPath(path).suffix.lower())


def validate_contract(manifest: dict, app: dict, assets: dict | None = None, *, verify_assets: bool = False):
    """Return warnings for safe unsupported features; raise for invalid references/security.

    verify_assets=False is used when validating JSON prior to pack creation.
    When importing a ZIP, verify_assets=True enforces declared asset integrity.
    """
    _require(isinstance(manifest, dict) and isinstance(app, dict), "Manifest and application must be objects")
    _depth(manifest)
    _depth(app)
    warnings = []
    _require(manifest.get("format") == "screencraft", "Not a screencraft document")
    version = manifest.get("format_version", "")
    _require(isinstance(version, str) and re.fullmatch(r"1\.\d+\.\d+", version) is not None, "Unsupported .scraft major version")
    if tuple(int(x) for x in version.split("."))[1] > 0:
        warnings.append(f"Version {version} uses a newer v1 minor revision; unknown optional fields are retained.")
    _require(manifest.get("entry") == "application.json", "Invalid manifest entry")
    _ident(manifest.get("document_id"), "document_id")
    _require(type(manifest.get("document_revision")) is int and manifest["document_revision"] > 0, "Invalid document_revision")
    _require(isinstance(manifest.get("name"), str), "Invalid manifest name")
    for key in ("created_at", "updated_at"):
        _timestamp(manifest.get(key), key)
    provenance = manifest.get("source_repository")
    if provenance is not None:
        _require(isinstance(provenance, dict), "Invalid source_repository")
        for key, value in provenance.items():
            if isinstance(value, str):
                _require(not re.search(r"(?i)(?:https?://[^/\s]*@|(?:token|password|secret|key)=)", value),
                         "Credentials or userinfo forbidden in source_repository")
    _ident(app.get("application_id"), "application_id")
    _require(isinstance(app.get("name"), str), "Invalid application name")
    _ident(app.get("start_screen"), "start_screen")
    _ident(app.get("default_theme"), "default_theme")
    screens = app.get("screens")
    _require(isinstance(screens, list) and 1 <= len(screens) <= 100, "Document must have 1–100 screens")
    _require(all(isinstance(s, dict) for s in screens), "Invalid screen object")
    screen_ids = [_ident(s.get("id"), "screen.id") for s in screens]
    _unique(screen_ids, "screen IDs")
    _require(app["start_screen"] in screen_ids, "Missing start screen")
    order = app.get("screen_order")
    _require(isinstance(order, list) and len(order) == len(screen_ids)
             and all(isinstance(i, str) for i in order) and set(order) == set(screen_ids),
             "screen_order must contain every screen exactly once")
    themes = app.get("themes", {})
    _require(isinstance(themes, dict), "themes must be an object")
    if app["default_theme"] not in themes:
        warnings.append("Default theme has no matching theme definition.")
    components = app.get("components", [])
    _require(isinstance(components, list), "components must be an array")
    component_ids = [_ident(c.get("id"), "component.id") for c in components if isinstance(c, dict)]
    _require(len(component_ids) == len(components), "Invalid component definition")
    _unique(component_ids, "component IDs")
    datasets = app.get("datasets", [])
    _require(isinstance(datasets, list), "datasets must be an array")
    _require(all(isinstance(d, dict) for d in datasets), "Invalid dataset definition")
    dataset_ids = [_ident(d.get("id"), "dataset.id") for d in datasets]
    _unique(dataset_ids, "dataset IDs")
    for dataset in datasets:
        did = dataset["id"]
        cols = dataset.get("columns", [])
        rows = dataset.get("rows", [])
        _require(isinstance(cols, list) and all(isinstance(c, dict) for c in cols), f"Invalid dataset columns: {did}")
        names = [_ident(c.get("id"), f"dataset {did} column") for c in cols]
        _unique(names, f"columns in dataset {did}")
        _require(isinstance(rows, list) and len(rows) <= MAX_SEED_ROWS and all(isinstance(r, dict) for r in rows),
                 f"Invalid seed rows or >{MAX_SEED_ROWS} records in dataset {did}")
        _require(dataset.get("persistence", "seed-reset") in PERSISTENCE, f"Invalid persistence in dataset {did}")
    assets = assets or {}
    declared = app.get("assets", [])
    _require(isinstance(declared, list), "assets must be an array")
    declared_paths = set()
    asset_ids = []
    for item in declared:
        _require(isinstance(item, dict), "Invalid asset declaration")
        path = item.get("path")
        _require(isinstance(path, str) and path.startswith("assets/")
                 and "/" not in path[len("assets/"):] and ".." not in PurePosixPath(path).parts
                 and _image_mime(path), "Invalid declared asset path")
        declared_paths.add(path)
        if item.get("id") is not None:
            asset_ids.append(_ident(item["id"], "asset.id"))
        if "media_type" in item and item["media_type"]:
            _require(item["media_type"] == _image_mime(path), f"Asset media type mismatch: {path}")
        if verify_assets:
            _require(path in assets, f"Missing packaged asset: {path}")
        if "sha256" in item and item["sha256"]:
            checksum = item["sha256"]
            _require(isinstance(checksum, str) and re.fullmatch("[0-9a-f]{64}", checksum), f"Invalid SHA-256: {path}")
            if verify_assets:
                _require(sha256(assets[path]).hexdigest() == checksum, f"Asset checksum mismatch: {path}")
    _unique(asset_ids, "asset IDs")
    _require(len(declared_paths) == len(declared), "Duplicate declared asset path")
    if verify_assets:
        for path in assets:
            if path not in declared_paths:
                warnings.append(f"Unreferenced packaged asset retained: {path}")
    for screen in screens:
        sid = screen["id"]
        viewport = screen.get("viewport")
        _require(isinstance(viewport, dict) and all(type(viewport.get(d)) is int and viewport[d] > 0 for d in ("width", "height")),
                 f"Invalid viewport in screen {sid}")
        _require(isinstance(screen.get("layout", {}), dict), f"Invalid screen layout: {sid}")
        nodes = screen.get("nodes", [])
        _require(isinstance(nodes, list) and len(nodes) <= 500 and all(isinstance(n, dict) for n in nodes),
                 f"Invalid nodes collection: {sid}")
        ids = [_ident(n.get("id"), f"screen {sid} node") for n in nodes]
        _unique(ids, f"node IDs in {sid}")
        idmap = {n["id"]: n for n in nodes}
        for node in nodes:
            nid = node["id"]
            kind = _ident(node.get("type"), f"node {nid} type")
            if kind not in CORE_TYPES | EDITOR_EXTENSIONS:
                warnings.append(f"Screen {sid}: {kind} is preserved as an inactive placeholder (node {nid}).")
            for key in ("props", "layout", "style", "bindings", "accessibility"):
                if key in node:
                    _require(isinstance(node[key], dict), f"Invalid {key} on node {nid}")
            if "responsive" in node:
                _require(isinstance(node["responsive"], list), f"Invalid responsive rules on {nid}")
            parent = node.get("parent_id")
            visited = {nid}
            while parent is not None:
                _require(isinstance(parent, str) and parent in idmap and parent not in visited,
                         f"Invalid node hierarchy on {nid}")
                visited.add(parent)
                parent = idmap[parent].get("parent_id")
            p = node.get("props") or {}
            if kind == "table" and p.get("dataset_id") and p["dataset_id"] not in dataset_ids:
                warnings.append(f"Screen {sid}: table {nid} refers to missing sample dataset {p['dataset_id']}.")
            if kind == "image" and p.get("asset") and p["asset"] not in assets and p["asset"] not in declared_paths:
                warnings.append(f"Screen {sid}: image {nid} refers to missing packaged asset.")
            action = node.get("action") or {}
            _require(isinstance(action, dict), f"Invalid action on {nid}")
            if action:
                kind_action = action.get("type")
                _require(kind_action in ACTION_TYPES, f"Unsupported executable action on {nid}")
                if kind_action == "navigate":
                    _require(action.get("target_screen") in screen_ids, f"Missing navigation target from {nid}")
                if kind_action in ("show_modal", "close_modal", "toggle_visibility") and action.get("target_node"):
                    _require(action["target_node"] in idmap, f"Missing action target on {nid}")
                if kind_action in ("add_mock_row", "delete_mock_row", "set_mock_field"):
                    _require(action.get("dataset_id") in dataset_ids, f"Missing action dataset on {nid}")
    return warnings
