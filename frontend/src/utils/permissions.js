// frontend/src/utils/permissions.js
// Mirrors backend/rbac/permissions.py's permission-check logic on the frontend,
// purely for UI purposes (hiding nav links, buttons, etc).
// This is NOT a security boundary — the backend's require_permission() checks
// on every route are what actually enforce access. This just avoids showing
// users links that would 403 if they clicked them.

export function hasPermission(user, permission) {
  if (!user) return false;
  const perms = user.permissions || [];
  if (perms.includes("*")) return true; // org_super_admin
  if (!permission) return true; // no permission required for this item
  return perms.includes(permission);
}