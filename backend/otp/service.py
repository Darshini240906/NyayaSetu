import random, string
from datetime import UTC, datetime, timedelta

_STORE: dict[str, dict] = {}

def generate_otp(email: str) -> str:
    otp = "".join(random.choices(string.digits, k=6))
    _STORE[email.lower()] = {"otp": otp, "expires_at": datetime.now(UTC) + timedelta(minutes=10), "verified": False}
    return otp

def verify_otp(email: str, otp: str) -> bool:
    r = _STORE.get(email.lower())
    if not r or r["expires_at"] < datetime.now(UTC) or r["otp"] != otp:
        return False
    _STORE[email.lower()]["verified"] = True
    return True

def is_verified(email: str) -> bool:
    r = _STORE.get(email.lower())
    return bool(r and r.get("verified"))
