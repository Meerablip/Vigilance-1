import uuid
import datetime
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    hash_password, 
    verify_password, 
    create_access_token, 
    verify_access_token,
    generate_totp_secret, 
    get_totp_uri, 
    generate_qr_base64, 
    verify_totp_code
)
from app.models.entities import User, InviteToken, AuditLog

router = APIRouter(prefix="/auth", tags=["Authentication & MFA"])

# Pydantic Request/Response Models
class SystemStatusResponse(BaseModel):
    is_initialized: bool
    recommended_admin_email: str
    recommended_admin_name: str

class BootstrapInitResponse(BaseModel):
    mfa_secret: str
    qr_code_base64: str
    totp_uri: str
    email: str
    officer_name: str

class BootstrapCompleteRequest(BaseModel):
    email: str
    officer_name: str
    password: str
    mfa_secret: str
    totp_code: str

class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyMFARequest(BaseModel):
    temp_token: str
    totp_code: str

class CreateInviteRequest(BaseModel):
    role: str # operator, supervisor, analyst, auditor, administrator
    sector: str
    expiry_hours: int = 24

class InviteValidationResponse(BaseModel):
    valid: bool
    role: str
    sector: str
    message: str = "Valid single-use invite token"

class RegisterInviteRequest(BaseModel):
    invite_token: str
    email: str
    officer_name: str
    password: str
    mfa_secret: str
    totp_code: str

# 1. System Status Check (Determines if Root Administrator Setup is Required)
@router.get("/system-status", response_model=SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    user_count = db.query(User).count()
    return {
        "is_initialized": user_count > 0,
        "recommended_admin_email": settings.INITIAL_ADMIN_EMAIL,
        "recommended_admin_name": settings.INITIAL_ADMIN_NAME
    }

# 2. Bootstrap Step 1: Generate Google Authenticator QR Code for Officer Meera Chaudhari
@router.post("/bootstrap-init", response_model=BootstrapInitResponse)
def bootstrap_init(db: Session = Depends(get_db)):
    user_count = db.query(User).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="System is already initialized with an active root administrator."
        )

    mfa_secret = generate_totp_secret()
    totp_uri = get_totp_uri(mfa_secret, settings.INITIAL_ADMIN_EMAIL)
    qr_code_base64 = generate_qr_base64(totp_uri)

    return {
        "mfa_secret": mfa_secret,
        "qr_code_base64": qr_code_base64,
        "totp_uri": totp_uri,
        "email": settings.INITIAL_ADMIN_EMAIL,
        "officer_name": settings.INITIAL_ADMIN_NAME
    }

# 3. Bootstrap Step 2: Verify TOTP Code and Create Root Admin Meera Chaudhari
@router.post("/bootstrap-complete")
def bootstrap_complete(req: BootstrapCompleteRequest, db: Session = Depends(get_db)):
    user_count = db.query(User).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="System already initialized."
        )

    # Verify Google Authenticator 6-digit code
    if not verify_totp_code(req.mfa_secret, req.totp_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit Google Authenticator code. Check clock and re-enter."
        )

    user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
    root_user = User(
        id=user_id,
        email=req.email.strip().lower(),
        officer_name=req.officer_name.strip(),
        hashed_password=hash_password(req.password),
        role="administrator", # Highest level
        sector="National Command HQ",
        mfa_secret=req.mfa_secret,
        is_mfa_enabled=True,
        is_active=True,
        last_login=datetime.datetime.utcnow()
    )
    db.add(root_user)

    # Log bootstrap in immutable audit chain
    audit = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        user_identity=f"{req.officer_name} ({req.email})",
        action="ROOT_ADMINISTRATOR_INITIALIZED",
        resource_type="User",
        resource_id=user_id,
        details="VIGILANCE Root Officer account created with mandatory Google Authenticator MFA enrollment.",
        entry_hash=uuid.uuid4().hex
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": root_user.id, "email": root_user.email, "role": root_user.role})
    return {
        "message": "Root Administrator successfully established with Google Authenticator MFA.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": root_user.id,
            "email": root_user.email,
            "officer_name": root_user.officer_name,
            "role": root_user.role,
            "sector": root_user.sector
        }
    }

# 4. Standard Sign In Step 1: Password Check
@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid officer credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account clearance suspended."
        )

    # Temporary token for MFA step
    temp_token = create_access_token({"temp_user_id": user.id}, expires_delta=timedelta(minutes=5))
    return {
        "mfa_required": True,
        "temp_token": temp_token,
        "email": user.email,
        "officer_name": user.officer_name
    }

