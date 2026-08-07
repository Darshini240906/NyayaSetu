import { useState } from "react";
import { CalendarPlus, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createReminder } from "../../services/api";

export default function KeyDatesPanel({ keyDates = [], caseId }) {
  const [added, setAdded] = useState({});
  const [busy, setBusy] = useState(null);

  if (!keyDates.length) return null;

  async function handleAdd(kd, i) {
    if (!kd.date) {
      toast.error("No exact date found for this — add it manually on the Reminders page.");
      return;
    }
    setBusy(i);
    try {
      await createReminder({ title: kd.label, due_date: kd.date, note: kd.raw_text, case_id: caseId });
      setAdded(prev => ({ ...prev, [i]: true }));
      toast.success("Reminder added");
    } catch {
      toast.error("Couldn't add that reminder");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <h3 className="mb-1 font-display text-lg font-semibold text-cream">Key dates found in this document</h3>
      <p className="mb-4 text-xs text-rose-muted">
        Deadlines are auto-added to your Reminders. Add any of these to Google Calendar from the Reminders page.
      </p>
      <div className="space-y-2.5">
        {keyDates.map((kd, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-base-deep/40 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-cream">{kd.label}</p>
              <p className="text-xs text-rose-muted">
                {kd.date || kd.raw_text || "Date not specified"}
                {kd.is_deadline && <span className="ml-2 rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-medium text-warn">Deadline</span>}
              </p>
            </div>
            <button
              onClick={() => handleAdd(kd, i)}
              disabled={busy === i || added[i]}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-cream hover:border-gold/40 hover:text-gold disabled:opacity-60 transition-colors"
            >
              {busy === i ? <Loader2 size={13} className="animate-spin" /> : added[i] ? <CheckCircle2 size={13} className="text-success" /> : <CalendarPlus size={13} />}
              {added[i] ? "Added" : "Add reminder"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
