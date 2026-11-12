"""SQL-backed multiuser document and mock preview storage; SQLite is for local tests."""
from __future__ import annotations
from datetime import datetime, timezone
import json
from uuid import uuid4
from sqlalchemy import create_engine, String, Integer, ForeignKey, LargeBinary, Text, Boolean, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__="sc_users"
    id: Mapped[str]=mapped_column(String(36),primary_key=True)
    username: Mapped[str]=mapped_column(String(120),unique=True)
    password_hash: Mapped[str]=mapped_column(String(256))
    is_admin: Mapped[bool]=mapped_column(Boolean,default=False)
class Project(Base):
    __tablename__="sc_projects"
    id: Mapped[str]=mapped_column(String(36),primary_key=True)
    name: Mapped[str]=mapped_column(String(200))
    owner_id: Mapped[str]=mapped_column(ForeignKey("sc_users.id"))
    revision: Mapped[int]=mapped_column(Integer,default=1)
    archive: Mapped[bytes]=mapped_column(LargeBinary)
class Membership(Base):
    __tablename__="sc_memberships"
    project_id: Mapped[str]=mapped_column(ForeignKey("sc_projects.id"),primary_key=True)
    user_id: Mapped[str]=mapped_column(ForeignKey("sc_users.id"),primary_key=True)
    role: Mapped[str]=mapped_column(String(20))
class PrototypeSession(Base):
    __tablename__="sc_preview_sessions"
    id: Mapped[str]=mapped_column(String(200),primary_key=True)
    project_id: Mapped[str]=mapped_column(ForeignKey("sc_projects.id"))
    user_id: Mapped[str]=mapped_column(ForeignKey("sc_users.id"))
    dataset_id: Mapped[str]=mapped_column(String(160))
    mode: Mapped[str]=mapped_column(String(24))
    rows_json: Mapped[str]=mapped_column(Text,default="[]")
    revision: Mapped[int]=mapped_column(Integer,default=1)

def connect(url: str):
    engine = create_engine(url, future=True, pool_pre_ping=True)
    Base.metadata.create_all(engine) # TODO: replace schema creation with Alembic migration before production
    return engine

def create_user(engine, username, hashed_password, is_admin=False):
    with Session(engine) as db:
        u=User(id=str(uuid4()),username=username,password_hash=hashed_password,is_admin=is_admin)
        db.add(u);db.commit();return u.id

def create_project(engine, user_id, name, archive):
    with Session(engine) as db:
        p=Project(id=str(uuid4()),name=name,owner_id=user_id,revision=1,archive=archive)
        db.add(p);db.add(Membership(project_id=p.id,user_id=user_id,role="owner"))
        db.commit();return p.id

def get_role(db, project_id, user_id):
    return db.scalar(select(Membership.role).where(Membership.project_id==project_id,Membership.user_id==user_id))

def get_project(engine, project_id, user_id):
    with Session(engine) as db:
        role=get_role(db,project_id,user_id)
        if not role: raise PermissionError("Project access denied")
        p=db.get(Project,project_id)
        return {"id":p.id,"name":p.name,"revision":p.revision,"archive":p.archive,"role":role}

def update_project(engine, project_id, user_id, archive, expected_revision):
    with Session(engine) as db:
        if get_role(db,project_id,user_id) not in ("owner","admin","designer"):
            raise PermissionError("Project edit denied")
        p=db.get(Project,project_id)
        if not p or p.revision != expected_revision: raise ValueError("Revision conflict")
        p.archive=archive;p.revision+=1;db.commit();return p.revision

def set_membership(engine, project_id, actor_id, user_id, role):
    if role not in ("owner","admin","designer","viewer"): raise ValueError("Invalid role")
    with Session(engine) as db:
        if get_role(db,project_id,actor_id) not in ("owner","admin"):
            raise PermissionError("Membership edit denied")
        member=db.get(Membership,{"project_id":project_id,"user_id":user_id})
        if member: member.role=role
        else: db.add(Membership(project_id=project_id,user_id=user_id,role=role))
        db.commit()

def mutate_rows(engine, project_id, user_id, dataset_id, mode, seed_rows, operation, values=None, row_index=None, session_id=None, expected_revision=None):
    if mode not in ("seed-reset","session-persisted","project-shared"): raise ValueError("Invalid preview mode")
    if operation not in ("list","add","edit","delete","reset"): raise ValueError("Invalid action")
    with Session(engine) as db:
        role=get_role(db,project_id,user_id)
        if not role: raise PermissionError("Preview access denied")
        if operation!="list" and role=="viewer": raise PermissionError("Preview write denied")
        if mode=="seed-reset":
            rows=list(seed_rows)
            if operation=="add": rows.append(values or {})
            return {"rows":rows,"revision":0}
        key_user = user_id if mode=="session-persisted" else "shared"
        key= session_id or ("shared:"+project_id+":"+dataset_id if mode=="project-shared" else None)
        if not key: raise ValueError("Session ID required")
        item=db.get(PrototypeSession,key)
        if item and (item.project_id!=project_id or item.dataset_id!=dataset_id or (mode=="session-persisted" and item.user_id!=user_id)):
            raise PermissionError("Session access denied")
        if not item:
            item=PrototypeSession(id=key,project_id=project_id,user_id=key_user,dataset_id=dataset_id,mode=mode,rows_json=json.dumps(seed_rows),revision=1)
            db.add(item);db.flush()
        rows=json.loads(item.rows_json)
        if operation!="list":
            if expected_revision is not None and item.revision!=expected_revision: raise ValueError("Revision conflict")
            if operation=="add": rows.append(values or {})
            elif operation=="reset": rows=list(seed_rows)
            elif operation in ("edit","delete"):
                if not isinstance(row_index,int) or row_index<0 or row_index>=len(rows): raise ValueError("Invalid row")
                if operation=="edit": rows[row_index]={**rows[row_index],**(values or {})}
                else: rows.pop(row_index)
            item.rows_json=json.dumps(rows);item.revision+=1
        db.commit();return {"rows":rows,"revision":item.revision}
