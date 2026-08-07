/*import { useState } from "react";
import { Search, Mic, FileText, Loader2 } from "lucide-react";
import { semanticSearch } from "../services/api";
import { sendVoiceQuery } from "../services/api";
import VoiceRecorder from "../components/Chat/VoiceRecorder";
import toast from "react-hot-toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(q) {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true); setSearched(true);
    try { const r = await semanticSearch(text.trim()); setResults(r.results || []); }
    catch { toast.error("Search failed"); }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Semantic Search</h1><p className="mt-1 text-white/50">Search across your entire knowledge base by meaning, not keywords</p></div>
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#131929] px-4 py-3">
          <Search size={18} className="text-white/30 flex-shrink-0" />
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
            placeholder="Search your knowledge base…" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
          <VoiceRecorder onTranscript={t=>{setQuery(t);handleSearch(t);}} />
        </div>
        <button onClick={()=>handleSearch()} disabled={loading||!query.trim()}
          className="rounded-xl bg-[#4F8EF7] px-6 text-sm font-semibold text-white hover:bg-[#4F8EF7]/90 disabled:opacity-40 transition">
          {loading?<Loader2 size={16} className="animate-spin"/>:"Search"}
        </button>
      </div>
      {searched && !loading && (
        <div className="space-y-3">
          <p className="text-sm text-white/40">{results.length} result{results.length!==1?"s":""} found</p>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#131929] p-8 text-center text-white/40">No results. Try a different search term or upload more documents.</div>
          ) : results.map((r,i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-[#131929] p-4 hover:border-white/20 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FileText size={15} className="text-[#4F8EF7]" />
                  <span className="text-sm font-medium text-white">{r.document_name}</span>
                  <span className="text-xs text-white/30">p.{r.page_number}</span>
                </div>
                <span className="text-xs font-medium text-[#4F8EF7]">{Math.round(r.score*100)}%</span>
              </div>
              <p className="mt-2 text-sm text-white/60 line-clamp-3">{r.text}</p>
            </div>
          ))}
        </div>
      )}
      {!searched && (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <Search size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">Enter a search query or use voice search</p>
        </div>
      )}
    </div>
  );
}
*/
import { useState } from "react";
import { Search, FileText, Loader2 } from "lucide-react";
import { semanticSearch } from "../services/api";
import VoiceRecorder from "../components/Chat/VoiceRecorder";
import toast from "react-hot-toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(q) {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true); setSearched(true);
    try { const r = await semanticSearch(text.trim()); setResults(r.results || []); }
    catch { toast.error("Search failed"); }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">Search</h1>
        <p className="mt-1 text-sm text-rose-muted sm:text-base">Search across people, documents, domains, and activity.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 focus-within:border-gold/40 transition-colors">
          <Search size={18} className="text-rose-muted flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search your knowledge base…"
            className="flex-1 bg-transparent text-sm text-cream placeholder:text-rose-muted/50 focus:outline-none"
          />
          <span className="hidden sm:flex items-center rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-rose-muted">⌘K</span>
          <VoiceRecorder onTranscript={t => { setQuery(t); handleSearch(t); }} />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="w-full rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-40 transition-colors sm:w-auto sm:py-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
        </button>
      </div>

      {searched && !loading && (
        <div className="space-y-3">
          <p className="text-sm text-rose-muted">{results.length} result{results.length !== 1 ? "s" : ""} for "{query}"</p>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-rose-muted">
              No results. Try a different search term or upload more documents.
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="stagger-item rounded-xl border border-border bg-surface p-4 hover:border-gold/30 transition-colors"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 font-mono text-xs text-gold">Document</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-cream">
                      <FileText size={14} className="text-rose-muted" />
                      {r.document_name}
                    </span>
                    {r.page_number != null && <span className="text-xs text-rose-muted">p.{r.page_number}</span>}
                  </div>
                  <span className="text-xs font-medium text-gold flex-shrink-0">{Math.round(r.score * 100)}%</span>
                </div>
                <p className="mt-2 text-sm text-rose-muted line-clamp-3">{r.text}</p>
              </div>
            ))
          )}
        </div>
      )}

      {!searched && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Search size={32} className="mx-auto mb-3 text-rose-muted/40" />
          <p className="text-rose-muted">Enter a search query or use voice search</p>
        </div>
      )}
    </div>
  );
}