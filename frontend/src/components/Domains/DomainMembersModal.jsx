import { useEffect, useState } from "react";
import { X, Loader2, Users } from "lucide-react";
import { getDomainMembers } from "../../services/api";

export default function DomainMembersModal({ domain, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getDomainMembers(domain.id)
      .then(setMembers)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [domain.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-cream">{domain.name} — Members</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-rose-muted hover:bg-white/5 hover:text-cream transition-colors">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-rose-muted">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading members...
          </div>
        ) : error ? (
          <p className="py-10 text-center text-sm text-rose-muted">Couldn't load members. Try again.</p>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Users size={28} className="mb-2 text-rose-muted/40" />
            <p className="text-sm text-rose-muted">No members assigned to this domain yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {members.map(m => (
              <li key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-base px-3 py-2.5">
                <div>
                  <p className="text-sm text-cream">{m.full_name}</p>
                  <p className="text-xs text-rose-muted">{m.email}</p>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs capitalize text-rose-muted">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}