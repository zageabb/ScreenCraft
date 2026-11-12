from io import BytesIO
from zipfile import ZipFile,ZIP_DEFLATED
import pytest
from screencraft.package import starter_app,read_document,make_document,FormatError

def test_round_trip():
    app=starter_app()
    blob=make_document(app)
    manifest,actual,assets=read_document(blob)
    assert manifest["format_version"]=="1.0.0"
    assert actual==app and assets=={}
    assert make_document(actual,manifest=manifest)

def test_image_asset_round_trip():
    image=b"\x89PNG\r\n\x1a\n"+b"fake-test-data"
    blob=make_document(starter_app(),{"assets/logo.png":image})
    assert read_document(blob)[2]["assets/logo.png"]==image

def test_reject_executables():
    with pytest.raises(FormatError):
        make_document(starter_app(),{"assets/bad.exe":b"oops"})

def test_reject_traversal_zip():
    data=BytesIO()
    with ZipFile(data,"w",ZIP_DEFLATED) as z:
        z.writestr("../evil.json","{}")
        z.writestr("manifest.json","{}")
        z.writestr("application.json","{}")
    with pytest.raises(FormatError):
        read_document(data.getvalue())

def test_reject_unsupported_version():
    data=make_document(starter_app())
    with ZipFile(BytesIO(data)) as z: entries={n:z.read(n) for n in z.namelist()}
    entries["manifest.json"]=entries["manifest.json"].replace(b"1.0.0",b"2.0.0")
    stream=BytesIO()
    with ZipFile(stream,"w",ZIP_DEFLATED) as z:
        for k,v in entries.items():z.writestr(k,v)
    with pytest.raises(FormatError):read_document(stream.getvalue())

def test_reject_cycle():
    app=starter_app()
    app["screens"][0]["nodes"]=[{"id":"heading","type":"text","parent_id":"start"},{"id":"start","type":"button","parent_id":"heading"}]
    with pytest.raises(FormatError):make_document(app)

def test_reject_invalid_navigation():
    app=starter_app()
    app["screens"][0]["nodes"]=[{"id":"start","type":"button","parent_id":None,"action":{"type":"navigate","target_screen":"missing"}}]
    with pytest.raises(FormatError):make_document(app)

def test_new_application_starts_without_unrequested_demo_button():
    app=starter_app()
    assert app["screens"][0]["nodes"]==[]
    assert app["start_screen"]=="home"
    assert read_document(make_document(app))[1]==app


def test_nested_catalogue_extensions_preserve_unknown_metadata_and_screen_order():
    app=starter_app()
    app["screens"].append({"id":"details","name":"Details","viewport":{"width":800,"height":600},
        "layout":{"mode":"freeform"},"nodes":[]})
    app["screen_order"]=["details","home"]
    app["screens"][0]["nodes"]=[
        {"id":"card","type":"x-card","parent_id":None,"props":{"label":"Card"},"layout":{"width":400}},
        {"id":"button","type":"button","parent_id":"card","props":{"label":"Edit"},
          "action":{"type":"navigate","target_screen":"details"}},
        {"id":"unknown","type":"x-diagram","parent_id":"card",
         "props":{"vendor_specific":"retained"},"responsive":[{"min_width":0,"layout":{"width":"fill"}}]}
    ]
    manifest,actual,_=read_document(make_document(app))
    assert manifest["format_version"]=="1.0.0"
    assert actual==app
    assert actual["screen_order"]==["details","home"]
    assert actual["screens"][0]["nodes"][2]["props"]["vendor_specific"]=="retained"
