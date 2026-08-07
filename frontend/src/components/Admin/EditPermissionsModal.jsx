import { useState } from "react";
import { X, ShieldCheck, Loader2 } from "lucide-react";
import { updateUser } from "../../services/api";
import toast from "react-hot-toast";

const ROLE_LABELS = {
  org_super_admin: "Org Super Admin",
  manager: "Manager",
  employee: "Employee",
  guest: "Guest",
  custom: "Custom",
};

const panelStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
};

export default function EditPermissionsModal({ user, matrix, onClose, onSaved }) {
  const [role, setRole] = useState(user.role || "employee");
  const [permissions, setPermissions] = useState(new Set(user.permissions || []));
  const [saving, setSaving] = useState(false);

  // Every permission string that appears anywhere in the real backend matrix
  // (excluding the super-admin wildcard), used to populate the checkbox list.
  const allPermissions = Array.from(
    new Set(
      (matrix || [])
        .filter((r) => r.role !== "org_super_admin")
        .flatMap((r) => r.permissions)
    )
  ).sort();

  const roleFixedPermissions = (matrix || []).find((r) => r.role === role)?.permissions || [];
  const isCustom = role === "custom";
  const isWildcard = roleFixedPermissions.includes("*");

  const togglePermission = (perm) => {
    if (!isCustom) return;
    setPermissions((prev) => {
      const next = new Set(prev);
      next.has(perm) ? next.delete(perm) : next.add(perm);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(user.id, {
        role,
        // Only send an explicit permissions array for custom roles — for
        // built-in roles the backend recomputes permissions from the role
        // itself, so sending a stale client-side list here would be wrong.
        permissions: isCustom ? Array.from(permissions) : undefined,
      });
      toast.success("Permissions updated");
      onSaved?.();
      onClose();
    } catch {
      toast.error("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="w-full max-w-lg rounded-2xl p-6" style={panelStyle}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} style={{ color: "#c9974a" }} />
            <h2 className="text-lg font-bold font-display" style={{ color: "var(--color-cream)" }}>
              Edit Permissions
            </h2>
          </div>
          <button onClick={onClose} style={{ color: "var(--color-rose-muted)" }} className="hover:opacity-70">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: "var(--color-rose-muted)" }}>
          {user.full_name} <span className="opacity-70">({user.email})</span>
        </p>

        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-rose-muted)" }}>
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm mb-4 outline-none"
          style={{ background: "var(--color-surface-hover)", border: "1px solid var(--color-border)", color: "var(--color-cream)" }}
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-rose-muted)" }}>
          Permissions
        </label>

        {!isCustom && (
          <p className="text-xs mb-3 rounded-lg px-3 py-2" style={{ background: "var(--color-surface-hover)", color: "var(--color-rose-muted)" }}>
            {isWildcard
              ? "This role has full access to everything — fixed in code, not editable per-user."
              : "Built-in roles have fixed permissions defined in code. Set the role to Custom to hand-pick permissions for this specific user."}
          </p>
        )}

        <div className="max-h-56 overflow-y-auto rounded-lg p-3 space-y-1.5" style={{ background: "var(--color-surface-hover)", border: "1px solid var(--color-border)" }}>
          {allPermissions.map((perm) => {
            const checked = isCustom ? permissions.has(perm) : (isWildcard || roleFixedPermissions.includes(perm));
            return (
              <label
                key={perm}
                className={`flex items-center gap-2 text-sm ${isCustom ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                style={{ color: "var(--color-cream)" }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!isCustom}
                  onChange={() => togglePermission(perm)}
                  className="accent-[#c9974a]"
                />
                {perm}
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm"
            style={{ color: "var(--color-rose-muted)", border: "1px solid var(--color-border)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
            style={{ background: "#c9974a", color: "#2B0A0F" }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}