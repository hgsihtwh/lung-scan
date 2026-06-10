"""initial migration

Revision ID: ea2022932b56
Revises:
Create Date: 2026-06-06 13:45:40.001511

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'ea2022932b56'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "scans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("file_id", sa.String(), nullable=False),
        sa.Column("file_hash", sa.String(), nullable=True),
        sa.Column("study_instance_uid", sa.String(), nullable=True),
        sa.Column("patient_name", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("slice_count", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("file_id"),
    )
    op.create_index(op.f("ix_scans_id"), "scans", ["id"], unique=False)
    op.create_index(op.f("ix_scans_file_id"), "scans", ["file_id"], unique=True)
    op.create_index(op.f("ix_scans_file_hash"), "scans", ["file_hash"], unique=False)
    op.create_index(op.f("ix_scans_study_instance_uid"), "scans", ["study_instance_uid"], unique=False)

    op.create_table(
        "feedbacks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("scan_id", sa.Integer(), nullable=False),
        sa.Column("is_accurate", sa.Boolean(), nullable=True),
        sa.Column("user_comment", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["scan_id"], ["scans.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("scan_id"),
    )
    op.create_index(op.f("ix_feedbacks_id"), "feedbacks", ["id"], unique=False)

    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("scan_id", sa.Integer(), nullable=False),
        sa.Column("verdict", sa.String(), nullable=False),
        sa.Column("probability", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["scan_id"], ["scans.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("scan_id"),
    )
    op.create_index(op.f("ix_reports_id"), "reports", ["id"], unique=False)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("token", sa.String(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token"),
    )
    op.create_index(op.f("ix_refresh_tokens_id"), "refresh_tokens", ["id"], unique=False)
    op.create_index(op.f("ix_refresh_tokens_token"), "refresh_tokens", ["token"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_refresh_tokens_token"), table_name="refresh_tokens")
    op.drop_index(op.f("ix_refresh_tokens_id"), table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    op.drop_index(op.f("ix_reports_id"), table_name="reports")
    op.drop_table("reports")

    op.drop_index(op.f("ix_feedbacks_id"), table_name="feedbacks")
    op.drop_table("feedbacks")

    op.drop_index(op.f("ix_scans_study_instance_uid"), table_name="scans")
    op.drop_index(op.f("ix_scans_file_hash"), table_name="scans")
    op.drop_index(op.f("ix_scans_file_id"), table_name="scans")
    op.drop_index(op.f("ix_scans_id"), table_name="scans")
    op.drop_table("scans")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
