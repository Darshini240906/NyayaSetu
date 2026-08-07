import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, FileSearch, Shield, Zap, Globe, BarChart3, ArrowRight, CheckCircle, Moon, Sun, Users, FolderOpen, FileText, Gauge, Menu, X } from "lucide-react";
import Typewriter from "../components/common/Typewriter";
import { useTheme } from "../context/ThemeContext";
import logoLight from "../assets/logo-light.png";
import logoDark from "../assets/logo-dark.png";

const FEATURES = [
  { icon: FileSearch, title: "Understand My Case", desc: "Upload a notice, FIR, or complaint. Get it explained in plain language — no legal jargon." },
  { icon: Shield, title: "Documentation Strength", desc: "See what's strong, what's missing, and what to gather — without predicting outcomes." },
  { icon: Brain, title: "Procedural Timeline", desc: "A stage-by-stage roadmap of what happens next, who's responsible, and what's needed." },
  { icon: Globe, title: "Multilingual Support", desc: "Get your explanation in English, Hindi, Tamil, Telugu, or Marathi." },
  { icon: Zap, title: "Calendar Reminders", desc: "Hearing dates and deadlines sync straight to your Google Calendar, plus in-app reminders." },
  { icon: BarChart3, title: "Court Triage Dashboard", desc: "Registrars see which cases are fast-track candidates and which need attention, at a glance." },
];

const DOMAINS = [
  { n: "Consumer", e: "🛒", d: "Complaints, notices, refund disputes" },
  { n: "Civil", e: "⚖️", d: "Suits, property, contract disputes" },
  { n: "Criminal", e: "🚓", d: "FIRs, chargesheets, bail matters" },
  { n: "Family", e: "🏠", d: "Divorce, maintenance, custody" },
  { n: "Labour", e: "🧑‍💼", d: "Employment disputes, terminations" },
  { n: "RTI", e: "📄", d: "Applications, appeals, information requests" },
];

const STEPS = [
  { n: "01", t: "Upload your document", d: "A notice, FIR, complaint, or summons — even a photo of a physical copy works." },
  { n: "02", t: "Get a plain-language explanation", d: "What it means, your rights, your obligations, and any deadlines, in your language." },
  { n: "03", t: "See your roadmap", d: "A stage-by-stage timeline of what happens next and what you'll need at each step." },
  { n: "04", t: "Never miss a date", d: "Deadlines sync to your Google Calendar and show up as in-app reminders." },
];

// Illustrative only — not pulled from live data, since this panel renders
// on the public landing page before any login/auth exists.
const SAMPLE_STATS = [
  { icon: Users, label: "Citizens helped", value: "1.2k" },
  { icon: FolderOpen, label: "Case types", value: "6" },
  { icon: FileText, label: "Documents explained", value: "3.4k" },
  { icon: Gauge, label: "Languages", value: "5" },
];

const SAMPLE_GAPS = [
  { label: "Missing evidence", pct: 35 },
  { label: "Proof of delivery", pct: 22 },
];

