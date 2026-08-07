import { Link } from "react-router-dom";
import { ArrowLeft, Scale, Gavel, Languages } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import logoLight from "../assets/logo-light.png";
import logoDark from "../assets/logo-dark.png";

const PILLARS = [
  {
    icon: Scale,
    title: "For citizens",
    body: "Upload a notice, FIR, or complaint and get it explained in plain language — your rights, your obligations, and what happens next.",
  },
  {
    icon: Gavel,
    title: "For courts",
    body: "A triage dashboard that helps registrars see which cases can move quickly and which need closer attention, at a glance.",
  },
  {
    icon: Languages,
    title: "One shared pipeline",
    body: "Both sides are powered by the same document-understanding step, so the same reliability standard applies everywhere.",
  },
];

export default function AboutPage() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-base text-cream">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-base-deep/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
              <img src={isDark ? logoDark : logoLight} alt="NyayaSetu" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-lg font-bold text-cream">NyayaSetu</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-rose-muted transition-colors hover:text-cream">
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Back to home</span><span className="sm:hidden">Back</span>
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden px-4 pb-16 pt-24 text-center sm:px-6 sm:pb-20 sm:pt-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-1/3 top-0 h-80 w-80 rounded-full bg-gold/8 blur-3xl animate-fade-in" />
          <div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-gold/5 blur-3xl animate-fade-in" style={{ animationDelay: "150ms" }} />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl stagger-item">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-gold sm:mb-6 sm:px-4 sm:text-xs sm:tracking-widest">
            About
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl md:text-5xl">
            One document. <span className="text-gold">Two people it can help.</span>
          </h1>
          <p className="mt-5 text-base text-rose-muted sm:mt-6 sm:text-lg">
            NyayaSetu reads a legal document once and reuses that understanding for both the citizen
            trying to make sense of it, and the court trying to manage its backlog.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24 lg:pb-28">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="stagger-item rounded-2xl border border-border bg-surface p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                <p.icon size={22} className="text-gold" />
              </div>
              <h3 className="font-display text-lg font-semibold text-cream">{p.title}</h3>
              <p className="mt-2 text-sm text-rose-muted">{p.body}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-rose-muted">
          NyayaSetu gives AI-generated explanations to help you understand your documents — it is not
          legal advice, and its case-triage scores are a transparent heuristic, not a trained prediction.
          Always confirm anything important with a lawyer or your nearest legal aid clinic.
        </p>
      </section>
    </div>
  );
}
