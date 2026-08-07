/*import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, Mail } from "lucide-react";
import { register as apiRegister, sendOTP, verifyOTP } from "../../services/api";
import { storeLoginToken } from "../../services/auth";
import { useAuthStore } from "../../store/useAuthStore";
import { useTheme } from "../../context/ThemeContext";
import logoLight from "../../assets/logo-light.png";
import logoDark from "../../assets/logo-dark.png";

const STEPS = ["Company Info","Verify Email","Create Account"];
const s1 = z.object({ organization_name: z.string().min(2), organization_slug: z.string().min(2).regex(/^[a-z0-9-]+$/,"Lowercase, numbers, hyphens only"), email: z.string().email() });
const s3 = z.object({ full_name: z.string().min(2), password: z.string().min(8), confirm_password: z.string() }).refine(d => d.password === d.confirm_password, { message: "Passwords must match", path: ["confirm_password"] });

export default function Register() {
  const navigate = useNavigate();
  const fetchUser = useAuthStore(s => s.fetchUser);
  const { isDark } = useTheme();
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [stepData, setStepData] = useState({});
  const [loading, setLoading] = useState(false);
  const f1 = useForm({ resolver: zodResolver(s1) });
  const f3 = useForm({ resolver: zodResolver(s3) });

  async function handleStep1(data) {
    setLoading(true);
    try { await sendOTP(data.email); setStepData(data); setStep(1); toast.success("OTP sent to your email"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed to send OTP"); }
    setLoading(false);
  }
  async function handleVerify() {
    setLoading(true);
    try { await verifyOTP(stepData.email, otp); setStep(2); toast.success("Email verified!"); }
    catch { toast.error("Invalid OTP"); }
    setLoading(false);
  }
  async function handleStep3(data) {
    setLoading(true);
    try { const r = await apiRegister({ ...stepData, full_name: data.full_name, password: data.password }); storeLoginToken(r); await fetchUser(); toast.success("Welcome to NyayaSetu!"); navigate("/dashboard"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Registration failed"); }
    setLoading(false);
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F8EF7]"><Brain size={24} className="text-white" /></div>
          <h1 className="text-2xl font-bold text-white">Think<span className="text-[#4F8EF7]">Hive</span></h1>
          <p className="text-white/50">Register your company</p>
        </div>
        <div className="mb-6 flex items-center justify-center gap-0">
          {STEPS.map((s,i) => (
            <div key={s} className="flex items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold
                ${i < step ? "bg-[#2DD4A7] text-white" : i === step ? "bg-[#4F8EF7] text-white" : "bg-white/10 text-white/40"}`}>
                {i < step ? <CheckCircle size={14} /> : i+1}
              </div>
              {i < STEPS.length-1 && <div className={`h-px w-14 ${i < step ? "bg-[#2DD4A7]" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#1C2540] bg-[#131929] p-8">
          {step === 0 && (
            <form onSubmit={f1.handleSubmit(handleStep1)} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Company Information</h2>
              {[{name:"organization_name",label:"Company Name",placeholder:"Acme Corp"},{name:"organization_slug",label:"Company Slug",placeholder:"acme-corp",hint:"Used to login — lowercase, no spaces"},{name:"email",label:"Work Email",placeholder:"you@acme.com",type:"email"}].map(({name,label,placeholder,type="text",hint})=>(
                <div key={name}><label className="mb-1 block text-sm text-white/70">{label}</label>
                <input {...f1.register(name)} type={type} placeholder={placeholder} className="w-full rounded-lg border border-[#1C2540] bg-[#0B0F1A] px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#4F8EF7] focus:outline-none" />
                {hint && <p className="mt-0.5 text-xs text-white/30">{hint}</p>}
                {f1.formState.errors[name] && <p className="mt-1 text-xs text-red-400">{f1.formState.errors[name].message}</p>}</div>
              ))}
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#4F8EF7] py-3 text-sm font-semibold text-white hover:bg-[#4F8EF7]/90 disabled:opacity-50">{loading?"Sending OTP...":"Continue →"}</button>
            </form>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#4F8EF7]/20"><Mail size={22} className="text-[#4F8EF7]" /></div>
              <h2 className="text-lg font-semibold text-white">Verify Email</h2>
              <p className="text-sm text-white/50">OTP sent to <span className="text-white">{stepData.email}</span></p></div>
              <input value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} placeholder="123456" className="w-full rounded-lg border border-[#1C2540] bg-[#0B0F1A] px-4 py-3 text-center text-2xl tracking-widest text-white focus:border-[#4F8EF7] focus:outline-none" />
              <button onClick={handleVerify} disabled={loading||otp.length!==6} className="w-full rounded-lg bg-[#4F8EF7] py-3 text-sm font-semibold text-white hover:bg-[#4F8EF7]/90 disabled:opacity-50">{loading?"Verifying...":"Verify OTP"}</button>
              <button onClick={()=>handleStep1(stepData)} className="w-full text-sm text-white/40 hover:text-white">Resend OTP</button>
            </div>
          )}
          {step === 2 && (
            <form onSubmit={f3.handleSubmit(handleStep3)} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Create Account</h2>
              <p className="text-sm text-white/50">You will be the Super Admin of <span className="text-white">{stepData.organization_name}</span></p>
              {[{name:"full_name",label:"Full Name",placeholder:"Jane Smith"},{name:"password",label:"Password",placeholder:"••••••••",type:"password"},{name:"confirm_password",label:"Confirm Password",placeholder:"••••••••",type:"password"}].map(({name,label,placeholder,type="text"})=>(
                <div key={name}><label className="mb-1 block text-sm text-white/70">{label}</label>
                <input {...f3.register(name)} type={type} placeholder={placeholder} className="w-full rounded-lg border border-[#1C2540] bg-[#0B0F1A] px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#4F8EF7] focus:outline-none" />
                {f3.formState.errors[name] && <p className="mt-1 text-xs text-red-400">{f3.formState.errors[name].message}</p>}</div>
              ))}
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#4F8EF7] py-3 text-sm font-semibold text-white hover:bg-[#4F8EF7]/90 disabled:opacity-50">{loading?"Creating...":"Launch Platform"}</button>
            </form>
          )}
          <p className="mt-5 text-center text-sm text-white/40">Already registered? <Link to="/login" className="text-[#4F8EF7] hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
*/


