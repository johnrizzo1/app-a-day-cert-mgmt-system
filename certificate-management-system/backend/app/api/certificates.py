from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.certificate import Certificate
from app.schemas.certificate import (
    Certificate as CertificateSchema,
    CertificateCreate,
    CertificateList,
    CertificateUpdate,
    CertificateWithPrivateKey,
)
from app.services.certificate_service import (
    create_certificate,
    delete_certificate,
    generate_x509_certificate,
    get_certificate,
    get_certificates,
    update_certificate,
)

router = APIRouter()


@router.get("/", response_model=CertificateList)
async def read_certificates(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> Any:
    """
    Retrieve certificates with pagination.
    """
    certificates, total = await get_certificates(db, skip=skip, limit=limit)
    return {"certificates": certificates, "total": total}


@router.post("/", response_model=CertificateSchema, status_code=status.HTTP_201_CREATED)
async def create_new_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    certificate_in: CertificateCreate,
) -> Any:
    """
    Create new certificate.
    """
    certificate = await create_certificate(db=db, certificate_in=certificate_in)
    return certificate


@router.get("/{certificate_id}", response_model=CertificateSchema)
async def read_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    certificate_id: int,
) -> Any:
    """
    Get certificate by ID.
    """
    certificate = await get_certificate(db=db, certificate_id=certificate_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )
    return certificate


@router.put("/{certificate_id}", response_model=CertificateSchema)
async def update_existing_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    certificate_id: int,
    certificate_in: CertificateUpdate,
) -> Any:
    """
    Update a certificate.
    """
    certificate = await get_certificate(db=db, certificate_id=certificate_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )
    certificate = await update_certificate(
        db=db, certificate=certificate, certificate_in=certificate_in
    )
    return certificate


@router.delete("/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    certificate_id: int,
) -> Any:
    """
    Delete a certificate.
    """
    certificate = await get_certificate(db=db, certificate_id=certificate_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )
    await delete_certificate(db=db, certificate=certificate)
    return None


@router.post("/{certificate_id}/generate", response_model=CertificateSchema)
async def generate_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    certificate_id: int,
) -> Any:
    """
    Generate X509 certificate from stored data.
    """
    certificate = await get_certificate(db=db, certificate_id=certificate_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )
    
    if certificate.certificate_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certificate already generated",
        )
    
    certificate = await generate_x509_certificate(db=db, certificate=certificate)
    return certificate


@router.get("/{certificate_id}/private-key", response_model=CertificateWithPrivateKey)
async def get_certificate_with_private_key(
    *,
    db: AsyncSession = Depends(get_db),
    certificate_id: int,
) -> Any:
    """
    Get certificate with private key.
    This endpoint should be properly secured in production.
    """
    certificate = await get_certificate(db=db, certificate_id=certificate_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )
    return certificate