const TAGLINE = "From a confusing legal notice to a plain-language roadmap you can actually follow.";

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-base text-cream">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-base-deep/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 p-1">
              <img
                src={isDark ? logoDark : logoLight}
                alt="NyayaSetu"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-display text-lg font-bold text-cream">NyayaSetu</span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-rose-muted md:flex">
            <a href="#features" className="hover:text-cream transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-cream transition-colors">How it Works</a>
            <Link to="/about" className="hover:text-cream transition-colors">About Us</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="flex h-6 w-11 items-center rounded-full bg-surface-hover px-0.5 transition-colors"
            >
              <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gold transition-transform ${isDark ? "translate-x-0" : "translate-x-5"}`}>
                {isDark ? <Moon size={11} className="text-base-deep" /> : <Sun size={11} className="text-base-deep" />}
              </div>
            </button>
            <Link to="/login" className="hidden items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-base-deep transition-colors hover:bg-gold-light sm:flex">
              <ArrowRight size={14} className="rotate-180" /> Login
            </Link>
            <button
              type="button"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-cream transition-colors hover:border-gold/40 hover:text-gold md:hidden"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <div className={`overflow-hidden border-t border-border transition-all duration-300 md:hidden ${isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            <a href="#features" onClick={closeMenu} className="rounded-lg px-3 py-2.5 text-sm text-rose-muted transition-colors hover:bg-surface hover:text-cream">Features</a>
            <a href="#how-it-works" onClick={closeMenu} className="rounded-lg px-3 py-2.5 text-sm text-rose-muted transition-colors hover:bg-surface hover:text-cream">How it Works</a>
            <Link to="/about" onClick={closeMenu} className="rounded-lg px-3 py-2.5 text-sm text-rose-muted transition-colors hover:bg-surface hover:text-cream">About Us</Link>
            <Link to="/login" onClick={closeMenu} className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-base-deep transition-colors hover:bg-gold-light">
              <ArrowRight size={14} className="rotate-180" /> Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:pb-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-gold/8 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
          {/* Ambient sage glow behind the illustrative panel — echoes the
              logo's green negative space. Light mode only; see index.css. */}
          <div className="absolute right-[10%] top-[8%] h-[38rem] w-[34rem] rounded-[3rem] bg-sage/25 blur-[80px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 sm:gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-gold sm:mb-6 sm:px-4 sm:text-xs sm:tracking-widest">
              AI-Powered Legal Clarity
            </span>
            <h1 className="mt-4 min-h-[3.6em] font-display text-3xl font-bold leading-tight text-cream sm:min-h-[2.8em] sm:text-4xl md:min-h-[2.4em] md:text-5xl lg:text-6xl">
              From a Confusing Legal Notice to a Clear Next Step
              <br />
              <span className="text-gold"></span>
            </h1>
            <p className="mx-auto mt-5 min-h-[4.5em] max-w-xl text-base text-rose-muted sm:mt-6 sm:min-h-[3.5em] sm:text-lg lg:mx-0">
              <Typewriter text={TAGLINE} speed={35} />
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
              <Link to="/register" className="flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-base-deep transition-colors hover:bg-gold-light sm:px-8 sm:py-4 sm:text-base">
                Understand my document <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="rounded-xl border border-border px-6 py-3 text-center text-sm text-cream transition-colors hover:border-gold/40 sm:px-8 sm:py-4 sm:text-base bg-gold">
                See how it works
              </Link>
            </div>
            <div className="mt-7 flex flex-col items-center gap-3 text-xs text-rose-muted sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-6 sm:text-sm lg:justify-start">
              {["Free to use", "Available in 5 languages", "Not a substitute for a lawyer"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: illustrative panel — floats over a soft ambient sage
              wash (see the blurred shape above), rather than a boxed panel. */}
          <div className="space-y-4 sm:space-y-5">
            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:items-center">
                <h3 className="font-display text-base font-semibold text-cream sm:text-lg">At a Glance</h3>
                <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-gold">Sample data</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {SAMPLE_STATS.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl bg-base-deep/40 p-3 sm:p-4">
                    <Icon size={16} className="mb-2 text-gold/70" />
                    <p className="font-display text-xl font-bold text-cream sm:text-2xl">{value}</p>
                    <p className="text-xs text-rose-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:items-center">
                <h3 className="font-display text-base font-semibold text-cream sm:text-lg">Documentation Gaps</h3>
                <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-gold">Sample data</span>
              </div>
              <div className="space-y-4">
                {SAMPLE_GAPS.map(({ label, pct }) => (
                  <div key={label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-cream">{label}</span>
                      <span className="text-danger">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-deep/50">
                      <div className="h-full rounded-full bg-danger" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-gold sm:text-xs sm:tracking-widest">Everything You Need</p>
        <h2 className="mb-4 text-center font-display text-2xl font-bold text-cream sm:text-3xl">One pipeline. Two people it helps.</h2>
        <p className="mb-10 text-center text-sm text-rose-muted sm:mb-16 sm:text-base">Built for citizens navigating the legal system, and the courts serving them</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="stagger-item rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold/30 sm:p-6 lg:p-8"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                <Icon size={22} className="text-gold" />
              </div>
              <h3 className="mb-1.5 font-display text-lg font-semibold text-cream">{title}</h3>
              <p className="text-sm text-rose-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — numbered steps */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-gold sm:text-xs sm:tracking-widest">Simple Process</p>
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-cream sm:mb-16 sm:text-3xl">Up and running in minutes</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ n, t, d }, i) => (
            <div key={n} className="stagger-item" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="font-display text-3xl font-bold text-danger/40 sm:text-4xl">{n}</span>
              <h3 className="mt-3 font-display text-base font-semibold text-cream sm:mt-4 sm:text-lg">{t}</h3>
              <p className="mt-2 text-sm text-rose-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-gold sm:text-xs sm:tracking-widest">Common Case Types</p>
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-cream sm:mb-16 sm:text-3xl">Built for common case types</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map(({ n, e, d }, i) => (
            <div
              key={n}
              className="stagger-item rounded-xl border border-border bg-surface p-4 transition-colors hover:border-gold/30 sm:p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-2xl">{e}</span>
              <h3 className="mt-2 font-display font-semibold text-cream">{n}</h3>
              <p className="mt-1 text-sm text-rose-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-base-deep px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
        <h2 className="font-display text-3xl font-bold text-cream sm:text-4xl md:text-5xl">Ready to understand your document?</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-rose-muted sm:text-base">Free to use. Upload your document and get a plain-language explanation in minutes.</p>
        <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3 text-sm font-semibold text-base-deep transition-colors hover:bg-gold-light sm:px-10 sm:py-4 sm:text-base">
          Understand my document <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
