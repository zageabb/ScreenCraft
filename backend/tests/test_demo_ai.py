"""Demo and AI safeguards — no network model required."""
from screencraft.api import create_app
from screencraft.package import read_document
import pytest

@pytest.fixture
def client(tmp_path,monkeypatch):
    monkeypatch.setenv("SCREENCRAFT_SETUP_KEY","setup-test-demo")
    a=create_app({"TESTING":True,"SQLALCHEMY_URL":"sqlite:///"+str(tmp_path/"demo.db"),"SESSION_COOKIE_SECURE":False})
    c=a.test_client()
    assert c.post("/api/bootstrap",json={"setup_key":"setup-test-demo","username":"admin","password":"test-password-strong-123"}).status_code==201
    return c

def test_shared_demo_is_visible_and_immutable(client):
    projects=client.get("/api/projects").json["projects"]
    assert projects[0]["id"]=="screencraft-demo"
    assert projects[0]["role"]=="viewer"
    response=client.get("/api/projects/screencraft-demo")
    assert response.status_code==200
    document=response.json["document"]
    assert len(document["screens"])>=7
    assert len({node["type"] for screen in document["screens"] for node in screen["nodes"]})==39
    assert len(document["datasets"][0]["rows"])>0
    archive=client.get("/api/projects/screencraft-demo/download")
    assert archive.status_code==200
    assert read_document(archive.data)[1]["name"]==document["name"]
    assert client.get("/api/projects/screencraft-demo/export/html").status_code==200
    assert client.put("/api/projects/screencraft-demo",json={"revision":1,"document":document}).status_code==403
    assert client.post("/api/ai/propose",json={"project_id":"screencraft-demo","document":document,"instruction":"change this"}).status_code==403

def test_ai_rejects_missing_project_and_empty_message(client):
    assert client.post("/api/ai/propose",json={"project_id":"unknown","instruction":"hello","document":{"screens":[]}}).status_code==403
    assert client.post("/api/ai/propose",json={"project_id":"unknown","instruction":"","document":{"screens":[]}}).status_code==400
    assert client.get("/api/help/catalogue").status_code==200
