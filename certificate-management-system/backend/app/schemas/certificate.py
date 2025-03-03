from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field, validator


class CertificateExtensionBase(BaseModel):
    oid: str
    name: str
    value: dict
    critical: bool = False


class CertificateExtensionCreate(CertificateExtensionBase):
    pass


class CertificateExtension(CertificateExtensionBase):
    id: int
    certificate_id: int

    class Config:
        orm_mode = True


class CertificateBase(BaseModel):
    common_name: str
    organization: Optional[str] = None
    organizational_unit: Optional[str] = None
    country: Optional[str] = None
    state_province: Optional[str] = None
    locality: Optional[str] = None
    not_before: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    not_valid_after: datetime

    @validator('not_valid_after')
    def ensure_timezone_aware(cls, v):
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v
    signature_algorithm: str
    key_size: int
    is_ca: bool = False
    status: str = "active"


class CertificateCreate(CertificateBase):
    extensions: List[CertificateExtensionCreate] = []


class CertificateUpdate(BaseModel):
    common_name: Optional[str] = None
    organization: Optional[str] = None
    organizational_unit: Optional[str] = None
    country: Optional[str] = None
    state_province: Optional[str] = None
    locality: Optional[str] = None
    not_valid_after: Optional[datetime] = None
    status: Optional[str] = None


class Certificate(CertificateBase):
    id: int
    public_key: str
    certificate_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    extensions: List[CertificateExtension] = []

    class Config:
        orm_mode = True


class CertificateWithPrivateKey(Certificate):
    private_key: str


class CertificateList(BaseModel):
    certificates: List[Certificate]
    total: int