import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, Mail } from "lucide-react";
import { register as apiRegister, sendOTP, verifyOTP } from "../../services/api";
import { storeLoginToken } from "../../services/auth";
import { useAuthStore } from "../../store/useAuthStore";
import { useTheme } from "../../context/ThemeContext";
import logoLight from "../../assets/logo-light.png";
import logoDark from "../../assets/logo-dark.png";

const STEPS = ["Company Info", "Verify Email", "Create Account"];
const s1 = z.object({ organization_name: z.string().min(2), organization_slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"), email: z.string().email() });
const s3 = z.object({ full_name: z.string().min(2), password: z.string().min(8), confirm_password: z.string() }).refine(d => d.password === d.confirm_password, { message: "Passwords must match", path: ["confirm_password"] });

export default function Register() {
  const navigate = useNavigate();
  const fetchUser = useAuthStore(s => s.fetchUser);
  const { isDark } = useTheme();
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [stepData, setStepData] = useState({});
  const [loading, setLoading] = useState(false);
  const f1 = useForm({ resolver: zodResolver(s1) });
  const f3 = useForm({ resolver: zodResolver(s3) });

  async function handleStep1(data) {
    setLoading(true);
    try { await sendOTP(data.email); setStepData(data); setStep(1); toast.success("OTP sent to your email"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed to send OTP"); }
    setLoading(false);
  }
  async function handleVerify() {
    setLoading(true);
    try {
      await verifyOTP(stepData.email, otp);
      setStepData(prev => ({ ...prev, otp }));
      setStep(2);
      toast.success("Email verified!");
    } catch {
      toast.error("Invalid OTP");
    }
    setLoading(false);
  }
  async function handleStep3(data) {
    setLoading(true);
    try {
      const r = await apiRegister({ ...stepData, full_name: data.full_name, password: data.password });
      storeLoginToken(r);
      await fetchUser();
      toast.success("Welcome to NyayaSetu!");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Registration failed");
    }
    setLoading(false);
  }

  const inputClass = "w-full rounded-lg border border-border bg-base px-4 py-2.5 text-cream placeholder:text-rose-muted/50 focus:border-gold focus:outline-none transition-colors";

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl">
            <img src={isDark ? logoDark : logoLight} alt="NyayaSetu" className="h-full w-full object-contain" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cream">Nyaya<span className="text-gold">Setu</span></h1>
          <p className="text-rose-muted">Register your company</p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors
                ${i < step ? "bg-success text-base-deep" : i === step ? "bg-gold text-base-deep" : "bg-surface-hover text-rose-muted"}`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-14 transition-colors ${i < step ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          {step === 0 && (
            <form onSubmit={f1.handleSubmit(handleStep1)} className="space-y-4">
              <h2 className="font-display text-lg font-semibold text-cream">Company Information</h2>
              {[{ name: "organization_name", label: "Company Name", placeholder: "Acme Corp" }, { name: "organization_slug", label: "Company Slug", placeholder: "acme-corp", hint: "Used to login — lowercase, no spaces" }, { name: "email", label: "Work Email", placeholder: "you@acme.com", type: "email" }].map(({ name, label, placeholder, type = "text", hint }) => (
                <div key={name}>
                  <label className="mb-1 block text-sm text-rose-muted">{label}</label>
                  <input {...f1.register(name)} type={type} placeholder={placeholder} className={inputClass} />
                  {hint && <p className="mt-0.5 text-xs text-rose-muted/70">{hint}</p>}
                  {f1.formState.errors[name] && <p className="mt-1 text-xs text-danger">{f1.formState.errors[name].message}</p>}
                </div>
              ))}
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-50 transition-colors">
                {loading ? "Sending OTP..." : "Continue →"}
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                  <Mail size={22} className="text-gold" />
                </div>
                <h2 className="font-display text-lg font-semibold text-cream">Verify Email</h2>
                <p className="text-sm text-rose-muted">OTP sent to <span className="text-cream">{stepData.email}</span></p>
              </div>
              <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="123456" className={`${inputClass} text-center text-2xl tracking-widest`} />
              <button onClick={handleVerify} disabled={loading || otp.length !== 6} className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-50 transition-colors">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button onClick={() => handleStep1(stepData)} className="w-full text-sm text-rose-muted hover:text-cream transition-colors">Resend OTP</button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={f3.handleSubmit(handleStep3)} className="space-y-4">
              <h2 className="font-display text-lg font-semibold text-cream">Create Account</h2>
              <p className="text-sm text-rose-muted">You will be the Super Admin of <span className="text-cream">{stepData.organization_name}</span></p>
              {[{ name: "full_name", label: "Full Name", placeholder: "Jane Smith" }, { name: "password", label: "Password", placeholder: "••••••••", type: "password" }, { name: "confirm_password", label: "Confirm Password", placeholder: "••••••••", type: "password" }].map(({ name, label, placeholder, type = "text" }) => (
                <div key={name}>
                  <label className="mb-1 block text-sm text-rose-muted">{label}</label>
                  <input {...f3.register(name)} type={type} placeholder={placeholder} className={inputClass} />
                  {f3.formState.errors[name] && <p className="mt-1 text-xs text-danger">{f3.formState.errors[name].message}</p>}
                </div>
              ))}
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-50 transition-colors">
                {loading ? "Creating..." : "Launch Platform"}
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-rose-muted">Already registered? <Link to="/login" className="text-gold hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
