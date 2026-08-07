from core.enums import Role

ROLE_PERMISSIONS: dict[Role, set[str]] = {
    Role.ORG_SUPER_ADMIN: {"*"},
    Role.MANAGER: {"documents:upload","documents:read","documents:manage","query:run","admin:read","domains:manage","hr:manage"},
    Role.EMPLOYEE: {"documents:upload","documents:read","query:run"},
    Role.GUEST: {"documents:read","query:run"},
    Role.CUSTOM: set(),
}

def permissions_for_role(role: Role, custom: list[str] | None = None) -> set[str]:
    perms = set(ROLE_PERMISSIONS[role])
    if role == Role.CUSTOM and custom:
        perms.update(custom)
    return perms
