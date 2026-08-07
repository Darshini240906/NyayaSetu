/*import { useEffect, useState } from "react";
import { FileText, MessageSquare, Users, FolderOpen, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { getDashboardMetrics, getKnowledgeGaps, getPredictiveInsights } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";

function MetricCard({ icon: Icon, label, value, color = "text-[#4F8EF7]" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#131929] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F8EF7]/10"><Icon size={17} className={color}/></div>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value ?? "—"}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [m, g, ins] = await Promise.all([getDashboardMetrics(), getKnowledgeGaps(), getPredictiveInsights()]);
      setMetrics(m); setGaps(g); setInsights(ins);
    } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-white/50">Welcome back, {user?.full_name?.split(" ")[0] || "there"}</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 hover:bg-white/5 transition">
          <RefreshCw size={14} className={loading?"animate-spin":""}/> Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={FileText} label="Total Documents" value={metrics?.total_documents} />
        <MetricCard icon={FileText} label="Indexed" value={metrics?.indexed_documents} color="text-emerald-400" />
        <MetricCard icon={MessageSquare} label="Total Queries" value={metrics?.total_queries} color="text-[#2DD4A7]" />
        <MetricCard icon={TrendingUp} label="Avg Confidence" value={metrics?.avg_confidence ? `${Math.round(metrics.avg_confidence*100)}%` : "—"} color="text-amber-400" />
        <MetricCard icon={Users} label="Members" value={metrics?.total_members} color="text-purple-400" />
        <MetricCard icon={FolderOpen} label="Domains" value={metrics?.total_domains} color="text-pink-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#131929] p-5">
          <h2 className="text-base font-semibold text-white mb-4">Knowledge Gaps</h2>
          {gaps.length === 0 ? (
            <p className="text-sm text-white/40 py-4 text-center">No knowledge gaps detected yet</p>
          ) : gaps.map((g,i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-[#0B0F1A] px-3 py-2.5 mb-2">
              <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white/80">{g.query}</p>
                <p className="text-xs text-white/40">Confidence: {Math.round((g.confidence||0)*100)}%</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#131929] p-5">
          <h2 className="text-base font-semibold text-white mb-4">Predictive Insights</h2>
          {insights.length === 0 ? (
            <p className="text-sm text-white/40 py-4 text-center">All documents are fresh and up to date</p>
          ) : insights.map((ins,i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-[#0B0F1A] px-3 py-2.5 mb-2">
              <AlertCircle size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/70">{ins.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
*/


import { useEffect, useState } from "react";
import { FileText, MessageSquare, Users, FolderOpen, TrendingUp, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { getDashboardMetrics, getKnowledgeGaps, getPredictiveInsights } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import AnimatedCounter from "../components/common/AnimatedCounter";

function MetricCard({ icon: Icon, label, value, delta, i }) {
  const numeric = typeof value === "number";
  return (
    <div
      className="stagger-item rounded-2xl border border-border bg-surface p-5"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15">
          <Icon size={17} className="text-gold" />
        </div>
        {delta && <span className="text-xs text-success">{delta}</span>}
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-cream sm:text-3xl">
        {value == null ? "—" : numeric ? <AnimatedCounter value={value} /> : value}
      </p>
      <p className="mt-1 text-sm text-rose-muted">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [m, g, ins] = await Promise.all([getDashboardMetrics(), getKnowledgeGaps(), getPredictiveInsights()]);
      setMetrics(m); setGaps(g); setInsights(ins);
    } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Good {getGreeting()}, {user?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-1 text-rose-muted">{today} · Everything looks healthy</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-rose-muted hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard i={0} icon={Users} label="Total Members" value={metrics?.total_members} />
        <MetricCard i={1} icon={FolderOpen} label="Active Domains" value={metrics?.total_domains} />
        <MetricCard i={2} icon={FileText} label="Documents" value={metrics?.total_documents} />
        <MetricCard
          i={3}
          icon={TrendingUp}
          label="Avg Confidence"
          value={metrics?.avg_confidence != null ? Math.round(metrics.avg_confidence * 100) : null}
          delta={metrics?.avg_confidence != null ? "" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Knowledge Gaps — your real data, styled as the "Recent Activity" panel */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-cream">Knowledge Gaps</h2>
          </div>
          {gaps.length === 0 ? (
            <p className="text-sm text-rose-muted py-6 text-center">No knowledge gaps detected yet</p>
          ) : (
            <div className="space-y-1">
              {gaps.map((g, i) => (
                <div
                  key={i}
                  className="stagger-item flex items-start gap-3 rounded-lg px-2 py-3 border-b border-border last:border-0"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <AlertCircle size={15} className="text-warn mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-cream truncate">{g.query}</p>
                    <p className="text-xs text-rose-muted mt-0.5">Confidence: {Math.round((g.confidence || 0) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Predictive Insights — styled as the "Quick Actions" panel */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-cream">Predictive Insights</h2>
            <Sparkles size={16} className="text-gold" />
          </div>
          {insights.length === 0 ? (
            <p className="text-sm text-rose-muted py-6 text-center">All documents are fresh and up to date</p>
          ) : (
            <div className="space-y-1">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className="stagger-item flex items-start gap-3 rounded-lg px-2 py-3 border-b border-border last:border-0"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <MessageSquare size={15} className="text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-rose-muted">{ins.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}