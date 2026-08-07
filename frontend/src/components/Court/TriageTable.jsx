const FLAG_STYLE = {
  fast_track: { label: "Fast-track", dot: "bg-success", text: "text-success" },
  moderate: { label: "Moderate", dot: "bg-warn", text: "text-warn" },
  high_risk: { label: "High-risk", dot: "bg-danger", text: "text-danger" },
};

const CASE_TYPE_LABEL = {
  consumer_complaint: "Consumer", civil_suit: "Civil Suit", criminal_fir: "Criminal (FIR)",
  family_matrimonial: "Family", property_dispute: "Property", labour_employment: "Labour",
  rti_application: "RTI", other: "Other",
};

export default function TriageTable({ cases = [] }) {
  if (!cases.length) {
    return (
      <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-rose-muted">
        No cases registered yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-rose-muted">
            <th className="px-4 py-3 font-medium">Case No.</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Filed</th>
            <th className="px-4 py-3 font-medium">Next Hearing</th>
            <th className="px-4 py-3 font-medium">Adjournments</th>
            <th className="px-4 py-3 font-medium">Docs Complete</th>
            <th className="px-4 py-3 font-medium">Triage</th>
          </tr>
        </thead>
        <tbody>
          {cases.map(c => {
            const flag = FLAG_STYLE[c.triage_flag] || FLAG_STYLE.moderate;
            return (
              <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-medium text-cream">{c.case_number}</td>
                <td className="px-4 py-3 text-cream/80">{CASE_TYPE_LABEL[c.case_type] || c.case_type}</td>
                <td className="px-4 py-3 text-cream/80">{c.filed_date || "—"}</td>
                <td className="px-4 py-3 text-cream/80">{c.next_hearing_date || "—"}</td>
                <td className="px-4 py-3 text-cream/80">{c.adjournment_count}</td>
                <td className="px-4 py-3 text-cream/80">{c.documents_complete ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium ${flag.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${flag.dot}`} />
                    {flag.label} · {c.triage_score}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
