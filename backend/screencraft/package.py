"""Safe, portable .scraft ZIP archive reader/writer. Canonical spec in Application-Standard."""
from __future__ import annotations
from datetime import datetime, timezone
from io import BytesIO
import json
import re
from pathlib import PurePosixPath
from uuid import uuid4
from zipfile import ZipFile, ZIP_DEFLATED, BadZipFile
from .conformance import validate_contract, ContractError

MAX_ARCHIVE = 25 * 1024 * 1024
MAX_EXPANDED = 100 * 1024 * 1024
MAX_ENTRIES = 1000
MAX_IMAGE = 12 * 1024 * 1024
ALLOWED_IMAGES = {".png": b"\x89PNG\r\n\x1a\n", ".jpg": b"\xff\xd8\xff", ".jpeg": b"\xff\xd8\xff", ".webp": b"RIFF", ".gif": b"GIF8"}

class FormatError(ValueError):
    pass

def _json(data: bytes, name: str):
    try:
        def no_duplicates(pairs):
            result = {}
            for key, value in pairs:
                if key in result:
                    raise ValueError("Duplicate JSON key")
                result[key] = value
            return result
        result = json.loads(data.decode("utf-8"), object_pairs_hook=no_duplicates)
    except (UnicodeError, ValueError) as exc:
        raise FormatError("Invalid JSON in " + name) from exc
    if not isinstance(result, dict):
        raise FormatError(name + " must be an object")
    return result

def _safe_path(name: str):
    if not name or "\\" in name or name.startswith("/") or ":" in name or "\x00" in name:
        raise FormatError("Unsafe ZIP member path")
    p = PurePosixPath(name)
    if ".." in p.parts or "." in p.parts:
        raise FormatError("Archive traversal path")
    if name.rstrip("/") != p.as_posix().rstrip("/"):
        raise FormatError("Noncanonical ZIP path")

def _validate(manifest, app):
    if manifest.get("format") != "screencraft" or not re.fullmatch(r"1\.\d+\.\d+", str(manifest.get("format_version", ""))):
        raise FormatError("Unsupported .scraft format version")
    if manifest.get("entry") != "application.json":
        raise FormatError("Invalid entry")
    screens = app.get("screens")
    if not isinstance(screens, list) or len(screens) > 100:
        raise FormatError("Invalid screens collection")
    ids = [s.get("id") for s in screens if isinstance(s, dict)]
    if len(ids) != len(screens) or any(not isinstance(i, str) or not i for i in ids) or len(set(ids)) != len(ids):
        raise FormatError("Duplicate or invalid screen IDs")
    if app.get("start_screen") not in ids and ids:
        raise FormatError("Missing start screen")
    if app.get("screen_order", ids) != ids:
        if sorted(app.get("screen_order", [])) != sorted(ids):
            raise FormatError("Invalid screen order")
    for screen in screens:
        nodes = screen.get("nodes", [])
        if not isinstance(nodes, list) or len(nodes) > 500:
            raise FormatError("Too many nodes")
        nids = {n.get("id") for n in nodes if isinstance(n, dict)}
        if len(nids) != len(nodes) or None in nids or len(set(nids)) != len(nodes):
            raise FormatError("Duplicate or invalid nodes")
        parents = {n["id"]: n.get("parent_id") for n in nodes}
        for node in nodes:
            visited = {node["id"]}
            parent = node.get("parent_id")
            while parent is not None:
                if parent not in parents or parent in visited:
                    raise FormatError("Invalid node hierarchy")
                visited.add(parent)
                parent = parents[parent]
            action = node.get("action") or {}
            if action and action.get("type") not in {"navigate","back","show_modal","close_modal","toggle_visibility","set_mock_field","add_mock_row","delete_mock_row","message"}:
                raise FormatError("Unsupported action")
            if action.get("type") == "navigate" and action.get("target_screen") not in ids:
                raise FormatError("Missing navigation target")
    return True

def _resolve_internal_refs(z, document, names):
    """Resolve standard local ZIP references to a self-contained application model."""
    def resolve(value, trail=()):
        if isinstance(value, dict) and "$ref" in value:
            if len(value) != 1 or not isinstance(value["$ref"], str):
                raise FormatError("Invalid local JSON reference")
            path = value["$ref"]
            _safe_path(path)
            if (path.startswith("assets/") or not path.endswith(".json") or
                    path not in names or path in trail or len(trail) > 16):
                raise FormatError("Missing, cyclic or unsafe ZIP JSON reference: " + path)
            return resolve(_json(z.read(path), path), trail + (path,))
        if isinstance(value, list):
            return [resolve(item, trail) for item in value]
        if isinstance(value, dict):
            return {key: resolve(item, trail) for key, item in value.items()}
        return value
    return resolve(document)

