from typing import Literal
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    account_type: Literal["citizen", "court"] = "citizen"
    organization_name: str | None = None   # required when account_type == "citizen"
    organization_slug: str | None = None   # required when account_type == "citizen"
    email: EmailStr
    full_name: str
    password: str
    otp: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    organization_slug: str


class ActivateAccountRequest(BaseModel):
    organization_slug: str
    email: EmailStr
    otp: str
    new_password: str


class ResendActivationRequest(BaseModel):
    organization_slug: str
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    id: str
    org_id: str
    email: str
    full_name: str
    role: str
    permissions: list[str]
    is_active: bool