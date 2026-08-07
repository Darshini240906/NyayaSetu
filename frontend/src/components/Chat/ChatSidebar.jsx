import { useEffect } from "react";
import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

export default function ChatSidebar({ mobileOpen, onClose }) {
  const { conversations, activeConversationId, loadConversations, openConversation, newChat, removeConversation } = useChatStore();

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const sidebar = (
    <div className="flex h-full w-full flex-col border-r border-border bg-surface md:w-64 md:flex-shrink-0">
      <div className="flex items-center justify-between gap-2 p-3">
        <button
          onClick={() => { newChat(); onClose?.(); }}
          className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-cream hover:border-gold/40 hover:bg-white/5 transition-colors"
        >
          <Plus size={15} /> New chat
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border text-rose-muted hover:bg-white/5 hover:text-cream transition-colors md:hidden"
            aria-label="Close conversations"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {conversations.length === 0 && (
          <p className="px-3 py-2 text-xs text-rose-muted/60">No conversations yet</p>
        )}
        {conversations.map(c => (
          <div
            key={c.id}
            onClick={() => { openConversation(c.id); onClose?.(); }}
            className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors
              ${activeConversationId === c.id ? "bg-gold/15 text-cream" : "text-rose-muted hover:bg-white/5 hover:text-cream"}`}
          >
            <MessageSquare size={14} className="flex-shrink-0" />
            <span className="flex-1 truncate">{c.title}</span>
            <button
              onClick={e => { e.stopPropagation(); removeConversation(c.id); }}
              className="flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-muted hover:text-danger transition-opacity"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <p className="px-3 pt-2 text-xs text-rose-muted/50">Keeping your 5 most recent chats</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden h-full md:block">{sidebar}</div>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close conversations"
            className="fixed inset-0 z-40 bg-base-deep/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:hidden animate-fade-in">
            {sidebar}
          </aside>
        </>
      )}
    </>
  );
}
