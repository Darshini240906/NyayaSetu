from fastapi import HTTPException, status
from auth.models import (
    ActivateAccountRequest,
    LoginRequest,
    RegisterRequest,
    ResendActivationRequest,
    TokenResponse,
)
from auth.repository import AuthRepository
from config import settings
from core.email import send_activation_email
from core.enums import Role
from core.security import (
    create_access_token,
    create_refresh_token,
    generate_setup_code,
    hash_password,
    verify_password,
)
from otp.service import verify_otp
from rbac.permissions import permissions_for_role


class AuthService:
    def __init__(self, repo: AuthRepository):
        self.repo = repo

    async def register(self, request: RegisterRequest) -> TokenResponse:
        if not verify_otp(request.email, request.otp):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired registration OTP")

        if request.account_type == "court":
            role = Role.COURT
            org = await self.repo.find_org_by_slug(settings.court_org_slug)
            org_id = str(org["_id"]) if org else await self.repo.create_org({
                "name": settings.court_org_name,
                "slug": settings.court_org_slug,
                "is_active": True,
            })
            slug_for_email = settings.court_org_slug
        else:
            if not request.organization_name or not request.organization_slug:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Organisation name and slug are required")
            if await self.repo.find_org_by_slug(request.organization_slug):
                raise HTTPException(status.HTTP_409_CONFLICT, "Organisation slug already taken")
            role = Role.ORG_SUPER_ADMIN
            org_id = await self.repo.create_org({
                "name": request.organization_name,
                "slug": request.organization_slug,
                "is_active": True,
            })
            slug_for_email = request.organization_slug

        perms = list(permissions_for_role(role))
        user_id = await self.repo.create_user({
            "org_id": org_id,
            "email": request.email.lower(),
            "full_name": request.full_name,
            "hashed_password": hash_password(request.password),
            "role": role.value,
            "permissions": perms,
            "domain_id": None,
            "is_active": True,
            "must_reset_password": False,
        })

        code = generate_setup_code()
        await self.repo.create_setup_token(org_id, user_id, request.email.lower(), code)
        await send_activation_email(request.email, request.full_name, slug_for_email, code)

        return self._make_tokens(org_id, user_id, role, perms, domain_id=None)

    async def login(self, request: LoginRequest) -> TokenResponse:
        org = await self.repo.find_org_by_slug(request.organization_slug)
        if not org:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Organisation not found")

        org_id = str(org["_id"])
        user = await self.repo.find_user_by_email(org_id, request.email)
        if not user or not verify_password(request.password, user["hashed_password"]):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
        if not user.get("is_active", True):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")
        if user.get("must_reset_password"):
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Account not activated. Check your email to set your password.",
            )

        role = Role(user["role"])
        perms = user.get("permissions", list(permissions_for_role(role)))
        domain_id = user.get("domain_id")
        return self._make_tokens(org_id, str(user["_id"]), role, perms, domain_id)

    async def activate_account(self, request: ActivateAccountRequest) -> TokenResponse:
        org = await self.repo.find_org_by_slug(request.organization_slug)
        if not org:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Organisation not found")
        org_id = str(org["_id"])

        token = await self.repo.find_valid_token(org_id, request.email.lower(), request.otp)
        if not token:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")

        user = await self.repo.find_user_by_email(org_id, request.email.lower())
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

        await self.repo.set_user_password(str(user["_id"]), hash_password(request.new_password))
        await self.repo.mark_token_used(token["_id"])

        role = Role(user["role"])
        perms = user.get("permissions", list(permissions_for_role(role)))
        domain_id = user.get("domain_id")
        return self._make_tokens(org_id, str(user["_id"]), role, perms, domain_id)

    async def resend_activation(self, request: ResendActivationRequest) -> dict:
        org = await self.repo.find_org_by_slug(request.organization_slug)
        if not org:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Organisation not found")
        org_id = str(org["_id"])
        user = await self.repo.find_user_by_email(org_id, request.email.lower())
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

        code = generate_setup_code()
        await self.repo.create_setup_token(org_id, str(user["_id"]), request.email.lower(), code)
        await send_activation_email(request.email, user["full_name"], request.organization_slug, code)
        return {"message": "Activation email resent"}

    def _make_tokens(self, org_id, user_id, role, perms, domain_id=None) -> TokenResponse:
        payload = {
            "sub": user_id,
            "org_id": org_id,
            "role": role.value,
            "permissions": perms,
            "domain_id": domain_id,
        }
        return TokenResponse(
            access_token=create_access_token(payload),
            refresh_token=create_refresh_token(payload),
        )