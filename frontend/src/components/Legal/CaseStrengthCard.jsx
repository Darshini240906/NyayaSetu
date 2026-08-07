const STATUS_STYLE = {
  strong: { label: "Strong", color: "text-success", bar: "bg-success" },
  available: { label: "Available", color: "text-gold", bar: "bg-gold" },
  not_mentioned: { label: "Not Mentioned", color: "text-rose-muted", bar: "bg-rose-muted" },
  missing: { label: "Missing", color: "text-danger", bar: "bg-danger" },
};

export default function CaseStrengthCard({ strength }) {
  if (!strength) return null;
  const { items, overall_score } = strength;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <h3 className="mb-1 font-display text-lg font-semibold text-cream">Documentation Strength</h3>
      <p className="mb-5 text-xs text-rose-muted">
        This looks only at how well-documented your case is right now — not at whether you'll win.
      </p>

      <div className="space-y-4">
        {items.map(item => {
          const style = STATUS_STYLE[item.status] || STATUS_STYLE.not_mentioned;
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-cream">{item.label}</span>
                <span className={`font-medium ${style.color}`}>{style.label}</span>
              </div>
              {item.note && <p className="mb-1 text-xs text-rose-muted">{item.note}</p>}
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-cream">Overall Documentation</span>
          <span className="font-semibold text-gold">{overall_score}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-base-deep">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${overall_score}%` }} />
        </div>
      </div>

      <p className="mt-4 text-xs text-rose-muted">
        Avoids predicting outcomes — this only helps you see what to gather before you act.
      </p>
    </div>
  );
}
