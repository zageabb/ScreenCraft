"""Flask HTTP API, scoped for Caddy /apps/screencraft/ and direct-root development."""
from __future__ import annotations
import io
import json
import base64
import hashlib
import mimetypes
import os
import re
from functools import wraps
from pathlib import Path
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError
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
        SESSION_COOKIE_SAMESITE="Strict",
        SESSION_COOKIE_PATH=os.environ.get("SCREENCRAFT_COOKIE_PATH","/"),
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
    engine=connect(app.config["SQLALCHEMY_URL"],auto_create=bool(app.config.get("TESTING")) or os.environ.get("SCREENCRAFT_AUTO_CREATE_SCHEMA")=="1")
    app.extensions["screencraft_engine"]=engine

    @app.before_request
    def same_origin_mutations():
        if request.method in ("POST","PUT","PATCH","DELETE"):
            origin=request.headers.get("Origin")
            if origin and urlsplit(origin).netloc != request.host:
                return jsonify(error="Cross-origin modification denied"),403

    def auth(fn):
        @wraps(fn)
        def wrapper(*args,**kwargs):
            if not session.get("user_id"):return jsonify(error="Authentication required"),401
            return fn(*args,**kwargs)
        return wrapper

    @app.errorhandler(404)
    def missing_route(e):
        if request.path.startswith("/api/"):
            return jsonify(error="Unknown API endpoint",path=request.path),404
        return e

    @app.errorhandler(405)
    def wrong_method(e):
        if request.path.startswith("/api/"):
            return jsonify(error="Method not allowed",path=request.path),405
        return e

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
        uid=create_user(engine,username,generate_password_hash(password),is_admin=True)
        session["user_id"]=uid
        return jsonify(id=uid,username=username,is_admin=True),201

    @app.post("/api/login")
    def login():
        username=(request.json or {}).get("username","")
        password=(request.json or {}).get("password","")
        with Session(engine) as db:
            user=db.scalar(select(User).where(User.username==username))
            if not user or not check_password_hash(user.password_hash,password):
                return jsonify(error="Invalid login"),401
            session.clear();session["user_id"]=user.id
            return jsonify(id=user.id,username=user.username,is_admin=user.is_admin)
    @app.post("/api/logout")
    def logout():session.clear();return jsonify(ok=True)
    @app.get("/api/me")
    @auth
    def me():
        with Session(engine) as db:
            user=db.get(User,session["user_id"])
            return jsonify(id=user.id,username=user.username,is_admin=user.is_admin)

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
        return send_file(io.BytesIO(interactive_html(document, assets).encode()),mimetype="text/html",as_attachment=True,download_name="prototype.html")
    @app.post("/api/projects/<project_id>/images")
    @auth
    def upload_image(project_id):
        old=get_project(engine,project_id,session["user_id"])
        if old["role"] not in ("owner","admin","designer"):
            raise PermissionError("Project edit denied")
        if "file" not in request.files:
            return jsonify(error="Missing image"),400
        uploaded=request.files["file"]
        data=uploaded.read(12*1024*1024+1)
        if len(data)>12*1024*1024:
            return jsonify(error="Image exceeds 12 MB"),413
        ext=Path(uploaded.filename or "").suffix.lower()
        from .package import ALLOWED_IMAGES
        if ext not in ALLOWED_IMAGES or not data.startswith(ALLOWED_IMAGES[ext]):
            return jsonify(error="Unsupported image or invalid image signature"),400
        if ext==".webp" and data[8:12]!=b"WEBP":
            return jsonify(error="Invalid WebP image"),400
        digest=hashlib.sha256(data).hexdigest()
        name="assets/"+digest+ext
        manifest,document,assets=read_document(old["archive"])
        assets[name]=data
        document.setdefault("assets",[])
        if not any(a.get("path")==name for a in document["assets"]):
            document["assets"].append({"id":digest[:16],"path":name,"media_type":mimetypes.guess_type(name)[0],"sha256":digest})
        node_id=request.form.get("node_id")
        screen_id=request.form.get("screen_id")
        if node_id and screen_id:
            for screen in document.get("screens",[]):
                if screen.get("id")==screen_id:
                    for node in screen.get("nodes",[]):
                        if node.get("id")==node_id and node.get("type")=="image":
                            node.setdefault("props",{})["asset"]=name
        manifest["document_revision"]=manifest.get("document_revision",1)+1
        packed=make_document(document,assets,manifest)
        revision=update_project(engine,project_id,session["user_id"],packed,int(request.form.get("revision",0)))
        return jsonify(revision=revision,path=name,sha256=digest),201

    @app.get("/api/projects/<project_id>/images/<path:asset_name>")
    @auth
    def get_image(project_id,asset_name):
        p=get_project(engine,project_id,session["user_id"])
        _,_,assets=read_document(p["archive"])
        name="assets/"+asset_name
        if name not in assets:abort(404)
        return send_file(io.BytesIO(assets[name]),mimetype=mimetypes.guess_type(name)[0] or "application/octet-stream",max_age=3600)

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

    def github_allowed(owner,repo,path):
        # Server token is shared; only the server administrator may use it.
        # Delegated repo access requires per-user credentials and a separate security review.
        with Session(engine) as db:
            actor=db.get(User,session["user_id"])
            if not actor or not actor.is_admin:
                raise PermissionError("Server administrator required for GitHub integration")
        allowed={s.strip().lower() for s in os.environ.get("SCREENCRAFT_ALLOWED_REPOS","").split(",") if s.strip()}
        if (owner+"/"+repo).lower() not in allowed:
            raise PermissionError("Repository is not allowlisted by administrator")
        if not re.fullmatch(r"[A-Za-z0-9_.-]+",owner) or not re.fullmatch(r"[A-Za-z0-9_.-]+",repo) or not re.fullmatch(r"[A-Za-z0-9_./-]{1,200}",path) or ".." in path.split("/") or not path.endswith(".scraft"):
            raise ValueError("Invalid repository path")

    def github_request(owner,repo,endpoint,method="GET",payload=None):
        token=app.config["GITHUB_TOKEN"]
        if not token:raise ValueError("GitHub integration not_configured")
        url=f"https://api.github.com/repos/{owner}/{repo}/"+endpoint
        args={"headers":{"Authorization":"Bearer "+token,"Accept":"application/vnd.github+json","User-Agent":"ScreenCraft"},"method":method,"timeout":12}
        if payload is not None:
            args["data"]=json.dumps(payload).encode("utf-8")
            args["headers"]["Content-Type"]="application/json"
        try:
            with urlopen(Request(url,**{k:v for k,v in args.items() if k!="timeout"}),timeout=12) as response:
                return json.load(response)
        except HTTPError as e:
            raise ValueError("GitHub API rejected request: "+str(e.code)) from e

    @app.get("/api/github/<owner>/<repo>/scraft")
    @auth
    def repo_read(owner,repo):
        path=request.args.get("path","design/screencraft/application.scraft")
        ref=request.args.get("ref","main")
        github_allowed(owner,repo,path)
        result=github_request(owner,repo,"contents/"+quote(path,safe="/")+"?ref="+quote(ref,safe=""))
        data=base64.b64decode(result["content"])
        read_document(data)
        return send_file(io.BytesIO(data),as_attachment=True,download_name="application.scraft",mimetype="application/zip")

    @app.post("/api/projects/<project_id>/github-pull")
    @auth
    def github_pull(project_id):
        data=request.get_json() or {}
        owner=data.get("owner","");repo=data.get("repo","");path=data.get("path","design/screencraft/application.scraft")
        ref=data.get("ref","main")
        github_allowed(owner,repo,path)
        old=get_project(engine,project_id,session["user_id"])
        if old["role"] not in ("owner","admin","designer"):raise PermissionError("Project edit denied")
        result=github_request(owner,repo,"contents/"+quote(path,safe="/")+"?ref="+quote(ref,safe=""))
        blob=base64.b64decode(result["content"])
        read_document(blob)
        revision=update_project(engine,project_id,session["user_id"],blob,int(data.get("revision",0)))
        return jsonify(revision=revision,source_sha=result["sha"])

    @app.post("/api/projects/<project_id>/github-pr")
    @auth
    def github_push(project_id):
        data=request.get_json() or {}
        owner=data.get("owner","");repo=data.get("repo","");path=data.get("path","design/screencraft/application.scraft")
        base=data.get("base","main")
        github_allowed(owner,repo,path)
        p=get_project(engine,project_id,session["user_id"])
        if p["role"] not in ("owner","admin","designer"):raise PermissionError("Project edit denied")
        # New unique branch per proposed save; do not overwrite protected main.
        from uuid import uuid4
        heads=github_request(owner,repo,"git/ref/heads/"+quote(base,safe="/"))
        branch="screencraft/design-"+uuid4().hex[:12]
        github_request(owner,repo,"git/refs",method="POST",payload={"ref":"refs/heads/"+branch,"sha":heads["object"]["sha"]})
        existing_sha=None
        try:
            existing=github_request(owner,repo,"contents/"+quote(path,safe="/")+"?ref="+quote(base,safe=""))
            existing_sha=existing.get("sha")
        except ValueError:
            pass
        file_payload={"message":"design: update ScreenCraft .scraft prototype","content":base64.b64encode(p["archive"]).decode("ascii"),"branch":branch}
        if existing_sha:file_payload["sha"]=existing_sha
        github_request(owner,repo,"contents/"+quote(path,safe="/"),method="PUT",payload=file_payload)
        pr=github_request(owner,repo,"pulls",method="POST",payload={"title":"ScreenCraft: update application design","body":"Portable .scraft UI prototype update. Review design file and run validation before merge.","head":branch,"base":base})
        return jsonify(url=pr["html_url"],branch=branch,number=pr["number"]),201

    @app.post("/api/users")
    @auth
    def add_user():
        body=request.get_json() or {}
        with Session(engine) as db:
            actor=db.get(User,session["user_id"])
            if not actor or not actor.is_admin:
                return jsonify(error="Only administrator can create accounts"),403
        username=str(body.get("username","")).strip()
        password=str(body.get("password",""))
        if len(username)<3 or len(password)<12:return jsonify(error="Invalid credentials"),400
        try: uid=create_user(engine,username,generate_password_hash(password))
        except Exception:return jsonify(error="Unable to create user"),409
        return jsonify(id=uid,username=username),201

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
