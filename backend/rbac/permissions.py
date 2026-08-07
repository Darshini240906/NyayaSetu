from core.enums import Role

# Everything a citizen needs for "Understand My Case", chat/search, reminders,
# and managing their own org's users.
CITIZEN_PERMISSIONS: set[str] = {
    "documents:upload", "documents:read", "documents:manage",
    "query:run", "admin:read", "admin:manage", "domains:manage",
}

ROLE_PERMISSIONS: dict[Role, set[str]] = {
    # Was "*" (wildcard = bypasses every permission check, including
    # court:manage). Citizens sign up as this role, so it's now an explicit
    # list — anything citizens should be able to do must be listed here.
    Role.ORG_SUPER_ADMIN: CITIZEN_PERMISSIONS,
    Role.MANAGER: {"documents:upload", "documents:read", "documents:manage", "query:run", "admin:read", "domains:manage", "hr:manage"},
    Role.EMPLOYEE: {"documents:upload", "documents:read", "query:run"},
    Role.GUEST: {"documents:read", "query:run"},
    Role.COURT: CITIZEN_PERMISSIONS | {"court:manage"},
    Role.CUSTOM: set(),
}


def permissions_for_role(role: Role, custom: list[str] | None = None) -> set[str]:
    perms = set(ROLE_PERMISSIONS[role])
    if role == Role.CUSTOM and custom:
        perms.update(custom)
    return perms