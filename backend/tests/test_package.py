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
    app["screens"][0]["nodes"][0]["parent_id"]="start"
    app["screens"][0]["nodes"][1]["parent_id"]="heading"
    with pytest.raises(FormatError):make_document(app)

def test_reject_invalid_navigation():
    app=starter_app()
    app["screens"][0]["nodes"][1]["action"]={"type":"navigate","target_screen":"missing"}
    with pytest.raises(FormatError):make_document(app)
