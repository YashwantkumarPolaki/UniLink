from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middleware.auth_middleware import require_role
from database import db
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])


class RoleUpdate(BaseModel):
    role: str


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    target: str  # "All", "Students", "Faculty", "Clubs", "Companies"


# ── GET /admin/users ──────────────────────────────────────────────────────────
@router.get("/users")
async def get_all_users(current_user: dict = Depends(require_role("admin"))):
    docs = db.collection("users").get()
    users = []
    for doc in docs:
        d = doc.to_dict()
        users.append({
            "id": doc.id,
            "name": d.get("name", ""),
            "email": d.get("email", ""),
            "role": d.get("role", "student"),
            "college": d.get("college", ""),
            "branch": d.get("branch", ""),
            "whatsapp_verified": d.get("whatsapp_verified", False),
        })
    return users


# ── DELETE /admin/users/{user_id} ─────────────────────────────────────────────
@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_role("admin"))):
    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    db.collection("users").document(user_id).delete()
    return {"message": "User deleted"}


# ── PUT /admin/users/{user_id}/role ──────────────────────────────────────────
@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: RoleUpdate,
    current_user: dict = Depends(require_role("admin"))
):
    valid_roles = {"student", "faculty", "club", "company", "admin"}
    if body.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    db.collection("users").document(user_id).update({"role": body.role})
    return {"message": f"Role updated to {body.role}"}


# ── POST /admin/announcements ─────────────────────────────────────────────────
@router.post("/announcements")
async def create_announcement(
    body: AnnouncementCreate,
    current_user: dict = Depends(require_role("admin"))
):
    data = {
        "title": body.title,
        "message": body.message,
        "target": body.target,
        "created_at": datetime.utcnow().isoformat(),
        "posted_by": current_user["user_id"],
    }
    doc_ref = db.collection("announcements").add(data)
    return {"message": "Announcement sent", "id": doc_ref[1].id}


# ── GET /admin/announcements ──────────────────────────────────────────────────
@router.get("/announcements")
async def get_announcements(current_user: dict = Depends(require_role("admin"))):
    docs = db.collection("announcements").order_by(
        "created_at", direction="DESCENDING"
    ).get()
    return [{"id": d.id, **d.to_dict()} for d in docs]


# ── GET /admin/analytics ──────────────────────────────────────────────────────
@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(require_role("admin"))):
    # Users by role
    users = db.collection("users").get()
    role_counts = {"student": 0, "faculty": 0, "club": 0, "company": 0, "admin": 0}
    for u in users:
        role = u.to_dict().get("role", "student")
        if role in role_counts:
            role_counts[role] += 1
        else:
            role_counts[role] = 1

    # Events by status
    events = db.collection("events").get()
    event_counts = {"pending": 0, "approved": 0, "total": 0}
    for e in events:
        status = e.to_dict().get("status", "pending")
        event_counts["total"] += 1
        if status == "pending":
            event_counts["pending"] += 1
        elif status == "approved":
            event_counts["approved"] += 1

    # Doubts count
    doubts = db.collection("doubts").get()
    doubts_count = len(doubts)

    # Opportunities count
    opps = db.collection("opportunities").get()
    opps_count = len(opps)

    return {
        "users": {
            "total": len(users),
            "by_role": role_counts,
        },
        "events": event_counts,
        "doubts": doubts_count,
        "opportunities": opps_count,
    }


# ── GET /admin/events/pending ─────────────────────────────────────────────────
@router.get("/events/pending")
async def get_pending_events(current_user: dict = Depends(require_role("admin"))):
    docs = db.collection("events").where("status", "==", "pending").get()
    return [{"id": d.id, **d.to_dict()} for d in docs]
