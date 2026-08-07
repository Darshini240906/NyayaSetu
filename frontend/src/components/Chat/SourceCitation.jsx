/*import { FileText } from "lucide-react";
export default function SourceCitation({ sources = [] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs font-medium text-white/30">Sources</p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50">
            <FileText size={11} />
            <span>{s.doc_name || "Document"}</span>
            {s.page && <span className="text-white/30">p.{s.page}</span>}
            {s.relevance_score !== undefined && <span className="text-[#4F8EF7]">{Math.round(s.relevance_score * 100)}%</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
*/
import { FileText } from "lucide-react";

export default function SourceCitation({ sources = [] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs font-medium text-rose-muted/60">Sources</p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-rose-muted">
            <FileText size={11} />
            <span>{s.doc_name || "Document"}</span>
            {s.page && <span className="text-rose-muted/60">p.{s.page}</span>}
            {s.relevance_score !== undefined && <span className="text-gold">{Math.round(s.relevance_score * 100)}%</span>}
          </div>
        ))}
      </div>
    </div>
  );
}