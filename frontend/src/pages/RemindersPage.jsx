import { useEffect, useState } from "react";
import { Bell, CalendarPlus, CalendarCheck2, Smartphone, Trash2, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  listReminders, createReminder, deleteReminder,
  getCalendarStatus, getCalendarOAuthUrl, syncReminderToCalendar,
  downloadReminderIcs,
} from "../services/api";

function daysUntil(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Past";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", due_date: "", note: "" });

  useEffect(() => {
    refresh();
    getCalendarStatus().then(s => setConnected(s.connected)).catch(() => {});
    // Google redirects back to /reminders?calendar=connected after OAuth
    if (new URLSearchParams(window.location.search).get("calendar") === "connected") {
      setConnected(true);
      toast.success("Google Calendar connected");
    }
  }, []);

  function refresh() {
    setLoading(true);
    listReminders().then(setReminders).catch(() => {}).finally(() => setLoading(false));
  }

  async function handleConnect() {
    try {
      const { url } = await getCalendarOAuthUrl();
      window.location.href = url;
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Calendar isn't configured on the server yet");
    }
  }

  async function handleSync(id) {
    setSyncingId(id);
    try {
      await syncReminderToCalendar(id);
      toast.success("Added to Google Calendar");
      refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Couldn't sync to Google Calendar");
    } finally {
      setSyncingId(null);
    }
  }

  async function handleDelete(id) {
    await deleteReminder(id);
    refresh();
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.due_date) return;
    await createReminder(form);
    setForm({ title: "", due_date: "", note: "" });
    setShowForm(false);
    refresh();
  }

  async function handleDownloadIcs(r) {
    try {
      await downloadReminderIcs(r.id, `${r.title}.ics`);
    } catch {
      toast.error("Couldn't generate calendar file");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
            <Bell size={20} className="text-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-cream">Reminders</h1>
            <p className="text-sm text-rose-muted">Hearing dates and deadlines, in one place.</p>
          </div>
        </div>

        <button
          onClick={connected ? undefined : handleConnect}
          disabled={connected}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors
            ${connected ? "bg-success/10 text-success cursor-default" : "bg-gold text-base-deep hover:bg-gold-light"}`}
        >
          {connected ? <CalendarCheck2 size={16} /> : <CalendarPlus size={16} />}
          {connected ? "Google Calendar connected" : "Connect Google Calendar"}
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light transition-colors"
        >
          <Plus size={14} /> Add a reminder manually
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-xl border border-border bg-surface p-4">
          <input
            required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Court hearing — Case No. 123/2026"
            className="w-full rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream placeholder:text-rose-muted/60 focus:border-gold focus:outline-none"
          />
          <input
            required type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
            className="w-full rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream focus:border-gold focus:outline-none"
          />
          <input
            value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="Note (optional)"
            className="w-full rounded-lg border border-border bg-base-deep px-3 py-2 text-sm text-cream placeholder:text-rose-muted/60 focus:border-gold focus:outline-none"
          />
          <button type="submit" className="w-full rounded-lg bg-gold py-2 text-sm font-semibold text-base-deep hover:bg-gold-light transition-colors">
            Add reminder
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-sm text-rose-muted">Loading…</p>
      ) : reminders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-rose-muted">
          No reminders yet. Analyze a document or add one manually.
        </p>
      ) : (
        <div className="space-y-2.5">
          {reminders.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-cream">{r.title}</p>
                <p className="text-xs text-rose-muted">
                  {new Date(r.due_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  <span className="mx-1.5">·</span>{daysUntil(r.due_date)}
                  {r.note && <span className="mx-1.5">·</span>}{r.note}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {r.synced_to_calendar ? (
                  <span className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success">
                    <CalendarCheck2 size={13} /> Synced
                  </span>
                ) : (
                  <button
                    onClick={() => handleSync(r.id)}
                    disabled={syncingId === r.id}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-cream hover:border-gold/40 hover:text-gold transition-colors disabled:opacity-60"
                  >
                    {syncingId === r.id ? <Loader2 size={13} className="animate-spin" /> : <CalendarPlus size={13} />}
                    Add to Calendar
                  </button>
                )}
                <button
                  onClick={() => handleDownloadIcs(r)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-cream hover:border-gold/40 hover:text-gold transition-colors"
                >
                  <Smartphone size={13} /> Add to Phone
                </button>
                <button onClick={() => handleDelete(r.id)} className="text-rose-muted hover:text-danger transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}