import { Trash2, Users, FileText } from "lucide-react";
import { useDomainStore } from "../../store/useDomainStore";

const DOMAIN_EMOJI = { hr: "👥", finance: "💰", it: "💻", manufacturing: "🏭", legal: "⚖️", sales: "📈", marketing: "📣", operations: "⚙️", custom: "📁" };

export default function DomainCard({ domain, onSelect }) {
  const { remove } = useDomainStore();

  return (
    <div
      onClick={onSelect}
      className="group relative cursor-pointer rounded-2xl border border-border bg-surface p-5 hover:border-gold/30 transition-colors"
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{DOMAIN_EMOJI[domain.domain_type] || "📁"}</span>
        <button
          onClick={(e) => { e.stopPropagation(); remove(domain.id); }}
          className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-rose-muted/50 hover:bg-danger/10 hover:text-danger transition"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-cream">{domain.name}</h3>
      <p className="mt-0.5 text-xs text-rose-muted capitalize">{domain.domain_type}</p>
      {domain.description && <p className="mt-2 text-sm text-rose-muted line-clamp-2">{domain.description}</p>}
      <div className="mt-4 flex gap-4 text-xs text-rose-muted/70">
        <span className="flex items-center gap-1"><Users size={12} />{domain.member_count} members</span>
        <span className="flex items-center gap-1"><FileText size={12} />{domain.document_count} docs</span>
      </div>
    </div>
  );
}