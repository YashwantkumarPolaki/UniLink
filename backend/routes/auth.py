from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.models.user import SignupRequest, LoginRequest
from backend.services.auth_service import hash_password, verify_password, create_access_token
from backend.services.email_service import send_otp_email
from backend.middleware.auth_middleware import get_current_user
from backend.database import db
import random
from datetime import datetime, timedelta, timezone


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class AvatarRequest(BaseModel):
    avatar_base64: str   # data URL: "data:image/png;base64,..."

# All routes here will start with /auth
router = APIRouter(prefix="/auth", tags=["Authentication"])

# SIGNUP ROUTE - no token needed
@router.post("/signup")
async def signup(user: SignupRequest):
    
    # Check if email already exists in database
    existing = db.collection("users").where("email", "==", user.email).get()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Prepare user data to save
    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
        "college": user.college,
        # Student
        "branch": user.branch,
        "department": user.department,
        # Faculty
        "faculty_department": user.faculty_department,
        # Club
        "club_name": user.club_name,
        # Company/Recruiter
        "company_name": user.company_name,
        "recruiter_name": user.recruiter_name,
        "hiring_process": user.hiring_process,
        "salary_range": user.salary_range,
    }

    # Save to Firestore
    doc_ref = db.collection("users").add(user_data)

    return {
        "message": "Account created successfully!",
        "user_id": doc_ref[1].id
    }

# LOGIN ROUTE - no token needed
@router.post("/login")
async def login(credentials: LoginRequest):
    
    # Find user by email in Firestore
    users = db.collection("users").where("email", "==", credentials.email).get()

    if not users:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Get the matching user document
    user_doc = users[0]
    user_data = user_doc.to_dict()

    # Check if password is correct
    if not verify_password(credentials.password, user_data["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create JWT token with user info inside
    token = create_access_token({
        "user_id": user_doc.id,
        "email": user_data["email"],
        "role": user_data["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_doc.id,
            "name": user_data["name"],
            "email": user_data["email"],
            "role": user_data["role"],
            "college": user_data["college"]
        }
    }

# ME ROUTE - protected, token required
@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    # Fetch full profile from Firestore (includes branch, avatar etc.)
    user_doc = db.collection("users").document(current_user["user_id"]).get()
    if not user_doc.exists:
        return {"message": "You are logged in!", "user": current_user}
    data = user_doc.to_dict()
    return {
        "message": "You are logged in!",
        "user": {
            "id": user_doc.id,
            "name": data.get("name"),
            "email": data.get("email"),
            "role": data.get("role"),
            "college": data.get("college"),
            "branch": data.get("branch", ""),
            "department": data.get("department", ""),
            "join_year": data.get("join_year"),
            "year_of_study": data.get("year_of_study"),
            "graduation_year": data.get("graduation_year"),
            "avatar": data.get("avatar", ""),
        }
    }


# CHANGE PASSWORD - protected
@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    if len(body.new_password) < 8:
        raise HTTPException(400, "New password must be at least 8 characters")

    user_doc = db.collection("users").document(current_user["user_id"]).get()
    if not user_doc.exists:
        raise HTTPException(404, "User not found")

    user_data = user_doc.to_dict()
    if not verify_password(body.current_password, user_data["password"]):
        raise HTTPException(400, "Current password is incorrect")

    db.collection("users").document(current_user["user_id"]).update({
        "password": hash_password(body.new_password)
    })
    return {"message": "Password updated successfully"}


# UPLOAD AVATAR - protected, stores base64 in Firestore
@router.post("/upload-avatar")
async def upload_avatar(
    body: AvatarRequest,
    current_user: dict = Depends(get_current_user)
):
    if not body.avatar_base64.startswith("data:image/"):
        raise HTTPException(400, "Invalid image format. Must be a base64 data URL.")
    # Limit ~200KB base64 (prevents storing huge images)
    if len(body.avatar_base64) > 280_000:
        raise HTTPException(400, "Image too large. Please use a smaller image.")

    db.collection("users").document(current_user["user_id"]).update({
        "avatar": body.avatar_base64
    })
    return {"message": "Avatar updated", "avatar": body.avatar_base64}


# ── Forgot Password models ────────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


# FORGOT PASSWORD — send OTP
@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    users = db.collection("users").where("email", "==", body.email).get()
    if not users:
        raise HTTPException(404, "No account found with this email")

    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Store OTP in Firestore (overwrite any existing)
    existing = db.collection("otps").where("email", "==", body.email).get()
    for doc in existing:
        doc.reference.delete()

    db.collection("otps").add({
        "email": body.email,
        "otp": otp,
        "expires_at": expires_at,
        "used": False,
    })

    try:
        send_otp_email(body.email, otp)
    except Exception as e:
        raise HTTPException(500, f"Failed to send email: {str(e)}")

    return {"message": "OTP sent"}


# VERIFY OTP
@router.post("/verify-otp")
async def verify_otp(body: VerifyOtpRequest):
    docs = db.collection("otps").where("email", "==", body.email).get()
    if not docs:
        raise HTTPException(400, "OTP not found. Please request a new one.")

    otp_doc = docs[0].to_dict()

    if otp_doc.get("used"):
        raise HTTPException(400, "OTP already used")

    expires_at = otp_doc.get("expires_at")
    if expires_at and datetime.now(timezone.utc) > expires_at:
        raise HTTPException(400, "OTP has expired. Please request a new one.")

    if otp_doc.get("otp") != body.otp:
        raise HTTPException(400, "Incorrect OTP")

    return {"verified": True}


# RESET PASSWORD
@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    if len(body.new_password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    docs = db.collection("otps").where("email", "==", body.email).get()
    if not docs:
        raise HTTPException(400, "OTP not found")

    otp_ref = docs[0]
    otp_doc = otp_ref.to_dict()

    if otp_doc.get("used"):
        raise HTTPException(400, "OTP already used")

    expires_at = otp_doc.get("expires_at")
    if expires_at and datetime.now(timezone.utc) > expires_at:
        raise HTTPException(400, "OTP has expired")

    if otp_doc.get("otp") != body.otp:
        raise HTTPException(400, "Incorrect OTP")

    # Update password
    users = db.collection("users").where("email", "==", body.email).get()
    if not users:
        raise HTTPException(404, "User not found")

    users[0].reference.update({"password": hash_password(body.new_password)})

    # Mark OTP as used
    otp_ref.reference.update({"used": True})

    return {"message": "Password reset successful"}