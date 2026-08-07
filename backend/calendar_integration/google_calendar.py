"""
Thin wrapper around Google's OAuth2 + Calendar API v3 so hearing/deadline
reminders can be pushed to the user's own Google Calendar as events.

Requires GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET to be set (from
a Google Cloud project with the Calendar API enabled and an OAuth consent
screen configured). Until those are set, connect_url() raises a clear error
instead of failing obscurely deep inside the OAuth library.
"""
from __future__ import annotations
from datetime import datetime, timedelta
from config import settings

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


def _require_configured() -> None:
    if not settings.google_oauth_client_id or not settings.google_oauth_client_secret:
        raise RuntimeError(
            "Google Calendar isn't configured on the server yet. Set "
            "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in the backend .env."
        )


def _flow():
    from google_auth_oauthlib.flow import Flow
    _require_configured()
    client_config = {
        "web": {
            "client_id": settings.google_oauth_client_id,
            "client_secret": settings.google_oauth_client_secret.get_secret_value(),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.google_oauth_redirect_uri],
        }
    }
    return Flow.from_client_config(client_config, scopes=SCOPES, redirect_uri=settings.google_oauth_redirect_uri)


def get_authorization_url(state: str) -> str:
    flow = _flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline", include_granted_scopes="true", prompt="consent", state=state,
    )
    return auth_url


def exchange_code(code: str) -> dict:
    flow = _flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    return {
        "token": creds.token, "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri, "client_id": creds.client_id,
        "client_secret": creds.client_secret, "scopes": creds.scopes,
    }


def _credentials_from_tokens(tokens: dict):
    from google.oauth2.credentials import Credentials
    return Credentials(
        token=tokens.get("token"), refresh_token=tokens.get("refresh_token"),
        token_uri=tokens.get("token_uri"), client_id=tokens.get("client_id"),
        client_secret=tokens.get("client_secret"), scopes=tokens.get("scopes"),
    )


def create_event(tokens: dict, title: str, due_date: str, note: str | None = None) -> str:
    """Creates an all-day Google Calendar event for a reminder/hearing date.
    Returns the created event's id."""
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    creds = _credentials_from_tokens(tokens)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())

    service = build("calendar", "v3", credentials=creds)
    start = datetime.fromisoformat(due_date).date()
    end = start + timedelta(days=1)
    event = {
        "summary": f"⚖️ {title}",
        "description": (note or "") + "\n\nAdded automatically by NyayaSetu.",
        "start": {"date": start.isoformat()},
        "end": {"date": end.isoformat()},
        "reminders": {"useDefault": False, "overrides": [
            {"method": "popup", "minutes": 24 * 60}, {"method": "popup", "minutes": 60},
        ]},
    }
    created = service.events().insert(calendarId="primary", body=event).execute()
    return created["id"]
