import { useState } from "react";
import { ChevronDown, Circle, CircleDot, Clock, User, FileText, AlertTriangle } from "lucide-react";

export default function TimelineSimulator({ timeline = [] }) {
  const [openKey, setOpenKey] = useState(timeline.find(s => s.is_current)?.key || timeline[0]?.key);

  if (!timeline.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <h3 className="mb-1 font-display text-lg font-semibold text-cream">Your procedural roadmap</h3>
      <p className="mb-5 text-xs text-rose-muted">Tap any stage to see what happens, who's responsible, and what you'll need.</p>

      <div className="relative">
        {timeline.map((stage, i) => {
          const isOpen = openKey === stage.key;
          const isLast = i === timeline.length - 1;
          return (
            <div key={stage.key} className="relative pl-8">
              {!isLast && <div className="absolute left-[11px] top-6 h-full w-px bg-border" />}
              <button
                onClick={() => setOpenKey(isOpen ? null : stage.key)}
                className="flex w-full items-start gap-3 py-2.5 text-left"
              >
                <span className="absolute left-0 top-3">
                  {stage.is_current
                    ? <CircleDot size={22} className="text-gold" />
                    : <Circle size={22} className="text-border" />}
                </span>
                <span className="flex-1">
                  <span className={`block text-sm font-medium ${stage.is_current ? "text-gold" : "text-cream"}`}>
                    {stage.title}
                  </span>
                  <span className="block text-xs text-rose-muted">{stage.typical_duration}</span>
                </span>
                <ChevronDown size={16} className={`mt-1 flex-shrink-0 text-rose-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="mb-3 ml-1 space-y-2.5 rounded-xl border border-border bg-base-deep/40 p-4 text-sm animate-fade-in">
                  <div className="flex gap-2">
                    <FileText size={15} className="mt-0.5 flex-shrink-0 text-rose-muted" />
                    <p className="text-cream"><span className="text-rose-muted">What happens: </span>{stage.what_happens}</p>
                  </div>
                  <div className="flex gap-2">
                    <User size={15} className="mt-0.5 flex-shrink-0 text-rose-muted" />
                    <p className="text-cream"><span className="text-rose-muted">Who's responsible: </span>{stage.responsible_party}</p>
                  </div>
                  {stage.documents_needed?.length > 0 && (
                    <div className="flex gap-2">
                      <FileText size={15} className="mt-0.5 flex-shrink-0 text-rose-muted" />
                      <p className="text-cream">
                        <span className="text-rose-muted">Documents needed: </span>
                        {stage.documents_needed.join(", ")}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Clock size={15} className="mt-0.5 flex-shrink-0 text-rose-muted" />
                    <p className="text-cream"><span className="text-rose-muted">Typical duration: </span>{stage.typical_duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-warn" />
                    <p className="text-cream"><span className="text-rose-muted">If missed: </span>{stage.if_missed}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
