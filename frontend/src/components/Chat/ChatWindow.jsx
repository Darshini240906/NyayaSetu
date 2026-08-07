import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Bot, Globe, Menu } from "lucide-react";
import MessageBubble from "./MessageBubble";
import VoiceRecorder from "./VoiceRecorder";
import { useChatStore } from "../../store/useChatStore";
import { useLanguageStore, LANGUAGES } from "../../store/useLanguageStore";

const SUGGESTIONS = ["What is the leave policy?", "Summarise vendor contracts", "What are safety protocols?", "Who are our key suppliers?"];

export default function ChatWindow({ onOpenSidebar }) {
  const { messages, isLoading, send, newChat } = useChatStore();
  const { language, setLanguage } = useLanguageStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  async function handleSend() { const q = input.trim(); if (!q || isLoading) return; setInput(""); await send(q); }
  function handleKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-rose-muted hover:bg-white/5 hover:text-cream transition-colors md:hidden"
            aria-label="Open conversations"
          >
            <Menu size={18} />
          </button>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold/15">
            <Bot size={16} className="text-gold" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-cream">AI Assistant</p>
            <p className="hidden text-xs text-rose-muted sm:block">RAG-powered · cited answers</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5">
            <Globe size={13} className="text-rose-muted" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="bg-transparent text-xs text-cream focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-surface text-cream">{l.label}</option>)}
            </select>
          </div>
          {messages.length > 0 && (
            <button onClick={newChat} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-rose-muted hover:bg-white/5 hover:text-cream transition-colors">
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 sm:px-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
              <Bot size={30} className="text-gold" />
            </div>
            <p className="font-display text-lg font-semibold text-cream">Ask your knowledge base</p>
            <p className="mt-1 text-sm text-rose-muted mb-6">Upload documents first, then ask anything</p>
            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((q, i) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="stagger-item rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-sm text-rose-muted hover:border-gold/40 hover:text-cream transition-colors"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(m => <MessageBubble key={m.id} message={m} />)}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover">
              <Bot size={15} className="text-gold" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-2 w-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-end gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your documents…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-cream placeholder:text-rose-muted/50 focus:outline-none"
            style={{ maxHeight: "120px" }}
          />
          <div className="flex items-center gap-2">
            <VoiceRecorder onTranscript={t => setInput(t)} />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-base-deep hover:bg-gold-light disabled:opacity-40 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}