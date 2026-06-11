"""add role to users

Revision ID: b3f2a1c4d5e6
Revises: ea2022932b56
Create Date: 2026-06-11 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'b3f2a1c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'ea2022932b56'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("role", sa.String(), nullable=False, server_default="patient"),
    )


def downgrade() -> None:
    op.drop_column("users", "role")
