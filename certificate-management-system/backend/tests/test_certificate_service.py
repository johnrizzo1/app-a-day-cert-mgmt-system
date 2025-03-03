import pytest
from datetime import datetime, timedelta, timezone
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.certificate import Certificate
from app.schemas.certificate import CertificateCreate
from app.services.certificate_service import (
    create_certificate,
    generate_x509_certificate,
    get_certificate
)


@pytest.mark.asyncio
async def test_create_certificate_service(db_session: AsyncSession):
    """Test the create_certificate service function"""
    # Create certificate data
    certificate_in = CertificateCreate(
        common_name="test-service.example.com",
        organization="Test Organization",
        organizational_unit="IT Department",
        country="US",
        state_province="California",
        locality="San Francisco",
        not_before=datetime.now(timezone.utc),
        not_valid_after=datetime.now(timezone.utc) + timedelta(days=365),
        signature_algorithm="sha256",
        key_size=2048,
        is_ca=False,
        status="active",
        extensions=[]
    )
    
    # Create certificate
    certificate = await create_certificate(db=db_session, certificate_in=certificate_in)
    
    # Check certificate was created
    assert certificate is not None
    assert certificate.id is not None
    assert certificate.common_name == certificate_in.common_name
    assert certificate.organization == certificate_in.organization
    assert certificate.public_key is not None
    assert certificate.private_key is not None


@pytest.mark.asyncio
async def test_generate_x509_certificate_service(db_session: AsyncSession):
    """Test the generate_x509_certificate service function"""
    # Create certificate data
    certificate_in = CertificateCreate(
        common_name="test-x509-service.example.com",
        organization="Test Organization",
        organizational_unit="IT Department",
        country="US",
        state_province="California",
        locality="San Francisco",
        not_before=datetime.now(timezone.utc),
        not_valid_after=datetime.now(timezone.utc) + timedelta(days=365),
        signature_algorithm="sha256",
        key_size=2048,
        is_ca=False,
        status="active",
        extensions=[]
    )
    
    # Create certificate
    certificate = await create_certificate(db=db_session, certificate_in=certificate_in)
    certificate_id = certificate.id
    
    # Get a fresh instance to avoid detached instance issues
    certificate = await get_certificate(db=db_session, certificate_id=certificate_id)
    
    # Generate X.509 certificate
    certificate = await generate_x509_certificate(db=db_session, certificate=certificate)
    
    # Check certificate was generated
    assert certificate.certificate_data is not None
    assert "-----BEGIN CERTIFICATE-----" in certificate.certificate_data
    assert "-----END CERTIFICATE-----" in certificate.certificate_data
    
    # Parse the certificate to verify its contents
    cert_bytes = certificate.certificate_data.encode('utf-8')
    x509_cert = x509.load_pem_x509_certificate(cert_bytes, default_backend())
    
    # Verify subject information
    subject = x509_cert.subject
    assert any(attr.oid == x509.oid.NameOID.COMMON_NAME and attr.value == certificate.common_name 
               for attr in subject)
    assert any(attr.oid == x509.oid.NameOID.ORGANIZATION_NAME and attr.value == certificate.organization 
               for attr in subject)
    assert any(attr.oid == x509.oid.NameOID.ORGANIZATIONAL_UNIT_NAME and attr.value == certificate.organizational_unit 
               for attr in subject)
    assert any(attr.oid == x509.oid.NameOID.COUNTRY_NAME and attr.value == certificate.country 
               for attr in subject)
    assert any(attr.oid == x509.oid.NameOID.STATE_OR_PROVINCE_NAME and attr.value == certificate.state_province 
               for attr in subject)
    assert any(attr.oid == x509.oid.NameOID.LOCALITY_NAME and attr.value == certificate.locality 
               for attr in subject)
    
    # Verify validity period - ignoring microseconds in comparison
    # The x509_cert.not_valid_before_utc is timezone-aware, so we need to keep the timezone
    cert_not_before = certificate.not_before.replace(microsecond=0)
    cert_not_after = certificate.not_valid_after.replace(microsecond=0)
    
    # Use the UTC versions of the properties as recommended by deprecation warning
    assert x509_cert.not_valid_before_utc.replace(microsecond=0) <= cert_not_before
    assert x509_cert.not_valid_after_utc.replace(microsecond=0) >= cert_not_after


@pytest.mark.asyncio
async def test_generate_x509_certificate_with_missing_fields(db_session: AsyncSession):
    """Test generating a certificate with some optional fields missing"""
    # Create certificate with minimal fields
    certificate_in = CertificateCreate(
        common_name="minimal.example.com",
        # Omit optional fields
        organization=None,
        organizational_unit=None,
        country=None,
        state_province=None,
        locality=None,
        not_before=datetime.now(timezone.utc),
        not_valid_after=datetime.now(timezone.utc) + timedelta(days=365),
        signature_algorithm="sha256",
        key_size=2048,
        is_ca=False,
        status="active",
        extensions=[]
    )
    
    # Create certificate
    certificate = await create_certificate(db=db_session, certificate_in=certificate_in)
    certificate_id = certificate.id
    
    # Get a fresh instance
    certificate = await get_certificate(db=db_session, certificate_id=certificate_id)
    
    # Generate X.509 certificate
    certificate = await generate_x509_certificate(db=db_session, certificate=certificate)
    
    # Check certificate was generated
    assert certificate.certificate_data is not None
    
    # Parse the certificate
    cert_bytes = certificate.certificate_data.encode('utf-8')
    x509_cert = x509.load_pem_x509_certificate(cert_bytes, default_backend())
    
    # Verify subject has only common name
    subject = x509_cert.subject
    assert any(attr.oid == x509.oid.NameOID.COMMON_NAME and attr.value == certificate.common_name
               for attr in subject)
    
    # Count the number of attributes in subject
    subject_attrs = list(subject)
    assert len(subject_attrs) == 1  # Only common name should be present
    
    # Verify validity period - ignoring microseconds in comparison
    cert_not_before = certificate.not_before.replace(microsecond=0)
    cert_not_after = certificate.not_valid_after.replace(microsecond=0)
    
    assert x509_cert.not_valid_before_utc.replace(microsecond=0) <= cert_not_before
    assert x509_cert.not_valid_after_utc.replace(microsecond=0) >= cert_not_after