"""add annotations table

Revision ID: e4f5a6b7c8d9
Revises: d2f3a4b5c6d7
Create Date: 2026-06-12 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e4f5a6b7c8d9'
down_revision: Union[str, Sequence[str], None] = 'd2f3a4b5c6d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "annotations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("scan_id", sa.Integer(), nullable=False),
        sa.Column("slice_number", sa.Integer(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(), nullable=True),
        sa.Column("x1", sa.Float(), nullable=False),
        sa.Column("y1", sa.Float(), nullable=False),
        sa.Column("x2", sa.Float(), nullable=False),
        sa.Column("y2", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["scan_id"], ["scans.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_annotations_id"), "annotations", ["id"], unique=False)
    op.create_index(op.f("ix_annotations_scan_id"), "annotations", ["scan_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_annotations_scan_id"), table_name="annotations")
    op.drop_index(op.f("ix_annotations_id"), table_name="annotations")
    op.drop_table("annotations")
