from __future__ import annotations
from datetime import UTC, datetime, timedelta
from bson import ObjectId
from core.email import send_activation_email
from core.security import generate_setup_code


async def provision_user_credentials(db, org_id: str, user_id: str, email: str, full_name: str) -> None:
    code = generate_setup_code()
    await db["password_reset_tokens"].insert_one({
        "org_id": org_id, "user_id": user_id, "email": email.lower(), "code": code,
        "used": False, "created_at": datetime.now(UTC),
        "expires_at": datetime.now(UTC) + timedelta(minutes=30),
    })
    org = await db["organizations"].find_one({"_id": ObjectId(org_id)})
    slug = org["slug"] if org else ""
    await send_activation_email(email, full_name, slug, code)