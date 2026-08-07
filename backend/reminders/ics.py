from __future__ import annotations
from datetime import datetime, timezone
import uuid


def _fmt(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")


def build_ics(title: str, due_date: datetime, note: str | None = None, reminder_minutes_before: int = 60) -> str:
    """Build a minimal, valid iCalendar VEVENT with a VALARM, importable by
    Google Calendar, Apple Calendar, and Outlook — no OAuth, no API keys."""
    uid = f"{uuid.uuid4()}@nyayasetu"
    dtstamp = _fmt(datetime.now(timezone.utc))
    dtstart = _fmt(due_date)
    summary = _escape(title)
    description = _escape(note or "")

    return "\r\n".join([
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//NyayaSetu//Reminders//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{dtstamp}",
        f"DTSTART:{dtstart}",
        f"SUMMARY:{summary}",
        f"DESCRIPTION:{description}",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        f"TRIGGER:-PT{reminder_minutes_before}M",
        f"DESCRIPTION:{summary}",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
        "",
    ])