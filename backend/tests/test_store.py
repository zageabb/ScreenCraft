import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from screencraft.package import starter_app,make_document
from screencraft.store import Base,connect,create_user,create_project,get_project,update_project,set_membership,mutate_rows

@pytest.fixture
def store():
    engine=connect("sqlite:///:memory:",auto_create=True)
    a=create_user(engine,"owner","hash")
    b=create_user(engine,"designer","hash")
    c=create_user(engine,"viewer","hash")
    pid=create_project(engine,a,"Project",make_document(starter_app()))
    return engine,a,b,c,pid

def test_project_access_and_revision(store):
    eng,a,b,c,pid=store
    with pytest.raises(PermissionError):get_project(eng,pid,b)
    set_membership(eng,pid,a,b,"designer")
    set_membership(eng,pid,a,c,"viewer")
    assert get_project(eng,pid,b)["role"]=="designer"
    assert update_project(eng,pid,b,make_document(starter_app()),1)==2
    with pytest.raises(ValueError):update_project(eng,pid,b,b"stale",1)
    with pytest.raises(PermissionError):update_project(eng,pid,c,b"no",2)

def test_mock_data_session_isolation_and_shared(store):
    eng,a,b,c,pid=store
    set_membership(eng,pid,a,b,"designer")
    set_membership(eng,pid,a,c,"viewer")
    seeds=[{"Name":"Seed"}]
    r=mutate_rows(eng,pid,a,"customers","session-persisted",seeds,"add",{"Name":"Alice"},session_id="a-session")
    assert len(r["rows"])==2
    r2=mutate_rows(eng,pid,b,"customers","session-persisted",seeds,"list",session_id="b-session")
    assert len(r2["rows"])==1
    with pytest.raises(PermissionError):
        mutate_rows(eng,pid,b,"customers","session-persisted",seeds,"list",session_id="a-session")
    common=mutate_rows(eng,pid,a,"customers","project-shared",seeds,"add",{"Name":"Shared"},expected_revision=1)
    assert len(mutate_rows(eng,pid,b,"customers","project-shared",seeds,"list")["rows"])==2
    with pytest.raises(PermissionError):mutate_rows(eng,pid,c,"customers","project-shared",seeds,"add",{"Name":"Denied"})
    with pytest.raises(ValueError):mutate_rows(eng,pid,a,"customers","project-shared",seeds,"add",{"Name":"Conflict"},expected_revision=1)
    assert len(common["rows"])==2


def test_sqlite_foreign_keys_are_enforced(store):
    engine, owner_id, _, _, project_id = store
    with engine.connect() as connection:
        assert connection.execute(text("PRAGMA foreign_keys")).scalar() == 1
        with pytest.raises(IntegrityError):
            connection.execute(text("""
                INSERT INTO sc_memberships (project_id,user_id,role)
                VALUES (:project,:user,'viewer')
            """), {"project":"missing-project","user":owner_id})


def test_owner_membership_created_with_valid_parent(store):
    engine, owner_id, _, _, project_id = store
    with engine.connect() as connection:
        count=connection.execute(text("""
            SELECT COUNT(*) FROM sc_memberships AS m
            JOIN sc_projects AS p ON p.id=m.project_id
            WHERE m.project_id=:project AND m.user_id=:user
            AND m.role='owner'
        """), {"project":project_id,"user":owner_id}).scalar_one()
    assert count == 1
