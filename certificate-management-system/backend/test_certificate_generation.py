#!/usr/bin/env python3
"""
Test script to verify certificate generation works correctly.
This script creates a test certificate and generates an X.509 certificate from it.
"""
import asyncio
import sys
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.schemas.certificate import CertificateCreate
from app.services.certificate_service import create_certificate, generate_x509_certificate, get_certificate


async def test_certificate_generation():
    """Test the certificate generation process"""
    print("Starting certificate generation test...")
    
    # Create a database session
    db_session = AsyncSessionLocal()
    
    try:
        # Create test certificate
        print("Creating test certificate...")
        certificate_in = CertificateCreate(
            common_name="test.example.com",
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
        
        certificate = await create_certificate(db=db_session, certificate_in=certificate_in)
        certificate_id = certificate.id
        print(f"Certificate created with ID: {certificate_id}")
        
        # Get a fresh instance of the certificate to avoid detached instance issues
        certificate = await get_certificate(db=db_session, certificate_id=certificate_id)
        if not certificate:
            print(f"ERROR: Could not retrieve certificate with ID {certificate_id}")
            return False
            
        # Generate X.509 certificate
        print("Generating X.509 certificate...")
        certificate = await generate_x509_certificate(db=db_session, certificate=certificate)
        
        # Verify certificate was generated
        if certificate.certificate_data:
            print("SUCCESS: X.509 certificate generated successfully!")
            print(f"Certificate data length: {len(certificate.certificate_data)} bytes")
            print("First 100 characters of certificate:")
            print(certificate.certificate_data[:100] + "...")
            return True
        else:
            print("ERROR: Certificate data is empty")
            return False
            
    except Exception as e:
        print(f"ERROR: Exception occurred during certificate generation: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Close the session
        await db_session.close()


if __name__ == "__main__":
    success = asyncio.run(test_certificate_generation())
    sys.exit(0 if success else 1)