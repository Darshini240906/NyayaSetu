import { create } from "zustand";
import toast from "react-hot-toast";
import { deleteDocument, downloadDocument, getDocuments, uploadDocument, uploadYoutube } from "../services/api";
export const useDocumentStore = create((set, get) => ({
  documents: [], isLoading: false,
  async fetch() { set({ isLoading: true }); try { set({ documents: await getDocuments() || [], isLoading: false }); } catch { set({ isLoading: false }); } },
  async upload(file, cls, language) { try { const r = await uploadDocument(file, cls, language); toast.success(`${file.name} indexed`); await get().fetch(); return r; } catch (e) { toast.error(e?.response?.data?.detail || "Upload failed"); throw e; } },
  async addYoutube(url, cls, language) { try { const r = await uploadYoutube(url, cls, language); toast.success(`${r.document.filename} indexed`); await get().fetch(); return r; } catch (e) { toast.error(e?.response?.data?.detail || "Could not process that video"); throw e; } },
  async remove(id) { try { await deleteDocument(id); set({ documents: get().documents.filter(d => d.id !== id) }); toast.success("Deleted"); } catch { toast.error("Delete failed"); } },
  async download(doc) {
    try {
      await downloadDocument(doc.id, doc.filename);
    } catch (e) {
      const status = e.response?.status;
      if (status === 401 || status === 403 || status >= 500) return; // already toasted by the api interceptor
      let message = "Download failed";
      try {
        const text = await e.response?.data?.text?.();
        if (text) message = JSON.parse(text)?.detail || message;
      } catch { /* fall back to default message */ }
      toast.error(message);
    }
  },
}));