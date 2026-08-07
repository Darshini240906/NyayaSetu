'''from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from core.context import TenantContext
from core.enums import Role, ROLE_MAX_CLASSIFICATION
from core.security import decode_token

bearer = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> TenantContext:
    try:
        payload = decode_token(credentials.credentials)
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    org_id = payload.get("org_id")
    user_id = payload.get("sub")
    role_str = payload.get("role", "guest")
    perms = set(payload.get("permissions", []))

    if not org_id or not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token payload")

    try:
        role = Role(role_str)
    except ValueError:
        role = Role.GUEST

    return TenantContext(
        org_id=org_id,
        user_id=user_id,
        role=role,
        permissions=perms,
        max_classification=ROLE_MAX_CLASSIFICATION[role],
    )
'''

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from core.context import TenantContext
from core.enums import Role
from core.security import decode_token

bearer = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> TenantContext:
    try:
        payload = decode_token(credentials.credentials)
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    org_id = payload.get("org_id")
    user_id = payload.get("sub")
    role_str = payload.get("role", "guest")
    perms = set(payload.get("permissions", []))
    domain_id = payload.get("domain_id")

    if not org_id or not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token payload")

    try:
        role = Role(role_str)
    except ValueError:
        role = Role.GUEST

    return TenantContext(
        org_id=org_id,
        user_id=user_id,
        role=role,
        permissions=perms,
        domain_id=domain_id,
    )