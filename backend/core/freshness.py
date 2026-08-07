from __future__ import annotations
from datetime import UTC, datetime
from config import settings
from core.enums import AgeTag, FreshnessTag


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=UTC)


def compute_age_tag(
    doc_created_at: datetime,
    org_created_at: datetime | None,
    now: datetime | None = None,
) -> AgeTag:
    """
    Tags a document new/recent/old/outdated based on *when it was uploaded
    relative to how long the company has been using NyayaSetu* — not a fixed
    number of days. A doc uploaded in an org's first week means something
    different for a company that signed up two weeks ago vs. one that's been
    on the platform for three years.

    position = 0   -> uploaded today
    position = 1   -> uploaded the day the org joined NyayaSetu
    """
    now = _aware(now) if now else datetime.now(UTC)
    doc_created_at = _aware(doc_created_at)
    org_created_at = _aware(org_created_at) if org_created_at else doc_created_at

    org_lifetime = (now - org_created_at).total_seconds()
    doc_age = (now - doc_created_at).total_seconds()

    # Company hasn't been around long enough (e.g. same-day signup) to judge
    # anything as relatively "old" yet — everything is new.
    if org_lifetime < 86400:
        return AgeTag.NEW

    position = max(0.0, min(1.0, doc_age / org_lifetime))

    if position <= settings.age_new_threshold:
        return AgeTag.NEW
    if position <= settings.age_recent_threshold:
        return AgeTag.RECENT
    if position <= settings.age_old_threshold:
        return AgeTag.OLD
    return AgeTag.OUTDATED


_AGE_TO_FRESHNESS = {
    AgeTag.NEW: FreshnessTag.FRESH,
    AgeTag.RECENT: FreshnessTag.FRESH,
    AgeTag.OLD: FreshnessTag.STALE,
    AgeTag.OUTDATED: FreshnessTag.EXPIRED,
}


def compute_freshness_tag(
    created_at: datetime,
    org_created_at: datetime | None,
    now: datetime | None = None,
    last_verified: datetime | None = None,
    stored_tag: str | None = None,
) -> FreshnessTag:
    """
    fresh / stale / expired, computed the same way as age_tag (relative to how
    long the company has been on NyayaSetu) rather than being frozen at "fresh"
    from the moment of upload.

    - A human manually marking a document "expired" always wins.
    - If someone manually verified the doc (last_verified set), the freshness
      clock resets from that date instead of the original upload date.
    """
    if stored_tag == "expired":
        return FreshnessTag.EXPIRED

    reference = last_verified or created_at
    age_tag = compute_age_tag(reference, org_created_at, now)
    return _AGE_TO_FRESHNESS[age_tag]