# 5. Sign In Step 2: Validate Google Authenticator 6-Digit TOTP Code
@router.post("/verify-mfa")
def verify_mfa(req: VerifyMFARequest, db: Session = Depends(get_db)):
    payload = verify_access_token(req.temp_token)
    if not payload or "temp_user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="MFA verification session expired. Please sign in again."
        )

    user = db.query(User).filter(User.id == payload["temp_user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not verify_totp_code(user.mfa_secret, req.totp_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google Authenticator code."
        )

    user.last_login = datetime.datetime.utcnow()
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "officer_name": user.officer_name,
            "role": user.role,
            "sector": user.sector
        }
    }

# 6. Generate Single-Use Cryptographically Bound Invite Link
@router.post("/invite/create")
def create_invite(req: CreateInviteRequest, db: Session = Depends(get_db)):
    # Create single-use token
    token_str = uuid.uuid4().hex + uuid.uuid4().hex
    expires_at = datetime.datetime.utcnow() + timedelta(hours=req.expiry_hours)

    invite = InviteToken(
        id=f"INV-{uuid.uuid4().hex[:8].upper()}",
        token=token_str,
        role=req.role,
        sector=req.sector,
        expires_at=expires_at,
        is_used=False
    )
    db.add(invite)

    audit = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        user_identity="COMMANDER",
        action="INVITE_TOKEN_ISSUED",
        resource_type="InviteToken",
        resource_id=invite.id,
        details=f"Generated invite link for role: {req.role}, sector: {req.sector}, valid for {req.expiry_hours}h.",
        entry_hash=uuid.uuid4().hex
    )
    db.add(audit)
    db.commit()

    return {
        "invite_token": token_str,
        "role": req.role,
        "sector": req.sector,
        "expires_at": expires_at.isoformat()
    }

# 7. Validate Invite Token
@router.get("/invite/validate/{token}", response_model=InviteValidationResponse)
def validate_invite(token: str, db: Session = Depends(get_db)):
    invite = db.query(InviteToken).filter(InviteToken.token == token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invite link.")
    if invite.is_used:
        raise HTTPException(status_code=400, detail="This private invite link has already been used.")
    if datetime.datetime.utcnow() > invite.expires_at:
        raise HTTPException(status_code=400, detail="This invite link has expired.")

    return {
        "valid": True,
        "role": invite.role,
        "sector": invite.sector
    }

# 8. Start MFA Setup for Invitee
@router.get("/invite/mfa-init/{email}")
def invite_mfa_init(email: str):
    mfa_secret = generate_totp_secret()
    totp_uri = get_totp_uri(mfa_secret, email)
    qr_code_base64 = generate_qr_base64(totp_uri)
    return {
        "mfa_secret": mfa_secret,
        "qr_code_base64": qr_code_base64,
        "totp_uri": totp_uri
    }

# 9. Complete Registration via Invite Link with Bound Role
@router.post("/invite/register")
def register_invite(req: RegisterInviteRequest, db: Session = Depends(get_db)):
    invite = db.query(InviteToken).filter(InviteToken.token == req.invite_token).first()
    if not invite or invite.is_used or datetime.datetime.utcnow() > invite.expires_at:
        raise HTTPException(status_code=400, detail="Invalid or expired invite token.")

    # Check email duplicate
    existing = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Verify Google Authenticator 6-digit code
    if not verify_totp_code(req.mfa_secret, req.totp_code):
        raise HTTPException(status_code=400, detail="Invalid Google Authenticator code.")

    user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
    new_user = User(
        id=user_id,
        email=req.email.strip().lower(),
        officer_name=req.officer_name.strip(),
        hashed_password=hash_password(req.password),
        role=invite.role,     # STRICTLY LOCKED TO INVITE SPECIFICATION
        sector=invite.sector, # STRICTLY LOCKED TO INVITE SPECIFICATION
        mfa_secret=req.mfa_secret,
        is_mfa_enabled=True,
        is_active=True,
        last_login=datetime.datetime.utcnow()
    )
    db.add(new_user)

    # Invalidate invite token
    invite.is_used = True
    invite.used_by_email = new_user.email

    audit = AuditLog(
        id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        user_identity=new_user.email,
        action="USER_REGISTERED_VIA_INVITE",
        resource_type="User",
        resource_id=user_id,
        details=f"Onboarded via token {invite.id}. Role assigned: {invite.role}, Sector: {invite.sector}.",
        entry_hash=uuid.uuid4().hex
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    return {
        "message": "Account created successfully.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "officer_name": new_user.officer_name,
            "role": new_user.role,
            "sector": new_user.sector
        }
    }
