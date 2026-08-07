import { useState } from "react";
import { ClipboardList, Download, FileText, Lightbulb, Loader2, Presentation, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { renderToStaticMarkup } from "react-dom/server";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { generateReport } from "../services/api";

const REPORT_TYPES = [
  { id: "executive_summary", label: "Executive summary", description: "Leadership-ready overview", icon: Presentation },
  { id: "technical_summary", label: "Technical summary", description: "Scope, architecture and risks", icon: FileText },
  { id: "action_items", label: "Action items", description: "Decisions, owners and next steps", icon: ClipboardList },
  { id: "research_insights", label: "Research insights", description: "Findings and implications", icon: Lightbulb },
];

// On-screen rendering — matches the app's dark theme tokens.
const SCREEN_MD_COMPONENTS = {
  h1: p => <h2 className="mb-2 mt-5 font-display text-lg font-bold text-cream first:mt-0" {...p} />,
  h2: p => <h3 className="mb-2 mt-5 font-display text-base font-bold text-cream first:mt-0" {...p} />,
  h3: p => <h4 className="mb-1.5 mt-4 text-sm font-semibold text-gold first:mt-0" {...p} />,
  h4: p => <h5 className="mb-1.5 mt-3 text-sm font-semibold text-cream first:mt-0" {...p} />,
  p: p => <p className="mb-3 text-sm leading-7 text-rose-muted" {...p} />,
  ul: p => <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-rose-muted" {...p} />,
  ol: p => <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-rose-muted" {...p} />,
  li: p => <li className="leading-6" {...p} />,
  strong: p => <strong className="font-semibold text-cream" {...p} />,
  em: p => <em className="italic" {...p} />,
  a: p => <a className="text-gold underline hover:text-gold-light" target="_blank" rel="noreferrer" {...p} />,
  blockquote: p => <blockquote className="mb-3 border-l-2 border-gold/40 pl-3 italic text-rose-muted/90" {...p} />,
  code: p => <code className="rounded bg-base px-1.5 py-0.5 text-xs text-gold" {...p} />,
  hr: () => <hr className="my-4 border-border" />,
  table: p => <div className="mb-3 overflow-x-auto"><table className="w-full border-collapse text-sm" {...p} /></div>,
  th: p => <th className="border border-border px-2 py-1 text-left text-cream" {...p} />,
  td: p => <td className="border border-border px-2 py-1 text-rose-muted" {...p} />,
};

// Print rendering — plain inline styles so it reads correctly on a white PDF page,
// independent of the app's dark theme classes.
const PDF_MD_COMPONENTS = {
  h1: p => <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "14px 0 6px", color: "#1a1a1a" }} {...p} />,
  h2: p => <h3 style={{ fontSize: "13.5px", fontWeight: 700, margin: "12px 0 5px", color: "#1a1a1a" }} {...p} />,
  h3: p => <h4 style={{ fontSize: "12px", fontWeight: 700, margin: "10px 0 4px", color: "#9a6b12" }} {...p} />,
  h4: p => <h5 style={{ fontSize: "11.5px", fontWeight: 700, margin: "8px 0 4px", color: "#1a1a1a" }} {...p} />,
  p: p => <p style={{ margin: "0 0 8px", lineHeight: 1.6, color: "#333333", fontSize: "11px" }} {...p} />,
  ul: p => <ul style={{ margin: "0 0 8px", paddingLeft: "18px", color: "#333333", fontSize: "11px" }} {...p} />,
  ol: p => <ol style={{ margin: "0 0 8px", paddingLeft: "18px", color: "#333333", fontSize: "11px" }} {...p} />,
  li: p => <li style={{ marginBottom: "3px", lineHeight: 1.5 }} {...p} />,
  strong: p => <strong style={{ fontWeight: 700, color: "#1a1a1a" }} {...p} />,
  em: p => <em style={{ fontStyle: "italic" }} {...p} />,
  a: p => <a style={{ color: "#9a6b12" }} {...p} />,
  blockquote: p => <blockquote style={{ borderLeft: "2px solid #d4af37", paddingLeft: "10px", color: "#555555", fontStyle: "italic", margin: "0 0 8px" }} {...p} />,
  code: p => <code style={{ background: "#f3f3f3", padding: "1px 4px", borderRadius: "3px", fontSize: "10px" }} {...p} />,
  hr: () => <hr style={{ border: "none", borderTop: "1px solid #dddddd", margin: "12px 0" }} />,
  table: p => <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "10px" }} {...p} />,
  th: p => <th style={{ border: "1px solid #dddddd", padding: "4px 6px", textAlign: "left", color: "#1a1a1a" }} {...p} />,
  td: p => <td style={{ border: "1px solid #dddddd", padding: "4px 6px", color: "#333333" }} {...p} />,
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "thinkhive-report";
}

