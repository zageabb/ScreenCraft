"""Phase 6 interoperability and security conformance against SCRAFT-1."""
import io
import json
from copy import deepcopy
from hashlib import sha256
from zipfile import ZipFile, ZIP_DEFLATED

import pytest

from screencraft.conformance import validate_contract
from screencraft.package import FormatError, make_document, read_document, starter_app


def sample():
    doc=starter_app()
    doc["screens"].append({
        "id":"details","name":"Details","viewport":{"width":390,"height":720},
        "layout":{"mode":"flow","overflow_x":"auto","overflow_y":"auto"},
        "nodes":[{"id":"table","type":"table","parent_id":None,
                  "props":{"dataset_id":"seed"},"layout":{"max_height":450,"overflow_x":"auto"}}]
    })
    doc["screen_order"]=["home","details"]
    doc["screens"][0]["nodes"]=[
        {"id":"intro","type":"text","parent_id":None,"props":{"text":"Hello"},"layout":{"width":300}},
        {"id":"next","type":"button","parent_id":None,"props":{"label":"Open"},
         "action":{"type":"navigate","target_screen":"details"}},
        {"id":"future","type":"x-diagram","parent_id":None,
         "props":{"future":{"key":"value"}}}
    ]
    doc["datasets"]=[{"id":"seed","columns":[{"id":"Name","type":"text"}],
                      "rows":[{"Name":"Example"}],"persistence":"seed-reset"}]
    doc["components"]=[{"id":"my-button","name":"Button","nodes":[]}]
    png=b"\x89PNG\r\n\x1a\n"+b"test-image"
    doc["assets"]=[{"id":"logo","path":"assets/logo.png","media_type":"image/png",
                    "sha256":sha256(png).hexdigest()}]
    doc["screens"][0]["nodes"].append({"id":"image","type":"image","parent_id":None,
                          "props":{"asset":"assets/logo.png"}})
    return doc,{"assets/logo.png":png}


def patch_zip(blob, name, data):
    with ZipFile(io.BytesIO(blob)) as original:
        entries={n:original.read(n) for n in original.namelist()}
    entries[name]=data
    out=io.BytesIO()
    with ZipFile(out,"w",ZIP_DEFLATED) as z:
        for n,payload in entries.items():z.writestr(n,payload)
    return out.getvalue()


def test_two_screen_fixture_preserves_future_fields_and_warns():
    doc,assets=sample()
    doc["future_extension"]={"semantic_version":"1.2"}
    blob=make_document(doc,assets)
    manifest,restored,files=read_document(blob)
    assert restored==doc
    assert files==assets
    warnings=validate_contract(manifest,restored,files,verify_assets=True)
    assert any("x-diagram" in w and "inactive placeholder" in w for w in warnings)


@pytest.mark.parametrize("change", [
    lambda x:x.update(screen_order=["home","home"]),
    lambda x:x.update(start_screen="missing"),
    lambda x:x["screens"][0].update(viewport={"width":0,"height":800}),
    lambda x:x["datasets"].append(deepcopy(x["datasets"][0])),
    lambda x:x["datasets"][0]["columns"].append({"id":"Name","type":"text"}),
    lambda x:x["screens"][0]["nodes"][1].update(action={"type":"navigate","target_screen":"bad"}),
    lambda x:x["screens"][0]["nodes"][1].update(action={"type":"run_python","script":"print(1)"}),
    lambda x:x["screens"][0]["nodes"][1].update(action={"type":"add_mock_row","dataset_id":"nonexistent"}),
    lambda x:x["screens"][0]["nodes"][0].update(parent_id="no-such-parent"),
    lambda x:x["screens"][0]["nodes"][0].update(layout=[]),
    lambda x:x["datasets"][0].update(rows=[{"Name":"demo"}]*1001),
    lambda x:x["assets"][0].update(media_type="text/html"),
    lambda x:x["assets"][0].update(sha256="0"*64),
])
def test_invalid_cross_references_are_blocked(change):
    doc,assets=sample()
    change(doc)
    with pytest.raises(FormatError):
        make_document(doc,assets)


def test_unsupported_major_version_rejected_and_minor_version_warned():
    doc,assets=sample()
    blob=make_document(doc,assets)
    with ZipFile(io.BytesIO(blob)) as z: manifest=json.loads(z.read("manifest.json"))
    manifest["format_version"]="2.0.0"
    with pytest.raises(FormatError):
        read_document(patch_zip(blob,"manifest.json",json.dumps(manifest).encode()))
    manifest["format_version"]="1.5.0"
    upgraded=patch_zip(blob,"manifest.json",json.dumps(manifest).encode())
    upgraded_manifest,restored,files=read_document(upgraded)
    assert restored==doc
    assert any("newer v1 minor" in w for w in validate_contract(upgraded_manifest,restored,files,verify_assets=True))


def test_split_screen_ref_resolves_into_self_contained_document():
    doc,assets=sample()
    blob=make_document(doc,assets)
    with ZipFile(io.BytesIO(blob)) as z: entries={p:z.read(p) for p in z.namelist()}
    inline=json.loads(entries["application.json"])
    detail=inline["screens"][1]
    inline["screens"][1]={"$ref":"screens/detail.json"}
    entries["application.json"]=json.dumps(inline).encode()
    entries["screens/detail.json"]=json.dumps(detail).encode()
    out=io.BytesIO()
    with ZipFile(out,"w",ZIP_DEFLATED) as z:
        for p,payload in entries.items():z.writestr(p,payload)
    manifest,restored,files=read_document(out.getvalue())
    assert restored==doc
    normalized=make_document(restored,files,manifest)
    with ZipFile(io.BytesIO(normalized)) as z:
        assert "screens/detail.json" not in z.namelist()
    assert read_document(normalized)[1]==doc


def test_remote_and_cyclic_refs_rejected():
    blob=make_document(starter_app())
    for ref in ("https://remote.invalid/a.json","screens/../bad.json","screens/home.json"):
        with ZipFile(io.BytesIO(blob)) as z: entries={n:z.read(n) for n in z.namelist()}
        doc=json.loads(entries["application.json"])
        doc["screens"][0]={"$ref":ref}
        entries["application.json"]=json.dumps(doc).encode()
        if ref=="screens/home.json":entries[ref]=json.dumps({"$ref":ref}).encode()
        out=io.BytesIO()
        with ZipFile(out,"w",ZIP_DEFLATED) as z:
            for name,payload in entries.items():z.writestr(name,payload)
        with pytest.raises(FormatError):read_document(out.getvalue())


def test_duplicate_json_key_rejected():
    blob=make_document(starter_app())
    original=b'{"application_id":"local","application_id":"overridden"}'
    with pytest.raises(FormatError):
        read_document(patch_zip(blob,"application.json",original))


def test_json_depth_limit_rejected():
    doc,assets=sample()
    nested={}
    p=nested
    for i in range(75):
        p["child"]={}
        p=p["child"]
    doc["future_extension"]=nested
    with pytest.raises(FormatError,match="depth"):
        make_document(doc,assets)
