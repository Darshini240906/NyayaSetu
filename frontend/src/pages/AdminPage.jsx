/*import { useEffect, useState } from "react";
import { Shield, Users, Download, RefreshCw, Trash2, Edit, Loader2 } from "lucide-react";
import { getAuditTrail, getUsers, deleteUser } from "../services/api";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [u, a] = await Promise.all([getUsers(), getAuditTrail()]);
      setUsers(u.users||[]); setAudit(a.logs||[]);
    } catch {} setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this user?")) return;
    try { await deleteUser(id); setUsers(u => u.filter(x => x.id !== id)); toast.success("User deleted"); }
    catch { toast.error("Delete failed"); }
  }

  const CONF_COLORS = { high:"text-emerald-400", medium:"text-amber-400", low:"text-red-400" };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Admin Panel</h1><p className="mt-1 text-white/50">Manage users and view audit trail</p></div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/50 hover:bg-white/5 transition">
          <RefreshCw size={14} className={loading?"animate-spin":""}/> Refresh
        </button>
      </div>
      <div className="flex gap-1 rounded-xl border border-white/10 bg-[#131929] p-1 w-fit">
        {[{k:"users",label:`Users (${users.length})`},{k:"audit",label:`Audit Trail (${audit.length})`}].map(({k,label})=>(
          <button key={k} onClick={()=>setTab(k)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab===k?"bg-[#4F8EF7] text-white":"text-white/50 hover:text-white"}`}>{label}</button>
        ))}
      </div>

      {tab === "users" && (
        <div className="rounded-2xl border border-white/10 bg-[#131929] p-5">
          {loading ? <div className="flex items-center justify-center py-8 text-white/40"><Loader2 size={18} className="animate-spin mr-2"/>Loading...</div>
          : users.length === 0 ? <p className="text-sm text-white/40 py-6 text-center">No users found</p>
          : <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0B0F1A] px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4F8EF7]/20 flex-shrink-0">
                    <span className="text-sm font-semibold text-[#4F8EF7]">{(u.full_name||"?")[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{u.full_name}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </div>
                  <span className="text-xs text-white/50 capitalize">{u.role?.replace(/_/g," ")}</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${u.is_active?"bg-emerald-500/20 text-emerald-400":"bg-red-500/20 text-red-400"}`}>{u.is_active?"Active":"Disabled"}</span>
                  <button onClick={() => handleDelete(u.id)} className="text-white/20 hover:text-red-400 transition p-1"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>}
        </div>
      )}

      {tab === "audit" && (
        <div className="rounded-2xl border border-white/10 bg-[#131929] p-5">
          {loading ? <div className="flex items-center justify-center py-8 text-white/40"><Loader2 size={18} className="animate-spin mr-2"/>Loading...</div>
          : audit.length === 0 ? <p className="text-sm text-white/40 py-6 text-center">No audit logs yet. Start querying your knowledge base.</p>
          : <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {audit.map((l,i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-[#0B0F1A] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-white/80 flex-1">{l.query}</p>
                    <span className={`text-xs font-medium flex-shrink-0 ${CONF_COLORS[l.confidence_label]||"text-white/40"}`}>{l.confidence_label}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">{l.answer}</p>
                  <p className="mt-1 text-xs text-white/20">{l.created_at ? new Date(l.created_at).toLocaleString() : ""}</p>
                </div>
              ))}
            </div>}
        </div>
      )}
    </div>
  );
}
*/
import { Fragment, useEffect, useState } from "react";
import { Users, RefreshCw, Trash2, Edit, Loader2, ShieldCheck, Info } from "lucide-react";
import { getAuditTrail, getUsers, deleteUser, getPermissionsMatrix } from "../services/api";
import EditPermissionsModal from "../components/Admin/EditPermissionsModal";
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

