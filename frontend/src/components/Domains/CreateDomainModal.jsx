/*import { useState } from "react";
import { X } from "lucide-react";
import { useDomainStore } from "../../store/useDomainStore";

export default function CreateDomainModal({ onClose }) {
  const { create, domainTypes } = useDomainStore();
  const [form, setForm] = useState({ name: "", domain_type: "custom", description: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try { await create(form); onClose(); }
    catch {} finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1C2540] bg-[#131929] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Create Domain</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Domain Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Engineering Team"
              className="w-full rounded-lg border border-[#1C2540] bg-[#0B0F1A] px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#4F8EF7] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Domain Type</label>
            <select value={form.domain_type} onChange={e => setForm(p => ({ ...p, domain_type: e.target.value }))}
              className="w-full rounded-lg border border-[#1C2540] bg-[#0B0F1A] px-4 py-2.5 text-white capitalize focus:border-[#4F8EF7] focus:outline-none">
              {(domainTypes.length ? domainTypes : ["hr","finance","it","manufacturing","legal","sales","marketing","operations","custom"]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Description <span className="text-white/30">(optional)</span></label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What documents or knowledge does this domain cover?"
              rows={2} className="w-full rounded-lg border border-[#1C2540] bg-[#0B0F1A] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#4F8EF7] focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-white/60 hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={loading || !form.name.trim()}
              className="flex-1 rounded-lg bg-[#4F8EF7] py-2.5 text-sm font-semibold text-white hover:bg-[#4F8EF7]/90 disabled:opacity-50">
              {loading ? "Creating..." : "Create Domain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
*/
import { useState } from "react";
import { X } from "lucide-react";
import { useDomainStore } from "../../store/useDomainStore";

export default function CreateDomainModal({ onClose }) {
  const { create, domainTypes } = useDomainStore();
  const [form, setForm] = useState({ name: "", domain_type: "custom", description: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try { await create(form); onClose(); }
    catch {} finally { setLoading(false); }
  }

  const inputClass = "w-full rounded-lg border border-border bg-base px-4 py-2.5 text-cream placeholder:text-rose-muted/50 focus:border-gold focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-cream">Create Domain</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-rose-muted hover:bg-white/5 hover:text-cream transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-rose-muted">Domain Name</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Engineering Team"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-rose-muted">Domain Type</label>
            <select
              value={form.domain_type}
              onChange={e => setForm(p => ({ ...p, domain_type: e.target.value }))}
              className={`${inputClass} capitalize`}
            >
              {(domainTypes.length ? domainTypes : ["hr", "finance", "it", "manufacturing", "legal", "sales", "marketing", "operations", "custom"]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-rose-muted">Description <span className="text-rose-muted/50">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What documents or knowledge does this domain cover?"
              rows={2}
              className={`${inputClass} resize-none text-sm`}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-rose-muted hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="flex-1 rounded-lg bg-gold py-2.5 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create Domain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}