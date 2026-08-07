import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, CheckCircle, Loader2, Youtube, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useDocumentStore } from "../../store/useDocumentStore";
import { LANGUAGES } from "../../store/useLanguageStore";

const CLASSIFICATIONS = ["public", "internal", "confidential"];

export default function UploadPanel() {
  const { upload, addYoutube } = useDocumentStore();
  const [files, setFiles] = useState([]);
  const [classification, setClassification] = useState("internal");
  const [language, setLanguage] = useState("en");
  const [uploading, setUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeBusy, setYoutubeBusy] = useState(false);

  const onDrop = useCallback(accepted => {
    setFiles(prev => [...prev, ...accepted.map(f => ({ file: f, status: "pending" }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "audio/mpeg": [".mp3", ".mpga"],
      "audio/wav": [".wav"],
      "audio/x-m4a": [".m4a"],
      "audio/mp4": [".m4a", ".mp4"],
      "audio/webm": [".webm"],
      "audio/ogg": [".ogg"],
      "audio/flac": [".flac"],
    },
    maxSize: 25 * 1024 * 1024,
  });

  async function handleUpload() {
    if (!files.filter(f => f.status === "pending").length) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f));
      try {
        await upload(files[i].file, classification, language);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f));
      } catch {
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error" } : f));
      }
    }
    setUploading(false);
  }

  async function handleAddYoutube() {
    const url = youtubeUrl.trim();
    if (!url) return;
    if (!/youtube\.com|youtu\.be/i.test(url)) {
      toast.error("That doesn't look like a YouTube link.");
      return;
    }
    setYoutubeBusy(true);
    try {
      await addYoutube(url, classification, language);
      setYoutubeUrl("");
    } catch {
      // toast already shown by the store
    } finally {
      setYoutubeBusy(false);
    }
  }

  const STATUS_ICON = {
    pending: <div className="h-4 w-4 rounded-full border-2 border-border" />,
    uploading: <Loader2 size={14} className="animate-spin text-gold" />,
    done: <CheckCircle size={14} className="text-success" />,
    error: <X size={14} className="text-danger" />,
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-10
          ${isDragActive ? "border-gold bg-gold/5" : "border-border hover:border-gold/40 hover:bg-white/[0.02]"}`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className={`mx-auto mb-3 transition-transform ${isDragActive ? "text-gold scale-110" : "text-rose-muted"}`} />
        <p className="text-sm font-medium text-cream">{isDragActive ? "Drop files here" : "Drag & drop files, or click to browse"}</p>
        <p className="mt-1 text-xs text-rose-muted">PDF, DOCX, TXT, PNG, JPG, MP3, WAV, M4A, OGG, FLAC · Max 25MB each</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
        <Youtube size={17} className="flex-shrink-0 text-rose-muted" />
        <input
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddYoutube()}
          placeholder="Paste a YouTube link to add its transcript to your knowledge base…"
          className="min-w-0 flex-1 bg-transparent text-sm text-cream placeholder:text-rose-muted/60 outline-none sm:min-w-[220px]"
        />
        <button
          type="button"
          onClick={handleAddYoutube}
          disabled={youtubeBusy || !youtubeUrl.trim()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-base-deep transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-1.5"
        >
          {youtubeBusy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          {youtubeBusy ? "Processing…" : "Add"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-rose-muted whitespace-nowrap">Classification:</label>
        <select
          value={classification}
          onChange={e => setClassification(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none capitalize"
        >
          {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="text-sm text-rose-muted whitespace-nowrap">Audio/video language:</label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="stagger-item flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <FileText size={16} className="text-rose-muted flex-shrink-0" />
              <span className="flex-1 truncate text-sm text-cream">{f.file.name}</span>
              <span className="text-xs text-rose-muted">{(f.file.size / 1024).toFixed(0)}KB</span>
              {STATUS_ICON[f.status]}
              {f.status === "pending" && (
                <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-muted hover:text-danger transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={uploading || !files.some(f => f.status === "pending")}
            className="w-full rounded-xl bg-gold py-3 text-sm font-semibold text-base-deep hover:bg-gold-light disabled:opacity-40 transition-colors"
          >
            {uploading ? "Uploading & Indexing..." : `Upload ${files.filter(f => f.status === "pending").length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
