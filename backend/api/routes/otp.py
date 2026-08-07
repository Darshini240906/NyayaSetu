'''from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from otp.service import generate_otp, verify_otp

router = APIRouter(prefix="/otp", tags=["otp"])

class SendReq(BaseModel):
    email: EmailStr

class VerifyReq(BaseModel):
    email: EmailStr; otp: str

@router.post("/send")
async def send(req: SendReq) -> dict:
    otp = generate_otp(req.email)
    print(f"[DEV OTP] {req.email}: {otp}")
    return {"message": "OTP sent", "dev_otp": otp, "expires_in_minutes": 10}

@router.post("/verify")
async def verify(req: VerifyReq) -> dict:
    if not verify_otp(req.email, req.otp):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired OTP")
    return {"verified": True}
'''

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from core.email import send_registration_otp_email
from otp.service import generate_otp, verify_otp

router = APIRouter(prefix="/otp", tags=["otp"])

class SendReq(BaseModel):
    email: EmailStr

class VerifyReq(BaseModel):
    email: EmailStr
    otp: str

@router.post("/send")
async def send(req: SendReq) -> dict:
    otp = generate_otp(req.email)
    try:
        await send_registration_otp_email(req.email, otp)
    except Exception as e:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"Failed to send OTP email: {e}",
        )
    return {"message": "OTP sent to your email", "expires_in_minutes": 10}

@router.post("/verify")
async def verify(req: VerifyReq) -> dict:
    if not verify_otp(req.email, req.otp):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired OTP")
    return {"verified": True}