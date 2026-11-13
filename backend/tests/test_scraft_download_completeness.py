"""End-to-end .scraft archive completeness regression after the 39-object expansion."""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZipFile

import pytest

from screencraft.api import create_app
from screencraft.package import read_document
from screencraft.conformance import validate_contract


@pytest.fixture
def app(tmp_path, monkeypatch):
    monkeypatch.setenv("SCREENCRAFT_SETUP_KEY", "test-setup-secret")
    return create_app({
        "TESTING": True,
        "SQLALCHEMY_URL": "sqlite:///" + str(tmp_path / "scraft-download.db"),
        "SESSION_COOKIE_SECURE": False,
    })


def complete_document(doc, image_path, digest):
    catalogue = json.loads(
        (Path(__file__).resolve().parents[2] / "frontend/src/catalogue.snapshot.json").read_text()
    )
    types = [item["id"] for item in catalogue["objects"]]
    assert len(types) == 39 and len(set(types)) == 39

    doc["name"] = "Complete .scraft round trip"
    doc["screens"][0]["name"] = "Overview"
    doc["screens"].append({
        "id": "details",
        "name": "Details",
        "viewport": {"width": 390, "height": 800},
        "layout": {"mode": "flow", "overflow_x": "auto"},
        "shared_navigation_hidden": True,
        "nodes": [{
            "id": "details-back",
            "type": "button",
            "parent_id": None,
            "props": {"label": "Back"},
            "action": {"type": "navigate", "target_screen": "home"},
        }],
    })
    doc["screen_order"] = ["details", "home"]
    doc["shared_navigation"] = {
        "enabled": True,
        "position": "left",
        "collapsible": True,
        "initial_collapsed": False,
        "mobile_collapsed": True,
        "items": [
            {"id": "root", "label": "Pages"},
            {"id": "home-item", "label": "Home", "target_screen": "home", "parent_id": "root"},
            {"id": "details-item", "label": "Details", "target_screen": "details", "parent_id": "root",
             "hidden_on": ["details"]},
        ],
    }
    doc["datasets"] = [{
        "id": "records",
        "columns": [{"id": "Name", "type": "text"}, {"id": "Status", "type": "text"}],
        "rows": [{"Name": "Example", "Status": "Active"}],
        "persistence": "seed-reset",
    }]
    doc["components"] = [{
        "id": "detail-component", "name": "Details template",
        "nodes": [{"id": "component-text", "type": "text", "parent_id": None,
                   "props": {"text": "Reusable component"}}],
    }]
    doc["assets"] = [{
        "id": digest[:16], "path": image_path, "media_type": "image/png", "sha256": digest,
    }]
    nodes = []
    for index, typ in enumerate(types):
        props = {"label": typ, "future_extension_property": {"nested": [1, {"kept": True}]}}
        if typ in ("table", "x-editable-grid", "x-list", "x-tree", "x-timeline", "x-record-detail",
                   "x-kpi", "x-chart"):
            props["dataset_id"] = "records"
        if typ == "x-file-preview" or typ == "image":
            props["asset"] = image_path
        if typ in ("x-diagram", "x-schema-map"):
            key = "tables" if typ == "x-schema-map" else "nodes"
            props[key] = [{"id": "source", "label": "Source", "fields": ["ID"]},
                          {"id": "target", "label": "Target", "fields": ["Source ID"]}]
            props["links"] = [{"source": "source", "target": "target"}]
        if typ == "x-menu":
            props["use_shared"] = True
        nodes.append({
            "id": f"object-{index}", "type": typ, "parent_id": None,
            "props": props,
            "layout": {"x": (index % 4) * 220, "y": (index // 4) * 105,
                       "width": 200, "height": 95},
            "style": {"future_style_token": "preserve"},
        })
    # Existing nested container hierarchy and explicit action references.
    nodes += [
        {"id": "child-text", "type": "text", "parent_id": "object-0",
         "props": {"text": "Nested text", "future": {"preserve": True}}},
        {"id": "navigate", "type": "button", "parent_id": None,
         "props": {"label": "Go to details"},
         "action": {"type": "navigate", "target_screen": "details"}},
    ]
    # The parent must be an actual container, regardless of catalogue ordering.
    first_container = next(node["id"] for node in nodes if node["type"] in (
        "container", "x-card", "x-grid", "x-flex", "x-sidebar", "x-toolbar"
    ))
    nodes[-2]["parent_id"] = first_container
    doc["screens"][0]["nodes"] = nodes
    doc["future_application_metadata"] = {"preserve": ["new", "optional", "fields"]}
    return doc, types


def test_download_zip_contains_entire_saved_application_and_import_preserves_it(app):
    client = app.test_client()
    bootstrap = client.post("/api/bootstrap", json={
        "setup_key": "test-setup-secret", "username": "admin",
        "password": "A-Very-Long-Password!",
    })
    assert bootstrap.status_code == 201
    created = client.post("/api/projects", json={"name": "Export audit"})
    assert created.status_code == 201
    pid = created.json["id"]

    # Add a packaged image using the same application API as the editor.
    raw_image = b"\x89PNG\r\n\x1a\n" + b"fake-prototype-image"
    uploaded = client.post(f"/api/projects/{pid}/images", data={
        "revision": "1",
        "file": (BytesIO(raw_image), "logo.png"),
    }, content_type="multipart/form-data")
    assert uploaded.status_code == 201, uploaded.json
    digest = sha256(raw_image).hexdigest()
    path = uploaded.json["path"]

    current = client.get(f"/api/projects/{pid}").json
    doc, types = complete_document(current["document"], path, digest)
    saved = client.put(f"/api/projects/{pid}", json={
        "document": doc, "revision": current["revision"],
    })
    assert saved.status_code == 200, saved.json

    downloaded = client.get(f"/api/projects/{pid}/download")
    assert downloaded.status_code == 200
    assert downloaded.mimetype == "application/zip"
    with ZipFile(BytesIO(downloaded.data)) as archive:
        assert set(archive.namelist()) == {"manifest.json", "application.json", path}
        assert json.loads(archive.read("application.json")) == doc
        assert archive.read(path) == raw_image

    manifest, restored, assets = read_document(downloaded.data)
    assert manifest["document_revision"] > 1
    assert restored == doc
    assert assets == {path: raw_image}
    # Known canonical extensions must not be misreported as unsupported on import.
    warnings = validate_contract(manifest, restored, assets, verify_assets=True)
    assert not any("inactive placeholder" in warning for warning in warnings), warnings
    assert len(restored["screens"][0]["nodes"]) == 41
    assert {node["type"] for node in restored["screens"][0]["nodes"] if node["id"].startswith("object-")} == set(types)

    # Import the exported bytes, not a reconstructed Python dictionary.
    imported = client.post(f"/api/projects/{pid}/upload", data={
        "revision": str(saved.json["revision"]),
        "file": (BytesIO(downloaded.data), "saved-design.scraft"),
    }, content_type="multipart/form-data")
    assert imported.status_code == 200, imported.json
    _, reimported, reimported_assets = read_document(
        client.get(f"/api/projects/{pid}/download").data
    )
    assert reimported == doc
    assert reimported_assets == {path: raw_image}
