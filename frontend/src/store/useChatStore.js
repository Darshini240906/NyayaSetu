import { create } from "zustand";
import toast from "react-hot-toast";
import { sendQuery, getConversations, getConversationMessages, deleteConversation } from "../services/api";
import { useLanguageStore } from "./useLanguageStore";

const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : "Low";

function toUiMessage(m) {
  return {
    id: m.id, role: m.role, content: m.content,
    meta: m.meta ? {
      confidence: { score: m.meta.confidence, level: cap(m.meta.confidence_label) },
      sources: (m.meta.citations || []).map(c => ({ doc_name: c.document_name, relevance_score: c.score, page: c.page_number })),
      contradiction_detected: m.meta.contradiction_flag,
    } : undefined,
  };
}

export const useChatStore = create((set, get) => ({
  messages: [], isLoading: false,
  conversations: [], conversationsLoaded: false,
  activeConversationId: null,

  async loadConversations() {
    try {
      const d = await getConversations();
      set({ conversations: d.conversations, conversationsLoaded: true });
    } catch {
      set({ conversationsLoaded: true });
    }
  },

  async openConversation(id) {
    try {
      const d = await getConversationMessages(id);
      set({ messages: d.messages.map(toUiMessage), activeConversationId: id });
    } catch {
      toast.error("Could not load that conversation");
    }
  },

  newChat() {
    set({ messages: [], activeConversationId: null });
  },

  async send(query) {
    const language = useLanguageStore.getState().language;
    const conversationId = get().activeConversationId;
    set({ messages: [...get().messages, { id: Date.now(), role: "user", content: query }], isLoading: true });
    try {
      const d = await sendQuery(query, language, conversationId);
      set({
        messages: [...get().messages, { id: Date.now()+1, role: "assistant", content: d.answer,
          meta: { confidence: { score: d.confidence, level: cap(d.confidence_label) }, sources: d.citations?.map(c => ({ doc_name: c.document_name, relevance_score: c.score, page: c.page_number })) || [], contradiction_detected: d.contradiction_flag } }],
        isLoading: false,
        activeConversationId: d.conversation_id,
      });
      get().loadConversations(); // refresh sidebar (title/order/new entry)
    } catch (e) { set({ isLoading: false }); toast.error(e?.response?.data?.detail || "Query failed"); }
  },

  async removeConversation(id) {
    try {
      await deleteConversation(id);
      set(state => ({ conversations: state.conversations.filter(c => c.id !== id) }));
      if (get().activeConversationId === id) set({ messages: [], activeConversationId: null });
    } catch { toast.error("Could not delete conversation"); }
  },
}));