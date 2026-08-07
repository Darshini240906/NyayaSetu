/*import { useEffect, useState } from "react";
import { Plus, FolderOpen, Loader2 } from "lucide-react";
import DomainCard from "../components/Domains/DomainCard";
import CreateDomainModal from "../components/Domains/CreateDomainModal";
import DomainMembersModal from "../components/Domains/DomainMembersModal";
import { useDomainStore } from "../store/useDomainStore";

export default function DomainsPage() {
  const { domains, isLoading, fetch } = useDomainStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  useEffect(() => { fetch(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-cream">Domains</h1>
          <p className="mt-1 text-rose-muted">Organise your knowledge base into separate domains per team or department</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-base-deep hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> New Domain
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-rose-muted">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading...
        </div>
      ) : domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <FolderOpen size={40} className="mb-3 text-rose-muted/40" />
          <p className="text-rose-muted mb-4">No domains yet. Create your first domain to organise your knowledge base.</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-base-deep hover:bg-gold-light transition-colors"
          >
            <Plus size={15} /> Create First Domain
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d, i) => (
            <div key={d.id} className="stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
              <DomainCard domain={d} onSelect={() => setSelectedDomain(d)} />
            </div>
          ))}
        </div>
      )}

      {showModal && <CreateDomainModal onClose={() => { setShowModal(false); fetch(); }} />}
      {selectedDomain && <DomainMembersModal domain={selectedDomain} onClose={() => setSelectedDomain(null)} />}
    </div>
  );
}
*/
import { useEffect, useState } from "react";
import { Plus, FolderOpen, Loader2, LayoutGrid, List } from "lucide-react";
import DomainCard from "../components/Domains/DomainCard";
import DomainListRow from "../components/Domains/DomainListRow";
import CreateDomainModal from "../components/Domains/CreateDomainModal";
import DomainMembersModal from "../components/Domains/DomainMembersModal";
import { useDomainStore } from "../store/useDomainStore";

export default function DomainsPage() {
  const { domains, isLoading, fetch } = useDomainStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [view, setView] = useState("grid"); // "grid" | "list"

  useEffect(() => { fetch(); }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">Domains</h1>
          <p className="mt-1 text-sm text-rose-muted sm:text-base">Organise your knowledge base into separate domains per team or department</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-border bg-surface p-1">
            <button
              onClick={() => setView("grid")}
              className={`rounded-lg p-1.5 transition-colors ${view === "grid" ? "bg-gold/20 text-gold" : "text-rose-muted hover:text-cream"}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-lg p-1.5 transition-colors ${view === "list" ? "bg-gold/20 text-gold" : "text-rose-muted hover:text-cream"}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-base-deep hover:bg-gold-light transition-colors"
          >
            <Plus size={16} /> New Domain
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-rose-muted">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading...
        </div>
      ) : domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <FolderOpen size={40} className="mb-3 text-rose-muted/40" />
          <p className="text-rose-muted mb-4">No domains yet. Create your first domain to organise your knowledge base.</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-base-deep hover:bg-gold-light transition-colors"
          >
            <Plus size={15} /> Create First Domain
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d, i) => (
            <div key={d.id} className="stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
              <DomainCard domain={d} onSelect={() => setSelectedDomain(d)} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {domains.map((d, i) => (
              <div key={d.id} className="stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
                <DomainCard domain={d} onSelect={() => setSelectedDomain(d)} />
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1fr_120px_100px_100px_40px] gap-4 border-b border-border px-5 py-3 text-xs uppercase tracking-wide text-rose-muted/70">
                <span>Domain</span>
                <span>Type</span>
                <span>Members</span>
                <span>Docs</span>
                <span></span>
              </div>
              {domains.map((d, i) => (
                <DomainListRow key={d.id} domain={d} onSelect={() => setSelectedDomain(d)} isLast={i === domains.length - 1} />
              ))}
            </div>
          </div>
        </>
      )}

      {showModal && <CreateDomainModal onClose={() => { setShowModal(false); fetch(); }} />}
      {selectedDomain && <DomainMembersModal domain={selectedDomain} onClose={() => setSelectedDomain(null)} />}
    </div>
  );
}