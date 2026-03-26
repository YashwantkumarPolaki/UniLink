from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from models.user import SignupRequest, LoginRequest
from services.auth_service import hash_password, verify_password, create_access_token
from middleware.auth_middleware import get_current_user
from database import db


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

    print(f"[LOGIN] Attempting login for email: {credentials.email}")

    # Find user by email in Firestore
    users = db.collection("users").where("email", "==", credentials.email).get()

    print(f"[LOGIN] Users found in Firestore: {len(users)}")

    if not users:
        print(f"[LOGIN] No user found for email: {credentials.email}")
        raise HTTPException(status_code=401, detail="User not found")

    # Get the matching user document
    user_doc = users[0]
    user_data = user_doc.to_dict()

    stored_password = user_data.get("password", "")
    print(f"[LOGIN] User doc ID: {user_doc.id}, password field starts with: '{stored_password[:10]}...'")

    # Handle both bcrypt-hashed and plain-text passwords
    is_bcrypt = stored_password.startswith("$2b$") or stored_password.startswith("$2a$")
    if is_bcrypt:
        password_ok = verify_password(credentials.password, stored_password)
    else:
        password_ok = (credentials.password == stored_password)

    print(f"[LOGIN] is_bcrypt={is_bcrypt}, password_ok={password_ok}")

    if not password_ok:
        raise HTTPException(status_code=401, detail="Incorrect password")

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
            "college": user_data.get("college", ""),
            "branch": user_data.get("branch", ""),
            "department": user_data.get("department", ""),
            "faculty_department": user_data.get("faculty_department", ""),
            "club_name": user_data.get("club_name", ""),
            "company_name": user_data.get("company_name", ""),
            "join_year": user_data.get("join_year"),
            "year_of_study": user_data.get("year_of_study"),
            "graduation_year": user_data.get("graduation_year"),
            "avatar": user_data.get("avatar", ""),
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
            "whatsapp_verified": data.get("whatsapp_verified", False),
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


# WHATSAPP VERIFIED - mark user as having joined the WhatsApp group
@router.put("/whatsapp-verified")
async def set_whatsapp_verified(current_user: dict = Depends(get_current_user)):
    db.collection("users").document(current_user["user_id"]).update({"whatsapp_verified": True})
    return {"message": "WhatsApp verified"}


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