def read_document(blob: bytes):
    if len(blob) > MAX_ARCHIVE:
        raise FormatError("Archive too large")
    assets = {}
    try:
        with ZipFile(BytesIO(blob)) as z:
            members = z.infolist()
            if len(members) > MAX_ENTRIES or sum(x.file_size for x in members) > MAX_EXPANDED:
                raise FormatError("Archive expansion limit")
            names = set()
            for item in members:
                _safe_path(item.filename)
                if item.filename in names:
                    raise FormatError("Duplicate archive entry")
                names.add(item.filename)
                if (item.external_attr >> 16) & 0o170000 == 0o120000:
                    raise FormatError("Symlink in archive")
                if not item.is_dir() and not item.filename.endswith(".json") and not item.filename.startswith("assets/"):
                    raise FormatError("Unsupported ZIP entry")
            if "manifest.json" not in names or "application.json" not in names:
                raise FormatError("Missing required files")
            manifest = _json(z.read("manifest.json"), "manifest.json")
            app = _resolve_internal_refs(z, _json(z.read("application.json"), "application.json"), names)
            _validate(manifest, app)
            for name in names:
                if name.startswith("assets/") and not name.endswith("/"):
                    ext = PurePosixPath(name).suffix.lower()
                    if ext not in ALLOWED_IMAGES:
                        raise FormatError("Disallowed image")
                    data = z.read(name)
                    if len(data) > MAX_IMAGE or not data.startswith(ALLOWED_IMAGES[ext]):
                        raise FormatError("Invalid image")
                    if ext == ".webp" and data[8:12] != b"WEBP":
                        raise FormatError("Invalid WebP")
                    assets[name] = data
            try:
                validate_contract(manifest, app, assets, verify_assets=True)
            except ContractError as exc:
                raise FormatError(str(exc)) from exc
            return manifest, app, assets
    except (OSError, ValueError, KeyError, EOFError, BadZipFile) as exc:
        if isinstance(exc, FormatError):
            raise
        raise FormatError("Corrupt .scraft archive") from exc

def make_document(app: dict, assets: dict | None = None, manifest: dict | None = None) -> bytes:
    assets = assets or {}
    now = datetime.now(timezone.utc).isoformat()
    manifest = dict(manifest or {})
    manifest.update({"format": "screencraft", "format_version": "1.0.0", "entry": "application.json"})
    manifest.setdefault("document_id", str(uuid4()))
    manifest.setdefault("document_revision", 1)
    manifest.setdefault("name", app.get("name", "Untitled"))
    manifest.setdefault("created_at", now)
    manifest["updated_at"] = now
    _validate(manifest, app)
    try:
        validate_contract(manifest, app, assets, verify_assets=True)
    except ContractError as exc:
        raise FormatError(str(exc)) from exc
    for name, data in assets.items():
        _safe_path(name)
        ext = PurePosixPath(name).suffix.lower()
        if not name.startswith("assets/") or ext not in ALLOWED_IMAGES or len(data) > MAX_IMAGE or not data.startswith(ALLOWED_IMAGES[ext]):
            raise FormatError("Invalid asset")
    out = BytesIO()
    with ZipFile(out, "w", compression=ZIP_DEFLATED) as z:
        z.writestr("manifest.json", json.dumps(manifest, sort_keys=True, separators=(",", ":")))
        z.writestr("application.json", json.dumps(app, sort_keys=True, separators=(",", ":")))
        for name, data in sorted(assets.items()):
            z.writestr(name, data)
    data = out.getvalue()
    if len(data) > MAX_ARCHIVE:
        raise FormatError("Archive too large")
    return data

def starter_app():
    """New designs start with an empty editable Home screen, not an unrequested demo action."""
    return {"application_id":"new-app","name":"New Application","start_screen":"home",
        "default_theme":"light","screen_order":["home"],"screens":[{"id":"home","name":"Home",
        "viewport":{"width":1280,"height":800},
        "layout":{"mode":"freeform","overflow_x":"auto","overflow_y":"auto"},
        "nodes":[]}],
        "components":[],"themes":{
            "light":{"tokens":{"surface.default":"#ffffff","text.primary":"#16243a","action.primary":"#2563eb"}},
            "dark":{"tokens":{"surface.default":"#1e2737","text.primary":"#f7f7f7","action.primary":"#75aaff"}}},
        "datasets":[],"assets":[]}
