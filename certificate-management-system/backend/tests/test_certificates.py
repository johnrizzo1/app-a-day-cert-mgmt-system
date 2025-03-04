import pytest
from datetime import datetime, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.certificate import Certificate
from app.services.certificate_service import create_certificate
from app.schemas.certificate import CertificateCreate

# Import the helper function
from .conftest import with_greenlet_context


@pytest.mark.asyncio
@with_greenlet_context
async def test_create_certificate(client: AsyncClient, db_session: AsyncSession):
    # Create certificate data
    certificate_data = {
        "common_name": "test.example.com",
        "organization": "Test Organization",
        "organizational_unit": "IT Department",
        "country": "US",
        "state_province": "California",
        "locality": "San Francisco",
        "not_before": datetime.utcnow().isoformat(),
        "not_valid_after": (datetime.utcnow() + timedelta(days=365)).isoformat(),
        "signature_algorithm": "sha256",
        "key_size": 2048,
        "is_ca": False,
        "status": "active",
        "extensions": []
    }
    
    # Send POST request
    response = await client.post("/api/certificates/", json=certificate_data)
    
    # Check response
    assert response.status_code == 201
    data = response.json()
    assert data["common_name"] == certificate_data["common_name"]
    assert data["organization"] == certificate_data["organization"]
    assert "id" in data
    assert "public_key" in data


@pytest.mark.asyncio
@with_greenlet_context
async def test_read_certificates(client: AsyncClient, db_session: AsyncSession):
    # Create test certificates
    for i in range(3):
        certificate_in = CertificateCreate(
            common_name=f"test{i}.example.com",
            organization="Test Organization",
            organizational_unit="IT Department",
            country="US",
            state_province="California",
            locality="San Francisco",
            not_before=datetime.utcnow(),
            not_valid_after=datetime.utcnow() + timedelta(days=365),
            signature_algorithm="sha256",
            key_size=2048,
            is_ca=False,
            status="active",
            extensions=[]
        )
        await create_certificate(db=db_session, certificate_in=certificate_in)
    
    # Send GET request
    response = await client.get("/api/certificates/")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert "certificates" in data
    assert "total" in data
    assert data["total"] >= 3
    assert len(data["certificates"]) >= 3


@pytest.mark.asyncio
@with_greenlet_context
async def test_read_certificate(client: AsyncClient, db_session: AsyncSession):
    # Create test certificate
    certificate_in = CertificateCreate(
        common_name="test-read.example.com",
        organization="Test Organization",
        organizational_unit="IT Department",
        country="US",
        state_province="California",
        locality="San Francisco",
        not_before=datetime.utcnow(),
        not_valid_after=datetime.utcnow() + timedelta(days=365),
        signature_algorithm="sha256",
        key_size=2048,
        is_ca=False,
        status="active",
        extensions=[]
    )
    certificate = await create_certificate(db=db_session, certificate_in=certificate_in)
    
    # Send GET request
    response = await client.get(f"/api/certificates/{certificate.id}")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == certificate.id
    assert data["common_name"] == certificate.common_name


@pytest.mark.asyncio
@with_greenlet_context
async def test_update_certificate(client: AsyncClient, db_session: AsyncSession):
    # Create test certificate
    certificate_in = CertificateCreate(
        common_name="test-update.example.com",
        organization="Test Organization",
        organizational_unit="IT Department",
        country="US",
        state_province="California",
        locality="San Francisco",
        not_before=datetime.utcnow(),
        not_valid_after=datetime.utcnow() + timedelta(days=365),
        signature_algorithm="sha256",
        key_size=2048,
        is_ca=False,
        status="active",
        extensions=[]
    )
    certificate = await create_certificate(db=db_session, certificate_in=certificate_in)
    
    # Update data
    update_data = {
        "common_name": "updated.example.com",
        "organization": "Updated Organization"
    }
    
    # Send PUT request
    response = await client.put(f"/api/certificates/{certificate.id}", json=update_data)
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == certificate.id
    assert data["common_name"] == update_data["common_name"]
    assert data["organization"] == update_data["organization"]


@pytest.mark.asyncio
@with_greenlet_context
async def test_delete_certificate(client: AsyncClient, db_session: AsyncSession):
    # Create test certificate
    certificate_in = CertificateCreate(
        common_name="test-delete.example.com",
        organization="Test Organization",
        organizational_unit="IT Department",
        country="US",
        state_province="California",
        locality="San Francisco",
        not_before=datetime.utcnow(),
        not_valid_after=datetime.utcnow() + timedelta(days=365),
        signature_algorithm="sha256",
        key_size=2048,
        is_ca=False,
        status="active",
        extensions=[]
    )
    certificate = await create_certificate(db=db_session, certificate_in=certificate_in)
    
    # Send DELETE request
    response = await client.delete(f"/api/certificates/{certificate.id}")
    
    # Check response
    assert response.status_code == 204
    
    # Verify certificate is deleted
    response = await client.get(f"/api/certificates/{certificate.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
@with_greenlet_context
async def test_generate_x509_certificate(client: AsyncClient, db_session: AsyncSession):
    """Test the X.509 certificate generation functionality"""
    # Create test certificate
    certificate_in = CertificateCreate(
        common_name="test-x509.example.com",
        organization="Test Organization",
        organizational_unit="IT Department",
        country="US",
        state_province="California",
        locality="San Francisco",
        not_before=datetime.utcnow(),
        not_valid_after=datetime.utcnow() + timedelta(days=365),
        signature_algorithm="sha256",
        key_size=2048,
        is_ca=False,
        status="active",
        extensions=[]
    )
    certificate = await create_certificate(db=db_session, certificate_in=certificate_in)
    
    # Send POST request to generate certificate
    response = await client.post(f"/api/certificates/{certificate.id}/generate")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == certificate.id
    assert data["certificate_data"] is not None
    assert "-----BEGIN CERTIFICATE-----" in data["certificate_data"]
    assert "-----END CERTIFICATE-----" in data["certificate_data"]
    
    # Verify certificate data contains expected information
    cert_data = data["certificate_data"]
    assert len(cert_data) > 0
    
    # Get the certificate again to verify it was saved
    response = await client.get(f"/api/certificates/{certificate.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["certificate_data"] is not None