function escapeHtml(str = "") {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("executive_summary");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [report, setReport] = useState(null);

  async function downloadReport() {
    if (!report) return;
    setDownloading(true);

    const bodyHtml = renderToStaticMarkup(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={PDF_MD_COMPONENTS}>{report.report}</ReactMarkdown>
    );
    const sourcesHtml = report.sources?.length
      ? `<div style="margin-top:16px;border-top:1px solid #dddddd;padding-top:10px;">
           <div style="font-size:11px;font-weight:700;color:#1a1a1a;margin-bottom:6px;">Sources</div>
           <ul style="margin:0;padding-left:18px;">
             ${report.sources.map(s => `<li style="font-size:10px;color:#555555;margin-bottom:2px;">${escapeHtml(s.document_name)}${s.page_number ? ` (page ${s.page_number})` : ""}</li>`).join("")}
           </ul>
         </div>`
      : "";

    // Rendered at a fixed pixel width, positioned within the viewport (top-left, behind
    // everything) rather than far off-screen — html2canvas can silently capture a blank
    // canvas for elements placed at large negative offsets.
    const width = 794; // ~A4 width at 96dpi
    const container = document.createElement("div");
    container.style.cssText = `position:fixed;top:0;left:0;z-index:-1000;width:${width}px;padding:40px;background:#ffffff;font-family:Helvetica,Arial,sans-serif;`;
    container.innerHTML = `
      <div style="font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:#9a6b12;font-weight:700;margin-bottom:4px;">${escapeHtml(report.report_type_label)}</div>
      <div style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">${escapeHtml(report.title)}</div>
      ${bodyHtml}
      ${sourcesHtml}
    `;
    document.body.appendChild(container);

    try {
      // Let the browser paint before capturing.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
        windowWidth: width,
        width,
      });

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png");

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${slugify(report.title)}.pdf`);
    } catch (error) {
      toast.error("Could not generate the PDF.");
    } finally {
      document.body.removeChild(container);
      setDownloading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!topic.trim() && !content.trim()) {
      toast.error("Add a knowledge-base topic or paste your notes.");
      return;
    }
    setLoading(true);
    try {
      const response = await generateReport({
        topic: topic.trim(), content: content.trim(), report_type: reportType,
      });
      setReport(response);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not generate the report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gold"><Sparkles size={16} /> AI reporting</p>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">Reports & summaries</h1>
          <p className="mt-1 text-sm text-rose-muted sm:text-base">Turn knowledge-base documents or meeting notes into grounded, shareable reports.</p>
        </div>
        {report && <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm text-gold">{report.source_count} source{report.source_count === 1 ? "" : "s"} used</span>}
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="font-display text-xl font-bold text-cream">Create a report</h2>
          <p className="mt-1 text-sm text-rose-muted">Choose an outcome, then provide a topic, notes, or both.</p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {REPORT_TYPES.map(({ id, label, description, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setReportType(id)}
                className={`rounded-xl border p-3 text-left transition-colors ${reportType === id ? "border-gold bg-gold/10" : "border-border hover:border-gold/35"}`}>
                <Icon size={17} className={reportType === id ? "text-gold" : "text-rose-muted"} />
                <p className="mt-2 text-sm font-semibold text-cream">{label}</p>
                <p className="mt-0.5 text-xs text-rose-muted">{description}</p>
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-medium text-cream">Knowledge-base topic <span className="font-normal text-rose-muted">(optional)</span></label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Q3 product launch risks"
            className="mt-2 w-full rounded-xl border border-border bg-base px-3 py-2.5 text-sm text-cream placeholder:text-rose-muted/60 outline-none focus:border-gold/50" />

          <label className="mt-4 block text-sm font-medium text-cream">Meeting notes or source text <span className="font-normal text-rose-muted">(optional)</span></label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="Paste meeting notes, an interview transcript, or document text here…"
            className="mt-2 w-full resize-y rounded-xl border border-border bg-base px-3 py-2.5 text-sm text-cream placeholder:text-rose-muted/60 outline-none focus:border-gold/50" />
          <button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-base-deep transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-55">
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
            {loading ? "Generating report…" : "Generate report"}
          </button>
        </form>

        <section className="min-h-[400px] rounded-2xl border border-border bg-surface p-4 sm:min-h-[480px] sm:p-5">
          {!report ? (
            <div className="flex h-full min-h-[350px] flex-col items-center justify-center text-center sm:min-h-[430px]">
              <div className="rounded-2xl bg-gold/10 p-4 text-gold"><Sparkles size={28} /></div>
              <h2 className="mt-4 font-display text-xl font-bold text-cream">Your generated report will appear here</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-rose-muted">Reports are grounded in the source text and knowledge-base documents you provide.</p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{report.report_type_label}</p>
                  <h2 className="mt-1 break-words font-display text-xl font-bold text-cream sm:text-2xl">{report.title}</h2>
                </div>
                <button type="button" onClick={downloadReport} disabled={downloading} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-cream transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto sm:flex-shrink-0">
                  {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  {downloading ? "Preparing PDF…" : "Download PDF"}
                </button>
              </div>
              <div className="py-5">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={SCREEN_MD_COMPONENTS}>{report.report}</ReactMarkdown>
              </div>
              {report.sources?.length > 0 && <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-cream">Sources</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {report.sources.map((source, index) => <span key={`${source.document_id}-${index}`} className="rounded-lg bg-base px-2.5 py-1 text-xs text-rose-muted">{source.document_name}{source.page_number ? ` · p.${source.page_number}` : ""}</span>)}
                </div>
              </div>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
