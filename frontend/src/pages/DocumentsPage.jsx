/*import UploadPanel from "../components/Upload/UploadPanel";
import DocumentList from "../components/Upload/DocumentList";
export default function DocumentsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div><h1 className="text-2xl font-bold text-white">Documents</h1><p className="mt-1 text-white/50">Upload and manage your knowledge base documents</p></div>
      <div className="rounded-2xl border border-white/10 bg-[#131929] p-6"><h2 className="text-base font-semibold text-white mb-4">Upload Documents</h2><UploadPanel /></div>
      <div className="rounded-2xl border border-white/10 bg-[#131929] p-6"><h2 className="text-base font-semibold text-white mb-4">Knowledge Base</h2><DocumentList /></div>
    </div>
  );
}
*/

import UploadPanel from "../components/Upload/UploadPanel";
import DocumentList from "../components/Upload/DocumentList";

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">Documents</h1>
        <p className="mt-1 text-sm text-rose-muted sm:text-base">Upload and manage your knowledge base documents</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-cream mb-4">Upload Documents</h2>
        <UploadPanel />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="font-display text-base font-semibold text-cream mb-4 sm:text-lg">Knowledge Base</h2>
        <DocumentList />
      </div>
    </div>
  );
}