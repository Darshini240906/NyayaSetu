import { useEffect, useMemo, useState } from "react";
import { Gavel, Plus } from "lucide-react";
import toast from "react-hot-toast";
import TriageTable from "../components/Court/TriageTable";
import { listCourtCases, registerCourtCase } from "../services/api";

const CASE_TYPES = [
  "consumer_complaint", "civil_suit", "criminal_fir", "family_matrimonial",
  "property_dispute", "labour_employment", "rti_application", "other",
];

const SORTS = {
  triage_asc: (a, b) => a.triage_score - b.triage_score,
  triage_desc: (a, b) => b.triage_score - a.triage_score,
  newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
};

export default function CourtDashboardPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFlag, setFilterFlag] = useState("all");
  const [sortKey, setSortKey] = useState("triage_asc");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    case_number: "", case_type: "civil_suit", filed_date: "", next_hearing_date: "",
    adjournment_count: 0, documents_complete: true, notes: "",
  });

  useEffect(() => { refresh(); }, []);

  function refresh() {
    setLoading(true);
    listCourtCases().then(setCases).catch(() => {}).finally(() => setLoading(false));
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!form.case_number.trim()) return;
    try {
      await registerCourtCase({ ...form, adjournment_count: Number(form.adjournment_count) });
      toast.success("Case registered");
      setForm({ case_number: "", case_type: "civil_suit", filed_date: "", next_hearing_date: "", adjournment_count: 0, documents_complete: true, notes: "" });
      setShowForm(false);
      refresh();
    } catch {
      toast.error("Couldn't register that case");
    }
  }

  const visibleCases = useMemo(() => {
    let list = filterFlag === "all" ? cases : cases.filter(c => c.triage_flag === filterFlag);
    return [...list].sort(SORTS[sortKey]);
  }, [cases, filterFlag, sortKey]);

  const counts = useMemo(() => ({
    fast_track: cases.filter(c => c.triage_flag === "fast_track").length,
    moderate: cases.filter(c => c.triage_flag === "moderate").length,
    high_risk: cases.filter(c => c.triage_flag === "high_risk").length,
  }), [cases]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
            <Gavel size={20} className="text-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-cream">Triage Dashboard</h1>
            <p className="text-sm text-rose-muted">Prioritize your case backlog at a glance.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-base-deep hover:bg-gold-light transition-colors"
        >
          <Plus size={15} /> Register case
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-rose-muted">Fast-track</p>
          <p className="text-2xl font-semibold text-success">{counts.fast_track}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-rose-muted">Moderate</p>
          <p className="text-2xl font-semibold text-warn">{counts.moderate}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-rose-muted">High-risk</p>
          <p className="text-2xl font-semibold text-danger">{counts.high_risk}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleRegister} className="mb-6 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <input
            required placeholder="Case number" value={form.case_number}
            onChange={e => setForm({ ...form, case_number: e.target.value })}
            className="rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream placeholder:text-rose-muted/60 focus:border-gold focus:outline-none"
          />
          <select
            value={form.case_type} onChange={e => setForm({ ...form, case_type: e.target.value })}
            className="rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none capitalize"
          >
            {CASE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <input
            type="date" value={form.filed_date} onChange={e => setForm({ ...form, filed_date: e.target.value })}
            placeholder="Filed date"
            className="rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
          />
          <input
            type="date" value={form.next_hearing_date} onChange={e => setForm({ ...form, next_hearing_date: e.target.value })}
            placeholder="Next hearing"
            className="rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
          />
          <input
            type="number" min="0" value={form.adjournment_count}
            onChange={e => setForm({ ...form, adjournment_count: e.target.value })}
            placeholder="Adjournment count"
            className="rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
          />
          <label className="flex items-center gap-2 rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream">
            <input
              type="checkbox" checked={form.documents_complete}
              onChange={e => setForm({ ...form, documents_complete: e.target.checked })}
            />
            Documents complete
          </label>
          <input
            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="sm:col-span-2 rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream placeholder:text-rose-muted/60 focus:border-gold focus:outline-none"
          />
          <button type="submit" className="sm:col-span-2 rounded-lg bg-gold py-2 text-sm font-semibold text-base-deep hover:bg-gold-light transition-colors">
            Register case
          </button>
        </form>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filterFlag} onChange={e => setFilterFlag(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          <option value="all">All cases</option>
          <option value="fast_track">Fast-track only</option>
          <option value="moderate">Moderate only</option>
          <option value="high_risk">High-risk only</option>
        </select>
        <select
          value={sortKey} onChange={e => setSortKey(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          <option value="triage_asc">Sort: highest risk first</option>
          <option value="triage_desc">Sort: fastest wins first</option>
          <option value="newest">Sort: newest first</option>
        </select>
      </div>

      {loading ? <p className="text-center text-sm text-rose-muted">Loading…</p> : <TriageTable cases={visibleCases} />}
    </div>
  );
}
