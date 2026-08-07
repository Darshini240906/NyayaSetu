import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import logoDark from "../assets/logo-dark.png";
import {KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";
import { activateAccount, resendActivation } from "../services/api";
import { storeLoginToken } from "../services/auth";
import { useAuthStore } from "../store/useAuthStore";

export default function ActivateAccountPage() {
  const navigate = useNavigate();
  const fetchUser = useAuthStore(s => s.fetchUser);
  const [form, setForm] = useState({ organization_slug: "", email: "", otp: "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  function update(name, value) { setForm(p => ({ ...p, [name]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) { toast.error("Passwords must match"); return; }
    if (form.new_password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const r = await activateAccount({
        organization_slug: form.organization_slug,
        email: form.email,
        otp: form.otp,
        new_password: form.new_password,
      });
      storeLoginToken(r);
      await fetchUser();
      toast.success("Account activated!");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Activation failed");
    }
    setLoading(false);
  }

  async function handleResend() {
    if (!form.organization_slug || !form.email) { toast.error("Enter your organization and email first"); return; }
    setResending(true);
    try {
      await resendActivation({ organization_slug: form.organization_slug, email: form.email });
      toast.success("Code resent — check your email");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to resend code");
    }
    setResending(false);
  }

  const inputClass = "w-full rounded-lg border border-border bg-base px-4 py-2.5 text-cream placeholder:text-rose-muted/50 focus:border-gold focus:outline-none transition-colors";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-4 py-12">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Link to="/login" className="mb-8 flex w-fit items-center gap-1.5 text-sm text-rose-muted hover:text-cream transition-colors">
          <ArrowLeft size={15} /> Back to login
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold">
            <img src={logoDark} alt="NyayaSetu" className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cream">
            Think<span className="text-gold">Hive</span>
          </h1>
          <p className="mt-1 text-rose-muted">Activate your account</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
              <KeyRound size={22} className="text-gold" />
            </div>
            <p className="text-sm text-rose-muted">Enter the code emailed to you and choose your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: "organization_slug", label: "Organization Slug", placeholder: "acme-corp" },
              { name: "email", label: "Work Email", placeholder: "you@acme.com", type: "email" },
              { name: "otp", label: "Setup Code", placeholder: "123456" },
              { name: "new_password", label: "New Password", placeholder: "••••••••", type: "password" },
              { name: "confirm_password", label: "Confirm Password", placeholder: "••••••••", type: "password" },
            ].map(({ name, label, placeholder, type = "text" }) => (
              <div key={name}>
                <label className="mb-1 block text-sm text-rose-muted">{label}</label>
                <input
                  type={type}
                  value={form[name]}
                  placeholder={placeholder}
                  onChange={e => update(name, e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-50 transition-colors"
            >
              {loading ? "Activating..." : "Activate Account"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full text-sm text-rose-muted hover:text-cream transition-colors disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend code"}
            </button>
          </form>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-rose-muted/70">
          <ShieldCheck size={12} /> Your setup code expires 30 minutes after it's sent
        </p>
      </div>
    </div>
  );
}