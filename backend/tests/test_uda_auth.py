"""UDA-authenticated ScreenCraft must never trust a spoofed identity on its own."""
from sqlalchemy.orm import Session
from sqlalchemy import select
from screencraft.api import create_app
from screencraft.store import User

PROXY_SECRET="very-long-uda-proxy-secret-for-testing-only"
IDENTITY="gerald.abbot@gmail.com"


def build_app(tmp_path):
    return create_app({
        "TESTING":True,
        "SQLALCHEMY_URL":"sqlite:///"+str(tmp_path/"uda.db"),
        "AUTH_MODE":"uda",
        "UDA_PROXY_SECRET":PROXY_SECRET,
        "UDA_IDENTITY_HEADER":"X-UDA-User",
        "SESSION_COOKIE_SECURE":False,
    })


def trusted(name=IDENTITY,secret=PROXY_SECRET):
    return {"X-UDA-User":name,"X-ScreenCraft-Proxy-Secret":secret}


def test_uda_identity_required_every_request(tmp_path):
    app=build_app(tmp_path)
    c=app.test_client()
    assert c.get("/api/auth-mode").json["mode"]=="uda"
    assert c.get("/api/me").status_code==401
    assert c.get("/api/me",headers={"X-UDA-User":IDENTITY}).status_code==401
    assert c.get("/api/me",headers={"X-UDA-User":IDENTITY,"X-ScreenCraft-Proxy-Secret":"not-authorised"}).status_code==401
    assert c.get("/api/me",headers=trusted()).status_code==200
    # A valid prior cookie must not bypass a subsequent missing proxy assertion.
    assert c.get("/api/projects").status_code==401
    assert c.get("/api/projects",headers=trusted()).status_code==200
    assert c.post("/api/login",headers=trusted(),json={"username":IDENTITY,"password":"password"}).status_code==403
    assert c.post("/api/logout",headers=trusted()).status_code==403
    assert c.post("/api/bootstrap",headers=trusted(),json={}).status_code==403


def test_uda_new_user_is_not_admin_and_has_no_existing_projects(tmp_path):
    app=build_app(tmp_path)
    c=app.test_client()
    me=c.get("/api/me",headers=trusted("new.person@example.com"))
    assert me.status_code==200
    assert me.json["is_admin"] is False
    assert [p for p in c.get("/api/projects",headers=trusted("new.person@example.com")).json["projects"] if p["id"]!="screencraft-demo"]==[]
    assert c.post("/api/users",headers=trusted("new.person@example.com"),json={
       "username":"other","password":"password-password"}).status_code==403
    assert c.get("/api/me",headers=trusted("invalid name!")).status_code==401


def test_existing_local_account_keeps_identity_and_projects(tmp_path):
    dbfile=tmp_path/"uda.db"
    legacy=create_app({
        "TESTING":True,"SQLALCHEMY_URL":"sqlite:///"+str(dbfile),
        "SESSION_COOKIE_SECURE":False,
    })
    from screencraft.store import create_user,create_project
    from screencraft.package import starter_app,make_document
    engine=legacy.extensions["screencraft_engine"]
    owner=create_user(engine,IDENTITY,"hashed-legacy-password",is_admin=True)
    project=create_project(engine,owner,"Existing design",make_document(starter_app()))
    app=build_app(tmp_path)
    authenticated=app.test_client()
    response=authenticated.get("/api/me",headers=trusted())
    assert response.status_code==200
    assert response.json["id"]==owner
    assert response.json["is_admin"] is True
    projects=authenticated.get("/api/projects",headers=trusted()).json["projects"]
    assert len([p for p in projects if p["id"]!="screencraft-demo"])==1 and any(p["id"]==project for p in projects)
    with Session(engine) as db:
        assert len(db.scalars(select(User)).all())==1


def test_uda_mode_fails_closed_without_32_character_secret(tmp_path):
    import pytest
    with pytest.raises(RuntimeError,match="PROXY_SECRET"):
        create_app({
           "TESTING":True,"SQLALCHEMY_URL":"sqlite:///"+str(tmp_path/"bad.db"),
           "AUTH_MODE":"uda","UDA_PROXY_SECRET":"short"
        })
