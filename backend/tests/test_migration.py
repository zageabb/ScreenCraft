"""Validate the production-style Alembic schema lifecycle against isolated SQLite."""
import os
from pathlib import Path
import subprocess
import sys
from sqlalchemy import create_engine, inspect
from screencraft.store import connect, create_user

def test_alembic_upgrade_and_downgrade(tmp_path):
    root=Path(__file__).resolve().parents[2]
    url="sqlite:///"+str(tmp_path/"migrated.db")
    env={**os.environ,"DATABASE_URL":url}
    def alembic(*args):
        p=subprocess.run([sys.executable,"-m","alembic","-c","backend/alembic.ini",*args],
                         cwd=root,env=env,check=True,capture_output=True,text=True)
        return p.stdout+p.stderr
    alembic("upgrade","head")
    engine=connect(url,auto_create=False)
    tables=set(inspect(engine).get_table_names())
    assert {"sc_users","sc_projects","sc_memberships","sc_preview_sessions","alembic_version"} <= tables
    assert create_user(engine,"migration-user","hashed-password")
    engine.dispose()
    alembic("downgrade","base")
    engine=create_engine(url)
    assert "sc_projects" not in inspect(engine).get_table_names()
    engine.dispose()
