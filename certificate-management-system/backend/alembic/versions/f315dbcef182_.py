"""create certificate tables

Revision ID: f315dbcef182
Revises: 
Create Date: 2025-03-02 15:34:56.152891

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'f315dbcef182'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create certificates table
    op.create_table(
        'certificates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('common_name', sa.String(255), nullable=False),
        sa.Column('organization', sa.String(255), nullable=True),
        sa.Column('organizational_unit', sa.String(255), nullable=True),
        sa.Column('country', sa.String(2), nullable=True),
        sa.Column('state_province', sa.String(255), nullable=True),
        sa.Column('locality', sa.String(255), nullable=True),
        sa.Column('not_before', sa.DateTime(), nullable=False),
        sa.Column('not_valid_after', sa.DateTime(), nullable=False),
        sa.Column('public_key', sa.Text(), nullable=False),
        sa.Column('private_key', sa.Text(), nullable=True),
        sa.Column('certificate_data', sa.Text(), nullable=True),
        sa.Column('signature_algorithm', sa.String(50), nullable=False),
        sa.Column('key_size', sa.Integer(), nullable=False),
        sa.Column('is_ca', sa.Boolean(), default=False),
        sa.Column('status', sa.String(20), default='active'),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for certificates table
    op.create_index('ix_certificates_id', 'certificates', ['id'])
    op.create_index('ix_certificates_common_name', 'certificates', ['common_name'])
    
    # Create certificate_extensions table
    op.create_table(
        'certificate_extensions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('certificate_id', sa.Integer(), nullable=False),
        sa.Column('oid', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('value', postgresql.JSONB(), nullable=False),
        sa.Column('critical', sa.Boolean(), default=False),
        sa.ForeignKeyConstraint(['certificate_id'], ['certificates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for certificate_extensions table
    op.create_index('ix_certificate_extensions_id', 'certificate_extensions', ['id'])
    op.create_index('ix_certificate_extensions_certificate_id', 'certificate_extensions', ['certificate_id'])


def downgrade():
    # Drop tables in reverse order
    op.drop_index('ix_certificate_extensions_certificate_id', 'certificate_extensions')
    op.drop_index('ix_certificate_extensions_id', 'certificate_extensions')
    op.drop_table('certificate_extensions')
    
    op.drop_index('ix_certificates_common_name', 'certificates')
    op.drop_index('ix_certificates_id', 'certificates')
    op.drop_table('certificates')