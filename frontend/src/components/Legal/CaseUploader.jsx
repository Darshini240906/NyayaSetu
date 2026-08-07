import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { analyzeLegalDocument } from "../../services/api";
import { LANGUAGES } from "../../store/useLanguageStore";

export default function CaseUploader({ onAnalyzed }) {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [analyzing, setAnalyzing] = useState(false);

  const onDrop = useCallback(accepted => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 25 * 1024 * 1024,
  });

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    try {
      const result = await analyzeLegalDocument(file, language);
      toast.success("Document analyzed");
      onAnalyzed?.(result);
      setFile(null);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Couldn't analyze that document");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors
          ${isDragActive ? "border-gold bg-gold/5" : "border-border hover:border-gold/40 hover:bg-white/[0.02]"}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText size={28} className="text-gold" />
            <p className="text-sm font-medium text-cream">{file.name}</p>
            <p className="text-xs text-rose-muted">{(file.size / 1024).toFixed(0)}KB · Ready to analyze</p>
          </div>
        ) : (
          <>
            <Upload size={28} className={`mx-auto mb-3 transition-transform ${isDragActive ? "text-gold scale-110" : "text-rose-muted"}`} />
            <p className="text-sm font-medium text-cream">{isDragActive ? "Drop it here" : "Upload your notice, FIR, or legal document"}</p>
            <p className="mt-1 text-xs text-rose-muted">A photo works too · PDF, DOCX, TXT, PNG, JPG · Max 25MB</p>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-rose-muted whitespace-nowrap">Explain it in:</label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!file || analyzing}
        className="w-full rounded-xl bg-gold py-3 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
      >
        {analyzing ? <Loader2 size={16} className="animate-spin" /> : null}
        {analyzing ? "Reading your document…" : "Explain this document"}
      </button>

      <p className="text-xs text-rose-muted text-center">
        This is an AI-generated explanation to help you understand your document. It is not legal advice.
      </p>
    </div>
  );
}
