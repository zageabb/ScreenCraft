import pytest
from screencraft.api import create_app
from screencraft.package import read_document

@pytest.fixture
def app(tmp_path,monkeypatch):
    monkeypatch.setenv("SCREENCRAFT_SETUP_KEY","test-setup-secret")
    app=create_app({"TESTING":True,"SQLALCHEMY_URL":"sqlite:///"+str(tmp_path/"test.db"),"SESSION_COOKIE_SECURE":False})
    yield app

def test_health_and_auth(app):
    c=app.test_client()
    assert c.get("/api/health").json["status"]=="ok"
    assert c.get("/api/projects").status_code==401
    assert c.post("/api/bootstrap",json={"setup_key":"test-setup-secret","username":"admin","password":"A-Very-Long-Password!"}).status_code==201
    assert c.post("/api/bootstrap",json={"setup_key":"test-setup-secret","username":"other","password":"A-Very-Long-Password!"}).status_code==403
    p=c.post("/api/projects",json={"name":"Demo"})
    assert p.status_code==201
    pid=p.json["id"]
    info=c.get("/api/projects/"+pid).json
    assert info["document"]["name"]=="Demo"
    downloaded=c.get("/api/projects/"+pid+"/download")
    assert read_document(downloaded.data)[1]["name"]=="Demo"
    export=c.get("/api/projects/"+pid+"/export/html")
    assert export.status_code==200
    assert b"application/json" in export.data
    assert b"sc-document" in export.data

def test_project_revision_conflict(app):
    c=app.test_client()
    c.post("/api/bootstrap",json={"setup_key":"test-setup-secret","username":"admin","password":"A-Very-Long-Password!"})
    pid=c.post("/api/projects",json={"name":"Demo"}).json["id"]
    original=c.get("/api/projects/"+pid).json["document"]
    assert c.put("/api/projects/"+pid,json={"document":original,"revision":1}).json["revision"]==2
    assert c.put("/api/projects/"+pid,json={"document":original,"revision":1}).status_code==409

def test_unauthorized_github(app):
    c=app.test_client()
    c.post("/api/bootstrap",json={"setup_key":"test-setup-secret","username":"admin","password":"A-Very-Long-Password!"})
    assert c.get("/api/github/random/unapproved/scraft").status_code==403

def test_image_upload_bundled_export(app):
    import io
    c=app.test_client()
    c.post("/api/bootstrap",json={"setup_key":"test-setup-secret","username":"admin","password":"A-Very-Long-Password!"})
    pid=c.post("/api/projects",json={"name":"Image demo"}).json["id"]
    data={"revision":"1","screen_id":"home","node_id":"heading",
          "file":(io.BytesIO(b"\\x89PNG\\r\\n\\x1a\\n"+b"dummy"),"logo.png")}
    response=c.post("/api/projects/"+pid+"/images",data=data,content_type="multipart/form-data")
    assert response.status_code==201,response.json
    path=response.json["path"]
    saved=c.get("/api/projects/"+pid+"/download")
    _,app_doc,assets=read_document(saved.data)
    assert path in assets and any(a["path"]==path for a in app_doc["assets"])
    assert c.get("/api/projects/"+pid+"/images/"+path.replace("assets/","")).status_code==200
    assert b"data:image/png;base64," in c.get("/api/projects/"+pid+"/export/html").data
