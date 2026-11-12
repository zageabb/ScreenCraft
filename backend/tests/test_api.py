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
          "file":(io.BytesIO(b"\x89PNG\r\n\x1a\n"+b"dummy"),"logo.png")}
    response=c.post("/api/projects/"+pid+"/images",data=data,content_type="multipart/form-data")
    assert response.status_code==201,response.json
    path=response.json["path"]
    saved=c.get("/api/projects/"+pid+"/download")
    _,app_doc,assets=read_document(saved.data)
    assert path in assets and any(a["path"]==path for a in app_doc["assets"])
    assert c.get("/api/projects/"+pid+"/images/"+path.replace("assets/","")).status_code==200
    assert b"data:image/png;base64," in c.get("/api/projects/"+pid+"/export/html").data

def test_caddy_prefix_headers_and_cookie_scope(tmp_path,monkeypatch):
    monkeypatch.setenv("SCREENCRAFT_TRUST_PROXY","1")
    monkeypatch.setenv("SCREENCRAFT_SETUP_KEY","caddy-setup-key")
    scoped=create_app({"TESTING":True,"SQLALCHEMY_URL":"sqlite:///"+str(tmp_path/"proxy.db"),
                       "SESSION_COOKIE_SECURE":True,"SESSION_COOKIE_PATH":"/apps/screencraft"})
    client=scoped.test_client()
    headers={"X-Forwarded-Prefix":"/apps/screencraft","X-Forwarded-Proto":"https"}
    assert client.get("/api/health",headers=headers).status_code==200
    resp=client.post("/api/bootstrap",headers=headers,
         json={"setup_key":"caddy-setup-key","username":"proxyadmin","password":"a-long-proxy-password!"})
    assert resp.status_code==201
    cookie=resp.headers["Set-Cookie"]
    assert "Path=/apps/screencraft" in cookie
    assert "Secure" in cookie and "HttpOnly" in cookie
    assert "screencraft_session" in cookie

def test_shared_github_token_requires_server_admin(app,monkeypatch):
    monkeypatch.setenv("SCREENCRAFT_ALLOWED_REPOS","zageabb/example-app")
    c=app.test_client()
    c.post("/api/bootstrap",json={"setup_key":"test-setup-secret","username":"admin","password":"A-Very-Long-Password!"})
    created=c.post("/api/users",json={"username":"designer","password":"A-Designer-Password!"})
    assert created.status_code==201,created.json
    c.post("/api/logout")
    assert c.post("/api/login",json={"username":"designer","password":"A-Designer-Password!"}).status_code==200
    assert c.get("/api/github/zageabb/example-app/scraft").status_code==403

def test_api_error_is_json_not_spa(app):
    c=app.test_client()
    missing=c.get("/api/does-not-exist")
    assert missing.status_code==404
    assert missing.is_json
    assert missing.json["error"]=="Unknown API endpoint"
    wrong=c.post("/api/health")
    assert wrong.status_code==405
    assert wrong.is_json

def test_create_project_through_caddy_prefix(tmp_path,monkeypatch):
    """Simulate Caddy handle_path stripping /apps/screencraft and forwarding trusted headers."""
    monkeypatch.setenv("SCREENCRAFT_TRUST_PROXY","1")
    monkeypatch.setenv("SCREENCRAFT_SETUP_KEY","prefix-test-key")
    deployed=create_app({
        "TESTING":True,
        "SQLALCHEMY_URL":"sqlite:///"+str(tmp_path/"routed.db"),
        "SESSION_COOKIE_SECURE":False,
        "SESSION_COOKIE_PATH":"/apps/screencraft",
    })
    c=deployed.test_client()
    headers={"X-Forwarded-Prefix":"/apps/screencraft","X-Forwarded-Proto":"https"}
    # Use the actual public prefix for the test client so its path-scoped
    # session cookie is returned as a real browser would return it.
    setup=c.post("/apps/screencraft/api/bootstrap",headers=headers,
        environ_overrides={"SCRIPT_NAME":"/apps/screencraft","PATH_INFO":"/api/bootstrap"},json={
        "setup_key":"prefix-test-key",
        "username":"routeadmin",
        "password":"long-enough-test-password"
    })
    assert setup.status_code==201
    created=c.post("/apps/screencraft/api/projects",headers=headers,
        environ_overrides={"SCRIPT_NAME":"/apps/screencraft","PATH_INFO":"/api/projects"},
        json={"name":"Test Application"})
    assert created.status_code==201
    assert created.is_json and created.json["id"]
    loaded=c.get("/apps/screencraft/api/projects",headers=headers,
        environ_overrides={"SCRIPT_NAME":"/apps/screencraft","PATH_INFO":"/api/projects"})
    assert loaded.status_code==200 and loaded.is_json
    assert loaded.json["projects"][0]["name"]=="Test Application"
