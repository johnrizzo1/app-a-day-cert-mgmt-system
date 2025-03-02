from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String(255), nullable=False, index=True)
    organization = Column(String(255), nullable=True)
    organizational_unit = Column(String(255), nullable=True)
    country = Column(String(2), nullable=True)
    state_province = Column(String(255), nullable=True)
    locality = Column(String(255), nullable=True)
    not_before = Column(DateTime, nullable=False, default=datetime.utcnow)
    not_valid_after = Column(DateTime, nullable=False)
    public_key = Column(Text, nullable=False)
    private_key = Column(Text, nullable=True)  # Encrypted
    certificate_data = Column(Text, nullable=True)
    signature_algorithm = Column(String(50), nullable=False)
    key_size = Column(Integer, nullable=False)
    is_ca = Column(Boolean, default=False)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    extensions = relationship("CertificateExtension", back_populates="certificate", cascade="all, delete-orphan")


class CertificateExtension(Base):
    __tablename__ = "certificate_extensions"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(Integer, ForeignKey("certificates.id"), nullable=False)
    oid = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    value = Column(JSONB, nullable=False)
    critical = Column(Boolean, default=False)

    certificate = relationship("Certificate", back_populates="extensions")