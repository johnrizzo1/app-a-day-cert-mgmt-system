from fastapi import APIRouter

from app.api import certificates

api_router = APIRouter()
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])