"""Initial multi-user app and mock preview database schema.

Revision ID: 0001_initial
Revises:
Create Date: 2026-11-12
"""
from alembic import op
import sqlalchemy as sa

revision="0001_initial"
down_revision=None
branch_labels=None
depends_on=None

def upgrade():
    op.create_table("sc_users",
        sa.Column("id",sa.String(length=36),primary_key=True),
        sa.Column("username",sa.String(length=120),nullable=False),
        sa.Column("password_hash",sa.String(length=256),nullable=False),
        sa.Column("is_admin",sa.Boolean(),nullable=False,server_default=sa.text("false")),
        sa.UniqueConstraint("username",name="uq_sc_users_username"))
    op.create_table("sc_projects",
        sa.Column("id",sa.String(length=36),primary_key=True),
        sa.Column("name",sa.String(length=200),nullable=False),
        sa.Column("owner_id",sa.String(length=36),sa.ForeignKey("sc_users.id"),nullable=False),
        sa.Column("revision",sa.Integer(),nullable=False,server_default="1"),
        sa.Column("archive",sa.LargeBinary(),nullable=False))
    op.create_table("sc_memberships",
        sa.Column("project_id",sa.String(length=36),sa.ForeignKey("sc_projects.id"),nullable=False,primary_key=True),
        sa.Column("user_id",sa.String(length=36),sa.ForeignKey("sc_users.id"),nullable=False,primary_key=True),
        sa.Column("role",sa.String(length=20),nullable=False))
    op.create_table("sc_preview_sessions",
        sa.Column("id",sa.String(length=200),primary_key=True),
        sa.Column("project_id",sa.String(length=36),sa.ForeignKey("sc_projects.id"),nullable=False),
        sa.Column("user_id",sa.String(length=36),nullable=False),
        sa.Column("dataset_id",sa.String(length=160),nullable=False),
        sa.Column("mode",sa.String(length=24),nullable=False),
        sa.Column("rows_json",sa.Text(),nullable=False,server_default="[]"),
        sa.Column("revision",sa.Integer(),nullable=False,server_default="1"))

def downgrade():
    op.drop_table("sc_preview_sessions")
    op.drop_table("sc_memberships")
    op.drop_table("sc_projects")
    op.drop_table("sc_users")
