"""add doctor_patients association table

Revision ID: d2f3a4b5c6d7
Revises: c1e2f3a4b5c6
Create Date: 2026-06-12 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd2f3a4b5c6d7'
down_revision: Union[str, Sequence[str], None] = 'c1e2f3a4b5c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'doctor_patients',
        sa.Column('doctor_id', sa.Integer(), sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('users.id'), primary_key=True),
    )


def downgrade() -> None:
    op.drop_table('doctor_patients')
