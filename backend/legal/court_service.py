"""
Court/registrar triage scoring.

IMPORTANT — this is a transparent, rule-based heuristic for the MVP, not a
trained model. The product doc this project is based on explicitly calls for
predictions "based on real public case data, not vibes." Wiring in an actual
model trained on public case-pendency datasets (e.g. National Judicial Data
Grid exports) is the natural next step; this heuristic exists so the
Triage Dashboard is usable end-to-end today, and the scoring inputs below
(case age, adjournment count, document completeness) are exactly the kind of
features a real model would use, so swapping in a trained model later only
means replacing `score_case()`.
"""
from datetime import date, datetime
from legal.enums import CaseType, TriageFlag

BASE_SCORE_BY_TYPE: dict[CaseType, int] = {
    CaseType.RTI_APPLICATION: 90,
    CaseType.CONSUMER_COMPLAINT: 75,
    CaseType.LABOUR_EMPLOYMENT: 65,
    CaseType.FAMILY_MATRIMONIAL: 55,
    CaseType.PROPERTY_DISPUTE: 45,
    CaseType.CIVIL_SUIT: 50,
    CaseType.CRIMINAL_FIR: 40,
    CaseType.OTHER: 55,
}


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        return None


def score_case(case_type: CaseType, filed_date: str | None, adjournment_count: int,
               documents_complete: bool) -> tuple[int, TriageFlag]:
    score = BASE_SCORE_BY_TYPE.get(case_type, 55)

    score -= min(adjournment_count, 10) * 5

    if not documents_complete:
        score -= 15

    filed = _parse_date(filed_date)
    if filed:
        age_days = (date.today() - filed).days
        if age_days > 730:
            score -= 15
        elif age_days > 365:
            score -= 8

    score = max(0, min(100, score))

    if score >= 70:
        flag = TriageFlag.FAST_TRACK
    elif score >= 40:
        flag = TriageFlag.MODERATE
    else:
        flag = TriageFlag.HIGH_RISK
    return score, flag
