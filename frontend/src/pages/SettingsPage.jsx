import { useState } from "react";
import { User, Lock, Moon, Sun, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../context/ThemeContext";
import { changePassword } from "../services/api";
import toast from "react-hot-toast";

const ROLE_LABELS = {
  org_super_admin: "Org Super Admin",
  manager: "Manager",
  employee: "Employee",
  guest: "Guest",
  custom: "Custom",
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (next.length < 8) return toast.error("New password must be at least 8 characters");
    if (next !== confirm) return toast.error("Passwords don't match");
    setSaving(true);
    try {
      await changePassword(current, next);
      toast.success("Password updated");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-rose-muted sm:text-base">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={17} className="text-gold" />
          <h2 className="font-display text-base font-semibold text-cream">Profile</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-rose-muted mb-1">Full name</p>
            <p className="text-cream">{user?.full_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-rose-muted mb-1">Email</p>
            <p className="text-cream">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-rose-muted mb-1">Role</p>
            <p className="text-cream">{ROLE_LABELS[user?.role] || user?.role || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-rose-muted mb-1">Status</p>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${user?.is_active ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
              {user?.is_active ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          {isDark ? <Moon size={17} className="text-gold" /> : <Sun size={17} className="text-gold" />}
          <h2 className="font-display text-base font-semibold text-cream">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cream">Dark mode</p>
            <p className="text-xs text-rose-muted mt-0.5">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-6 w-11 items-center rounded-full bg-surface-hover px-0.5 transition-colors"
          >
            <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gold transition-transform ${isDark ? "translate-x-0" : "translate-x-5"}`}>
              {isDark ? <Moon size={11} className="text-base-deep" /> : <Sun size={11} className="text-base-deep" />}
            </div>
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={17} className="text-gold" />
          <h2 className="font-display text-base font-semibold text-cream">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-rose-muted mb-1.5">Current password</label>
            <input
              type={showPw ? "text" : "password"}
              value={current}
              onChange={e => setCurrent(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-cream outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-xs text-rose-muted mb-1.5">New password</label>
            <input
              type={showPw ? "text" : "password"}
              value={next}
              onChange={e => setNext(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-cream outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-xs text-rose-muted mb-1.5">Confirm new password</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-cream outline-none focus:border-gold/50"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="flex items-center gap-1.5 text-xs text-rose-muted hover:text-cream transition-colors"
          >
            {showPw ? <EyeOff size={13} /> : <Eye size={13} />} {showPw ? "Hide" : "Show"} passwords
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />} Update Password
          </button>
        </form>
      </div>
    </div>
  );
}