const CONF_COLORS = { high: "text-emerald-400", medium: "text-amber-400", low: "text-red-400" };

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [u, a, m] = await Promise.all([getUsers(), getAuditTrail(), getPermissionsMatrix()]);
      setUsers(u.users || []);
      setAudit(a.logs || []);
      setMatrix(m.roles || []);
    } catch {
      toast.error("Failed to load admin data");
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  // Real counts derived from the actual user list — not fabricated tiers.
  const roleCounts = Object.keys(ROLE_LABELS).reduce((acc, role) => {
    acc[role] = users.filter((u) => u.role === role).length;
    return acc;
  }, {});

  const allPermissions = Array.from(
    new Set(matrix.filter((r) => r.role !== "org_super_admin").flatMap((r) => r.permissions))
  ).sort();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Admin Settings
          </h1>
          <p className="mt-1 text-sm text-rose-muted sm:text-base">
            Manage users, roles, and permissions
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition"
          style={{ ...panelStyle, color: "var(--color-rose-muted)" }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stat cards — real role counts from the actual user list */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["org_super_admin", "manager", "employee", "guest"].map((role) => (
          <div key={role} className="rounded-2xl p-5" style={panelStyle}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "rgba(201, 151, 71, 0.12)" }}
            >
              <ShieldCheck size={16} style={{ color: "#c9974a" }} />
            </div>
            <p className="text-2xl font-bold font-display" style={{ color: "var(--color-cream)" }}>
              {roleCounts[role] || 0}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-rose-muted)" }}>
              {ROLE_LABELS[role]}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl p-1" style={panelStyle}>
        {[
          { k: "users", label: `Users (${users.length})` },
          { k: "matrix", label: "Permissions Matrix" },
          { k: "audit", label: `Audit Trail (${audit.length})` },
        ].map(({ k, label }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4"
            style={
              tab === k
                ? { background: "#c9974a", color: "#2B0A0F" }
                : { color: "var(--color-rose-muted)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="rounded-2xl p-4 sm:p-5" style={panelStyle}>
          {loading ? (
            <div className="flex items-center justify-center py-8" style={{ color: "var(--color-rose-muted)" }}>
              <Loader2 size={18} className="animate-spin mr-2" />Loading...
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "var(--color-rose-muted)" }}>No users found</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <Fragment key={u.id}>
                  <div
                    className="rounded-xl px-3 py-3 sm:hidden"
                    style={{ background: "var(--color-surface-hover)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0"
                        style={{ background: "rgba(201, 151, 71, 0.18)" }}
                      >
                        <span className="text-sm font-semibold text-gold">
                          {(u.full_name || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-cream">{u.full_name}</p>
                        <p className="text-xs truncate text-rose-muted">{u.email}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-rose-muted">{ROLE_LABELS[u.role] || u.role}</span>
                          <span className={`text-xs rounded-full px-2 py-0.5 ${u.is_active ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                            {u.is_active ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-1">
                      <button onClick={() => setEditingUser(u)} className="rounded-lg p-2 text-rose-muted hover:opacity-80" title="Edit permissions">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="rounded-lg p-2 text-rose-muted hover:text-danger" title="Delete user">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div
                    key={u.id}
                    className="hidden sm:flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "var(--color-surface-hover)", border: "1px solid var(--color-border)" }}
                  >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0"
                    style={{ background: "rgba(201, 151, 71, 0.18)" }}
                  >
                    <span className="text-sm font-semibold" style={{ color: "#c9974a" }}>
                      {(u.full_name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--color-cream)" }}>{u.full_name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--color-rose-muted)" }}>{u.email}</p>
                  </div>
                  <span className="text-xs" style={{ color: "var(--color-rose-muted)" }}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                  <span
                    className="text-xs rounded-full px-2 py-0.5"
                    style={
                      u.is_active
                        ? { background: "rgba(76, 175, 125, 0.18)", color: "#4caf7d" }
                        : { background: "rgba(224, 90, 90, 0.18)", color: "#e05a5a" }
                    }
                  >
                    {u.is_active ? "Active" : "Disabled"}
                  </span>
                  <button
                    onClick={() => setEditingUser(u)}
                    className="p-1 transition hover:opacity-80"
                    style={{ color: "var(--color-rose-muted)" }}
                    title="Edit permissions"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-1 transition hover:text-red-400"
                    style={{ color: "var(--color-rose-muted)" }}
                    title="Delete user"
                  >
                    <Trash2 size={14} />
                  </button>
                  </div>
                  </Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "matrix" && (
        <div className="rounded-2xl p-4 sm:p-5" style={panelStyle}>
          <div
            className="flex items-start gap-2 text-xs rounded-lg px-3 py-2 mb-4"
            style={{ background: "var(--color-surface-hover)", color: "var(--color-rose-muted)" }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Built-in role permissions are fixed in code (<code>rbac/permissions.py</code>) and shown here read-only.
              To customize access for one person, set their role to Custom from the Users tab.
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8" style={{ color: "var(--color-rose-muted)" }}>
              <Loader2 size={18} className="animate-spin mr-2" />Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--color-rose-muted)" }}>
                      Permission
                    </th>
                    {Object.entries(ROLE_LABELS).filter(([r]) => r !== "custom").map(([r, label]) => (
                      <th key={r} className="text-center py-2 px-3 font-semibold" style={{ color: "var(--color-rose-muted)" }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPermissions.map((perm) => (
                    <tr key={perm} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td className="py-2 pr-4" style={{ color: "var(--color-cream)" }}>{perm}</td>
                      {Object.keys(ROLE_LABELS).filter((r) => r !== "custom").map((r) => {
                        const rolePerms = matrix.find((m) => m.role === r)?.permissions || [];
                        const has = rolePerms.includes("*") || rolePerms.includes(perm);
                        return (
                          <td key={r} className="text-center py-2 px-3">
                            <span style={{ color: has ? "#4caf7d" : "var(--color-border)" }}>
                              {has ? "✓" : "—"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "audit" && (
        <div className="rounded-2xl p-4 sm:p-5" style={panelStyle}>
          {loading ? (
            <div className="flex items-center justify-center py-8" style={{ color: "var(--color-rose-muted)" }}>
              <Loader2 size={18} className="animate-spin mr-2" />Loading...
            </div>
          ) : audit.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "var(--color-rose-muted)" }}>
              No audit logs yet. Start querying your knowledge base.
            </p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {audit.map((l, i) => (
                <div
                  key={i}
                  className="rounded-xl px-4 py-3"
                  style={{ background: "var(--color-surface-hover)", border: "1px solid var(--color-border)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm flex-1" style={{ color: "var(--color-cream)" }}>{l.query}</p>
                    <span className={`text-xs font-medium flex-shrink-0 ${CONF_COLORS[l.confidence_label] || ""}`}>
                      {l.confidence_label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--color-rose-muted)" }}>{l.answer}</p>
                  <p className="mt-1 text-xs opacity-60" style={{ color: "var(--color-rose-muted)" }}>
                    {l.created_at ? new Date(l.created_at).toLocaleString() : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingUser && (
        <EditPermissionsModal
          user={editingUser}
          matrix={matrix}
          onClose={() => setEditingUser(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
