"""Flask HTTP API, scoped for Caddy /apps/screencraft/ and direct-root development."""
from __future__ import annotations
import io
import os
import re
from functools import wraps
from pathlib import Path
from urllib.parse import quote
import requests
from flask import Flask, request, jsonify, session, send_file, abort, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
from sqlalchemy import select
from sqlalchemy.orm import Session
from .package import FormatError, read_document, make_document, starter_app, MAX_ARCHIVE
from .export import interactive_html
from .store import connect, User, Project, Membership, create_user, create_project, get_project, update_project, set_membership, get_role, mutate_rows

def create_app(config=None):
    app=Flask(__name__,static_folder=None)
    app.config.update(
        SECRET_KEY=os.environ.get("SCREENCRAFT_SECRET_KEY",""),
        SQLALCHEMY_URL=os.environ.get("DATABASE_URL","sqlite:///screencraft.db"),
        SESSION_COOKIE_NAME="screencraft_session",
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("SCREENCRAFT_COOKIE_SECURE","1")=="1",
        MAX_CONTENT_LENGTH=MAX_ARCHIVE+4096,
        GITHUB_TOKEN=os.environ.get("SCREENCRAFT_GITHUB_TOKEN",""))
    if config:app.config.update(config)
    if not app.config["SECRET_KEY"] and not app.config.get("TESTING"):
        raise RuntimeError("Set SCREENCRAFT_SECRET_KEY before deployment")
    if app.config.get("TESTING") and not app.config["SECRET_KEY"]:app.config["SECRET_KEY"]="test-secret"
    # LOCAL_UBUNTU_PROXY_COMPAT: forwarded prefix must only be trusted from private Caddy hop.
    if os.environ.get("SCREENCRAFT_TRUST_PROXY")=="1":
        app.wsgi_app=ProxyFix(app.wsgi_app,x_for=1,x_proto=1,x_host=1,x_prefix=1)
    engine=connect(app.config["SQLALCHEMY_URL"])
    app.extensions["screencraft_engine"]=engine

    def auth(fn):
        @wraps(fn)
        def wrapper(*args,**kwargs):
            if not session.get("user_id"):return jsonify(error="Authentication required"),401
            return fn(*args,**kwargs)
        return wrapper

    @app.errorhandler(FormatError)
    def format_error(e):return jsonify(error=str(e)),400
    @app.errorhandler(PermissionError)
    def permission_error(e):return jsonify(error=str(e)),403
    @app.errorhandler(ValueError)
    def value_error(e):return jsonify(error=str(e)),409

    @app.get("/api/health")
    def health():return jsonify(status="ok",version="0.1.0")
    @app.post("/api/bootstrap")
    def bootstrap():
        with Session(engine) as db:
            if db.scalar(select(User.id).limit(1)):
                return jsonify(error="Already initialized"),403
        key=os.environ.get("SCREENCRAFT_SETUP_KEY")
        if not key or request.json.get("setup_key")!=key:return jsonify(error="Setup key required"),403
        username=request.json.get("username","").strip()
        password=request.json.get("password","")
        if len(username)<3 or len(password)<12:return jsonify(error="Invalid credentials"),400
        uid=create_user(engine,username,generate_password_hash(password))
        session["user_id"]=uid
        return jsonify(id=uid,username=username),201

    @app.post("/api/login")
    def login():
        username=(request.json or {}).get("username","")
        password=(request.json or {}).get("password","")
        with Session(engine) as db:
            user=db.scalar(select(User).where(User.username==username))
            if not user or not check_password_hash(user.password_hash,password):
                return jsonify(error="Invalid login"),401
            session.clear();session["user_id"]=user.id
            return jsonify(id=user.id,username=user.username)
    @app.post("/api/logout")
    def logout():session.clear();return jsonify(ok=True)
    @app.get("/api/me")
    @auth
    def me():
        with Session(engine) as db:
            user=db.get(User,session["user_id"])
            return jsonify(id=user.id,username=user.username)

    @app.get("/api/projects")
    @auth
    def projects():
        with Session(engine) as db:
            items=db.execute(select(Project,Membership.role).join(Membership,Membership.project_id==Project.id).where(Membership.user_id==session["user_id"])).all()
            return jsonify(projects=[{"id":p.id,"name":p.name,"revision":p.revision,"role":role} for p,role in items])
    @app.post("/api/projects")
    @auth
    def project_create():
        payload=request.get_json() or {}
        name=str(payload.get("name","Untitled"))[:200]
        document=starter_app();document["name"]=name
        p=create_project(engine,session["user_id"],name,make_document(document))
        return jsonify(id=p,revision=1),201
    @app.get("/api/projects/<project_id>")
    @auth
    def project_read(project_id):
        p=get_project(engine,project_id,session["user_id"])
        manifest,document,assets=read_document(p["archive"])
        return jsonify(id=p["id"],revision=p["revision"],role=p["role"],document=document,manifest=manifest)
    @app.put("/api/projects/<project_id>")
    @auth
    def project_save(project_id):
        payload=request.get_json() or {}
        document=payload.get("document")
        if not isinstance(document,dict):return jsonify(error="Missing document"),400
        old=get_project(engine,project_id,session["user_id"])
        manifest,_,assets=read_document(old["archive"])
        manifest["document_revision"]=manifest.get("document_revision",1)+1
        new=make_document(document,assets,manifest)
        revision=update_project(engine,project_id,session["user_id"],new,int(payload.get("revision",0)))
        return jsonify(revision=revision)
    @app.get("/api/projects/<project_id>/download")
    @auth
    def download(project_id):
        p=get_project(engine,project_id,session["user_id"])
        return send_file(io.BytesIO(p["archive"]),mimetype="application/zip",as_attachment=True,download_name="application.scraft")
    @app.post("/api/projects/<project_id>/upload")
    @auth
    def upload(project_id):
        if "file" not in request.files:return jsonify(error="Missing file"),400
        blob=request.files["file"].read(MAX_ARCHIVE+1)
        read_document(blob)
        rev=int(request.form.get("revision",0))
        revision=update_project(engine,project_id,session["user_id"],blob,rev)
        return jsonify(revision=revision)
    @app.get("/api/projects/<project_id>/export/html")
    @auth
    def export_html(project_id):
        p=get_project(engine,project_id,session["user_id"])
        _,document,assets=read_document(p["archive"])
        # PNG image embedding is a later-phase item; do not silently emit incomplete asset representations.
        if assets:return jsonify(error="Interactive HTML export with embedded binary assets not yet supported"),501
        return send_file(io.BytesIO(interactive_html(document).encode()),mimetype="text/html",as_attachment=True,download_name="prototype.html")
    @app.post("/api/projects/<project_id>/members")
    @auth
    def member(project_id):
        payload=request.get_json() or {}
        with Session(engine) as db:
            target=db.scalar(select(User).where(User.username==payload.get("username")))
            if not target:return jsonify(error="User not found"),404
        set_membership(engine,project_id,session["user_id"],target.id,payload.get("role","viewer"))
        return jsonify(ok=True)
    @app.post("/api/projects/<project_id>/data/<dataset_id>")
    @auth
    def data(project_id,dataset_id):
        p=get_project(engine,project_id,session["user_id"])
        _,document,_=read_document(p["archive"])
        dataset=next((d for d in document.get("datasets",[]) if d.get("id")==dataset_id),None)
        if not dataset:return jsonify(error="Unknown dataset"),404
        body=request.get_json() or {}
        mode=body.get("mode","seed-reset")
        result=mutate_rows(engine,project_id,session["user_id"],dataset_id,mode,dataset.get("rows",[]),body.get("operation","list"),
                           values=body.get("values"),row_index=body.get("row_index"),session_id=body.get("session_id"),expected_revision=body.get("revision"))
        return jsonify(result)

    @app.get("/api/github/<owner>/<repo>/scraft")
    @auth
    def repo_read(owner,repo):
        token=app.config["GITHUB_TOKEN"]
        if not token:return jsonify(error="GitHub integration not_configured"),503
        path=request.args.get("path","design/screencraft/application.scraft")
        ref=request.args.get("ref","main")
        if not re.fullmatch(r"[A-Za-z0-9_.-]+",owner) or not re.fullmatch(r"[A-Za-z0-9_.-]+",repo) or not re.fullmatch(r"[A-Za-z0-9_./-]{1,200}",path) or ".." in path.split("/"):
            return jsonify(error="Invalid repository path"),400
        import base64
        from urllib.request import Request, urlopen
        url=f"https://api.github.com/repos/{owner}/{repo}/contents/{quote(path,safe='/')}?ref={quote(ref,safe='')}"
        req=Request(url,headers={"Authorization":"Bearer "+token,"Accept":"application/vnd.github+json","User-Agent":"ScreenCraft"})
        with urlopen(req,timeout=12) as resp:result=json.load(resp)
        data=base64.b64decode(result["content"])
        read_document(data)
        return send_file(io.BytesIO(data),as_attachment=True,download_name="application.scraft",mimetype="application/zip")

    dist=Path(__file__).resolve().parents[2]/"frontend"/"dist"
    @app.get("/")
    @app.get("/<path:asset>")
    def spa(asset="index.html"):
        if asset.startswith("api/"):abort(404)
        if not dist.is_dir():return jsonify(status="frontend_not_built",message="Build frontend with npm run build"),503
        target=(dist/asset).resolve()
        if not target.is_relative_to(dist.resolve()) or not target.is_file():
            target=dist/"index.html"
        return send_from_directory(dist,target.relative_to(dist).as_posix())
    return app

if __name__=="__main__":create_app().run(host="127.0.0.1",port=8085)
