import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { sendVoiceQuery } from "../../services/api";
import { useLanguageStore } from "../../store/useLanguageStore";
import toast from "react-hot-toast";

export default function VoiceRecorder({ onTranscript }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const language = useLanguageStore(s => s.language);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setLoading(true);
        try {
          const r = await sendVoiceQuery(blob, language);
          if (r.transcribed_text) { onTranscript(r.transcribed_text); toast.success("Voice transcribed"); }
          else toast.error("Could not transcribe. Try again.");
        } catch { toast.error("Voice query failed"); }
        setLoading(false);
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch { toast.error("Microphone access denied"); }
  }

  function stop() { mediaRef.current?.stop(); setRecording(false); }

  if (loading) return (
    <button disabled className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover">
      <Loader2 size={16} className="animate-spin text-gold" />
    </button>
  );
  return (
    <button
      onClick={recording ? stop : start}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors
        ${recording ? "bg-danger animate-pulse" : "bg-surface-hover hover:bg-border"}`}
      title={recording ? "Stop" : "Voice query"}
    >
      {recording ? <MicOff size={16} className="text-cream" /> : <Mic size={16} className="text-rose-muted" />}
    </button>
  );
}