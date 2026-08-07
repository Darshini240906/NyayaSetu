import { useEffect, useState } from "react";
import { Scale, ShieldAlert, ListChecks, History } from "lucide-react";
import CaseUploader from "../components/Legal/CaseUploader";
import TimelineSimulator from "../components/Legal/TimelineSimulator";
import CaseStrengthCard from "../components/Legal/CaseStrengthCard";
import KeyDatesPanel from "../components/Legal/KeyDatesPanel";
import { getLegalCases } from "../services/api";

const CASE_TYPE_LABEL = {
  consumer_complaint: "Consumer Complaint", civil_suit: "Civil Suit",
  criminal_fir: "Criminal (FIR)", family_matrimonial: "Family / Matrimonial",
  property_dispute: "Property Dispute", labour_employment: "Labour / Employment",
  rti_application: "RTI Application", other: "General Legal Document",
};

export default function LegalAssistantPage() {
  const [activeCase, setActiveCase] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    getLegalCases().then(setHistory).catch(() => {}).finally(() => setLoadingHistory(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
          <Scale size={22} className="text-gold" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">Understand My Case</h1>
          <p className="text-sm text-rose-muted">Upload a notice, FIR, or complaint and get it explained in plain language.</p>
        </div>
      </div>

      {!activeCase ? (
        <div className="space-y-8">
          <CaseUploader onAnalyzed={setActiveCase} />

          {history.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-rose-muted">
                <History size={15} /> Previously analyzed documents
              </div>
              <div className="space-y-2">
                {history.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCase(c)}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left hover:border-gold/40 transition-colors"
                  >
                    <span className="truncate text-sm text-cream">{c.title}</span>
                    <span className="ml-3 flex-shrink-0 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                      {CASE_TYPE_LABEL[c.case_type] || c.case_type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {loadingHistory && <p className="text-center text-xs text-rose-muted">Loading your history…</p>}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setActiveCase(null)}
            className="text-xs font-medium text-gold hover:text-gold-light transition-colors"
          >
            ← Analyze another document
          </button>

          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-cream">{activeCase.title}</h2>
              <span className="flex-shrink-0 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                {CASE_TYPE_LABEL[activeCase.case_type] || activeCase.case_type}
              </span>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-cream/90">{activeCase.plain_language_summary}</p>

            {(activeCase.rights?.length > 0 || activeCase.obligations?.length > 0) && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {activeCase.rights?.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-muted">
                      <ShieldAlert size={13} /> Your Rights
                    </div>
                    <ul className="space-y-1.5 text-sm text-cream/90">
                      {activeCase.rights.map((r, i) => <li key={i} className="flex gap-2"><span className="text-gold">•</span>{r}</li>)}
                    </ul>
                  </div>
                )}
                {activeCase.obligations?.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-muted">
                      <ListChecks size={13} /> What You Need To Do
                    </div>
                    <ul className="space-y-1.5 text-sm text-cream/90">
                      {activeCase.obligations.map((o, i) => <li key={i} className="flex gap-2"><span className="text-gold">•</span>{o}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <p className="mt-5 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">{activeCase.disclaimer}</p>
          </div>

          <KeyDatesPanel keyDates={activeCase.key_dates} caseId={activeCase.id} />
          <TimelineSimulator timeline={activeCase.timeline} />
          <CaseStrengthCard strength={activeCase.strength} />
        </div>
      )}
    </div>
  );
}
