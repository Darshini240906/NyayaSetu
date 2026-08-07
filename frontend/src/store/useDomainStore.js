/*import { create } from "zustand";
import toast from "react-hot-toast";
import { createDomain, deleteDomain, getDomains, getDomainTypes } from "../services/api";
export const useDomainStore = create((set, get) => ({
  domains: [], domainTypes: [], isLoading: false,
  async fetch() { set({ isLoading: true }); try { const [d, t] = await Promise.all([getDomains(), getDomainTypes()]); set({ domains: d || [], domainTypes: t || [], isLoading: false }); } catch { set({ isLoading: false }); } },
  async create(data) { try { const d = await createDomain(data); set({ domains: [...get().domains, d] }); toast.success(`Domain "${d.name}" created`); return d; } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); throw e; } },
  async remove(id) { try { await deleteDomain(id); set({ domains: get().domains.filter(d => d.id !== id) }); toast.success("Deleted"); } catch { toast.error("Delete failed"); } },
}));
*/
import { create } from "zustand";
import toast from "react-hot-toast";
import { createDomain, deleteDomain, getDomains, getDomainTypes } from "../services/api";

export const useDomainStore = create((set, get) => ({
  domains: [], domainTypes: [], isLoading: false,
  async fetch() { set({ isLoading: true }); try { const [d, t] = await Promise.all([getDomains(), getDomainTypes()]); set({ domains: d || [], domainTypes: t || [], isLoading: false }); } catch { set({ isLoading: false }); } },
  async create(data) { try { const d = await createDomain(data); set({ domains: [...get().domains, d] }); toast.success(`Domain "${d.name}" created`); return d; } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); throw e; } },
  async remove(id) {
    try {
      await deleteDomain(id);
      set({ domains: get().domains.filter(d => d.id !== id) });
      toast.success("Domain deleted");
    } catch (e) {
      // surface the real reason (e.g. "Cannot delete domain: 3 member(s) still assigned")
      toast.error(e?.response?.data?.detail || "Delete failed");
    }
  },
}));