import { Brain, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ConfidenceBadge from "./ConfidenceBadge";
import SourceCitation from "./SourceCitation";

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-gold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="text-gold underline hover:text-gold-light">{children}</a>,
  code: ({ inline, children }) =>
    inline
      ? <code className="rounded bg-base px-1.5 py-0.5 text-xs text-gold">{children}</code>
      : <code className="block rounded-lg bg-base p-3 text-xs text-cream overflow-x-auto">{children}</code>,
  h1: ({ children }) => <h3 className="mb-1.5 font-display text-base font-semibold text-cream">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-1.5 font-display text-base font-semibold text-cream">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-1 font-semibold text-cream">{children}</h4>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-gold/40 pl-3 italic text-rose-muted">{children}</blockquote>,
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isUser ? "bg-gold" : "bg-surface-hover"}`}>
        {isUser ? <User size={15} className="text-base-deep" /> : <Brain size={15} className="text-gold" />}
      </div>
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser ? "rounded-tr-sm bg-gold text-base-deep whitespace-pre-wrap" : "rounded-tl-sm border border-border bg-surface text-cream"}`}>
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {!isUser && message.meta && (
          <div className="px-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {message.meta.confidence && <ConfidenceBadge score={message.meta.confidence.score} level={message.meta.confidence.level} />}
              {message.meta.contradiction_detected && (
                <span className="rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-xs text-warn">⚠ Contradiction</span>
              )}
            </div>
            <SourceCitation sources={message.meta.sources} />
          </div>
        )}
      </div>
    </div>
  );
}