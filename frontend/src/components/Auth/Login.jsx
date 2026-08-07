import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Brain, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useTheme } from "../../context/ThemeContext";
import logoLight from "../../assets/logo-light.png";
import logoDark from "../../assets/logo-dark.png";

const schema = z.object({ email: z.string().email(), password: z.string().min(8), organization_slug: z.string().min(2) });

const TRUST_POINTS = ["SOC 2 Type II Certified", "GDPR Compliant", "99.9% SLA Uptime"];

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { isDark } = useTheme();
  const [roleTab, setRoleTab] = useState("super_admin");
  const [remember, setRemember] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(d) {
    try { await login(d.email, d.password, d.organization_slug); navigate("/dashboard"); }
    catch { toast.error("Login failed — check credentials and organisation slug"); }
  }

  const inputClass = "w-full rounded-lg border border-border bg-base px-4 py-2.5 text-cream placeholder:text-rose-muted/50 focus:border-gold focus:outline-none transition-colors";

  return (
    <div className="flex min-h-screen bg-base">
      {/* Left — form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-16 lg:w-1/2">
        <Link to="/" className="mb-8 flex items-center gap-1.5 text-sm text-rose-muted hover:text-cream transition-colors w-fit">
          <ArrowLeft size={15} /> Back
        </Link>

        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
            <img src={isDark ? logoDark : logoLight} alt="NyayaSetu" className="h-full w-full object-contain" />
          </div>
          <span className="font-display text-lg font-bold text-cream">NyayaSetu</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-cream">Welcome back</h1>
        <p className="mt-1 mb-6 text-rose-muted">Sign in to your NyayaSetu account.</p>

        <div className="mb-6 flex rounded-xl border border-border bg-surface p-1">
          {[{ key: "admin", label: "Admin" }, { key: "super_admin", label: "Super Admin" }].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRoleTab(key)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors
                ${roleTab === key ? "bg-gold text-base-deep" : "text-rose-muted hover:text-cream"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <input {...register("organization_slug")} type="text" placeholder="Organisation slug" className={inputClass} />
            <p className="mt-1 text-xs text-rose-muted/70">e.g. acme-corp</p>
            {errors.organization_slug && <p className="mt-1 text-xs text-danger">{errors.organization_slug.message}</p>}
          </div>
          <div>
            <input {...register("email")} type="email" placeholder="Email address" className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <input {...register("password")} type="password" placeholder="Password" className={inputClass} />
            {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-rose-muted cursor-pointer">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded border-border accent-gold" />
              Remember me
            </label>
            <a href="#" className="text-gold hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Signing in..." : `Sign in as ${roleTab === "super_admin" ? "Super Admin" : "Admin"}`}
          </button>

          <p className="text-center text-sm text-rose-muted">
            No account? <Link to="/register" className="text-gold hover:underline">Register your company</Link>
          </p>
          <p className="text-center text-sm text-rose-muted">
            First time here? <Link to="/activate" className="text-gold hover:underline">Activate your account</Link>
          </p>
        </form>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-rose-muted/70">
          <Lock size={12} /> All sessions are audit-logged
        </p>
      </div>

      {/* Right — trust panel */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-base-deep lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
        <div className="relative z-10 max-w-sm px-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
            <Brain size={30} className="text-gold" />
          </div>
          <h2 className="font-display text-3xl font-bold text-cream">Secure by design</h2>
          <p className="mt-4 text-rose-muted">
            Role-based access control, end-to-end audit trails, and enterprise-grade security built into every layer of NyayaSetu.
          </p>
          <div className="mt-8 space-y-3">
            {TRUST_POINTS.map((point, i) => (
              <div
                key={point}
                className="stagger-item flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                <span className="text-sm text-cream">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
