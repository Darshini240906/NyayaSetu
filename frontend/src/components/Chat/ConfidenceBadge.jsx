/*export default function ConfidenceBadge({ score, level }) {
  const map = { High: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30", Low: "bg-red-500/20 text-red-400 border-red-500/30" };
  const l = level || "Low";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${map[l] || map.Low}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {l}{score !== undefined && ` · ${Math.round(score * 100)}%`}
    </span>
  );
}
*/
export default function ConfidenceBadge({ level }) {
  const map = {
    High: "bg-success/15 text-success border-success/30",
    Medium: "bg-warn/15 text-warn border-warn/30",
    Low: "bg-danger/15 text-danger border-danger/30",
  };
  const labelText = {
    High: "High confidence",
    Medium: "Medium confidence",
    Low: "Not found in knowledge base",
  };
  const l = level || "Low";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${map[l] || map.Low}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labelText[l] || l}
    </span>
  );
}