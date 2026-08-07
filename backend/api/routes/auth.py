from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from pydantic import BaseModel, Field
from auth.models import (
    ActivateAccountRequest,
    LoginRequest,
    RegisterRequest,
    ResendActivationRequest,
    TokenResponse,
    UserRead,
)
from auth.repository import AuthRepository
from auth.service import AuthService
from api.dependencies.get_current_user import get_current_user
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from core.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def get_service(db: DatabaseDependency) -> AuthService:
    return AuthService(AuthRepository(db))


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    request: RegisterRequest,
    service: AuthService = Depends(get_service),
) -> TokenResponse:
    return await service.register(request)


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    service: AuthService = Depends(get_service),
) -> TokenResponse:
    return await service.login(request)


@router.post("/activate", response_model=TokenResponse)
async def activate(
    request: ActivateAccountRequest,
    service: AuthService = Depends(get_service),
) -> TokenResponse:
    return await service.activate_account(request)


@router.post("/resend-activation")
async def resend_activation(
    request: ResendActivationRequest,
    service: AuthService = Depends(get_service),
) -> dict:
    return await service.resend_activation(request)


@router.get("/me", response_model=UserRead)
async def me(
    db: DatabaseDependency,
    context: TenantContext = Depends(get_current_user),
) -> UserRead:
    try:
        user = await db["users"].find_one({"_id": ObjectId(context.user_id)})
    except Exception:
        user = None
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return UserRead(
        id=str(user["_id"]),
        org_id=str(user["org_id"]),
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        permissions=user.get("permissions", []),
        is_active=user.get("is_active", True),
    )


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    db: DatabaseDependency,
    context: TenantContext = Depends(get_current_user),
) -> dict:
    user = await db["users"].find_one({"_id": ObjectId(context.user_id)})
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if not verify_password(request.current_password, user["hashed_password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Current password is incorrect")

    await db["users"].update_one(
        {"_id": ObjectId(context.user_id)},
        {"$set": {"hashed_password": hash_password(request.new_password)}},
    )
    return {"message": "Password updated"}
