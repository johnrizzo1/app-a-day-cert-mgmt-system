from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple

from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.certificate import Certificate, CertificateExtension
from app.schemas.certificate import CertificateCreate, CertificateUpdate


def get_certificate(db: Session, certificate_id: int) -> Optional[Certificate]:
    """
    Get a certificate by ID
    """
    result = db.execute(
        select(Certificate)
        .options(selectinload(Certificate.extensions))
        .filter(Certificate.id == certificate_id)
    )
    return result.scalars().first()


def get_certificates(
    db: Session, skip: int = 0, limit: int = 100
) -> Tuple[List[Certificate], int]:
    """
    Get a list of certificates with pagination
    """
    # Get total count
    result = db.execute(select(Certificate).order_by(Certificate.id))
    total = len(result.scalars().all())
    
    # Get paginated results
    result = db.execute(
        select(Certificate)
        .options(selectinload(Certificate.extensions))
        .order_by(Certificate.id)
        .offset(skip)
        .limit(limit)
    )
    certificates = result.scalars().all()
    
    return certificates, total


def create_certificate(
    db: Session, certificate_in: CertificateCreate
) -> Certificate:
    """
    Create a new certificate
    """
    # Generate key pair
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=certificate_in.key_size,
        backend=default_backend()
    )
    
    public_key = private_key.public_key()
    
    # Serialize keys
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    # Create certificate object
    certificate_data = Certificate(
        common_name=certificate_in.common_name,
        organization=certificate_in.organization,
        organizational_unit=certificate_in.organizational_unit,
        country=certificate_in.country,
        state_province=certificate_in.state_province,
        locality=certificate_in.locality,
        not_before=certificate_in.not_before,
        not_valid_after=certificate_in.not_valid_after,
        public_key=public_key_pem,
        private_key=private_key_pem,
        signature_algorithm=certificate_in.signature_algorithm,
        key_size=certificate_in.key_size,
        is_ca=certificate_in.is_ca,
        status=certificate_in.status
    )
    
    # Add to database
    db.add(certificate_data)
    db.flush()
    
    # Add extensions
    if certificate_in.extensions:
        for ext_in in certificate_in.extensions:
            extension = CertificateExtension(
                certificate_id=certificate_data.id,
                oid=ext_in.oid,
                name=ext_in.name,
                value=ext_in.value,
                critical=ext_in.critical
            )
            db.add(extension)
    
    db.flush()
    
    return certificate_data


def update_certificate(
    db: Session, certificate: Certificate, certificate_in: CertificateUpdate
) -> Certificate:
    """
    Update a certificate
    """
    update_data = certificate_in.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(certificate, field, value)
    
    certificate.updated_at = datetime.now(timezone.utc)
    
    db.add(certificate)
    db.flush()
    
    return certificate


def delete_certificate(db: Session, certificate: Certificate) -> None:
    """
    Delete a certificate
    """
    db.delete(certificate)
    db.flush()


def generate_x509_certificate(
    db: Session, certificate: Certificate
) -> Certificate:
    """
    Generate an X509 certificate from the stored data
    """
    # Load private key
    private_key = serialization.load_pem_private_key(
        certificate.private_key.encode('utf-8'),
        password=None,
        backend=default_backend()
    )
    
    # Create subject name by collecting all attributes first
    name_attributes = [
        x509.NameAttribute(NameOID.COMMON_NAME, certificate.common_name)
    ]
    
    if certificate.organization:
        name_attributes.append(
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, certificate.organization)
        )
    
    if certificate.organizational_unit:
        name_attributes.append(
            x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, certificate.organizational_unit)
        )
    
    if certificate.country:
        name_attributes.append(
            x509.NameAttribute(NameOID.COUNTRY_NAME, certificate.country)
        )
    
    if certificate.state_province:
        name_attributes.append(
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, certificate.state_province)
        )
    
    if certificate.locality:
        name_attributes.append(
            x509.NameAttribute(NameOID.LOCALITY_NAME, certificate.locality)
        )
    
    # Create the Name object with the complete list of attributes
    subject_name = x509.Name(name_attributes)
    
    # Create certificate builder
    cert_builder = x509.CertificateBuilder(
        issuer_name=subject_name,
        subject_name=subject_name,
        public_key=private_key.public_key(),
        serial_number=x509.random_serial_number(),
        not_valid_before=certificate.not_before,
        not_valid_after=certificate.not_valid_after
    )
    
    # Add extensions
    for ext in certificate.extensions:
        # Implementation would depend on the specific extensions needed
        pass
    
    # Sign the certificate
    if certificate.signature_algorithm == "sha256":
        algorithm = hashes.SHA256()
    elif certificate.signature_algorithm == "sha384":
        algorithm = hashes.SHA384()
    elif certificate.signature_algorithm == "sha512":
        algorithm = hashes.SHA512()
    else:
        algorithm = hashes.SHA256()
    
    x509_cert = cert_builder.sign(
        private_key=private_key, 
        algorithm=algorithm,
        backend=default_backend()
    )
    
    # Serialize the certificate
    cert_pem = x509_cert.public_bytes(serialization.Encoding.PEM).decode('utf-8')
    
    # Update the certificate data
    certificate.certificate_data = cert_pem
    certificate.updated_at = datetime.now(timezone.utc)
    
    db.add(certificate)
    db.flush()
    
    return certificate