from fastapi import Depends, HTTPException, status
from core.context import TenantContext
from api.dependencies.get_current_user import get_current_user


def require_permission(permission: str):
    async def checker(context: TenantContext = Depends(get_current_user)) -> TenantContext:
        if not context.has_permission(permission):
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"Permission required: {permission}")
        return context
    return checker
