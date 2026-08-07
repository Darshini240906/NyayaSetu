'''
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from audit.repository import AuditLogRepository
from audit.service import AuditService
from core.context import TenantContext
from core.enums import Role
from core.security import hash_password
from rbac.permissions import permissions_for_role

router = APIRouter(prefix="/admin", tags=["admin"])

class CreateUserReq(BaseModel):
    email: EmailStr; full_name: str; password: str; role: str = "employee"

class UpdateUserReq(BaseModel):
    role: str | None = None; is_active: bool | None = None

@router.get("/users")
async def get_users(db: DatabaseDependency, context: TenantContext = Depends(require_permission("admin:read"))) -> dict:
    cursor = db["users"].find({"org_id": context.org_id}, {"hashed_password": 0}).limit(200)
    users = []
    async for u in cursor:
        u["id"] = str(u.pop("_id")); users.append(u)
    return {"users": users}

@router.post("/users", status_code=201)
async def create_user(req: CreateUserReq, db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("admin:manage"))) -> dict:
    from datetime import UTC, datetime
    if await db["users"].find_one({"org_id": context.org_id, "email": req.email.lower()}):
        raise HTTPException(status.HTTP_409_CONFLICT, "User already exists")
    role = Role(req.role) if req.role in Role._value2member_map_ else Role.EMPLOYEE
    r = await db["users"].insert_one({"org_id": context.org_id, "email": req.email.lower(), "full_name": req.full_name,
        "hashed_password": hash_password(req.password), "role": role.value,
        "permissions": list(permissions_for_role(role)), "is_active": True,
        "created_at": datetime.now(UTC), "updated_at": datetime.now(UTC)})
    return {"id": str(r.inserted_id), "email": req.email}

@router.put("/users/{user_id}")
async def update_user(user_id: str, req: UpdateUserReq, db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("admin:manage"))) -> dict:
    from bson import ObjectId; from datetime import UTC, datetime
    update = {"updated_at": datetime.now(UTC)}
    if req.role: update["role"] = req.role
    if req.is_active is not None: update["is_active"] = req.is_active
    r = await db["users"].update_one({"_id": ObjectId(user_id), "org_id": context.org_id}, {"$set": update})
    if r.matched_count == 0: raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return {"updated": True}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("admin:manage"))) -> dict:
    from bson import ObjectId
    r = await db["users"].delete_one({"_id": ObjectId(user_id), "org_id": context.org_id})
    if r.deleted_count == 0: raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return {"deleted": True}

@router.get("/tenants")
async def get_tenants(db: DatabaseDependency, context: TenantContext = Depends(require_permission("admin:read"))) -> dict:
    cursor = db["organizations"].find({}).limit(50)
    tenants = []
    async for o in cursor:
        o["id"] = str(o.pop("_id")); tenants.append(o)
    return {"tenants": tenants}

@router.get("/audit-trail")
async def audit_trail(db: DatabaseDependency, context: TenantContext = Depends(require_permission("admin:read"))) -> dict:
    svc = AuditService(AuditLogRepository(db))
    return {"logs": await svc.list_logs(context)}
'''

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from audit.repository import AuditLogRepository
from audit.service import AuditService
from core.context import TenantContext
from core.enums import Role
from core.security import hash_password
from rbac.permissions import ROLE_PERMISSIONS, permissions_for_role

router = APIRouter(prefix="/admin", tags=["admin"])

class CreateUserReq(BaseModel):
    email: EmailStr; full_name: str; password: str; role: str = "employee"

class UpdateUserReq(BaseModel):
    role: str | None = None
    is_active: bool | None = None
    # Explicit permission overrides. Meaningful for role="custom"; if provided
    # alongside a non-custom role change it still wins over the role default.
    permissions: list[str] | None = None

@router.get("/users")
async def get_users(db: DatabaseDependency, context: TenantContext = Depends(require_permission("admin:read"))) -> dict:
    cursor = db["users"].find({"org_id": context.org_id}, {"hashed_password": 0}).limit(200)
    users = []
    async for u in cursor:
        u["id"] = str(u.pop("_id")); users.append(u)
    return {"users": users}

@router.post("/users", status_code=201)
async def create_user(req: CreateUserReq, db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("admin:manage"))) -> dict:
    from datetime import UTC, datetime
    if await db["users"].find_one({"org_id": context.org_id, "email": req.email.lower()}):
        raise HTTPException(status.HTTP_409_CONFLICT, "User already exists")
    role = Role(req.role) if req.role in Role._value2member_map_ else Role.EMPLOYEE
    r = await db["users"].insert_one({"org_id": context.org_id, "email": req.email.lower(), "full_name": req.full_name,
        "hashed_password": hash_password(req.password), "role": role.value,
        "permissions": list(permissions_for_role(role)), "is_active": True,
        "created_at": datetime.now(UTC), "updated_at": datetime.now(UTC)})
    return {"id": str(r.inserted_id), "email": req.email}

@router.put("/users/{user_id}")
async def update_user(user_id: str, req: UpdateUserReq, db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("admin:manage"))) -> dict:
    from bson import ObjectId; from datetime import UTC, datetime
    update = {"updated_at": datetime.now(UTC)}

    if req.role:
        role_enum = Role(req.role) if req.role in Role._value2member_map_ else Role.EMPLOYEE
        update["role"] = role_enum.value
        # Recompute permissions from the new role by default — previously this
        # was skipped, so promoting/demoting a user left their old permission
        # set stale until they were recreated.
        if req.permissions is not None:
            update["permissions"] = req.permissions
        else:
            update["permissions"] = list(permissions_for_role(role_enum, custom=req.permissions))
    elif req.permissions is not None:
        # Role unchanged, but explicit permission overrides were sent
        # (e.g. editing an existing custom user's permission set).
        update["permissions"] = req.permissions

    if req.is_active is not None:
        update["is_active"] = req.is_active

    r = await db["users"].update_one({"_id": ObjectId(user_id), "org_id": context.org_id}, {"$set": update})
    if r.matched_count == 0: raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return {"updated": True}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, db: DatabaseDependency,
    context: TenantContext = Depends(require_permission("admin:manage"))) -> dict:
    from bson import ObjectId
    r = await db["users"].delete_one({"_id": ObjectId(user_id), "org_id": context.org_id})
    if r.deleted_count == 0: raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return {"deleted": True}

@router.get("/tenants")
async def get_tenants(db: DatabaseDependency, context: TenantContext = Depends(require_permission("admin:read"))) -> dict:
    cursor = db["organizations"].find({}).limit(50)
    tenants = []
    async for o in cursor:
        o["id"] = str(o.pop("_id")); tenants.append(o)
    return {"tenants": tenants}

@router.get("/audit-trail")
async def audit_trail(db: DatabaseDependency, context: TenantContext = Depends(require_permission("admin:read"))) -> dict:
    svc = AuditService(AuditLogRepository(db))
    return {"logs": await svc.list_logs(context)}

@router.get("/permissions-matrix")
async def permissions_matrix(context: TenantContext = Depends(require_permission("admin:read"))) -> dict:
    """
    Read-only view of the real, hardcoded ROLE_PERMISSIONS mapping from
    rbac/permissions.py. This reflects actual backend behavior — it is not
    editable here since built-in role permissions live in code, not the DB.
    Only CUSTOM-role users have a persisted, per-user permissions array that
    can actually be edited (see PUT /admin/users/{id}).
    """
    return {
        "roles": [
            {
                "role": role.value,
                "permissions": ["*"] if "*" in perms else sorted(perms),
            }
            for role, perms in ROLE_PERMISSIONS.items()
        ]
    }