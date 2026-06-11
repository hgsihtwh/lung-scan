"""add uploaded_by_id to scans, make user_id nullable

Revision ID: c1e2f3a4b5c6
Revises: b3f2a1c4d5e6
Create Date: 2026-06-11 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c1e2f3a4b5c6'
down_revision: Union[str, Sequence[str], None] = 'b3f2a1c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('scans') as batch_op:
        batch_op.alter_column('user_id', nullable=True)
        batch_op.add_column(sa.Column('uploaded_by_id', sa.Integer(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('scans') as batch_op:
        batch_op.drop_column('uploaded_by_id')
        batch_op.alter_column('user_id', nullable=False)
