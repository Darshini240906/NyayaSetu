import { Trash2 } from "lucide-react";
import { useDomainStore } from "../../store/useDomainStore";

const DOMAIN_EMOJI = { hr: "👥", finance: "💰", it: "💻", manufacturing: "🏭", legal: "⚖️", sales: "📈", marketing: "📣", operations: "⚙️", custom: "📁" };

export default function DomainListRow({ domain, onSelect, isLast }) {
  const { remove } = useDomainStore();

  return (
    <div
      onClick={onSelect}
      className={`group grid grid-cols-[1fr_120px_100px_100px_40px] items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-white/5 transition-colors ${isLast ? "" : "border-b border-border"}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{DOMAIN_EMOJI[domain.domain_type] || "📁"}</span>
        <span className="font-display text-sm font-semibold text-cream">{domain.name}</span>
      </div>
      <span className="text-xs capitalize text-rose-muted">{domain.domain_type}</span>
      <span className="text-xs text-rose-muted">{domain.member_count}</span>
      <span className="text-xs text-rose-muted">{domain.document_count}</span>
      <button
        onClick={(e) => { e.stopPropagation(); remove(domain.id); }}
        className="opacity-0 group-hover:opacity-100 justify-self-end rounded-lg p-1.5 text-rose-muted/50 hover:bg-danger/10 hover:text-danger transition"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}